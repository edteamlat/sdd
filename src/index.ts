#!/usr/bin/env node
import { Command } from 'commander';
import { initDb } from './db/client';
import { registerAddCommand } from './commands/add';
import { registerListCommand } from './commands/list';
import { registerStatusCommand } from './commands/status';
import { registerUpdateCommand } from './commands/update';
import { registerDeleteCommand } from './commands/delete';

const program = new Command();
program
  .name('task')
  .description('Gestión de tareas personales desde la terminal.')
  .version('1.0.0');

const db = initDb();

registerAddCommand(program, db);
registerListCommand(program, db);
registerStatusCommand(program, db);
registerUpdateCommand(program, db);
registerDeleteCommand(program, db);

program.parse(process.argv);
