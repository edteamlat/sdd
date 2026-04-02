import Table from 'cli-table3';
import type { Task } from '../db/types';
import { formatDate } from './format';

export function renderTasksTable(tasks: Task[]): string {
  const table = new Table({
    head: ['ID', 'Título', 'Estado', 'Prioridad', 'Creado'],
    colWidths: [6, 38, 14, 12, 18],
  });

  for (const task of tasks) {
    const title = task.title.length > 36 ? task.title.slice(0, 35) + '…' : task.title;
    table.push([String(task.id), title, task.status, task.priority, formatDate(task.created_at)]);
  }

  return table.toString();
}
