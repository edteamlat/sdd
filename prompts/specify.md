/specify

Construir un CLI llamado "task-cli" para gestión de tareas personales desde la terminal.

## Features principales

### Crear tareas
- Crear una tarea con un título obligatorio
- Opcionalmente asignar prioridad: high, medium, low (default: medium)
- Opcionalmente asignar una descripción
- Cada tarea recibe un ID numérico autoincremental
- Cada tarea se crea con estado "todo"

### Listar tareas
- Listar todas las tareas en formato tabla
- Mostrar: ID, título, estado, prioridad, fecha de creación
- Filtrar por estado: --status todo|in-progress|done
- Filtrar por prioridad: --priority high|medium|low
- Ordenar por fecha de creación (más recientes primero por default)

### Cambiar estado de una tarea
- Cambiar el estado de una tarea por su ID
- Estados válidos: todo, in-progress, done
- Transiciones válidas:
  - todo → in-progress
  - in-progress → done
  - in-progress → todo (devolver al backlog)
  - done → todo (reabrir)
- Transiciones NO válidas:
  - todo → done (no se puede completar sin pasar por in-progress)

### Actualizar una tarea
- Modificar título, descripción o prioridad de una tarea existente por su ID

### Eliminar una tarea
- Eliminar una tarea por su ID
- Pedir confirmación antes de eliminar (--force para saltar confirmación)

## Lo que NO se va a construir
- No habrá sistema de usuarios ni autenticación
- No habrá sincronización con servicios externos
- No habrá fechas de vencimiento (due dates) en esta versión
- No habrá subtareas ni dependencias entre tareas
- No habrá tags ni categorías
- No habrá interfaz web ni API REST
