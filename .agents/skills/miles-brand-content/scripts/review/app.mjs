// The review tool's page: reads /api/state, rescores with bench-core as knobs move, saves judgments.
import {
  copyOf,
  DEFAULT_CONFIG,
  KIND_LAYERS,
  LAYER_HOME,
  LAYERS,
  mergeConfig,
  scoreResult,
} from '/bench-core.mjs'

const LAYER_LABELS = {
  lint: 'Lint',
  shape: 'Shape',
  structure: 'Structure',
  substance: 'Substance',
  tone: 'Tone',
  grounding: 'Facts',
}

/** Miles's marks, one per bench layer, in his words. */
const MARKS = [
  {
    layer: 'structure',
    label: 'Opening, point, ending',
    hint: 'Starts inside the work, says the point early, ends on what it adds up to',
  },
  {
    layer: 'substance',
    label: 'Specific and honest',
    hint: 'Concrete detail, real decisions, real costs',
  },
  { layer: 'tone', label: 'Sounds like me', hint: 'Calm and plain, nothing sold' },
  { layer: 'grounding', label: 'Facts hold', hint: 'Nothing invented; gaps are marked' },
  { layer: 'shape', label: 'Reads well', hint: 'Paragraphs, sentences, headings' },
]

const KNOBS = [
  { group: 'Layer weights', help: 'Points per layer; the total rescales to 100.' },
  ...LAYERS.map((layer) => ({
    path: ['weights', layer],
    label: LAYER_LABELS[layer],
    min: 0,
    max: 40,
    step: 1,
  })),
  {
    group: 'Thresholds',
    help: 'yes: where a Noul reads as yes. agree at: the bench score that matches a "good" mark.',
  },
  { path: ['yes'], label: 'yes', min: 0.3, max: 0.8, step: 0.05 },
  { path: ['sure'], label: 'sure', min: 0.3, max: 0.9, step: 0.05 },
  { path: ['agreeAt'], label: 'agree at', min: 40, max: 95, step: 5 },
  { path: ['warningCost'], label: 'lint warning', min: 0, max: 0.5, step: 0.05 },
  { group: 'Structure points' },
  { path: ['structure', 'opening'], label: 'opening', min: 0, max: 10, step: 1 },
  { path: ['structure', 'point'], label: 'point early', min: 0, max: 10, step: 1 },
  { path: ['structure', 'ending'], label: 'ending', min: 0, max: 10, step: 1 },
  { path: ['structure', 'title'], label: 'title', min: 0, max: 10, step: 1 },
  { path: ['structure', 'pointerCredit'], label: 'pointer credit', min: 0, max: 1, step: 0.1 },
  { group: 'Substance points' },
  { path: ['substance', 'specificity'], label: 'specificity', min: 0, max: 20, step: 1 },
  { path: ['substance', 'decision'], label: 'decision', min: 0, max: 10, step: 1 },
  { path: ['substance', 'setback'], label: 'setback', min: 0, max: 10, step: 1 },
  { path: ['substance', 'aiSplit'], label: 'AI split', min: 0, max: 10, step: 1 },
  { group: 'Grounding' },
  { path: ['groundingPrior'], label: 'prior', min: 0, max: 1, step: 0.1 },
  { path: ['contradictionCap'], label: 'contradiction cap', min: 0, max: 1, step: 0.05 },
  { group: 'Shape bands', help: 'From the long-form study. Each band met is a share of shape.' },
  { path: ['bands', 'sentenceMedian', 0], label: 'sentence min', min: 6, max: 20, step: 1 },
  { path: ['bands', 'sentenceMedian', 1], label: 'sentence max', min: 14, max: 32, step: 1 },
  { path: ['bands', 'shortSentenceShare', 0], label: 'short min', min: 0, max: 0.3, step: 0.01 },
  { path: ['bands', 'shortSentenceShare', 1], label: 'short max', min: 0.1, max: 0.6, step: 0.01 },
  { path: ['bands', 'paragraphMedian', 0], label: 'para min', min: 10, max: 50, step: 1 },
  { path: ['bands', 'paragraphMedian', 1], label: 'para max', min: 40, max: 120, step: 1 },
  { path: ['bands', 'oneLineShare', 1], label: 'one-liners max', min: 0, max: 0.6, step: 0.01 },
]

const TABS = [
  ['judge', 'Judge'],
  ['insights', 'Insights'],
  ['knobs', 'Knobs'],
  ['skill', 'Skill diff'],
  ['generate', 'Generate'],
]

const $ = (selector, root = document) => root.querySelector(selector)
const esc = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  )
const getPath = (object, path) => path.reduce((value, key) => value?.[key], object)
function setPath(object, path, value) {
  const last = path.at(-1)
  const parent = path.slice(0, -1).reduce((value, key) => value[key], object)
  parent[last] = value
}

const state = {
  data: null,
  config: structuredClone(DEFAULT_CONFIG),
  savedConfig: structuredClone(DEFAULT_CONFIG),
  a: null,
  b: null,
  focus: 'a',
  tab: 'judge',
  blind: false,
  diff: false,
  showSupported: false,
  filter: '',
  texts: new Map(),
  writerNotes: new Map(),
  openNote: null,
  scores: new Map(),
  skills: new Map(),
  skillPair: { left: null, right: null },
  insightList: null,
  gen: {
    mode: 'case',
    caseId: null,
    prompt: '',
    title: '',
    kind: 'article',
    evidence: [],
    direction: '',
    samples: 1,
    writers: [{ engine: 'claude', model: 'sonnet', effort: 'default' }],
    skillName: '',
    note: '',
  },
  jobs: [],
}

// Data

async function api(path, body) {
  const response = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await response.json()
  if (!response.ok) throw new Error(json.error ?? response.statusText)
  return json
}

function toast(message) {
  const el = $('#toast')
  el.textContent = message
  el.classList.add('show')
  clearTimeout(toast.timer)
  toast.timer = setTimeout(() => el.classList.remove('show'), 2400)
}

const caseOf = (testCaseId) =>
  state.data.cases.find((c) => String(c.id) === String(testCaseId)) ?? null

/** Every output across runs, in rail order. */
function outputs() {
  const list = []
  for (const run of state.data.runs) {
    const results = new Map((run.report?.results ?? []).map((r) => [r.file, r]))
    for (const file of run.outputs) {
      const result = results.get(file) ?? null
      const caseId = String(result?.case ?? /^(\d+)[-_.]/.exec(file)?.[1] ?? 'custom')
      list.push({
        key: `${run.name}/${file}`,
        run,
        file,
        result,
        caseId,
        group: caseId === 'custom' ? `brief:${run.meta?.title ?? 'Untitled brief'}` : caseId,
        sample: Number(/-s(\d+)\.md$/.exec(file)?.[1] ?? 1),
        samples: run.outputs.filter(
          (f) => f.replace(/-s\d+\.md$/, '') === file.replace(/-s\d+\.md$/, ''),
        ).length,
      })
    }
  }
  const version = (o) => Number(o.run.meta?.skillVersion?.slice(1) ?? 99)
  return list.sort(
    (x, y) =>
      version(x) - version(y) ||
      writerName(x.run.meta?.writer).localeCompare(writerName(y.run.meta?.writer)) ||
      x.run.name.localeCompare(y.run.name) ||
      x.sample - y.sample,
  )
}

function outputByKey(key) {
  return key ? (outputs().find((o) => o.key === key) ?? null) : null
}

function scored(output) {
  if (!output?.result) return null
  if (!state.scores.has(output.key))
    state.scores.set(output.key, scoreResult(output.result, state.config))
  return state.scores.get(output.key)
}

const reviewOf = (key) => state.data.reviews.reviews?.[key] ?? null
// Names. A run is one skill version written by one writer; an output is one sample of a case.

const CLAUDE_ALIASES = { sonnet: 'Sonnet', opus: 'Opus', haiku: 'Haiku', fable: 'Fable' }
const capital = (word) => word.charAt(0).toUpperCase() + word.slice(1)

function modelName(engine, model) {
  if (!model || model === 'default')
    return engine === 'claude' ? 'Claude, default model' : 'Default model'
  if (engine === 'claude') {
    if (CLAUDE_ALIASES[model]) return `Claude ${CLAUDE_ALIASES[model]}`
    const id = /^claude-([a-z]+)-(\d+)-(\d+)/.exec(model)
    return id ? `Claude ${capital(id[1])} ${id[2]}.${id[3]}` : model
  }
  const gpt = /^gpt-([\d.]+)(?:-(.+))?$/.exec(model)
  return gpt ? `GPT-${gpt[1]}${gpt[2] ? ` ${gpt[2]}` : ''}` : model
}

/** "Claude Opus 5.5", "GPT-5.5, high effort", "GPT-5.5 via Codex". */
function writerName(writer) {
  if (!writer) return 'Unknown writer'
  const effort = writer.effort && writer.effort !== 'default' ? `, ${writer.effort} effort` : ''
  return `${modelName(writer.engine, writer.model)}${effort}${writer.engine === 'codex' ? ' via Codex' : ''}`
}

const versionOf = (run) =>
  run.meta?.skillVersion
    ? { id: run.meta.skillVersion, name: run.meta.skillName ?? '' }
    : { id: '?', name: run.name }

/** "v2 · Claims need a source" */
const versionName = (run) => {
  const v = versionOf(run)
  return v.name ? `${v.id} · ${v.name}` : v.id
}

/** "v2 · Claude Opus 5.5": one line per run. */
const runName = (run) => `${versionOf(run).id} · ${writerName(run.meta?.writer)}`

/** "Claude Opus 5.5 · sample 2 of 2" */
const outputLine = (output) =>
  `${writerName(output.run.meta?.writer)}${output.samples > 1 ? ` · sample ${output.sample} of ${output.samples}` : ''}`

function groupTitle(group) {
  if (group.startsWith('brief:')) return `Brief: ${group.slice(6)}`
  const testCase = caseOf(group)
  return testCase ? `${testCase.id} · ${testCase.title ?? testCase.name}` : `Case ${group}`
}

async function loadState() {
  state.data = await api('/api/state')
  state.savedConfig = mergeConfig(state.data.config)
  if (!state.dirtyConfig) state.config = structuredClone(state.savedConfig)
  state.scores.clear()
  if (!state.gen.caseId) state.gen.caseId = state.data.cases.find((c) => !c.bench?.live)?.id
}

async function textOf(key) {
  if (!state.texts.has(key)) {
    const [run, file] = key.split('/')
    const { text } = await api(
      `/api/output?run=${encodeURIComponent(run)}&file=${encodeURIComponent(file)}`,
    )
    state.texts.set(key, { text, copy: copyOf(text) })
  }
  return state.texts.get(key)
}

function writerNotesFile(output) {
  const base = output.file.replace(/\.md$/, '')
  return output.run.notes.includes(`_${base}.notes.md`) ? `_${base}.notes.md` : null
}

// Saving

const pending = new Map()
function saveReview(key, patch) {
  const reviews = state.data.reviews
  reviews.reviews ??= {}
  reviews.reviews[key] = { ...(reviews.reviews[key] ?? {}), ...patch }
  clearTimeout(pending.get(key))
  pending.set(
    key,
    setTimeout(async () => {
      try {
        const { saved } = await api('/api/review', { key, review: reviews.reviews[key] })
        const note = $('#saved-note')
        if (note) note.textContent = `Saved to ${saved} at ${new Date().toTimeString().slice(0, 5)}`
      } catch (error) {
        toast(`Not saved: ${error.message}`)
      }
    }, 450),
  )
}

// Rendering: helpers

function chipClass(total) {
  if (total == null) return ''
  if (total >= 90) return 'hi'
  if (total >= 75) return 'mid'
  if (total >= 60) return 'lo'
  return 'vlo'
}

/** Inline Markdown: escaped first, then markers, code, bold, italics, links. */
function inline(text) {
  return esc(text)
    .replace(/\[check:([^\]]*)\]/gi, '<span class="check">check:$1</span>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(
      /\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
    )
}

function renderBlock(block) {
  const lines = block.split('\n')
  const isList = lines.every((line) => /^\s*(?:[-*+]|\d+[.)])\s/.test(line))
  if (isList) {
    const tag = /^\s*\d/.test(lines[0]) ? 'ol' : 'ul'
    const items = lines.map(
      (line) => `<li>${inline(line.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, ''))}</li>`,
    )
    return `<${tag}>${items.join('')}</${tag}>`
  }
  if (lines.every((line) => line.startsWith('>')))
    return `<blockquote>${inline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '))}</blockquote>`
  return `<p>${inline(block.replace(/\n/g, ' '))}</p>`
}

function gutterHtml(unit, index) {
  if (!unit) return `<div class="gutter" data-action="note" data-unit="${index}"></div>`
  const yes = state.config.yes
  const badges = []
  if (unit.decision >= yes)
    badges.push('<span class="badge d" title="Decision against an alternative">D</span>')
  if (unit.setback >= yes)
    badges.push('<span class="badge s" title="Cost, failure or open question">S</span>')
  if (unit.aiDidWork != null && unit.aiDidWork >= yes)
    badges.push(
      unit.aiSplit >= yes
        ? '<span class="badge ai-ok" title="AI did work; the split is stated">AI</span>'
        : '<span class="badge ai-no" title="AI did work; the split is not stated">AI</span>',
    )
  const tip = [
    `specificity ${unit.specificity}`,
    `selling ${unit.selling}`,
    `decision ${unit.decision}`,
    `setback ${unit.setback}`,
    unit.aiDidWork != null ? `AI work ${unit.aiDidWork}, split ${unit.aiSplit}` : null,
    'Click to add a note',
  ]
    .filter(Boolean)
    .join(' · ')
  return `<div class="gutter" data-action="note" data-unit="${index}" title="${esc(tip)}">
    <div class="meters"><div class="meter spec"><span style="height:${Math.round(unit.specificity * 100)}%"></span></div><div class="meter sell"><span style="height:${Math.round(unit.selling * 100)}%"></span></div></div>
    <div class="badges">${badges.join('')}</div>
  </div>`
}

/** The copy, block by block, with each unit carrying its Jev answers in the gutter. */
function docHtml(key, copy, result) {
  const units = result?.jev?.perUnit ?? null
  const review = reviewOf(key)
  const parts = []
  let index = 0
  const segments = copy.split(/(```[\s\S]*?```)/)
  for (const segment of segments) {
    if (segment.startsWith('```')) {
      parts.push(`<pre>${esc(segment.replace(/^```\w*\n?|```$/g, ''))}</pre>`)
      continue
    }
    for (const raw of segment.split(/\n\s*\n/)) {
      const block = raw.trim()
      if (!block) continue
      const heading = /^(#{1,6})\s+(.*)$/.exec(block)
      if (heading) {
        const level = Math.min(heading[1].length, 4)
        parts.push(`<h${level}>${inline(heading[2])}</h${level}>`)
        continue
      }
      if (/^\[(?:figure|caption)\]/i.test(block) || /^!\[/.test(block)) {
        parts.push(`<div class="aside">${inline(block)}</div>`)
        continue
      }
      const note = review?.paragraphNotes?.[index]
      const open = state.openNote?.key === key && state.openNote.unit === index
      parts.push(`<div class="unit${note ? ' has-note' : ''}" data-unit="${index}">
        ${gutterHtml(units?.[index], index)}
        <div class="unit-text">${renderBlock(block)}</div>
        ${
          open || note
            ? `<div class="para-note">${
                open
                  ? `<textarea data-action="para-note" data-unit="${index}" placeholder="Your note on this paragraph">${esc(note ?? '')}</textarea>`
                  : `<span class="check" data-action="note" data-unit="${index}">note: ${esc(note)}</span>`
              }</div>`
            : ''
        }
      </div>`)
      index += 1
    }
  }
  return parts.join('')
}

/** Wraps the first occurrence of `needle` in the element's text in a <mark>, across text nodes. */
function highlight(root, needle, className, title) {
  const normalize = (text) => text.replace(/\s+/g, ' ')
  const nodes = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let all = ''
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    nodes.push({ node, start: all.length })
    all += node.nodeValue
  }
  const target = normalize(needle).trim()
  let start = normalize(all).indexOf(target)
  if (start < 0) start = normalize(all).indexOf(target.slice(0, 60))
  if (start < 0) return false
  const end = start + target.length
  for (const { node, start: nodeStart } of nodes) {
    const nodeEnd = nodeStart + node.nodeValue.length
    if (nodeEnd <= start || nodeStart >= end) continue
    const from = Math.max(start, nodeStart) - nodeStart
    const to = Math.min(end, nodeEnd) - nodeStart
    const range = document.createRange()
    range.setStart(node, from)
    range.setEnd(node, to)
    const mark = document.createElement('mark')
    mark.className = `claim ${className}`
    mark.title = title
    range.surroundContents(mark)
  }
  return true
}

function layerTitle(layer, derived, result) {
  if (!derived) return LAYER_LABELS[layer]
  if (layer === 'structure')
    return `opening ${derived.opensOnWork ? 'inside the work' : 'outside'} · point ${derived.pointEarly ? 'early' : 'late'} · ending ${derived.ending} · title ${derived.title ?? 'none'}`
  if (layer === 'substance')
    return `specificity ${derived.specificity?.toFixed(2)} · decisions ${derived.decisions} · setbacks ${derived.setbacks} · AI split ${derived.aiSplitShare == null ? 'n/a' : derived.aiSplitShare.toFixed(2)}`
  if (layer === 'tone') return `mean selling ${derived.selling?.toFixed(2)}`
  if (layer === 'grounding')
    return `${derived.supported} of ${derived.factual} factual claims supported · ${derived.contradicted.length} contradicted · ${derived.missing.length} not in evidence`
  if (layer === 'lint')
    return `${result.lint.errors} errors · warnings: ${result.lint.warnings.join(', ') || 'none'}`
  if (layer === 'shape' && result.shape)
    return Object.entries(result.shape.measures)
      .map(([k, v]) => `${k} ${v}`)
      .join(' · ')
  return LAYER_LABELS[layer]
}

// Rendering: regions

function renderRail() {
  const filter = state.filter.toLowerCase()
  const groups = new Map()
  for (const output of outputs()) {
    const haystack = `${output.key} ${versionName(output.run)} ${outputLine(output)} ${groupTitle(output.group)}`
    if (filter && !haystack.toLowerCase().includes(filter)) continue
    if (!groups.has(output.group)) groups.set(output.group, [])
    groups.get(output.group).push(output)
  }
  const order = [...groups.keys()].sort(
    (x, y) => (Number(x) || 999) - (Number(y) || 999) || x.localeCompare(y),
  )
  $('#rail').innerHTML = `
    <div class="rail-filter"><input type="text" data-action="filter" placeholder="Filter by case, version or model" value="${esc(state.filter)}"></div>
    ${order
      .map((group) => {
        const rows = groups.get(group)
        return `<section class="case-group">
          <div class="case-title"><span>${esc(groupTitle(group))}</span><span>${rows.length}</span></div>
          ${rows
            .map((output) => {
              const s = scored(output)
              const review = reviewOf(output.key)
              const who = state.a === output.key ? 'A' : state.b === output.key ? 'B' : ''
              const total = s?.scores.total
              return `<div class="row${who === 'A' ? ' is-a' : who === 'B' ? ' is-b' : ''}" tabindex="0" data-action="pick" data-key="${esc(output.key)}" title="${esc(output.key)}">
                <span class="name"><span class="version">${esc(versionName(output.run))}</span><small>${esc(outputLine(output))}</small></span>
                ${review?.rating ? `<span class="rated" title="Your rating">★${review.rating}</span>` : '<span></span>'}
                ${state.blind ? '<span class="chip">?</span>' : `<span class="chip ${chipClass(total)}">${total ?? '-'}</span>`}
              </div>`
            })
            .join('')}
        </section>`
      })
      .join('')}`
}

function cardHtml(slot, output, other) {
  const loaded = state.texts.get(output.key)
  const s = scored(output)
  const o = scored(other)
  const testCase = caseOf(output.caseId)
  const title = /^#\s+(.+)$/m.exec(loaded?.copy ?? '')?.[1] ?? output.file
  const delta =
    s && o && s.scores.total != null && o.scores.total != null
      ? s.scores.total - o.scores.total
      : null
  const layers = KIND_LAYERS[output.result?.kind] ?? ['lint', 'substance', 'tone', 'grounding']
  const blind = state.blind
  const hard = (flag) => /^CONTRADICTS|^lint error/.test(flag)
  return `<article class="card${state.focus === slot ? ' focused' : ''}" data-slot="${slot}" data-action="focus">
    <header class="card-head">
      <span class="slot ${slot}">${slot.toUpperCase()}</span>
      <span class="title">${inline(title)}</span>
      <span class="total">${blind ? '' : (s?.scores.total ?? '-')}${!blind && delta != null && slot === 'b' ? `<span class="delta ${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '+' : ''}${delta}</span>` : ''}</span>
      <span class="meta">${
        blind
          ? `Output ${slot.toUpperCase()} · ${output.result?.words ?? '?'} words`
          : `Skill ${esc(versionName(output.run))} · ${esc(outputLine(output))} · ${output.result?.words ?? '?'} words${testCase ? ` · case ${testCase.id}` : ''}`
      }</span>
    </header>
    ${
      blind || !s
        ? ''
        : `<div class="layers">${LAYERS.map((layer) => {
            const value = s.scores[layer]
            const applies = layers.includes(layer) && value != null
            const otherValue = o?.scores[layer]
            const d = applies && otherValue != null && slot === 'b' ? value - otherValue : null
            return `<div class="layer${applies ? '' : ' na'}" title="${esc(layerTitle(layer, s.derived, output.result))}">${LAYER_LABELS[layer]}<b>${applies ? value : '-'}${d ? `<span class="delta ${d > 0 ? 'up' : 'down'}">${d > 0 ? '+' : ''}${d}</span>` : ''}</b><div class="bar"><span style="width:${applies ? value : 0}%"></span></div></div>`
          }).join('')}</div>
          ${
            s.flags.length
              ? `<details class="flags"${s.flags.some(hard) ? ' open' : ''}><summary>${s.flags.length} flag${s.flags.length > 1 ? 's' : ''}</summary><ul>${s.flags.map((f) => `<li class="${hard(f) ? 'hard' : ''}">${esc(f)}</li>`).join('')}</ul></details>`
              : ''
          }`
    }
    <div class="doc${state.showSupported ? ' show-supported' : ''}${blind ? ' blind' : ''}" data-doc="${esc(output.key)}">${loaded ? docHtml(output.key, loaded.copy, output.result) : '<p class="aside">Loading…</p>'}</div>
    ${
      writerNotesFile(output)
        ? `<details class="writer-notes" data-action="writer-notes" data-key="${esc(output.key)}"><summary>Writer's notes (Needs checking, lint)</summary><pre>${esc(state.writerNotes.get(output.key) ?? 'Loading…')}</pre></details>`
        : ''
    }
  </article>`
}

function wordDiff(before, after) {
  const tokenize = (text) => text.match(/\s+|[^\s]+/g) ?? []
  const x = tokenize(before)
  const y = tokenize(after)
  const rows = x.length + 1
  const cols = y.length + 1
  const table = new Uint32Array(rows * cols)
  for (let i = x.length - 1; i >= 0; i -= 1)
    for (let j = y.length - 1; j >= 0; j -= 1)
      table[i * cols + j] =
        x[i] === y[j]
          ? table[(i + 1) * cols + j + 1] + 1
          : Math.max(table[(i + 1) * cols + j], table[i * cols + j + 1])
  const out = []
  let i = 0
  let j = 0
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) {
      out.push(esc(x[i]))
      i += 1
      j += 1
    } else if (table[(i + 1) * cols + j] >= table[i * cols + j + 1]) {
      out.push(`<del>${esc(x[i])}</del>`)
      i += 1
    } else {
      out.push(`<ins>${esc(y[j])}</ins>`)
      j += 1
    }
  }
  for (; i < x.length; i += 1) out.push(`<del>${esc(x[i])}</del>`)
  for (; j < y.length; j += 1) out.push(`<ins>${esc(y[j])}</ins>`)
  return out
    .join('')
    .replace(/<\/del><del>/g, '')
    .replace(/<\/ins><ins>/g, '')
}

function renderStage() {
  const a = outputByKey(state.a)
  const b = outputByKey(state.b)
  const toolbar = `<div class="toolbar">
    <button data-action="blind" aria-pressed="${state.blind}" title="Hide scores, labels and Jev's notes while you judge (b)">Blind</button>
    <button data-action="diff" aria-pressed="${state.diff}" ${a && b ? '' : 'disabled'} title="Word diff from A to B (d)">Diff A→B</button>
    <button data-action="supported" aria-pressed="${state.showSupported}" title="Tint the claims the evidence supports">Supported claims</button>
    <button data-action="swap" ${a && b ? '' : 'disabled'}>Swap</button>
    <button data-action="clear-b" ${b ? '' : 'disabled'}>Clear B</button>
    <span class="legend"><span><i style="background:var(--meter-spec)"></i>specific</span><span><i style="background:var(--meter-sell)"></i>selling</span><span><i style="background:var(--warn-soft);outline:1px solid var(--warn)"></i>not in evidence</span><span><i style="background:var(--bad-soft);outline:1px solid var(--bad)"></i>contradicted</span><span><i style="background:var(--check-soft)"></i>[check]</span></span>
  </div>`
  if (!a) {
    $('#stage').innerHTML =
      `${toolbar}<div class="empty"><p>Pick an output on the left to read it. ⌥-click a second one to compare.</p><p>Judge in <b>Blind</b> mode first, then turn it off to see where the bench agrees.</p><p>New here? <a href="/guide">Read the guide</a>.</p></div>`
    return
  }
  if (state.diff && b && state.texts.has(a.key) && state.texts.has(b.key)) {
    $('#stage').innerHTML =
      `${toolbar}<div class="columns"><article class="card"><header class="card-head"><span class="slot">A→B</span><span class="title">${esc(runName(a.run))} → ${esc(runName(b.run))}</span><span></span><span class="meta">Removed text is struck through; added text is green.</span></header><div class="diff">${wordDiff(state.texts.get(a.key).copy, state.texts.get(b.key).copy)}</div></article></div>`
    return
  }
  const cards = [cardHtml('a', a, b)]
  if (b) cards.push(cardHtml('b', b, a))
  $('#stage').innerHTML =
    `${toolbar}<div class="columns" style="--cols:${cards.length}">${cards.join('')}</div>`
  for (const output of [a, b].filter(Boolean)) {
    const doc = $(`[data-doc="${CSS.escape(output.key)}"]`)
    const derived = scored(output)?.derived
    if (!doc || !derived) continue
    for (const v of derived.verdicts) {
      if (!['supported', 'missing', 'contradicted'].includes(v.final)) continue
      const label = v.final === 'missing' ? 'not in evidence' : v.final
      const title = `${label} (confidence ${v.confidence})${v.evidence?.length ? `\nNearest evidence:\n- ${v.evidence.slice(0, 3).join('\n- ')}` : ''}`
      for (const unit of doc.querySelectorAll('.unit-text'))
        if (highlight(unit, v.claim, v.final, title)) break
    }
  }
  const textarea = $('textarea[data-action="para-note"]')
  if (textarea) {
    textarea.focus()
    textarea.setSelectionRange(textarea.value.length, textarea.value.length)
  }
}

function renderTabs() {
  $('#tabs').innerHTML = TABS.map(
    ([id, label]) =>
      `<button role="tab" aria-selected="${state.tab === id}" data-action="tab" data-tab="${id}">${label}</button>`,
  ).join('')
}

function judgeHtml() {
  const key = state.focus === 'b' && state.b ? state.b : state.a
  const output = outputByKey(key)
  if (!output) return '<p class="help">Pick an output to judge it.</p>'
  const review = reviewOf(key) ?? {}
  const s = scored(output)
  const testCase = caseOf(output.caseId)
  const layers = KIND_LAYERS[output.result?.kind] ?? ['lint', 'substance', 'tone', 'grounding']
  const showBench = !state.blind
  const pairKey = state.a && state.b ? [state.a, state.b] : null
  const preference = pairKey
    ? state.data.reviews.preferences?.find((p) => p.a === pairKey[0] && p.b === pairKey[1])
    : null
  const sa = scored(outputByKey(state.a))
  const sb = scored(outputByKey(state.b))
  const benchPick =
    sa && sb
      ? sa.scores.total === sb.scores.total
        ? 'tie'
        : sa.scores.total > sb.scores.total
          ? 'a'
          : 'b'
      : null
  return `
    <h3>Judging ${state.focus === 'b' && state.b ? 'B' : 'A'}${state.blind ? '' : `: ${esc(runName(output.run))}`}</h3>
    <p class="help">${esc(output.file)}${state.a && state.b ? ' · press <kbd>f</kbd> to switch between A and B' : ''}</p>
    <div class="stars" role="group" aria-label="Your rating">${[1, 2, 3, 4, 5]
      .map(
        (n) =>
          `<button data-action="rate" data-value="${n}" aria-pressed="${review.rating === n}">${n}</button>`,
      )
      .join('')}</div>
    <h3>By layer</h3>
    <div class="marks">${MARKS.filter((m) => layers.includes(m.layer))
      .map((m) => {
        const mark = review.marks?.[m.layer]
        const value = s?.scores[m.layer]
        return `<div class="label">${m.label}<small>${m.hint}</small></div>
          <span class="bench" title="Bench score for ${LAYER_LABELS[m.layer]}">${showBench && value != null ? value : ''}</span>
          <button class="good" data-action="mark" data-layer="${m.layer}" data-value="good" aria-pressed="${mark === 'good'}">Good</button>
          <button class="bad" data-action="mark" data-layer="${m.layer}" data-value="bad" aria-pressed="${mark === 'bad'}">Bad</button>`
      })
      .join('')}</div>
    <h3>Notes</h3>
    <textarea data-action="notes" placeholder="What works, what you would change, what the skill should have done">${esc(review.notes ?? '')}</textarea>
    ${
      Object.keys(review.paragraphNotes ?? {}).length
        ? `<p class="help">${Object.keys(review.paragraphNotes).length} paragraph note(s). Click a paragraph's gutter to add one.</p>`
        : '<p class="help">Click a paragraph\'s gutter to note that paragraph.</p>'
    }
    <div class="saved-note" id="saved-note"></div>
    ${
      testCase?.expectations?.length
        ? `<h3>Case ${testCase.id} expectations</h3><div class="stack">${testCase.expectations
            .map(
              (text, i) =>
                `<label class="check-row"><input type="checkbox" data-action="expect" data-index="${i}" ${review.expectations?.[i] ? 'checked' : ''}><span>${esc(text)}</span></label>`,
            )
            .join('')}</div>`
        : ''
    }
    ${
      pairKey
        ? `<h3>A or B?</h3>
          <div class="inline">${['a', 'tie', 'b']
            .map(
              (w) =>
                `<button data-action="prefer" data-value="${w}" aria-pressed="${preference?.winner === w}">${w === 'tie' ? 'Tie' : w.toUpperCase()}</button>`,
            )
            .join('')}</div>
          <textarea data-action="prefer-note" placeholder="Why" style="margin-top:8px;min-height:48px">${esc(preference?.note ?? '')}</textarea>
          ${preference && benchPick ? `<p class="help">The bench ${benchPick === preference.winner ? 'agrees' : `prefers ${benchPick === 'tie' ? 'neither' : benchPick.toUpperCase()}`} (${sa.scores.total} vs ${sb.scores.total}).</p>` : ''}`
        : ''
    }
    <h3>Next</h3>
    <div class="inline">
      <button data-action="rewrite">Rewrite this…</button>
      <button data-action="anchor-open">Make it an anchor…</button>
    </div>
    <div id="anchor-form"></div>`
}

function anchorFormHtml(output) {
  const review = reviewOf(output.key) ?? {}
  const bad = Object.entries(review.marks ?? {})
    .filter(([, v]) => v === 'bad')
    .map(([layer]) => layer)
  return `<div class="stack" style="margin-top:10px">
    <div class="inline"><label><input type="radio" name="anchor-label" value="good" ${bad.length ? '' : 'checked'}> Good</label><label><input type="radio" name="anchor-label" value="bad" ${bad.length ? 'checked' : ''}> Bad</label></div>
    <p class="help">A bad anchor must score below the case's good anchor on each layer you tick.</p>
    <div class="inline">${[...LAYERS, 'total']
      .map(
        (l) =>
          `<label><input type="checkbox" name="anchor-test" value="${l}" ${bad.includes(l) || (bad.length && l === 'total') ? 'checked' : ''}> ${LAYER_LABELS[l] ?? 'Total'}</label>`,
      )
      .join('')}</div>
    <input type="text" id="anchor-about" placeholder="What it shows, in a line" value="${esc(review.notes?.split('\n')[0] ?? '')}">
    <div><button class="primary" data-action="anchor-save">Save anchor</button></div>
  </div>`
}

/** Spearman's rank correlation, ties averaged. */
function spearman(xs, ys) {
  const ranks = (values) => {
    const sorted = values.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0])
    const out = new Array(values.length)
    for (let i = 0; i < sorted.length; ) {
      let j = i
      while (j + 1 < sorted.length && sorted[j + 1][0] === sorted[i][0]) j += 1
      for (let k = i; k <= j; k += 1) out[sorted[k][1]] = (i + j) / 2 + 1
      i = j + 1
    }
    return out
  }
  const rx = ranks(xs)
  const ry = ranks(ys)
  const mean = (v) => v.reduce((s, n) => s + n, 0) / v.length
  const mx = mean(rx)
  const my = mean(ry)
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < rx.length; i += 1) {
    num += (rx[i] - mx) * (ry[i] - my)
    dx += (rx[i] - mx) ** 2
    dy += (ry[i] - my) ** 2
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : null
}

function agreement(config) {
  let agree = 0
  let total = 0
  for (const output of outputs()) {
    const marks = reviewOf(output.key)?.marks
    if (!marks || !output.result) continue
    const s = scoreResult(output.result, config)
    for (const [layer, mark] of Object.entries(marks)) {
      const value = s.scores[layer]
      if (value == null) continue
      total += 1
      if (value >= config.agreeAt === (mark === 'good')) agree += 1
    }
  }
  return { agree, total }
}

function insightsHtml() {
  const all = outputs()
  const at = state.config.agreeAt
  const cells = Object.fromEntries(
    MARKS.map((m) => [m.layer, { bothGood: [], bothBad: [], missed: [], harsh: [] }]),
  )
  const rated = []
  for (const output of all) {
    const review = reviewOf(output.key)
    const s = scored(output)
    if (!review || !s) continue
    if (review.rating && s.scores.total != null)
      rated.push({ output, rating: review.rating, total: s.scores.total })
    for (const [layer, mark] of Object.entries(review.marks ?? {})) {
      const value = s.scores[layer]
      if (value == null || !cells[layer]) continue
      const high = value >= at
      const bucket = mark === 'good' ? (high ? 'bothGood' : 'harsh') : high ? 'missed' : 'bothBad'
      cells[layer][bucket].push(output.key)
    }
  }
  const cell = (layer, bucket) => {
    const list = cells[layer][bucket]
    return list.length
      ? `<button class="cell-btn" data-action="insight-list" data-layer="${layer}" data-bucket="${bucket}">${list.length}</button>`
      : '<span class="cell-zero">0</span>'
  }
  const verdicts = MARKS.map((m) => {
    const c = cells[m.layer]
    const marked = c.bothGood.length + c.bothBad.length + c.missed.length + c.harsh.length
    if (!marked) return ''
    const wrongBench = c.missed.length + c.harsh.length
    if (wrongBench && wrongBench >= c.bothBad.length)
      return `<div class="verdict bench"><b>${m.label}: tune the benchmark</b>${c.missed.length ? `It scored ${c.missed.length} output(s) high that you marked bad. ` : ''}${c.harsh.length ? `It scored ${c.harsh.length} output(s) low that you marked good. ` : ''}Change: ${esc(LAYER_HOME[m.layer].bench)}.</div>`
    if (c.bothBad.length)
      return `<div class="verdict skill"><b>${m.label}: change the skill</b>You and the bench agree ${c.bothBad.length} output(s) fall short. Change: ${esc(LAYER_HOME[m.layer].skill)}.</div>`
    return `<div class="verdict ok"><b>${m.label}: holding</b>You and the bench agree the outputs you marked are good.</div>`
  }).join('')
  const listHtml = state.insightList
    ? `<div class="stack" style="margin:8px 0">${state.insightList.keys
        .map(
          (k) =>
            `<button class="ghost" style="text-align:left" data-action="open" data-key="${esc(k)}">${esc(k)}</button>`,
        )
        .join('')}</div>`
    : ''

  const rho =
    rated.length >= 3
      ? spearman(
          rated.map((r) => r.rating),
          rated.map((r) => r.total),
        )
      : null
  const scatter = rated.length
    ? `<svg class="scatter" viewBox="0 0 320 170" role="img" aria-label="Your rating against the bench total">
        <line class="axis" x1="40" y1="150" x2="310" y2="150"/><line class="axis" x1="40" y1="10" x2="40" y2="150"/>
        ${[1, 2, 3, 4, 5].map((n) => `<text x="${40 + (n - 1) * 66}" y="165" text-anchor="middle">${n}</text>`).join('')}
        ${[0, 50, 100].map((v) => `<text x="34" y="${150 - v * 1.4 + 3}" text-anchor="end">${v}</text>`).join('')}
        ${rated
          .map((r, i) => {
            const x = 40 + (r.rating - 1) * 66 + ((i * 7) % 15) - 7
            const y = 150 - r.total * 1.4
            return `<circle class="dot" cx="${x}" cy="${y}" r="4.5" data-action="open" data-key="${esc(r.output.key)}"><title>${esc(r.output.key)}: you ${r.rating}, bench ${r.total}</title></circle>`
          })
          .join('')}
      </svg>`
    : ''

  const prefs = state.data.reviews.preferences ?? []
  let prefAgree = 0
  const prefRows = prefs
    .map((p) => {
      const sa = scored(outputByKey(p.a))
      const sb = scored(outputByKey(p.b))
      if (!sa || !sb) return ''
      const bench =
        sa.scores.total === sb.scores.total ? 'tie' : sa.scores.total > sb.scores.total ? 'a' : 'b'
      if (bench === p.winner) prefAgree += 1
      return bench === p.winner
        ? ''
        : `<div class="verdict bench"><b>You picked ${p.winner === 'tie' ? 'a tie' : p.winner.toUpperCase()}, the bench ${bench === 'tie' ? 'a tie' : bench.toUpperCase()}</b>${esc(p.a)} vs ${esc(p.b)}${p.note ? `<br>${esc(p.note)}` : ''}</div>`
    })
    .join('')

  const runs = state.data.runs.map((run) => {
    const mine = all.filter((o) => o.run === run)
    const totals = mine.map((o) => scored(o)?.scores.total).filter((v) => v != null)
    const ratings = mine.map((o) => reviewOf(o.key)?.rating).filter(Boolean)
    const flagCounts = new Map()
    for (const o of mine)
      for (const f of scored(o)?.flags ?? []) {
        const kind = f.replace(/:.*$/, '').replace(/ reads as .*/, ' reads as …')
        flagCounts.set(kind, (flagCounts.get(kind) ?? 0) + 1)
      }
    const top = [...flagCounts.entries()].sort((p, q) => q[1] - p[1]).slice(0, 2)
    const avg = (v) =>
      v.length ? Math.round((v.reduce((s, n) => s + n, 0) / v.length) * 10) / 10 : '-'
    return `<tr><td>${esc(runName(run))}</td><td class="num">${mine.length}</td><td class="num">${avg(totals)}</td><td class="num">${avg(ratings)}</td><td style="text-align:left;font-size:11.5px">${top.map(([k, n]) => `${esc(k)} ×${n}`).join('<br>')}</td></tr>`
  })

  return `
    <h3>Your marks against the bench</h3>
    <p class="help">Bench score at or above ${at} counts as "good" (Knobs → agree at). Click a count to list those outputs.</p>
    <table class="grid-table">
      <tr><th>Layer</th><th title="You good, bench good">Both good</th><th title="You bad, bench low: the skill">Both bad</th><th title="You bad, bench high: the benchmark missed it">Bench missed</th><th title="You good, bench low: the benchmark is too harsh">Too harsh</th></tr>
      ${MARKS.map((m) => `<tr><td>${m.label}</td><td class="num">${cell(m.layer, 'bothGood')}</td><td class="num">${cell(m.layer, 'bothBad')}</td><td class="num">${cell(m.layer, 'missed')}</td><td class="num">${cell(m.layer, 'harsh')}</td></tr>`).join('')}
    </table>
    ${listHtml}
    ${verdicts || '<p class="help">Mark layers Good or Bad in the Judge tab to see what to change: the skill, or the benchmark.</p>'}
    <h3>Your rating against the total</h3>
    ${
      rated.length
        ? `<p class="help">${rated.length} rated · rank correlation ${rho == null ? 'needs 3+' : rho.toFixed(2)}${rho != null ? (rho > 0.6 ? ': the bench ranks like you do.' : rho > 0.2 ? ': loosely related; read the disagreements.' : ': the bench does not rank like you yet.') : ''}</p>${scatter}`
        : '<p class="help">Rate outputs 1 to 5 to compare.</p>'
    }
    <h3>Pairs</h3>
    <p class="help">${prefs.length ? `The bench agrees with your pick in ${prefAgree} of ${prefs.length}.` : 'Compare two outputs and pick A, B or tie in the Judge tab.'}</p>
    ${prefRows}
    <h3>Runs</h3>
    <table class="grid-table"><tr><th>Run</th><th>n</th><th>Bench</th><th>You</th><th style="text-align:left">Top flags</th></tr>${runs.join('')}</table>`
}

function knobsHtml() {
  const live = agreement(state.config)
  const saved = agreement(state.savedConfig)
  const changed = JSON.stringify(state.config) !== JSON.stringify(state.savedConfig)
  return `
    <p class="help">Every output rescores as you drag, from Jev's stored answers: no new Jev calls. Save writes <code>${esc(state.data.configPath)}</code>, which <code>bench.mjs</code> reads.</p>
    <p class="help">Agreement with your marks: <b>${live.total ? `${live.agree} of ${live.total}` : 'no marks yet'}</b>${changed && saved.total ? ` (saved config: ${saved.agree} of ${saved.total})` : ''}.</p>
    <div class="inline"><button class="primary" data-action="config-save" ${changed ? '' : 'disabled'}>Save</button><button data-action="config-revert" ${changed ? '' : 'disabled'}>Revert</button><button data-action="config-defaults">Defaults</button></div>
    ${KNOBS.map((k) => {
      if (k.group) return `<h3>${k.group}</h3>${k.help ? `<p class="help">${k.help}</p>` : ''}`
      const value = getPath(state.config, k.path)
      const savedValue = getPath(state.savedConfig, k.path)
      return `<div class="knob${value !== savedValue ? ' changed' : ''}"><label for="k-${k.path.join('-')}">${k.label}</label><input id="k-${k.path.join('-')}" type="range" min="${k.min}" max="${k.max}" step="${k.step}" value="${value}" data-action="knob" data-path="${k.path.join('.')}"><output>${value}</output></div>`
    }).join('')}`
}

function lineDiff(before, after) {
  const x = before.split('\n')
  const y = after.split('\n')
  const cols = y.length + 1
  const table = new Uint32Array((x.length + 1) * cols)
  for (let i = x.length - 1; i >= 0; i -= 1)
    for (let j = y.length - 1; j >= 0; j -= 1)
      table[i * cols + j] =
        x[i] === y[j]
          ? table[(i + 1) * cols + j + 1] + 1
          : Math.max(table[(i + 1) * cols + j], table[i * cols + j + 1])
  const ops = []
  let i = 0
  let j = 0
  while (i < x.length || j < y.length) {
    if (i < x.length && j < y.length && x[i] === y[j]) {
      ops.push(['same', x[i]])
      i += 1
      j += 1
    } else if (
      j >= y.length ||
      (i < x.length && table[(i + 1) * cols + j] >= table[i * cols + j + 1])
    ) {
      ops.push(['rem', x[i]])
      i += 1
    } else {
      ops.push(['add', y[j]])
      j += 1
    }
  }
  const near = ops.map((_op, n) => ops.slice(Math.max(0, n - 2), n + 3).some(([t]) => t !== 'same'))
  const lines = []
  let gap = false
  ops.forEach(([type, text], n) => {
    if (type === 'same' && !near[n]) {
      if (!gap) lines.push('<div class="gap">⋯</div>')
      gap = true
      return
    }
    gap = false
    const sign = type === 'add' ? '+ ' : type === 'rem' ? '- ' : '  '
    lines.push(`<div class="${type === 'same' ? '' : type}">${esc(sign + text)}</div>`)
  })
  return { changed: ops.some(([t]) => t !== 'same'), html: lines.join('') }
}

function skillHtml() {
  const seen = new Set()
  const options = []
  for (const r of state.data.runs) {
    const id = r.meta?.skillVersion
    if (!r.hasSkill || !id || seen.has(id)) continue
    seen.add(id)
    options.push([
      r.name,
      `${versionName(r)}${r.meta.createdAt ? ` (${r.meta.createdAt.slice(0, 10)})` : ''}`,
    ])
  }
  const current = state.data.skill.current
  options.push([
    'current',
    current.changed
      ? `Working tree: unsaved changes, next is ${current.version}`
      : `Working tree (same as ${current.version})`,
  ])
  const select = (side) =>
    `<select data-action="skill-pick" data-side="${side}">${options
      .map(
        ([v, l]) =>
          `<option value="${esc(v)}" ${state.skillPair[side] === v ? 'selected' : ''}>${esc(l)}</option>`,
      )
      .join('')}</select>`
  const left = state.skills.get(state.skillPair.left)
  const right = state.skills.get(state.skillPair.right)
  let body = '<p class="help">Loading…</p>'
  if (left && right) {
    const files = [...new Set([...Object.keys(left.files), ...Object.keys(right.files)])].sort()
    const diffs = files.map((file) => ({
      file,
      ...lineDiff(left.files[file] ?? '', right.files[file] ?? ''),
    }))
    const changed = diffs.filter((d) => d.changed)
    const runOf = (name) => state.data.runs.find((r) => r.name === name)
    const notes = [state.skillPair.left, state.skillPair.right]
      .map((name) => runOf(name))
      .filter((r) => r?.meta?.note)
      .map((r) => `<p class="help"><b>${esc(versionName(r))}:</b> ${esc(r.meta.note)}</p>`)
      .join('')
    body = `${notes}<p class="help">${changed.length} of ${files.length} files differ.</p>${changed
      .map(
        (d) =>
          `<details class="diff-file" open><summary>${esc(d.file)}</summary><div class="diff-lines">${d.html}</div></details>`,
      )
      .join('')}`
  }
  return `<div class="stack"><div class="field"><label>From</label>${select('left')}</div><div class="field"><label>To</label>${select('right')}</div></div>${body}`
}

function writerRowHtml(writer, index, count) {
  const engines = state.data.engines
  const engine = engines[writer.engine]
  return `<div class="writer-row" data-writer="${index}">
    <select data-writer-field="engine" aria-label="Writer">${Object.values(engines)
      .map(
        (e) =>
          `<option value="${e.id}" ${writer.engine === e.id ? 'selected' : ''} ${e.available ? '' : 'disabled'}>${esc(e.label)}${e.available ? '' : ' (not set up)'}</option>`,
      )
      .join('')}</select>
    <input type="text" list="models-${writer.engine}" data-writer-field="model" value="${esc(writer.model)}" aria-label="Model" placeholder="${esc(engine?.defaultModel ?? '')}">
    <select data-writer-field="effort" aria-label="Effort">${(engine?.efforts ?? ['default'])
      .map(
        (e) =>
          `<option value="${e}" ${writer.effort === e ? 'selected' : ''}>${e === 'default' ? 'default effort' : `${e} effort`}</option>`,
      )
      .join('')}</select>
    <button class="ghost" data-action="writer-remove" data-index="${index}" ${count > 1 ? '' : 'disabled'} aria-label="Remove this writer">×</button>
    <small class="writer-preview">${esc(writerName({ ...writer, model: writer.model || engine?.defaultModel }))} · ${engine?.harness === 'api' ? 'one API call with the skill in the prompt, then a lint repair' : 'a full agent session that loads the skill'}</small>
  </div>`
}

function generateHtml() {
  const g = state.gen
  const focused = outputByKey(state.focus === 'b' && state.b ? state.b : state.a)
  const testCases = state.data.cases.filter((c) => !c.bench?.live)
  const running = state.jobs.filter((j) => j.status === 'running')
  const skill = state.data.skill.current
  const engines = Object.values(state.data.engines)
  const missing = engines.filter((e) => !e.available)
  return `
    <h3>Skill version</h3>
    ${
      skill.changed
        ? `<p class="help">The skill files changed since the last version, so these outputs will be <b>${skill.version}</b>. <button class="ghost" data-action="skill-current">See the changes</button></p>
          <div class="field"><label>Name ${skill.version} (a few words: what is different)</label><input type="text" data-gen="skillName" placeholder="Shorter openings" value="${esc(g.skillName)}"></div>
          <div class="field"><label>What changed and why</label><textarea data-gen="note" placeholder="Shown with the skill diff and in Insights">${esc(g.note)}</textarea></div>`
        : `<p class="help">Skill unchanged: outputs join <b>${esc(skill.version)} · ${esc(skill.name)}</b>. Edit the skill files to start a new version.</p>`
    }
    <h3>What to write</h3>
    <div class="inline" role="radiogroup">${[
      ['case', 'A test case'],
      ['custom', 'A new brief'],
      ['rewrite', 'A rewrite'],
    ]
      .map(
        ([v, l]) =>
          `<button data-action="gen-mode" data-value="${v}" aria-pressed="${g.mode === v}" ${v === 'rewrite' && !focused ? 'disabled title="Open an output first"' : ''}>${l}</button>`,
      )
      .join('')}</div>
    <div class="stack" style="margin-top:12px">
      ${
        g.mode === 'case'
          ? `<div class="field"><label>Case</label><select data-gen="caseId">${testCases
              .map(
                (c) =>
                  `<option value="${c.id}" ${String(g.caseId) === String(c.id) ? 'selected' : ''}>${c.id} · ${esc(c.title ?? c.name)}</option>`,
              )
              .join('')}</select></div>
            <div class="field"><label>Prompt (leave empty to use the case's own)</label><textarea data-gen="prompt" placeholder="${esc(caseOf(g.caseId)?.prompt ?? '')}">${esc(g.prompt)}</textarea></div>`
          : ''
      }
      ${
        g.mode === 'custom'
          ? `<div class="field"><label>Short name for this brief</label><input type="text" data-gen="title" placeholder="LinkedIn post on Studio" value="${esc(g.title)}"></div>
            <div class="field"><label>Brief</label><textarea data-gen="prompt" placeholder="What you would ask the skill for">${esc(g.prompt)}</textarea></div>
            <div class="field"><label>Kind (sets the lint and the layers)</label><select data-gen="kind">${[
              'article',
              'linkedinPost',
              'coverLetter',
              'youtubeScript',
              'body',
            ]
              .map((k) => `<option ${g.kind === k ? 'selected' : ''}>${k}</option>`)
              .join('')}</select></div>
            <div class="field"><label>Evidence (the facts it may use, and is graded against)</label>${state.data.evidenceFiles
              .map(
                (f) =>
                  `<label class="check-row"><input type="checkbox" data-gen-evidence="${esc(f)}" ${g.evidence.includes(f) ? 'checked' : ''}><span>${esc(f)}</span></label>`,
              )
              .join('')}</div>`
          : ''
      }
      ${
        g.mode === 'rewrite' && focused
          ? `<p class="help">Rewriting <b>${esc(groupTitle(focused.group))}</b>, ${esc(runName(focused.run))}${focused.samples > 1 ? `, sample ${focused.sample}` : ''}. The result is graded as the same case.</p>
            <div class="field"><label>Direction</label><textarea data-gen="direction" placeholder="Open on the reader's problem, cut the second section, end on an implication…">${esc(g.direction)}</textarea></div>`
          : ''
      }
    </div>
    <h3>Writers</h3>
    <p class="help">Each writer gets its own run, so you can compare models and effort on the same request. Compare within one engine for a fair test: the API engine and the agent engines differ in more than the model.</p>
    <div class="stack">${g.writers.map((w, i) => writerRowHtml(w, i, g.writers.length)).join('')}</div>
    ${engines.map((e) => `<datalist id="models-${e.id}">${e.models.map((m) => `<option value="${esc(m)}"></option>`).join('')}</datalist>`).join('')}
    <div class="inline" style="margin-top:8px"><button data-action="writer-add" ${g.writers.length >= 4 ? 'disabled' : ''}>+ Add a writer to compare</button>
      <div class="field" style="width:120px;margin-left:auto"><label>Samples each</label><input type="number" min="1" max="4" data-gen="samples" value="${g.samples}"></div></div>
    ${missing.length ? `<p class="help">${missing.map((e) => `${esc(e.label)}: ${esc(e.hint)}`).join('<br>')}</p>` : ''}
    <div class="inline" style="margin-top:12px"><button class="primary" data-action="generate" ${running.length ? 'disabled' : ''}>Generate ${g.writers.length * g.samples} output${g.writers.length * g.samples > 1 ? 's' : ''}</button></div>
    <p class="help">Agent runs report their cost; API runs report tokens. Each shows in the log below as it finishes.</p>
    <h3>Jobs</h3>
    ${
      state.jobs.length
        ? state.jobs
            .map(
              (j) =>
                `<div class="field"><label>${esc(j.title)} · ${j.status}</label><div class="log">${esc(j.log.join('\n'))}</div></div>`,
            )
            .join('')
        : '<p class="help">None yet.</p>'
    }
    <h3>Grade again</h3>
    <div class="inline"><select id="grade-run">${state.data.runs.map((r) => `<option value="${esc(r.name)}">${esc(`${runName(r)} (${r.name})`)}</option>`).join('')}</select><button data-action="grade">Grade</button></div>
    <p class="help">${state.data.jevKey ? 'Jev key found.' : 'TYPESAFE_API_KEY is not set: new runs will not be graded.'}</p>`
}

function renderPanel() {
  renderTabs()
  const html = {
    judge: judgeHtml,
    insights: insightsHtml,
    knobs: knobsHtml,
    skill: skillHtml,
    generate: generateHtml,
  }[state.tab]()
  $('#panel').innerHTML = html
}

function renderAll() {
  renderRail()
  renderStage()
  renderPanel()
  renderJobsPill()
}

function renderJobsPill() {
  const running = state.jobs.filter((j) => j.status === 'running')
  $('#jobs-pill').hidden = !running.length
  $('#jobs-text').textContent = running.length
    ? `${running[0].title} · ${running[0].log.at(-1) ?? ''}`
    : ''
}

// Actions

async function pick(key, slot) {
  if (slot === 'b') {
    state.b = key === state.a ? null : key
    state.focus = state.b ? 'b' : 'a'
  } else {
    state.a = key
    if (state.b === key) state.b = null
    state.focus = 'a'
  }
  state.openNote = null
  renderAll()
  await Promise.all([state.a, state.b].filter(Boolean).map(textOf))
  renderStage()
}

function rescore() {
  state.scores.clear()
  renderRail()
  renderStage()
}

async function loadSkill(name) {
  if (!name || state.skills.has(name)) return
  state.skills.set(name, await api(`/api/skill?run=${encodeURIComponent(name)}`))
}

/** One run per skill version, oldest first: what the Skill diff tab compares. */
function versionRuns() {
  const seen = new Map()
  for (const r of state.data.runs)
    if (r.hasSkill && r.meta?.skillVersion && !seen.has(r.meta.skillVersion))
      seen.set(r.meta.skillVersion, r)
  return [...seen.values()]
}

async function openSkillTab(left, right) {
  const versions = versionRuns()
  state.skillPair.left =
    left ?? state.skillPair.left ?? versions.at(-2)?.name ?? versions.at(-1)?.name
  state.skillPair.right = right ?? state.skillPair.right ?? versions.at(-1)?.name ?? 'current'
  state.tab = 'skill'
  renderPanel()
  await Promise.all([loadSkill(state.skillPair.left), loadSkill(state.skillPair.right)])
  renderPanel()
}

let polling = null
async function pollJobs() {
  state.jobs = await api('/api/jobs')
  renderJobsPill()
  if (state.tab === 'generate' && !document.activeElement?.matches('textarea, input, select'))
    renderPanel()
  const running = state.jobs.some((j) => j.status === 'running')
  if (!running && polling) {
    clearInterval(polling)
    polling = null
    await loadState()
    renderAll()
    toast('Run finished and graded.')
  }
}

function startPolling() {
  if (!polling) polling = setInterval(pollJobs, 2000)
  pollJobs()
}

const focusedKey = () => (state.focus === 'b' && state.b ? state.b : state.a)
let knobTimer = null
let preferTimer = null

const actions = {
  pick: (el, event) => pick(el.dataset.key, event.altKey || event.metaKey ? 'b' : 'a'),
  open: (el) => pick(el.dataset.key, 'a'),
  tab: (el) => {
    if (el.dataset.tab === 'skill') return openSkillTab()
    state.tab = el.dataset.tab
    renderPanel()
  },
  focus: (el) => {
    if (state.focus === el.dataset.slot) return
    state.focus = el.dataset.slot
    for (const card of document.querySelectorAll('.card[data-slot]'))
      card.classList.toggle('focused', card.dataset.slot === state.focus)
    if (state.tab === 'judge') renderPanel()
  },
  blind: () => {
    state.blind = !state.blind
    renderAll()
  },
  diff: () => {
    state.diff = !state.diff
    renderStage()
  },
  supported: () => {
    state.showSupported = !state.showSupported
    renderStage()
  },
  swap: () => {
    ;[state.a, state.b] = [state.b, state.a]
    renderAll()
  },
  'clear-b': () => {
    state.b = null
    state.focus = 'a'
    renderAll()
  },
  note: (el) => {
    const card = el.closest('.card')
    const key = card?.querySelector('[data-doc]')?.dataset.doc
    if (!key) return
    const unit = Number(el.dataset.unit)
    state.openNote =
      state.openNote?.key === key && state.openNote.unit === unit ? null : { key, unit }
    state.focus = card.dataset.slot
    renderStage()
  },
  rate: (el) => {
    const key = focusedKey()
    const value = Number(el.dataset.value)
    saveReview(key, { rating: reviewOf(key)?.rating === value ? null : value })
    renderPanel()
    renderRail()
  },
  mark: (el) => {
    const key = focusedKey()
    const marks = { ...(reviewOf(key)?.marks ?? {}) }
    marks[el.dataset.layer] =
      marks[el.dataset.layer] === el.dataset.value ? undefined : el.dataset.value
    saveReview(key, { marks: JSON.parse(JSON.stringify(marks)) })
    renderPanel()
  },
  prefer: async (el) => {
    const note = $('textarea[data-action="prefer-note"]')?.value ?? ''
    const entry = { a: state.a, b: state.b, winner: el.dataset.value, note }
    const prefs = state.data.reviews.preferences ?? []
    state.data.reviews.preferences = [
      ...prefs.filter((p) => !(p.a === entry.a && p.b === entry.b)),
      entry,
    ]
    await api('/api/preference', entry)
    renderPanel()
  },
  rewrite: () => {
    state.gen.mode = 'rewrite'
    state.tab = 'generate'
    renderPanel()
  },
  'anchor-open': () => {
    const output = outputByKey(focusedKey())
    if (output) $('#anchor-form').innerHTML = anchorFormHtml(output)
  },
  'anchor-save': async () => {
    const output = outputByKey(focusedKey())
    const label = $('input[name="anchor-label"]:checked')?.value ?? 'good'
    const tests = [...document.querySelectorAll('input[name="anchor-test"]:checked')].map(
      (i) => i.value,
    )
    const { saved } = await api('/api/anchor', {
      run: output.run.name,
      file: output.file,
      case: output.caseId,
      label,
      tests,
      about: $('#anchor-about')?.value ?? '',
    })
    toast(`Anchor saved: ${saved}`)
    $('#anchor-form').innerHTML =
      `<p class="help">Saved <code>${esc(saved)}</code>. Run the self-test to check the grader against it.</p>`
  },
  'config-save': async () => {
    const { saved } = await api('/api/config', { config: state.config })
    state.savedConfig = structuredClone(state.config)
    state.dirtyConfig = false
    toast(`Saved ${saved}`)
    renderPanel()
  },
  'config-revert': () => {
    state.config = structuredClone(state.savedConfig)
    state.dirtyConfig = false
    rescore()
    renderPanel()
  },
  'config-defaults': () => {
    state.config = structuredClone(DEFAULT_CONFIG)
    state.dirtyConfig = true
    rescore()
    renderPanel()
  },
  'insight-list': (el) => {
    const keys = []
    for (const output of outputs()) {
      const mark = reviewOf(output.key)?.marks?.[el.dataset.layer]
      const value = scored(output)?.scores[el.dataset.layer]
      if (!mark || value == null) continue
      const high = value >= state.config.agreeAt
      const bucket = mark === 'good' ? (high ? 'bothGood' : 'harsh') : high ? 'missed' : 'bothBad'
      if (bucket === el.dataset.bucket) keys.push(output.key)
    }
    state.insightList = { keys }
    renderPanel()
  },
  'skill-current': () => openSkillTab(versionRuns().at(-1)?.name, 'current'),
  'writer-add': () => {
    const last = state.gen.writers.at(-1)
    state.gen.writers.push({ ...last })
    renderPanel()
  },
  'writer-remove': (el) => {
    state.gen.writers.splice(Number(el.dataset.index), 1)
    renderPanel()
  },
  'gen-mode': (el) => {
    state.gen.mode = el.dataset.value
    renderPanel()
  },
  generate: async () => {
    const g = state.gen
    const source = outputByKey(focusedKey())
    if (state.data.skill.current.changed && !g.skillName.trim())
      return toast(`Name ${state.data.skill.current.version} first: the skill changed.`)
    if (g.mode === 'custom' && !g.prompt.trim()) return toast('Write the brief first.')
    const body = {
      mode: g.mode,
      caseId: g.mode === 'case' ? g.caseId : g.mode === 'rewrite' ? source?.caseId : null,
      prompt: g.mode === 'rewrite' ? '' : g.prompt,
      title: g.title,
      kind: g.kind,
      evidence: g.evidence,
      direction: g.direction,
      samples: g.samples,
      configs: g.writers,
      skillName: g.skillName,
      note: g.note,
      source: g.mode === 'rewrite' && source ? { run: source.run.name, file: source.file } : null,
    }
    try {
      await api('/api/generate', body)
    } catch (error) {
      return toast(error.message)
    }
    toast('Generation started. Outputs appear in the rail when graded.')
    startPolling()
  },
  grade: async () => {
    await api('/api/grade', { run: $('#grade-run').value })
    toast('Grading started.')
    startPolling()
  },
}

document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-action]')
  if (!el || el.matches('textarea, input[type="text"], input[type="range"], select')) return
  const action = actions[el.dataset.action]
  if (!action || el.dataset.action === 'writer-notes') return
  action(el, event)
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.target.matches('.row')) actions.pick(event.target, event)
})

document.addEventListener(
  'toggle',
  async (event) => {
    const el = event.target
    if (!el.matches?.('[data-action="writer-notes"]') || !el.open) return
    const key = el.dataset.key
    if (state.writerNotes.has(key)) return
    const output = outputByKey(key)
    const { text } = await api(
      `/api/output?run=${encodeURIComponent(output.run.name)}&file=${encodeURIComponent(writerNotesFile(output))}`,
    )
    state.writerNotes.set(key, text)
    el.querySelector('pre').textContent = text
  },
  true,
)

document.addEventListener('input', (event) => {
  const el = event.target
  const key = focusedKey()
  if (el.dataset.action === 'filter') {
    state.filter = el.value
    renderRail()
    const input = $('input[data-action="filter"]')
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
  } else if (el.dataset.action === 'notes') saveReview(key, { notes: el.value })
  else if (el.dataset.action === 'para-note') {
    const docKey = el.closest('.card')?.querySelector('[data-doc]')?.dataset.doc
    const notes = { ...(reviewOf(docKey)?.paragraphNotes ?? {}) }
    if (el.value.trim()) notes[el.dataset.unit] = el.value
    else delete notes[el.dataset.unit]
    saveReview(docKey, { paragraphNotes: notes })
  } else if (el.dataset.action === 'knob') {
    const path = el.dataset.path.split('.').map((p) => (/^\d+$/.test(p) ? Number(p) : p))
    setPath(state.config, path, Number(el.value))
    state.dirtyConfig = true
    el.nextElementSibling.textContent = el.value
    el.closest('.knob').classList.toggle(
      'changed',
      getPath(state.savedConfig, path) !== Number(el.value),
    )
    clearTimeout(knobTimer)
    knobTimer = setTimeout(() => {
      rescore()
      const scrollTop = $('#panel').scrollTop
      renderPanel()
      $('#panel').scrollTop = scrollTop
    }, 60)
  } else if (el.dataset.gen) {
    state.gen[el.dataset.gen] =
      el.dataset.gen === 'samples' ? Math.min(Math.max(Number(el.value) || 1, 1), 4) : el.value
  } else if (el.dataset.writerField === 'model') {
    const index = Number(el.closest('[data-writer]').dataset.writer)
    state.gen.writers[index].model = el.value
    const writer = state.gen.writers[index]
    const preview = el.closest('[data-writer]').querySelector('.writer-preview')
    if (preview)
      preview.textContent = writerName({
        ...writer,
        model: writer.model || state.data.engines[writer.engine]?.defaultModel,
      })
  } else if (el.dataset.genEvidence) {
    const set = new Set(state.gen.evidence)
    if (el.checked) set.add(el.dataset.genEvidence)
    else set.delete(el.dataset.genEvidence)
    state.gen.evidence = [...set]
  } else if (el.dataset.action === 'expect') {
    const expectations = { ...(reviewOf(key)?.expectations ?? {}) }
    expectations[el.dataset.index] = el.checked
    saveReview(key, { expectations })
  } else if (el.dataset.action === 'prefer-note') {
    const preference = state.data.reviews.preferences?.find(
      (p) => p.a === state.a && p.b === state.b,
    )
    if (preference) {
      preference.note = el.value
      clearTimeout(preferTimer)
      preferTimer = setTimeout(() => api('/api/preference', preference), 500)
    }
  }
})

document.addEventListener('change', (event) => {
  const el = event.target
  if (el.dataset.action === 'skill-pick') {
    state.skillPair[el.dataset.side] = el.value
    loadSkill(el.value).then(renderPanel)
  } else if (el.dataset.gen === 'caseId' || el.dataset.gen === 'kind') {
    state.gen[el.dataset.gen] = el.value
  } else if (el.dataset.writerField === 'engine' || el.dataset.writerField === 'effort') {
    const index = Number(el.closest('[data-writer]').dataset.writer)
    const writer = state.gen.writers[index]
    writer[el.dataset.writerField] = el.value
    if (el.dataset.writerField === 'engine') {
      writer.model = state.data.engines[el.value].defaultModel
      writer.effort = 'default'
    }
    renderPanel()
  } else if (el.dataset.gen === 'samples') renderPanel()
})

document.addEventListener('keydown', (event) => {
  if (event.target.matches('textarea, input, select') || event.metaKey || event.ctrlKey) return
  const list = outputs().map((o) => o.key)
  if (/^[1-5]$/.test(event.key) && state.a) {
    actions.rate({ dataset: { value: event.key } })
  } else if (event.key === 'j' || event.key === 'k') {
    const index = list.indexOf(state.a)
    const next = list[Math.min(Math.max(index + (event.key === 'j' ? 1 : -1), 0), list.length - 1)]
    if (next) pick(next, 'a')
  } else if (event.key === 'd' && state.a && state.b) actions.diff()
  else if (event.key === 'b') actions.blind()
  else if (event.key === 'f' && state.b)
    actions.focus({ dataset: { slot: state.focus === 'a' ? 'b' : 'a' } })
  else return
  event.preventDefault()
})

await loadState()
state.jobs = await api('/api/jobs')
renderAll()
if (state.jobs.some((j) => j.status === 'running')) startPolling()
