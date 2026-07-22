import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, FileText, Image, Music, Code, File, Search, FileArchive } from 'lucide-react';
import type { ProjectFile, FileCategory } from '@/types/dev';

const CATEGORY_CONFIG: { key: FileCategory | 'all'; label: string; icon: typeof FileText }[] = [
  { key: 'all', label: 'Wszystkie', icon: FileArchive },
  { key: 'documentation', label: 'Dokumentacja', icon: FileText },
  { key: 'graphics', label: 'Grafiki', icon: Image },
  { key: 'audio', label: 'Audio', icon: Music },
  { key: 'source-code', label: 'Kod źródłowy', icon: Code },
  { key: 'other', label: 'Inne', icon: File },
];

const CATEGORY_LABELS: Record<FileCategory, string> = {
  documentation: 'Dokumentacja',
  graphics: 'Grafiki',
  audio: 'Audio',
  'source-code': 'Kod źródłowy',
  other: 'Inne',
};

interface FilesViewProps {
  files: ProjectFile[];
  onUpdateFiles: (files: ProjectFile[]) => void;
  projectId: string;
}

export function FilesView({ files, onUpdateFiles, projectId }: FilesViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FileCategory | 'all'>('all');
  const [newFile, setNewFile] = useState<{ name: string; size: string; category: FileCategory }>({ name: '', size: '', category: 'other' });

  const filtered = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = () => {
    if (!newFile.name.trim()) return;
    const file: ProjectFile = {
      id: Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
      projectId,
      name: newFile.name.trim(),
      size: newFile.size.trim() || '—',
      category: newFile.category,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateFiles([...files, file]);
    setNewFile({ name: '', size: '', category: 'other' });
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    onUpdateFiles(files.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Pliki</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Szukaj plików..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Dodaj</Button>
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as FileCategory | 'all')}>
        <TabsList className="flex-wrap h-auto">
          {CATEGORY_CONFIG.map(c => (
            <TabsTrigger key={c.key} value={c.key} className="gap-1">
              <c.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{c.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(file => {
          const Icon = CATEGORY_CONFIG.find(c => c.key === file.category)?.icon ?? File;
          return (
            <Card key={file.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3 flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{CATEGORY_LABELS[file.category]}</Badge>
                    <span className="text-xs text-muted-foreground">{file.size}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{file.uploadedAt}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => handleDelete(file.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileArchive className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>Brak plików w tej kategorii.</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Dodaj plik</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2"><Label>Nazwa pliku</Label><Input value={newFile.name} onChange={e => setNewFile({ ...newFile, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Rozmiar</Label><Input placeholder="np. 12 KB, 2.5 MB" value={newFile.size} onChange={e => setNewFile({ ...newFile, size: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Kategoria</Label>
              <Select value={newFile.category} onValueChange={(v) => setNewFile({ ...newFile, category: v as FileCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="documentation">Dokumentacja</SelectItem>
                  <SelectItem value="graphics">Grafiki</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="source-code">Kod źródłowy</SelectItem>
                  <SelectItem value="other">Inne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleAdd}>Dodaj plik</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
