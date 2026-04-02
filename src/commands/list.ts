import type { Command } from 'commander';
import type { Database } from 'better-sqlite3';
import { validateStatus, validatePriority } from '../utils/validate';
import { listTasks } from '../db/tasks';
import { renderTasksTable } from '../utils/table';
import type { ListFilters } from '../db/types';

export function registerListCommand(program: Command, db: Database): void {
  program
    .command('list')
    .description('Listar todas las tareas')
    .option('-s, --status <value>', 'Filtrar por estado (todo, in-progress, done)')
    .option('-p, --priority <level>', 'Filtrar por prioridad (high, medium, low)')
    .action((options: { status?: string; priority?: string }) => {
      try {
        const filters: ListFilters = {};
        const hasFilters = options.status !== undefined || options.priority !== undefined;

        if (options.status) {
          filters.status = validateStatus(options.status);
        }
        if (options.priority) {
          filters.priority = validatePriority(options.priority);
        }

        const tasks = listTasks(db, filters);

        if (tasks.length === 0) {
          if (hasFilters) {
            process.stdout.write('No hay tareas que coincidan con los filtros aplicados.\n');
          } else {
            process.stdout.write('No hay tareas registradas.\n');
          }
          return;
        }

        process.stdout.write(renderTasksTable(tasks) + '\n');
      } catch (err) {
        process.stderr.write(`Error: ${(err as Error).message}\n`);
        process.exit(1);
      }
    });
}
