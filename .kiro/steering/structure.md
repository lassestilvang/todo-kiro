# Project Structure

## Directory Organization

```
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints (REST-style)
│   │   ├── tasks/        # Task CRUD + nested resources
│   │   ├── lists/        # List management
│   │   ├── labels/       # Label management
│   │   └── attachments/  # File attachments
│   ├── inbox/            # View pages
│   ├── today/
│   ├── upcoming/
│   ├── next-7-days/
│   ├── all/
│   ├── list/[id]/        # Dynamic list view
│   ├── label/[id]/       # Dynamic label view
│   ├── layout.tsx        # Root layout
│   ├── template.tsx      # Page transition wrapper
│   └── globals.css       # Global styles
│
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives (Button, Dialog, etc.)
│   ├── task/             # Task-related components
│   ├── list/             # List management components
│   ├── label/            # Label management components
│   ├── search/           # Search functionality
│   ├── layout/           # Layout components (sidebar, header, etc.)
│   └── providers/        # Context providers
│
├── lib/                   # Core application logic
│   ├── db/               # Database layer
│   │   ├── connection.ts # SQLite connection singleton
│   │   ├── schema.ts     # Table definitions and seeding
│   │   ├── migrations.ts # Schema migrations
│   │   ├── init.ts       # Database initialization
│   │   └── queries/      # Query functions by entity
│   ├── store/            # Zustand stores (task, list, label, ui)
│   ├── utils/            # Helper functions
│   ├── actions/          # Server actions
│   ├── validations/      # Zod schemas
│   └── utils.ts          # cn() utility
│
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── database/              # SQLite database files (.db, .db-shm, .db-wal)
├── attachments/           # Uploaded file storage
└── public/                # Static assets
```

## Architecture Patterns

### API Routes
- RESTful structure: `/api/{resource}` and `/api/{resource}/[id]`
- Nested resources: `/api/tasks/[id]/attachments`, `/api/tasks/[id]/labels`
- HTTP methods: GET (list/read), POST (create), PATCH (update), DELETE (delete)
- Return JSON responses with proper error handling

### Database Layer
- **Connection**: Singleton pattern via `getDatabase()` in `lib/db/connection.ts`
- **Schema**: Defined in `lib/db/schema.ts` with indexes and default data
- **Queries**: Organized by entity in `lib/db/queries/` (tasks.ts, lists.ts, etc.)
- **Naming**: Database uses snake_case, TypeScript uses camelCase
- **Conversion**: Helper functions `rowToTask()` and `taskToRow()` for mapping

### State Management
- **Zustand stores** for client-side state (tasks, lists, labels, UI)
- Store pattern: state + actions + computed selectors
- API calls made from store actions
- Optimistic updates where appropriate

### Component Patterns
- **Server Components**: Default for pages and layouts
- **Client Components**: Use `'use client'` directive for interactivity
- **Forms**: React Hook Form + Zod validation
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with `cn()` utility for conditional classes

### Type Conversions
- Database columns: `snake_case` (e.g., `list_id`, `created_at`)
- TypeScript properties: `camelCase` (e.g., `listId`, `createdAt`)
- Dates: Stored as ISO strings, converted to Date objects in TypeScript
- Booleans: Stored as integers (0/1), converted to boolean in TypeScript

### File Organization
- Group by feature/entity (task, list, label)
- Barrel exports via `index.ts` files
- Co-locate related components and utilities
- Separate UI primitives from feature components

## Key Conventions

- Use `@/` path alias for imports from workspace root
- Server-only code marked with `'server-only'` import
- All forms use Zod schemas for validation
- Change logs tracked automatically on task updates
- File uploads stored in `attachments/` with metadata in database
