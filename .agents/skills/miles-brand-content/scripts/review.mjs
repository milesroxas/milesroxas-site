#!/usr/bin/env node
/**
 * The review tool for this skill's benchmark ("The review loop" in
 * evals/benchmarks.md; the in-app guide is at /guide). A local server: it
 * reads runs, reports and skill snapshots from evals/runs, saves Miles's
 * judgments to evals/reviews.json and the dialed weights to
 * evals/bench-config.json, promotes outputs to anchors, and generates new
 * outputs with Claude Code, the OpenAI API or the Codex CLI
 * (review-engines.mjs), then grades them with bench.mjs.
 * Bound to 127.0.0.1; nothing in the site imports it.
 *
 *   pnpm content-review
 */
import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ENGINES, engineInfo, runSample } from './review-engines.mjs'

const SKILL = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = resolve(SKILL, '../../..')
const RUNS = join(SKILL, 'evals/runs')
const ANCHORS = join(SKILL, 'evals/anchors')
const FILES = join(SKILL, 'evals/files')
// The guide's screenshots run against a demo copy, so they never touch Miles's judgments.
const REVIEWS = process.env.REVIEWS_PATH
  ? resolve(REPO, process.env.REVIEWS_PATH)
  : join(SKILL, 'evals/reviews.json')
const CONFIG = join(SKILL, 'evals/bench-config.json')
const UI = join(SKILL, 'scripts/review')
const PORT = Number(process.env.REVIEW_PORT ?? 4330)
/** One sample of a full article; longer means the session is stuck. */
const SAMPLE_TIMEOUT_MS = 20 * 60 * 1000
const SKILL_FILES = ['SKILL.md', 'references']

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

const SAFE = /^[\w][\w.-]*$/
const readJson = (path, fallback) =>
  existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : fallback
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
const rel = (path) => relative(REPO, path)
const today = () => new Date().toISOString().slice(0, 10)
const slug = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)

const cases = () => readJson(join(SKILL, 'evals/evals.json'), { evals: [] }).evals

/** Every Markdown file under a directory, keyed by its path inside it. */
function readTree(dir) {
  const files = {}
  const walk = (current) => {
    for (const name of readdirSync(current).sort()) {
      const full = join(current, name)
      const real = realpathSync(full)
      if (statSync(real).isDirectory()) walk(full)
      else if (name.endsWith('.md')) files[relative(dir, full)] = readFileSync(real, 'utf8')
    }
  }
  if (existsSync(dir)) walk(dir)
  return files
}

const currentSkill = () =>
  Object.fromEntries(
    SKILL_FILES.flatMap((entry) => {
      const full = join(SKILL, entry)
      return statSync(full).isDirectory()
        ? Object.entries(readTree(full)).map(([path, text]) => [`${entry}/${path}`, text])
        : [[entry, readFileSync(full, 'utf8')]]
    }),
  )

/** The skill's identity: a hash of every file's path and text. Same text, same version. */
function skillHash(files) {
  const hash = createHash('sha256')
  for (const path of Object.keys(files).sort()) {
    hash.update(path)
    hash.update('\0')
    hash.update(files[path])
    hash.update('\0')
  }
  return hash.digest('hex').slice(0, 12)
}

function runList() {
  if (!existsSync(RUNS)) return []
  return readdirSync(RUNS)
    .filter((name) => statSync(join(RUNS, name)).isDirectory())
    .sort()
    .map((name) => {
      const dir = join(RUNS, name)
      const files = readdirSync(dir)
      return {
        name,
        meta: readJson(join(dir, 'run.json'), {}),
        report: readJson(join(dir, 'report.json'), null),
        outputs: files.filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort(),
        notes: files.filter((f) => f.endsWith('.md') && f.startsWith('_')).sort(),
        hasSkill: existsSync(join(dir, '_skill')),
      }
    })
}

/** Skill versions seen in runs, oldest first, and where the working tree stands. */
function skillVersions(runs = runList()) {
  const versions = new Map()
  for (const run of runs) {
    const { skillVersion, skillName, skillHash: hash, note, createdAt } = run.meta
    if (!skillVersion || versions.has(skillVersion)) continue
    versions.set(skillVersion, {
      version: skillVersion,
      name: skillName ?? '',
      hash,
      note: note ?? '',
      date: createdAt?.slice(0, 10),
    })
  }
  const list = [...versions.values()].sort(
    (a, b) => Number(a.version.slice(1)) - Number(b.version.slice(1)),
  )
  const hash = skillHash(currentSkill())
  const match = list.find((v) => v.hash === hash)
  const next = `v${list.reduce((max, v) => Math.max(max, Number(v.version.slice(1))), -1) + 1}`
  return {
    versions: list,
    current: match ? { ...match, changed: false } : { version: next, hash, changed: true },
  }
}

function anchorList() {
  if (!existsSync(ANCHORS)) return []
  return readdirSync(ANCHORS)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const head = /^---\n([\s\S]*?)\n---/.exec(readFileSync(join(ANCHORS, file), 'utf8'))?.[1]
      const field = (key) => new RegExp(`^${key}:\\s*(.*)$`, 'm').exec(head ?? '')?.[1] ?? null
      return { file, case: field('case'), label: field('label'), tests: field('tests') }
    })
}

// Jobs: generation and grading run in the background; the page polls their logs.

const jobs = []

function startJob(kind, title) {
  const job = {
    id: jobs.length + 1,
    kind,
    title,
    status: 'running',
    log: [],
    startedAt: Date.now(),
  }
  jobs.unshift(job)
  return job
}

const say = (job, line) => job.log.push(`${new Date().toTimeString().slice(0, 8)}  ${line}`)

function run(command, args, timeoutMs) {
  return new Promise((done) => {
    const child = spawn(command, args, { cwd: REPO, env: process.env })
    let stderr = ''
    const timer = setTimeout(() => child.kill('SIGTERM'), timeoutMs)
    child.stdout.resume()
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      done({ code, stderr })
    })
  })
}

function gitInfo() {
  const head = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: REPO, encoding: 'utf8' })
  const status = spawnSync('git', ['status', '--porcelain', '--', rel(SKILL)], {
    cwd: REPO,
    encoding: 'utf8',
  })
  const changed = status.stdout
    .split('\n')
    .filter((line) => /\/(?:SKILL\.md|references\/)/.test(line))
    .map((line) => line.slice(3))
  return { commit: head.stdout.trim(), changed }
}

const OFF_LIMITS = [
  'evals/anchors',
  'evals/runs',
  'evals/benchmarks.md',
  'evals/evals.json',
  'evals/reviews.json',
  'evals/bench-config.json',
  'scripts/bench.mjs',
  'scripts/bench-core.mjs',
  'scripts/review.mjs',
  'scripts/review-engines.mjs',
  'scripts/review',
]

/** What an agent session is told. The API engine gets the request and the files instead. */
function agentPrompt({ request, out, notes, allow }) {
  const skillPath = rel(SKILL)
  return [
    `Use the miles-brand-content skill: read ${skillPath}/SKILL.md first and follow it. Do not use the CMS or any MCP tool.`,
    'This is a benchmark run and you cannot ask questions: where the skill says to ask Miles, mark the gap the way it says a chat draft should.',
    `Do not read these, under ${skillPath}: ${OFF_LIMITS.join(', ')}${allow ? `, except ${allow}` : ''}.`,
    `Input files named "evals/files/<name>" are at ${skillPath}/evals/files/<name>.`,
    '',
    'Request:',
    request,
    '',
    `Write only the finished copy (Markdown, a "# " title line where the piece has a title, inline [check: ...] markers where the skill calls for them) to ${out}.`,
    `Write everything else you would tell the user (Needs checking, the lint result, notes) to ${notes}.`,
    'Reply with one line when both files are written.',
  ].join('\n')
}

const writerTag = ({ engine, model, effort }) =>
  [engine, model, effort && effort !== 'default' ? effort : null].filter(Boolean).join(' ')

async function generateRun(body, config, { job, git, skill, testCase }) {
  const engine = ENGINES[config.engine]
  const model = config.model?.trim() || engine.defaultModel
  const effort = config.effort || 'default'
  const writer = { engine: config.engine, model, effort, harness: engine.harness }
  const tag = writerTag(writer)
  const base = `${today()}-skill-${skill.version}-${slug(tag)}`
  let name = base
  for (let n = 2; existsSync(join(RUNS, name)); n += 1) name = `${base}-${n}`
  const dir = join(RUNS, name)
  mkdirSync(dir, { recursive: true })
  for (const entry of SKILL_FILES)
    cpSync(join(SKILL, entry), join(dir, '_skill', entry), { recursive: true, dereference: true })

  let request = body.prompt?.trim() || testCase?.prompt
  let fileBase = testCase ? `${testCase.id}-${testCase.name}` : `c-${slug(body.title || 'brief')}`
  let allow = null
  const evidence = testCase
    ? (testCase.bench?.evidence ?? [])
    : (body.evidence ?? []).filter((f) => SAFE.test(f)).map((f) => `evals/files/${f}`)
  const inputFiles = evidence.map((path) => ({
    path,
    text: readFileSync(join(SKILL, path), 'utf8'),
  }))
  if (body.mode === 'rewrite' && body.source) {
    const sourceCopy = join(dir, '_source.md')
    cpSync(join(RUNS, body.source.run, body.source.file), sourceCopy)
    allow = rel(sourceCopy)
    inputFiles.push({ path: rel(sourceCopy), text: readFileSync(sourceCopy, 'utf8') })
    request = `Edit mode. Rewrite the piece in ${rel(sourceCopy)}. ${body.direction?.trim() || 'Improve it against the skill.'} Keep every fact the evidence supports and add none.${
      evidence.length ? ` The evidence is ${evidence.join(', ')}.` : ''
    }`
    fileBase = `${fileBase}-rewrite`
  } else if (!testCase && evidence.length) {
    request += `\n\nUse only the facts in ${evidence.join(', ')}.`
  }
  const kind = testCase?.bench?.kind ?? body.kind ?? 'article'
  const frontMatter = testCase
    ? ''
    : `---\ncase: custom\nkind: ${kind}\nevidence: ${evidence.join(', ')}\n---\n\n`

  const meta = {
    skillVersion: skill.version,
    skillName: skill.name,
    skillHash: skill.hash,
    note: skill.note,
    writer,
    mode: body.mode || (testCase ? 'case' : 'brief'),
    case: testCase ? testCase.id : 'custom',
    title: testCase ? testCase.title : body.title || 'Custom brief',
    request,
    source: body.source ?? null,
    skillCommit: git.commit,
    skillChanged: git.changed,
    createdAt: new Date().toISOString(),
    samples: [],
  }
  writeJson(join(dir, 'run.json'), meta)

  const samples = Math.min(Math.max(Number(body.samples) || 1, 1), 4)
  await Promise.all(
    Array.from({ length: samples }, async (_, i) => {
      const file = `${fileBase}-s${i + 1}.md`
      const out = join(dir, file)
      const notes = join(dir, `_${file.replace(/\.md$/, '')}.notes.md`)
      const label = `${tag} #${i + 1}`
      say(job, `${label}: writing`)
      const started = Date.now()
      let result
      try {
        result = await runSample(config.engine, {
          repo: REPO,
          skill: SKILL,
          prompt: agentPrompt({ request, out: rel(out), notes: rel(notes), allow }),
          request,
          inputFiles,
          kind,
          out,
          notes,
          model,
          effort,
          timeoutMs: SAMPLE_TIMEOUT_MS,
          log: (line) => say(job, `${label}: ${line}`),
        })
      } catch (error) {
        result = { error: error.message }
      }
      const ok = existsSync(out)
      if (ok && frontMatter && !readFileSync(out, 'utf8').startsWith('---'))
        writeFileSync(out, frontMatter + readFileSync(out, 'utf8'))
      const seconds = Math.round((Date.now() - started) / 1000)
      meta.samples.push({
        file,
        ok,
        seconds,
        costUsd: result.costUsd ?? null,
        tokens: result.tokens ?? null,
      })
      const spend =
        result.costUsd != null
          ? `, $${result.costUsd.toFixed(2)}`
          : result.tokens
            ? `, ${result.tokens.input.toLocaleString()} in / ${result.tokens.output.toLocaleString()} out tokens`
            : ''
      say(
        job,
        ok
          ? `${label}: done in ${seconds} s${spend}`
          : `${label}: no copy written. ${result.error ?? ''}`,
      )
    }),
  )
  writeJson(join(dir, 'run.json'), meta)
  say(job, `${tag}: grading`)
  const graded = await run(
    process.execPath,
    [join(SKILL, 'scripts/bench.mjs'), dir],
    10 * 60 * 1000,
  )
  say(
    job,
    graded.code === 0 ? `${tag}: graded` : `${tag}: grading failed. ${graded.stderr.slice(0, 300)}`,
  )
  return graded.code === 0
}

async function generate(body) {
  const testCase = cases().find((c) => String(c.id) === String(body.caseId)) ?? null
  const configs = (body.configs ?? []).slice(0, 4).filter((c) => ENGINES[c.engine]?.available())
  if (!configs.length) throw new Error('No available writer selected.')
  const { current } = skillVersions()
  if (current.changed && !body.skillName?.trim())
    throw new Error(`The skill changed since the last version. Name ${current.version} first.`)
  const skill = {
    version: current.version,
    name: current.changed ? body.skillName.trim() : current.name,
    hash: current.hash,
    note: current.changed ? (body.note ?? '') : current.note,
  }
  const what = testCase ? `case ${testCase.id}` : body.mode === 'rewrite' ? 'a rewrite' : 'a brief'
  const job = startJob(
    'generate',
    `Skill ${skill.version}, ${what}: ${configs.map(writerTag).join(', ')}`,
  )
  say(job, `Skill ${skill.version} · ${skill.name}${current.changed ? ' (new version)' : ''}.`)
  const git = gitInfo()
  const results = await Promise.all(
    configs.map((config) => generateRun(body, config, { job, git, skill, testCase })),
  )
  job.status = results.every(Boolean) ? 'done' : 'failed'
  job.finishedAt = Date.now()
}

async function grade(name) {
  const job = startJob('grade', `Grading ${name}`)
  const graded = await run(
    process.execPath,
    [join(SKILL, 'scripts/bench.mjs'), join(RUNS, name)],
    10 * 60 * 1000,
  )
  say(job, graded.code === 0 ? 'Graded.' : `Grading failed: ${graded.stderr.slice(0, 300)}`)
  job.status = graded.code === 0 ? 'done' : 'failed'
  job.finishedAt = Date.now()
}

// HTTP

const send = (res, status, body, type = TYPES['.json']) => {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' })
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body))
}

async function bodyOf(req) {
  let raw = ''
  for await (const chunk of req) raw += chunk
  return raw ? JSON.parse(raw) : {}
}

const ROUTES = {
  'GET /api/state': async () => {
    const runs = runList()
    return {
      cases: cases(),
      runs,
      skill: skillVersions(runs),
      engines: await engineInfo(),
      reviews: readJson(REVIEWS, { reviews: {}, preferences: [] }),
      config: readJson(CONFIG, {}),
      configPath: rel(CONFIG),
      reviewsPath: rel(REVIEWS),
      evidenceFiles: existsSync(FILES) ? readdirSync(FILES).filter((f) => f.endsWith('.md')) : [],
      anchors: anchorList(),
      jevKey: Boolean(process.env.TYPESAFE_API_KEY),
    }
  },
  'GET /api/output': (url) => {
    const run = url.searchParams.get('run')
    const file = url.searchParams.get('file')
    if (!SAFE.test(run) || !SAFE.test(file)) throw new Error('Bad path.')
    const path = join(RUNS, run, file)
    return { text: readFileSync(path, 'utf8'), path: rel(path) }
  },
  'GET /api/skill': (url) => {
    const run = url.searchParams.get('run')
    if (run === 'current') return { files: currentSkill(), label: 'Working tree' }
    if (!SAFE.test(run)) throw new Error('Bad run.')
    return { files: readTree(join(RUNS, run, '_skill')), label: run }
  },
  'GET /api/jobs': () => jobs.slice(0, 12),
  'POST /api/review': (_url, body) => {
    const data = readJson(REVIEWS, { reviews: {}, preferences: [] })
    data.reviews[body.key] = { ...body.review, updatedAt: new Date().toISOString() }
    writeJson(REVIEWS, data)
    return { saved: rel(REVIEWS) }
  },
  'POST /api/preference': (_url, body) => {
    const data = readJson(REVIEWS, { reviews: {}, preferences: [] })
    data.preferences = data.preferences.filter((p) => !(p.a === body.a && p.b === body.b))
    data.preferences.push({ ...body, at: new Date().toISOString() })
    writeJson(REVIEWS, data)
    return { saved: rel(REVIEWS) }
  },
  'POST /api/config': (_url, body) => {
    writeJson(CONFIG, body.config)
    return { saved: rel(CONFIG) }
  },
  'POST /api/anchor': (_url, body) => {
    if (!SAFE.test(body.run) || !SAFE.test(body.file)) throw new Error('Bad path.')
    const source = readFileSync(join(RUNS, body.run, body.file), 'utf8').replace(
      /^---\n[\s\S]*?\n---\n?/,
      '',
    )
    const name = `${slug(`${body.run}-${body.file.replace(/\.md$/, '')}`)}-${body.label}.md`
    const head = [
      '---',
      `case: ${body.case}`,
      `label: ${body.label}`,
      ...(body.label === 'bad' && body.tests?.length ? [`tests: ${body.tests.join(', ')}`] : []),
      `about: Promoted from evals/runs/${body.run}/${body.file} on ${today()}.${body.about ? ` ${body.about.replace(/\n/g, ' ')}` : ''}`,
      '---',
      '',
    ].join('\n')
    writeFileSync(join(ANCHORS, name), head + source.trimStart())
    return { saved: rel(join(ANCHORS, name)) }
  },
  'POST /api/generate': (_url, body) => {
    const { current } = skillVersions()
    if (current.changed && !body.skillName?.trim())
      throw new Error(`The skill changed since the last version. Name ${current.version} first.`)
    generate(body).catch((error) => {
      const job = startJob('generate', 'Generation failed')
      say(job, error.message)
      job.status = 'failed'
    })
    return { started: true }
  },
  'POST /api/grade': (_url, body) => {
    if (!SAFE.test(body.run)) throw new Error('Bad run.')
    grade(body.run)
    return { started: true }
  },
}

const STATIC = { '/': 'index.html', '/guide': 'guide.html' }

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  try {
    const route = ROUTES[`${req.method} ${url.pathname}`]
    if (route)
      return send(res, 200, await route(url, req.method === 'POST' ? await bodyOf(req) : null))
    if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed.' })
    const path =
      url.pathname === '/bench-core.mjs'
        ? join(SKILL, 'scripts/bench-core.mjs')
        : join(UI, STATIC[url.pathname] ?? url.pathname.slice(1))
    if (url.pathname !== '/bench-core.mjs' && !path.startsWith(`${UI}/`))
      return send(res, 404, 'Not found.', 'text/plain')
    if (!existsSync(path) || statSync(path).isDirectory())
      return send(res, 404, 'Not found.', 'text/plain')
    return send(res, 200, readFileSync(path), TYPES[extname(path)] ?? 'application/octet-stream')
  } catch (error) {
    return send(res, 400, { error: error.message })
  }
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE')
    console.error(
      `Port ${PORT} is taken. Stop what holds it (lsof -nP -iTCP:${PORT} -sTCP:LISTEN) or set REVIEW_PORT.`,
    )
  else console.error(error.message)
  process.exit(1)
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Review tool: http://localhost:${PORT}  (guide: http://localhost:${PORT}/guide)`)
  if (!process.env.TYPESAFE_API_KEY)
    console.log('TYPESAFE_API_KEY is not set: new runs will not be graded.')
})
