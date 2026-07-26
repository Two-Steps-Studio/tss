"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Circle
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import type { TaskStatus, TaskPriority } from "@/lib/types/dev-types";
import { TasksAttachmentUploader } from "@/components/DEV/TasksAttachmentUploader";

const statusColors: Record<TaskStatus, string> = {
  Todo: "bg-gray-500",
  In_progress: "bg-blue-500",
  Testing: "bg-yellow-500",
  Completed: "bg-green-500",
};

const priorityColors: Record<TaskPriority, string> = {
  Low: "text-gray-500",
  Medium: "text-yellow-500",
  High: "text-orange-500",
  Critical: "text-red-500",
};

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  Todo: <Circle size={16} className="text-gray-500" />,
  In_progress: <Clock size={16} className="text-blue-500" />,
  Testing: <Clock size={16} className="text-yellow-500" />,
  Completed: <CheckCircle size={16} className="text-green-500" />,
};

export default function DevTasks() {
  const { tasks, activeProject, createTask, updateTask, deleteTask, isLoading, error, taskAttachments, loadTaskAttachments, updateTaskAttachments } = useDevProject();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<typeof tasks[0] | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("todo");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !activeProject) return;
    setIsCreating(true);
    try {
      await createTask({
        title: newTaskTitle,
        description: newTaskDescription || undefined,
        status: newTaskStatus,
        priority: newTaskPriority,
      });
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskStatus("todo");
      setNewTaskPriority("medium");
      setIsCreateOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditTask = async () => {
    if (!editingTask || !newTaskTitle.trim()) return;
    setIsCreating(true);
    try {
      await updateTask(editingTask.id, {
        title: newTaskTitle,
        description: newTaskDescription || undefined,
        status: newTaskStatus,
        priority: newTaskPriority,
      });
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskStatus("todo");
      setNewTaskPriority("medium");
      setEditingTask(null);
      setIsEditOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const openEditDialog = async (task: typeof tasks[0]) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description || "");
    setNewTaskStatus(task.status);
    setNewTaskPriority(task.priority);
    await loadTaskAttachments(task.id);
    setIsEditOpen(true);
  };

  const handleDeleteTask = async (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask(id);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-dev)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Select a project to view tasks</p>
        </div>
      </div>
    );
  }

  const tasksByStatus: Record<TaskStatus, typeof tasks> = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    testing: tasks.filter((t) => t.status === "testing"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            <span className="text-[var(--color-dev)]">Tasks</span>
          </h1>
          <p className="text-muted-foreground">Manage tasks for <span className="text-[var(--color-dev)]">{activeProject.name}</span></p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl">
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
            <DialogContent className="rounded-3xl bg-white text-black">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Enter task description"
                  className="rounded-2xl min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newTaskStatus} onValueChange={(val: TaskStatus) => setNewTaskStatus(val)}>
                    <SelectTrigger className="rounded-2xl bg-white text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTaskPriority} onValueChange={(val: TaskPriority) => setNewTaskPriority(val)}>
                    <SelectTrigger className="rounded-2xl bg-white text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreateTask} disabled={isCreating} className="w-full rounded-2xl">
                {isCreating ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <Card key={status} className="rounded-3xl border-[var(--border-color)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
                  {statusIcons[status as TaskStatus]}
                  {status.replace("_", " ")}
                </CardTitle>
                <Badge variant="secondary" className="rounded-full">
                  {statusTasks.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {statusTasks.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No tasks
                </div>
              ) : (
                statusTasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className="rounded-2xl border-[var(--border-color)] hover:border-[var(--color-dev)]/50 transition-all cursor-pointer"
                    onClick={() => openEditDialog(task)}
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
                        <div className="flex gap-1">
                          {Object.entries(statusIcons).map(([s, icon]) => (
                            <button
                              key={s}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task.id, s as TaskStatus);
                              }}
                              className={`p-1 rounded transition-colors ${
                                task.status === s ? "bg-[var(--color-dev)]/20" : "hover:bg-black/5 dark:hover:bg-white/5"
                              }`}
                              title={`Change to ${s.replace("_", " ")}`}
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
                            handleDeleteTask(task.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="rounded-3xl bg-white text-black max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Task Title</Label>
              <Input
                id="edit-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
                className="rounded-2xl"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Enter task description"
                className="rounded-2xl min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={newTaskStatus} onValueChange={(val: TaskStatus) => setNewTaskStatus(val)}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={newTaskPriority} onValueChange={(val: TaskPriority) => setNewTaskPriority(val)}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editingTask && (
              <div>
                <Label>Attachments</Label>
                <TasksAttachmentUploader
                  task={editingTask}
                  attachments={taskAttachments[editingTask.id] || []}
                  onAttachmentsChanged={(attachments) => updateTaskAttachments(editingTask.id, attachments)}
                />
              </div>
            )}
            <Button onClick={handleEditTask} disabled={isCreating} className="w-full rounded-2xl">
              {isCreating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}