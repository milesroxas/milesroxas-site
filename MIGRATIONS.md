# Payload CMS Migration Workflow

This project uses `@payloadcms/db-vercel-postgres` with `push: false` in `src/payload.config.ts`.  
All schema changes must go through migrations.

## Important Rules

- Never manually edit generated files:
  - `src/payload-generated-schema.ts`
  - `src/payload-types.ts`
- Regenerate generated files with:
  - `pnpm generate:db-schema`
  - `pnpm generate:types`
- Migrations do not run automatically in `pnpm build`; run them manually before deployment.

## Core Commands

```bash
pnpm migrate:create
pnpm migrate:status
pnpm migrate
```

## Standard Schema Change Flow

1. Update schema files (collections/globals/fields/hooks as needed).
2. Create migration:
   ```bash
   pnpm migrate:create
   ```
3. Verify and apply locally:
   ```bash
   pnpm migrate:status
   pnpm migrate
   ```
4. Commit the new file(s) in `src/migrations/`.
5. Run migration against preview DB:
   ```bash
   POSTGRES_URL="<preview-url>" pnpm migrate:status
   POSTGRES_URL="<preview-url>" pnpm migrate
   ```
6. Run migration against production DB before prod deploy:
   ```bash
   POSTGRES_URL="<production-url>" pnpm migrate:status
   POSTGRES_URL="<production-url>" pnpm migrate
   ```

## Migration Utilities

These scripts are available for recovery/debugging cases:

```bash
POSTGRES_URL="<database-url>" pnpm dlx tsx scripts/mark-migration.ts <migration-name>
POSTGRES_URL="<database-url>" pnpm dlx tsx scripts/add-missing-columns.ts
POSTGRES_URL="<database-url>" pnpm dlx tsx scripts/check-schema.ts
POSTGRES_URL="<database-url>" pnpm dlx tsx scripts/check-indexes.ts
POSTGRES_URL="<database-url>" pnpm dlx tsx scripts/fix-indexes.ts
```

## Troubleshooting

### Migration Already Applied / Type Exists

- Check current state: `pnpm migrate:status` (or with `POSTGRES_URL` override)
- Mark migration as run if schema was already applied manually:
  - `POSTGRES_URL="<database-url>" pnpm dlx tsx scripts/mark-migration.ts <migration-name>`

### Missing Column / Schema Out of Sync

- Run pending migrations first:
  - `pnpm migrate`
- If still out of sync, use:
  - `scripts/check-schema.ts`
  - `scripts/add-missing-columns.ts`
