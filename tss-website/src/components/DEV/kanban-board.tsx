"use client";

import { useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { useDevProject } from "@/contexts/dev-project-context";
import { KANBAN_COLUMNS } from "@/lib/dev/status-utils";
import type { DevTask, TaskStatus } from "@/lib/types/dev-types";
import KanbanColumn from "./kanban-column";
import TaskCard from "./task-card";
import TaskDetailDialog from "./task-detail-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function KanbanBoard() {
  const { tasks, activeProject, createTask, updateTask, isLoading } = useDevProject();
  const [activeTask, setActiveTask] = useState<DevTask | null>(null);
  const [selectedTask, setSelectedTask] = useState<DevTask | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<string>("medium");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const tasksByColumn = useMemo(() => {
    const map: Record<TaskStatus, DevTask[]> = {
      todo: [],
      in_progress: [],
      testing: [],
      completed: [],
    };
    for (const t of tasks) {
      map[t.status]?.push(t);
    }
    return map;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = Number(active.id);
    const overId = String(over.id);
    const columnIds: TaskStatus[] = ["todo", "in_progress", "testing", "completed"];

    let newStatus: TaskStatus | null = null;
    if (columnIds.includes(overId as TaskStatus)) {
      newStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === Number(overId));
      if (overTask) newStatus = overTask.status;
    }

    const task = tasks.find((t) => t.id === taskId);
    if (task && newStatus && task.status !== newStatus) {
      await updateTask(taskId, { status: newStatus });
    }
  };

  const handleAddTask = async () => {
    if (!newTitle.trim()) return;
    await createTask({
      title: newTitle.trim(),
      description: newDesc,
      priority: newPriority as DevTask["priority"],
      status: "todo",
    });
    setNewTitle("");
    setNewDesc("");
    setNewPriority("medium");
    setAddOpen(false);
  };

  if (!activeProject) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Wybierz projekt, aby zobaczyć tablicę Kanban.
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Kanban — {activeProject.name}</h2>
        <Button onClick={() => setAddOpen(true)} className="bg-[var(--color-dev)] text-black hover:bg-[var(--color-dev)]/90">
          <Plus className="h-4 w-4 mr-1" /> Dodaj zadanie
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[500px]">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.label}
              tasks={tasksByColumn[col.id]}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Nowe zadanie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nazwa</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
            <div>
              <Label>Opis</Label>
              <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
            </div>
            <div>
              <Label>Priorytet</Label>
              <Select value={newPriority} onValueChange={setNewPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niski</SelectItem>
                  <SelectItem value="medium">Średni</SelectItem>
                  <SelectItem value="high">Wysoki</SelectItem>
                  <SelectItem value="critical">Krytyczny</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Anuluj</Button>
            <Button onClick={handleAddTask} disabled={!newTitle.trim()}>Dodaj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
