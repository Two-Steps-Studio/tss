import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Calendar, Pencil } from 'lucide-react';
import type { RoadmapItem, RoadmapStatus } from '@/types/dev';

const STATUS_LABELS: Record<RoadmapStatus, string> = {
  planned: 'Zaplanowane',
  'in-progress': 'W trakcie',
  completed: 'Ukończone',
  delayed: 'Opóźnione',
};

const STATUS_COLORS: Record<RoadmapStatus, string> = {
  planned: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  delayed: 'bg-red-100 text-red-700',
};

interface RoadmapViewProps {
  roadmap: RoadmapItem[];
  onUpdateRoadmap: (roadmap: RoadmapItem[]) => void;
  projectId: string;
}

export function RoadmapView({ roadmap, onUpdateRoadmap, projectId }: RoadmapViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [form, setForm] = useState<Partial<RoadmapItem>>({
    name: '', description: '', startDate: '', endDate: '', status: 'planned', progress: 0,
  });

  const openAdd = () => {
    setEditingItem(null);
    setForm({ name: '', description: '', startDate: '', endDate: '', status: 'planned', progress: 0 });
    setDialogOpen(true);
  };

  const openEdit = (item: RoadmapItem) => {
    setEditingItem(item);
    setForm({ ...item });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name?.trim()) return;
    if (editingItem) {
      const updated = { ...editingItem, ...form } as RoadmapItem;
      onUpdateRoadmap(roadmap.map(r => r.id === updated.id ? updated : r));
    } else {
      const newItem: RoadmapItem = {
        id: Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
        projectId,
        name: form.name.trim(),
        description: form.description ?? '',
        startDate: form.startDate ?? '',
        endDate: form.endDate ?? '',
        status: (form.status as RoadmapStatus) ?? 'planned',
        progress: form.progress ?? 0,
      };
      onUpdateRoadmap([...roadmap, newItem]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    onUpdateRoadmap(roadmap.filter(r => r.id !== id));
  };

  const sorted = [...roadmap].sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Roadmapa</h2>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Dodaj etap</Button>
      </div>

      <div className="relative space-y-6 pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
        {sorted.map(item => (
          <div key={item.id} className="relative">
            <div className="absolute -left-6 top-2 h-4 w-4 rounded-full border-2 border-primary bg-background" />
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {item.startDate} → {item.endDate}</span>
                  <Badge className={`text-[10px] ${STATUS_COLORS[item.status]}`}>{STATUS_LABELS[item.status]}</Badge>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="text-muted-foreground">Postęp</span>
                    <span className="font-medium">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-muted-foreground text-sm">Brak etapów w roadmapie. Dodaj pierwszy etap.</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingItem ? 'Edytuj etap' : 'Nowy etap'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2"><Label>Nazwa</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Opis</Label><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Data rozpoczęcia</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Data zakończenia</Label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as RoadmapStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Zaplanowane</SelectItem>
                    <SelectItem value="in-progress">W trakcie</SelectItem>
                    <SelectItem value="completed">Ukończone</SelectItem>
                    <SelectItem value="delayed">Opóźnione</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Postęp (%)</Label><Input type="number" min={0} max={100} value={form.progress} onChange={e => setForm({ ...form, progress: Math.min(100, Math.max(0, Number(e.target.value))) })} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editingItem ? 'Zapisz' : 'Dodaj etap'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
