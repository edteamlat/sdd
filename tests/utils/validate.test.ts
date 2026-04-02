import { describe, it, expect } from 'vitest';
import { validateTitle, validateStatus, validatePriority, validateTransition, validateDeleteable } from '../../src/utils/validate';
import type { Task } from '../../src/db/types';

describe('validateTitle', () => {
  it('throws on empty string', () => {
    expect(() => validateTitle('')).toThrow('El título no puede estar vacío');
  });

  it('throws on whitespace-only string', () => {
    expect(() => validateTitle('   ')).toThrow('El título no puede estar vacío');
  });

  it('returns trimmed title', () => {
    expect(validateTitle('  Hola  ')).toBe('Hola');
  });
});

describe('validateStatus', () => {
  it('throws on invalid status', () => {
    expect(() => validateStatus('hecho')).toThrow('Estado inválido: "hecho". Valores permitidos: todo, in-progress, done');
  });

  it('accepts valid statuses', () => {
    expect(validateStatus('todo')).toBe('todo');
    expect(validateStatus('in-progress')).toBe('in-progress');
    expect(validateStatus('done')).toBe('done');
  });

  it('normalizes to lowercase', () => {
    expect(validateStatus('TODO')).toBe('todo');
    expect(validateStatus('Done')).toBe('done');
  });
});

describe('validatePriority', () => {
  it('throws on invalid priority', () => {
    expect(() => validatePriority('urgente')).toThrow('Prioridad inválida: "urgente". Valores permitidos: high, medium, low');
  });

  it('accepts valid priorities', () => {
    expect(validatePriority('high')).toBe('high');
    expect(validatePriority('medium')).toBe('medium');
    expect(validatePriority('low')).toBe('low');
  });

  it('normalizes to lowercase', () => {
    expect(validatePriority('HIGH')).toBe('high');
  });
});

describe('validateTransition', () => {
  it('throws on todo → done', () => {
    expect(() => validateTransition('todo', 'done')).toThrow("Transición inválida: todo → done. Una tarea debe pasar primero por 'in-progress'.");
  });

  it('throws on done → todo', () => {
    expect(() => validateTransition('done', 'todo')).toThrow("Transición inválida: done → todo. Una tarea completada debe volver a 'in-progress'.");
  });

  it('allows todo → in-progress', () => {
    expect(() => validateTransition('todo', 'in-progress')).not.toThrow();
  });

  it('allows in-progress → done', () => {
    expect(() => validateTransition('in-progress', 'done')).not.toThrow();
  });

  it('allows in-progress → todo', () => {
    expect(() => validateTransition('in-progress', 'todo')).not.toThrow();
  });

  it('allows done → in-progress', () => {
    expect(() => validateTransition('done', 'in-progress')).not.toThrow();
  });
});

describe('validateDeleteable', () => {
  const baseTask: Task = {
    id: 1,
    title: 'Test',
    description: null,
    status: 'todo',
    priority: 'medium',
    created_at: '2026-04-01T00:00:00Z',
  };

  it('does not throw for todo task', () => {
    expect(() => validateDeleteable({ ...baseTask, status: 'todo' })).not.toThrow();
  });

  it('throws for in-progress task with correct message', () => {
    expect(() => validateDeleteable({ ...baseTask, status: 'in-progress' })).toThrow(
      "No se puede borrar la tarea 1: el estado actual es 'in-progress'. Solamente las tareas en estado 'todo' pueden ser borradas."
    );
  });

  it('throws for done task with correct message', () => {
    expect(() => validateDeleteable({ ...baseTask, status: 'done' })).toThrow(
      "No se puede borrar la tarea 1: el estado actual es 'done'. Solamente las tareas en estado 'todo' pueden ser borradas."
    );
  });
});
