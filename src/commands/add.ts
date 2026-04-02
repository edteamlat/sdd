import type { Command } from 'commander';
import type { Database } from 'better-sqlite3';
import { validateTitle, validatePriority } from '../utils/validate';
import { createTask } from '../db/tasks';
import { formatDate } from '../utils/format';

export function registerAddCommand(program: Command, db: Database): void {
  program
    .command('add <title>')
    .description('Crear una nueva tarea')
    .option('-p, --priority <level>', 'Prioridad de la tarea (high, medium, low)', 'medium')
    .option('-d, --description <text>', 'Descripción opcional')
    .action((title: string, options: { priority: string; description?: string }) => {
      try {
        const validTitle = validateTitle(title);
        const validPriority = validatePriority(options.priority);
        const task = createTask(db, {
          title: validTitle,
          priority: validPriority,
          description: options.description,
        });
        process.stdout.write(
          `Tarea creada:\n` +
          `  ID:          ${task.id}\n` +
          `  Título:      ${task.title}\n` +
          `  Prioridad:   ${task.priority}\n` +
          `  Estado:      ${task.status}\n` +
          `  Creado:      ${formatDate(task.created_at)}\n`
        );
      } catch (err) {
        process.stderr.write(`Error: ${(err as Error).message}\n`);
        process.exit(1);
      }
    });
}
