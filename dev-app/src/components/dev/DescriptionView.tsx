import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Save, X, FileText } from 'lucide-react';

interface DescriptionViewProps {
  description: string;
  onUpdateDescription: (description: string) => void;
  projectName: string;
}

export function DescriptionView({ description, onUpdateDescription, projectName }: DescriptionViewProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(description);

  const handleStartEdit = () => {
    setDraft(description);
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(description);
    setEditing(false);
  };

  const handleSave = () => {
    onUpdateDescription(draft);
    setEditing(false);
  };

  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    const blocks: { type: 'h' | 'p' | 'ul'; level?: number; text?: string; items?: string[] }[] = [];
    let current: { type: 'p' | 'ul'; items?: string[]; text?: string } | null = null;

    for (const raw of lines) {
      const line = raw.trimEnd();
      if (line.startsWith('## ')) {
        if (current) blocks.push(current);
        blocks.push({ type: 'h', level: 2, text: line.slice(3) });
        current = null;
      } else if (line.startsWith('# ')) {
        if (current) blocks.push(current);
        blocks.push({ type: 'h', level: 1, text: line.slice(2) });
        current = null;
      } else if (line.startsWith('- ')) {
        if (!current || current.type !== 'ul') {
          if (current) blocks.push(current);
          current = { type: 'ul', items: [] };
        }
        current.items!.push(line.slice(2));
      } else if (line === '') {
        if (current) blocks.push(current);
        current = null;
      } else {
        if (!current || current.type !== 'p') {
          if (current) blocks.push(current);
          current = { type: 'p', text: '' };
        }
        current.text = current.text ? `${current.text} ${line}` : line;
      }
    }
    if (current) blocks.push(current);

    return blocks.map((b, i) => {
      if (b.type === 'h') {
        return b.level === 1
          ? <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{b.text}</h1>
          : <h2 key={i} className="text-lg font-semibold mt-4 mb-1">{b.text}</h2>;
      }
      if (b.type === 'ul') {
        return (
          <ul key={i} className="list-disc pl-6 space-y-1">
            {b.items!.map((it, j) => <li key={j}>{it}</li>)}
          </ul>
        );
      }
      return <p key={i} className="leading-relaxed">{b.text}</p>;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Opis projektu</h2>
          <p className="text-sm text-muted-foreground">{projectName}</p>
        </div>
        {!editing ? (
          <Button size="sm" variant="outline" onClick={handleStartEdit}>
            <Pencil className="h-4 w-4 mr-1" /> Edytuj
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" /> Anuluj
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" /> Zapisz
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Notatka
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <Textarea
              rows={18}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="font-mono text-sm"
            />
          ) : description.trim() ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {renderMarkdown(description)}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Brak opisu. Kliknij „Edytuj", aby dodać.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
