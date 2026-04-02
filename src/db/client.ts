import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { applyMigrations } from './migrations';

export function initDb(): Database.Database {
  const dbDir = path.join(os.homedir(), '.task-cli');
  fs.mkdirSync(dbDir, { recursive: true });
  const dbPath = path.join(dbDir, 'tasks.db');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  applyMigrations(db);
  return db;
}
