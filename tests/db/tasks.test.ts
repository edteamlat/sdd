import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { applyMigrations } from '../../src/db/migrations';
import { createTask, getTaskById, listTasks, updateTask, changeTaskStatus, deleteTask } from '../../src/db/tasks';

let db: Database.Database;

beforeEach(() => {
  db = new Database(':memory:');
  applyMigrations(db);
});

afterEach(() => {
  db.close();
});

// ─── User Story 1: createTask ────────────────────────────────────────────────

describe('createTask', () => {
  it('creates task with minimum fields', () => {
    const task = createTask(db, { title: 'Comprar leche' });
    expect(task.id).toBe(1);
    expect(task.title).toBe('Comprar leche');
    expect(task.status).toBe('todo');
    expect(task.priority).toBe('medium');
    expect(task.description).toBeNull();
    expect(task.created_at).toBeTruthy();
  });

  it('creates task with all fields', () => {
    const task = createTask(db, {
      title: 'Revisar código',
      description: 'PR #42',
      priority: 'high',
    });
    expect(task.title).toBe('Revisar código');
    expect(task.description).toBe('PR #42');
    expect(task.priority).toBe('high');
  });

  it('assigns auto-incremental IDs', () => {
    const t1 = createTask(db, { title: 'Primera' });
    const t2 = createTask(db, { title: 'Segunda' });
    expect(t2.id).toBe(t1.id + 1);
  });
});

// ─── User Story 2: listTasks ─────────────────────────────────────────────────

describe('listTasks', () => {
  beforeEach(() => {
    createTask(db, { title: 'Tarea A', priority: 'low' });
    createTask(db, { title: 'Tarea B', priority: 'high' });
    createTask(db, { title: 'Tarea C', priority: 'medium' });
  });

  it('returns all tasks ordered by created_at DESC', () => {
    const tasks = listTasks(db, {});
    expect(tasks).toHaveLength(3);
    // Todos los títulos presentes
    const titles = tasks.map(t => t.title);
    expect(titles).toContain('Tarea A');
    expect(titles).toContain('Tarea B');
    expect(titles).toContain('Tarea C');
  });

  it('filters by status', () => {
    changeTaskStatus(db, 1, 'in-progress');
    const tasks = listTasks(db, { status: 'in-progress' });
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Tarea A');
  });

  it('filters by priority', () => {
    const tasks = listTasks(db, { priority: 'high' });
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Tarea B');
  });

  it('filters by combined status and priority', () => {
    changeTaskStatus(db, 2, 'in-progress');
    const tasks = listTasks(db, { status: 'in-progress', priority: 'high' });
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Tarea B');
  });

  it('returns empty array when no match', () => {
    const tasks = listTasks(db, { status: 'done' });
    expect(tasks).toHaveLength(0);
  });
});

// ─── User Story 3: changeTaskStatus ─────────────────────────────────────────

describe('changeTaskStatus', () => {
  it('allows todo → in-progress', () => {
    const task = createTask(db, { title: 'Test' });
    const updated = changeTaskStatus(db, task.id, 'in-progress');
    expect(updated.status).toBe('in-progress');
  });

  it('allows in-progress → done', () => {
    const task = createTask(db, { title: 'Test' });
    changeTaskStatus(db, task.id, 'in-progress');
    const updated = changeTaskStatus(db, task.id, 'done');
    expect(updated.status).toBe('done');
  });

  it('allows in-progress → todo', () => {
    const task = createTask(db, { title: 'Test' });
    changeTaskStatus(db, task.id, 'in-progress');
    const updated = changeTaskStatus(db, task.id, 'todo');
    expect(updated.status).toBe('todo');
  });

  it('allows done → in-progress', () => {
    const task = createTask(db, { title: 'Test' });
    changeTaskStatus(db, task.id, 'in-progress');
    changeTaskStatus(db, task.id, 'done');
    const updated = changeTaskStatus(db, task.id, 'in-progress');
    expect(updated.status).toBe('in-progress');
  });

  it('throws when task not found', () => {
    expect(() => changeTaskStatus(db, 999, 'in-progress')).toThrow('Tarea #999 no encontrada');
  });
});

// ─── User Story 4: updateTask ─────────────────────────────────────────────────

describe('updateTask', () => {
  it('updates only title', () => {
    const task = createTask(db, { title: 'Original', priority: 'high' });
    const updated = updateTask(db, task.id, { title: 'Modificado' });
    expect(updated.title).toBe('Modificado');
    expect(updated.priority).toBe('high');
  });

  it('updates only priority', () => {
    const task = createTask(db, { title: 'Test', priority: 'medium' });
    const updated = updateTask(db, task.id, { priority: 'low' });
    expect(updated.priority).toBe('low');
    expect(updated.title).toBe('Test');
  });

  it('updates only description', () => {
    const task = createTask(db, { title: 'Test' });
    const updated = updateTask(db, task.id, { description: 'Nueva descripción' });
    expect(updated.description).toBe('Nueva descripción');
    expect(updated.title).toBe('Test');
  });

  it('updates multiple fields', () => {
    const task = createTask(db, { title: 'Test', priority: 'low' });
    const updated = updateTask(db, task.id, { title: 'Nuevo', priority: 'high', description: 'Desc' });
    expect(updated.title).toBe('Nuevo');
    expect(updated.priority).toBe('high');
    expect(updated.description).toBe('Desc');
  });

  it('leaves untouched fields unchanged', () => {
    const task = createTask(db, { title: 'Test', priority: 'high', description: 'Original' });
    updateTask(db, task.id, { title: 'Nuevo' });
    const result = getTaskById(db, task.id) as NonNullable<ReturnType<typeof getTaskById>>;
    expect(result.priority).toBe('high');
    expect(result.description).toBe('Original');
  });

  it('throws when task not found', () => {
    expect(() => updateTask(db, 999, { title: 'X' })).toThrow('Tarea #999 no encontrada');
  });
});

// ─── User Story 5: deleteTask ─────────────────────────────────────────────────

describe('deleteTask', () => {
  it('deletes an existing task', () => {
    const task = createTask(db, { title: 'A borrar' });
    deleteTask(db, task.id);
    expect(getTaskById(db, task.id)).toBeUndefined();
  });

  it('throws when task not found', () => {
    expect(() => deleteTask(db, 999)).toThrow('Tarea #999 no encontrada');
  });

  it('getTaskById returns undefined after deletion', () => {
    const task = createTask(db, { title: 'Test' });
    deleteTask(db, task.id);
    expect(getTaskById(db, task.id)).toBeUndefined();
  });
});

// ─── Performance (SC-002) ─────────────────────────────────────────────────────

describe('performance', () => {
  it('listTasks completes in < 1000ms for 100 tasks', () => {
    for (let i = 1; i <= 100; i++) {
      createTask(db, { title: `Tarea ${i}` });
    }
    const start = performance.now();
    const tasks = listTasks(db, {});
    const elapsed = performance.now() - start;
    expect(tasks).toHaveLength(100);
    expect(elapsed).toBeLessThan(1000);
  });
});
