"use client";

import React, { useState } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Calendar, Clock, Tag, User, AlertCircle, CheckCircle2, Flame, Circle } from "lucide-react";
import type { Task } from "@/types/kanban";

interface TaskCardProps {
  task: Task;
  tags: Set<string>;
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "critical": return <Flame className="w-3 h-3 text-red-500" />;
    case "high": return <AlertCircle className="w-3 h-3 text-orange-500" />;
    case "medium": return <Circle className="w-3 h-3 text-yellow-500" />;
    default: return <Circle className="w-3 h-3 text-green-500" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical": return "bg-red-500/10 border-red-500/20";
    case "high": return "bg-orange-500/10 border-orange-500/20";
    case "medium": return "bg-yellow-500/10 border-yellow-500/20";
    default: return "bg-green-500/10 border-green-500/20";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "in_progress": return <Clock className="w-4 h-4 text-blue-500" />;
    default: return <Calendar className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-emerald-500/5 border-emerald-500/20";
    case "in_progress": return "bg-blue-500/5 border-blue-500/20";
    default: return "bg-gray-500/5 border-gray-500/20";
  }
};

export default function TaskCard({ task, tags }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const [showDescription, setShowDescription] = useState(false);
  const priority = task.priority || "medium";
  const status = task.status || "pending";
  const cardColor = getPriorityColor(priority);
  const cardGradient = task.priority === "critical" ? "from-red-500/5" : task.priority === "high" ? "from-orange-500/5" : "from-blue-500/5";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative rounded-2xl border ${cardColor} bg-gradient-to-br ${cardGradient} from-white/80 to-white/90 dark:from-zinc-900/80 dark:to-zinc-900/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isDragging ? 'ring-2 ring-[var(--color-dev)]' : ''}`}
    >
      {/* Hover gradient accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-dev)]/0 via-[var(--color-dev)]/20 to-[var(--color-dev)]/0 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Drag handle */}
      <div
        className="flex items-center gap-2 p-3 cursor-move hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-t-2xl"
        draggable
      >
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2">{task.title}</span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700 cursor-pointer transition-colors capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Priority indicator */}
        <div className="flex items-center gap-1.5">
          {getPriorityIcon(priority)}
          <span className="text-[10px] uppercase font-medium text-gray-500 dark:text-gray-500">{priority}</span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5">
          {getStatusIcon(status)}
          <span className="text-[10px] uppercase font-medium text-gray-500 dark:text-gray-500 capitalize">{status.replace('_', ' ')}</span>
        </div>

        {/* Due date */}
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(task.dueDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        )}

        {/* Assigned user */}
        {task.assignedTo && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
            <User className="w-3 h-3" />
            <span>User #{task.assignedTo}</span>
          </div>
        )}

        {/* Description toggle */}
        {(task.description || showDescription) && (
          <div className={`overflow-hidden transition-all duration-200 ${showDescription ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">{task.description}</p>
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="mt-1 text-[10px] text-[var(--color-dev)] hover:underline"
            >
              {showDescription ? 'Zamknij' : 'Pokaż opis'}
            </button>
          </div>
        )}
      </div>

      {/* Close on click outside */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowDescription(false); }}
        className="absolute right-2 top-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-opacity"
      >
        <X className="w-3 h-3 text-gray-400" />
      </button>
    </div>
  );
}
