import type { Status, Priority, Task } from '../db/types';

export function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error('El título no puede estar vacío');
  }
  return trimmed;
}

export function validateStatus(value: string): Status {
  const normalized = value.toLowerCase();
  const valid: Status[] = ['todo', 'in-progress', 'done'];
  if (!valid.includes(normalized as Status)) {
    throw new Error(`Estado inválido: "${value}". Valores permitidos: todo, in-progress, done`);
  }
  return normalized as Status;
}

export function validatePriority(value: string): Priority {
  const normalized = value.toLowerCase();
  const valid: Priority[] = ['high', 'medium', 'low'];
  if (!valid.includes(normalized as Priority)) {
    throw new Error(`Prioridad inválida: "${value}". Valores permitidos: high, medium, low`);
  }
  return normalized as Priority;
}

export function validateTransition(from: Status, to: Status): void {
  if (from === 'todo' && to === 'done') {
    throw new Error(`Transición inválida: todo → done. Una tarea debe pasar primero por 'in-progress'.`);
  }
  if (from === 'done' && to === 'todo') {
    throw new Error(`Transición inválida: done → todo. Una tarea completada debe volver a 'in-progress'.`);
  }
}

export function validateDeleteable(task: Task): void {
  if (task.status !== 'todo') {
    throw new Error(
      `No se puede borrar la tarea ${task.id}: el estado actual es '${task.status}'. Solamente las tareas en estado 'todo' pueden ser borradas.`
    );
  }
}
