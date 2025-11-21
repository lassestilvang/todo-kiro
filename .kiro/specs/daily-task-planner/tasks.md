# Implementation Plan

- [x] 1. Initialize Next.js project with Bun and configure base dependencies
  - Run `bun create next-app` with TypeScript and App Router
  - Install core dependencies: Tailwind CSS, shadcn/ui, Zustand, better-sqlite3, Framer Motion, date-fns, Fuse.js, Zod, React Hook Form
  - Configure TypeScript with strict mode in tsconfig.json
  - Set up Tailwind CSS configuration with custom theme tokens
  - Initialize shadcn/ui and configure components.json
  - _Requirements: 1.1, 8.1, 9.1, 11.1, 12.1_

- [x] 2. Set up database schema and connection
  - [x] 2.1 Create database initialization module
    - Write database connection setup using better-sqlite3
    - Create database directory structure
    - Implement database migration system
    - _Requirements: 12.1, 12.4_
  
  - [x] 2.2 Implement SQL schema creation
    - Write CREATE TABLE statements for all tables (lists, tasks, labels, task_labels, reminders, recurring_patterns, attachments, change_logs)
    - Add indexes for performance optimization
    - Create seed data for default Inbox list
    - _Requirements: 1.1, 12.1_
  
  - [x] 2.3 Create database query functions
    - Write CRUD functions for lists
    - Write CRUD functions for tasks
    - Write CRUD functions for labels
    - Write functions for task-label associations
    - Write functions for change log entries
    - Implement parameterized queries for SQL injection prevention
    - _Requirements: 2.1, 2.2, 3.1, 12.4_

- [x] 3. Create TypeScript types and Zod validation schemas
  - [x] 3.1 Define core type interfaces
    - Write TypeScript interfaces for Task, List, Label, TaskLabel, Reminder, RecurringPattern, Attachment, ChangeLog
    - Create utility types for form inputs and API responses
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 3.2 Create Zod validation schemas
    - Write Zod schema for task creation and updates
    - Write Zod schema for list creation and updates
    - Write Zod schema for label creation and updates
    - Add validation for time format (HH:mm)
    - Add validation for date inputs
    - _Requirements: 2.5, 10.1, 10.3, 10.4_

- [x] 4. Implement Zustand stores for state management
  - [x] 4.1 Create TaskStore
    - Implement task state and actions (addTask, updateTask, deleteTask, toggleTaskComplete)
    - Implement computed selectors (getTasksByList, getTodayTasks, getUpcomingTasks, getNext7DaysTasks, getOverdueTasks)
    - Integrate with database query functions
    - Add change log creation on task updates
    - _Requirements: 2.1, 3.1, 4.1, 4.2, 4.3, 4.4, 6.1_
  
  - [x] 4.2 Create ListStore
    - Implement list state and actions (addList, updateList, deleteList, loadLists)
    - Implement getInbox selector
    - Integrate with database query functions
    - _Requirements: 1.2, 1.3, 1.5_
  
  - [x] 4.3 Create LabelStore
    - Implement label state and actions (addLabel, updateLabel, deleteLabel, loadLabels)
    - Integrate with database query functions
    - _Requirements: 15.1, 15.5_
  
  - [x] 4.4 Create UIStore
    - Implement UI state (theme, sidebarOpen, showCompletedTasks, searchQuery)
    - Implement actions (setTheme, toggleSidebar, toggleShowCompleted, setSearchQuery)
    - Add localStorage persistence for theme preference
    - _Requirements: 4.5, 8.4, 9.2, 9.4_

- [x] 5. Set up shadcn/ui components
  - Install and configure required shadcn/ui components: Button, Input, Textarea, Select, Checkbox, Dialog, Popover, Calendar, Badge, Separator, ScrollArea, Tooltip
  - Customize component styles for light and dark themes
  - _Requirements: 8.5, 9.1, 9.5_

- [x] 6. Create layout components
  - [x] 6.1 Implement root layout with theme provider
    - Create app/layout.tsx with ThemeProvider
    - Add system theme detection
    - Implement theme toggle functionality
    - Add global styles and font configuration
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 6.2 Build Sidebar component
    - Create sidebar structure with navigation sections
    - Implement "Add Task" button
    - Add view links (Inbox, Today, Upcoming, Next 7 Days, All)
    - Display custom lists from ListStore
    - Display labels from LabelStore
    - Show overdue badge count
    - Add responsive behavior (drawer on mobile)
    - _Requirements: 1.3, 6.3, 8.1, 8.2, 8.4, 15.3_
  
  - [x] 6.3 Create Header component
    - Implement search input with debouncing
    - Add theme toggle button
    - Add mobile menu toggle button
    - _Requirements: 7.1, 7.2, 9.3_

- [x] 7. Implement task components
  - [x] 7.1 Create TaskItem component
    - Display task checkbox, name, and metadata
    - Show priority indicator with color coding
    - Display date and deadline badges
    - Show label chips
    - Display subtask count indicator
    - Add click handler to open task detail
    - Implement completed state styling
    - _Requirements: 2.2, 2.3, 5.4, 6.2_
  
  - [x] 7.2 Build TaskList component
    - Render list of TaskItem components
    - Implement empty state when no tasks
    - Add loading state
    - Filter completed tasks based on UIStore toggle
    - Group tasks by date or list as needed
    - _Requirements: 1.4, 4.5, 13.1_
  
  - [x] 7.3 Create TaskForm component
    - Build form with all task fields (name, description, date, deadline, estimated time, priority, labels, recurring pattern)
    - Integrate React Hook Form with Zod validation
    - Implement date picker using shadcn/ui Calendar
    - Create time input with HH:mm format validation
    - Add priority selector
    - Implement label multi-select
    - Add recurring pattern selector
    - Display validation errors inline
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.1, 10.2, 10.4, 10.5_
  
  - [x] 7.4 Build TaskDetail component
    - Create modal or side panel layout
    - Display all task properties
    - Show subtask list with add/remove functionality
    - Implement label management UI
    - Add attachment upload and display
    - Create change history tab with log entries
    - Add delete task button with confirmation
    - Integrate with TaskStore actions
    - _Requirements: 2.2, 3.2, 5.1, 5.2, 5.3, 5.5_
  
  - [x] 7.5 Implement SubtaskList component
    - Display subtasks nested under parent
    - Add checkbox for subtask completion
    - Show subtask completion status in parent
    - Implement add subtask functionality
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 8. Create view pages with App Router
  - [x] 8.1 Implement Inbox page (app/inbox/page.tsx)
    - Load tasks from Inbox list
    - Render TaskList component
    - Add "Add Task" quick action
    - _Requirements: 1.1, 1.4_
  
  - [x] 8.2 Create Today view page (app/today/page.tsx)
    - Filter tasks scheduled for current date
    - Render TaskList component
    - Highlight overdue tasks
    - _Requirements: 4.1, 6.2_
  
  - [x] 8.3 Build Next 7 Days view page (app/next-7-days/page.tsx)
    - Filter tasks scheduled from today through 7 days ahead
    - Group tasks by date
    - Render TaskList component
    - _Requirements: 4.2_
  
  - [x] 8.4 Create Upcoming view page (app/upcoming/page.tsx)
    - Filter tasks scheduled for today and all future dates
    - Group tasks by date
    - Render TaskList component
    - _Requirements: 4.3_
  
  - [x] 8.5 Implement All tasks view page (app/all/page.tsx)
    - Display all tasks regardless of scheduling
    - Render TaskList component
    - _Requirements: 4.4_
  
  - [x] 8.6 Create custom list view page (app/list/[id]/page.tsx)
    - Load tasks for specific list ID
    - Render TaskList component
    - Handle list not found error
    - _Requirements: 1.4_
  
  - [x] 8.7 Implement label view page (app/label/[id]/page.tsx)
    - Load tasks with specific label ID
    - Render TaskList component
    - Handle label not found error
    - _Requirements: 15.4_

- [x] 9. Implement search functionality
  - [x] 9.1 Create search utility with Fuse.js
    - Configure Fuse.js with fuzzy search options
    - Implement search function across task names and descriptions
    - Add text highlighting for matches
    - Optimize for 300ms response time
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 9.2 Build SearchResults component
    - Display search results with highlighted text
    - Show task metadata (list, date, labels)
    - Add click handler to navigate to task
    - Implement empty state for no results
    - _Requirements: 7.2, 7.3_

- [x] 10. Add animations and transitions
  - [x] 10.1 Implement View Transition API
    - Add view transitions for route changes
    - Configure transition duration (300ms)
    - Implement fallback for unsupported browsers
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [x] 10.2 Create Framer Motion animations
    - Add fade-in animations for task items
    - Implement slide animations for sidebar
    - Add scale animations for modals
    - Ensure 60fps performance
    - _Requirements: 14.4, 14.5_

- [x] 11. Implement list management features
  - [x] 11.1 Create ListForm component
    - Build form for creating/editing lists
    - Add name input, color picker, and emoji selector
    - Integrate with ListStore actions
    - _Requirements: 1.2, 1.5_
  
  - [x] 11.2 Add list management UI to sidebar
    - Implement "Add List" button
    - Add edit and delete actions for custom lists
    - Prevent deletion of Inbox list
    - _Requirements: 1.3_

- [x] 12. Implement label management features
  - [x] 12.1 Create LabelForm component
    - Build form for creating/editing labels
    - Add name input, icon selector, and color picker
    - Integrate with LabelStore actions
    - _Requirements: 15.1, 15.5_
  
  - [x] 12.2 Add label management UI to sidebar
    - Implement "Add Label" button
    - Add edit and delete actions for labels
    - _Requirements: 15.3_
  
  - [x] 12.3 Implement label assignment in TaskForm
    - Create multi-select component for labels
    - Allow adding/removing labels from tasks
    - Update task-label associations in database
    - _Requirements: 15.2_

- [x] 13. Add overdue task tracking
  - Create utility function to check if task is overdue
  - Implement overdue badge count calculation
  - Display overdue indicator on tasks
  - Update overdue status on date change
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 14. Implement recurring task functionality
  - [x] 14.1 Create recurring pattern configuration UI
    - Add pattern selector (daily, weekly, weekday, monthly, yearly, custom)
    - Implement custom pattern input
    - Add end date picker
    - _Requirements: 2.4_
  
  - [x] 14.2 Build recurring task generation logic
    - Write function to generate next occurrence based on pattern
    - Implement task duplication for recurring instances
    - Handle completion of recurring tasks
    - _Requirements: 2.4_

- [x] 15. Add reminder functionality
  - Create reminder configuration UI in TaskForm
  - Implement reminder storage in database
  - Add reminder display in TaskDetail
  - _Requirements: 2.2_

- [x] 16. Implement attachment handling
  - [x] 16.1 Create file upload component
    - Build file input with drag-and-drop
    - Validate file type and size
    - Display upload progress
    - _Requirements: 2.2_
  
  - [x] 16.2 Implement file storage
    - Save uploaded files to local directory
    - Store file metadata in database
    - Create file retrieval function
    - _Requirements: 2.2_
  
  - [x] 16.3 Add attachment display in TaskDetail
    - Show list of attachments with icons
    - Add download functionality
    - Implement delete attachment action
    - _Requirements: 2.2_

- [x] 17. Create change log display
  - Build ChangeHistory component
  - Display change log entries in reverse chronological order
  - Format field names and values for readability
  - Add timestamp formatting
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 18. Implement responsive design
  - [x] 18.1 Add mobile-specific styles
    - Create responsive breakpoints in Tailwind config
    - Implement sidebar drawer for mobile
    - Adjust task item layout for small screens
    - Ensure touch-friendly tap targets (44px minimum)
    - _Requirements: 8.4, 11.2, 11.3, 11.5_
  
  - [x] 18.2 Test across screen sizes
    - Verify layout on desktop (1024px+)
    - Test on tablet (768-1023px)
    - Test on mobile (<768px)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 19. Add loading states and error handling
  - [x] 19.1 Create loading components
    - Build skeleton loaders for task lists
    - Add spinner for form submissions
    - Implement loading states in stores
    - _Requirements: 13.1, 13.2_
  
  - [x] 19.2 Implement error handling
    - Add try-catch blocks to all database operations
    - Create error toast notification component
    - Display user-friendly error messages
    - Add error logging
    - _Requirements: 12.5, 13.3, 13.4, 13.5_

- [x] 20. Implement data initialization and loading
  - Create app initialization function
  - Load lists, labels, and tasks on app start
  - Handle database connection errors
  - Create default Inbox list if not exists
  - _Requirements: 1.1, 12.3_

- [x] 21. Add keyboard shortcuts
  - Implement "Add Task" shortcut (Cmd/Ctrl + K)
  - Add navigation shortcuts for views
  - Create search focus shortcut (Cmd/Ctrl + F)
  - Add task completion toggle shortcut
  - _Requirements: 8.5_

- [x] 22. Implement accessibility features
  - Add ARIA labels to interactive elements
  - Ensure keyboard navigation works throughout app
  - Implement focus management for modals
  - Test with screen reader
  - Add reduced motion support
  - Verify color contrast ratios
  - _Requirements: 8.5, 11.5_

- [x] 23. Write unit tests
  - [x] 23.1 Test Zustand stores
    - Write tests for TaskStore actions and selectors
    - Write tests for ListStore actions
    - Write tests for LabelStore actions
    - Write tests for UIStore actions
    - _Requirements: All_
  
  - [x] 23.2 Test utility functions
    - Test date formatting functions
    - Test time parsing functions
    - Test overdue calculation
    - Test recurring pattern generation
    - _Requirements: 2.5, 4.1, 4.2, 4.3, 6.1, 6.4_
  
  - [x] 23.3 Test validation schemas
    - Test Zod schemas with valid inputs
    - Test Zod schemas with invalid inputs
    - Verify error messages
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 23.4 Test database functions
    - Test CRUD operations for all tables
    - Test query functions with various filters
    - Test transaction handling
    - _Requirements: 12.1, 12.4_

- [x] 24. Write integration tests
  - [x] 24.1 Test complete user flows
    - Test task creation flow
    - Test task update flow
    - Test task deletion flow
    - Test list creation and management
    - Test label creation and assignment
    - _Requirements: All_
  
  - [x] 24.2 Test view filtering
    - Test Today view filtering
    - Test Next 7 Days view filtering
    - Test Upcoming view filtering
    - Test All view display
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 24.3 Test search functionality
    - Test fuzzy search with various queries
    - Test search result highlighting
    - Test search performance
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 25. Write component tests
  - [x] 25.1 Test TaskItem component
    - Test rendering with various task states
    - Test checkbox interaction
    - Test click to open detail
    - _Requirements: 2.2, 2.3, 5.4, 6.2_
  
  - [x] 25.2 Test TaskForm component
    - Test form validation
    - Test form submission
    - Test error display
    - _Requirements: 2.1, 2.2, 10.1, 10.5_
  
  - [x] 25.3 Test Sidebar component
    - Test navigation links
    - Test list display
    - Test label display
    - Test overdue badge
    - _Requirements: 1.3, 6.3, 8.1, 15.3_

- [x] 26. Create documentation
  - Write README with setup instructions
  - Document database schema
  - Add code comments for complex logic
  - Create user guide for key features
  - _Requirements: All_

- [x] 27. Final polish and optimization
  - Review and optimize bundle size
  - Audit performance with Lighthouse
  - Test all features end-to-end
  - Fix any remaining bugs
  - Verify all requirements are met
  - _Requirements: All_
