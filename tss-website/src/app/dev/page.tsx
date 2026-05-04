"use client";

export default function DevPage() {
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

    </div>
  );
}