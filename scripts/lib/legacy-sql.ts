import { resolve } from 'node:path'
import { config } from 'dotenv'
import postgres from 'postgres'

/**
 * Runs one of the legacy recovery scripts (MIGRATIONS.md) against
 * `POSTGRES_URL`, falling back to `.env.local` when the shell does not set it.
 * The connection closes when the task ends; an error is logged under
 * `errorLabel` and exits 1.
 */
export async function withLegacySql(
  errorLabel: string,
  task: (sql: postgres.Sql) => Promise<void>,
) {
  config({ path: resolve(process.cwd(), '.env.local') })

  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL environment variable is required')
    process.exit(1)
  }

  const sql = postgres(process.env.POSTGRES_URL)

  try {
    await task(sql)
    await sql.end()
  } catch (error) {
    console.error(errorLabel, error)
    await sql.end()
    process.exit(1)
  }
}
