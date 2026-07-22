import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, Calendar, User, Tag, Trash2, GripVertical } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority, Comment } from '@/types/dev';

const COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'todo', label: 'Do zrobienia', color: 'bg-slate-100 border-slate-200' },
  { key: 'in-progress', label: 'W trakcie', color: 'bg-amber-50 border-amber-200' },
  { key: 'testing', label: 'Do testów', color: 'bg-blue-50 border-blue-200' },
  { key: 'done', label: 'Ukończone', color: 'bg-green-50 border-green-200' },
];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Niski',
  medium: 'Średni',
  high: 'Wysoki',
  critical: 'Krytyczny',
};

interface TasksViewProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
  projectId: string;
}

export function TasksView({ tasks, onUpdateTasks, projectId }: TasksViewProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '', description: '', status: 'todo', priority: 'medium', progress: 0, labels: [], comments: [],
  });
  const [newComment, setNewComment] = useState('');

  const handleAdd = () => {
    if (!newTask.title?.trim()) return;
    const task: Task = {
      id: Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
      projectId,
      title: newTask.title.trim(),
      description: newTask.description ?? '',
      status: newTask.status as TaskStatus,
      priority: newTask.priority as TaskPriority,
      dueDate: newTask.dueDate,
      assignee: newTask.assignee,
      labels: newTask.labels ?? [],
      progress: newTask.progress ?? 0,
      comments: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    onUpdateTasks([...tasks, task]);
    setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', progress: 0, labels: [], comments: [] });
    setAddOpen(false);
  };

  const handleDelete = (id: string) => {
    onUpdateTasks(tasks.filter(t => t.id !== id));
    setDetailOpen(false);
    setSelectedTask(null);
  };

  const handleMove = (taskId: string, newStatus: TaskStatus) => {
    onUpdateTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus, progress: newStatus === 'done' ? 100 : t.progress } : t));
  };

  const handleSaveDetail = () => {
    if (!selectedTask) return;
    onUpdateTasks(tasks.map(t => t.id === selectedTask.id ? selectedTask : t));
    setDetailOpen(false);
    setSelectedTask(null);
  };

  const handleAddComment = () => {
    if (!selectedTask || !newComment.trim()) return;
    const comment: Comment = {
      id: Math.random().toString(36).substring(2, 10),
      author: 'Użytkownik',
      text: newComment.trim(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = { ...selectedTask, comments: [...selectedTask.comments, comment] };
    setSelectedTask(updated);
    onUpdateTasks(tasks.map(t => t.id === updated.id ? updated : t));
    setNewComment('');
  };

  const onDragStart = (taskId: string) => setDraggingTaskId(taskId);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (status: TaskStatus) => {
    if (draggingTaskId) {
      handleMove(draggingTaskId, status);
      setDraggingTaskId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Kanban Board</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Dodaj zadanie</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map(col => (
          <div
            key={col.key}
            className={`rounded-lg border p-3 ${col.color} min-h-[300px]`}
            onDragOver={onDragOver}
            onDrop={() => onDrop(col.key)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{col.label}</h3>
              <Badge variant="outline">{tasks.filter(t => t.status === col.key).length}</Badge>
            </div>
            <div className="space-y-2">
              {tasks.filter(t => t.status === col.key).map(task => (
                <Card
                  key={task.id}
                  draggable
                  onDragStart={() => onDragStart(task.id)}
                  className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  onClick={() => { setSelectedTask(task); setDetailOpen(true); }}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{task.title}</p>
                        {task.assignee && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <User className="h-3 w-3" /> {task.assignee}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge className={`text-[10px] ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</Badge>
                      {task.labels.map(l => <Badge key={l} variant="outline" className="text-[10px]">{l}</Badge>)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {task.dueDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {task.dueDate}</span>}
                      {task.comments.length > 0 && <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {task.comments.length}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nowe zadanie</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2"><Label>Nazwa</Label><Input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Opis</Label><Textarea rows={3} value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Status</Label>
                <Select value={newTask.status} onValueChange={(v) => setNewTask({ ...newTask, status: v as TaskStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Do zrobienia</SelectItem>
                    <SelectItem value="in-progress">W trakcie</SelectItem>
                    <SelectItem value="testing">Do testów</SelectItem>
                    <SelectItem value="done">Ukończone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Priorytet</Label>
                <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v as TaskPriority })}>
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
              <div className="grid gap-2"><Label>Termin</Label><Input type="date" value={newTask.dueDate ?? ''} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Osoba odpowiedzialna</Label><Input value={newTask.assignee ?? ''} onChange={e => setNewTask({ ...newTask, assignee: e.target.value })} /></div>
            </div>
            <div className="grid gap-2"><Label>Etykiety (oddzielone przecinkami)</Label><Input value={newTask.labels?.join(', ') ?? ''} onChange={e => setNewTask({ ...newTask, labels: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
          </div>
          <DialogFooter><Button onClick={handleAdd}>Dodaj zadanie</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-xl max-h-[90vh]">
          {selectedTask && (
            <>
              <DialogHeader><DialogTitle>Szczegóły zadania</DialogTitle></DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-4 pr-2">
                  <div className="grid gap-2">
                    <Label>Nazwa</Label>
                    <Input value={selectedTask.title} onChange={e => setSelectedTask({ ...selectedTask, title: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Opis</Label>
                    <Textarea rows={3} value={selectedTask.description} onChange={e => setSelectedTask({ ...selectedTask, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2"><Label>Status</Label>
                      <Select value={selectedTask.status} onValueChange={(v) => setSelectedTask({ ...selectedTask, status: v as TaskStatus })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">Do zrobienia</SelectItem>
                          <SelectItem value="in-progress">W trakcie</SelectItem>
                          <SelectItem value="testing">Do testów</SelectItem>
                          <SelectItem value="done">Ukończone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2"><Label>Priorytet</Label>
                      <Select value={selectedTask.priority} onValueChange={(v) => setSelectedTask({ ...selectedTask, priority: v as TaskPriority })}>
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
                    <div className="grid gap-2"><Label>Termin</Label><Input type="date" value={selectedTask.dueDate ?? ''} onChange={e => setSelectedTask({ ...selectedTask, dueDate: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Osoba odpowiedzialna</Label><Input value={selectedTask.assignee ?? ''} onChange={e => setSelectedTask({ ...selectedTask, assignee: e.target.value })} /></div>
                  </div>
                  <div className="grid gap-2"><Label>Etykiety</Label><Input value={selectedTask.labels.join(', ')} onChange={e => setSelectedTask({ ...selectedTask, labels: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>

                  <div className="border rounded-lg p-3 space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Komentarze</h4>
                    {selectedTask.comments.length === 0 && <p className="text-xs text-muted-foreground">Brak komentarzy</p>}
                    {selectedTask.comments.map(c => (
                      <div key={c.id} className="text-sm bg-muted rounded px-2 py-1">
                        <span className="font-medium">{c.author}</span>{' '}
                        <span className="text-xs text-muted-foreground">{c.createdAt}</span>
                        <p className="mt-0.5">{c.text}</p>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input size={1} placeholder="Dodaj komentarz..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddComment()} />
                      <Button size="sm" onClick={handleAddComment}>Dodaj</Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="gap-2">
                <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedTask.id)}><Trash2 className="h-4 w-4 mr-1" /> Usuń</Button>
                <Button onClick={handleSaveDetail}>Zapisz</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
