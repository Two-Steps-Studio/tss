export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type FileCategory = 'documentation' | 'images' | 'audio' | 'video' | 'source-code' | 'other';
export type TechCategory = 'Frontend' | 'Backend' | 'Database' | 'AI' | 'Game Engine' | 'DevOps' | 'Other';
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
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  type: string;
  category: FileCategory;
  url: string;
  createdAt: string;
}

export interface Technology {
  id: string;
  projectId: string;
  name: string;
  category: TechCategory;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'completed';
  createdAt: string;
  updatedAt: string;
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