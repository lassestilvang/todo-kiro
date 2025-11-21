'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import { 
  Inbox, 
  Calendar, 
  CalendarDays, 
  CalendarRange, 
  ListTodo,
  Plus,
  Tag,
  Pencil,
  Trash2,
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
} from 'lucide-react';
import { Button, Badge, ScrollArea, Separator, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Sheet, SheetContent, SheetTitle } from '@/components/ui';
import { useUIStore } from '@/lib/store/ui-store';
import { useListStore } from '@/lib/store/list-store';
import { useLabelStore } from '@/lib/store/label-store';
import { useTaskStore } from '@/lib/store/task-store';
import { cn } from '@/lib/utils';
import { getOverdueCount } from '@/lib/utils/tasks';
import { ListForm } from '@/components/list';
import { LabelForm } from '@/components/label';
import type { ListInputFormData, LabelInputFormData } from '@/lib/validations';
import { useState } from 'react';
import type { List, Label } from '@/types';

// Map icon names to Lucide icon components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
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
};

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
}

function NavLink({ href, icon, label, badge, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
        'hover:bg-accent hover:text-accent-foreground',
        'active:scale-[0.98] transition-transform',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active && 'bg-accent text-accent-foreground'
      )}
      aria-label={badge ? `${label} (${badge} items)` : label}
      aria-current={active ? 'page' : undefined}
    >
      <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <Badge variant="destructive" className="ml-auto" aria-label={`${badge} overdue tasks`}>
          {badge}
        </Badge>
      )}
    </Link>
  );
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const openTaskForm = useUIStore((state) => state.openTaskForm);
  const lists = useListStore((state) => state.lists);
  const labels = useLabelStore((state) => state.labels);
  const tasks = useTaskStore((state) => state.tasks);
  const addList = useListStore((state) => state.addList);
  const updateList = useListStore((state) => state.updateList);
  const deleteList = useListStore((state) => state.deleteList);
  const addLabel = useLabelStore((state) => state.addLabel);
  const updateLabel = useLabelStore((state) => state.updateLabel);
  const deleteLabel = useLabelStore((state) => state.deleteLabel);
  
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  
  // Calculate overdue count from tasks
  const overdueCount = getOverdueCount(tasks);

  const handleAddList = useCallback(() => {
    setEditingList(null);
    setIsListDialogOpen(true);
  }, []);

  const handleEditList = useCallback((list: List, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingList(list);
    setIsListDialogOpen(true);
  }, []);

  const handleDeleteList = useCallback(async (listId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent deletion of Inbox (default list)
    const list = lists.find(l => l.id === listId);
    if (list?.isDefault) {
      return;
    }
    
    if (confirm('Are you sure you want to delete this list? All tasks in this list will be moved to Inbox.')) {
      try {
        await deleteList(listId);
      } catch (error) {
        console.error('Failed to delete list:', error);
        alert('Failed to delete list. Please try again.');
      }
    }
  }, [lists, deleteList]);

  const handleListFormSubmit = async (data: ListInputFormData) => {
    try {
      if (editingList) {
        await updateList(editingList.id, data);
      } else {
        await addList(data);
      }
      setIsListDialogOpen(false);
      setEditingList(null);
    } catch (error) {
      console.error('Failed to save list:', error);
      alert('Failed to save list. Please try again.');
    }
  };

  const handleListDialogClose = () => {
    setIsListDialogOpen(false);
    setEditingList(null);
  };

  const handleAddLabel = useCallback(() => {
    setEditingLabel(null);
    setIsLabelDialogOpen(true);
  }, []);

  const handleEditLabel = useCallback((label: Label, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingLabel(label);
    setIsLabelDialogOpen(true);
  }, []);

  const handleDeleteLabel = useCallback(async (labelId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this label? It will be removed from all tasks.')) {
      try {
        await deleteLabel(labelId);
      } catch (error) {
        console.error('Failed to delete label:', error);
        alert('Failed to delete label. Please try again.');
      }
    }
  }, [deleteLabel]);

  const handleLabelFormSubmit = async (data: LabelInputFormData) => {
    try {
      if (editingLabel) {
        await updateLabel(editingLabel.id, data);
      } else {
        await addLabel(data);
      }
      setIsLabelDialogOpen(false);
      setEditingLabel(null);
    } catch (error) {
      console.error('Failed to save label:', error);
      alert('Failed to save label. Please try again.');
    }
  };

  const handleLabelDialogClose = () => {
    setIsLabelDialogOpen(false);
    setEditingLabel(null);
  };

  // Sidebar content JSX (reused for both desktop and mobile)
  const sidebarContent = useMemo(() => (
    <>
      <div className="p-4">
        <Button 
          className="w-full min-h-[44px]" 
          size="lg" 
          data-add-task-button
          onClick={() => openTaskForm()}
          aria-label="Add new task"
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add Task
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        {/* Views Section */}
        <nav className="space-y-1 pb-4" aria-label="Views">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Views
          </div>
          
          <NavLink
            href="/inbox"
            icon={<Inbox className="h-4 w-4" />}
            label="Inbox"
            active={pathname === '/inbox'}
          />
          
          <NavLink
            href="/today"
            icon={<Calendar className="h-4 w-4" />}
            label="Today"
            badge={overdueCount}
            active={pathname === '/today'}
          />
          
          <NavLink
            href="/upcoming"
            icon={<CalendarRange className="h-4 w-4" />}
            label="Upcoming"
            active={pathname === '/upcoming'}
          />
          
          <NavLink
            href="/next-7-days"
            icon={<CalendarDays className="h-4 w-4" />}
            label="Next 7 Days"
            active={pathname === '/next-7-days'}
          />
          
          <NavLink
            href="/all"
            icon={<ListTodo className="h-4 w-4" />}
            label="All"
            active={pathname === '/all'}
          />
        </nav>

        <Separator className="my-2" />

        {/* Custom Lists Section */}
        <nav className="space-y-1 pb-4" aria-label="Custom lists">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Lists
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 md:h-6 md:w-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={handleAddList}
              aria-label="Add new list"
            >
              <Plus className="h-4 w-4 md:h-3 md:w-3" aria-hidden="true" />
            </Button>
          </div>
          
          {lists.filter(l => !l.isDefault).length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No custom lists yet
            </div>
          ) : (
            lists
              .filter(l => !l.isDefault)
              .map((list) => (
                <div
                  key={list.id}
                  className="group relative"
                >
                  <Link
                    href={`/list/${list.id}`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                      'hover:bg-accent hover:text-accent-foreground',
                      'active:scale-[0.98] transition-transform',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      pathname === `/list/${list.id}` && 'bg-accent text-accent-foreground'
                    )}
                    aria-label={`${list.name} list`}
                    aria-current={pathname === `/list/${list.id}` ? 'page' : undefined}
                  >
                    <span className="flex-shrink-0 text-base" aria-hidden="true">{list.emoji}</span>
                    <span className="flex-1 truncate">{list.name}</span>
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: list.color }}
                      aria-label={`Color: ${list.color}`}
                    />
                  </Link>
                  
                  {/* Edit and Delete buttons - shown on hover on desktop, always visible on mobile */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex md:hidden md:group-hover:flex items-center gap-1 bg-card/95 rounded-md p-1" role="group" aria-label={`Actions for ${list.name}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 md:h-6 md:w-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={(e) => handleEditList(list, e)}
                      aria-label={`Edit ${list.name} list`}
                    >
                      <Pencil className="h-4 w-4 md:h-3 md:w-3" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 md:h-6 md:w-6 text-destructive hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={(e) => handleDeleteList(list.id, e)}
                      aria-label={`Delete ${list.name} list`}
                    >
                      <Trash2 className="h-4 w-4 md:h-3 md:w-3" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))
          )}
        </nav>

        <Separator className="my-2" />

        {/* Labels Section */}
        <nav className="space-y-1 pb-4" aria-label="Labels">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Labels
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 md:h-6 md:w-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={handleAddLabel}
              aria-label="Add new label"
            >
              <Plus className="h-4 w-4 md:h-3 md:w-3" aria-hidden="true" />
            </Button>
          </div>
          
          {labels.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No labels yet
            </div>
          ) : (
            labels.map((label) => {
              const IconComponent = ICON_MAP[label.icon] || Tag;
              return (
                <div
                  key={label.id}
                  className="group relative"
                >
                  <Link
                    href={`/label/${label.id}`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                      'hover:bg-accent hover:text-accent-foreground',
                      'active:scale-[0.98] transition-transform',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      pathname === `/label/${label.id}` && 'bg-accent text-accent-foreground'
                    )}
                    aria-label={`${label.name} label`}
                    aria-current={pathname === `/label/${label.id}` ? 'page' : undefined}
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0" style={{ color: label.color }} aria-hidden="true" />
                    <span className="flex-1 truncate">{label.name}</span>
                  </Link>
                  
                  {/* Edit and Delete buttons - shown on hover on desktop, always visible on mobile */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex md:hidden md:group-hover:flex items-center gap-1 bg-card/95 rounded-md p-1" role="group" aria-label={`Actions for ${label.name}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 md:h-6 md:w-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={(e) => handleEditLabel(label, e)}
                      aria-label={`Edit ${label.name} label`}
                    >
                      <Pencil className="h-4 w-4 md:h-3 md:w-3" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 md:h-6 md:w-6 text-destructive hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={(e) => handleDeleteLabel(label.id, e)}
                      aria-label={`Delete ${label.name} label`}
                    >
                      <Trash2 className="h-4 w-4 md:h-3 md:w-3" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </nav>
      </ScrollArea>
    </>
  ), [pathname, overdueCount, openTaskForm, lists, labels, handleAddList, handleEditList, handleDeleteList, handleAddLabel, handleEditLabel, handleDeleteLabel]);

  return (
    <>
    {/* Desktop Sidebar - Always visible on desktop */}
    <aside
      className={cn(
        'hidden md:flex flex-col h-full bg-card border-r border-border w-64',
        className
      )}
    >
      {sidebarContent}
    </aside>

    {/* Mobile Sidebar (Sheet) */}
    <Sheet open={sidebarOpen} onOpenChange={toggleSidebar}>
      <SheetContent side="left" className="md:hidden w-[280px] p-0 flex flex-col">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        {sidebarContent}
      </SheetContent>
    </Sheet>
    
    {/* List Form Dialog */}
    <Dialog open={isListDialogOpen} onOpenChange={handleListDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingList ? 'Edit List' : 'Create New List'}
          </DialogTitle>
          <DialogDescription>
            {editingList 
              ? 'Update the details of your list.' 
              : 'Create a new list to organize your tasks.'}
          </DialogDescription>
        </DialogHeader>
        <ListForm
          list={editingList || undefined}
          onSubmit={handleListFormSubmit}
          onCancel={handleListDialogClose}
          submitLabel={editingList ? 'Update List' : 'Create List'}
        />
      </DialogContent>
    </Dialog>

    {/* Label Form Dialog */}
    <Dialog open={isLabelDialogOpen} onOpenChange={handleLabelDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingLabel ? 'Edit Label' : 'Create New Label'}
          </DialogTitle>
          <DialogDescription>
            {editingLabel 
              ? 'Update the details of your label.' 
              : 'Create a new label to categorize your tasks.'}
          </DialogDescription>
        </DialogHeader>
        <LabelForm
          label={editingLabel || undefined}
          onSubmit={handleLabelFormSubmit}
          onCancel={handleLabelDialogClose}
          submitLabel={editingLabel ? 'Update Label' : 'Create Label'}
        />
      </DialogContent>
    </Dialog>
    </>
  );
}
