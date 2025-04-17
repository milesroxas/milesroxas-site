// @ts-ignore: No type declarations for 'pg'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
})

export const db = drizzle(pool)
