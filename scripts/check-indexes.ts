import type postgres from 'postgres'
import { withLegacySql } from './lib/legacy-sql'

async function checkIndexes(sql: postgres.Sql) {
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
}

withLegacySql('Error:', checkIndexes)
