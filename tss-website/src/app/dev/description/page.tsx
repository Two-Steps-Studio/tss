"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  Save,
  FileText,
  CheckCircle2
} from "lucide-react";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function DevDescription() {
  const { activeProject, saveDescription, isLoading, error, refetch } = useDevProject();
  const [markdown, setMarkdown] = useState(activeProject?.description_markdown || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Keep local editor in sync when the active project (or its saved description) changes.
  // Without this, the first render captures `activeProject = null` and the textarea is
  // forever bound to an empty string even after the project loads from the API.
  useEffect(() => {
    setMarkdown(activeProject?.description_markdown || "");
    setSaveError(null);
    setSavedAt(null);
  }, [activeProject?.id, activeProject?.description_markdown]);

  const handleSave = async () => {
    if (!activeProject) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveDescription(markdown);
      setSavedAt(Date.now());
      // Refresh server-side state so the context reflects what was persisted.
      await refetch();
    } catch (e) {
      const err = e as Error & { serverMessage?: string };
      setSaveError(err.serverMessage || err.message || "Nie udało się zapisać opisu");
    } finally {
      setIsSaving(false);
    }
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
          <p className="text-muted-foreground">Select a project to edit description</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            <span className="text-[var(--color-dev)]">Description</span>
          </h1>
          <p className="text-muted-foreground">Manage description for <span className="text-[var(--color-dev)]">{activeProject.name}</span></p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="rounded-2xl"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Preview */}
      {markdown && (
        <Card className="rounded-3xl border-[var(--border-color)] bg-[var(--card-bg)]">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText size={16} />
                <span>Preview</span>
              </div>
              <div 
                className="prose prose-sm dark:prose-invert max-w-none rounded-2xl p-6 bg-[var(--bg)]"
                dangerouslySetInnerHTML={{ 
                  __html: markdown
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.*)\*/gim, '<em>$1</em>')
                    .replace(/`([^`]+)`/gim, '<code>$1</code>')
                    .replace(/\n/gim, '<br>')
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Markdown Editor */}
      <Card className="rounded-3xl border-[var(--border-color)] bg-[var(--card-bg)]">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText size={16} />
                <span>Markdown Editor</span>
              </div>
              {saveError && (
                  <div className="flex items-center gap-1 text-red-500">
                    <AlertCircle size={14} />
                    <span className="text-xs">{saveError}</span>
                  </div>
              )}
              {!saveError && savedAt && !isSaving && (
                  <div className="flex items-center gap-1 text-green-500">
                    <CheckCircle2 size={14} />
                    <span className="text-xs">Zapisano</span>
                  </div>
              )}
            </div>
            <Textarea
                value={markdown}
                onChange={(e) => {
                  setMarkdown(e.target.value);
                  setSavedAt(null);
                }}
                placeholder="Enter project description in Markdown format..."
                className="rounded-2xl min-h-[400px] font-mono text-sm resize-y"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Supports standard Markdown syntax</span>
              <span>{markdown.length} characters</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
