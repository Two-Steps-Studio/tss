"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import type { DevTask, TaskStatus } from "@/lib/types/dev-types";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";

interface KanbanBoardProps {
  tasks: DevTask[];
  onEditTask: (task: DevTask) => void;
  onDeleteTask: (id: number) => void;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  onTaskMove: (taskId: number, newStatus: TaskStatus, newOrder: number) => Promise<void>;
}

export function KanbanBoard({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onTaskMove,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, DevTask[]> = {
      todo: [],
      in_progress: [],
      testing: [],
      completed: [],
    };

    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    // Sort by sort_order, then by id as fallback
    Object.keys(grouped).forEach((status) => {
      grouped[status as TaskStatus].sort((a, b) => {
        if (a.sort_order !== null && b.sort_order !== null) {
          return a.sort_order - b.sort_order;
        }
        return a.id - b.id;
      });
    });

    return grouped;
  }, [tasks]);

  const activeTask = useMemo(() => {
    return tasks.find((task) => task.id === activeId) || null;
  }, [tasks, activeId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropped on a column
    if (over.data.current?.type === "column") {
      const targetStatus = over.data.current.status as TaskStatus;
      if (targetStatus !== activeTask.status) {
        try {
          const columnTasks = tasksByStatus[targetStatus];
          const targetOrder = columnTasks.length;
          await onTaskMove(activeId, targetStatus, targetOrder);
        } catch (error) {
          console.error("Failed to move task:", error);
        }
      }
      return;
    }

    // Check if dropped on another task
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask) {
      const targetStatus = overTask.status;
      const columnTasks = tasksByStatus[targetStatus];
      const overIndex = columnTasks.findIndex((t) => t.id === overId);
      
      if (targetStatus !== activeTask.status || overIndex !== (activeTask.sort_order || 0)) {
        try {
          await onTaskMove(activeId, targetStatus, overIndex);
        } catch (error) {
          console.error("Failed to move task:", error);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(tasksByStatus) as [TaskStatus, DevTask[]][]).map(
          ([status, statusTasks]) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={statusTasks}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onStatusChange={onStatusChange}
            />
          )
        )}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onStatusChange={onStatusChange}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
