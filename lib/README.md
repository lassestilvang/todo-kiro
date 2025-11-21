# Application Initialization

This directory contains the initialization logic for the Daily Task Planner application.

## Overview

The application uses a two-phase initialization process:

### Phase 1: Server-Side Initialization (`server-init.ts`)

This module runs automatically when imported and handles:
- Database initialization (creating tables, running migrations)
- Ensuring the default Inbox list exists
- Setting up the database connection

The server initialization is imported at the top of `app/layout.tsx` to ensure it runs before any database queries are executed.

### Phase 2: Client-Side Data Loading (`AppInitializer` component)

The `AppInitializer` component (in `components/providers/app-initializer.tsx`) handles:
- Loading all lists from the database into the ListStore
- Loading all labels from the database into the LabelStore
- Loading all tasks from the database into the TaskStore
- Displaying loading and error states to the user

## Usage

The initialization is automatic and requires no manual intervention. When the application starts:

1. The server-side initialization runs first (via the import in `app/layout.tsx`)
2. The database is initialized and the Inbox list is created if it doesn't exist
3. The `AppInitializer` component loads all data into the Zustand stores
4. The application UI is rendered once data loading is complete

## Error Handling

### Server-Side Errors

If the database initialization fails, an error is logged to the console and thrown. This will prevent the application from starting.

### Client-Side Errors

If data loading fails, the `AppInitializer` component displays an error screen with:
- A clear error message
- The specific error details
- A "Reload Page" button to retry

## Testing

The initialization logic is tested in `lib/__tests__/init.test.ts`. Run tests with:

```bash
bun test lib/__tests__/init.test.ts
```

## Architecture Notes

This application uses a unique architecture where:
- The database (SQLite) runs on the client side using Bun's `bun:sqlite` module
- Zustand stores directly call database query functions
- All data is stored locally on the user's machine

This architecture is optimized for a local-first, single-user task management application.
