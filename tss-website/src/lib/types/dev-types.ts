export type TaskStatus = "todo" | "in_progress" | "testing" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type FileCategory = "documentation" | "graphics" | "audio" | "source_code" | "other";
export type TechCategory = "frontend" | "backend" | "game_engine" | "database" | "ai" | "devops" | "other";
export type PhaseStatus = "planned" | "in_progress" | "completed" | "blocked";

export interface DevProject {
  id: number;
  owner_id?: string | null;
  name: string;
  description?: string | null;
  description_markdown?: string | null;
  color?: string;
  status?: string;
  planned_end_date?: string | null;
  is_archived?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DevTask {
  id: number;
  project_id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  tags?: string[];
  due_date?: string | null;
  progress_percent?: number;
  assignee_name?: string | null;
  estimated_hours?: number | null;
  created_at: string;
  updated_at?: string;
}

export interface DevTaskComment {
  id: number;
  task_id: number;
  author_id?: string | null;
  author_name?: string | null;
  content: string;
  created_at: string;
}

export interface DevRoadmapPhase {
  id: number;
  project_id: number;
  name: string;
  description?: string | null;
  start_date?: string | null;
  planned_end_date?: string | null;
  status: PhaseStatus;
  completion_percentage: number;
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

export interface DevProjectFile {
  id: number;
  project_id: number;
  name: string;
  storage_path?: string | null;
  file_url?: string | null;
  category: FileCategory;
  size_bytes?: number | null;
  mime_type?: string | null;
  created_at: string;
}

export interface DevTechnology {
  id: number;
  project_id: number;
  name: string;
  icon_slug?: string | null;
  version?: string | null;
  category: TechCategory;
  description?: string | null;
  sort_order: number;
  created_at: string;
}

export interface DevProjectStats {
  total: number;
  completed: number;
  inProgress: number;
  testing: number;
  todo: number;
  completionPercentage: number;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  description_markdown?: string;
  color?: string;
  planned_end_date?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  description_markdown?: string;
  color?: string;
  status?: string;
  planned_end_date?: string;
  is_archived?: boolean;
}

export interface CreateTaskData {
  project_id: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  due_date?: string;
  assignee_name?: string;
  estimated_hours?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  due_date?: string;
  progress_percent?: number;
  assignee_name?: string;
  estimated_hours?: number;
}

export interface CreatePhaseData {
  project_id: number;
  name: string;
  description?: string;
  start_date?: string;
  planned_end_date?: string;
  status?: PhaseStatus;
  completion_percentage?: number;
  sort_order?: number;
}

export interface UpdatePhaseData {
  name?: string;
  description?: string;
  start_date?: string;
  planned_end_date?: string;
  status?: PhaseStatus;
  completion_percentage?: number;
  sort_order?: number;
}

export interface CreateFileData {
  project_id: number;
  name: string;
  storage_path?: string;
  file_url?: string;
  category: FileCategory;
  size_bytes?: number;
  mime_type?: string;
}

export interface CreateTechnologyData {
  project_id: number;
  name: string;
  icon_slug?: string;
  version?: string;
  category: TechCategory;
  description?: string;
  sort_order?: number;
}

export interface UpdateTechnologyData {
  name?: string;
  icon_slug?: string;
  version?: string;
  category?: TechCategory;
  description?: string;
  sort_order?: number;
}

export interface ProjectsWithTasksResponse {
  projects: DevProject[];
  tasks: DevTask[];
}
