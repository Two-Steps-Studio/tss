"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  DevProject,
  DevProjectFile,
  DevProjectStats,
  DevRoadmapPhase,
  DevTask,
  DevTechnology,
  FileCategory,
  PhaseStatus,
  TaskPriority,
  TaskStatus,
  TechCategory,
  DevProjectMember,
  DevProjectRole,
  ProjectPermissions,
  PermissionName,
  UserProfileWithSubscription,
  AddMemberData,
  UpdateMemberData,
} from "@/lib/types/dev-types";
import { computeStats } from "@/lib/dev/status-utils";

const STORAGE_KEY = "tss-dev-active-project";

interface DevProjectContextValue {
  projects: DevProject[];
  activeProject: DevProject | null;
  activeProjectId: number | null;
  setActiveProjectId: (id: number) => void;
  tasks: DevTask[];
  phases: DevRoadmapPhase[];
  files: DevProjectFile[];
  technologies: DevTechnology[];
  members: DevProjectMember[];
  userSubscription: UserProfileWithSubscription | null;
  stats: DevProjectStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasAccessToDev: boolean;
  canCreateProject: boolean;
  hasPermission: (permission: PermissionName) => boolean;
  getUserRole: () => DevProjectRole | null;
  storageUsage: number;
  storageLimit: number;
  createProject: (name: string, description?: string, project_type?: string) => Promise<DevProject | null>;
  updateProject: (id: number, data: Partial<DevProject>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  createTask: (data: Partial<DevTask> & { title: string }) => Promise<DevTask | null>;
  updateTask: (id: number, data: Partial<DevTask>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  moveTask: (taskId: number, newStatus: TaskStatus, newOrder: number) => Promise<void>;
  createPhase: (data: { name: string; description?: string }) => Promise<void>;
  updatePhase: (id: number, data: Partial<DevRoadmapPhase>) => Promise<void>;
  deletePhase: (id: number) => Promise<void>;
  addFile: (data: { name: string; file_url?: string; category: FileCategory }) => Promise<void>;
  uploadFile: (file: File, category: FileCategory) => Promise<void>;
  deleteFile: (id: number) => Promise<void>;
  addTechnology: (data: { name: string; version?: string; category: TechCategory; description?: string; icon_slug?: string }) => Promise<void>;
  updateTechnology: (id: number, data: Partial<DevTechnology>) => Promise<void>;
  deleteTechnology: (id: number) => Promise<void>;
  saveDescription: (markdown: string) => Promise<void>;
  addMember: (data: AddMemberData) => Promise<void>;
  updateMember: (memberId: number, data: UpdateMemberData) => Promise<void>;
  removeMember: (memberId: number) => Promise<void>;
}

const DevProjectContext = createContext<DevProjectContextValue | null>(null);

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export function DevProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<DevProject[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<number | null>(null);
  const [tasks, setTasks] = useState<DevTask[]>([]);
  const [phases, setPhases] = useState<DevRoadmapPhase[]>([]);
  const [files, setFiles] = useState<DevProjectFile[]>([]);
  const [technologies, setTechnologies] = useState<DevTechnology[]>([]);
  const [members, setMembers] = useState<DevProjectMember[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserProfileWithSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageUsage, setStorageUsage] = useState<number>(0);
  const [storageLimit, setStorageLimit] = useState<number>(500 * 1024 * 1024); // 500MB

  const projectsMap = useMemo(
    () => new Map(projects.map(p => [p.id, p])),
    [projects]
  );

  const activeProject = useMemo(
    () => projectsMap.get(activeProjectId ?? -1) ?? null,
    [projectsMap, activeProjectId]
  );

  const stats = useMemo(() => computeStats(tasks), [tasks]);

  const hasAccessToDev = useMemo(() => {
    return projects.length > 0;
  }, [projects]);

  const canCreateProject = useMemo(() => {
    if (!userSubscription) return false;
    return projects.length < userSubscription.project_limit;
  }, [projects.length, userSubscription]);

  const hasPermission = useCallback((permission: PermissionName): boolean => {
    if (!activeProject) return false;
    
    // Owner has all permissions
    if (activeProject.user_role === 'owner') return true;
    
    // Check user's permissions
    if (activeProject.user_permissions) {
      return activeProject.user_permissions[permission] || false;
    }
    
    // Role-based fallback
    const role = activeProject.user_role;
    if (!role) return false;
    
    switch (role) {
      case 'admin':
        return permission !== 'delete_project';
      case 'developer':
        return ['view_project', 'edit_project', 'manage_tasks', 'manage_files', 'manage_description', 'manage_technologies'].includes(permission);
      case 'tester':
        return permission.startsWith('view_');
      case 'viewer':
        return permission.startsWith('view_');
      default:
        return false;
    }
  }, [activeProject]);

  const getUserRole = useCallback((): DevProjectRole | null => {
    return activeProject?.user_role || null;
  }, [activeProject]);

  const setActiveProjectId = useCallback((id: number) => {
    setActiveProjectIdState(id);
    localStorage.setItem(STORAGE_KEY, String(id));
  }, []);

  const loadProjectData = useCallback(async (projectId: number) => {
    const [tasksData, phasesData, filesResponse, techData, membersData] = await Promise.all([
      fetchJson<DevTask[]>(`/api/dev-tasks?projectId=${projectId}`).catch(() => []),
      fetchJson<DevRoadmapPhase[]>(`/api/dev/roadmap?projectId=${projectId}`).catch(() => []),
      fetchJson<{ files: DevProjectFile[]; storageUsage: number; storageLimit: number }>(`/api/dev/files?projectId=${projectId}`).catch(() => ({ files: [], storageUsage: 0, storageLimit: 500 * 1024 * 1024 })),
      fetchJson<DevTechnology[]>(`/api/dev/technologies?projectId=${projectId}`).catch(() => []),
      fetchJson<DevProjectMember[]>(`/api/dev/members?projectId=${projectId}`).catch(() => []),
    ]);

    // Batch state updates to prevent multiple re-renders
    setTasks(tasksData);
    setPhases(phasesData);
    setFiles(filesResponse.files);
    setStorageUsage(filesResponse.storageUsage);
    setStorageLimit(filesResponse.storageLimit);
    setTechnologies(techData);
    setMembers(membersData);
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [projectsData, subscriptionData] = await Promise.all([
        fetchJson<DevProject[]>("/api/dev-projects").catch(() => []),
        fetchJson<UserProfileWithSubscription>("/api/dev/subscription").catch(() => null),
      ]);
      setProjects(projectsData);
      setUserSubscription(subscriptionData);

      let projectId = activeProjectId;
      if (!projectId && projectsData.length > 0) {
        const stored = localStorage.getItem(STORAGE_KEY);
        const storedId = stored ? Number(stored) : null;
        projectId = storedId && projectsData.some((p) => p.id === storedId)
          ? storedId
          : projectsData[0].id;
        setActiveProjectIdState(projectId);
      }

      if (projectId) {
        await loadProjectData(projectId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd ładowania danych");
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, loadProjectData]);

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      loadProjectData(activeProjectId).catch(() => {});
    }
  }, [activeProjectId, loadProjectData]);

  const createProject = useCallback(async (name: string, description?: string, project_type?: string) => {
    const project = await fetchJson<DevProject>("/api/dev-projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, project_type }),
    });
    setProjects((prev) => [project, ...prev]);
    setActiveProjectId(project.id);
    return project;
  }, [setActiveProjectId]);

  const updateProject = useCallback(async (id: number, data: Partial<DevProject>) => {
    const updated = await fetchJson<DevProject>(`/api/dev-projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  }, []);

  const deleteProject = useCallback(async (id: number) => {
    await fetchJson(`/api/dev-projects/${id}`, { method: "DELETE" });
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (activeProjectId === id && next.length > 0) {
        setActiveProjectId(next[0].id);
      } else if (next.length === 0) {
        setActiveProjectIdState(null);
      }
      return next;
    });
  }, [activeProjectId, setActiveProjectId]);

  const createTask = useCallback(async (data: Partial<DevTask> & { title: string }) => {
    if (!activeProjectId) return null;
    const task = await fetchJson<DevTask>("/api/dev-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, project_id: activeProjectId }),
    });
    setTasks((prev) => [task, ...prev]);
    return task;
  }, [activeProjectId]);

  const updateTask = useCallback(async (id: number, data: Partial<DevTask>) => {
    const updated = await fetchJson<DevTask>(`/api/dev-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    await fetchJson(`/api/dev-tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const moveTask = useCallback(async (taskId: number, newStatus: TaskStatus, newOrder: number) => {
    // Update local state optimistically
    const previousTasks = [...tasks];
    setTasks((prev) => {
      const taskIndex = prev.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return prev;

      const updatedTask = { ...prev[taskIndex], status: newStatus, sort_order: newOrder };
      const newTasks = [...prev];
      newTasks[taskIndex] = updatedTask;

      return newTasks;
    });

    try {
      await updateTask(taskId, { status: newStatus, sort_order: newOrder });
    } catch (error) {
      // Rollback on error
      setTasks(previousTasks);
      throw error;
    }
  }, [tasks, updateTask]);

  const createPhase = useCallback(async (data: { name: string; description?: string }) => {
    if (!activeProjectId) return;
    const phase = await fetchJson<DevRoadmapPhase>("/api/dev/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, project_id: activeProjectId }),
    });
    setPhases((prev) => [...prev, phase]);
  }, [activeProjectId]);

  const updatePhase = useCallback(async (id: number, data: Partial<DevRoadmapPhase>) => {
    const updated = await fetchJson<DevRoadmapPhase>("/api/dev/roadmap", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    setPhases((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }, []);

  const deletePhase = useCallback(async (id: number) => {
    await fetchJson(`/api/dev/roadmap?id=${id}`, { method: "DELETE" });
    setPhases((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addFile = useCallback(async (data: { name: string; file_url?: string; category: FileCategory }) => {
    if (!activeProjectId) return;
    const file = await fetchJson<DevProjectFile>("/api/dev/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, project_id: activeProjectId }),
    });
    setFiles((prev) => [file, ...prev]);
    setStorageUsage((prev) => prev + (file.size_bytes || 0));
  }, [activeProjectId]);

  const uploadFile = useCallback(async (file: File, category: FileCategory) => {
    if (!activeProjectId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', String(activeProjectId));
    formData.append('category', category);

    const response = await fetch('/api/dev/files', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const uploadedFile = await response.json();
    setFiles((prev) => [uploadedFile, ...prev]);
    setStorageUsage((prev) => prev + (uploadedFile.size_bytes || 0));
  }, [activeProjectId]);

  const deleteFile = useCallback(async (id: number) => {
    const file = files.find((f) => f.id === id);
    await fetchJson(`/api/dev/files?id=${id}`, { method: "DELETE" });
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (file) {
      setStorageUsage((prev) => prev - (file.size_bytes || 0));
    }
  }, [files]);

  const addTechnology = useCallback(async (data: { name: string; version?: string; category: TechCategory; description?: string; icon_slug?: string }) => {
    if (!activeProjectId) return;
    const tech = await fetchJson<DevTechnology>("/api/dev/technologies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, project_id: activeProjectId }),
    });
    setTechnologies((prev) => [...prev, tech]);
  }, [activeProjectId]);

  const updateTechnology = useCallback(async (id: number, data: Partial<DevTechnology>) => {
    const updated = await fetchJson<DevTechnology>("/api/dev/technologies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    setTechnologies((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const deleteTechnology = useCallback(async (id: number) => {
    await fetchJson(`/api/dev/technologies?id=${id}`, { method: "DELETE" });
    setTechnologies((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const saveDescription = useCallback(async (markdown: string) => {
    if (!activeProjectId) return;
    await updateProject(activeProjectId, { description_markdown: markdown });
  }, [activeProjectId, updateProject]);

  const addMember = useCallback(async (data: AddMemberData) => {
    if (!activeProjectId) return;
    const member = await fetchJson<DevProjectMember>("/api/dev/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, project_id: activeProjectId }),
    });
    setMembers((prev) => [...prev, member]);
  }, [activeProjectId]);

  const updateMember = useCallback(async (memberId: number, data: UpdateMemberData) => {
    const updated = await fetchJson<DevProjectMember>(`/api/dev/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
  }, []);

  const removeMember = useCallback(async (memberId: number) => {
    await fetchJson(`/api/dev/members/${memberId}`, { method: "DELETE" });
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }, []);

  const value: DevProjectContextValue = useMemo(() => ({
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    tasks,
    phases,
    files,
    technologies,
    members,
    userSubscription,
    stats,
    isLoading,
    error,
    refetch,
    hasAccessToDev,
    canCreateProject,
    hasPermission,
    getUserRole,
    storageUsage,
    storageLimit,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    createPhase,
    updatePhase,
    deletePhase,
    addFile,
    uploadFile,
    deleteFile,
    addTechnology,
    updateTechnology,
    deleteTechnology,
    saveDescription,
    addMember,
    updateMember,
    removeMember,
  }), [
    projects,
    activeProject,
    activeProjectId,
    tasks,
    phases,
    files,
    technologies,
    members,
    userSubscription,
    stats,
    isLoading,
    error,
    refetch,
    hasAccessToDev,
    canCreateProject,
    hasPermission,
    getUserRole,
    storageUsage,
    storageLimit,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    createPhase,
    updatePhase,
    deletePhase,
    addFile,
    uploadFile,
    deleteFile,
    addTechnology,
    updateTechnology,
    deleteTechnology,
    saveDescription,
    addMember,
    updateMember,
    removeMember,
  ]);

  return (
    <DevProjectContext.Provider value={value}>
      {children}
    </DevProjectContext.Provider>
  );
}

export function useDevProject() {
  const ctx = useContext(DevProjectContext);
  if (!ctx) {
    throw new Error("useDevProject must be used within DevProjectProvider");
  }
  return ctx;
}
