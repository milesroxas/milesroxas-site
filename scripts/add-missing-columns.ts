import { resolve } from 'node:path'
import { config } from 'dotenv'
import postgres from 'postgres'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const dbUrl = process.env.POSTGRES_URL

if (!dbUrl) {
  console.error('POSTGRES_URL environment variable is required')
  process.exit(1)
}

const sql = postgres(dbUrl)

async function addMissingColumns() {
  try {
    console.log('Adding missing meta_no_index columns...')

    await sql.unsafe(`
      ALTER TABLE pages ADD COLUMN IF NOT EXISTS meta_no_index boolean DEFAULT false;
      ALTER TABLE _pages_v ADD COLUMN IF NOT EXISTS version_meta_no_index boolean DEFAULT false;
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_no_index boolean DEFAULT false;
      ALTER TABLE _posts_v ADD COLUMN IF NOT EXISTS version_meta_no_index boolean DEFAULT false;
      ALTER TABLE works ADD COLUMN IF NOT EXISTS meta_no_index boolean DEFAULT false;
      ALTER TABLE _works_v ADD COLUMN IF NOT EXISTS version_meta_no_index boolean DEFAULT false;
    `)

    console.log('✅ Successfully added missing columns')
    await sql.end()
  } catch (error) {
    console.error('❌ Error adding columns:', error)
    await sql.end()
    process.exit(1)
  }
}

addMissingColumns()
