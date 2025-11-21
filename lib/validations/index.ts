import { z } from 'zod';

// Time format validation (HH:mm)
const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const timeSchema = z
  .string()
  .regex(timeFormatRegex, 'Time must be in HH:mm format (e.g., 09:30 or 14:45)')
  .optional()
  .nullable();

// Priority validation
export const prioritySchema = z.enum(['high', 'medium', 'low', 'none']);

// Recurring pattern validation
export const recurringPatternTypeSchema = z.enum([
  'daily',
  'weekly',
  'weekday',
  'monthly',
  'yearly',
  'custom',
]);

// Task validation schemas

export const taskInputSchema = z.object({
  name: z
    .string()
    .min(1, 'Task name is required')
    .max(500, 'Task name must be less than 500 characters'),
  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional()
    .nullable(),
  listId: z.string().min(1, 'List is required'),
  date: z.coerce.date().optional().nullable(),
  deadline: z.coerce.date().optional().nullable(),
  estimatedTime: z
    .number()
    .int()
    .min(0, 'Estimated time must be a positive number')
    .max(10080, 'Estimated time cannot exceed 1 week (10080 minutes)')
    .optional()
    .nullable(),
  actualTime: z
    .number()
    .int()
    .min(0, 'Actual time must be a positive number')
    .max(10080, 'Actual time cannot exceed 1 week (10080 minutes)')
    .optional()
    .nullable(),
  priority: prioritySchema.default('none'),
  completed: z.boolean().default(false),
  parentTaskId: z.string().optional().nullable(),
  recurringPattern: z.enum(['none', 'daily', 'weekly', 'weekday', 'monthly', 'yearly', 'custom']).default('none'),
  customPattern: z
    .string()
    .max(100, 'Custom pattern must be less than 100 characters')
    .optional()
    .nullable(),
  recurringEndDate: z.coerce.date().optional().nullable(),
  reminders: z.array(z.coerce.date()).optional().default([]),
});

export const taskUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Task name is required')
    .max(500, 'Task name must be less than 500 characters')
    .optional(),
  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional()
    .nullable(),
  listId: z.string().min(1, 'List is required').optional(),
  date: z.coerce.date().optional().nullable(),
  deadline: z.coerce.date().optional().nullable(),
  estimatedTime: z
    .number()
    .int()
    .min(0, 'Estimated time must be a positive number')
    .max(10080, 'Estimated time cannot exceed 1 week (10080 minutes)')
    .optional()
    .nullable(),
  actualTime: z
    .number()
    .int()
    .min(0, 'Actual time must be a positive number')
    .max(10080, 'Actual time cannot exceed 1 week (10080 minutes)')
    .optional()
    .nullable(),
  priority: prioritySchema.optional(),
  completed: z.boolean().optional(),
  completedAt: z.coerce.date().optional().nullable(),
  parentTaskId: z.string().optional().nullable(),
  position: z.number().int().min(0).optional(),
});

// Refinement to ensure deadline is after date if both are provided
// and custom pattern is provided when custom recurring is selected
export const taskInputWithDateValidationSchema = taskInputSchema
  .refine(
    (data) => {
      if (data.date && data.deadline) {
        return new Date(data.deadline) >= new Date(data.date);
      }
      return true;
    },
    {
      message: 'Deadline must be on or after the scheduled date',
      path: ['deadline'],
    }
  )
  .refine(
    (data) => {
      if (data.recurringPattern === 'custom') {
        return data.customPattern && data.customPattern.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Custom pattern is required when custom recurring is selected',
      path: ['customPattern'],
    }
  );

// List validation schemas

export const listInputSchema = z.object({
  name: z
    .string()
    .min(1, 'List name is required')
    .max(100, 'List name must be less than 100 characters'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #FF5733)'),
  emoji: z
    .string()
    .min(1, 'Emoji is required')
    .max(10, 'Emoji must be a single emoji character'),
});

export const listUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'List name is required')
    .max(100, 'List name must be less than 100 characters')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #FF5733)')
    .optional(),
  emoji: z
    .string()
    .min(1, 'Emoji is required')
    .max(10, 'Emoji must be a single emoji character')
    .optional(),
  position: z.number().int().min(0).optional(),
});

// Label validation schemas

export const labelInputSchema = z.object({
  name: z
    .string()
    .min(1, 'Label name is required')
    .max(50, 'Label name must be less than 50 characters'),
  icon: z
    .string()
    .min(1, 'Icon is required')
    .max(50, 'Icon must be less than 50 characters'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #FF5733)'),
});

export const labelUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Label name is required')
    .max(50, 'Label name must be less than 50 characters')
    .optional(),
  icon: z
    .string()
    .min(1, 'Icon is required')
    .max(50, 'Icon must be less than 50 characters')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #FF5733)')
    .optional(),
});

// Reminder validation schema

export const reminderInputSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  reminderTime: z.coerce.date(),
});

// Recurring pattern validation schema

export const recurringPatternInputSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  pattern: recurringPatternTypeSchema,
  customPattern: z
    .string()
    .max(100, 'Custom pattern must be less than 100 characters')
    .optional()
    .nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

// Attachment validation schema

export const attachmentInputSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name must be less than 255 characters'),
  filePath: z.string().min(1, 'File path is required'),
  fileSize: z
    .number()
    .int()
    .min(0, 'File size must be positive')
    .max(100 * 1024 * 1024, 'File size cannot exceed 100MB'),
  mimeType: z.string().min(1, 'MIME type is required'),
});

// Helper function to parse time string (HH:mm) to minutes
export function parseTimeToMinutes(timeString: string): number {
  const match = timeString.match(timeFormatRegex);
  if (!match) {
    throw new Error('Invalid time format');
  }
  const parts = timeString.split(':').map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  return hours * 60 + minutes;
}

// Helper function to format minutes to time string (HH:mm)
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Type exports for use with React Hook Form
export type TaskInputFormData = z.infer<typeof taskInputSchema>;
export type TaskUpdateFormData = z.infer<typeof taskUpdateSchema>;
export type ListInputFormData = z.infer<typeof listInputSchema>;
export type ListUpdateFormData = z.infer<typeof listUpdateSchema>;
export type LabelInputFormData = z.infer<typeof labelInputSchema>;
export type LabelUpdateFormData = z.infer<typeof labelUpdateSchema>;
export type ReminderInputFormData = z.infer<typeof reminderInputSchema>;
export type RecurringPatternInputFormData = z.infer<typeof recurringPatternInputSchema>;
export type AttachmentInputFormData = z.infer<typeof attachmentInputSchema>;
