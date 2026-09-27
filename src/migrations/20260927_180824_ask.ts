import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Hand-added (composer roadmap, Phase 5): pgvector ships with Neon and the
  // pgvector/pgvector docker image, but the extension still has to be enabled
  // per database before `ask_embeddings` can use the vector type.
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`)
  await db.execute(sql`
   CREATE TYPE "public"."enum_inquiries_type" AS ENUM('project', 'general');
  CREATE TYPE "public"."enum_inquiries_status" AS ENUM('new', 'in-progress', 'replied', 'closed', 'spam');
  CREATE TYPE "public"."enum_inquiries_budget" AS ENUM('under-25k', '25-50k', '50-100k', '100k-plus', 'guidance');
  CREATE TYPE "public"."enum_inquiries_timeline" AS ENUM('asap', '1-3-months', '3-6-months', 'exploring');
  CREATE TYPE "public"."enum_ask_questions_status" AS ENUM('new', 'reviewed', 'content_planned', 'ignored');
  CREATE TYPE "public"."enum_ask_questions_outcome" AS ENUM('answered', 'partial', 'no_sources', 'chat_only', 'stopped', 'error');
  CREATE TYPE "public"."enum_ask_questions_rating" AS ENUM('up', 'down');
  CREATE TYPE "public"."enum_ask_questions_rating_reason" AS ENUM('wrong', 'incomplete', 'off_topic');
  CREATE TYPE "public"."enum_ask_questions_handoff" AS ENUM('clicked', 'inquiry_sent');
  CREATE TYPE "public"."enum_ask_questions_handoff_reason" AS ENUM('estimate', 'project', 'person', 'contact_details', 'no_answer', 'case_study');
  CREATE TYPE "public"."enum_ask_questions_retrieval" AS ENUM('embedding', 'keyword', 'none');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'askQuestionRetention' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'askQuestionRetention' BEFORE 'schedulePublish';
  CREATE TABLE "ask_embeddings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"collection" varchar NOT NULL,
  	"doc_id" integer NOT NULL,
  	"chunk_index" integer NOT NULL,
  	"title" text NOT NULL,
  	"slug" varchar NOT NULL,
  	"heading_path" text,
  	"text" text NOT NULL,
  	"embedding" vector(1536) NOT NULL,
  	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inquiries_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar NOT NULL,
  	"author_id" integer,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar,
  	"type" "enum_inquiries_type" DEFAULT 'general' NOT NULL,
  	"status" "enum_inquiries_status" DEFAULT 'new' NOT NULL,
  	"assigned_to_id" integer,
  	"ask_conversation" varchar,
  	"submitted_at" timestamp(3) with time zone,
  	"replied_at" timestamp(3) with time zone,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"company" varchar,
  	"website" varchar,
  	"budget" "enum_inquiries_budget",
  	"timeline" "enum_inquiries_timeline",
  	"message" varchar NOT NULL,
  	"source_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ask_questions_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"similarity" numeric
  );
  
  CREATE TABLE "ask_questions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar,
  	"note" varchar,
  	"status" "enum_ask_questions_status" DEFAULT 'new' NOT NULL,
  	"topic_id" integer,
  	"outcome" "enum_ask_questions_outcome",
  	"rating" "enum_ask_questions_rating",
  	"rating_reason" "enum_ask_questions_rating_reason",
  	"handoff" "enum_ask_questions_handoff",
  	"handoff_reason" "enum_ask_questions_handoff_reason",
  	"page_path" varchar,
  	"follow_up" boolean DEFAULT false,
  	"retrieval" "enum_ask_questions_retrieval",
  	"latency_ms" numeric,
  	"input_tokens" numeric,
  	"output_tokens" numeric,
  	"conversation" varchar,
  	"turn" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ask_questions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"pages_id" integer
  );
  
  CREATE TABLE "site_info_social_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_info" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar DEFAULT 'Miles Roxas' NOT NULL,
  	"legal_name" varchar,
  	"tagline" varchar,
  	"description" varchar,
  	"founding_year" numeric,
  	"contact_email" varchar DEFAULT 'miles@milesroxas.com',
  	"inquiries_response_time" varchar DEFAULT 'within 2 business days',
  	"inquiries_schedule_url" varchar,
  	"ask_hidden" boolean DEFAULT false,
  	"address_street_address" varchar,
  	"address_city" varchar,
  	"address_state" varchar,
  	"address_postal_code" varchar,
  	"address_country" varchar,
  	"llms_notes" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "search_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN "works_id" integer;
  ALTER TABLE "payload_jobs" ADD COLUMN "meta" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inquiries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ask_questions_id" integer;
  ALTER TABLE "inquiries_notes" ADD CONSTRAINT "inquiries_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inquiries_notes" ADD CONSTRAINT "inquiries_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ask_questions_sources" ADD CONSTRAINT "ask_questions_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ask_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ask_questions" ADD CONSTRAINT "ask_questions_topic_id_categories_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ask_questions_rels" ADD CONSTRAINT "ask_questions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ask_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ask_questions_rels" ADD CONSTRAINT "ask_questions_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ask_questions_rels" ADD CONSTRAINT "ask_questions_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_info_social_profiles" ADD CONSTRAINT "site_info_social_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_info"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "ask_embeddings_doc_chunk_idx" ON "ask_embeddings" USING btree ("collection","doc_id","chunk_index");
  CREATE INDEX "ask_embeddings_doc_idx" ON "ask_embeddings" USING btree ("collection","doc_id");
  CREATE INDEX "ask_embeddings_embedding_idx" ON "ask_embeddings" USING hnsw ("embedding" vector_cosine_ops);
  CREATE INDEX "inquiries_notes_order_idx" ON "inquiries_notes" USING btree ("_order");
  CREATE INDEX "inquiries_notes_parent_id_idx" ON "inquiries_notes" USING btree ("_parent_id");
  CREATE INDEX "inquiries_notes_author_idx" ON "inquiries_notes" USING btree ("author_id");
  CREATE UNIQUE INDEX "inquiries_reference_idx" ON "inquiries" USING btree ("reference");
  CREATE INDEX "inquiries_type_idx" ON "inquiries" USING btree ("type");
  CREATE INDEX "inquiries_status_idx" ON "inquiries" USING btree ("status");
  CREATE INDEX "inquiries_assigned_to_idx" ON "inquiries" USING btree ("assigned_to_id");
  CREATE INDEX "inquiries_ask_conversation_idx" ON "inquiries" USING btree ("ask_conversation");
  CREATE INDEX "inquiries_submitted_at_idx" ON "inquiries" USING btree ("submitted_at");
  CREATE INDEX "inquiries_email_idx" ON "inquiries" USING btree ("email");
  CREATE INDEX "inquiries_updated_at_idx" ON "inquiries" USING btree ("updated_at");
  CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");
  CREATE INDEX "ask_questions_sources_order_idx" ON "ask_questions_sources" USING btree ("_order");
  CREATE INDEX "ask_questions_sources_parent_id_idx" ON "ask_questions_sources" USING btree ("_parent_id");
  CREATE INDEX "ask_questions_status_idx" ON "ask_questions" USING btree ("status");
  CREATE INDEX "ask_questions_topic_idx" ON "ask_questions" USING btree ("topic_id");
  CREATE INDEX "ask_questions_outcome_idx" ON "ask_questions" USING btree ("outcome");
  CREATE INDEX "ask_questions_rating_idx" ON "ask_questions" USING btree ("rating");
  CREATE INDEX "ask_questions_handoff_idx" ON "ask_questions" USING btree ("handoff");
  CREATE INDEX "ask_questions_page_path_idx" ON "ask_questions" USING btree ("page_path");
  CREATE INDEX "ask_questions_conversation_idx" ON "ask_questions" USING btree ("conversation");
  CREATE INDEX "ask_questions_turn_idx" ON "ask_questions" USING btree ("turn");
  CREATE INDEX "ask_questions_updated_at_idx" ON "ask_questions" USING btree ("updated_at");
  CREATE INDEX "ask_questions_created_at_idx" ON "ask_questions" USING btree ("created_at");
  CREATE INDEX "ask_questions_rels_order_idx" ON "ask_questions_rels" USING btree ("order");
  CREATE INDEX "ask_questions_rels_parent_idx" ON "ask_questions_rels" USING btree ("parent_id");
  CREATE INDEX "ask_questions_rels_path_idx" ON "ask_questions_rels" USING btree ("path");
  CREATE INDEX "ask_questions_rels_posts_id_idx" ON "ask_questions_rels" USING btree ("posts_id");
  CREATE INDEX "ask_questions_rels_pages_id_idx" ON "ask_questions_rels" USING btree ("pages_id");
  CREATE INDEX "site_info_social_profiles_order_idx" ON "site_info_social_profiles" USING btree ("_order");
  CREATE INDEX "site_info_social_profiles_parent_id_idx" ON "site_info_social_profiles" USING btree ("_parent_id");
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_works_fk" FOREIGN KEY ("works_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ask_questions_fk" FOREIGN KEY ("ask_questions_id") REFERENCES "public"."ask_questions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "search_rels_pages_id_idx" ON "search_rels" USING btree ("pages_id");
  CREATE INDEX "search_rels_works_id_idx" ON "search_rels" USING btree ("works_id");
  CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_ask_questions_id_idx" ON "payload_locked_documents_rels" USING btree ("ask_questions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ask_embeddings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inquiries_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inquiries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ask_questions_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ask_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ask_questions_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_info_social_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_stats" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "ask_embeddings" CASCADE;
  DROP TABLE "inquiries_notes" CASCADE;
  DROP TABLE "inquiries" CASCADE;
  DROP TABLE "ask_questions_sources" CASCADE;
  DROP TABLE "ask_questions" CASCADE;
  DROP TABLE "ask_questions_rels" CASCADE;
  DROP TABLE "site_info_social_profiles" CASCADE;
  DROP TABLE "site_info" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_pages_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_works_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_inquiries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ask_questions_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "search_rels_pages_id_idx";
  DROP INDEX "search_rels_works_id_idx";
  DROP INDEX "payload_locked_documents_rels_inquiries_id_idx";
  DROP INDEX "payload_locked_documents_rels_ask_questions_id_idx";
  ALTER TABLE "search_rels" DROP COLUMN "pages_id";
  ALTER TABLE "search_rels" DROP COLUMN "works_id";
  ALTER TABLE "payload_jobs" DROP COLUMN "meta";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "inquiries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ask_questions_id";
  DROP TYPE "public"."enum_inquiries_type";
  DROP TYPE "public"."enum_inquiries_status";
  DROP TYPE "public"."enum_inquiries_budget";
  DROP TYPE "public"."enum_inquiries_timeline";
  DROP TYPE "public"."enum_ask_questions_status";
  DROP TYPE "public"."enum_ask_questions_outcome";
  DROP TYPE "public"."enum_ask_questions_rating";
  DROP TYPE "public"."enum_ask_questions_rating_reason";
  DROP TYPE "public"."enum_ask_questions_handoff";
  DROP TYPE "public"."enum_ask_questions_handoff_reason";
  DROP TYPE "public"."enum_ask_questions_retrieval";`)
}
