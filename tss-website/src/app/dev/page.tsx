import KanbanBoard from "@/components/Kanban/Board";
import NewTaskModal from "@/components/Kanban/NewTaskModal";
import type { Project, Task } from "@/types/kanban";

// Placeholder for project data - w prawdziwej aplikacji to będzie fetch z /api/dev-projects
const initialProjects: Project[] = [
  {
    id: 1,
    name: "Two Steps Studio",
    description: "Główny projekt DEV",
    color: "#ffcb2f",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Przebuduj profil użytkownika",
    description: "Dodaj edycję awatara, zmianę hasła i ustawień profilowych",
    status: "pending",
    priority: "high",
    tags: ["feature", "design"],
    assignedTo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Ulepsz gamification",
    description: "Dodaj nową rangę i badge'y za aktywność",
    status: "in_progress",
    priority: "medium",
    tags: ["feature"],
    assignedTo: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Fix: błędy w Discord botcie",
    description: "Napraw wyłapywanie błędów w Discord botcie",
    status: "pending",
    priority: "critical",
    tags: ["bug"],
    assignedTo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function DevPage() {
  const [activeProjectId, setActiveProjectId] = useState<number>(1);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Handler dla dodania nowego projektu
  const handleCreateProject = async (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const newProject: Project = {
      ...projectData,
      id: projects.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects([...projects, newProject]);
    setActiveProjectId(newProject.id);
  };

  // Handler dla usuwania projektu
  const handleDeleteProject = (projectId: number) => {
    setProjects(projects.filter(p => p.id !== projectId));
    setTasks(tasks.filter(t => t.projectId !== projectId));
  };

  // Handler dla dodania nowego zadania
  const handleAddTask = async (project: Project, taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt">) => {
    const newTask: Task = {
      ...taskData,
      id: tasks.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  // Handler dla usuwania zadania
  const handleDeleteTask = async (taskId: number) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Handler dla aktualizacji zadania
  const handleUpdateTask = async (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg)] to-[var(--bg)] dark:from-black dark:to-zinc-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black dark:text-white mb-2">
          <span className="text-[var(--color-dev)]">DEV</span> Tasks
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
          Zarządzaj zadami projektu Two Steps Studio w nowoczesnym, wieloprojektowym Kanban board.
          Kliknij "+" aby dodać nowe zadanie lub stwórz nowy projekt.
        </p>
      </div>

      {/* Kanban board */}
      <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-4 md:p-6 shadow-xl">
        <KanbanBoard
          tasks={tasks}
          projects={projects}
          activeProjectId={activeProjectId}
          onProjectChange={setActiveProjectId}
          onTaskUpdate={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onAddTask={handleAddTask}
          onDeleteProject={handleDeleteProject}
          onCreateProject={handleCreateProject}
        />
      </div>
    </div>
  );
}
