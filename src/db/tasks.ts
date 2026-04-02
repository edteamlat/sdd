import type { Database } from 'better-sqlite3';
import type { Task, CreateTaskInput, UpdateTaskInput, ListFilters, Status } from './types';

export function createTask(db: Database, input: CreateTaskInput): Task {
  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, priority)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(
    input.title,
    input.description ?? null,
    input.priority ?? 'medium'
  );
  const task = getTaskById(db, result.lastInsertRowid as number);
  if (!task) throw new Error('Error al crear la tarea');
  return task;
}

export function getTaskById(db: Database, id: number): Task | undefined {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  return stmt.get(id) as Task | undefined;
}

export function listTasks(db: Database, filters: ListFilters): Task[] {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  if (filters.priority) {
    conditions.push('priority = ?');
    params.push(filters.priority);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const stmt = db.prepare(`SELECT * FROM tasks ${where} ORDER BY created_at DESC`);
  return stmt.all(...params) as Task[];
}

export function updateTask(db: Database, id: number, input: UpdateTaskInput): Task {
  const existing = getTaskById(db, id);
  if (!existing) throw new Error(`Tarea #${id} no encontrada`);

  const sets: string[] = [];
  const params: unknown[] = [];

  if (input.title !== undefined) {
    sets.push('title = ?');
    params.push(input.title);
  }
  if (input.description !== undefined) {
    sets.push('description = ?');
    params.push(input.description);
  }
  if (input.priority !== undefined) {
    sets.push('priority = ?');
    params.push(input.priority);
  }

  params.push(id);
  db.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`).run(...params);

  return getTaskById(db, id) as Task;
}

export function changeTaskStatus(db: Database, id: number, newStatus: Status): Task {
  const existing = getTaskById(db, id);
  if (!existing) throw new Error(`Tarea #${id} no encontrada`);

  db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(newStatus, id);
  return getTaskById(db, id) as Task;
}

export function deleteTask(db: Database, id: number): void {
  const existing = getTaskById(db, id);
  if (!existing) throw new Error(`Tarea #${id} no encontrada`);
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
}
