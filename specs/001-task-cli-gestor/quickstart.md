# Quickstart: task-cli

**Branch**: `001-task-cli-gestor` | **Date**: 2026-04-01

---

## Prerequisitos

- Node.js LTS (≥ 20.x)
- npm ≥ 9.x

---

## Setup del proyecto

```bash
# 1. Inicializar el proyecto
npm init -y

# 2. Instalar dependencias de producción
npm install better-sqlite3 commander cli-table3

# 3. Instalar dependencias de desarrollo
npm install -D typescript tsx vitest @types/better-sqlite3 @types/node

# 4. Inicializar TypeScript
npx tsc --init
```

---

## Estructura de archivos

```text
task-cli/
├── src/
│   ├── index.ts              # Entry point — define el programa Commander y registra comandos
│   ├── commands/
│   │   ├── add.ts            # Comando: task add
│   │   ├── list.ts           # Comando: task list
│   │   ├── status.ts         # Comando: task status
│   │   ├── update.ts         # Comando: task update
│   │   └── delete.ts         # Comando: task delete
│   ├── db/
│   │   ├── client.ts         # Inicializa y exporta la instancia de DB (singleton)
│   │   ├── migrations.ts     # Aplica el esquema SQL (CREATE TABLE IF NOT EXISTS)
│   │   └── tasks.ts          # Funciones CRUD: createTask, listTasks, getTask, updateTask, deleteTask
│   └── utils/
│       ├── validate.ts       # Validación y normalización de status, priority, title
│       ├── format.ts         # Formato de fecha UTC → "YYYY-MM-DD HH:MM"
│       ├── table.ts          # Renderizado de tabla con cli-table3
│       └── confirm.ts        # Confirmación interactiva con readline/promises
├── tests/
│   ├── db/
│   │   └── tasks.test.ts     # Tests unitarios de funciones CRUD (DB :memory:)
│   └── utils/
│       ├── validate.test.ts  # Tests de validación y normalización
│       └── format.test.ts    # Tests de formato de fecha
├── package.json
├── tsconfig.json
└── specs/                    # Artefactos de especificación (este directorio)
```

---

## package.json clave

```json
{
  "name": "task-cli",
  "version": "1.0.0",
  "description": "Gestión de tareas personales desde la terminal",
  "main": "dist/index.js",
  "bin": { "task": "dist/index.js" },
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "test": "vitest run",
    "prepare": "npm run build"
  }
}
```

> El campo `"bin": { "task": "dist/index.js" }` hace que el binario sea accesible como `task` tras `npm install -g`.

---

## tsconfig.json clave

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

---

## Comandos de desarrollo

```bash
# Ejecutar en modo desarrollo (sin compilar)
npm run dev -- add "Mi primera tarea" --priority high

# Ejecutar tests
npm test

# Compilar
npm run build

# Instalar globalmente (tras build)
npm install -g .
task add "Tarea de prueba"
```

---

## Almacenamiento

Las tareas se guardan en: `~/.task-cli/tasks.db`

El directorio y la base de datos se crean automáticamente la primera vez que se ejecuta cualquier comando.

---

## Flujo de inicialización

1. `src/index.ts` arranca → llama a `initDb()` en `db/client.ts`
2. `initDb()` crea `~/.task-cli/` si no existe → abre la DB → llama a `applyMigrations(db)`
3. `applyMigrations()` ejecuta `CREATE TABLE IF NOT EXISTS tasks ...`
4. Commander registra los 5 comandos y parsea `process.argv`
5. El comando correspondiente es invocado con los argumentos validados
