# Tech Stack

## Runtime & Build System

- **Runtime**: Bun (v1.3.2+)
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode enabled)

## Common Commands

```bash
# Install dependencies
bun install

# Development server (with Turbopack)
bun run dev

# Production build
bun run build

# Start production server
bun run start

# Linting
bun run lint
```

## Core Dependencies

### Frontend
- **React**: v19.2.0
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion
- **Icons**: Lucide React

### State & Forms
- **State Management**: Zustand (client-side stores)
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns

### Database & Storage
- **Database**: SQLite via better-sqlite3
- **File Storage**: Local filesystem (attachments folder)

### Utilities
- **Search**: Fuse.js (fuzzy search)
- **Styling Utilities**: clsx, tailwind-merge, class-variance-authority
- **Server-only Code**: server-only package

## TypeScript Configuration

- Strict mode enabled with additional checks:
  - `noUncheckedIndexedAccess: true`
  - `noImplicitOverride: true`
  - `noFallthroughCasesInSwitch: true`
- Module resolution: bundler mode
- Path alias: `@/*` maps to workspace root

## Build Configuration

- Turbopack enabled for faster development builds
- Next.js with empty turbopack config (silences warnings)
- PostCSS with Tailwind CSS v4 and autoprefixer
