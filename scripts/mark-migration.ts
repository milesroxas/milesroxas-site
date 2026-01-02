import { resolve } from 'node:path'
import { config } from 'dotenv'
import postgres from 'postgres'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const migrationName = process.argv[2]

if (!migrationName) {
  console.error('Usage: npx tsx scripts/mark-migration.ts <migration-name>')
  console.error('Example: npx tsx scripts/mark-migration.ts 20250801_201804')
  process.exit(1)
}

if (!process.env.POSTGRES_URL) {
  console.error('POSTGRES_URL environment variable is required')
  console.error('Make sure it exists in .env.local')
  process.exit(1)
}

const sql = postgres(process.env.POSTGRES_URL)

async function markMigrationAsRun() {
  try {
    // Check if migration already exists
    const existing = await sql`
      SELECT * FROM payload_migrations WHERE name = ${migrationName}
    `

    if (existing.length > 0) {
      console.log(`Migration ${migrationName} is already marked as run`)
      await sql.end()
      return
    }

    // Get the current highest batch number
    const result = await sql`
      SELECT COALESCE(MAX(batch), 0) as max_batch FROM payload_migrations
    `
    const currentBatch = result[0].max_batch as number

    // Insert the migration record
    await sql`
      INSERT INTO payload_migrations (name, batch, created_at, updated_at)
      VALUES (${migrationName}, ${currentBatch}, NOW(), NOW())
    `

    console.log(`✅ Successfully marked migration ${migrationName} as run in batch ${currentBatch}`)
    await sql.end()
  } catch (error) {
    console.error('Error marking migration:', error)
    await sql.end()
    process.exit(1)
  }
}

markMigrationAsRun()
