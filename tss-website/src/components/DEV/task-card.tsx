"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DevTask } from "@/lib/types/dev-types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, User } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-green-500/15 text-green-700 dark:text-green-400",
  medium: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  high: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  critical: "bg-red-500/15 text-red-700 dark:text-red-400",
};

interface TaskCardProps {
  task: DevTask;
  onClick?: () => void;
  isDragging?: boolean;
}

export default function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
    disabled: isDragging,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={isDragging ? undefined : setNodeRef}
      style={isDragging ? undefined : style}
      {...(isDragging ? {} : { ...attributes, ...listeners })}
      onClick={onClick}
      className={cn(
        "p-3 rounded-xl border bg-card cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
        isDragging && "shadow-lg rotate-2 opacity-90"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge className={cn("text-[10px] border-0", PRIORITY_COLORS[task.priority])}>
          {task.priority}
        </Badge>
        {task.progress_percent != null && task.progress_percent > 0 && (
          <span className="text-[10px] text-muted-foreground">{task.progress_percent}%</span>
        )}
      </div>
      <p className="font-semibold text-sm leading-tight">{task.title}</p>
      {task.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
      )}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{tag}</span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
        {task.assignee_name && (
          <span className="flex items-center gap-0.5"><User className="h-3 w-3" />{task.assignee_name}</span>
        )}
        {task.due_date && (
          <span className="flex items-center gap-0.5">
            <Calendar className="h-3 w-3" />
            {new Date(task.due_date).toLocaleDateString("pl-PL")}
          </span>
        )}
      </div>
    </div>
  );
}
