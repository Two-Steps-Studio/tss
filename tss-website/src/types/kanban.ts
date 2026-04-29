// Kanban board types for DEV tasks

export type TaskStatus = "pending" | "in_progress" | "completed";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type TaskTag = "feature" | "bug" | "chore" | "docs" | "design" | "testing" | "refactor";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: TaskTag[];
  assignedTo?: number;
  dueDate?: string;
  estimatedHours?: string;
  actualHours?: string;
  customFields?: Record<string, any>;
  projectId?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  color: string;
  status: "active" | "archived";
  columns?: Array<{ id: number; name: string; color: string; position: number; icon?: string }>;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: TaskTag[];
  assignedTo?: number;
  dueDate?: string;
  estimatedHours?: string;
  projectId?: number;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  color?: string;
  columns?: Array<{ name: string; color?: string; icon?: string }>;
}
