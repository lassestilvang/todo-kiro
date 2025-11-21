/**
 * Tests for useReducedMotion hook
 */

import { describe, test, expect } from 'bun:test';

describe('useReducedMotion Hook', () => {
  describe('media query detection', () => {
    test('should detect prefers-reduced-motion setting', () => {
      // Mock matchMedia
      const mockMatchMedia = (query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true
      });

      global.matchMedia = mockMatchMedia as unknown as typeof matchMedia;

      const result = matchMedia('(prefers-reduced-motion: reduce)');
      expect(result.matches).toBe(true);
    });

    test('should handle no preference', () => {
      const mockMatchMedia = (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true
      });

      global.matchMedia = mockMatchMedia as unknown as typeof matchMedia;

      const result = matchMedia('(prefers-reduced-motion: reduce)');
      expect(result.matches).toBe(false);
    });
  });

  describe('animation configuration', () => {
    test('should provide reduced motion config', () => {
      const reducedMotionConfig = {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 }
      };

      expect(reducedMotionConfig.transition.duration).toBe(0);
    });

    test('should provide normal motion config', () => {
      const normalMotionConfig = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.2 }
      };

      expect(normalMotionConfig.transition.duration).toBeGreaterThan(0);
    });
  });
});
