/**
 * The writers the review tool can generate with. Two harnesses:
 * - agent: a headless coding-agent session in the repo (Claude Code, Codex CLI)
 *   that loads the skill, reads its references and runs the lint itself, the
 *   way Miles uses it day to day.
 * - api: one model call with the skill and its references in the system
 *   prompt, then one repair call with the lint's findings (OpenAI). Cheaper and
 *   controlled, so a change of model or effort is the only thing that moves.
 * Comparing across harnesses compares the harness too; compare models within one.
 */
import { spawn, spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { lintField } from './check-voice.mjs'

const hasCommand = (command) => spawnSync('which', [command], { encoding: 'utf8' }).status === 0

/** OpenAI's text models, read once from the account so the list is never a guess. */
let openaiModels = null
async function listOpenaiModels() {
  if (openaiModels) return openaiModels
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      signal: AbortSignal.timeout(8000),
    })
    const { data = [] } = await response.json()
    openaiModels = data
      .map((m) => m.id)
      .filter((id) => /^(?:gpt-|o\d)/.test(id))
      .filter(
        (id) => !/audio|realtime|tts|transcribe|search|image|embedding|instruct|live/.test(id),
      )
      .filter((id) => !/-\d{4}-\d{2}-\d{2}$/.test(id))
      .sort()
      .reverse()
  } catch {
    openaiModels = []
  }
  return openaiModels
}

export const ENGINES = {
  claude: {
    label: 'Claude · Claude Code',
    short: 'claude',
    harness: 'agent',
    efforts: ['default', 'low', 'medium', 'high', 'xhigh', 'max'],
    models: ['sonnet', 'opus', 'haiku', 'fable', 'default'],
    defaultModel: 'sonnet',
    available: () => hasCommand('claude'),
    hint: 'Install Claude Code and log in: the tool runs `claude -p` in the repo.',
  },
  openai: {
    label: 'OpenAI · API',
    short: 'openai',
    harness: 'api',
    // Non-reasoning models (gpt-4.1, gpt-4o) refuse an effort; the call is retried without it.
    efforts: ['default', 'none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'],
    models: [],
    defaultModel: 'gpt-5.5',
    available: () => Boolean(process.env.OPENAI_API_KEY),
    hint: 'Set OPENAI_API_KEY in .env.',
  },
  codex: {
    label: 'OpenAI · Codex CLI',
    short: 'codex',
    harness: 'agent',
    efforts: ['default', 'minimal', 'low', 'medium', 'high', 'xhigh'],
    models: [],
    defaultModel: 'gpt-5.5',
    available: () => hasCommand('codex'),
    hint: 'Install the Codex CLI (npm i -g @openai/codex) and run `codex login`.',
  },
}

export async function engineInfo() {
  const models = await (ENGINES.openai.available() ? listOpenaiModels() : [])
  return Object.fromEntries(
    Object.entries(ENGINES).map(([id, engine]) => [
      id,
      {
        id,
        label: engine.label,
        harness: engine.harness,
        efforts: engine.efforts,
        models: id === 'claude' ? engine.models : models,
        defaultModel: engine.defaultModel,
        available: engine.available(),
        hint: engine.hint,
      },
    ]),
  )
}

function exec(command, args, { cwd, input, timeoutMs }) {
  return new Promise((done) => {
    const child = spawn(command, args, { cwd, env: process.env })
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => child.kill('SIGTERM'), timeoutMs)
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', (error) => {
      stderr += error.message
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      done({ code, stdout, stderr })
    })
    child.stdin.end(input)
  })
}

// Agent harnesses: the session writes the copy and the notes itself.

async function runClaude({ repo, prompt, model, effort, timeoutMs }) {
  const args = [
    '-p',
    '--output-format',
    'json',
    '--no-session-persistence',
    '--strict-mcp-config',
    '--permission-mode',
    'acceptEdits',
    '--allowedTools',
    'Read,Write,Edit,Glob,Grep,Bash(node:*),Bash(mkdir:*),Bash(ls:*)',
    ...(model && model !== 'default' ? ['--model', model] : []),
    ...(effort && effort !== 'default' ? ['--effort', effort] : []),
  ]
  const result = await exec('claude', args, { cwd: repo, input: prompt, timeoutMs })
  let costUsd = null
  let tokens = null
  try {
    const json = JSON.parse(result.stdout)
    costUsd = json.total_cost_usd ?? null
    tokens = json.usage
      ? {
          input:
            (json.usage.input_tokens ?? 0) +
            (json.usage.cache_read_input_tokens ?? 0) +
            (json.usage.cache_creation_input_tokens ?? 0),
          output: json.usage.output_tokens ?? 0,
        }
      : null
  } catch {}
  return { costUsd, tokens, error: result.code === 0 ? null : result.stderr.slice(0, 400) }
}

async function runCodex({ repo, prompt, model, effort, timeoutMs }) {
  const args = [
    'exec',
    '--full-auto',
    '--skip-git-repo-check',
    ...(model && model !== 'default' ? ['--model', model] : []),
    ...(effort && effort !== 'default' ? ['-c', `model_reasoning_effort="${effort}"`] : []),
    '-',
  ]
  const result = await exec('codex', args, { cwd: repo, input: prompt, timeoutMs })
  return {
    costUsd: null,
    tokens: null,
    error: result.code === 0 ? null : (result.stderr || result.stdout).slice(-400),
  }
}

// API harness: the skill goes in the system prompt; the tool writes the files.

/** SKILL.md and every reference, in the order the skill reads them. */
function skillFiles(skill) {
  const files = [['SKILL.md', readFileSync(join(skill, 'SKILL.md'), 'utf8')]]
  const dir = join(skill, 'references')
  for (const name of readdirSync(dir).sort()) {
    const real = realpathSync(join(dir, name))
    if (name.endsWith('.md') && statSync(real).isFile())
      files.push([`references/${name}`, readFileSync(real, 'utf8')])
  }
  return files
}

const SPLIT = /^=== NOTES ===\s*$/m

function systemPrompt(skill) {
  const files = skillFiles(skill)
    .map(([path, text]) => `<file path="${path}">\n${text}\n</file>`)
    .join('\n\n')
  return [
    'You are the writing assistant this skill describes. Follow it exactly, as if Miles had invoked it.',
    'In this run you have no tools: you cannot read files, query or save to the CMS, or run scripts. Every file the skill would read is below, and the files a request names are in the request. The voice lint runs after you answer and you will see its findings.',
    'You cannot ask questions: where the skill says to ask Miles, mark the gap the way it says a chat draft should.',
    'Answer in exactly two parts, each starting with its marker line:',
    '=== COPY ===',
    'Only the finished copy, in Markdown: a "# " title line where the piece has a title, inline [check: ...] markers where the skill calls for them.',
    '=== NOTES ===',
    'Everything else you would tell Miles: Needs checking, the claim ledger, notes.',
    '',
    files,
  ].join('\n')
}

function splitAnswer(text) {
  const body = text.replace(/^[\s\S]*?^=== COPY ===\s*$/m, '')
  const [copy, notes = ''] = body.split(SPLIT)
  return { copy: copy.trim(), notes: notes.trim() }
}

async function respond({ model, effort, instructions, input, log }) {
  const call = async (withEffort) => {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        instructions,
        input,
        store: false,
        max_output_tokens: 24000,
        ...(withEffort ? { reasoning: { effort } } : {}),
      }),
      signal: AbortSignal.timeout(15 * 60 * 1000),
    })
    return { status: response.status, json: await response.json() }
  }
  const wantsEffort = Boolean(effort && effort !== 'default')
  let { status, json } = await call(wantsEffort)
  if (status === 400 && wantsEffort && /reasoning/i.test(json.error?.message ?? '')) {
    log(`${model} takes no reasoning effort; running it without.`)
    ;({ status, json } = await call(false))
  }
  if (status !== 200) throw new Error(json.error?.message ?? `OpenAI returned ${status}`)
  const text = (json.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((part) => part.type === 'output_text')
    .map((part) => part.text)
    .join('')
  return {
    text,
    incomplete: json.status === 'incomplete',
    usage: {
      input: json.usage?.input_tokens ?? 0,
      output: json.usage?.output_tokens ?? 0,
      reasoning: json.usage?.output_tokens_details?.reasoning_tokens ?? 0,
    },
  }
}

async function runOpenai({ skill, request, inputFiles, kind, out, notes, model, effort, log }) {
  const instructions = systemPrompt(skill)
  const attached = inputFiles
    .map(({ path, text }) => `<file path="${path}">\n${text}\n</file>`)
    .join('\n\n')
  const input = [
    {
      role: 'user',
      content: `Request:\n${request}${attached ? `\n\nFiles the request names:\n\n${attached}` : ''}`,
    },
  ]
  const usage = { input: 0, output: 0, reasoning: 0 }
  const add = (u) => {
    for (const key of Object.keys(usage)) usage[key] += u[key]
  }

  const first = await respond({ model, effort, instructions, input, log })
  add(first.usage)
  let answer = splitAnswer(first.text)
  const findings = (copy) =>
    lintField({ path: 'copy', kind, text: copy }, 'chat').filter((f) => f.severity !== 'info')
  const before = findings(answer.copy)
  let lintNote = `Lint on the first answer: ${before.length ? before.map((f) => `${f.severity} ${f.rule}`).join(', ') : 'clean'}.`
  if (before.length) {
    log(`Lint found ${before.length} issue(s); asking ${model} to repair.`)
    const second = await respond({
      model,
      effort,
      instructions,
      input: [
        ...input,
        { role: 'assistant', content: first.text },
        {
          role: 'user',
          content: `The voice lint returned:\n${before
            .map(
              (f) =>
                `- ${f.severity} ${f.rule}: ${f.message}${f.excerpt ? ` ("${f.excerpt}")` : ''}`,
            )
            .join(
              '\n',
            )}\n\nFix every error. Fix each warning or say in the notes why it stands. Answer in the same two parts.`,
        },
      ],
      log,
    })
    add(second.usage)
    answer = splitAnswer(second.text)
    const after = findings(answer.copy)
    lintNote += ` After one repair: ${after.length ? after.map((f) => `${f.severity} ${f.rule}`).join(', ') : 'clean'}.`
  }
  if (!answer.copy) throw new Error('The answer had no copy section.')
  writeFileSync(out, `${answer.copy}\n`)
  writeFileSync(
    notes,
    `${answer.notes}\n\n---\n${lintNote}\nTokens: ${usage.input} in, ${usage.output} out (${usage.reasoning} reasoning). Model ${model}, effort ${effort || 'default'}.${first.incomplete ? ' The first answer hit the output limit.' : ''}\n`,
  )
  return { costUsd: null, tokens: usage, error: null }
}

/**
 * One sample. Agent engines get `prompt` and write `out` and `notes`
 * themselves; the API engine gets the request and its input files.
 */
export async function runSample(engineId, options) {
  if (engineId === 'claude') return runClaude(options)
  if (engineId === 'codex') return runCodex(options)
  if (engineId === 'openai') return runOpenai(options)
  throw new Error(`Unknown engine ${engineId}.`)
}

export const relPath = (repo, path) => relative(repo, path)
