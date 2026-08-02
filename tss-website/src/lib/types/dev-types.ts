export type TaskStatus = "todo" | "in_progress" | "testing" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type FileCategory = "documentation" | "graphics" | "audio" | "source_code" | "other";
export type TechCategory = "frontend" | "backend" | "game_engine" | "database" | "ai" | "devops" | "other";
export type PhaseStatus = "planned" | "in_progress" | "completed" | "blocked";
export type ProjectType = "general" | "web_application" | "mobile_application" | "desktop_application" | "game" | "api" | "library" | "plugin" | "other";

// Permission System Types
export type DevProjectRole = "owner" | "admin" | "developer" | "tester" | "viewer";
export type SubscriptionPlan = "free" | "basic" | "pro" | "enterprise";
export type DevProjectStatus = "active" | "archived" | "deleted";

export type PermissionName =
  | "view_project"
  | "edit_project"
  | "manage_tasks"
  | "manage_kanban"
  | "manage_files"
  | "manage_description"
  | "manage_roadmap"
  | "manage_technologies"
  | "manage_members"
  | "manage_settings"
  | "delete_project";

export type InviteStatus = "pending" | "accepted" | "rejected" | "expired" | "cancelled";

export type ActivityAction =
  | "project_created"
  | "project_updated"
  | "project_archived"
  | "project_restored"
  | "project_deleted"
  | "member_added"
  | "member_removed"
  | "member_role_changed"
  | "member_permissions_changed"
  | "invite_sent"
  | "invite_accepted"
  | "invite_rejected"
  | "invite_cancelled"
  | "task_created"
  | "task_updated"
  | "task_deleted"
  | "task_status_changed"
  | "phase_created"
  | "phase_updated"
  | "phase_deleted"
  | "file_uploaded"
  | "file_deleted"
  | "technology_added"
  | "technology_updated"
  | "technology_deleted"
  | "description_updated"
  | "settings_updated";

export interface ProjectPermissions {
  view_project: boolean;
  edit_project: boolean;
  manage_tasks: boolean;
  manage_kanban: boolean;
  manage_files: boolean;
  manage_description: boolean;
  manage_roadmap: boolean;
  manage_technologies: boolean;
  manage_members: boolean;
  manage_settings: boolean;
  delete_project: boolean;
}

export interface DevProjectMember {
  id: number;
  project_id: number;
  user_id: string;
  role: DevProjectRole;
  permissions: ProjectPermissions;
  joined_at: string;
}

export interface UserProfileWithSubscription {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
  project_limit: number;
  subscription_plan: SubscriptionPlan;
  subscription_status: string;
  subscription_expires_at?: string | null;
}

export interface DevProject {
  id: number;
  owner_id?: string | null;
  name: string;
  description?: string | null;
  description_markdown?: string | null;
  color?: string;
  status?: string;
  project_type?: ProjectType;
  planned_end_date?: string | null;
  is_archived?: boolean;
  created_at: string;
  updated_at?: string;
  members?: DevProjectMember[];
  user_role?: DevProjectRole;
  user_permissions?: ProjectPermissions;
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
  project_type?: ProjectType;
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

export interface AddMemberData {
  project_id: number;
  user_id: string;
  role: DevProjectRole;
  permissions?: ProjectPermissions;
}

export interface UpdateMemberData {
  role?: DevProjectRole;
  permissions?: ProjectPermissions;
  keep_custom_permissions?: boolean;
}

export interface DevProjectInvite {
  id: number;
  project_id: number;
  email: string;
  username?: string | null;
  invited_by: string;
  role: DevProjectRole;
  permissions: ProjectPermissions;
  status: InviteStatus;
  token: string;
  expires_at: string;
  accepted_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateInviteData {
  project_id: number;
  email: string;
  username?: string;
  role: DevProjectRole;
  permissions?: ProjectPermissions;
  expires_in_hours?: number;
}

export interface DevActivityLog {
  id: number;
  project_id: number;
  user_id?: string | null;
  action: ActivityAction;
  entity_type?: string | null;
  entity_id?: number | null;
  details: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}
