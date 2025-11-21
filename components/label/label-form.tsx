'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { labelInputSchema } from '@/lib/validations';
import type { LabelInputFormData } from '@/lib/validations';
import type { Label } from '@/types';
import { useState } from 'react';
import { 
  Tag, Heart, Star, Zap, Flag, Clock, 
  CheckCircle, AlertCircle, Info, Bookmark,
  Target, TrendingUp, Award, Gift
} from 'lucide-react';

interface LabelFormProps {
  label?: Label;
  onSubmit: (data: LabelInputFormData) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

// Common icon options for labels
const ICON_OPTIONS = [
  { icon: Tag, name: 'Tag' },
  { icon: Heart, name: 'Heart' },
  { icon: Star, name: 'Star' },
  { icon: Zap, name: 'Zap' },
  { icon: Flag, name: 'Flag' },
  { icon: Clock, name: 'Clock' },
  { icon: CheckCircle, name: 'CheckCircle' },
  { icon: AlertCircle, name: 'AlertCircle' },
  { icon: Info, name: 'Info' },
  { icon: Bookmark, name: 'Bookmark' },
  { icon: Target, name: 'Target' },
  { icon: TrendingUp, name: 'TrendingUp' },
  { icon: Award, name: 'Award' },
  { icon: Gift, name: 'Gift' },
];

// Common color options for labels
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

export function LabelForm({ 
  label, 
  onSubmit, 
  onCancel,
  submitLabel = 'Save Label'
}: LabelFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<LabelInputFormData>({
    resolver: zodResolver(labelInputSchema),
    defaultValues: {
      name: label?.name || '',
      color: label?.color || COLOR_OPTIONS[0],
      icon: label?.icon || ICON_OPTIONS[0]?.name || 'tag',
    },
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');

  const handleFormSubmit = async (data: LabelInputFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find the selected icon component
  const SelectedIconComponent = ICON_OPTIONS.find(opt => opt.name === selectedIcon)?.icon || Tag;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Label Name */}
      <div className="space-y-2.5">
        <label htmlFor="name" className="text-sm font-medium">
          Label Name <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          placeholder="Enter label name"
          {...register('name')}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Icon Selector */}
      <div className="space-y-2.5">
        <label className="text-sm font-medium">
          Icon <span className="text-destructive">*</span>
        </label>
        <Controller
          name="icon"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-7 gap-2.5">
              {ICON_OPTIONS.map(({ icon: IconComponent, name }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => field.onChange(name)}
                  className={cn(
                    'h-12 w-12 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-110 shadow-sm hover:shadow',
                    field.value === name
                      ? 'border-primary bg-primary/10 scale-110 shadow-md'
                      : 'border-border hover:border-primary/50'
                  )}
                  aria-label={`Select ${name} icon`}
                >
                  <IconComponent className="h-5 w-5" />
                </button>
              ))}
            </div>
          )}
        />
        {errors.icon && (
          <p className="text-sm text-destructive">{errors.icon.message}</p>
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
          <SelectedIconComponent 
            className="h-5 w-5" 
            style={{ color: selectedColor }}
          />
          <span className="font-medium">{watch('name') || 'Label Name'}</span>
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
