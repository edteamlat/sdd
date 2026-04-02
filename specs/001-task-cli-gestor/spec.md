# Feature Specification: task-cli — Gestor de Tareas Personal desde la Terminal

**Feature Branch**: `001-task-cli-gestor`  
**Created**: 2026-04-01  
**Status**: Draft  
**Input**: User description: "Construir un CLI llamado task-cli para gestión de tareas personales desde la terminal"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear una tarea nueva (Priority: P1)

Un usuario quiere registrar una nueva tarea pendiente desde la terminal para no olvidarla. Escribe un título breve, opcionalmente una descripción y una prioridad, y el sistema le confirma que la tarea fue creada con un ID único.

**Why this priority**: Es la operación fundamental del sistema; sin ella no existe ninguna otra. Si solo se implementa esta historia, el usuario ya puede capturar tareas.

**Independent Test**: Se puede probar ejecutando `task-cli add "Comprar leche"` y verificando que el sistema responde con el ID asignado y los datos de la tarea creada.

**Acceptance Scenarios**:

1. **Given** que no existen tareas, **When** el usuario ejecuta `task-cli add "Revisar correos"`, **Then** el sistema crea la tarea con ID 1, estado "todo", prioridad "medium" y muestra confirmación.
2. **Given** que ya existen dos tareas, **When** el usuario ejecuta `task-cli add "Llamar al médico" --priority high --description "Pedir cita para el lunes"`, **Then** el sistema crea la tarea con ID 3, prioridad "high", descripción indicada y muestra confirmación.
3. **Given** que el usuario ejecuta `task-cli add` sin título, **Then** el sistema muestra un mensaje de error indicando que el título es obligatorio.

---

### User Story 2 - Listar tareas (Priority: P2)

Un usuario quiere ver todas sus tareas en un vistazo rápido para decidir en qué trabajar a continuación. Ejecuta un comando de listado y obtiene una tabla ordenada con ID, título, estado, prioridad y fecha de creación.

**Why this priority**: Sin listado el usuario no puede ver su trabajo acumulado ni filtrar. Depende solo de "Crear tareas".

**Independent Test**: Tras crear al menos una tarea, ejecutar `task-cli list` debe mostrar una tabla con las columnas correctas, ordenada de más reciente a más antigua.

**Acceptance Scenarios**:

1. **Given** que existen tres tareas con distintas prioridades y estados, **When** el usuario ejecuta `task-cli list`, **Then** el sistema muestra una tabla con columnas ID, Título, Estado, Prioridad, Fecha de Creación, ordenada de más reciente a más antigua.
2. **Given** que existen tareas con distintos estados, **When** el usuario ejecuta `task-cli list --status todo`, **Then** solo aparecen las tareas con estado "todo".
3. **Given** que existen tareas con distintas prioridades, **When** el usuario ejecuta `task-cli list --priority high`, **Then** solo aparecen las tareas con prioridad "high".
4. **Given** que se combinan filtros, **When** el usuario ejecuta `task-cli list --status in-progress --priority medium`, **Then** solo aparecen las tareas que coincidan con ambos criterios.
5. **Given** que no existen tareas, **When** el usuario ejecuta `task-cli list`, **Then** el sistema muestra un mensaje indicando que no hay tareas registradas.

---

### User Story 3 - Cambiar el estado de una tarea (Priority: P3)

Un usuario quiere mover una tarea por su ciclo de vida (pendiente → en progreso → hecha) o revertirla si se equivocó, usando únicamente el ID de la tarea.

**Why this priority**: Permite dar seguimiento real al trabajo. Sin esta historia las tareas quedan siempre en "todo".

**Independent Test**: Crear una tarea y luego ejecutar `task-cli status 1 in-progress` debe cambiar su estado; ejecutar `task-cli status 1 done` desde "in-progress" debe completarla.

**Acceptance Scenarios**:

1. **Given** una tarea en estado "todo", **When** el usuario ejecuta `task-cli status 1 in-progress`, **Then** la tarea pasa a "in-progress" y el sistema confirma el cambio.
2. **Given** una tarea en estado "in-progress", **When** el usuario ejecuta `task-cli status 1 done`, **Then** la tarea pasa a "done" y el sistema confirma el cambio.
3. **Given** una tarea en estado "in-progress", **When** el usuario ejecuta `task-cli status 1 todo`, **Then** la tarea regresa a "todo" (backlog) y el sistema confirma el cambio.
4. **Given** una tarea en estado "done", **When** el usuario ejecuta `task-cli status 1 in-progress`, **Then** la tarea se reabre en estado "in-progress" y el sistema confirma el cambio.
5. **Given** una tarea en estado "todo", **When** el usuario intenta `task-cli status 1 done`, **Then** el sistema rechaza la transición con un mensaje de error explicativo.
6. **Given** una tarea en estado "done", **When** el usuario intenta `task-cli status 1 todo`, **Then** el sistema rechaza la transición con un mensaje de error explicativo.
6. **Given** un ID que no existe, **When** el usuario ejecuta `task-cli status 99 in-progress`, **Then** el sistema muestra un error indicando que la tarea no fue encontrada.

---

### User Story 4 - Actualizar datos de una tarea (Priority: P4)

Un usuario quiere corregir o enriquecer el título, descripción o prioridad de una tarea ya creada sin necesidad de eliminarla y volver a crearla.

**Why this priority**: Mejora la usabilidad pero no bloquea el flujo principal; depende de "Crear tareas".

**Independent Test**: Crear una tarea con título "Revisión" y luego ejecutar `task-cli update 1 --title "Revisión semanal"` debe reflejar el nuevo título en el listado.

**Acceptance Scenarios**:

1. **Given** una tarea existente, **When** el usuario ejecuta `task-cli update 1 --title "Nuevo título"`, **Then** el título de la tarea se actualiza y el sistema confirma el cambio.
2. **Given** una tarea existente, **When** el usuario ejecuta `task-cli update 1 --priority low --description "Descripción actualizada"`, **Then** la prioridad y la descripción se actualizan manteniendo el resto de campos intactos.
3. **Given** un ID que no existe, **When** el usuario ejecuta `task-cli update 99 --title "X"`, **Then** el sistema muestra un error indicando que la tarea no fue encontrada.
4. **Given** que no se proporciona ningún campo a actualizar, **When** el usuario ejecuta `task-cli update 1` sin flags, **Then** el sistema muestra un mensaje de error indicando que se debe especificar al menos un campo.

---

### User Story 5 - Eliminar una tarea (Priority: P5)

Un usuario quiere borrar permanentemente una tarea que ya no es relevante. El sistema le pide confirmación para evitar eliminaciones accidentales, con la opción `--force` para saltarse la confirmación en flujos automatizados. Solo las tareas en estado `todo` pueden ser eliminadas; las tareas en progreso o completadas no pueden borrarse.

**Why this priority**: Es la operación de menor riesgo funcional; el usuario puede vivir sin ella al inicio.

**Independent Test**: Crear una tarea, ejecutar `task-cli delete 1`, responder "s" a la confirmación, y verificar que la tarea ya no aparece en `task-cli list`.

**Acceptance Scenarios**:

1. **Given** una tarea existente en estado `todo`, **When** el usuario ejecuta `task-cli delete 1` y responde `s`, `si`, `y` o `yes`, **Then** la tarea es eliminada y el sistema confirma el borrado.
2. **Given** una tarea existente en estado `todo`, **When** el usuario ejecuta `task-cli delete 1` y responde "n", **Then** la operación se cancela sin eliminar nada.
3. **Given** una tarea existente en estado `todo`, **When** el usuario ejecuta `task-cli delete 1 --force`, **Then** la tarea es eliminada sin solicitar confirmación.
4. **Given** un ID que no existe, **When** el usuario ejecuta `task-cli delete 99`, **Then** el sistema muestra un error indicando que la tarea no fue encontrada.
5. **Given** una tarea en estado `in-progress`, **When** el usuario ejecuta `task-cli delete 1`, **Then** el sistema muestra un error: `"Cannot delete task 1: task is in 'in-progress' state. Only 'todo' tasks can be deleted."` y no elimina nada.
6. **Given** una tarea en estado `done`, **When** el usuario ejecuta `task-cli delete 1`, **Then** el sistema muestra un error: `"Cannot delete task 1: task is in 'done' state. Only 'todo' tasks can be deleted."` y no elimina nada.

---

### Edge Cases

- ¿Qué ocurre si el archivo de almacenamiento local está corrupto o inaccesible? El sistema debe mostrar un error claro e indicar la ubicación del archivo.
- ¿Qué pasa si el título está vacío o solo contiene espacios en blanco? El sistema debe rechazarlo con un mensaje de error.
- ¿Qué ocurre si se pasa una prioridad o estado con mayúsculas (e.g., `HIGH`, `TODO`)? El sistema debe normalizarlos sin error.
- ¿Cómo se comporta el ID tras eliminar tareas? Los IDs son autoincrementales y nunca se reutilizan; el siguiente ID siempre será mayor al último asignado históricamente.
- ¿Qué ocurre al aplicar filtros que no devuelven resultados? El sistema muestra un mensaje informando que no hay tareas que coincidan con los criterios indicados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir crear una tarea proporcionando un título obligatorio.
- **FR-002**: El sistema DEBE asignar automáticamente un ID numérico único y autoincremental a cada tarea nueva.
- **FR-003**: El sistema DEBE crear toda tarea nueva con estado inicial "todo".
- **FR-004**: El sistema DEBE soportar prioridades "high", "medium" y "low", con "medium" como valor por defecto.
- **FR-005**: El sistema DEBE permitir asociar una descripción textual opcional a cada tarea.
- **FR-006**: El sistema DEBE registrar la fecha y hora de creación de cada tarea.
- **FR-007**: El sistema DEBE listar todas las tareas en formato tabla con columnas: ID, Título, Estado, Prioridad, Fecha de Creación. La fecha se muestra con formato `YYYY-MM-DD HH:MM` (e.g., `2026-04-01 14:30`).
- **FR-008**: El listado DEBE ordenarse por fecha de creación de más reciente a más antigua por defecto.
- **FR-009**: El sistema DEBE permitir filtrar el listado por estado (`--status todo|in-progress|done`).
- **FR-010**: El sistema DEBE permitir filtrar el listado por prioridad (`--priority high|medium|low`).
- **FR-011**: El sistema DEBE permitir combinar filtros de estado y prioridad en el mismo listado.
- **FR-012**: El sistema DEBE permitir cambiar el estado de una tarea identificada por su ID.
- **FR-013**: El sistema DEBE validar y aplicar solo transiciones de estado permitidas: todo→in-progress, in-progress→done, in-progress→todo, done→in-progress.
- **FR-014**: El sistema DEBE rechazar las transiciones inválidas todo→done y done→todo con mensajes de error explicativos.
- **FR-015**: El sistema DEBE permitir actualizar el título, descripción y/o prioridad de una tarea existente por su ID.
- **FR-016**: El sistema DEBE requerir al menos un campo al ejecutar el comando de actualización.
- **FR-017**: El sistema DEBE solicitar confirmación explícita del usuario antes de eliminar una tarea. Las respuestas `s`, `si`, `y`, `yes` (insensibles a mayúsculas) confirman la eliminación; cualquier otro valor la cancela.
- **FR-018**: El sistema DEBE ofrecer la opción `--force` en el comando de eliminación para omitir la confirmación.
- **FR-022**: El sistema DEBE permitir eliminar únicamente tareas en estado `todo`. Si la tarea está en estado `in-progress` o `done`, el sistema DEBE rechazar la operación con el mensaje: `"No se puede borrar la tarea [ID]: el estado actual es '[estado]'. Solamente las tareas en estado 'todo' pueden ser borradas."` emitido por `stderr`.
- **FR-019**: El sistema DEBE mostrar un error claro cuando se referencia un ID inexistente en cualquier operación. Todos los mensajes de error DEBEN emitirse por `stderr`; la salida normal (confirmaciones, tablas) por `stdout`.
- **FR-020**: El sistema DEBE persistir todas las tareas en una base de datos SQLite local entre sesiones de terminal.
- **FR-021**: El sistema DEBE normalizar los valores de estado y prioridad (ignorar mayúsculas/minúsculas en la entrada del usuario).

### Key Entities

- **Tarea (Task)**: Unidad de trabajo del usuario. Atributos: ID (entero autoincremental, único, no reutilizable), título (texto obligatorio, no vacío), descripción (texto opcional), estado (todo | in-progress | done), prioridad (high | medium | low), fecha y hora de creación.
- **Estado**: Enumeración que controla el ciclo de vida de una tarea. Rige las transiciones válidas e inválidas.
- **Prioridad**: Enumeración que indica la urgencia relativa de una tarea. No afecta al ciclo de vida ni al estado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede capturar una nueva tarea en menos de 10 segundos desde la terminal.
- **SC-002**: El listado de hasta 100 tareas se muestra en menos de 1 segundo.
- **SC-003**: El 100% de las transiciones de estado inválidas son rechazadas con un mensaje de error comprensible emitido por `stderr`, y el proceso termina con código de salida distinto de cero.
- **SC-004**: Ninguna tarea es eliminada sin confirmación explícita del usuario (salvo uso de `--force`), y ninguna tarea en estado `in-progress` o `done` puede ser eliminada bajo ninguna circunstancia.
- **SC-005**: Los datos de todas las tareas persisten correctamente entre reinicios del sistema operativo.
- **SC-006**: Cada campo actualizable (título, descripción, prioridad) puede modificarse de forma independiente sin afectar los campos no mencionados.

## Clarifications

### Session 2026-04-01

- Q: ¿Qué formato de almacenamiento local debe usar el sistema? → A: Base de datos embebida (SQLite)
- Q: ¿Qué restricción de estado aplica al eliminar una tarea? → A: Solo tareas en estado `todo` pueden eliminarse; el error muestra el estado actual: `"No se puede borrar la tarea [ID]: el estado actual es '[estado]'. Solamente las tareas en estado 'todo' pueden ser borradas."`
- Q: ¿Qué formato debe usar la columna "Fecha de Creación" en el listado? → A: `YYYY-MM-DD HH:MM` (ISO, e.g., `2026-04-01 14:30`)
- Q: ¿Qué respuestas del usuario confirman la eliminación de una tarea? → A: `s`, `si`, `y`, `yes` (insensible a mayúsculas); cualquier otro valor cancela la operación
- Q: ¿Los mensajes de error deben ir a `stderr` o `stdout`? → A: Errores a `stderr`; salida normal (confirmaciones, tabla) a `stdout`
- Q: ¿En qué lenguaje se implementará el CLI? → A: Node.js / TypeScript
- Corrección: La transición `done → todo` es inválida. La transición correcta desde "done" es `done → in-progress`.

## Assumptions

- El uso es estrictamente personal y monousuario; no se requiere gestión de permisos ni manejo de concurrencia.
- Las tareas se almacenan en una base de datos SQLite local; la ubicación exacta queda a criterio de la implementación (e.g., directorio de configuración del usuario o directorio de trabajo).
- El CLI se implementa con Node.js / TypeScript; el entorno Node.js debe estar instalado en el sistema del usuario.
- No se requiere instalación de servicios externos más allá del runtime de Node.js; el CLI debe funcionar sin conexión a internet.
- La interfaz es exclusivamente de línea de comandos; no se construirá ninguna interfaz gráfica ni web.
- No habrá fechas de vencimiento, subtareas, etiquetas ni categorías en esta versión.
- Los IDs eliminados no se reutilizan; el contador siempre avanza en función del último ID asignado históricamente.
- La normalización de entrada (mayúsculas/minúsculas en estados y prioridades) es responsabilidad del sistema.
