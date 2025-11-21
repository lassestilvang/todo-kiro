import { describe, test, expect, beforeEach } from 'bun:test';
import {
  getAllLabels,
  getLabelById,
  createLabel,
  updateLabel,
  deleteLabel,
} from '../labels';
import { initializeDatabase } from '../../init';

describe('Label Database Functions', () => {
  beforeEach(async () => {
    // Initialize database before each test
    await initializeDatabase();
  });

  describe('createLabel', () => {
    test('should create a new label', () => {
      const label = createLabel({
        name: 'Urgent',
        icon: '🔥',
        color: '#ef4444',
      });

      expect(label).toBeDefined();
      expect(label.id).toBeDefined();
      expect(label.name).toBe('Urgent');
      expect(label.icon).toBe('🔥');
      expect(label.color).toBe('#ef4444');
    });
  });

  describe('getLabelById', () => {
    test('should retrieve label by ID', () => {
      const created = createLabel({
        name: 'Important',
        icon: '⭐',
        color: '#f59e0b',
      });

      const retrieved = getLabelById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Important');
    });

    test('should return undefined for non-existent label', () => {
      const label = getLabelById('non-existent-id');
      expect(label).toBeUndefined();
    });
  });

  describe('getAllLabels', () => {
    test('should return all labels', () => {
      createLabel({
        name: 'Urgent',
        icon: '🔥',
        color: '#ef4444',
      });

      createLabel({
        name: 'Important',
        icon: '⭐',
        color: '#f59e0b',
      });

      const labels = getAllLabels();
      expect(labels.length).toBeGreaterThanOrEqual(2);
    });

    test('should return labels ordered by name', () => {
      createLabel({
        name: 'Zebra',
        icon: '🦓',
        color: '#000000',
      });

      createLabel({
        name: 'Apple',
        icon: '🍎',
        color: '#ef4444',
      });

      const labels = getAllLabels();
      
      // Find our test labels
      const apple = labels.find(l => l.name === 'Apple');
      const zebra = labels.find(l => l.name === 'Zebra');
      
      if (apple && zebra) {
        const appleIndex = labels.indexOf(apple);
        const zebraIndex = labels.indexOf(zebra);
        expect(appleIndex).toBeLessThan(zebraIndex);
      }
    });
  });

  describe('updateLabel', () => {
    test('should update label name', () => {
      const label = createLabel({
        name: 'Original Name',
        icon: '📝',
        color: '#3b82f6',
      });

      updateLabel(label.id, { name: 'Updated Name' });

      const updated = getLabelById(label.id);
      expect(updated?.name).toBe('Updated Name');
    });

    test('should update multiple fields', () => {
      const label = createLabel({
        name: 'Test Label',
        icon: '📝',
        color: '#3b82f6',
      });

      updateLabel(label.id, {
        name: 'Updated Label',
        icon: '⭐',
        color: '#ef4444',
      });

      const updated = getLabelById(label.id);
      expect(updated?.name).toBe('Updated Label');
      expect(updated?.icon).toBe('⭐');
      expect(updated?.color).toBe('#ef4444');
    });
  });

  describe('deleteLabel', () => {
    test('should delete a label', () => {
      const label = createLabel({
        name: 'Test Label',
        icon: '📝',
        color: '#3b82f6',
      });

      deleteLabel(label.id);

      const deleted = getLabelById(label.id);
      expect(deleted).toBeUndefined();
    });
  });
});
