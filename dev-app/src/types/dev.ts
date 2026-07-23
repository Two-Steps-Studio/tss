export type TaskStatus = 'todo' | 'in-progress' | 'testing' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type FileCategory = 'documentation' | 'graphics' | 'audio' | 'source-code' | 'other';
export type TechCategory = 'Frontend' | 'Backend' | 'Game Engine' | 'Database' | 'AI' | 'DevOps' | 'Mobile' | 'Other';
export type RoadmapStatus = 'planned' | 'in-progress' | 'completed' | 'delayed';

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignee?: string;
  labels: string[];
  progress: number;
  comments: Comment[];
  createdAt: string;
}

export interface RoadmapItem {
  id: string;
  projectId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: RoadmapStatus;
  progress: number;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  size: string;
  category: FileCategory;
  uploadedAt: string;
}

export interface Technology {
  id: string;
  projectId: string;
  name: string;
  icon: string;
  version: string;
  category: TechCategory;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  plannedEndDate?: string;
  status: 'active' | 'archived' | 'completed';
}

export interface ProjectData {
  project: Project;
  tasks: Task[];
  roadmap: RoadmapItem[];
  files: ProjectFile[];
  description: string;
  technologies: Technology[];
}

export type TabKey = 'projects' | 'tasks' | 'roadmap' | 'files' | 'description' | 'technologies';
