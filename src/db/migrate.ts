import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URI!
const sql = postgres(connectionString, { max: 1 })
const db = drizzle(sql)

async function main() {
  try {
    console.log('Migration started')
    await migrate(db, { migrationsFolder: 'drizzle' })
    console.log('Migration completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed', error)
    process.exit(1)
  }
}

main()
