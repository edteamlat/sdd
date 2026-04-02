import type { Command } from 'commander';
import type { Database } from 'better-sqlite3';
import { validateStatus, validateTransition } from '../utils/validate';
import { getTaskById, changeTaskStatus } from '../db/tasks';

export function registerStatusCommand(program: Command, db: Database): void {
  program
    .command('status <id> <newStatus>')
    .description('Cambiar el estado de una tarea')
    .action((id: string, newStatus: string) => {
      try {
        const numId = parseInt(id, 10);
        const validStatus = validateStatus(newStatus);
        const task = getTaskById(db, numId);
        if (!task) {
          process.stderr.write(`Error: Tarea #${numId} no encontrada\n`);
          process.exit(1);
        }
        validateTransition(task.status, validStatus);
        changeTaskStatus(db, numId, validStatus);
        process.stdout.write(`Tarea #${numId} actualizada: ${task.status} → ${validStatus}\n`);
      } catch (err) {
        process.stderr.write(`Error: ${(err as Error).message}\n`);
        process.exit(1);
      }
    });
}
