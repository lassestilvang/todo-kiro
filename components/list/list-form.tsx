'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { listInputSchema } from '@/lib/validations';
import type { ListInputFormData } from '@/lib/validations';
import type { List } from '@/types';
import { useState } from 'react';

interface ListFormProps {
  list?: List;
  onSubmit: (data: ListInputFormData) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

// Common emoji options for lists
const EMOJI_OPTIONS = [
  '📋', '📝', '✅', '🎯', '💼', '🏠', '🛒', '💡', 
  '🎨', '📚', '🏃', '🎵', '🍔', '✈️', '💰', '🎮'
];

// Common color options for lists
const COLOR_OPTIONS = [
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#EAB308', // yellow
  '#84CC16', // lime
  '#22C55E', // green
  '#10B981', // emerald
  '#14B8A6', // teal
  '#06B6D4', // cyan
  '#0EA5E9', // sky
  '#3B82F6', // blue
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#A855F7', // purple
  '#D946EF', // fuchsia
  '#EC4899', // pink
];

export function ListForm({ 
  list, 
  onSubmit, 
  onCancel,
  submitLabel = 'Save List'
}: ListFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<ListInputFormData>({
    resolver: zodResolver(listInputSchema),
    defaultValues: {
      name: list?.name || '',
      color: list?.color || COLOR_OPTIONS[0],
      emoji: list?.emoji || EMOJI_OPTIONS[0],
    },
  });

  const selectedColor = watch('color');
  const selectedEmoji = watch('emoji');

  const handleFormSubmit = async (data: ListInputFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* List Name */}
      <div className="space-y-2.5">
        <label htmlFor="name" className="text-sm font-medium">
          List Name <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          placeholder="Enter list name"
          {...register('name')}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Emoji Selector */}
      <div className="space-y-2.5">
        <label className="text-sm font-medium">
          Emoji <span className="text-destructive">*</span>
        </label>
        <Controller
          name="emoji"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-8 gap-2.5">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => field.onChange(emoji)}
                  className={cn(
                    'h-12 w-12 rounded-lg border-2 text-xl transition-all hover:scale-110 shadow-sm hover:shadow',
                    field.value === emoji
                      ? 'border-primary bg-primary/10 scale-110 shadow-md'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        />
        {errors.emoji && (
          <p className="text-sm text-destructive">{errors.emoji.message}</p>
        )}
      </div>

      {/* Color Picker */}
      <div className="space-y-2.5">
        <label className="text-sm font-medium">
          Color <span className="text-destructive">*</span>
        </label>
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <div className="space-y-3">
              <div className="grid grid-cols-8 gap-2.5">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => field.onChange(color)}
                    className={cn(
                      'h-12 w-12 rounded-lg border-2 transition-all hover:scale-110 shadow-sm hover:shadow',
                      field.value === color
                        ? 'border-foreground scale-110 shadow-md ring-2 ring-foreground/20'
                        : 'border-transparent hover:border-foreground/50'
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              {/* Custom color input */}
              <div className="flex items-center gap-2">
                <label htmlFor="customColor" className="text-sm text-muted-foreground">
                  Or enter custom color:
                </label>
                <Input
                  id="customColor"
                  type="text"
                  placeholder="#FF5733"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-32"
                />
              </div>
            </div>
          )}
        />
        {errors.color && (
          <p className="text-sm text-destructive">{errors.color.message}</p>
        )}
      </div>

      {/* Preview */}
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Preview</label>
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card shadow-sm">
          <span className="text-2xl">{selectedEmoji}</span>
          <span className="font-medium">{watch('name') || 'List Name'}</span>
          <div 
            className="ml-auto h-5 w-5 rounded-full shadow-sm" 
            style={{ backgroundColor: selectedColor }}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
