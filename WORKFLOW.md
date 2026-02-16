# Workflow Guide

## Branch Strategy

```
dev (develop) → preview (PR/push) → main (production)
```

| Branch | Vercel Environment | Neon Branch | URL |
|---|---|---|---|
| `dev` | Preview | `ep-proud-bird-a4d5j6rh` | Preview deploy URL |
| `main` | Production | `ep-shiny-sound-a4tws5zi` | milesroxas.com |

Local development uses the **dev** Neon branch via `.env.local`.

---

## Development

```bash
git checkout dev
pnpm dev                    # Start local dev server (Turbopack)
```

### Code Quality

```bash
pnpm check                  # Lint + format (auto-fix)
pnpm ci                     # Check only (no fixes, for CI)
```

---

## Database & Migrations

See [MIGRATIONS.md](MIGRATIONS.md) for full details.

### Quick Reference

```bash
pnpm migrate:create         # Create migration after schema changes
pnpm migrate:status         # Check pending migrations
pnpm migrate                # Run migrations (uses .env.local POSTGRES_URL)
```

### Remote Migration

```bash
# Preview/dev database
POSTGRES_URL="<preview-url>" pnpm migrate

# Production database
POSTGRES_URL="<production-url>" pnpm migrate
```

---

## Deployment Flow

### 1. Develop on `dev`

```bash
git checkout dev
# Make changes, test locally
git add <files> && git commit -m "feat: description"
git push origin dev
```

Pushing to `dev` triggers a **Vercel Preview** deployment against the dev Neon branch.

### 2. Schema Changes (if any)

```bash
pnpm migrate:create                          # Generate migration
pnpm migrate                                 # Test locally
POSTGRES_URL="<preview-url>" pnpm migrate    # Apply to preview DB
git add src/migrations/ && git commit -m "chore: migration"
git push origin dev
```

### 3. Promote to Production

```bash
git checkout main
git merge dev

# If there are migrations, run them BEFORE pushing
POSTGRES_URL="<production-url>" pnpm migrate

git push origin main
```

Pushing to `main` triggers a **Vercel Production** deployment.

---

## Environment Files

| File | Purpose | Loaded when |
|---|---|---|
| `.env.local` | Local dev overrides | `pnpm dev` |
| `.env.production` | Production vars (pulled from Vercel) | `pnpm build` locally |
| `.env.example` | Template for new setups | Reference only |

All `.env*` files are gitignored. Pull latest from Vercel with:

```bash
vercel env pull .env.local --environment development
vercel env pull .env.production --environment production
```

---

## Key Environment Variables

| Variable | Purpose |
|---|---|
| `POSTGRES_URL` | Neon database connection (pooled) |
| `PAYLOAD_SECRET` | Payload CMS encryption key |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage |
| `RESEND_API_KEY` | Email service |
| `CRON_SECRET` | Job queue auth |
| `PREVIEW_SECRET` | Draft preview auth |

---

## Project Structure

```
src/
├── app/                    # Routes (frontend + payload admin)
├── collections/            # Payload CMS collections
├── blocks/                 # Layout builder blocks
├── components/             # Reusable React components
├── heros/                  # Hero section variants
├── templates/              # Page templates
├── animations/             # GSAP animations
├── hooks/                  # Custom React hooks
├── providers/              # React context providers
├── stores/                 # Zustand state stores
├── utilities/              # Helper functions
├── migrations/             # Database migrations
├── Header/                 # Global header config
├── Footer/                 # Global footer config
├── SiteFrame/              # Site frame + page transitions
└── payload.config.ts       # CMS configuration
```

---

## Useful Commands

| Command | Description |
|---|---|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm check` | Lint + format with Biome |
| `pnpm generate:types` | Regenerate Payload types |
| `pnpm payload` | Payload CLI |
