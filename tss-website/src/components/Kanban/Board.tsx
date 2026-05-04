"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, TaskStatus } from "@/types/kanban";
interface Project {
  id: number;
  name: string;
  description?: string;
  color: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
  columns?: Array<{ id: number; name: string; color: string; position: number; icon?: string }>;
  settings?: Record<string, any>;
}
import TaskCard from "./TaskCard";
import NewTaskModal from "./NewTaskModal";
import {
  Plus,
  Trash2,
  X,
  Calendar,
  GripVertical,
  Search,
  Filter,
  LayoutGrid,
  Settings,
} from "lucide-react";

interface KanbanBoardProps {
  tasks: Task[];
  projects: Project[];
  activeProjectId: number | null;
  onProjectChange: (id: number | null) => void;
  onTaskUpdate: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onAddTask: (project: Project, task: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt">) => void;
  onDeleteProject: (projectId: number) => void;
  onCreateProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
}

export default function KanbanBoard({
  tasks,
  projects,
  activeProjectId,
  onProjectChange,
  onTaskUpdate,
  onDeleteTask,
  onAddTask,
  onDeleteProject,
  onCreateProject,
}: KanbanBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColumns, setNewProjectColumns] = useState<
    Array<{ name: string; color?: string; icon?: string }>
  >([]);

  // DnD state
  const [activeItem, setActiveItem] = useState<any>(null);

  // Filtered tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Group tasks by project
  const tasksByProject = React.useMemo(() => {
    const grouped: Record<number, Task[]> = {};
    projects.forEach(project => {
      grouped[project.id] = filteredTasks.filter(task => task.projectId === project.id);
    });
    return grouped;
  }, [tasks, projects, filteredTasks]);

  // Define default columns per project
  const getColumns = useCallback((projectId: number) => {
    const columnConfig: { id: string; name: string; color: string; position: number }[] = [
      { id: "backlog", name: "Backlog", color: "#64748b", position: 0 },
      { id: "todo", name: "To Do", color: "#3b82f6", position: 1 },
      { id: "in_progress", name: "In Progress", color: "#f59e0b", position: 2 },
      { id: "completed", name: "Done", color: "#10b981", position: 3 },
    ];
    return columnConfig;
  }, []);

  // Add new task form state
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "medium",
    tags: [] as string[],
    assignedTo: null,
    status: "pending",
    projectId: activeProjectId,
  });

  const handleDragEnd = useCallback(() => {
    setActiveItem(null);
  }, []);

  const handleDrag = useCallback(() => {
    setActiveItem(null);
  }, []);

  const handleDragStart = useCallback(() => {
    setActiveItem(null);
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Project header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
        <div className="flex items-center gap-3">
          {activeProjectId && projects.find(p => p.id === activeProjectId) && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: projects.find(p => p.id === activeProjectId)?.color + "20" }}
            >
              <span className="font-bold text-[var(--color-dev)]">
                {projects.find(p => p.id === activeProjectId)?.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {projects.find(p => p.id === activeProjectId)?.name || "DEV"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {tasks.filter(t => t.projectId === activeProjectId).length} zadanie{tasks.filter(t => t.projectId === activeProjectId).length > 1 ? "a" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj zadań..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-dev)]"
            />
          </div>

          {/* Priority filter */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
              <Filter className="w-4 h-4" />
              Filtr
              <X className="w-3 h-3 opacity-0 group-hover:opacity-100" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">Priorytet:</div>
              {["all", "low", "medium", "high", "critical"].map((priority) => (
                <button
                  key={priority}
                  onClick={() => setPriorityFilter(priority)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg capitalize ${priorityFilter === priority ? 'bg-[var(--color-dev)]/10 text-[var(--color-dev)]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* New task button */}
          <button
            onClick={() => setShowNewTaskForm(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-[var(--color-dev)] bg-[var(--color-dev)]/10 text-[var(--color-dev)] hover:bg-[var(--color-dev)]/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Zadanie
          </button>

          {/* New project button */}
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            Projekt
          </button>

          {/* Settings */}
          <button className="p-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext
          collisionDetection={null}
          sensors={useSensor(PointerSensor, {
            activationConstraint: {
              distance: 8,
            },
          })}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
        >
          <SortableContext
            items={projects.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {projects.map(project => {
              const projectTasks = filteredTasks.filter(t => t.projectId === project.id);
              const columns = getColumns(project.id);

              return (
                <div
                  key={project.id}
                  className="flex-shrink-0 w-80 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 backdrop-blur-sm"
                >
                  {/* Column header */}
                  <div
                    className={`p-3 border-b border-gray-200 dark:border-zinc-800 rounded-t-2xl ${project.color === '#64748b' ? 'bg-gray-100/50 dark:bg-zinc-800/30' : ''}`}
                    style={{ backgroundColor: project.color + "10" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{project.name}</h3>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">
                          {projectTasks.length}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                        className="p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                        title="Usuń projekt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="p-3 min-h-[400px] overflow-y-auto">
                    {projectTasks.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                        Brak zadań w tym projekcie
                      </div>
                    ) : (
                      projectTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onTaskUpdate={onTaskUpdate}
                          onDeleteTask={onDeleteTask}
                          projectId={project.id}
                          onAddTask={onAddTask}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </SortableContext>
        </DndContext>
      </div>

      {/* New task modal */}
      {showNewTaskForm && (
        <NewTaskModal
          project={projects.find(p => p.id === activeProjectId)!}
          taskData={newTaskData}
          setTaskData={setNewTaskData}
          onSubmit={() => {
            if (newTaskData.title) {
              onAddTask(projects.find(p => p.id === activeProjectId)! as Project, {
                title: newTaskData.title,
                description: newTaskData.description || "",
                priority: newTaskData.priority || "medium",
                tags: newTaskData.tags || [],
                status: newTaskData.status || "pending",
                assignedTo: newTaskData.assignedTo || null,
              });
            }
            setShowNewTaskForm(false);
            setNewTaskData({
              title: "",
              description: "",
              priority: "medium",
              tags: [],
              assignedTo: null,
              status: "pending",
              projectId: activeProjectId,
            });
          }}
          onClose={() => setShowNewTaskForm(false)}
        />
      )}

      {/* New project modal would go here */}
    </div>
  );
}

// Sortable Card Component
interface SortableCardProps {
  task: Task;
  tags: Set<string>;
  onTaskUpdate: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  projectId: number;
  onAddTask: (project: Project, task: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt">) => void;
}

const SortableCard = ({
  task,
  tags,
  onTaskUpdate,
  onDeleteTask,
  projectId,
  onAddTask,
}: SortableCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors: Record<string, string> = {
    critical: "border-red-500/20 bg-red-500/5",
    high: "border-orange-500/20 bg-orange-500/5",
    medium: "border-yellow-500/20 bg-yellow-500/5",
    low: "border-green-500/20 bg-green-500/5",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-xl border p-3 mb-2 transition-all duration-200 cursor-grab ${priorityColors[task.priority] || priorityColors["medium"]} hover:bg-white/50 dark:hover:bg-zinc-800/50 hover:shadow-md`}
    >
      <div className="flex items-start gap-2 mb-2">
        <button
          {...listeners}
          className="p-1 -ml-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{task.title}</h4>
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.dueDate).toLocaleDateString('pl-PL')}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => onDeleteTask(task.id)}
          className="p-1 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
          title="Usuń zadanie"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Status indicator */}
      <div className="mt-2 flex items-center gap-1.5 text-[10px] uppercase font-medium text-gray-500 dark:text-gray-500">
        <span className={`w-1.5 h-1.5 rounded-full ${
          task.status === "completed" ? "bg-emerald-500" :
          task.status === "in_progress" ? "bg-blue-500" : "bg-gray-400"
        }`} />
        <span>{task.status.replace("_", " ")}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800/50">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {task.priority || "medium"}
        </span>
        <button
          onClick={() => {
            if (confirm("Dodaj nową kartę?" )) {
              const newTask: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt"> = {
                title: `Copy of ${task.title}`,
                description: task.description || "",
                status: "pending",
                priority: task.priority || "medium",
                tags: [...task.tags || []],
                assignedTo: task.assignedTo,
              };
              onAddTask({
                id: projectId,
                name: "Kopia",
                description: "",
                color: "#3b82f6",
              } as Project, newTask);
            }
          }}
          className="text-xs text-[var(--color-dev)] hover:underline"
        >
          Duplicuj
        </button>
      </div>
    </div>
  );
};
