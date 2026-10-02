import path from 'node:path'
import { Box, type Key, Text, useApp, useInput } from 'ink'
import Spinner from 'ink-spinner'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { LOCAL_POSTGRES_DB, PROJECT_ROOT, VERCEL_PULL_ENV_FILE } from './constants'
import { backupLocalDatabase, syncProductionToLocal } from './db-sync'
import {
  assertPostgresUrl,
  maskPostgresUrlForDisplay,
  productionEnvExists,
  readAppPostgresUrl,
  readProductionUrls,
} from './env'
import { checkVercelCli, ensureLocalPostgresReady } from './prereqs'
import { runPnpmCapture, runPnpmScript, runVercelEnvPull } from './run'

type Phase =
  | { kind: 'menu' }
  | { kind: 'running'; label: string }
  | { kind: 'done'; ok: boolean; output: string }
  | { kind: 'confirm'; title: string; danger: boolean; onYes: () => void }

type Stack = 'main' | 'db' | 'payload' | 'quality'

type ActionId =
  | 'dev-default'
  | 'dev-local'
  | 'dev-prod'
  | 'import-prod'
  | 'menu-db'
  | 'menu-payload'
  | 'menu-quality'
  | 'build'
  | 'start'
  | 'prod-style'
  | 'exit'
  | 'back'
  | 'db-up'
  | 'db-down'
  | 'db-backup'
  | 'env-pull'
  | 'gen-types'
  | 'gen-importmap'
  | 'migrate-create'
  | 'check'
  | 'lint-ci'
  | 'test-storybook'

type MenuItem = { id: ActionId; label: string; hint?: string }

const MENU: Record<Stack, MenuItem[]> = {
  main: [
    {
      id: 'dev-default',
      label: 'Dev server — default env',
      hint: 'POSTGRES_URL from your .env chain (see footer)',
    },
    {
      id: 'dev-local',
      label: 'Dev server — local Docker DB',
      hint: `forces ${LOCAL_POSTGRES_DB}; starts the container if needed`,
    },
    {
      id: 'dev-prod',
      label: 'Dev server — production DB',
      hint: `reads ${VERCEL_PULL_ENV_FILE}; schema push disabled`,
    },
    {
      id: 'import-prod',
      label: 'Pull production content → local Docker DB',
      hint: 'pg_dump production, parallel restore into Docker (local data is NOT backed up)',
    },
    { id: 'menu-db', label: 'Database…' },
    { id: 'menu-payload', label: 'Payload…' },
    { id: 'menu-quality', label: 'Quality…' },
    { id: 'build', label: 'Build (pnpm build)' },
    { id: 'start', label: 'Start production build (pnpm start)' },
    { id: 'prod-style', label: 'Full prod-style run (pnpm dev:prod)' },
    { id: 'exit', label: 'Exit' },
  ],
  db: [
    { id: 'db-up', label: 'Docker: start Postgres (pnpm db:up)' },
    { id: 'db-down', label: 'Docker: stop compose (pnpm db:down)' },
    {
      id: 'db-backup',
      label: 'Back up local Docker DB → .dev-tui/local-backup.dump',
      hint: 'run before pulling production if local has work worth keeping',
    },
    {
      id: 'env-pull',
      label: `Pull Vercel production env → ${VERCEL_PULL_ENV_FILE}`,
      hint: 'force a re-pull; prod-DB options auto-pull when the file is missing',
    },
    { id: 'back', label: '← Back' },
  ],
  payload: [
    { id: 'gen-types', label: 'Generate TypeScript types (pnpm generate:types)' },
    { id: 'gen-importmap', label: 'Generate admin import map (pnpm generate:importmap)' },
    { id: 'migrate-create', label: 'Create migration from schema diff (pnpm migrate:create)' },
    { id: 'back', label: '← Back' },
  ],
  quality: [
    { id: 'check', label: 'Lint + format with fixes (pnpm check)' },
    { id: 'lint-ci', label: 'Lint + format check, no fixes (pnpm lint:ci)' },
    { id: 'test-storybook', label: 'Storybook tests (pnpm test:storybook)' },
    { id: 'back', label: '← Back' },
  ],
}

/** What an action can do to the TUI. `App` owns the state behind it. */
type Ui = {
  setPhase: (phase: Phase) => void
  /** Hand the terminal to a long-running pnpm script and leave the TUI. */
  launchScript: (script: string, env?: Record<string, string>) => void
  enterMenu: (menu: Stack) => void
  goBack: () => void
  exit: () => void
}

type ProductionUrls = { runtimeUrl: string; dumpUrl: string; payloadSecret?: string }

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e))

/** Unmounts the TUI, then runs the script with the terminal to itself. */
function handOff(unmount: () => void, script: string, env?: Record<string, string>) {
  unmount()
  queueMicrotask(() => {
    void runPnpmScript(script, env).catch((e) => {
      console.error(e)
      process.exitCode = 1
    })
  })
}

async function runCapture(ui: Ui, label: string, args: string[]) {
  ui.setPhase({ kind: 'running', label })
  const r = await runPnpmCapture(args)
  const out = [r.stdout, r.stderr].filter(Boolean).join('\n').trim()
  const ok = r.exitCode === 0
  ui.setPhase({
    kind: 'done',
    ok,
    output: out || (ok ? '(no output)' : `Exit code ${r.exitCode ?? 'unknown'}`),
  })
}

/** Starts the local Docker Postgres; false, with the failure shown, when it does not come up. */
async function startLocalPostgres(ui: Ui): Promise<boolean> {
  ui.setPhase({ kind: 'running', label: 'Starting local Postgres (Docker)…' })
  const ready = await ensureLocalPostgresReady()
  if (!ready.ok) ui.setPhase({ kind: 'done', ok: false, output: ready.message })
  return ready.ok
}

async function executeSync(ui: Ui, postgresUrl: string) {
  const errUrl = assertPostgresUrl(postgresUrl)
  if (errUrl) {
    ui.setPhase({ kind: 'done', ok: false, output: errUrl })
    return
  }
  if (!(await startLocalPostgres(ui))) return
  ui.setPhase({ kind: 'running', label: 'Dumping production + restoring local…' })
  const result = await syncProductionToLocal(postgresUrl)
  ui.setPhase({ kind: 'done', ok: result.ok, output: result.messages.join('\n') })
}

/**
 * Resolve the production connection URLs, pulling the Vercel env file first
 * if it does not exist yet. Sets a failure phase and returns null when the
 * vercel CLI is missing or the pull/read fails. Never refreshes an existing
 * file — use the "Pull Vercel production env" menu entry to force a re-pull
 * after credential rotation.
 */
async function ensureProductionUrls(ui: Ui): Promise<ProductionUrls | null> {
  if (!(await productionEnvExists())) {
    const v = await checkVercelCli()
    if (!v.ok) {
      ui.setPhase({ kind: 'done', ok: false, output: v.message })
      return null
    }
    ui.setPhase({ kind: 'running', label: `Pulling production env → ${VERCEL_PULL_ENV_FILE}…` })
    try {
      await runVercelEnvPull(VERCEL_PULL_ENV_FILE)
    } catch (e) {
      ui.setPhase({ kind: 'done', ok: false, output: errorMessage(e) })
      return null
    }
  }
  const r = await readProductionUrls()
  if ('error' in r) {
    ui.setPhase({ kind: 'done', ok: false, output: r.error })
    return null
  }
  return r
}

async function devLocal(ui: Ui) {
  if (!(await startLocalPostgres(ui))) return
  ui.launchScript('dev', { POSTGRES_URL: LOCAL_POSTGRES_DB })
}

async function devProduction(ui: Ui) {
  ui.setPhase({ kind: 'running', label: 'Reading production env…' })
  const r = await ensureProductionUrls(ui)
  if (!r) return
  ui.setPhase({
    kind: 'confirm',
    danger: true,
    title:
      `Run next dev against PRODUCTION (${maskPostgresUrlForDisplay(r.runtimeUrl)})? ` +
      'Admin-panel writes hit real production data. Schema push is disabled for this run (PAYLOAD_DB_PUSH=false).',
    onYes: () =>
      ui.launchScript('dev', {
        POSTGRES_URL: r.runtimeUrl,
        PAYLOAD_DB_PUSH: 'false',
        // Production content is encrypted/signed with production's secret.
        ...(r.payloadSecret ? { PAYLOAD_SECRET: r.payloadSecret } : {}),
      }),
  })
}

function importProduction(ui: Ui) {
  ui.setPhase({
    kind: 'confirm',
    danger: true,
    title:
      'Replace the local Docker `payload` database with a dump from production? ' +
      'The production URL is read (or pulled) automatically. ' +
      'Local data is overwritten and NOT backed up — use Database → Back up local Docker DB ' +
      'first if you need it. Env files are not changed.',
    onYes: () => {
      void (async () => {
        const r = await ensureProductionUrls(ui)
        if (!r) return
        await executeSync(ui, r.dumpUrl)
      })()
    },
  })
}

async function backupLocal(ui: Ui) {
  if (!(await startLocalPostgres(ui))) return
  ui.setPhase({ kind: 'running', label: 'Dumping local Docker DB…' })
  const result = await backupLocalDatabase()
  ui.setPhase({ kind: 'done', ok: result.ok, output: result.messages.join('\n') })
}

async function pullProductionEnv(ui: Ui) {
  const v = await checkVercelCli()
  if (!v.ok) {
    ui.setPhase({ kind: 'done', ok: false, output: v.message })
    return
  }
  ui.setPhase({ kind: 'running', label: 'vercel env pull' })
  try {
    await runVercelEnvPull(VERCEL_PULL_ENV_FILE)
    ui.setPhase({
      kind: 'done',
      ok: true,
      output: `Wrote ${path.join(PROJECT_ROOT, VERCEL_PULL_ENV_FILE)}`,
    })
  } catch (e) {
    ui.setPhase({ kind: 'done', ok: false, output: errorMessage(e) })
  }
}

/** Runs `pnpm run <script>` and shows its output under `label`. */
const capture = (label: string, script: string) => (ui: Ui) =>
  runCapture(ui, label, ['run', script])

const launch = (script: string) => (ui: Ui) => ui.launchScript(script)

const ACTIONS: Record<ActionId, (ui: Ui) => unknown> = {
  'dev-default': launch('dev'),
  'dev-local': devLocal,
  'dev-prod': devProduction,
  'import-prod': importProduction,
  'menu-db': (ui) => ui.enterMenu('db'),
  'menu-payload': (ui) => ui.enterMenu('payload'),
  'menu-quality': (ui) => ui.enterMenu('quality'),
  build: capture('pnpm build', 'build'),
  start: launch('start'),
  'prod-style': launch('dev:prod'),
  exit: (ui) => ui.exit(),
  back: (ui) => ui.goBack(),
  'db-up': capture('pnpm db:up', 'db:up'),
  'db-down': capture('pnpm db:down', 'db:down'),
  'db-backup': backupLocal,
  'env-pull': pullProductionEnv,
  'gen-types': capture('generate:types', 'generate:types'),
  'gen-importmap': capture('generate:importmap', 'generate:importmap'),
  // Only ever create migration files locally — never apply them. The dev DB
  // runs Drizzle push, and Payload forbids mixing push with `migrate` on the
  // same database. Migrations apply only in CI (`pnpm ci`) against
  // production. See MIGRATIONS.md.
  'migrate-create': capture('migrate:create', 'migrate:create'),
  check: capture('check', 'check'),
  'lint-ci': capture('lint:ci', 'lint:ci'),
  'test-storybook': capture('test:storybook', 'test:storybook'),
}

/** Up (-1) or down (1) for the arrow keys and vim's k and j; 0 for any other key. */
const menuStep = (input: string, key: Key): -1 | 0 | 1 => {
  if (key.upArrow || (input === 'k' && !key.meta)) return -1
  if (key.downArrow || (input === 'j' && !key.meta)) return 1
  return 0
}

/** Keys on the done and confirm screens; the running screen takes none. */
const handlePhaseKey = (phase: Phase, key: Key, setPhase: (phase: Phase) => void) => {
  if (phase.kind === 'done') {
    if (key.return) setPhase({ kind: 'menu' })
    return
  }
  if (phase.kind !== 'confirm') return
  if (key.escape) setPhase({ kind: 'menu' })
  else if (key.return) phase.onYes()
}

/** The database the default env chain points at, re-read on every return to the menu. */
function useDbFooter(phaseKind: Phase['kind']): string[] {
  const [dbFooter, setDbFooter] = useState<string[]>([])

  useEffect(() => {
    if (phaseKind !== 'menu') return
    let cancelled = false
    void (async () => {
      const r = await readAppPostgresUrl()
      if (cancelled) return
      if ('error' in r) {
        setDbFooter([`Default-env DB: unknown — ${r.error}`])
        return
      }
      const kind = r.url === LOCAL_POSTGRES_DB ? 'local Docker' : 'remote'
      setDbFooter([
        `Default-env DB (${kind}, from ${r.source}): ${maskPostgresUrlForDisplay(r.url)}`,
        'The local/production dev entries override this per-run without editing files.',
      ])
    })()
    return () => {
      cancelled = true
    }
  }, [phaseKind])

  return dbFooter
}

function PhaseScreen({ phase }: { phase: Exclude<Phase, { kind: 'menu' }> }) {
  if (phase.kind === 'running') {
    return (
      <Box flexDirection="column">
        <Text color="cyan">
          <Spinner type="dots" /> {phase.label}
        </Text>
      </Box>
    )
  }

  if (phase.kind === 'done') {
    return (
      <Box flexDirection="column">
        <Text bold color={phase.ok ? 'green' : 'red'}>
          {phase.ok ? 'Done' : 'Failed'}
        </Text>
        <Text>{phase.output}</Text>
        <Box marginTop={1}>
          <Text dimColor>Enter — back to menu</Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Text bold color={phase.danger ? 'red' : 'yellow'}>
        Confirm
      </Text>
      <Text>{phase.title}</Text>
      <Box marginTop={1}>
        <Text dimColor>Enter — yes · Esc — cancel</Text>
      </Box>
    </Box>
  )
}

function MenuScreen({
  title,
  items,
  selected,
  footer,
}: {
  title: string
  items: MenuItem[]
  selected: number
  footer: string[]
}) {
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          {title}
        </Text>
      </Box>
      {items.map((item, i) => {
        const prefix = i === selected ? '❯ ' : '  '
        const line = item.hint ? `${item.label} — ${item.hint}` : item.label
        return (
          <Text key={item.id} color={i === selected ? 'cyan' : undefined}>
            {prefix}
            {line}
          </Text>
        )
      })}
      <Box marginTop={1} flexDirection="column">
        <Text dimColor>↑/↓ or j/k · Enter · Esc back · q quit</Text>
        {footer.map((line) => (
          <Text key={line} dimColor>
            {line}
          </Text>
        ))}
      </Box>
    </Box>
  )
}

export function App({ unmount }: { unmount: () => void }) {
  const { exit } = useApp()
  const [stack, setStack] = useState<Stack[]>(['main'])
  const [selected, setSelected] = useState(0)
  const [phase, setPhase] = useState<Phase>({ kind: 'menu' })
  const dbFooter = useDbFooter(phase.kind)

  const current = stack[stack.length - 1]
  const items = MENU[current]
  const max = items.length - 1

  const goBack = useCallback(() => {
    setSelected(0)
    setStack((s) => (s.length <= 1 ? s : s.slice(0, -1)))
  }, [])

  const enterMenu = useCallback((menu: Stack) => {
    setStack((s) => [...s, menu])
    setSelected(0)
  }, [])

  const ui = useMemo<Ui>(
    () => ({
      setPhase,
      launchScript: (script, env) => handOff(unmount, script, env),
      enterMenu,
      goBack,
      exit,
    }),
    [unmount, enterMenu, goBack, exit],
  )

  useInput((input, key) => {
    if (phase.kind !== 'menu') {
      handlePhaseKey(phase, key, setPhase)
      return
    }
    const step = menuStep(input, key)
    if (step) {
      setSelected((s) => (step < 0 ? Math.max(0, s - 1) : Math.min(max, s + 1)))
      return
    }
    if (key.return) {
      void ACTIONS[items[selected].id](ui)
      return
    }
    if (key.escape) {
      if (stack.length > 1) goBack()
      return
    }
    if (input === 'q' && stack.length === 1) exit()
  })

  const title = stack.length === 1 ? 'milesroxas — dev' : `milesroxas — ${current}`

  if (phase.kind !== 'menu') return <PhaseScreen phase={phase} />
  return <MenuScreen title={title} items={items} selected={selected} footer={dbFooter} />
}
