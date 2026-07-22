import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FolderKanban } from 'lucide-react';
import type { Project } from '@/types/dev';

interface ProjectSwitcherProps {
  projects: Record<string, { project: Project }>;
  activeProjectId: string;
  setActiveProject: (id: string) => void;
  addProject: (project: Project) => void;
}

export function ProjectSwitcher({ projects, activeProjectId, setActiveProject, addProject }: ProjectSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [plannedEndDate, setPlannedEndDate] = useState('');

  const projectList = Object.values(projects).map(p => p.project);

  const handleAdd = () => {
    if (!name.trim()) return;
    const project: Project = {
      id: Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      plannedEndDate: plannedEndDate || undefined,
      status: 'active',
    };
    addProject(project);
    setName('');
    setDescription('');
    setPlannedEndDate('');
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-3">
      <FolderKanban className="h-5 w-5 text-muted-foreground" />
      <Select value={activeProjectId} onValueChange={setActiveProject}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Wybierz projekt" />
        </SelectTrigger>
        <SelectContent>
          {projectList.map(p => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Nowy projekt</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Nowy projekt</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label htmlFor="p-name">Nazwa</Label><Input id="p-name" value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="p-desc">Opis</Label><Textarea id="p-desc" rows={3} value={description} onChange={e => setDescription(e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="p-date">Planowana data zakończenia</Label><Input id="p-date" type="date" value={plannedEndDate} onChange={e => setPlannedEndDate(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={handleAdd}>Utwórz projekt</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
