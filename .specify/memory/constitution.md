<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0
Modified principles: N/A (first ratification — all principles newly defined)
Added sections:
  - Core Principles (10 principles)
  - Technology Stack
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ — Constitution Check gates align with principles
  - .specify/templates/spec-template.md ✅ — No structural changes required
  - .specify/templates/tasks-template.md ✅ — Task categories align with testing and structure principles
Deferred TODOs: None
-->

# task-cli Constitution

## Core Principles

### I. Lenguaje y Runtime

TypeScript con Node.js (versión LTS) es el único lenguaje permitido para este proyecto.
La ejecución directa DEBE realizarse con `tsx` u otra herramienta equivalente sin paso de
compilación explícito durante el desarrollo. El código DEBE ser compatible con la versión
LTS de Node.js vigente en el momento de cada release.

**Rationale**: La consistencia de lenguaje y runtime evita fricciones de toolchain y
garantiza que los colaboradores trabajen sobre la misma base. Usar `tsx` elimina el
ciclo build-run durante el desarrollo.

### II. Base de Datos

SQLite DEBE ser la única base de datos utilizada, accedida mediante `better-sqlite3`
directamente — sin ORM ni capa de abstracción adicional. La base de datos DEBE almacenarse
en `~/.task-cli/tasks.db`. El esquema DEBE gestionarse con SQL plano.

**Rationale**: SQLite + better-sqlite3 ofrece todo lo necesario para un CLI local sin
infraestructura externa. Los ORMs añaden complejidad injustificada a este tamaño de proyecto.

### III. Estructura del Proyecto

La estructura DEBE mantenerse plana y organizada por funcionalidad:
`commands/`, `db/`, `utils/`. No se permite clean architecture, hexagonal, ni capas
adicionales (repositorios, servicios, casos de uso, etc.) a menos que el crecimiento del
proyecto lo justifique explícitamente con documentación de la decisión.

**Rationale**: Para un CLI de este tamaño, las capas adicionales generan overhead sin
beneficio observable. La organización por funcionalidad es suficiente y más navegable.

### IV. Estilo de Código

- Se DEBE preferir funciones sobre clases. Las clases solo se permiten cuando modelan
  entidades con estado que no puede expresarse limpiamente con funciones.
- Las funciones DEBEN ser puras siempre que sea posible (sin efectos secundarios
  implícitos, sin mutación de argumentos).
- Nomenclatura: `camelCase` para variables y funciones; `PascalCase` exclusivamente para
  tipos e interfaces TypeScript.
- No se permiten `any` implícitos; el modo `strict` de TypeScript DEBE estar activado.

**Rationale**: El código funcional y puro es más fácil de testear y razonar. La
convención de nombres reduce la carga cognitiva al leer el código.

### V. CLI Framework

Commander.js DEBE ser el framework utilizado para el parseo de argumentos y la definición
de comandos. No se permite reemplazarlo por otra librería sin enmendar esta constitución.

**Rationale**: Commander.js es maduro, bien documentado y suficiente para las necesidades
del proyecto. Evitar cambiar de framework reduce la deuda de migración.

### VI. Manejo de Errores

- Los stack traces NUNCA deben mostrarse al usuario final.
- Los mensajes de error DEBEN ser claros, concisos y accionables (describir qué falló y
  cómo corregirlo cuando sea posible).
- Los códigos de salida DEBEN seguir la convención Unix: `0` para éxito, `1` para error.
- Los errores internos/inesperados DEBEN loguearse a `stderr` sin exponer detalles internos.

**Rationale**: Un CLI profesional protege al usuario de la complejidad interna. Los códigos
de salida correctos permiten la integración con scripts y pipelines.

### VII. Testing

- Los tests unitarios DEBEN escribirse con Vitest.
- Toda la lógica de negocio DEBE tener tests unitarios asociados.
- No se requiere un porcentaje mínimo de cobertura, pero cualquier función que tome
  decisiones o transforme datos DEBE estar cubierta.
- Los tests DEBEN poder ejecutarse con `npm test` sin configuración adicional.

**Rationale**: Vitest es rápido, compatible con TypeScript nativo y coherente con el
ecosistema del proyecto. Los tests de lógica de negocio previenen regresiones silenciosas.

### VIII. Gestión de Dependencias

- No se DEBE agregar una dependencia externa si la funcionalidad puede implementarse
  en ≤ 20 líneas de código claro.
- No se permiten ORMs.
- Cada nueva dependencia DEBE justificarse con: problema resuelto, alternativas
  consideradas y por qué no se implementó internamente.

**Rationale**: Las dependencias son deuda técnica. Un CLI pequeño que crece en
dependencias se vuelve frágil ante actualizaciones y difícil de auditar.

### IX. Output y Presentación

- Toda salida al terminal DEBE ser legible por humanos por defecto.
- Los listados DEBEN presentarse en tablas usando `cli-table3` o similar.
- Los colores SOLO se permiten para indicar estados (pendiente, en progreso, completado)
  y prioridades. No se usan colores decorativos.
- Los mensajes de error DEBEN ir a `stderr`; la salida normal a `stdout`.

**Rationale**: Un CLI que abusa del color o produce salidas caóticas perjudica la
experiencia del usuario. La separación stdout/stderr facilita el scripting.

### X. Distribución

El CLI DEBE ser instalable globalmente mediante `npm install -g`. El campo `bin` en
`package.json` DEBE estar correctamente configurado. El ejecutable DEBE funcionar tras la
instalación global sin pasos manuales adicionales.

**Rationale**: La instalación global con npm es el estándar para CLIs en el ecosistema
Node.js. Garantizar que funcione desde el primer `npm install -g` define la experiencia
del usuario final.

## Technology Stack

Restricciones tecnológicas no negociables para este proyecto:

- **Runtime**: Node.js LTS
- **Lenguaje**: TypeScript (strict mode activado)
- **Ejecución dev**: `tsx` (o equivalente sin compilación previa)
- **Base de datos**: SQLite vía `better-sqlite3`
- **CLI framework**: Commander.js
- **Testing**: Vitest
- **Tablas en output**: `cli-table3` (o similar ligero)
- **Instalación**: `npm install -g` (campo `bin` en package.json)
- **Prohibido**: ORMs, frameworks web, bases de datos externas, `any` implícito

## Development Workflow

- Toda lógica de negocio nueva DEBE incluir tests unitarios antes de considerarse completa.
- Los errores NUNCA deben mostrar stack traces al usuario; siempre atrapar y mostrar
  mensaje accionable.
- Las decisiones de agregar dependencias DEBEN documentarse (inline en PR o en ADR).
- El código DEBE pasar `tsc --noEmit` sin errores antes de merge.
- Los comandos del CLI DEBEN validar su input y fallar con `exit 1` + mensaje claro ante
  argumentos inválidos.

## Governance

Esta constitución tiene precedencia sobre cualquier guía de estilo, preferencia personal
o convención implícita no documentada. Cualquier excepción DEBE estar justificada
explícitamente en el código (comentario) o en la documentación del PR.

**Proceso de enmienda**:
1. Proponer el cambio con justificación de por qué el principio actual es insuficiente.
2. Incrementar la versión según semver:
   - MAJOR: eliminación o redefinición incompatible de un principio.
   - MINOR: nuevo principio o sección añadida.
   - PATCH: clarificaciones, correcciones de redacción.
3. Actualizar `LAST_AMENDED_DATE` con la fecha ISO del cambio.
4. Propagar cambios a los templates en `.specify/templates/` si corresponde.

**Revisión de cumplimiento**: Todo PR DEBE verificar que no viola ningún principio de
esta constitución antes de merge.

**Version**: 1.0.0 | **Ratified**: 2026-04-01 | **Last Amended**: 2026-04-01
