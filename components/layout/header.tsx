'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Sun, Moon, Menu, X } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useUIStore } from '@/lib/store/ui-store';
import { SearchResults } from '@/components/search';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search query updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchQuery, setSearchQuery]);

  // Sync local state with store
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Show search results when there's a query
  useEffect(() => {
    setShowSearchResults(searchQuery.trim().length >= 2);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleThemeToggle = useCallback(() => {
    // Cycle through: light -> dark -> system -> light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  }, [theme, setTheme]);

  const getThemeIcon = () => {
    if (theme === 'dark') {
      return <Moon className="h-4 w-4" />;
    }
    return <Sun className="h-4 w-4" />;
  };

  const getThemeLabel = () => {
    if (theme === 'system') return 'System';
    if (theme === 'dark') return 'Dark';
    return 'Light';
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
      role="banner"
    >
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={sidebarOpen}
          aria-controls="sidebar-navigation"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>

        {/* Search input */}
        <div className="flex-1 max-w-md relative" ref={searchContainerRef} role="search">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search tasks..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) {
                  setShowSearchResults(true);
                }
              }}
              className="pl-9 w-full h-10 md:h-9"
              aria-label="Search tasks"
              aria-describedby="search-description"
              aria-autocomplete="list"
              aria-controls={showSearchResults ? 'search-results' : undefined}
              aria-expanded={showSearchResults}
            />
            <span id="search-description" className="sr-only">
              Type to search for tasks by name or description
            </span>
          </div>
          
          {/* Search results dropdown */}
          {showSearchResults && (
            <div 
              id="search-results" 
              className="absolute top-full left-0 right-0 mt-2 z-50"
              role="listbox"
              aria-label="Search results"
            >
              <SearchResults
                onTaskClick={() => {
                  setShowSearchResults(false);
                  setLocalSearchQuery('');
                  setSearchQuery('');
                }}
              />
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={handleThemeToggle}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme. Current theme: ${getThemeLabel()}`}
          title={`Current: ${getThemeLabel()}`}
        >
          <span aria-hidden="true">{getThemeIcon()}</span>
        </Button>
      </div>
    </header>
  );
}
