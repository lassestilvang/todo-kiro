/**
 * Tests for labels API routes
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { initializeDatabase } from '@/lib/db/init';
import { createLabel, getLabelById, getAllLabels } from '@/lib/db/queries/labels';

describe('Labels API Routes', () => {
  beforeEach(async () => {
    await initializeDatabase();
  });

  describe('POST /api/labels', () => {
    test('should create a new label', async () => {
      const labelData = {
        name: 'Important',
        icon: '⭐',
        color: '#ef4444'
      };

      const label = await createLabel(labelData);

      expect(label.name).toBe('Important');
      expect(label.icon).toBe('⭐');
      expect(label.color).toBe('#ef4444');
    });

    test('should create label with default values', async () => {
      const label = await createLabel({ name: 'Simple Label' });

      expect(label.name).toBe('Simple Label');
      expect(label.icon).toBeNull();
      expect(label.color).toBeNull();
    });
  });

  describe('GET /api/labels', () => {
    test('should retrieve all labels', async () => {
      await createLabel({ name: 'Label 1', icon: '🏷️', color: '#3b82f6' });
      await createLabel({ name: 'Label 2', icon: '📌', color: '#10b981' });

      const labels = await getAllLabels();

      expect(labels.length).toBeGreaterThanOrEqual(2);
    });

    test('should return labels ordered by name', async () => {
      await createLabel({ name: 'Zebra' });
      await createLabel({ name: 'Alpha' });

      const labels = await getAllLabels();

      expect(labels[0].name).toBe('Alpha');
      expect(labels[labels.length - 1].name).toBe('Zebra');
    });
  });

  describe('GET /api/labels/:id', () => {
    test('should retrieve label by ID', async () => {
      const created = await createLabel({ name: 'Test Label', icon: '🏷️' });
      const label = await getLabelById(created.id);

      expect(label).toBeDefined();
      expect(label?.id).toBe(created.id);
      expect(label?.name).toBe('Test Label');
    });

    test('should return undefined for non-existent label', async () => {
      const label = await getLabelById('non-existent-id');
      expect(label).toBeUndefined();
    });
  });
});
