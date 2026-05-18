"use client";
import ProjectsArea from "@/components/Projects/project-area";
import RightSideBar from "@/components/Projects/right-side-bar/right-side-bar";
import TaskDialog from "@/components/Projects/task-dialog/task-dialog";

export default function DevPage() {
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
          <TaskDialog/>
        </div>
      </div>

      <div className="grid grid-cols-[3fr_1fr] px-6 mt-8 space-grotesk gap-4">
          <div className="min-h-[600px] rounded-3xl bg-red-500/10">
              <ProjectsArea/>
          </div>
          <div className="shrink-0 rounded-3xl bg-green-500/10 p-4">
              <div className="text-black dark:text-white">
                  <p className="font-bold mb-2">RIGHT SIDEBAR</p>
                  <RightSideBar/>
              </div>
          </div>
      </div>
    </div>
  );
}