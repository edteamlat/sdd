import type { Command } from 'commander';
import type { Database } from 'better-sqlite3';
import { validateTitle, validatePriority } from '../utils/validate';
import { getTaskById, updateTask } from '../db/tasks';
import type { UpdateTaskInput } from '../db/types';

export function registerUpdateCommand(program: Command, db: Database): void {
  program
    .command('update <id>')
    .description('Actualizar título, descripción o prioridad de una tarea')
    .option('-t, --title <text>', 'Nuevo título')
    .option('-d, --description <text>', 'Nueva descripción')
    .option('-p, --priority <level>', 'Nueva prioridad (high, medium, low)')
    .action((id: string, options: { title?: string; description?: string; priority?: string }) => {
      try {
        const numId = parseInt(id, 10);

        if (!options.title && !options.description && !options.priority) {
          process.stderr.write('Error: Debes especificar al menos un campo para actualizar (--title, --description, --priority)\n');
          process.exit(1);
        }

        const existing = getTaskById(db, numId);
        if (!existing) {
          process.stderr.write(`Error: Tarea #${numId} no encontrada\n`);
          process.exit(1);
        }

        const input: UpdateTaskInput = {};

        if (options.title !== undefined) {
          input.title = validateTitle(options.title);
        }
        if (options.description !== undefined) {
          input.description = options.description;
        }
        if (options.priority !== undefined) {
          input.priority = validatePriority(options.priority);
        }

        updateTask(db, numId, input);
        process.stdout.write(`Tarea #${numId} actualizada.\n`);
      } catch (err) {
        process.stderr.write(`Error: ${(err as Error).message}\n`);
        process.exit(1);
      }
    });
}
