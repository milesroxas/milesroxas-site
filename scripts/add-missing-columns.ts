import type postgres from 'postgres'
import { withLegacySql } from './lib/legacy-sql'

async function addMissingColumns(sql: postgres.Sql) {
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
}

withLegacySql('❌ Error adding columns:', addMissingColumns)
