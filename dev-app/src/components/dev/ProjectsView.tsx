import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, Circle, Clock, ListTodo, PlayCircle } from 'lucide-react';
import type { ProjectData } from '@/types/dev';

interface ProjectsViewProps {
  data: ProjectData | null;
}

export function ProjectsView({ data }: ProjectsViewProps) {
  if (!data) return <div className="text-muted-foreground">Wybierz projekt</div>;

  const tasks = data.tasks;
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const testing = tasks.filter(t => t.status === 'testing').length;
  const completion = total > 0 ? Math.round((done / total) * 100) : 0;

  const stats = [
    { label: 'Wszystkie zadania', value: total, icon: ListTodo, color: 'text-blue-500' },
    { label: 'Ukończone', value: done, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'W trakcie', value: inProgress, icon: PlayCircle, color: 'text-amber-500' },
    { label: 'Oczekujące', value: todo + testing, icon: Clock, color: 'text-slate-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{data.project.name}</h2>
        <p className="text-muted-foreground mt-1">{data.project.description}</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Postęp projektu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Ukończenie</span>
            <span className="text-sm font-semibold">{completion}%</span>
          </div>
          <Progress value={completion} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Data utworzenia</p>
              <p className="font-medium">{data.project.createdAt}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Circle className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Planowane zakończenie</p>
              <p className="font-medium">{data.project.plannedEndDate ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={data.project.status === 'active' ? 'default' : 'secondary'}>
          {data.project.status === 'active' ? 'Aktywny' : data.project.status === 'completed' ? 'Zakończony' : 'Zarchiwizowany'}
        </Badge>
      </div>
    </div>
  );
}
