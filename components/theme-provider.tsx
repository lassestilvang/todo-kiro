'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/lib/store/ui-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  useEffect(() => {
    // Initialize theme on mount
    setTheme(theme);
  }, [theme, setTheme]);

  return <>{children}</>;
}
