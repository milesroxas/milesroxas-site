#!/usr/bin/env node
/**
 * Voice lint for Miles Roxas brand content: the exact part of
 * docs/miles-roxas-brand-context.md and the CMS save-time rules, as code.
 * Whether copy is specific or sounds like Miles stays a judgment for the writer.
 *
 * Severity: error = fix before delivering; warning = fix or say why it stands;
 * info = a claim to confirm against the claim ledger.
 * The em dash rule matches src/plugins/mcp-write-checks.ts, and the phrase list
 * extends AVOID_PHRASES in src/features/ask/prompts.ts and sas-site's voice.ts.
 */
import { readFileSync, realpathSync } from 'node:fs'
import { extname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

const HELP = `Usage: node check-voice.mjs [options] [file ...]

Checks copy against Miles Roxas's brand voice. Reads stdin when no file is given or a file is "-".
A .json file holds {"fields":[{"path":"meta.description","kind":"metaDescription","text":"..."}]}
(or just the array). Any other file is one passage of plain text or Markdown.

Options:
  --kind <kind>      Kind for text input (default: body). Ignored for JSON fields that set one.
  --target <target>  chat (default) or cms. cms also fails [check: ...] markers and raw HTML.
  --format <format>  json (default) or text.
  -h, --help         Show this help.

Kinds:
KINDS_PLACEHOLDER

Exit codes: 0 no errors, 1 errors found, 2 bad usage.`

// Built from code points so this file holds none of the characters it refuses.
const EM_DASH = String.fromCharCode(0x2014)
const EN_DASH = String.fromCharCode(0x2013)

/** Advisory shapes per surface. hardMaxChars is an error; the rest are warnings. */
const KINDS = {
  body: { about: 'Any passage (default)' },
  heading: { about: 'Section heading', maxChars: 60, maxSentences: 1 },
  metaTitle: {
    about: 'SEO title; the template appends " | Miles Roxas"',
    minChars: 15,
    maxChars: 45,
  },
  metaDescription: { about: 'SEO description', minChars: 100, maxChars: 155, noFirstPerson: true },
  workSummary: { about: 'Case study summary (hero.richText)', maxChars: 220, maxSentences: 2 },
  tagline: { about: 'Site Info tagline', maxChars: 140, maxSentences: 1, noFirstPerson: true },
  siteDescription: {
    about: 'Site Info description',
    minSentences: 2,
    maxSentences: 4,
    noFirstPerson: true,
  },
  altText: { about: 'Image alt text', maxChars: 150 },
  caption: { about: 'Figure or media caption', hardMaxChars: 300 },
  figureTitle: { about: 'Chart or diagram title', hardMaxChars: 120 },
  askSuggestion: { about: 'Ask suggested question', maxChars: 80, hardMaxChars: 500 },
  linkedinPost: {
    about: 'LinkedIn post',
    minWords: 40,
    maxWords: 300,
    firstLineMaxChars: 140,
    maxHashtags: 3,
  },
  linkedinHeadline: { about: 'LinkedIn headline', hardMaxChars: 220 },
  youtubeTitle: { about: 'YouTube title', maxChars: 70, hardMaxChars: 100 },
  youtubeDescription: { about: 'YouTube description', firstLineMaxChars: 150 },
  youtubeScript: { about: 'YouTube script', paragraphWords: 180 },
  cvBullet: { about: 'CV bullet', maxWords: 30 },
  coverLetter: { about: 'Cover letter or application answer', maxWords: 400 },
  bio: { about: 'Bio, any length' },
  article: {
    about: 'Post, essay or case study narrative in Markdown (references/articles.md)',
    minWords: 400,
    maxWords: 2500,
  },
}

/** Kinds that may land in a CMS Markdown field, which refuses raw HTML. */
const MARKDOWN_KINDS = new Set(['body', 'caption', 'article'])

/** Agency, sales and hype language. A single word is caught in any inflection. */
const AVOID_PHRASES = [
  'elevate',
  'unlock',
  'transform your vision',
  'seamlessly',
  'seamless',
  'cutting-edge',
  'best-in-class',
  'holistic',
  'world-class',
  'innovative solutions',
  'meaningful impact',
  'at the intersection of',
  "in today's fast-paced world",
  'bring your vision to life',
  'take your brand to the next level',
  'tailored solutions',
  'unique needs',
  'end-to-end solutions',
  'drive engagement',
  'future-proof',
  'synergy',
  'game-changer',
  'game-changing',
  'revolutionize',
  'revolutionary',
  'supercharge',
  'next-level',
  'groundbreaking',
  'state-of-the-art',
  'unparalleled',
  'disrupt',
  'empower',
  'thought leader',
  'thought leadership',
  'visionary',
  'rockstar',
  'ninja',
  'guru',
  'passionate',
  'harness the power',
  'delve',
  'tapestry',
  'leverage',
  'impactful',
  'conversion-ready',
  'high-velocity',
  'digital transformation',
  'spearhead',
]

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** "unlock" also as unlocks, unlocked, unlocking; "leverage" as leverages, leveraged, leveraging. */
const inflected = (phrase) => {
  const literal = escapeRegExp(phrase).replace(/'/g, "['’]")
  if (!/^[a-z]+$/.test(phrase)) return literal
  return phrase.endsWith('e')
    ? `${literal.slice(0, -1)}(?:e|es|ed|ing)`
    : `${literal}(?:s|es|ed|ing)?`
}

/** Labels the guide says never to lead with. Accurate past titles may stay. */
const IDENTITY_LABELS = [
  /\bsoftware engineer\b/gi,
  /\bfull[- ]stack (?:engineer|developer)\b/gi,
  /\bAI (?:expert|engineer|specialist)\b/gi,
  /\bprompt engineer\b/gi,
  /\bdesign lead and engineer\b/gi,
  /\b(?:I am|I'm|I’m|as an?|Miles(?: Roxas)? is an?|he is an?)\s+(?:[\w-]+\s+){0,3}?(?:engineer|developer|creative director)\b/gi,
]

/**
 * Each match of a pattern rule is one finding. `severity` may depend on the
 * target, `when` limits a rule to a target or kind, `skip` drops a match.
 */
const PATTERN_RULES = [
  {
    rule: 'dash-as-em-dash',
    severity: 'warning',
    patterns: [new RegExp(`\\s${EN_DASH}\\s|\\s--\\s`, 'g')],
    message: () => 'A spaced en dash or double hyphen used as an em dash. Recast the sentence.',
  },
  {
    rule: 'avoid-phrase',
    severity: 'error',
    patterns: AVOID_PHRASES.map(
      (phrase) => new RegExp(`(?<![\\w-])${inflected(phrase)}(?![\\w-])`, 'gi'),
    ),
    message: (m) => `"${m[0]}" is agency or hype language. Say the specific thing.`,
  },
  {
    rule: 'ai-hype',
    severity: 'warning',
    patterns: [
      /\bAI[- ](?:powered|driven|first)\b/gi,
      /\bpowered by AI\b/gi,
      /\bthe power of AI\b/gi,
      /\bAI magic\b/gi,
      /\b10x\b/gi,
    ],
    message: (m) => `"${m[0]}" sells the tool. Say what the work does and what Miles owned.`,
  },
  {
    rule: 'identity-label',
    severity: 'warning',
    patterns: IDENTITY_LABELS,
    message: (m) =>
      `"${m[0].trim()}" as a label. The identity is Designer & Builder; keep other titles only as accurate past roles.`,
  },
  {
    rule: 'flattened-claim',
    severity: 'warning',
    patterns: [
      /\b(?:help(?:s|ing)?\s+(?:brands|businesses|companies)\s+(?:stand out|grow|succeed)|combin(?:e|es|ing) strategy and creativity|tell(?:s|ing)? compelling stories|bring(?:s|ing)? ideas to life|creat(?:e|es|ing) (?:impactful|meaningful|memorable) experiences|loves? solving problems)\b/gi,
    ],
    message: (m) =>
      `"${m[0]}" is true of any designer. Replace it with what Miles specifically did.`,
  },
  {
    rule: 'years-claim',
    severity: 'warning',
    patterns: [
      /\b(\d{2})(\+)?(?:\s|-)*(?:years?|yrs)\b/gi,
      /\b(?:fifteen|seventeen)(?:-plus)?\s+years\b/gi,
    ],
    skip: (m) => m[1] !== undefined && (Number(m[1]) < 10 || (m[1] === '16' && !m[2])),
    message: (m) =>
      `"${m[0]}". The guide says 16 years. Confirm with Miles before using another figure.`,
  },
  {
    rule: 'claim-number',
    severity: 'info',
    patterns: [
      /(?:[$€£]\s?\d[\d,.]*\s?[kKmMbB]?\b|\b\d[\d,.]*\s?(?:%|percent\b|x\b|[kKmM]\b|(?:users|customers|clients|projects|brands|sites|teams|people|downloads|visitors|hours|days|weeks|months)\b))/g,
    ],
    message: (m) => `"${m[0].trim()}" is a claim. It needs a source in the claim ledger.`,
  },
  {
    rule: 'check-marker',
    severity: ({ target }) => (target === 'cms' ? 'error' : 'info'),
    patterns: [/\[check:[^\]]*\]/gi],
    message: (_m, { target }) =>
      target === 'cms'
        ? 'An open [check: ...] marker. Leave the claim out of the saved draft and list it under Needs checking.'
        : 'Open question for Miles.',
  },
  {
    rule: 'raw-html',
    severity: 'error',
    when: ({ target, kind }) => target === 'cms' && MARKDOWN_KINDS.has(kind),
    patterns: [/<[A-Za-z/!][^>]*>?/g],
    message: () =>
      'The CMS Markdown fields refuse anything shaped like <word>. Write it out in words.',
  },
  {
    rule: 'emoji',
    severity: 'warning',
    patterns: [/\p{Extended_Pictographic}/gu],
    message: () => 'Emoji. The voice is calm and plain.',
  },
  {
    rule: 'exclamation',
    severity: 'warning',
    patterns: [/!(?![![])/g],
    message: () => 'Exclamation mark. Let the specifics carry the energy.',
  },
  {
    rule: 'launch-language',
    severity: 'warning',
    patterns: [/\b(?:thrilled|excited|delighted|humbled|proud) to (?:share|announce)\b/gi],
    message: (m) => `"${m[0]}" is announcement language. Say what was built and why.`,
  },
  {
    rule: 'engagement-bait',
    severity: 'warning',
    patterns: [
      /(?:\bagree\?|\bthoughts\?\s*$|\bcomment (?:yes|below)\b|\bsmash\b|\bdrop a\b.{0,20}\bin the comments\b|\btag someone\b)/gim,
    ],
    message: (m) => `"${m[0].trim()}" asks for engagement instead of earning it.`,
  },
]

/** Contrast frames: one is allowed when it is the clearest option. From sas-site's voice.ts. */
const FRAMES = [
  { name: 'not just X, it is Y', pattern: /\b(?:is|are|was|were|'s)\s+not\s+just\b/i },
  {
    name: 'more than X, it is Y',
    pattern:
      /(?:^|[.!?]\s+)more\s+than\b[^.!?]{1,80}[.!?]\s+(?:it|they|this|that)\s+(?:is|are|was|were|'s)\b/i,
  },
  { name: 'whether you are X or Y', pattern: /\bwhether\s+you(?:\s+are|'re)\b[^.!?]{1,80}\bor\b/i },
  { name: 'we do not just X, we Y', pattern: /\b(?:we|I)\s+(?:do\s+not|don't)\s+just\b/i },
  { name: 'not only X, but also Y', pattern: /\bnot\s+only\b[^.!?]{1,80}\bbut(?:\s+also)?\b/i },
  {
    name: "it's not about X, it's about Y",
    pattern: /\bit'?s not about\b[^.!?]{1,80}\bit'?s about\b/i,
  },
  {
    name: "X wasn't the hard part, Y was",
    pattern: /\b(?:wasn't|was not|isn't|is not)\s+the\s+(?:hard|real|interesting)\s+part\b/i,
  },
]

const CLICHE_OPENERS =
  /^(?:in today's|in a world|ever wondered|have you ever|let's dive|let me tell you|here's the thing|picture this|imagine a world|unpopular opinion|hot take|big news|as a designer,|i'?m (?:so )?(?:excited|thrilled|delighted|humbled|proud|happy) to (?:share|announce))/i
const FILLER = /\b(?:very|really|truly|incredibly|extremely|basically|actually|simply)\b/gi
const FIRST_PERSON = /\b(?:I|I'm|I’m|I've|I’ve|me|my|mine)\b/

const PARAGRAPH_WORDS = 130
const UNIFORM_MIN_SENTENCES = 4
const UNIFORM_SPREAD = 0.1

/** Article shape, from the long-form study in docs/article-voice-study.md. */
const ARTICLE = {
  headingWords: 8,
  sectionEveryWords: 700,
  oneLineShare: 0.25,
  oneLineMinParagraphs: 8,
}
const RECAP_ENDING =
  /^(?:in (?:summary|conclusion|short)|to (?:sum up|wrap up|recap|summarize)|overall,|all in all|that'?s (?:a wrap|it)|so there you have it)/i

/**
 * Checks on the field as a whole. `test` gets the kind's shape and the
 * measures and returns a message when the check fails.
 */
const SHAPE_CHECKS = [
  {
    rule: 'length',
    severity: 'error',
    test: (s, m) =>
      s.hardMaxChars &&
      m.chars > s.hardMaxChars &&
      `${m.chars} characters; the field holds at most ${s.hardMaxChars}.`,
  },
  {
    rule: 'length',
    severity: 'warning',
    test: (s, m) =>
      ((s.maxChars && m.chars > s.maxChars) || (s.minChars && m.chars < s.minChars)) &&
      `${m.chars} characters; aim for ${s.minChars ?? 0} to ${s.maxChars}.`,
  },
  {
    rule: 'length',
    severity: 'warning',
    test: (s, m) =>
      ((s.maxWords && m.words > s.maxWords) || (s.minWords && m.words < s.minWords)) &&
      `${m.words} words; aim for ${s.minWords ?? 0} to ${s.maxWords}.`,
  },
  {
    rule: 'sentences',
    severity: 'warning',
    test: (s, m) =>
      ((s.maxSentences && m.sentences > s.maxSentences) ||
        (s.minSentences && m.sentences < s.minSentences)) &&
      `${m.sentences} sentences; this surface takes ${s.minSentences ?? 1} to ${s.maxSentences}.`,
  },
  {
    rule: 'first-line',
    severity: 'warning',
    test: (s, m) =>
      s.firstLineMaxChars &&
      m.firstLine.length > s.firstLineMaxChars &&
      `First line is ${m.firstLine.length} characters; only about ${s.firstLineMaxChars} show before the fold.`,
  },
  {
    rule: 'hashtags',
    severity: 'warning',
    test: (s, m) =>
      s.maxHashtags &&
      m.hashtags > s.maxHashtags &&
      `${m.hashtags} hashtags; use ${s.maxHashtags} at most, usually none.`,
  },
  {
    rule: 'point-of-view',
    severity: 'warning',
    test: (s, m) =>
      s.noFirstPerson &&
      FIRST_PERSON.test(m.text) &&
      `"${m.text.match(FIRST_PERSON)[0]}" in a third-person surface. Write about Miles, or with no subject.`,
  },
  {
    rule: 'site-name-in-title',
    severity: 'error',
    test: (_s, m) =>
      m.kind === 'metaTitle' &&
      /[|\-:]\s*Miles Roxas\s*$/i.test(m.text) &&
      'The template already appends " | Miles Roxas". Remove the name.',
  },
  {
    rule: 'weak-opener',
    severity: 'warning',
    test: (_s, m) =>
      m.kind === 'cvBullet' &&
      /^(?:responsible for|helped|worked on|assisted|tasked with|involved in)\b/i.test(m.text) &&
      'Open with what Miles did, as a strong verb.',
  },
  {
    rule: 'alt-opener',
    severity: 'warning',
    test: (_s, m) =>
      m.kind === 'altText' &&
      /^(?:an? )?(?:image|picture|photo|screenshot) of\b/i.test(m.text) &&
      'Screen readers already say it is an image. Describe what it shows.',
  },
  {
    rule: 'question',
    severity: 'warning',
    test: (_s, m) =>
      m.kind === 'askSuggestion' &&
      !m.text.endsWith('?') &&
      'An Ask suggestion is a question a visitor would type.',
  },
  {
    rule: 'cliche-opener',
    severity: 'warning',
    test: (_s, m) => {
      const start = m.article?.prose[0] ?? m.text
      const opener = CLICHE_OPENERS.exec(start.replace(/^[^\p{L}]+/u, ''))
      return opener && `Opens with "${opener[0]}". Start with the point.`
    },
  },
  {
    rule: 'question-heading',
    severity: 'warning',
    test: (_s, m) => {
      const asked = m.article?.headings.filter((heading) => heading.endsWith('?')) ?? []
      return (
        asked.length > 0 &&
        `Question headings: "${asked.join('", "')}". Use a label or a claim, and answer in the section's first sentence.`
      )
    },
  },
  {
    rule: 'long-heading',
    severity: 'warning',
    test: (_s, m) => {
      const long = m.article?.headings.filter((h) => words(h).length > ARTICLE.headingWords) ?? []
      return (
        long.length > 0 &&
        `Headings over ${ARTICLE.headingWords} words: "${long.join('", "')}". Put the sentence in the body.`
      )
    },
  },
  {
    rule: 'sections',
    severity: 'info',
    test: (_s, m) =>
      m.article &&
      m.words > ARTICLE.sectionEveryWords &&
      m.article.headings.length < 2 &&
      `${m.words} words with ${m.article.headings.length} section headings. A build story or practice post needs sections; an essay may not.`,
  },
  {
    rule: 'one-line-paragraphs',
    severity: 'warning',
    test: (_s, m) => {
      const prose = m.article?.prose ?? []
      if (prose.length < ARTICLE.oneLineMinParagraphs) return false
      const single = prose.filter((p) => sentencesOf(p).length <= 1).length
      const share = single / prose.length
      return (
        share > ARTICLE.oneLineShare &&
        `${single} of ${prose.length} paragraphs are one sentence. Keep one-liners for the turns; build paragraphs of two to four sentences.`
      )
    },
  },
  {
    rule: 'recap-ending',
    severity: 'warning',
    test: (_s, m) => {
      const last = m.article?.prose.at(-1)
      const recap = last && RECAP_ENDING.exec(last)
      return recap && `Ends with "${recap[0]}". End on what the work implies, not a summary.`
    },
  },
]

/** Headings and prose paragraphs of a Markdown article; the title (#) is not a section heading. */
function articleParts(text) {
  const headings = []
  const prose = []
  for (const { text: block } of paragraphsOf(text)) {
    const line = block.trim()
    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      if (heading[1].length > 1) headings.push(heading[2].replace(/[*_`]/g, '').trim())
    } else if (!standsAlone(line) && !/^!?\[/.test(line)) prose.push(line)
  }
  return { headings, prose }
}

/** Blanks code and URLs to spaces of the same length, so offsets and lines still match the input. */
function maskNonCopy(text) {
  const blank = (match) => match.replace(/[^\n]/g, ' ')
  return text
    .replace(/```[\s\S]*?```/g, blank)
    .replace(/`[^`\n]*`/g, blank)
    .replace(/\bhttps?:\/\/\S+/g, blank)
}

const words = (text) => text.match(/\S+/g) ?? []

const sentencesOf = (text) =>
  text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.?!])\s+(?=[A-Z"'“‘(\d[])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => /[A-Za-z]/.test(sentence))

/** Standard deviation over mean of the sentence lengths, in words. */
function sentenceSpread(text) {
  const lengths = sentencesOf(text).map((sentence) => words(sentence).length)
  if (lengths.length < 2) return { count: lengths.length, spread: 0 }
  const mean = lengths.reduce((sum, n) => sum + n, 0) / lengths.length
  const variance = lengths.reduce((sum, n) => sum + (n - mean) ** 2, 0) / lengths.length
  return { count: lengths.length, spread: mean === 0 ? 0 : Math.sqrt(variance) / mean }
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length

function excerptOf(text, index, length) {
  const start = Math.max(0, index - 30)
  const end = Math.min(text.length, index + length + 30)
  const body = text.slice(start, end).replace(/\s+/g, ' ').trim()
  return `${start > 0 ? '…' : ''}${body}${end < text.length ? '…' : ''}`
}

/** A list item, table row, heading or quote line is a paragraph of its own. */
const standsAlone = (line) => /^\s*(?:[-*+]\s|\d+[.)]\s|\||#{1,6}\s|>)/.test(line)

/** Paragraphs split on blank lines and Markdown block lines, each with its offset in the field. */
function paragraphsOf(text) {
  const found = []
  let current = null
  let offset = 0
  for (const line of text.split('\n')) {
    const alone = standsAlone(line)
    const blank = !line.trim()
    if (blank || alone || !current) {
      if (current) found.push(current)
      current = blank ? null : { text: line, index: offset }
      if (alone) {
        found.push(current)
        current = null
      }
    } else {
      current.text += `\n${line}`
    }
    offset += line.length + 1
  }
  if (current) found.push(current)
  return found
}

/** Positions of every em dash that is not a numeric range (50 to 100K written with a dash). */
function emDashesIn(copy) {
  const found = []
  for (let i = copy.indexOf(EM_DASH); i !== -1; i = copy.indexOf(EM_DASH, i + 1)) {
    const before = /[\d%$€£K]\s?$/.test(copy.slice(Math.max(0, i - 2), i))
    const after = /^\s?[\d$€£]/.test(copy.slice(i + 1, i + 3))
    if (!(before && after)) found.push(i)
  }
  return found
}

function paragraphFindings(paragraph, shape, add) {
  const count = words(paragraph.text).length
  const limit = shape.paragraphWords ?? PARAGRAPH_WORDS
  if (count > limit)
    add(
      'warning',
      'long-paragraph',
      `Paragraph of ${count} words (limit ${limit}). Split or cut it.`,
      paragraph.index,
    )
  const semicolons = (paragraph.text.match(/;/g) ?? []).length
  if (semicolons > 1)
    add(
      'warning',
      'semicolons',
      `${semicolons} semicolons in one paragraph. Prefer periods.`,
      paragraph.index,
    )
  const { count: sentences, spread } = sentenceSpread(paragraph.text)
  if (sentences >= UNIFORM_MIN_SENTENCES && spread < UNIFORM_SPREAD)
    add(
      'warning',
      'uniform-sentences',
      `${sentences} sentences of nearly one length. Vary the rhythm.`,
      paragraph.index,
    )
  const frames = FRAMES.filter(({ pattern }) => pattern.test(paragraph.text))
  for (const { name, pattern } of frames)
    add(
      frames.length > 1 ? 'warning' : 'info',
      'contrast-frame',
      `Contrast frame "${name}". One is allowed when it is the clearest option.`,
      paragraph.index + (pattern.exec(paragraph.text)?.index ?? 0),
    )
  const filler = new Set([...paragraph.text.matchAll(FILLER)].map((m) => m[0].toLowerCase()))
  if (filler.size)
    add(
      'info',
      'filler',
      `Filler: ${[...filler].join(', ')}. Cut unless it carries meaning.`,
      paragraph.index,
    )
}

function patternFindings(copy, context, add) {
  for (const rule of PATTERN_RULES) {
    if (rule.when && !rule.when(context)) continue
    const severity = typeof rule.severity === 'function' ? rule.severity(context) : rule.severity
    for (const pattern of rule.patterns)
      for (const match of copy.matchAll(pattern)) {
        if (rule.skip?.(match)) continue
        add(severity, rule.rule, rule.message(match, context), match.index, match[0].length)
      }
  }
}

function lintField({ path, kind, text }, target) {
  const shape = KINDS[kind]
  const copy = maskNonCopy(text)
  const context = { target, kind }
  const findings = []
  const add = (severity, rule, message, index, length = 0) => {
    const finding = { severity, rule, path, kind, message }
    if (index !== undefined) {
      finding.line = lineOf(text, index)
      finding.excerpt = excerptOf(text, index, length)
    }
    findings.push(finding)
  }

  for (const index of emDashesIn(copy))
    add(
      'error',
      'em-dash',
      'Em dash. Recast with a comma, a colon, parentheses or a period.',
      index,
      1,
    )

  patternFindings(copy, context, add)

  for (const paragraph of paragraphsOf(copy)) paragraphFindings(paragraph, shape, add)

  const trimmed = copy.trim()
  const measures = {
    kind,
    text: trimmed,
    chars: trimmed.length,
    words: words(trimmed).length,
    sentences: sentencesOf(trimmed).length,
    firstLine: trimmed.split('\n')[0].trim(),
    hashtags: (trimmed.match(/(?:^|\s)#[A-Za-z]\w*/g) ?? []).length,
    article: kind === 'article' ? articleParts(trimmed) : null,
  }
  for (const { rule, severity, test } of SHAPE_CHECKS) {
    const message = test(shape, measures)
    if (message) add(severity, rule, message)
  }
  return findings
}

function fieldsFrom(file, kind) {
  const raw = readFileSync(file === '-' ? 0 : file, 'utf8')
  const name = file === '-' ? 'stdin' : file
  if (extname(file).toLowerCase() !== '.json') return [{ path: name, kind, text: raw }]
  const parsed = JSON.parse(raw)
  const list = Array.isArray(parsed) ? parsed : parsed.fields
  if (!Array.isArray(list)) throw new Error(`${name}: expected {"fields": [...]} or an array`)
  return list.map((field, i) => {
    if (typeof field?.text !== 'string')
      throw new Error(`${name}: fields[${i}].text must be a string`)
    const fieldKind = field.kind ?? kind
    if (!KINDS[fieldKind]) throw new Error(`${name}: fields[${i}] has unknown kind "${fieldKind}"`)
    return { path: field.path ?? `${name}#${i}`, kind: fieldKind, text: field.text }
  })
}

function usage(message) {
  if (message) process.stderr.write(`${message}\n\n`)
  const kinds = Object.entries(KINDS)
    .map(([name, { about }]) => `  ${name.padEnd(19)}${about}`)
    .join('\n')
  process.stderr.write(`${HELP.replace('KINDS_PLACEHOLDER', kinds)}\n`)
}

/** Parsed options, or the problem with them. */
function readOptions(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      kind: { type: 'string', default: 'body' },
      target: { type: 'string', default: 'chat' },
      format: { type: 'string', default: 'json' },
      help: { type: 'boolean', short: 'h' },
    },
  })
  const files = positionals.length ? positionals : ['-']
  let problem
  if (!KINDS[values.kind]) problem = `Unknown kind "${values.kind}".`
  else if (!['chat', 'cms'].includes(values.target)) problem = '--target takes chat or cms.'
  else if (!['json', 'text'].includes(values.format)) problem = '--format takes json or text.'
  else if (files.includes('-') && process.stdin.isTTY && !values.help)
    problem = 'No input: pass a file or pipe text in.'
  return { ...values, files, problem }
}

function report(findings, fields, options) {
  const count = (severity) => findings.filter((f) => f.severity === severity).length
  const summary = {
    errors: count('error'),
    warnings: count('warning'),
    info: count('info'),
    fields: fields.length,
  }
  if (options.format === 'json') {
    const ok = summary.errors === 0
    process.stdout.write(
      `${JSON.stringify({ ok, target: options.target, summary, findings }, null, 2)}\n`,
    )
    return summary
  }
  for (const f of findings) {
    const where = f.line ? `${f.path}:${f.line}` : f.path
    const quote = f.excerpt ? `  "${f.excerpt}"` : ''
    process.stdout.write(`${where}  ${f.severity.toUpperCase()}  ${f.rule}  ${f.message}${quote}\n`)
  }
  process.stdout.write(
    `${summary.errors} errors, ${summary.warnings} warnings, ${summary.info} info across ${summary.fields} field(s), target ${options.target}\n`,
  )
  return summary
}

function main() {
  let options
  let fields
  try {
    options = readOptions(process.argv.slice(2))
    if (options.help || options.problem) {
      usage(options.problem)
      return options.problem ? 2 : 0
    }
    fields = options.files.flatMap((file) => fieldsFrom(file, options.kind))
  } catch (error) {
    usage(error.message)
    return 2
  }
  const order = { error: 0, warning: 1, info: 2 }
  const findings = fields
    .flatMap((field) => lintField(field, options.target))
    .sort((a, b) => order[a.severity] - order[b.severity])
  return report(findings, fields, options).errors === 0 ? 0 : 1
}

export { articleParts, KINDS, lintField, maskNonCopy, sentencesOf, words }

// Imported by scripts/bench.mjs; runs only as a CLI. The skill is reached through a symlink.
const invoked = process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href
if (invoked === import.meta.url) process.exitCode = main()
