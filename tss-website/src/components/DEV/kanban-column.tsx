"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { DevTask, TaskStatus } from "@/lib/types/dev-types";
import TaskCard from "./task-card";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: DevTask[];
  onTaskClick: (task: DevTask) => void;
}

export default function KanbanColumn({ id, title, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-2xl border p-3 min-h-[400px] transition-colors",
        isOver ? "border-[var(--color-dev)] bg-[var(--color-dev)]/5" : "border-border bg-card/50"
      )}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs font-bold bg-muted rounded-full px-2 py-0.5">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[calc(100vh-320px)]">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
