import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  -- Create enum types for media_aspect_ratio if they don't exist
  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_pages_blocks_content_columns_media_aspect_ratio') THEN
      CREATE TYPE "public"."enum_pages_blocks_content_columns_media_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum__pages_v_blocks_content_columns_media_aspect_ratio') THEN
      CREATE TYPE "public"."enum__pages_v_blocks_content_columns_media_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_works_blocks_content_columns_media_aspect_ratio') THEN
      CREATE TYPE "public"."enum_works_blocks_content_columns_media_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum__works_v_blocks_content_columns_media_aspect_ratio') THEN
      CREATE TYPE "public"."enum__works_v_blocks_content_columns_media_aspect_ratio" AS ENUM('landscape', 'square', 'portrait');
    END IF;
  END $$;
  
  -- Convert media_aspect_ratio columns to text temporarily if they exist
  DO $$ 
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages_blocks_content_columns' AND column_name = 'media_aspect_ratio') THEN
      ALTER TABLE "public"."pages_blocks_content_columns" ALTER COLUMN "media_aspect_ratio" SET DATA TYPE text;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '_pages_v_blocks_content_columns' AND column_name = 'media_aspect_ratio') THEN
      ALTER TABLE "public"."_pages_v_blocks_content_columns" ALTER COLUMN "media_aspect_ratio" SET DATA TYPE text;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'works_blocks_content_columns' AND column_name = 'media_aspect_ratio') THEN
      ALTER TABLE "public"."works_blocks_content_columns" ALTER COLUMN "media_aspect_ratio" SET DATA TYPE text;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '_works_v_blocks_content_columns' AND column_name = 'media_aspect_ratio') THEN
      ALTER TABLE "public"."_works_v_blocks_content_columns" ALTER COLUMN "media_aspect_ratio" SET DATA TYPE text;
    END IF;
  END $$;
  
  -- Set default values for media_aspect_ratio columns if they don't exist
  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages_blocks_content_columns' AND column_name = 'media_aspect_ratio') THEN
      ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "media_aspect_ratio" "enum_pages_blocks_content_columns_media_aspect_ratio" DEFAULT 'landscape';
    ELSE
      ALTER TABLE "public"."pages_blocks_content_columns" ALTER COLUMN "media_aspect_ratio" SET DATA TYPE "public"."enum_pages_blocks_content_columns_media_aspect_ratio" USING "media_aspect_ratio"::"public"."enum_pages_blocks_content_columns_media_aspect_ratio";
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '_pages_v_blocks_content_columns' AND column_name = 'media_aspect_ratio') THEN
      ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "media_aspect_ratio" "enum__pages_v_blocks_content_columns_media_aspect_ratio" DEFAULT 'landscape';
    ELSE
      ALTER TABLE "public"."_pages_v_blocks_content_columns" ALTER COLUMN "media_aspect_ratio" SET DATA TYPE "public"."enum__pages_v_blocks_content_columns_media_aspect_ratio" USING "media_aspect_ratio"::"public"."enum__pages_v_blocks_content_columns_media_aspect_ratio";
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'works_blocks_content_columns' AND column_name = 'media_aspect_ratio') THEN
      ALTER TABLE "works_blocks_content_columns" ADD COLUMN "media_aspect_ratio" "enum_works_blocks_content_columns_media_aspect_ratio" DEFAULT 'landscape';
    ELSE
      ALTER TABLE "public"."works_blocks_content_columns" ALTER COLUMN "media_aspect_ratio" SET DATA TYPE "public"."enum_works_blocks_content_columns_media_aspect_ratio" USING "media_aspect_ratio"::"public"."enum_works_blocks_content_columns_media_aspect_ratio";
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '_works_v_blocks_content_columns' AND column_name = 'media_aspect_ratio') THEN
      ALTER TABLE "_works_v_blocks_content_columns" ADD COLUMN "media_aspect_ratio" "enum__works_v_blocks_content_columns_media_aspect_ratio" DEFAULT 'landscape';
    ELSE
      ALTER TABLE "public"."_works_v_blocks_content_columns" ALTER COLUMN "media_aspect_ratio" SET DATA TYPE "public"."enum__works_v_blocks_content_columns_media_aspect_ratio" USING "media_aspect_ratio"::"public"."enum__works_v_blocks_content_columns_media_aspect_ratio";
    END IF;
  END $$;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // No need to revert these changes as they're fixing a type issue
  await db.execute(sql`SELECT 1;`)
}
