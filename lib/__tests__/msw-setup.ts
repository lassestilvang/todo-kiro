/**
 * MSW (Mock Service Worker) setup for API mocking in tests
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Define request handlers - MSW will match both relative and absolute URLs
export const handlers = [
  // Tasks endpoints - use wildcard to match any base URL
  http.get('*/api/tasks', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test Task',
        description: null,
        list_id: 'list-1',
        date: null,
        deadline: null,
        estimated_time: null,
        actual_time: null,
        priority: 'none',
        completed: 0,
        completed_at: null,
        parent_task_id: null,
        position: 0,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      }
    ]);
  }),

  http.post('*/api/tasks', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: crypto.randomUUID(),
      name: body.task.name,
      description: body.task.description || null,
      list_id: body.task.list_id,
      date: body.task.date || null,
      deadline: body.task.deadline || null,
      estimated_time: body.task.estimated_time || null,
      actual_time: body.task.actual_time || null,
      priority: body.task.priority || 'none',
      completed: 0,
      completed_at: null,
      parent_task_id: body.task.parent_task_id || null,
      position: body.task.position,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }),

  http.patch('*/api/tasks/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: params.id,
      name: body.updates.name || 'Updated Task',
      description: body.updates.description || null,
      list_id: 'list-1',
      date: body.updates.date || null,
      deadline: body.updates.deadline || null,
      estimated_time: body.updates.estimated_time || null,
      actual_time: body.updates.actual_time || null,
      priority: body.updates.priority || 'none',
      completed: body.updates.completed !== undefined ? body.updates.completed : 0,
      completed_at: body.updates.completed_at || null,
      parent_task_id: null,
      position: 0,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: new Date().toISOString()
    });
  }),

  http.delete('*/api/tasks/:id', () => {
    return HttpResponse.json({ success: true });
  }),

  // Lists endpoints
  http.get('*/api/lists', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Inbox',
        emoji: '📥',
        color: null,
        is_default: 1,
        position: 0,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      }
    ]);
  }),

  http.post('*/api/lists', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: crypto.randomUUID(),
      name: body.name,
      emoji: body.emoji || null,
      color: body.color || null,
      is_default: 0,
      position: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }),

  http.patch('*/api/lists/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: params.id,
      name: body.name || 'Updated List',
      emoji: body.emoji || null,
      color: body.color || null,
      is_default: 0,
      position: 1,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: new Date().toISOString()
    });
  }),

  http.delete('*/api/lists/:id', () => {
    return HttpResponse.json({ success: true });
  }),

  // Labels endpoints
  http.get('*/api/labels', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Important',
        icon: '⭐',
        color: '#ef4444',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      }
    ]);
  }),

  http.post('*/api/labels', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: crypto.randomUUID(),
      name: body.name,
      icon: body.icon || null,
      color: body.color || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }),

  http.patch('*/api/labels/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: params.id,
      name: body.name || 'Updated Label',
      icon: body.icon || null,
      color: body.color || null,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: new Date().toISOString()
    });
  }),

  http.delete('*/api/labels/:id', () => {
    return HttpResponse.json({ success: true });
  }),

  http.get('*/api/labels/:id/tasks', () => {
    return HttpResponse.json([]);
  }),
];

// Create server instance
export const server = setupServer(...handlers);
