# Daily Task Planner

[![Tests](https://img.shields.io/badge/tests-257%20passing-brightgreen)](./docs/TESTING.md)
[![Coverage](https://img.shields.io/badge/coverage-75%25-yellow)](./docs/TEST_COVERAGE_REPORT.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

A modern, professional task management application built with Next.js 16, TypeScript, and SQLite. Organize your daily tasks with custom lists, labels, recurring patterns, and smart views.

## Features

- **Task Management**: Create tasks with rich metadata including descriptions, dates, deadlines, priorities, and time estimates
- **Custom Lists**: Organize tasks into custom lists with emojis and colors
- **Labels**: Tag tasks with customizable labels for cross-list categorization
- **Subtasks**: Break down complex tasks into manageable subtasks
- **Smart Views**: Inbox, Today, Upcoming, Next 7 Days, and All Tasks views
- **Recurring Tasks**: Support for daily, weekly, monthly, yearly, and custom patterns
- **Reminders**: Set multiple reminders per task
- **Attachments**: Upload and manage files attached to tasks
- **Change History**: Track all modifications to tasks with detailed logs
- **Fuzzy Search**: Fast full-text search across all tasks
- **Keyboard Shortcuts**: Comprehensive keyboard navigation
- **Dark/Light Theme**: System-aware theme with manual toggle
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **Runtime**: Bun (v1.3.2+)
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Database**: SQLite (better-sqlite3)
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Search**: Fuse.js
- **Testing**: Bun Test

## Prerequisites

- [Bun](https://bun.sh/) v1.3.2 or higher
- Node.js v18+ (for compatibility)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/lassestilvang/todo-kiro
cd todo-kiro
```

2. Install dependencies:
```bash
bun install
```

3. The database will be automatically initialized on first run. The SQLite database file will be created at `database/tasks.db`.

## Development

Start the development server with Turbopack:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

Build the application:

```bash
bun run build
```

Start the production server:

```bash
bun run start
```

## Testing

Run all tests:

```bash
bun test
```

Run tests in watch mode:

```bash
bun test --watch
```

Run tests with coverage:

```bash
bun test --coverage
```

## Project Structure

```
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # REST API endpoints
│   │   ├── tasks/        # Task CRUD + nested resources
│   │   ├── lists/        # List management
│   │   ├── labels/       # Label management
│   │   └── attachments/  # File attachments
│   ├── inbox/             # View pages
│   ├── today/
│   ├── upcoming/
│   ├── next-7-days/
│   ├── all/
│   ├── list/[id]/         # Dynamic list view
│   ├── label/[id]/        # Dynamic label view
│   ├── layout.tsx         # Root layout
│   ├── template.tsx       # Page transition wrapper
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── task/             # Task components
│   ├── list/             # List components
│   ├── label/            # Label components
│   ├── search/           # Search components
│   ├── layout/           # Layout components
│   └── providers/        # Context providers
├── lib/                   # Core application logic
│   ├── db/               # Database layer
│   │   ├── connection.ts # SQLite connection singleton
│   │   ├── schema.ts     # Table definitions
│   │   ├── migrations.ts # Schema migrations
│   │   ├── init.ts       # Database initialization
│   │   └── queries/      # Query functions by entity
│   ├── store/            # Zustand stores
│   ├── utils/            # Helper functions
│   ├── actions/          # Server actions
│   └── validations/      # Zod schemas
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
├── database/              # SQLite database files
└── attachments/           # Uploaded file storage
```

## Database

The application uses SQLite for local data persistence. The database is automatically initialized on first run with the following tables:

- `lists` - Task lists (Inbox and custom lists)
- `tasks` - Tasks with all metadata
- `labels` - Custom labels
- `task_labels` - Many-to-many relationship between tasks and labels
- `reminders` - Task reminders
- `recurring_patterns` - Recurring task patterns
- `attachments` - File attachment metadata
- `change_logs` - Task modification history

See [DATABASE.md](./DATABASE.md) for detailed schema documentation.

## User Guide

### Getting Started

1. **Create Your First Task**: Click the "Add Task" button in the sidebar or press `Cmd/Ctrl + K`
2. **Organize with Lists**: Create custom lists to categorize your tasks (Work, Personal, etc.)
3. **Add Labels**: Tag tasks with labels for cross-list organization
4. **Use Smart Views**: Navigate between Today, Upcoming, and other views to focus on what matters

### Task Management

**Creating Tasks**:
- Click "Add Task" or use `Cmd/Ctrl + K`
- Enter a task name (required)
- Optionally add description, date, deadline, priority, labels, and more
- Press Enter or click "Create Task"

**Editing Tasks**:
- Click on any task to open the detail view
- Modify any field and changes are saved automatically
- View change history to see all modifications

**Completing Tasks**:
- Click the checkbox next to a task
- Completed tasks can be hidden using the "Show Completed" toggle

**Subtasks**:
- Open a task detail view
- Click "Add Subtask" to break down complex tasks
- Mark subtasks complete independently

**Recurring Tasks**:
- When creating/editing a task, select a recurring pattern
- Choose from daily, weekly, monthly, yearly, or custom patterns
- Set an optional end date for the recurrence

### Organization

**Lists**:
- Create custom lists with emojis and colors
- Drag tasks between lists
- The Inbox is your default list for quick capture

**Labels**:
- Create labels with icons and colors
- Apply multiple labels to any task
- Click a label in the sidebar to view all tagged tasks

**Views**:
- **Inbox**: Your default list for new tasks
- **Today**: Tasks scheduled for today
- **Upcoming**: All future tasks
- **Next 7 Days**: Tasks in the next week
- **All**: Every task regardless of date

### Search

- Press `Cmd/Ctrl + F` to focus the search bar
- Type to search across task names and descriptions
- Results update in real-time with fuzzy matching
- Click any result to open that task

### Keyboard Shortcuts

- `Cmd/Ctrl + K` - Quick add task
- `Cmd/Ctrl + F` - Focus search
- `Cmd/Ctrl + B` - Toggle sidebar
- `Escape` - Close dialogs/modals
- `Enter` - Submit forms
- Arrow keys - Navigate lists and menus

### Attachments

- Open a task detail view
- Click "Add Attachment" or drag files into the upload area
- Supported file types: documents, images, PDFs (max 10MB)
- Download or delete attachments as needed

### Theme

- Click the theme toggle in the header to switch between light and dark modes
- The app automatically detects your system preference on first launch
- Your preference is saved for future sessions

## Configuration

### Database Location

By default, the database is stored at `database/tasks.db`. To change the location, modify the `DATABASE_PATH` in `lib/db/connection.ts`.

### File Upload Limits

Maximum file size is 10MB by default. To change this, modify the validation in `lib/validations/index.ts`:

```typescript
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

### Theme Customization

Modify theme colors in `app/globals.css` under the `:root` and `.dark` selectors.

## Troubleshooting

### Database Issues

If you encounter database errors, try deleting the database files and restarting:

```bash
rm -rf database/
bun run dev
```

The database will be recreated automatically.

### Port Already in Use

If port 3000 is already in use, specify a different port:

```bash
PORT=3001 bun run dev
```

### Build Errors

Clear the Next.js cache and rebuild:

```bash
rm -rf .next
bun run build
```

### Attachment Upload Fails

Ensure the `attachments/` directory exists and has write permissions:

```bash
mkdir -p attachments
chmod 755 attachments
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Framer Motion](https://www.framer.com/motion/) - Animation library

---

Built with [Bun](https://bun.sh) v1.3.2
