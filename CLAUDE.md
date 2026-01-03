# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Lint and auto-fix with Biome
- `pnpm lint:check` - Lint without fixing
- `pnpm format` - Format and auto-fix with Biome
- `pnpm format:check` - Check formatting without fixing
- `pnpm check` - Run both linting and formatting with auto-fix
- `pnpm ci` - Check mode for CI/CD (no fixes applied)
- `pnpm generate:types` - Generate Payload types
- `pnpm payload` - Access Payload CLI commands

### Database Migration Commands

- `pnpm migrate:create` - Create database migration
- `pnpm migrate:status` - Check migration status
- `pnpm migrate` - Run pending migrations

**Important**: Migrations are manually triggered. See [MIGRATIONS.md](MIGRATIONS.md) for complete workflow.

## Architecture Overview

This is a Next.js 16 (App Router) website with Payload CMS as a headless backend, featuring 3D graphics and animations.

### Core Technologies

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **CMS**: Payload CMS with Postgres (Vercel)
- **Storage**: Vercel Blob Storage
- **3D Graphics**: Three.js with React Three Fiber
- **Animations**: GSAP, Lenis smooth scrolling
- **UI Components**: Radix UI, shadcn/ui

### Project Structure

```
src/
├── app/                    # Next.js App Router routes
│   ├── (frontend)/         # Public website routes
│   └── (payload)/          # Payload admin routes
├── collections/            # Payload CMS collections
│   ├── Pages/              # Website pages
│   ├── Posts/              # Blog posts
│   ├── Works/              # Portfolio works
│   ├── Media/              # File uploads
│   ├── Categories/         # Post categories
│   └── Users/              # Admin users
├── blocks/                 # Layout builder blocks
├── components/             # Reusable React components
├── providers/              # React context providers
├── utilities/              # Helper functions
├── hooks/                  # Custom React hooks
├── templates/              # Page templates
├── animations/             # GSAP animations
├── Header/                 # Global header config
├── Footer/                 # Global footer config
└── payload.config.ts       # Payload CMS configuration
```

### Key Collections

- **Pages**: Layout builder enabled pages with draft/publish workflow
- **Posts**: Blog posts with categories, authors, and featured images
- **Works**: Portfolio pieces with 3D assets and project details
- **Media**: File uploads with automatic image optimization

### Layout Builder System

The site uses a flexible block-based layout system with these blocks:

- Archive Block - Post/work listings with filtering
- Call to Action - CTA sections
- Code Block - Syntax highlighted code
- Content Block - Rich text content
- Media Block - Images and videos
- Form Block - Contact forms
- Banner - Hero sections
- Tabs - Tabbed content

### 3D Graphics Integration

- Uses React Three Fiber for 3D components
- Custom shaders for visual effects (GLSL files)
- GSAP integration for complex animations
- Lenis for smooth scrolling
- Custom cursor provider for interactive elements

### Styling System

- Tailwind CSS with custom theme configuration
- shadcn/ui components for consistent UI
- CSS variables for theming
- Responsive design patterns

### Data Flow

1. Content managed through Payload admin panel
2. Frontend queries Payload REST/GraphQL API
3. Static generation with on-demand revalidation
4. Live preview for draft content

### Environment Configuration

Requires these environment variables:

- `POSTGRES_URL` - Database connection
- `BLOB_READ_WRITE_TOKEN` - Vercel blob storage
- `PAYLOAD_SECRET` - Payload encryption key
- `RESEND_API_KEY` - Email service (optional)
- `CRON_SECRET` - Job queue authentication

### Development Guidelines

- Follow the Cursor rules in `.cursor/rules/nextjs-assistant.mdc`
- Do not generate summary documents unless requested
- Use TypeScript interfaces over types
- Prefer Server Components where possible
- Implement proper error boundaries
- Use Suspense for async operations
- Follow the established naming conventions for components and utilities
