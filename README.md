# task-cli — Curso de Spec Driven Development para EDteam

Este repositorio forma parte del **curso de Spec Driven Development (SDD)** de [EDteam](https://ed.team). A lo largo del curso aprenderás a diseñar y construir software usando especificaciones como punto de partida, con la ayuda de herramientas de IA.

El proyecto de práctica es `task-cli`: un gestor de tareas en línea de comandos construido con TypeScript, Commander.js y SQLite.

## ¿Qué es Spec Driven Development?

SDD es una metodología en la que primero defines con precisión **qué** vas a construir (spec, plan, tareas) antes de escribir una sola línea de código. Las herramientas de IA actúan como colaboradoras en cada fase del proceso.

## Herramienta: spec-kit

Este curso usa [spec-kit](https://github.com/github/spec-kit), el toolkit oficial de GitHub para Spec Driven Development. Requiere tener [`uv`](https://docs.astral.sh/uv/) instalado.

### Instalar uv (si no lo tienes)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Instalar spec-kit

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.4.4
```

### Inicializar spec-kit en un proyecto existente con Claude Code

```bash
specify init . --ai claude
```

### Verificar la instalación

```bash
specify check
```

### Actualizar spec-kit

```bash
uv tool install specify-cli --force --from git+https://github.com/github/spec-kit.git@v0.4.4
```

## Comandos de spec-kit en Claude Code

Una vez inicializado, spec-kit se usa como skills dentro de Claude Code:

| Comando | Descripción |
|---------|-------------|
| `/speckit-constitution` | Establecer los principios y restricciones del proyecto |
| `/speckit-specify` | Describir la feature que se va a construir |
| `/speckit-clarify` | Identificar ambigüedades en la especificación |
| `/speckit-plan` | Definir la estrategia técnica de implementación |
| `/speckit-tasks` | Generar la lista de tareas ordenada por dependencias |
| `/speckit-implement` | Ejecutar la implementación basada en las tareas |
| `/speckit-analyze` | Analizar consistencia entre spec, plan y tareas |
| `/speckit-checklist` | Generar un checklist personalizado para la feature |
| `/speckit-taskstoissues` | Convertir tareas en issues de GitHub |

## Comandos del proyecto

```bash
npm run dev -- <comando>   # Ejecutar sin compilar
npm test                   # Correr tests con Vitest
npm run build              # Compilar con tsc → dist/
npm install -g .           # Instalar globalmente como `task`
```
