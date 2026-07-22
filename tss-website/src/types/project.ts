export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  plannedEndDate?: Date;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  progress: number; // 0-100
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  assignee?: string;
  labels?: string[];
  dueDate?: Date;
  progress?: number; // 0-100
  comments?: TaskComment[];
};

export type TaskComment = {
  id: string;
  taskId: string;
  author: string;
  content: string;
  createdAt: Date;
};

export type File = {
  id: string;
  projectId: string;
  name: string;
  type: 'document' | 'image' | 'audio' | 'code' | 'other';
  size?: number; // in bytes
  uploadedAt: Date;
  category: string;
};

export type Technology = {
  id: string;
  projectId: string;
  name: string;
  icon?: string;
  version?: string;
  category: 'frontend' | 'backend' | 'game-engine' | 'database' | 'ai' | 'devops' | 'other';
  description?: string;
};

export type RoadmapItem = {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  startDate: Date;
  plannedEndDate: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  progress: number; // 0-100
};