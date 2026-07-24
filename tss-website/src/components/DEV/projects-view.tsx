"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, CheckCircle2, Clock, ListTodo, Loader2, TestTube2, Trash2, Edit, Save } from "lucide-react";
import { useState } from "react";

export default function ProjectsView() {
  const { activeProject, stats, isLoading, createProject, projects, deleteProject, updateProject, setActiveProjectId } = useDevProject();
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [edittingId, setEditingId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-dev)]" />
      </div>
    );
  }

  const projectCards = activeProject ? [null, ...projects.map(p => p.id === activeProject?.id ? null : p)].filter(Boolean as any) : [];

  return (
    <div className="space-y-6">
      {/* Projects List */}
      {!activeProject && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectCards.map((p) => p as any).map((project, idx) => (
            <div
              key={idx}
              onClick={() => project && setActiveProjectId(project.id)}
              className={`cursor-pointer rounded-xl border transition-all hover:shadow-md ${activeProject?.id === (project?.id || 0) ? 'ring-2 ring-[var(--color-dev)]' : ''}`}
            >
              <div
                onClick={(e) => { e.stopPropagation(); if (!project) return; setActiveProjectId(project.id); }}
                className="p-4 bg-card hover:bg-accent/50 transition-colors"
              >
                <h3 className="font-bold truncate">{project?.name}</h3>
                {edittingId === project?.id ? (
                  <input
                    type="text"
                    defaultValue={project.name}
                    onBlur={(e) => updateProject(project.id, { name: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-2 py-1 border rounded text-sm mb-2"
                  />
                ) : (
                  <div
                    onClick={(e) => { e.stopPropagation(); setEditingId(project.id); }}
                    className="text-xs text-muted-foreground hover:underline cursor-pointer mt-1 truncate block w-full">
                    {project.description || "Bez opisu"}
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={(e) => { e.stopPropagation(); setIsCreatingModalOpen(true); }}
            className="p-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:border-[var(--color-dev)] hover:text-[var(--color-dev)] transition-all h-full min-h-[100px]"
          >
            <Plus />
            Nowy projekt
          </button>
        </div>
      )}

      {/* New Project Modal */}
      {isCreatingModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold">Tworzenie nowego projektu</h3>
            <input
              type="text"
              placeholder="Nazwa projektu..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createProject(newProjectName.trim())}
              className="w-full px-4 py-2 border rounded"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreatingModalOpen(false)}>Anuluj</Button>
              <Button
                disabled={!newProjectName.trim()}
                onClick={() => createProject(newProjectName.trim())}
              >Utwórz</Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Project Stats */}
      {activeProject && (
        <>
          <div className={`relative p-8 rounded-[2rem] overflow-hidden bg-gradient-to-br from-[var(--color-dev)]/5 to-transparent border ${activeProject.color || 'border-yellow-400'}`}>
            {/* Animated background element */}
            <div
              className="absolute -right-32 -top-28 h-72 w-72 rounded-full blur-3xl transition-colors duration-500"
              style={{ backgroundColor: activeProject.color || "#ffcb2f", opacity: 0.1 }}
            />

            <div className="relative">
              <Badge variant="secondary" className={`mb-4 bg-[var(--color-dev)]/20 text-[var(--color-dev)] border-none`}>
                Projekt Aktywny
              </Badge>

              {/* Edit/Delete Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingId(activeProject.id)}
                >
                  <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive-outline"
                  onClick={deleteProject}
                >
                  <Trash2 className="h-4 w-4"/>
                </Button>
              </div>

              {edittingId === activeProject.id && (
                <input
                  type="text"
                  defaultValue={activeProject.name}
                  onBlur={(e) => updateProject(activeProject.id, { name: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full p-2 mb-3 border rounded bg-accent/50 text-center font-bold"
                />
              )}

              <h1
                className={edittingId === activeProject.id ? "" : "text-4xl font-black transition-all duration-300 hover:text-[var(--color-dev)] cursor-pointer"}
                onClick={() => setEditingId(activeProject.id)}
              >
                {activeProject.name}
              </h1>

              <p className="text-muted-foreground/80 max-w-2xl mt-4 line-clamp-3">
                {(edittingId === activeProject.id ? "" : activeProject.description || activeProject?.description_markdown) + (activeProject.description_markdown && !activeProject.description ? `\n\n${activeProject.description_markdown}` : "")}
              </p>

              {/* Progress Bar */}
              {stats.completionPercentage > 0 && stats.total > 0 && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Postęp projektu</span>
                    <span
                      onClick={() => setEditingId(activeProject.id)}
                      className={`${edittingId === activeProject.id ? 'text-[var(--color-dev)]' : ''} hover:text-[var(--color-dev)] cursor-pointer transition-colors`}>
                      {stats.completionPercentage}%
                    </span>
                  </div>
                  <Progress
                    value={stats.completionPercentage}
                    indicatorClassName="bg-current"
                  />
                </div>
              )}

              {/* Timeline */}
              {(activeProject.planned_end_date || activeProject.created_at) && (
                <div className={`flex flex-wrap gap-6 mt-5 text-sm transition-colors duration-300 ${edittingId === activeProject.id ? '' : 'hover:text-[var(--color-dev)] hover:underline cursor-pointer'}`}>
                  {activeProject.planned_end_date && (
                    <span onClick={() => setEditingId(activeProject.id)} className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Planowany koniec:<span className={edittingId === activeProject.id ? '' : 'font-medium'}> {new Date(activeProject.planned_end_date).toLocaleDateString("pl-PL")}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Status Badge */}
              <Badge
                variant="outline"
                className={`mt-6 inline-block ${edittingId === activeProject.id ? '' : 'cursor-pointer hover:bg-muted'}`}
                onClick={() => setEditingId(activeProject.id)}
              >
                {(activeProject.status || '').toUpperCase() || "AKTYWNY"}
              </Badge>

            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {([['all', 'total'], ['done', 'completed'], ['doing', 'inProgress'], ['testing'], ['wait', 'todo']] as const).map(([labelKey, statKey]) => (
              <div
                key={statKey}
                onClick={() => setEditingId(activeProject.id)}
                className="p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer group"
              >
                <div className={`h-8 w-8 mb-3 rounded-lg flex items-center justify-center transition-colors ${activeProject.color || ''}`}>
                  {statKey === 'total' && <ListTodo />}
                  {statKey === 'completed' && <CheckCircle2 />}
                  {statKey === 'inProgress' && <Loader2 className="animate-spin" />}
                  {statKey === 'testing' && <TestTube2 />}
                  {statKey === 'todo' && <Clock />}
                </div>

                {/* Editable stat value */}
                <p
                  onClick={(e) => e.stopPropagation()}
                  className={`text-3xl font-black transition-colors ${edittingId === activeProject.id ? '' : 'group-hover:text-[var(--color-dev)]'}`}
                >
                  {stats[statKey as keyof DevProjectStats] || 0}
                </p>

                <span className="text-sm text-muted-foreground">
                  {labelKey === 'all' && 'Wszystkie'}
                  {labelKey === 'done' && 'Ukończone'}
                  {labelKey === 'doing' && 'W trakcie'}
                  {labelKey === 'testing' && 'Testowanie'}
                  {labelKey === 'wait' && 'Oczekujące'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
