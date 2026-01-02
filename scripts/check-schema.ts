import { resolve } from 'node:path'
import { config } from 'dotenv'
import postgres from 'postgres'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

if (!process.env.POSTGRES_URL) {
  console.error('POSTGRES_URL environment variable is required')
  process.exit(1)
}

const sql = postgres(process.env.POSTGRES_URL)

async function checkSchema() {
  try {
    console.log('Checking pages table schema...\n')

    // Check if pages table exists
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'pages%'
      ORDER BY table_name
    `

    console.log('Pages-related tables:')
    for (const table of tables) {
      console.log(`  - ${table.table_name}`)
    }

    console.log('\nPages table columns:')
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'pages'
      ORDER BY ordinal_position
    `

    for (const col of columns) {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`)
    }

    console.log('\nChecking for _status column...')
    const statusCol = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'pages'
      AND column_name = '_status'
    `

    if (statusCol.length > 0) {
      console.log('✅ _status column exists')
    } else {
      console.log('❌ _status column is MISSING - this is the problem!')
    }

    await sql.end()
  } catch (error) {
    console.error('Error checking schema:', error)
    await sql.end()
    process.exit(1)
  }
}

checkSchema()
