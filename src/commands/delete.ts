import type { Command } from 'commander';
import type { Database } from 'better-sqlite3';
import { getTaskById, deleteTask } from '../db/tasks';
import { validateDeleteable } from '../utils/validate';
import { confirm } from '../utils/confirm';

export function registerDeleteCommand(program: Command, db: Database): void {
  program
    .command('delete <id>')
    .description('Eliminar una tarea')
    .option('-f, --force', 'Omitir la confirmación interactiva')
    .action(async (id: string, options: { force?: boolean }) => {
      try {
        const numId = parseInt(id, 10);
        const task = getTaskById(db, numId);
        if (!task) {
          process.stderr.write(`Error: Tarea #${numId} no encontrada\n`);
          process.exit(1);
        }

        validateDeleteable(task);

        if (options.force) {
          deleteTask(db, numId);
          process.stdout.write(`Tarea #${numId} eliminada.\n`);
          return;
        }

        const confirmed = await confirm(`¿Eliminar tarea #${numId} "${task.title}"?`);
        if (confirmed) {
          deleteTask(db, numId);
          process.stdout.write(`Tarea #${numId} eliminada.\n`);
        } else {
          process.stdout.write('Operación cancelada.\n');
        }
      } catch (err) {
        process.stderr.write(`Error: ${(err as Error).message}\n`);
        process.exit(1);
      }
    });
}
