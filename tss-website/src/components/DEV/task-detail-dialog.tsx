"use client";

import { useEffect, useState } from "react";
import type { DevTask, DevTaskComment, TaskStatus } from "@/lib/types/dev-types";
import { useDevProject } from "@/contexts/dev-project-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

interface TaskDetailDialogProps {
  task: DevTask;
  open: boolean;
  onClose: () => void;
}

export default function TaskDetailDialog({ task, open, onClose }: TaskDetailDialogProps) {
  const { updateTask, deleteTask } = useDevProject();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assignee, setAssignee] = useState(task.assignee_name ?? "");
  const [dueDate, setDueDate] = useState(task.due_date?.slice(0, 10) ?? "");
  const [progress, setProgress] = useState(task.progress_percent ?? 0);
  const [tags, setTags] = useState((task.tags ?? []).join(", "));
  const [comments, setComments] = useState<DevTaskComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setAssignee(task.assignee_name ?? "");
    setDueDate(task.due_date?.slice(0, 10) ?? "");
    setProgress(task.progress_percent ?? 0);
    setTags((task.tags ?? []).join(", "));
  }, [task]);

  useEffect(() => {
    if (open) {
      fetch(`/api/dev-tasks/${task.id}/comments`)
        .then((r) => r.json())
        .then(setComments)
        .catch(() => setComments([]));
    }
  }, [open, task.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTask(task.id, {
        title,
        description,
        status,
        priority,
        assignee_name: assignee || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        progress_percent: progress,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    onClose();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const res = await fetch(`/api/dev-tasks/${task.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });
    if (res.ok) {
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Szczegóły zadania</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nazwa</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Opis</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Do zrobienia</SelectItem>
                  <SelectItem value="in_progress">W trakcie</SelectItem>
                  <SelectItem value="testing">Do testów</SelectItem>
                  <SelectItem value="completed">Ukończone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priorytet</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as DevTask["priority"])}>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Odpowiedzialny</Label>
              <Input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Imię" />
            </div>
            <div>
              <Label>Termin</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Etykiety (po przecinku)</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="bug, feature" />
          </div>
          <div>
            <Label>Postęp: {progress}%</Label>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full"
            />
            <Progress value={progress} className="h-1.5 mt-1" />
          </div>

          <div className="border-t pt-4">
            <Label className="mb-2 block">Komentarze ({comments.length})</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
              {comments.map((c) => (
                <div key={c.id} className="p-2 rounded-lg bg-muted text-sm">
                  <span className="font-semibold text-xs">{c.author_name}</span>
                  <p className="mt-0.5">{c.content}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Dodaj komentarz..."
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              />
              <Button size="sm" onClick={handleAddComment}>Wyślij</Button>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Usuń
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>Anuluj</Button>
              <Button onClick={handleSave} disabled={saving}>Zapisz</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
