# Migration Workflow Guide

This guide explains how to manually run Payload CMS migrations across different environments.

## Available Commands

```bash
# Create a new migration
pnpm migrate:create

# Check migration status
pnpm migrate:status

# Run pending migrations
pnpm migrate
```

## Local Development

```bash
# Check what migrations need to run
pnpm migrate:status

# Run migrations
pnpm migrate
```

## Production Environment

1. Get your production `POSTGRES_URL` from Vercel:
   - Go to: https://vercel.com/milesroxas-projects/milesroxas/settings/environment-variables
   - Copy the `POSTGRES_URL` value for **Production**

2. Run migrations:
```bash
# Check status
POSTGRES_URL="<production-url>" pnpm migrate:status

# Run migrations
POSTGRES_URL="<production-url>" pnpm migrate
```

## Preview/Dev Environment

1. Get your preview `POSTGRES_URL` from Vercel:
   - Go to: https://vercel.com/milesroxas-projects/milesroxas/settings/environment-variables
   - Copy the `POSTGRES_URL` value for **Preview**

2. Run migrations:
```bash
# Check status
POSTGRES_URL="<preview-url>" pnpm migrate:status

# Run migrations
POSTGRES_URL="<preview-url>" pnpm migrate
```

## Typical Workflow

1. **Make schema changes** to your Payload collections/globals
2. **Create migration**: `pnpm migrate:create`
3. **Test locally**: `pnpm migrate`
4. **Commit migration files**:
   ```bash
   git add src/migrations/
   git commit -m "feat: add migration for [description]"
   ```
5. **Push to dev branch**: `git push origin dev`
6. **Run migration on dev database**: Use preview URL from Vercel
7. **Test on dev environment**
8. **Merge to main**: Create PR and merge
9. **Run migration on production database**: Use production URL from Vercel

## Important Notes

- Always test migrations on preview/dev before running on production
- Migrations are tracked in the `payload_migrations` table
- Running migrations multiple times is safe (they won't re-run)
- Keep backups before running destructive migrations
- Migration files are in `src/migrations/`

## Mark Migration as Run (Without Running It)

If you've manually applied schema changes and need to mark a migration as completed:

```bash
POSTGRES_URL="<database-url>" npx tsx scripts/mark-migration.ts <migration-name>

# Example:
POSTGRES_URL="<production-url>" npx tsx scripts/mark-migration.ts 20260102_220803
```
