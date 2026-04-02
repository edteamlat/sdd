# task-cli Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-01

## Active Technologies
- TypeScript 5.x strict, Node.js LTS ≥ 20.x + Commander.js `^14.0.3`, better-sqlite3 `^12.8.0`, cli-table3 `^0.6.5` (001-task-cli-gestor)

- **Language**: TypeScript 5.x, strict mode, Node.js LTS (≥ 20.x)
- **CLI framework**: Commander.js `^14.0.3`
- **Database**: `better-sqlite3@^12.8.0` — SQLite en `~/.task-cli/tasks.db`, sin ORM, SQL plano
- **Tables**: `cli-table3@^0.6.5`
- **Dev execution**: `tsx@^4.21.0` (sin compilación en desarrollo)
- **Testing**: Vitest con DB `:memory:`
- **Distribution**: `npm install -g`, campo `bin: { "task": "dist/index.js" }`

## Project Structure

```text
src/
├── index.ts          # Entry point Commander
├── commands/         # add, list, status, update, delete
├── db/               # client, migrations, tasks (CRUD)
└── utils/            # validate, format, table, confirm
tests/
├── db/
└── utils/
```

## Commands

```bash
npm run dev -- <cmd>   # Ejecutar sin compilar (tsx)
npm test               # Vitest
npm run build          # tsc → dist/
npm install -g .       # Instalar globalmente como `task`
```

## Code Style (Constitución §III–§IV)

- Funciones > clases; funciones puras siempre que sea posible
- `camelCase` variables/funciones, `PascalCase` tipos/interfaces
- Sin `any` implícito; strict mode activado
- Sin capas adicionales (sin repositorios, servicios, casos de uso)
- Errores: `stderr` + `process.exit(1)`; salida normal: `stdout`
- Sin stack traces al usuario final

## Key Constraints

- Prohibido: ORMs, frameworks web, bases de datos externas, `any` implícito
- Toda lógica de negocio con tests unitarios antes de considerar completa
- `tsc --noEmit` sin errores antes de merge

## Recent Changes
- 001-task-cli-gestor: Added TypeScript 5.x strict, Node.js LTS ≥ 20.x + Commander.js `^14.0.3`, better-sqlite3 `^12.8.0`, cli-table3 `^0.6.5`

- 001-task-cli-gestor: Plan inicial — CLI de gestión de tareas con Commander + SQLite

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
