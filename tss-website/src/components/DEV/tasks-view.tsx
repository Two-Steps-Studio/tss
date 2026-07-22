"use client";

import { useState } from "react";
import { useDevProject } from "@/contexts/dev-project-context";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, Loader2, Trash2 } from "lucide-react";
import type { TaskStatus, TaskPriority } from "@/lib/types/dev-types";

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: "todo", label: "Do zrobienia", color: "border-slate-500/30" },
  { status: "in_progress", label: "W trakcie", color: "border-yellow-500/30" },
  { status: "testing", label: "Testowane", color: "border-blue-500/30" },
  { status: "completed", label: "Ukończone", color: "border-green-500/30" },
];

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  low: "bg-slate-500/10 text-slate-500",
  medium: "bg-blue-500/10 text-blue-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
};

export default function TasksView() {
  const { tasks, createTask, updateTask, deleteTask, isLoading } =
    useDevProject();
  const [adding, setAdding] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-dev)]" />
      </div>
    );
  }

  const handleAdd = async () => {
    if (!draftTitle.trim()) return;
    await createTask({ title: draftTitle.trim(), status: "todo", priority: "medium" });
    setDraftTitle("");
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Pasek akcji */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Łącznie zadań: <span className="font-bold text-foreground">{tasks.length}</span>
        </p>
        <Button
          size="sm"
          onClick={() => setAdding(true)}
          className="rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nowe zadanie
        </Button>
      </div>

      {/* Szybkie dodawanie */}
      {adding && (
        <div className="flex gap-2 rounded-2xl border bg-card p-3">
          <input
            autoFocus
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Tytuł zadania..."
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <Button size="sm" onClick={handleAdd} disabled={!draftTitle.trim()}>
            Dodaj
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setAdding(false);
              setDraftTitle("");
            }}
          >
            Anuluj
          </Button>
        </div>
      )}

      {/* Kolumny kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.status);
          return (
            <div
              key={col.status}
              className={`rounded-2xl border-2 ${col.color} bg-card/50 p-3`}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  {col.label}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2 min-h-[80px]">
                {items.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-6 border border-dashed rounded-xl">
                    Brak zadań
                  </div>
                )}

                {items.map((task) => (
                  <div
                    key={task.id}
                    className="group rounded-xl border bg-card p-3 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-medium text-sm leading-snug flex-1">
                        {task.title}
                      </p>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.medium
                        }`}
                      >
                        {task.priority}
                      </span>

                      <select
                        value={task.status}
                        onChange={(e) =>
                          updateTask(task.id, {
                            status: e.target.value as TaskStatus,
                          })
                        }
                        className="text-[10px] bg-background border rounded px-1.5 py-0.5"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.status} value={c.status}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && !adding && (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          <ListTodo className="h-10 w-10 mx-auto mb-3 opacity-50" />
          Brak zadań. Kliknij „Nowe zadanie", aby dodać pierwsze.
        </div>
      )}
    </div>
  );
}
