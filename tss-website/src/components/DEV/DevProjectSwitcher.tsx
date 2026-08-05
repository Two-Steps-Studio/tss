"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Plus, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DevProjectSwitcher() {
  const { projects, activeProject, activeProjectId, setActiveProjectId, createProject, canCreateProject, userSubscription } = useDevProject();
  const [isOpen, setIsOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    if (!canCreateProject) {
      setCreateError(`You have reached your limit of ${userSubscription?.project_limit || 1} project(s). Upgrade your subscription to create more projects.`);
      return;
    }
    
    setIsCreating(true);
    setCreateError(null);
    try {
      await createProject(newProjectName, newProjectDescription || undefined);
      setNewProjectName("");
      setNewProjectDescription("");
      setIsOpen(false);
    } catch (error: any) {
      setCreateError(error.message || "Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  if (projects.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="rounded-2xl">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-3xl bg-[var(--card-bg)] text-[var(--text)] border-[var(--border-color)]" >
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {createError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
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
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Enter project description"
                className="rounded-2xl"
              />
            </div>
            <Button 
              onClick={handleCreateProject} 
              disabled={isCreating || !canCreateProject} 
              className="w-full rounded-2xl"
            >
              {isCreating ? "Creating..." : "Create Project"}
            </Button>
            {!canCreateProject && (
              <p className="text-xs text-muted-foreground text-center">
                {projects.length}/{userSubscription?.project_limit || 1} projects used
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={activeProjectId?.toString()} onValueChange={(val) => setActiveProjectId(Number(val))}  >
        <SelectTrigger className="w-[200px] rounded-2xl bg-[var(--card-bg)]  border-[var(--border-color)] cursor-pointer" aria-label="Select project" >
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent className="bg-[var(--card-bg)]">
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id.toString()}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Dialog open={isOpen} onOpenChange={setIsOpen} >
        <DialogTrigger asChild>
          <Button  size="icon" aria-label="Utwórz nowy projekt" className="rounded-2xl h-10 w-10 bg-general border-[var(--border-color)] cursor-pointer">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-3xl bg-[var(--card-bg)] text-[var(--text)]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {createError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
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
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Enter project description"
                className="rounded-2xl"
              />
            </div>
            <Button 
              onClick={handleCreateProject} 
              disabled={isCreating || !canCreateProject} 
              className="w-full rounded-2xl"
            >
              {isCreating ? "Creating..." : "Create Project"}
            </Button>
            {!canCreateProject && (
              <p className="text-xs text-muted-foreground text-center">
                {projects.length}/{userSubscription?.project_limit || 1} projects used
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
