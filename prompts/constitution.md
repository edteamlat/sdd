/constitution

Este proyecto es un CLI de gestión de tareas construido con TypeScript y SQLite.

Reglas del proyecto:

1. Lenguaje y runtime: TypeScript con Node.js (versión LTS). Compilar con tsx o similar para ejecución directa.

2. Base de datos: SQLite usando better-sqlite3. La base de datos se almacena en un archivo local en el directorio del usuario (~/.task-cli/tasks.db).

3. Estructura del proyecto: mantener la estructura simple y plana. No usar clean architecture ni capas excesivas para un CLI de este tamaño. Organizar por funcionalidad: commands/, db/, utils/.

4. Estilo de código: funcional sobre clases. Usar funciones puras siempre que sea posible. camelCase para variables y funciones. PascalCase solo para tipos e interfaces.

5. CLI framework: usar Commander.js para el parseo de argumentos y comandos.

6. Manejo de errores: nunca mostrar stack traces al usuario. Mostrar mensajes claros y accionables. Usar códigos de salida apropiados (0 para éxito, 1 para error).

7. Testing: tests unitarios con Vitest. No se requiere cobertura mínima pero toda lógica de negocio debe tener tests.

8. Sin dependencias innecesarias: no agregar librerías para cosas que se pueden resolver con pocas líneas de código. No usar ORMs.

9. Output: toda salida al terminal debe ser legible. Usar tablas para listados (con cli-table3 o similar). Colores solo para estados y prioridades.

10. El CLI debe ser instalable globalmente con npm install -g.
