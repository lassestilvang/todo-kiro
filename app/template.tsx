'use client';

import { useEffect, useRef } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if View Transition API is supported
    if ('startViewTransition' in document) {
      // View transitions are handled automatically by Next.js
      // when experimental.viewTransitions is enabled
      return;
    }

    // Fallback for browsers that don't support View Transition API
    // Add a simple fade-in effect
    if (contentRef.current) {
      contentRef.current.style.opacity = '0';
      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.style.transition = 'opacity 300ms ease-in-out';
          contentRef.current.style.opacity = '1';
        }
      });
    }
  }, []);

  return (
    <div ref={contentRef} style={{ opacity: 1 }}>
      {children}
    </div>
  );
}
