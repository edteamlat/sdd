# Tasks: task-cli — Gestor de Tareas Personal

**Input**: Design documents from `/specs/001-task-cli-gestor/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/cli-commands.md ✅, quickstart.md ✅

**Tests**: Incluidos según arquitectura definida en research.md (Vitest + DB :memory:)

**Organization**: Las tareas están agrupadas por historia de usuario para permitir implementación y verificación independiente de cada historia.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias incompletas)
- **[Story]**: Historia de usuario a la que pertenece la tarea (US1–US5)
- Todas las tareas incluyen rutas de archivo exactas

---

## Phase 1: Setup (Infraestructura compartida)

**Purpose**: Inicialización del proyecto, estructura de carpetas y configuración base

- [X] T001 Inicializar proyecto Node.js: crear `package.json` con name, version, description, main, bin, files, scripts (build/dev/test/prepare) según quickstart.md
- [X] T002 Crear `tsconfig.json` con target ES2022, module CommonJS, strict true, outDir dist, rootDir src, esModuleInterop true, resolveJsonModule true
- [X] T003 Instalar dependencias de producción: `better-sqlite3@^12.8.0`, `commander@^14.0.3`, `cli-table3@^0.6.5`
- [X] T004 Instalar dependencias de desarrollo: `typescript@^5.x`, `tsx@^4.21.0`, `vitest`, `@types/better-sqlite3@^7.6.13`, `@types/node`
- [X] T005 [P] Crear estructura de carpetas: `src/commands/`, `src/db/`, `src/utils/`, `tests/db/`, `tests/utils/`

---

## Phase 2: Foundational (Bloqueantes para todas las historias)

**Purpose**: Capa de base de datos, tipos TypeScript y utilidades puras que todas las historias necesitan

**⚠️ CRÍTICO**: Ninguna historia de usuario puede comenzar hasta que esta fase esté completa

- [X] T006 Crear tipos TypeScript en `src/db/types.ts`: `Status`, `Priority`, `Task`, `CreateTaskInput`, `UpdateTaskInput`, `ListFilters` según data-model.md
- [X] T007 Implementar migraciones en `src/db/migrations.ts`: función `applyMigrations(db: Database)` con `CREATE TABLE IF NOT EXISTS tasks` según esquema SQL de data-model.md
- [X] T008 Implementar cliente de DB en `src/db/client.ts`: función `initDb()` que calcula ruta `~/.task-cli/tasks.db`, crea directorio con `fs.mkdirSync`, abre DB con `new Database(path)`, activa WAL pragma, llama a `applyMigrations(db)` y exporta la instancia
- [X] T009 [P] Implementar validadores en `src/utils/validate.ts`: `validateTitle(title)`, `validateStatus(value)`, `validatePriority(value)`, `validateTransition(from, to)`, `validateDeleteable(task: Task)` (lanza error si `task.status !== 'todo'` con mensaje `"No se puede borrar la tarea <id>: el estado actual es '<status>'. Solamente las tareas en estado 'todo' pueden ser borradas."`) con mensajes de error exactos de data-model.md
- [X] T010 [P] Implementar formateador de fechas en `src/utils/format.ts`: función `formatDate(isoUtc: string): string` que convierte ISO 8601 UTC a `"YYYY-MM-DD HH:MM"`
- [X] T011 [P] Implementar tests unitarios de validadores en `tests/utils/validate.test.ts`: casos de error para título vacío, status inválido, priority inválida, las 2 transiciones inválidas (todo→done, done→todo), las 4 transiciones válidas (todo→in-progress, in-progress→done, in-progress→todo, done→in-progress), y `validateDeleteable`: pasa sin error para tarea en `todo`, lanza error para `in-progress` y para `done` con el mensaje exacto del contrato
- [X] T012 [P] Implementar tests unitarios de formatDate en `tests/utils/format.test.ts`: convertir fecha UTC conocida, verificar formato de salida `YYYY-MM-DD HH:MM`

**Checkpoint**: Capa DB, tipos y utilidades listas — las historias de usuario pueden comenzar

---

## Phase 3: User Story 1 — Crear una tarea nueva (Priority: P1) 🎯 MVP

**Goal**: El usuario puede crear tareas con título, prioridad opcional y descripción opcional. El sistema persiste la tarea y confirma con ID asignado.

**Independent Test**: Ejecutar `npm run dev -- add "Comprar leche"` y verificar que responde con ID=1, estado "todo", prioridad "medium". Ejecutar con `--priority high --description "Desc"` y verificar campos correctos. Ejecutar sin título y verificar error en stderr + exit 1.

### Implementación para User Story 1

- [X] T013 [US1] Implementar CRUD de tareas en `src/db/tasks.ts`: funciones `createTask(db, input: CreateTaskInput): Task`, `getTaskById(db, id: number): Task | undefined` — las demás funciones se añadirán en historias posteriores
- [X] T014 [US1] Implementar comando `add` en `src/commands/add.ts`: registrar comando `add <title>` con opciones `--priority/-p` (default "medium") y `--description/-d`, validar con `validateTitle` y `validatePriority`, llamar a `createTask`, imprimir confirmación a stdout con formato del contrato cli-commands.md
- [X] T015 [US1] Implementar entry point en `src/index.ts`: shebang `#!/usr/bin/env node`, instanciar Commander, llamar a `initDb()`, registrar `registerAddCommand(program, db)`, llamar a `program.parse(process.argv)`
- [X] T016 [US1] Implementar tests de creación de tareas en `tests/db/tasks.test.ts`: patrón `beforeEach`/`afterEach` con `new Database(':memory:')` + `applyMigrations(db)`, probar `createTask` con campos mínimos, campos completos y verificar ID autoincremental

**Checkpoint**: `task add "Mi tarea"` funciona end-to-end. User Story 1 verificable independientemente.

---

## Phase 4: User Story 2 — Listar tareas (Priority: P2)

**Goal**: El usuario puede ver todas sus tareas en tabla ordenada, con filtros opcionales por estado y/o prioridad. Muestra mensaje si no hay resultados.

**Independent Test**: Tras crear 3 tareas con distintos estados y prioridades, ejecutar `task list` y verificar tabla con columnas ID, Título, Estado, Prioridad, Creado ordenada de más reciente a más antigua. Verificar `task list --status todo` filtra correctamente. Verificar `task list` sin tareas muestra mensaje apropiado.

### Implementación para User Story 2

- [X] T017 [US2] Añadir función `listTasks(db, filters: ListFilters): Task[]` en `src/db/tasks.ts`: SQL con `ORDER BY created_at DESC` y cláusulas `WHERE` opcionales para `status` y `priority`
- [X] T018 [US2] Implementar renderizador de tabla en `src/utils/table.ts`: función `renderTasksTable(tasks: Task[]): string` con `cli-table3`, colWidths `[6, 38, 14, 12, 18]`, truncado de títulos > 36 chars con `…`, usando `formatDate` para la columna Creado
- [X] T019 [US2] Implementar comando `list` en `src/commands/list.ts`: opciones `--status/-s` y `--priority/-p`, validar filtros con `validateStatus`/`validatePriority` (si presentes), llamar a `listTasks`, si vacío imprimir mensaje según contrato, si hay resultados imprimir `renderTasksTable`
- [X] T020 [US2] Registrar `registerListCommand(program, db)` en `src/index.ts`
- [X] T021 [US2] Ampliar `tests/db/tasks.test.ts` con tests de `listTasks`: sin filtros (orden DESC), filtro por status, filtro por priority, filtro combinado, lista vacía

**Checkpoint**: `task list` y `task list --status todo --priority high` funcionan. User Stories 1 y 2 verificables.

---

## Phase 5: User Story 3 — Cambiar el estado de una tarea (Priority: P3)

**Goal**: El usuario puede mover una tarea por su ciclo de vida usando su ID. Las transiciones inválidas son rechazadas con mensajes explicativos.

**Independent Test**: Crear tarea, ejecutar `task status 1 in-progress` y verificar confirmación. Ejecutar `task status 1 done` y verificar. Intentar `task status 1 todo` (desde done) y verificar error en stderr + exit 1. Intentar `task status 99 in-progress` y verificar error de "no encontrada".

### Implementación para User Story 3

- [X] T022 [US3] Añadir función `changeTaskStatus(db, id: number, newStatus: Status): Task` en `src/db/tasks.ts`: verificar existencia con `getTaskById`, lanzar error si no existe, ejecutar SQL `UPDATE tasks SET status = ? WHERE id = ?`, retornar tarea actualizada — función separada de `updateTask` porque el cambio de estado requiere validación de transición y no forma parte de `UpdateTaskInput`
- [X] T023 [US3] Implementar comando `status` en `src/commands/status.ts`: argumentos `<id>` y `<newStatus>`, validar status con `validateStatus`, obtener tarea actual con `getTaskById` (error si no existe), validar transición con `validateTransition`, llamar a `changeTaskStatus`, imprimir confirmación `"Tarea #N actualizada: <from> → <to>"` a stdout
- [X] T024 [US3] Registrar `registerStatusCommand(program, db)` en `src/index.ts`
- [X] T025 [US3] Ampliar `tests/db/tasks.test.ts` con tests de `changeTaskStatus`: las 4 transiciones válidas cambian el estado correctamente, tarea no encontrada lanza error

**Checkpoint**: `task status <id> <newStatus>` funciona con validación de máquina de estados. User Story 3 verificable.

---

## Phase 6: User Story 4 — Actualizar datos de una tarea (Priority: P4)

**Goal**: El usuario puede modificar título, descripción y/o prioridad de una tarea existente sin borrarla ni cambiar su estado.

**Independent Test**: Crear tarea con título "Revisión". Ejecutar `task update 1 --title "Revisión semanal"` y verificar en `task list` que el título cambió. Ejecutar `task update 1 --priority low --description "Nueva desc"` y verificar que prioridad y descripción cambiaron manteniendo título. Ejecutar `task update 1` sin flags y verificar error en stderr + exit 1. Intentar `task update 99 --title "X"` y verificar error de "no encontrada".

### Implementación para User Story 4

- [X] T026 [US4] Implementar comando `update` en `src/commands/update.ts`: argumento `<id>`, opciones `--title/-t`, `--description/-d`, `--priority/-p`, validar que al menos un flag esté presente (error si ninguno), validar `title` si presente con `validateTitle`, validar `priority` si presente con `validatePriority`, obtener tarea con `getTaskById` (error si no existe), llamar a `updateTask`, imprimir `"Tarea #N actualizada."` a stdout
- [X] T027 [US4] Registrar `registerUpdateCommand(program, db)` en `src/index.ts`
- [X] T028 [US4] Ampliar `tests/db/tasks.test.ts` con tests de `updateTask` para campos de datos: actualizar solo título, solo priority, solo description, combinación, verificar que campos no mencionados no cambian, tarea no encontrada lanza error

**Checkpoint**: `task update <id> [--title] [--description] [--priority]` funciona con actualización parcial. User Story 4 verificable.

---

## Phase 7: User Story 5 — Eliminar una tarea (Priority: P5)

**Goal**: El usuario puede eliminar permanentemente una tarea con confirmación interactiva o con `--force` para flujos automatizados.

**Independent Test**: Crear tarea (estado `todo`), ejecutar `task delete 1`, responder "s" y verificar que ya no aparece en `task list`. Repetir respondiendo "n" y verificar que la tarea persiste. Ejecutar `task delete 1 --force` y verificar eliminación sin prompt. Ejecutar `task delete 99` y verificar error de "no encontrada". Crear tarea, avanzarla a `in-progress` con `task status`, ejecutar `task delete` y verificar error en stderr con mensaje de estado + exit 1 (la tarea NO se elimina). Repetir con tarea en `done`.

### Implementación para User Story 5

- [X] T029 [US5] Implementar confirmación interactiva en `src/utils/confirm.ts`: función `confirm(question: string): Promise<boolean>` usando `readline/promises` sobre stdin/stderr, acepta `s|si|y|yes` insensible a mayúsculas
- [X] T030 [US5] Añadir función `deleteTask(db, id: number): void` en `src/db/tasks.ts`: verificar existencia con `getTaskById`, lanzar error si no existe, ejecutar `DELETE FROM tasks WHERE id = ?`
- [X] T031 [US5] Implementar comando `delete` en `src/commands/delete.ts`: argumento `<id>`, opción `--force/-f`, con el orden de validación: 1) verificar existencia con `getTaskById` (error si no existe), 2) llamar a `validateDeleteable(task)` (error a stderr + exit 1 si estado ≠ `todo` — aplica también con `--force`), 3) si `--force` eliminar directamente, 4) si no, llamar a `confirm("¿Eliminar tarea #N \"<título>\"?")`, eliminar si confirma, imprimir "Operación cancelada." si niega, imprimir `"Tarea #N eliminada."` a stdout en caso de éxito
- [X] T032 [US5] Registrar `registerDeleteCommand(program, db)` en `src/index.ts`
- [X] T033 [US5] Ampliar `tests/db/tasks.test.ts` con tests de `deleteTask`: eliminar tarea existente en estado `todo`, intentar eliminar ID inexistente lanza error, verificar que `getTaskById` retorna `undefined` tras eliminación

**Checkpoint**: `task delete <id>` funciona con y sin `--force`. Las 5 historias de usuario están implementadas.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verificación end-to-end, build de distribución e instalación global

- [X] T034 Verificar que `tsc --noEmit` no reporta errores de tipos en todo el proyecto
- [X] T035 Ejecutar `npm test` y confirmar que todos los tests pasan (validate, format, tasks CRUD)
- [X] T036 [P] Ejecutar `npm run build` y verificar que `dist/index.js` se genera correctamente con shebang preservado
- [X] T037 [P] Validar flujo completo del quickstart.md: `npm install -g .`, ejecutar `task add "Prueba"`, `task list`, `task status 1 in-progress`, `task update 1 --title "Prueba actualizada"`, `task delete 1 --force`
- [X] T038 [P] Añadir test de rendimiento en `tests/db/tasks.test.ts` (SC-002): insertar 100 tareas en DB `:memory:` y medir con `performance.now()` que `listTasks` completa en < 1000 ms

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede comenzar de inmediato
- **Foundational (Phase 2)**: Depende de Phase 1 — BLOQUEA todas las historias de usuario
- **User Stories (Phases 3–7)**: Todas dependen de Phase 2
  - US1 (Phase 3): Sin dependencias entre historias — puede comenzar en cuanto Phase 2 esté lista
  - US2 (Phase 4): Requiere `getTaskById` de T013 (US1) y el entry point de T015
  - US3 (Phase 5): Requiere `getTaskById` (T013); T022 crea `changeTaskStatus`
  - US4 (Phase 6): Requiere `updateTask` de T022 (US3)
  - US5 (Phase 7): Requiere `getTaskById` de T013 (US1) — independiente de US3/US4
- **Polish (Phase 8)**: Depende de que todas las historias estén completas

### User Story Dependencies

- **US1 (P1)**: Puede comenzar tras Phase 2 — es la historia base del sistema
- **US2 (P2)**: Requiere que `getTaskById` exista (T013) y el entry point (T015) — iniciar después de US1
- **US3 (P3)**: Requiere `getTaskById` (T013) — T022 crea `changeTaskStatus` como función independiente
- **US4 (P4)**: Requiere `updateTask` (T026 lo usa) — `updateTask` se crea en T026; puede iniciarse después de T013
- **US5 (P5)**: Requiere `getTaskById` (T013) y `deleteTask` (T030) — puede iniciarse tras US1

### Within Each User Story

- Siempre: capa DB → comando → registro en index.ts → tests
- Tests de `tasks.test.ts` se amplían en cada fase (mismo archivo, sección nueva)

### Parallel Opportunities

- T009 (validate.ts), T010 (format.ts) pueden ejecutarse en paralelo dentro de Phase 2
- T011 (validate tests) y T012 (format tests) pueden ejecutarse en paralelo entre sí
- T036 (build) y T037 (validación quickstart) pueden ejecutarse en paralelo dentro de Phase 8
- US4 y US5 pueden trabajarse en paralelo si `updateTask` (T022) ya está completa

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Ejecutar en paralelo:
Task T009: "Implementar src/utils/validate.ts"
Task T010: "Implementar src/utils/format.ts"

# Luego en paralelo (dependen de T009/T010 respectivamente):
Task T011: "Implementar tests/utils/validate.test.ts"
Task T012: "Implementar tests/utils/format.test.ts"
```

## Parallel Example: User Story 1

```bash
# Secuencial dentro de US1:
T013 → T014 → T015 → T016
# (CRUD base → comando add → entry point → tests)
```

---

## Implementation Strategy

### MVP First (User Story 1 solamente)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — bloquea todo)
3. Completar Phase 3: User Story 1
4. **PARAR Y VALIDAR**: `npm run dev -- add "Mi tarea"` funciona completo
5. Demo/entrega si se requiere

### Incremental Delivery

1. Setup + Foundational → Base lista
2. US1 → Crear tareas — validar → Demo (MVP mínimo)
3. US2 → Listar tareas — validar → Demo
4. US3 → Cambiar estado — validar → Demo
5. US4 → Actualizar datos — validar → Demo
6. US5 → Eliminar tareas — validar → Demo completo
7. Polish → Build + instalación global

### Parallel Team Strategy

Con múltiples desarrolladores (tras completar Phase 2):

1. Dev A: US1 + US2 (add y list, el flujo de lectura principal)
2. Dev B: US3 + US4 (status y update, la capa de escritura)
3. Dev C: US5 + Polish (delete y distribución)

---

## Notes

- `[P]` = archivos distintos, sin dependencias incompletas entre sí
- `[Story]` mapea cada tarea a su historia de usuario para trazabilidad
- `tests/db/tasks.test.ts` crece incrementalmente en cada fase — es un archivo único con secciones
- `src/index.ts` crece incrementalmente — cada historia añade un `registerXxxCommand`
- `src/db/tasks.ts` crece incrementalmente — cada historia añade o amplía funciones CRUD
- Hacer commit tras cada checkpoint de historia
- Detenerse en cualquier checkpoint para validar la historia independientemente
