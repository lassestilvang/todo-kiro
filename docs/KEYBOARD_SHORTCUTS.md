# Keyboard Shortcuts

This document lists all available keyboard shortcuts in the Daily Task Planner application.

## General Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Cmd/Ctrl + K` | Add Task | Opens the task creation dialog |
| `Cmd/Ctrl + F` | Focus Search | Focuses the search input field |

## Navigation Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Cmd/Ctrl + 1` | Go to Inbox | Navigate to the Inbox view |
| `Cmd/Ctrl + 2` | Go to Today | Navigate to the Today view |
| `Cmd/Ctrl + 3` | Go to Upcoming | Navigate to the Upcoming view |
| `Cmd/Ctrl + 4` | Go to Next 7 Days | Navigate to the Next 7 Days view |
| `Cmd/Ctrl + 5` | Go to All Tasks | Navigate to the All Tasks view |

## Task Actions

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Cmd/Ctrl + Enter` | Toggle Task Completion | Marks the currently selected task as complete/incomplete |

## Notes

- On macOS, use `Cmd` (Command key)
- On Windows/Linux, use `Ctrl` (Control key)
- Keyboard shortcuts are disabled when typing in input fields (except for search focus)
- The task completion toggle only works when a task is selected in the task detail view

## Implementation Details

The keyboard shortcuts are implemented using a custom React hook (`useKeyboardShortcuts`) that:
- Listens for keyboard events globally
- Prevents default browser behavior for registered shortcuts
- Respects input focus states to avoid conflicts
- Works across all pages and views in the application

The shortcuts are automatically initialized when the application loads and require no additional configuration.
