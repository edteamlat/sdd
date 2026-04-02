export type Status = 'todo' | 'in-progress' | 'done';
export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  created_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
}

export interface ListFilters {
  status?: Status;
  priority?: Priority;
}
