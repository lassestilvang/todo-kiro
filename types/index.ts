// Core data models

export interface Task {
  id: string;
  name: string;
  description: string | null;
  listId: string;
  date: Date | null;
  deadline: Date | null;
  estimatedTime: number | null; // in minutes
  actualTime: number | null; // in minutes
  priority: 'high' | 'medium' | 'low' | 'none';
  completed: boolean;
  completedAt: Date | null;
  parentTaskId: string | null;
  position: number; // for ordering
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  id: string;
  name: string;
  color: string; // hex color code
  emoji: string;
  isDefault: boolean; // true for Inbox
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Label {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskLabel {
  taskId: string;
  labelId: string;
  createdAt: Date;
}

export interface Reminder {
  id: string;
  taskId: string;
  reminderTime: Date;
  triggered: boolean;
  createdAt: Date;
}

export interface RecurringPattern {
  id: string;
  taskId: string;
  pattern: 'daily' | 'weekly' | 'weekday' | 'monthly' | 'yearly' | 'custom';
  customPattern: string | null; // cron-like pattern for custom
  endDate: Date | null;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  taskId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

export interface ChangeLog {
  id: string;
  taskId: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedAt: Date;
}

// Utility types for form inputs

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'position'>;

export type TaskUpdate = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>;

export type ListInput = Omit<List, 'id' | 'createdAt' | 'updatedAt' | 'isDefault' | 'position'>;

export type ListUpdate = Partial<Omit<List, 'id' | 'createdAt' | 'updatedAt' | 'isDefault'>>;

export type LabelInput = Omit<Label, 'id' | 'createdAt' | 'updatedAt'>;

export type LabelUpdate = Partial<Omit<Label, 'id' | 'createdAt' | 'updatedAt'>>;

// Database row types (with string dates from SQLite)

export interface TaskRow {
  id: string;
  name: string;
  description: string | null;
  list_id: string;
  date: string | null;
  deadline: string | null;
  estimated_time: number | null;
  actual_time: number | null;
  priority: 'high' | 'medium' | 'low' | 'none';
  completed: number;
  completed_at: string | null;
  parent_task_id: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ListRow {
  id: string;
  name: string;
  color: string;
  emoji: string;
  is_default: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface LabelRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface TaskLabelRow {
  task_id: string;
  label_id: string;
  created_at: string;
}

export interface ReminderRow {
  id: string;
  task_id: string;
  reminder_time: string;
  triggered: number;
  created_at: string;
}

export interface RecurringPatternRow {
  id: string;
  task_id: string;
  pattern: 'daily' | 'weekly' | 'weekday' | 'monthly' | 'yearly' | 'custom';
  custom_pattern: string | null;
  end_date: string | null;
  created_at: string;
}

export interface AttachmentRow {
  id: string;
  task_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface ChangeLogRow {
  id: string;
  task_id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
}

// Priority type
export type Priority = 'high' | 'medium' | 'low' | 'none';

// Recurring pattern type
export type RecurringPatternType = 'daily' | 'weekly' | 'weekday' | 'monthly' | 'yearly' | 'custom';
