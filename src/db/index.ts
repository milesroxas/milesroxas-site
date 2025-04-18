import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

// Database connection string from environment variable
const connectionString =
  process.env.DATABASE_URI || 'postgres://postgres:postgres@localhost:5432/postgres'

// Create postgres client
const client = postgres(connectionString)

// Create drizzle client
export const db = drizzle(client)
