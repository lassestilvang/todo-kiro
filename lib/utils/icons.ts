import {
  Tag,
  Heart,
  Star,
  Zap,
  Flag,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Bookmark,
  Target,
  TrendingUp,
  Award,
  Gift,
  Bell,
  type LucideIcon,
} from 'lucide-react';

// Map icon names to Lucide icon components
const ICON_MAP: Record<string, LucideIcon> = {
  Tag,
  Heart,
  Star,
  Zap,
  Flag,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Bookmark,
  Target,
  TrendingUp,
  Award,
  Gift,
  Bell,
};

/**
 * Get a Lucide icon component by name
 * Returns Tag icon as fallback if icon name not found
 */
export function getLucideIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || Tag;
}
