"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Circle } from "lucide-react";
import type { DevTask, TaskStatus } from "@/lib/types/dev-types";
import { TaskCard } from "./task-card";

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  todo: <Circle size={16} className="text-gray-500" />,
  in_progress: <Clock size={16} className="text-blue-500" />,
  testing: <Clock size={16} className="text-yellow-500" />,
  completed: <CheckCircle size={16} className="text-green-500" />,
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: DevTask[];
  onEditTask: (task: DevTask) => void;
  onDeleteTask: (id: number) => void;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
}

export function KanbanColumn({ status, tasks, onEditTask, onDeleteTask, onStatusChange }: KanbanColumnProps) {
  const taskIds = tasks.map((task) => task.id);
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "column",
      status,
    },
  });

  return (
    <Card
      ref={setNodeRef}
      className={`rounded-3xl border-[var(--border-color)] h-full flex flex-col transition-colors ${
        isOver ? 'bg-[var(--color-dev)]/5 border-[var(--color-dev)]/30' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
            {statusIcons[status]}
            {status.replace("_", " ")}
          </CardTitle>
          <Badge variant="secondary" className="rounded-full">
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 overflow-y-auto">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No tasks
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStatusChange={onStatusChange}
              />
            ))
          )}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
