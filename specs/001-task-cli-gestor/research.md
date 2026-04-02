# Research: task-cli

**Branch**: `001-task-cli-gestor` | **Date**: 2026-04-01

---

## 1. better-sqlite3 con TypeScript

**Decision**: `better-sqlite3@^12.8.0` + `@types/better-sqlite3@^7.6.13` (devDependency). Inicialización sincrónica con `new Database(path)`. Directorio `~/.task-cli/` creado previamente con `fs.mkdirSync(..., { recursive: true })`. Pragma `WAL` activado.

**Rationale**: API completamente sincrónica, ideal para CLI. El constructor auto-crea el archivo `.db` pero no los directorios intermedios. Sin ORM según la constitución.

**Alternatives considered**: `sqlite3` (async/callback — descartado), `sql.js` (WASM — más pesado), cualquier ORM (prohibido por Constitución §II).

**Key pattern**:
```typescript
import Database from 'better-sqlite3';
import os from 'os';
import fs from 'fs';
import path from 'path';

const dbDir = path.join(os.homedir(), '.task-cli');
fs.mkdirSync(dbDir, { recursive: true });
const db = new Database(path.join(dbDir, 'tasks.db'));
db.pragma('journal_mode = WAL');
```

---

## 2. Commander.js con TypeScript

**Decision**: `commander@^14.0.3`. Subcomandos con `.command('add <title>')`, argumentos requeridos en `<angle brackets>`, opcionales en `[square brackets]`. Opciones accedidas vía segundo parámetro del `.action()`.

**Rationale**: Versión LTS actual con tipos incluidos, suficientes para este proyecto. No se requiere `@commander-js/extra-typings`.

**Alternatives considered**: `yargs` (más verboso), `@commander-js/extra-typings` (overhead injustificado), `minimist` (sin subcomandos nativos).

**Key pattern**:
```typescript
import { Command } from 'commander';
const program = new Command();
program
  .command('add <title>')
  .option('-p, --priority <level>', 'Priority: low|medium|high', 'medium')
  .action((title: string, options: { priority: string }) => { /* ... */ });
program.parse(process.argv);
```

---

## 3. cli-table3

**Decision**: `cli-table3@^0.6.5`. Truncado manual de títulos largos con función utilitaria antes de insertar en la tabla.

**Rationale**: Soporta anchos de columna, colores y truncado. Tipos integrados suficientes.

**Alternatives considered**: `table` (npm — más complejo), `cli-table`/`cli-table2` (sin mantenimiento activo).

**Key pattern**:
```typescript
import Table from 'cli-table3';
const truncate = (s: string, max: number) =>
  s.length > max ? s.slice(0, max - 1) + '…' : s;
const table = new Table({
  head: ['ID', 'Título', 'Estado', 'Prioridad', 'Creado'],
  colWidths: [6, 38, 14, 12, 18],
  style: { head: [], border: [] },
});
table.push([task.id, truncate(task.title, 36), task.status, task.priority, task.createdAt]);
console.log(table.toString());
```

---

## 4. Distribución del CLI: tsx vs compilación

**Decision**: `tsx@^4.21.0` **solo para desarrollo**. Para distribución, compilar a JS con `tsc` y apuntar `bin.task` al output en `dist/`. Shebang `#!/usr/bin/env node` en `src/index.ts` se preserva tras la compilación.

**Rationale**: Publicar `.ts` sin compilar y depender de `tsx` en producción añade latencia por transpilación en cada invocación y es desaconsejado por la documentación de tsx. `tsc` garantiza chequeo de tipos completo. El campo `bin: { "task": "dist/index.js" }` satisface el requisito de ejecutar como `task` desde la terminal.

**Alternatives considered**: `tsx` en producción (descartado), `ts-node` (problemas con ESM), `pkgroll`/`esbuild` (complejidad innecesaria).

**Key package.json**:
```json
{
  "bin": { "task": "dist/index.js" },
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "prepare": "npm run build",
    "test": "vitest run"
  }
}
```

---

## 5. Vitest con better-sqlite3: Aislamiento en tests

**Decision**: Instancia `new Database(':memory:')` en `beforeEach` + `db.close()` en `afterEach`. La instancia de DB se pasa como parámetro a las funciones bajo test (inyección de dependencia simple). No se usan mocks del módulo.

**Rationale**: DB `:memory:` se destruye al cerrar la conexión, garantizando aislamiento total entre tests sin limpiar tablas manualmente. Las funciones de `db/` reciben la instancia de DB como argumento, haciendo la inyección trivial.

**Alternatives considered**: `vi.mock('better-sqlite3')` (no verifica SQL real), `beforeAll` con limpieza manual (propenso a estado compartido), archivos `.db` temporales (más lento).

**Key pattern**:
```typescript
import { beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { applyMigrations } from '../db/migrations';

let db: Database.Database;
beforeEach(() => {
  db = new Database(':memory:');
  applyMigrations(db); // misma función que en producción
});
afterEach(() => db.close());
```

---

## 6. Confirmación interactiva sin dependencias externas

**Decision**: `readline/promises` (nativo Node.js LTS). Pregunta emitida a `process.stderr` para mantener `stdout` limpio.

**Rationale**: Módulo nativo, API limpia con async/await, sin dependencias externas. Cumple Constitución §VIII (≤20 líneas) y §IX (stdout limpio).

**Alternatives considered**: `readline-sync` (dependencia externa — viola §VIII), `inquirer` (sobredimensionado), `readline` callback-based (verboso).

**Key pattern**:
```typescript
import { createInterface } from 'readline/promises';

export async function confirm(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  const answer = await rl.question(`${question} [s/n]: `);
  rl.close();
  return /^(s|si|y|yes)$/i.test(answer.trim());
}
```

---

## Versiones confirmadas

| Paquete | Versión | Tipo |
|---------|---------|------|
| `better-sqlite3` | `^12.8.0` | dependency |
| `@types/better-sqlite3` | `^7.6.13` | devDependency |
| `commander` | `^14.0.3` | dependency |
| `cli-table3` | `^0.6.5` | dependency |
| `tsx` | `^4.21.0` | devDependency |
| `vitest` | latest stable | devDependency |
| `typescript` | `^5.x` | devDependency |
