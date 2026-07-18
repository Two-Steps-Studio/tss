"use client";
import ProjectsArea from "@/components/Projects/project-area";
import RightSideBar from "@/components/Projects/right-side-bar/right-side-bar";
import TaskDialog from "@/components/Projects/task-dialog/task-dialog";
import { Project, Task } from "@/components/Projects/project-selection/project-selection";
import { useState } from "react";

export default function DevPage() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Project 1",
      icon: (props) => <svg {...props} />,
      createdAt: new Date(),
      tasks: [
        {
          id: "1",
          title: "Task 1",
          description: "Create content",
          priority: "low",
          status: "todo",
          project: { id: "1", name: "Project 1", icon: (p) => <svg {...p} />, createdAt: new Date(), tasks: [] },
        },
      ],
    },
    {
      id: "2",
      name: "Project 2",
      icon: (props) => <svg {...props} />,
      createdAt: new Date(),
      tasks: [
        {
          id: "2",
          title: "Task 2",
          description: "Review code",
          priority: "medium",
          status: "in-progress",
          project: { id: "2", name: "Project 2", icon: (p) => <svg {...p} />, createdAt: new Date(), tasks: [] },
        },
      ],
    },
    {
      id: "3",
      name: "Project 3",
      icon: (props) => <svg {...props} />,
      createdAt: new Date(),
      tasks: [
        {
          id: "3",
          title: "Task 3",
          description: "Deploy app",
          priority: "high",
          status: "completed",
          project: { id: "3", name: "Project 3", icon: (p) => <svg {...p} />, createdAt: new Date(), tasks: [] },
        },
      ],
    },
  ]);

  const [selectedProject, setSelectedProject] = useState<Project>(projects[0]);

  // Płytowanie zadań ze wszystkich projektów do jednego tablicy
  const allTasks: Task[] = projects.flatMap((p) => p.tasks);

  const setTasks = (updatedTasks: Task[]) => {
    const newProjects = projects.map((p) => {
      const index = updatedTasks.findIndex(
        (t) => t.project.id === p.id && t.id !== undefined,
      );
      if (index !== -1) {
        const updated = [...updatedTasks];
        updated.splice(index, 1, { ...updatedTasks[index], project: p });
        return { ...p, tasks: updated };
      }
      return p;
    });
    setProjects(newProjects);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg)] to-[var(--bg)] dark:from-black dark:to-zinc-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-black text-black dark:text-white mb-2">
            <span className="text-[var(--color-dev)]">DEV</span> Tasks
          </h1>

          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            Zarządzaj zadami projektu Two Steps Studio w nowoczesnym, wieloprojektowym Kanban board.
            Kliknij "+" aby dodać nowe zadanie lub stwórz nowy projekt.
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <TaskDialog
            isOpen={true}
            onClose={() => {}}
            projects={projects}
            onAddTask={(task: Omit<Task, 'id'>) => {
              const newTask: Task = {
                ...task,
                id: crypto.randomUUID(),
              };
              // Add task to the selected project
              const updatedTasks = projects.map(p => {
                if (p.id === task.project.id) {
                  return { ...p, tasks: [...p.tasks, newTask] };
                }
                return p;
              });
              setProjects(updatedTasks);
              // Set the task in the flat tasks array
              setTasks(prev => [...prev, newTask]);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-[3fr_1fr] px-6 mt-8 space-grotesk gap-4">
        <div className="min-h-[600px] rounded-3xl bg-red-500/10">
          <ProjectsArea projects={projects} setProjects={setProjects} tasks={allTasks} setTasks={setTasks} />
        </div>
        <div className="shrink-0 rounded-3xl bg-green-500/10 p-4">
          <div className="text-black dark:text-white">
            <p className="font-bold mb-2">RIGHT SIDEBAR</p>
            <RightSideBar
              projects={projects}
              setProjects={setProjects}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              tasks={selectedProject.tasks}
            />
          </div>
        </div>
      </div>
    </div>
  );
}