# CLI Contracts: task-cli

**Branch**: `001-task-cli-gestor` | **Date**: 2026-04-01

Contrato de la interfaz de comandos del CLI. Define la firma, argumentos, opciones, salida esperada y códigos de salida de cada comando.

---

## Convenciones globales

- **Binario**: `task`
- **Salida normal**: `stdout`
- **Mensajes de error**: `stderr`
- **Código de salida éxito**: `0`
- **Código de salida error**: `1`
- **Normalización**: `status` y `priority` aceptan valores en cualquier combinación de mayúsculas/minúsculas
- **Formato de fecha**: `YYYY-MM-DD HH:MM` (hora local derivada de UTC almacenado)

---

## `task add <title>`

Crea una nueva tarea.

### Firma
```
task add <title> [options]
```

### Argumentos
| Argumento | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `title` | string | Sí | Título de la tarea. No puede estar vacío o ser solo espacios. |

### Opciones
| Flag | Alias | Tipo | Default | Descripción |
|------|-------|------|---------|-------------|
| `--priority <level>` | `-p` | `high\|medium\|low` | `medium` | Prioridad de la tarea |
| `--description <text>` | `-d` | string | — | Descripción opcional |

### Salida (stdout) — éxito
```
Tarea creada:
  ID:          1
  Título:      Revisar correos
  Prioridad:   medium
  Estado:      todo
  Creado:      2026-04-01 14:30
```

### Errores (stderr) — exit 1
| Condición | Mensaje |
|-----------|---------|
| Título vacío o solo espacios | `Error: El título no puede estar vacío.` |
| Prioridad inválida | `Error: Prioridad inválida: "ULTRA". Valores permitidos: high, medium, low.` |

---

## `task list`

Lista todas las tareas en formato tabla.

### Firma
```
task list [options]
```

### Opciones
| Flag | Alias | Tipo | Descripción |
|------|-------|------|-------------|
| `--status <value>` | `-s` | `todo\|in-progress\|done` | Filtrar por estado |
| `--priority <level>` | `-p` | `high\|medium\|low` | Filtrar por prioridad |

### Salida (stdout) — con resultados
```
┌────┬──────────────────────────────────────┬──────────────┬──────────┬──────────────────┐
│ ID │ Título                               │ Estado       │ Prioridad│ Creado           │
├────┼──────────────────────────────────────┼──────────────┼──────────┼──────────────────┤
│ 3  │ Llamar al médico                     │ in-progress  │ high     │ 2026-04-01 15:00 │
│ 2  │ Revisar correos                      │ todo         │ medium   │ 2026-04-01 14:45 │
│ 1  │ Comprar leche                        │ done         │ low      │ 2026-04-01 14:30 │
└────┴──────────────────────────────────────┴──────────────┴──────────┴──────────────────┘
```

### Salida (stdout) — sin resultados
```
No hay tareas registradas.
```
_(o cuando se aplican filtros que no devuelven resultados)_:
```
No hay tareas que coincidan con los filtros aplicados.
```

### Errores (stderr) — exit 1
| Condición | Mensaje |
|-----------|---------|
| Valor de `--status` inválido | `Error: Estado inválido: "hecho". Valores permitidos: todo, in-progress, done.` |
| Valor de `--priority` inválido | `Error: Prioridad inválida: "urgente". Valores permitidos: high, medium, low.` |

---

## `task status <id> <newStatus>`

Cambia el estado de una tarea.

### Firma
```
task status <id> <newStatus>
```

### Argumentos
| Argumento | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | integer | Sí | ID de la tarea |
| `newStatus` | `todo\|in-progress\|done` | Sí | Nuevo estado |

### Salida (stdout) — éxito
```
Tarea #1 actualizada: todo → in-progress
```

### Errores (stderr) — exit 1
| Condición | Mensaje |
|-----------|---------|
| ID no encontrado | `Error: Tarea #99 no encontrada.` |
| Estado inválido | `Error: Estado inválido: "hecho". Valores permitidos: todo, in-progress, done.` |
| Transición inválida `todo → done` | `Error: Transición inválida: todo → done. Una tarea debe pasar primero por 'in-progress'.` |
| Transición inválida `done → todo` | `Error: Transición inválida: done → todo. Una tarea completada debe volver a 'in-progress'.` |

---

## `task update <id>`

Actualiza título, descripción y/o prioridad de una tarea.

### Firma
```
task update <id> [options]
```

### Argumentos
| Argumento | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | integer | Sí | ID de la tarea a modificar |

### Opciones
| Flag | Alias | Tipo | Descripción |
|------|-------|------|-------------|
| `--title <text>` | `-t` | string | Nuevo título |
| `--description <text>` | `-d` | string | Nueva descripción |
| `--priority <level>` | `-p` | `high\|medium\|low` | Nueva prioridad |

_Al menos una opción es obligatoria._

### Salida (stdout) — éxito
```
Tarea #1 actualizada.
```

### Errores (stderr) — exit 1
| Condición | Mensaje |
|-----------|---------|
| ID no encontrado | `Error: Tarea #99 no encontrada.` |
| Sin campos especificados | `Error: Debes especificar al menos un campo para actualizar (--title, --description, --priority).` |
| Título vacío | `Error: El título no puede estar vacío.` |
| Prioridad inválida | `Error: Prioridad inválida: "urgente". Valores permitidos: high, medium, low.` |

---

## `task delete <id>`

Elimina una tarea, solicitando confirmación. **Solo se pueden eliminar tareas en estado `todo`.**

### Firma
```
task delete <id> [options]
```

### Argumentos
| Argumento | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | integer | Sí | ID de la tarea a eliminar |

### Opciones
| Flag | Alias | Descripción |
|------|-------|-------------|
| `--force` | `-f` | Omite la confirmación interactiva |

### Precondición
La tarea debe estar en estado `todo`. Si está en `in-progress` o `done`, el comando falla con error antes de solicitar confirmación.

### Flujo interactivo (sin `--force`)
```
¿Eliminar tarea #1 "Comprar leche"? [s/n]: s
Tarea #1 eliminada.
```
```
¿Eliminar tarea #1 "Comprar leche"? [s/n]: n
Operación cancelada.
```

Respuestas que confirman (insensibles a mayúsculas): `s`, `si`, `y`, `yes`  
Cualquier otro valor cancela sin error.

### Salida (stdout) — éxito con `--force`
```
Tarea #1 eliminada.
```

### Errores (stderr) — exit 1
| Condición | Mensaje |
|-----------|---------|
| ID no encontrado | `Error: Tarea #99 no encontrada.` |
| Tarea en estado `in-progress` | `Error: No se puede borrar la tarea 1: el estado actual es 'in-progress'. Solamente las tareas en estado 'todo' pueden ser borradas.` |
| Tarea en estado `done` | `Error: No se puede borrar la tarea 1: el estado actual es 'done'. Solamente las tareas en estado 'todo' pueden ser borradas.` |

---

## Comportamiento de `--help`

Cada comando responde a `--help` con la descripción, argumentos y opciones. El texto de ayuda va a `stdout`. Ejemplo:

```
$ task --help
Usage: task [command]

Gestión de tareas personales desde la terminal.

Commands:
  add <title>       Crear una nueva tarea
  list              Listar todas las tareas
  status <id> <status>  Cambiar el estado de una tarea
  update <id>       Actualizar título, descripción o prioridad
  delete <id>       Eliminar una tarea

Options:
  -h, --help        Mostrar ayuda
  -V, --version     Mostrar versión
```
