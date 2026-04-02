# Data Model: task-cli

**Branch**: `001-task-cli-gestor` | **Date**: 2026-04-01

---

## Entidades

### Task

Única entidad del sistema. Representa una unidad de trabajo personal.

| Campo | Tipo SQL | Tipo TS | Restricciones | Notas |
|-------|----------|---------|---------------|-------|
| `id` | `INTEGER` | `number` | PRIMARY KEY AUTOINCREMENT | No reutilizable tras eliminación |
| `title` | `TEXT` | `string` | NOT NULL, CHECK(trim(title) != '') | Obligatorio, no puede ser solo espacios |
| `description` | `TEXT` | `string \| null` | NULL permitido | Opcional |
| `status` | `TEXT` | `'todo' \| 'in-progress' \| 'done'` | NOT NULL, DEFAULT 'todo', CHECK | Enumeración |
| `priority` | `TEXT` | `'high' \| 'medium' \| 'low'` | NOT NULL, DEFAULT 'medium', CHECK | Enumeración |
| `created_at` | `TEXT` | `string` | NOT NULL, DEFAULT (datetime('now')) | ISO 8601 UTC almacenado como TEXT |

---

## Esquema SQL

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

> La tabla se crea en `~/.task-cli/tasks.db` mediante `applyMigrations(db)` al inicializar el CLI.

---

## Tipos TypeScript

```typescript
// src/db/types.ts

export type Status = 'todo' | 'in-progress' | 'done';
export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  created_at: string; // ISO 8601 UTC, e.g. "2026-04-01T14:30:00Z"
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
}

export interface ListFilters {
  status?: Status;
  priority?: Priority;
}
```

---

## Máquina de estados: Status

```
     [todo] ──────────────────► [in-progress] ──────────────► [done]
        ▲                              │                         │
        │                              │                         │
        └──────────────────────────────┘                         │
                                       ◄─────────────────────────┘

Transiciones VÁLIDAS:
  todo        → in-progress  ✓
  in-progress → done         ✓
  in-progress → todo         ✓  (devolver al backlog)
  done        → in-progress  ✓  (reabrir para continuar trabajando)

Transiciones INVÁLIDAS:
  todo        → done         ✗  ERROR: "Una tarea debe pasar primero por 'in-progress'"
  done        → todo         ✗  ERROR: "Una tarea completada debe volver a 'in-progress', no a 'todo'"
```

---

## Reglas de validación

| Campo | Regla | Error si falla |
|-------|-------|----------------|
| `title` | No vacío, no solo espacios | `"El título no puede estar vacío"` |
| `status` | Valor en `['todo', 'in-progress', 'done']` | `"Estado inválido: <valor>. Valores permitidos: todo, in-progress, done"` |
| `priority` | Valor en `['high', 'medium', 'low']` | `"Prioridad inválida: <valor>. Valores permitidos: high, medium, low"` |
| Transición de estado | Ver máquina de estados | `"Transición inválida: <from> → <to>. Una tarea en '<from>' no puede pasar directamente a '<to>'"` |
| `id` en update/delete/status | Registro existente en DB | `"Tarea #<id> no encontrada"` |
| `update` sin campos | Al menos un campo presente | `"Debes especificar al menos un campo para actualizar (--title, --description, --priority)"` |
| `delete` — estado de la tarea | La tarea DEBE estar en `todo` | `"No se puede borrar la tarea <id>: el estado actual es '<status>'. Solamente las tareas en estado 'todo' pueden ser borradas."` |

---

## Notas de implementación

- La normalización de `status` y `priority` a minúsculas ocurre en la capa de validación (`utils/validate.ts`) antes de llegar a la DB.
- `created_at` se almacena en UTC (ISO 8601). El formato de presentación `YYYY-MM-DD HH:MM` se aplica en `utils/format.ts` al listar.
- Los IDs son asignados por SQLite AUTOINCREMENT; nunca se reutilizan aunque se eliminen registros intermedios.
- No existe campo `updated_at` en esta versión.
