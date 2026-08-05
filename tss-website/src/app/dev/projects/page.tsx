"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FolderKanban, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
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

export default function DevProjects() {
  const { projects, activeProjectId, setActiveProjectId, createProject, deleteProject, updateProject, isLoading, error, canCreateProject } = useDevProject();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<typeof projects[0] | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectType, setNewProjectType] = useState("general");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      await createProject(newProjectName, newProjectDescription || undefined, newProjectType);
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectType("general");
      setIsCreateOpen(false);
    } catch (e) {
      const err = e as Error & { serverMessage?: string };
      setCreateError(err.serverMessage || err.message || "Nie udało się utworzyć projektu");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditProject = async () => {
    if (!editingProject || !newProjectName.trim()) return;
    setIsCreating(true);
    try {
      await updateProject(editingProject.id, { 
        name: newProjectName, 
        description: newProjectDescription || undefined 
      });
      setNewProjectName("");
      setNewProjectDescription("");
      setEditingProject(null);
      setIsEditOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const openEditDialog = (project: typeof projects[0]) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setNewProjectDescription(project.description || "");
    setIsEditOpen(true);
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject(id);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[var(--text)] mb-2">
            <span className="text-[var(--color-dev)]">Projects</span>
          </h1>
          <p className="text-muted-foreground">Manage your development projects</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) setCreateError(null); }}>
          <DialogTrigger asChild>
            <Button disabled={!canCreateProject} className="rounded-2xl text-white cursor-pointer">
              <Plus className="mr-2 h-4 w-4 text-white" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-[var(--border)] text-[var(--text)] bg-[var(--card-bg)]">
            <DialogHeader>
              <DialogTitle >Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {createError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="type">Project Type</Label>
                <Select value={newProjectType} onValueChange={setNewProjectType} > 
                  <SelectTrigger id="type" className="rounded-2xl cursor-pointer" >
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg)] border border-[var(--border)]">
                    <SelectItem value="general" className="cursor-pointer">General</SelectItem>
                    <SelectItem value="web_application " className="cursor-pointer"> Web Application</SelectItem>
                    <SelectItem value="mobile_application" className="cursor-pointer" >Mobile Application</SelectItem>
                    <SelectItem value="desktop_application" className="cursor-pointer" >Desktop Application</SelectItem>
                    <SelectItem value="game" className="cursor-pointer"> Game</SelectItem>
                    <SelectItem value="api" className="cursor-pointer" >API</SelectItem>
                    <SelectItem value="library" className="cursor-pointer" >Library</SelectItem>
                    <SelectItem value="plugin" className="cursor-pointer" >Plugin</SelectItem>
                    <SelectItem value="other" className="cursor-pointer" >Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  className="rounded-2xl min-h-[100px]"
                />
              </div>
              <Button onClick={handleCreateProject} disabled={isCreating} className="w-full rounded-2xl cursor-pointer">
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="rounded-3xl border-[var(--border-color)] bg-[var(--card-bg)]">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <FolderKanban className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Button onClick={() => setIsCreateOpen(true)} disabled={!canCreateProject} className="rounded-2xl text-white cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className={`rounded-3xl border-[var(--border)] transition-all hover:border-[var(--color-dev)]/50 ${
                activeProjectId === project.id ? "border-[var(--border)] bg-[var(--card-bg)]" : ""
              }`}
              onClick={() => setActiveProjectId(project.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  {activeProjectId === project.id && (
                    <Badge className="bg-[var(--color-dev)] text-white border-0">Active</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                )}
                
                {project.planned_end_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar size={14} />
                    <span>Due: {new Date(project.planned_end_date).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(project);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-3xl bg-[var(--card-bg)] text-[var(--text)]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Project Name</Label>
              <Input
                id="edit-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
                className="rounded-2xl"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Enter project description"
                className="rounded-2xl min-h-[100px]"
              />
            </div>
            <Button onClick={handleEditProject} disabled={isCreating} className="w-full rounded-2xl">
              {isCreating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
