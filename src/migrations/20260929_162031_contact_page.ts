import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "contact_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Tell Miles what you’re working on.' NOT NULL,
  	"lead" varchar DEFAULT 'A role, a project, or a question about the work. A few lines is plenty.',
  	"message_placeholder" varchar DEFAULT 'What you’re hiring for or building, and where Miles fits in.',
  	"submit_label" varchar DEFAULT 'Send to Miles',
  	"submit_note" varchar DEFAULT 'Miles replies {responseTime}.',
  	"sent_heading" varchar DEFAULT 'Thanks, {name}. Your message is with Miles.',
  	"sent_body" varchar DEFAULT 'He’ll reply to {email} {responseTime}. A confirmation is on its way to your inbox.',
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "contact_page" CASCADE;`)
}
