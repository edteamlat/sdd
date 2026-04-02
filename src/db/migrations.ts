import type { Database } from 'better-sqlite3';

export function applyMigrations(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL CHECK(trim(title) != ''),
      description TEXT,
      status      TEXT    NOT NULL DEFAULT 'todo'
                          CHECK(status IN ('todo', 'in-progress', 'done')),
      priority    TEXT    NOT NULL DEFAULT 'medium'
                          CHECK(priority IN ('high', 'medium', 'low')),
      created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );
  `);
}
