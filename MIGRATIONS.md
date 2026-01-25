# Payload CMS Migration Workflow

This guide explains how to manually manage database migrations across different environments for your Payload CMS application.

## Overview

Migrations are **manually triggered** and run on different databases depending on which branch you're working on:
- **Main branch** → Production database
- **Dev branch** → Preview/Development database
- **Local** → Your local development database

> **Important:** Migrations do **NOT** run automatically during Vercel builds. You must run migrations manually **before** deploying. The build script (`pnpm build`) only runs `next build` - it does not execute migrations.

## Available Commands

All commands are available in `package.json`:

```bash
# Create a new migration after schema changes
pnpm migrate:create

# Check migration status (shows which migrations have/haven't run)
pnpm migrate:status

# Run pending migrations
pnpm migrate
```

## Environment Setup

### Get Database URLs from Vercel

You need the `POSTGRES_URL` for each environment:

1. Go to: https://vercel.com/milesroxas-projects/milesroxas/settings/environment-variables
2. Find and copy:
   - `POSTGRES_URL` for **Production** (main branch deployments)
   - `POSTGRES_URL` for **Preview** (dev branch deployments)

## Running Migrations

### Local Development

When working locally (any branch):

```bash
# Check local migration status
pnpm migrate:status

# Run migrations on local database
pnpm migrate
```

### Production Environment (Main Branch)

When on the **main** branch and need to migrate production:

```bash
# Switch to main branch
git checkout main

# Check production migration status
POSTGRES_URL="<production-url>" pnpm migrate:status

# Run migrations on production
POSTGRES_URL="<production-url>" pnpm migrate
```

### Preview/Dev Environment (Dev Branch)

When on the **dev** branch and need to migrate preview:

```bash
# Switch to dev branch
git checkout dev

# Check preview migration status
POSTGRES_URL="<preview-url>" pnpm migrate:status

# Run migrations on preview database
POSTGRES_URL="<preview-url>" pnpm migrate
```

## Complete Development Workflow

### 1. Make Schema Changes

Modify your Payload collections, globals, or fields in your codebase.

### 2. Create Migration

```bash
# On dev branch
git checkout dev
pnpm migrate:create
```

This creates a new migration file in `src/migrations/` with a timestamp.

### 3. Test Locally

```bash
# Run migration on your local database
pnpm migrate:status  # Check what will run
pnpm migrate         # Apply migration
```

Test your application locally to ensure the migration works correctly.

### 4. Commit Migration Files

```bash
git add src/migrations/
git commit -m "feat: add migration for [description]"
git push origin dev
```

### 5. Run Migration on Preview Database

**Before** pushing to dev branch, run migrations on the preview database:

```bash
# Run migration on preview/dev database
POSTGRES_URL="<preview-url>" pnpm migrate:status
POSTGRES_URL="<preview-url>" pnpm migrate
```

### 6. Push and Test on Preview Environment

```bash
git push origin dev
```

Visit your preview deployment and test thoroughly.

### 7. Merge to Main and Run Production Migration

**Before** pushing to main, run migrations on the production database:

```bash
git checkout main
git merge dev

# Run migration on production database BEFORE pushing
POSTGRES_URL="<production-url>" pnpm migrate:status
POSTGRES_URL="<production-url>" pnpm migrate

# Now push to trigger deployment
git push origin main
```

### 8. Verify Production

Visit your production site and verify everything works.

## Important Notes

### Safety Guidelines

- ⚠️ **Always test migrations on preview/dev before running on production**
- 🔒 **Keep database backups before running destructive migrations**
- ✅ **Migrations are idempotent** - running them multiple times is safe (they won't re-run)
- 📊 **Migration tracking** - All migrations are tracked in the `payload_migrations` table
- 🚀 **Run migrations before deploying** - Migrations are not run during Vercel builds to avoid interactive prompts blocking automated deployments

### Branch Strategy

- **Main branch** = Production migrations
- **Dev branch** = Preview/Dev migrations
- Migration scripts are available on both branches
- Same commands work on both branches, just with different `POSTGRES_URL` values

### Migration Files

- Location: `src/migrations/`
- Format: `YYYYMMDD_HHMMSS.ts` (e.g., `20260102_220803.ts`)
- Each migration has `up()` and `down()` functions
- Auto-generated based on schema changes

## Advanced Operations

### Mark Migration as Run (Without Executing)

If you've manually applied schema changes or need to sync migration state:

```bash
POSTGRES_URL="<database-url>" npx tsx scripts/mark-migration.ts <migration-name>

# Examples:
# Production
POSTGRES_URL="<production-url>" npx tsx scripts/mark-migration.ts 20260102_220803

# Preview
POSTGRES_URL="<preview-url>" npx tsx scripts/mark-migration.ts 20260102_220803
```

### Add Missing Columns Manually

Emergency script to add columns if migrations fail:

```bash
# Edit scripts/add-missing-columns.ts with your column definitions
POSTGRES_URL="<database-url>" npx tsx scripts/add-missing-columns.ts
```

### View Migration History

```bash
# Local
pnpm migrate:status

# Production
POSTGRES_URL="<production-url>" pnpm migrate:status

# Preview
POSTGRES_URL="<preview-url>" pnpm migrate:status
```

## Troubleshooting

### Migration Fails with "Type/Table Already Exists"

This happens when dev mode (`push: true`) was used instead of migrations. Solutions:

1. Mark the migration as run: `npx tsx scripts/mark-migration.ts <name>`
2. Or manually create missing columns then mark migration as run

### Column Does Not Exist Error

Your code expects a column that hasn't been migrated yet:

1. Check migration status: `pnpm migrate:status`
2. Run pending migrations: `pnpm migrate`
3. If migration fails, use `scripts/add-missing-columns.ts`

### Migration Out of Sync Between Environments

Each environment tracks migrations independently. To sync:

1. Check status on each: `POSTGRES_URL="<url>" pnpm migrate:status`
2. Run migrations where needed: `POSTGRES_URL="<url>" pnpm migrate`
3. Or mark as run if already applied: `npx tsx scripts/mark-migration.ts <name>`

## Quick Reference

| Task | Command |
|------|---------|
| Create migration | `pnpm migrate:create` |
| Check status (local) | `pnpm migrate:status` |
| Run migration (local) | `pnpm migrate` |
| Check status (remote) | `POSTGRES_URL="<url>" pnpm migrate:status` |
| Run migration (remote) | `POSTGRES_URL="<url>" pnpm migrate` |
| Mark as run | `POSTGRES_URL="<url>" npx tsx scripts/mark-migration.ts <name>` |

## Configuration

Your `payload.config.ts` is set up with:
```typescript
db: vercelPostgresAdapter({
  pool: {
    connectionString: process.env.POSTGRES_URL,
  },
  push: false, // Use migrations instead of auto-push
}),
```

This ensures migrations are required for all schema changes.

### Build Script

The build script in `package.json` does **not** run migrations:

```json
"build": "cross-env NODE_OPTIONS=\"...\" next build --webpack"
```

Migrations are intentionally excluded from the build process because:
1. They require manual review before running on production
2. Interactive prompts would block automated Vercel deployments
3. Running migrations during build could cause deployment failures if schema is out of sync

Always run `pnpm migrate` manually against the target database before deploying.
