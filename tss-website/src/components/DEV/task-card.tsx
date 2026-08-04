"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, Clock, Circle } from "lucide-react";
import type { DevTask, TaskPriority, TaskStatus } from "@/lib/types/dev-types";

const priorityColors: Record<TaskPriority, string> = {
  low: "text-gray-500",
  medium: "text-yellow-500",
  high: "text-orange-500",
  critical: "text-red-500",
};

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  todo: <Circle size={16} className="text-gray-500" />,
  in_progress: <Clock size={16} className="text-blue-500" />,
  testing: <Clock size={16} className="text-yellow-500" />,
  completed: <CheckCircle size={16} className="text-green-500" />,
};

interface TaskCardProps {
  task: DevTask;
  onEdit: (task: DevTask) => void;
  onDelete: (id: number) => void;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border-[var(--border-color)] hover:border-[var(--color-dev)]/50 transition-all cursor-pointer ${
        isSortableDragging ? "shadow-lg scale-105" : ""
      }`}
      onClick={() => onEdit(task)}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm">{task.title}</h3>
          <Badge
            className={`rounded-full text-xs ${priorityColors[task.priority]}`}
            variant="outline"
          >
            {task.priority}
          </Badge>
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex gap-1" role="group" aria-label="Task status controls">
            {Object.entries(statusIcons).map(([s, icon]) => (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task.id, s as TaskStatus);
                }}
                className={`p-1 rounded transition-colors ${
                  task.status === s ? "bg-[var(--color-dev)]/20" : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                title={`Change to ${s.replace("_", " ")}`}
                aria-label={`Change status to ${s.replace("_", " ")}`}
                aria-pressed={task.status === s}
              >
                {icon}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            aria-label="Delete task"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
