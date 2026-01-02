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

async function fixIndexes() {
  try {
    console.log('Fixing index name conflicts...\n')

    // Drop old shortened index names and recreate with full names
    const indexFixes = [
      {
        old: 'pages_blocks_content_columns_slider_slides_slide_slide_i_idx',
        new: 'pages_blocks_content_columns_slider_slides_slide_slide_image_idx',
        table: 'pages_blocks_content_columns_slider_slides',
        column: 'slide_image_id',
      },
    ]

    for (const fix of indexFixes) {
      console.log(`Checking ${fix.old}...`)

      // Check if old index exists
      const oldExists = await sql`
        SELECT indexname FROM pg_indexes WHERE indexname = ${fix.old}
      `

      // Check if new index exists
      const newExists = await sql`
        SELECT indexname FROM pg_indexes WHERE indexname = ${fix.new}
      `

      if (oldExists.length > 0) {
        console.log(`  Dropping old index: ${fix.old}`)
        await sql.unsafe(`DROP INDEX IF EXISTS "${fix.old}"`)
      }

      if (newExists.length === 0) {
        console.log(`  Creating new index: ${fix.new}`)
        await sql.unsafe(
          `CREATE INDEX "${fix.new}" ON "${fix.table}" USING btree ("${fix.column}")`,
        )
      } else {
        console.log(`  ✅ New index already exists: ${fix.new}`)
      }
    }

    console.log('\n✅ Index fixes completed')
    await sql.end()
  } catch (error) {
    console.error('Error fixing indexes:', error)
    await sql.end()
    process.exit(1)
  }
}

fixIndexes()
