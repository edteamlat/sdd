# Implementation Plan: task-cli — Gestor de Tareas Personal desde la Terminal

**Branch**: `001-task-cli-gestor` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-task-cli-gestor/spec.md`

## Summary

CLI de gestión de tareas personales en TypeScript + Node.js LTS, con almacenamiento SQLite (better-sqlite3), interfaz Commander.js y presentación en tabla (cli-table3). Cinco comandos: `add`, `list`, `status`, `update`, `delete`. La lógica de negocio se mantiene plana (`commands/`, `db/`, `utils/`) sin capas adicionales, siguiendo la Constitución §III. Las eliminaciones están restringidas a tareas en estado `todo` (FR-022).

## Technical Context

**Language/Version**: TypeScript 5.x strict, Node.js LTS ≥ 20.x  
**Primary Dependencies**: Commander.js `^14.0.3`, better-sqlite3 `^12.8.0`, cli-table3 `^0.6.5`  
**Storage**: SQLite en `~/.task-cli/tasks.db`, sin ORM, SQL plano  
**Testing**: Vitest con DB `:memory:`, inyección explícita de `db` como parámetro  
**Target Platform**: macOS / Linux / Windows (Node.js LTS)  
**Project Type**: CLI  
**Performance Goals**: Listado de 100 tareas < 1 segundo (SC-002)  
**Constraints**: Sin stack traces al usuario, errores a stderr, salida normal a stdout  
**Scale/Scope**: Uso personal monousuario, sin concurrencia

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Notas |
|-----------|--------|-------|
| §I — TypeScript + Node.js LTS | ✅ PASS | TypeScript strict, Node LTS ≥ 20 |
| §II — SQLite vía better-sqlite3, sin ORM | ✅ PASS | SQL plano, `~/.task-cli/tasks.db` |
| §III — Estructura plana por funcionalidad | ✅ PASS | `commands/`, `db/`, `utils/`; sin repositorios ni servicios |
| §IV — Funciones > clases, sin `any` implícito | ✅ PASS | Funciones puras, strict mode activado |
| §V — Commander.js como framework CLI | ✅ PASS | `commander@^14.0.3` |
| §VI — Sin stack traces; errores a stderr, exit 1 | ✅ PASS | Manejo explícito en cada comando |
| §VII — Tests con Vitest, lógica de negocio cubierta | ✅ PASS | DB `:memory:`, inyección explícita |
| §VIII — Sin dependencias injustificadas | ✅ PASS | Colores ANSI raw (sin chalk/colors); readline nativo para confirmación |
| §IX — Salida legible; tablas con cli-table3; colores solo por estado | ✅ PASS | cli-table3, ANSI raw |
| §X — `npm install -g` funcional; campo `bin` correcto | ✅ PASS | `"bin": { "task": "dist/index.js" }` |

**No se detectaron violaciones. Sin tabla de Complexity Tracking necesaria.**

## Project Structure

### Documentation (this feature)

```text
specs/001-task-cli-gestor/
├── plan.md              # Este archivo
├── research.md          # Phase 0 — decisiones técnicas
├── data-model.md        # Phase 1 — entidades, esquema SQL, tipos TS, validaciones
├── quickstart.md        # Phase 1 — setup, comandos de desarrollo
├── contracts/
│   └── cli-commands.md  # Phase 1 — contratos de interfaz de cada comando
└── tasks.md             # Phase 2 output (/speckit.tasks — NO creado aquí)
```

### Source Code

```text
src/
├── index.ts              # Entry point: shebang, initDb(), registro de comandos, program.parse()
├── commands/
│   ├── add.ts            # registerAddCommand(program, db)
│   ├── list.ts           # registerListCommand(program, db)
│   ├── status.ts         # registerStatusCommand(program, db)
│   ├── update.ts         # registerUpdateCommand(program, db)
│   └── delete.ts         # registerDeleteCommand(program, db)
├── db/
│   ├── client.ts         # initDb(): crea ~/.task-cli/, abre DB, aplica migraciones
│   ├── migrations.ts     # applyMigrations(db): CREATE TABLE IF NOT EXISTS tasks
│   ├── tasks.ts          # CRUD: createTask, listTasks, getTaskById, updateTask, changeTaskStatus, deleteTask
│   └── types.ts          # Status, Priority, Task, CreateTaskInput, UpdateTaskInput, ListFilters
└── utils/
    ├── validate.ts       # validateTitle, validateStatus, validatePriority, validateTransition, validateDeleteable
    ├── format.ts         # formatDate(isoUtc) → "YYYY-MM-DD HH:MM"
    ├── table.ts          # renderTasksTable(tasks): cli-table3 con colores ANSI por estado
    └── confirm.ts        # confirm(question): readline/promises → boolean

tests/
├── db/
│   └── tasks.test.ts     # CRUD con DB :memory: (beforeEach/afterEach)
└── utils/
    ├── validate.test.ts  # Validaciones, transiciones, restricción de eliminación
    └── format.test.ts    # formatDate: casos UTC, formato de salida
```

**Structure Decision**: Estructura plana Option 1 (Constitución §III). Sin repositorios, servicios ni casos de uso. La inyección de `db` ocurre en `index.ts` y se propaga como parámetro explícito a cada función CRUD y a cada registrador de comando.

## Phase 0: Research

Ver [research.md](./research.md). Todas las decisiones técnicas están resueltas:

- **DB**: singleton creado en `index.ts`, inyectado como parámetro — no módulo global
- **Transacciones**: no requeridas para CRUD de tarea única; SQLite provee transacción implícita
- **Tests**: `new Database(':memory:')` + `applyMigrations(db)` en `beforeEach` — sin mocks
- **Comandos**: patrón `register*Command(program, db)` — ya en uso en el codebase
- **Shebang**: `#!/usr/bin/env node` en `src/index.ts`, preservado por `tsc`
- **Colores**: ANSI raw en celdas de cli-table3 — sin dependencias adicionales

## Phase 1: Design & Contracts

### Data Model

Ver [data-model.md](./data-model.md). Resumen:

**Entidad**: `Task` — `id`, `title`, `description`, `status`, `priority`, `created_at`

**Esquema SQL** (en `db/migrations.ts`):
```sql
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
```

**Transiciones de estado válidas**:
- `todo → in-progress` ✓
- `in-progress → done` ✓
- `in-progress → todo` ✓
- `done → in-progress` ✓
- `todo → done` ✗ | `done → todo` ✗

**Restricción de eliminación (FR-022)**:
- Solo tareas en estado `todo` pueden eliminarse
- Error: `"No se puede borrar la tarea <id>: el estado actual es '<status>'. Solamente las tareas en estado 'todo' pueden ser borradas."`
- La validación ocurre en `utils/validate.ts` (`validateDeleteable`) antes de solicitar confirmación

### Contracts

Ver [contracts/cli-commands.md](./contracts/cli-commands.md). Resumen de comandos:

| Comando | Descripción | Restricción clave |
|---------|-------------|-------------------|
| `task add <title>` | Crea tarea; estado inicial `todo` | Título obligatorio |
| `task list` | Tabla ordenada; filtros `--status`, `--priority` | — |
| `task status <id> <status>` | Cambia estado respetando transiciones válidas | 4 transiciones válidas; 2 inválidas |
| `task update <id>` | Actualiza título/descripción/prioridad | Al menos un campo |
| `task delete <id>` | Elimina con confirmación o `--force` | **Solo tareas en `todo`** |

### Decisiones de diseño relevantes

1. **`validateDeleteable`** — función pura en `utils/validate.ts` que recibe la tarea y lanza error si no está en `todo`. Se llama en `commands/delete.ts` antes del prompt de confirmación. Esto garantiza que ni con `--force` se pueda eliminar una tarea no-`todo`.

2. **Orden de validaciones en `delete`**:
   1. Validar que `id` es entero positivo
   2. Buscar la tarea con `getTaskById` — error si no existe
   3. `validateDeleteable(task)` — error si estado ≠ `todo`
   4. Si `--force`: eliminar directamente
   5. Si no: solicitar confirmación → eliminar o cancelar

3. **Colores ANSI en tabla**:
   - `todo` → gris (`\x1b[90m`)
   - `in-progress` → amarillo (`\x1b[33m`)
   - `done` → verde (`\x1b[32m`)

4. **Normalización de input**: `status` y `priority` se convierten a minúsculas en `validate.ts` antes de cualquier operación.

## Complexity Tracking

No aplica. Ninguna violación a la Constitución detectada.
