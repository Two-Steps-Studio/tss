"use client";

import { useState } from "react";
import { ProjectsArea, Project } from "@/components/Projects/project-area";
import RightSideBar from "@/components/Projects/right-side-bar/right-side-bar";
import TaskDialog from "@/components/Projects/task-dialog/task-dialog";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";
import { SortingDropDown } from "@/components/sorting-drop-down";

type Task = {
    id: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: "todo" | "in-progress" | "completed";
    project: Project;
};

export default function DevPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([
    {
        id: "1",
        name: "Project 1",
        icon: FaPlus,
        createdAt: new Date(),
        tasks: ["Task 1", "Task 2", "Task 3"],
    },
    {
        id: "2",
        name: "Project 2",
        icon: FaPlus,
        createdAt: new Date(),
        tasks: ["Task 4", "Task 5"],
    },
    {
        id: "3",
        name: "Project 3",
        icon: FaPlus,
        createdAt: new Date(),
        tasks: ["Task 6"],
    },
  ]);

  const [selectedProject, setSelectedProject] = useState<Project>(projects[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
        ...task,
        id: Date.now().toString(),
    };
    setTasks([...tasks, newTask]);
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg)] to-[var(--bg)] dark:from-black dark:to-zinc-950 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-black dark:text-white mb-2">
              <span className="text-[var(--color-dev)]">DEV</span> Tasks
            </h1>

            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Zarządzaj zadaniami projektu Two Steps Studio w nowoczesnym, wieloprojektowym Kanban board.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
                onClick={() => setIsDialogOpen(true)}
                className="rounded-2xl shadow-none"
            >
                <FaPlus className="mr-2" />
                Add Task
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_380px] gap-6">
          {/* Main Content - Boards */}
          <Card className="shadow-none p-6 rounded-3xl">
            <ProjectsArea projects={projects} setProjects={setProjects} tasks={tasks} setTasks={setTasks} />
          </Card>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6">
            <RightSideBar
                projects={projects}
                setProjects={setProjects}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                tasks={tasks}
            />
          </div>
        </div>
      </div>

      <TaskDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          projects={projects}
          onAddTask={addTask}
      />
    </div>
  );
}