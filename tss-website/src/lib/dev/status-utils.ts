import type { DevProjectStats, DevTask, FileCategory, TaskStatus, TechCategory } from "@/lib/types/dev-types";

const DB_TO_UI: Record<string, TaskStatus> = {
  pending: "todo",
  todo: "todo",
  in_progress: "in_progress",
  testing: "testing",
  completed: "completed",
};

const UI_TO_DB: Record<TaskStatus, string> = {
  todo: "pending",
  in_progress: "in_progress",
  testing: "testing",
  completed: "completed",
};

export function toUiStatus(dbStatus: string): TaskStatus {
  return DB_TO_UI[dbStatus] ?? "todo";
}

export function toDbStatus(uiStatus: TaskStatus): string {
  return UI_TO_DB[uiStatus] ?? uiStatus;
}

export function normalizeTask(task: Record<string, unknown>): DevTask {
  return {
    id: task.id as number,
    project_id: task.project_id as number,
    title: (task.title as string) ?? "",
    description: (task.description as string) ?? "",
    status: toUiStatus((task.status as string) ?? "pending"),
    priority: (task.priority as DevTask["priority"]) ?? "medium",
    tags: (task.tags as string[]) ?? [],
    due_date: (task.due_date as string) ?? null,
    progress_percent: (task.progress_percent as number) ?? 0,
    assignee_name: (task.assignee_name as string) ?? null,
    estimated_hours: (task.estimated_hours as number) ?? null,
    created_at: (task.created_at as string) ?? new Date().toISOString(),
    updated_at: (task.updated_at as string) ?? undefined,
  };
}

export function computeStats(tasks: DevTask[]): DevProjectStats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const testing = tasks.filter((t) => t.status === "testing").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, inProgress, testing, todo, completionPercentage };
}

export const KANBAN_COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "Do zrobienia" },
  { id: "in_progress", label: "W trakcie" },
  { id: "testing", label: "Do testów" },
  { id: "completed", label: "Ukończone" },
];

export const FILE_CATEGORIES: { id: FileCategory; label: string }[] = [
  { id: "documentation", label: "Dokumentacja" },
  { id: "graphics", label: "Grafiki" },
  { id: "audio", label: "Audio" },
  { id: "source_code", label: "Kod źródłowy" },
  { id: "other", label: "Inne" },
];

export const TECH_CATEGORIES: { id: TechCategory; label: string }[] = [
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "game_engine", label: "Game Engine" },
  { id: "database", label: "Database" },
  { id: "ai", label: "AI" },
  { id: "devops", label: "DevOps" },
  { id: "other", label: "Inne" },
];
