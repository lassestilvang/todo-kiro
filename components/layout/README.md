# Layout Components

This directory contains the main layout components for the Daily Task Planner application.

## Components

### ThemeProvider (`../theme-provider.tsx`)
- Wraps the application to provide theme support
- Integrates with UIStore for theme state management
- Supports light, dark, and system themes
- Automatically applies theme on mount and listens for system theme changes

### Header (`header.tsx`)
- Sticky header with search input, theme toggle, and mobile menu button
- Search input with 300ms debouncing
- Theme toggle cycles through light → dark → system → light
- Responsive mobile menu toggle button

### Sidebar (`sidebar.tsx`)
- Navigation sidebar with views, lists, and labels sections
- Displays default views: Inbox, Today, Upcoming, Next 7 Days, All
- Shows overdue task badge count on Today view
- Sections for custom lists and labels (currently empty placeholders)
- Responsive behavior with toggle support
- Smooth transitions for open/close states

## Layout Structure

The root layout (`app/layout.tsx`) implements a flex-based layout:
```
┌─────────────────────────────────────┐
│  ThemeProvider                      │
│  ┌───────────┬──────────────────┐  │
│  │           │  Header          │  │
│  │  Sidebar  ├──────────────────┤  │
│  │           │                  │  │
│  │           │  Main Content    │  │
│  │           │                  │  │
│  └───────────┴──────────────────┘  │
└─────────────────────────────────────┘
```

## Implementation Notes

### Data Loading
The Sidebar component currently uses placeholder empty arrays for lists and labels. This is intentional to avoid bundling server-side database code in the client bundle. 

**Future Implementation:**
- Data loading will be implemented in later tasks using one of these approaches:
  1. Server Actions for data fetching
  2. API routes for database operations
  3. Server Components for initial data loading with client components for interactivity

### Theme Management
- Theme preference is persisted in localStorage via UIStore
- System theme detection uses `prefers-color-scheme` media query
- Theme changes are applied immediately to the document root element

### Responsive Design
- Sidebar collapses on mobile (controlled by UIStore.sidebarOpen)
- Header shows mobile menu toggle button on small screens
- Layout uses Tailwind's responsive utilities for breakpoints

## Requirements Fulfilled

This implementation satisfies the following requirements from the spec:

**Requirement 9.1, 9.2, 9.3** (Theme Support):
- ✅ Light and dark theme modes supported
- ✅ System theme preference detection on first launch
- ✅ Immediate theme application on change
- ✅ Theme preference persisted across sessions

**Requirement 8.1, 8.2, 8.4** (UI Layout):
- ✅ Sidebar with lists, views, and labels
- ✅ Main panel for content
- ✅ Split-view layout on desktop
- ✅ Responsive mobile layout with collapsible sidebar

**Requirement 7.1, 7.2** (Search):
- ✅ Search input with debouncing (300ms)
- ✅ Real-time search query updates

**Requirement 6.3** (Overdue Tasks):
- ✅ Badge count display (placeholder for now, will show actual count when data loading is implemented)
