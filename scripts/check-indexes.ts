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

async function checkIndexes() {
  try {
    console.log('Checking for slider-related indexes...\n')

    const indexes = await sql`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE tablename LIKE 'pages%'
      AND indexname LIKE '%slider%'
      ORDER BY indexname
    `

    console.log('Found indexes:')
    for (const idx of indexes) {
      console.log(`  ${idx.tablename}.${idx.indexname}`)
    }

    console.log('\nChecking if old indexes still exist (should have been dropped):')
    const oldIndexes = await sql`
      SELECT indexname
      FROM pg_indexes
      WHERE indexname IN (
        'pages_blocks_content_columns_slider_slides_slide_slide_i_idx',
        'pages_blocks_content_columns_slider_slides_slide_slide_image_idx'
      )
    `

    if (oldIndexes.length > 0) {
      console.log('❌ Old indexes still exist - migration issue!')
      for (const idx of oldIndexes) {
        console.log(`  - ${idx.indexname}`)
      }
    } else {
      console.log('✅ Old indexes have been dropped')
    }

    await sql.end()
  } catch (error) {
    console.error('Error:', error)
    await sql.end()
    process.exit(1)
  }
}

checkIndexes()
