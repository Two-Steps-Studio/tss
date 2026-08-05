"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Loader2,
  AlertCircle,
  Cpu,
  Code,
  Database,
  Server,
  Brain,
  Settings,
  Music  
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
import type { TechCategory } from "@/lib/types/dev-types";

const categoryIcons: Record<TechCategory, React.ReactNode> = {
  frontend: <Code size={20} className="text-blue-500" />,
  backend: <Server size={20} className="text-green-500" />,
  game_engine: <Cpu size={20} className="text-purple-500" />,
  database: <Database size={20} className="text-orange-500" />,
  ai: <Brain size={20} className="text-pink-500" />,
  devops: <Settings size={20} className="text-cyan-500" />,
  other: <Cpu size={20} className="text-gray-500" />,
};

const categoryColors: Record<TechCategory, string> = {
  frontend: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  backend: "bg-green-500/10 text-green-500 border-green-500/20",
  game_engine: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  database: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  ai: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  devops: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function DevTechnologies() {
  const { technologies, activeProject, addTechnology, updateTechnology, deleteTechnology, isLoading, error } = useDevProject();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<typeof technologies[0] | null>(null);
  const [newTechName, setNewTechName] = useState("");
  const [newTechVersion, setNewTechVersion] = useState("");
  const [newTechCategory, setNewTechCategory] = useState<TechCategory>("other");
  const [newTechDescription, setNewTechDescription] = useState("");
  const [newTechIcon, setNewTechIcon] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleAddTechnology = async () => {
    if (!newTechName.trim() || !activeProject) return;
    setIsCreating(true);
    try {
      await addTechnology({
        name: newTechName,
        version: newTechVersion || undefined,
        category: newTechCategory,
        description: newTechDescription || undefined,
        icon_slug: newTechIcon || undefined,
      });
      setNewTechName("");
      setNewTechVersion("");
      setNewTechCategory("other");
      setNewTechDescription("");
      setNewTechIcon("");
      setIsCreateOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditTechnology = async () => {
    if (!editingTech || !newTechName.trim()) return;
    setIsCreating(true);
    try {
      await updateTechnology(editingTech.id, {
        name: newTechName,
        version: newTechVersion || undefined,
        category: newTechCategory,
        description: newTechDescription || undefined,
        icon_slug: newTechIcon || undefined,
      });
      setNewTechName("");
      setNewTechVersion("");
      setNewTechCategory("other");
      setNewTechDescription("");
      setNewTechIcon("");
      setEditingTech(null);
      setIsEditOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const openEditDialog = (tech: typeof technologies[0]) => {
    setEditingTech(tech);
    setNewTechName(tech.name);
    setNewTechVersion(tech.version || "");
    setNewTechCategory(tech.category);
    setNewTechDescription(tech.description || "");
    setNewTechIcon(tech.icon_slug || "");
    setIsEditOpen(true);
  };

  const handleDeleteTechnology = async (id: number) => {
    if (confirm("Are you sure you want to delete this technology?")) {
      await deleteTechnology(id);
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
          <p className="text-muted-foreground">Select a project to view technologies</p>
        </div>
      </div>
    );
  }

  const technologiesByCategory: Record<TechCategory, typeof technologies> = {
    frontend: technologies.filter((t) => t.category === "frontend"),
    backend: technologies.filter((t) => t.category === "backend"),
    game_engine: technologies.filter((t) => t.category === "game_engine"),
    database: technologies.filter((t) => t.category === "database"),
    ai: technologies.filter((t) => t.category === "ai"),
    devops: technologies.filter((t) => t.category === "devops"),
    audio: technologies.filter((t) => t.category === "audio"),
    other: technologies.filter((t) => t.category === "other"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between ">
        <div>
          <h1 className="text-4xl font-bold text-[var(--text)] mb-2">
            <span className="text-[var(--color-dev)]">Technologies</span>
          </h1>
          <p className="text-muted-foreground">Manage technologies for <span className="text-[var(--color-dev)]">{activeProject.name}</span></p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl">
              <Plus className="mr-2 h-4 w-4" />
              Add Technology
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl bg-[var(--bg)] text-[var(--text)]">
            <DialogHeader>
              <DialogTitle>Add New Technology</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Technology Name</Label>
                <Input
                  id="name"
                  value={newTechName}
                  onChange={(e) => setNewTechName(e.target.value)}
                  placeholder="e.g., React, Node.js, PostgreSQL"
                  className="rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="version">Version (optional)</Label>
                <Input
                  id="version"
                  value={newTechVersion}
                  onChange={(e) => setNewTechVersion(e.target.value)}
                  placeholder="e.g., 18.2.0"
                  className="rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newTechCategory} onValueChange={(val: TechCategory) => setNewTechCategory(val)}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg)] text-[var(--text)]">
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="game_engine">Game Engine</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="ai">AI/ML</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newTechDescription}
                  onChange={(e) => setNewTechDescription(e.target.value)}
                  placeholder="Brief description of the technology"
                  className="rounded-2xl min-h-[80px]"
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon Slug (optional)</Label>
                <Input
                  id="icon"
                  value={newTechIcon}
                  onChange={(e) => setNewTechIcon(e.target.value)}
                  placeholder="e.g., react, nodejs"
                  className="rounded-2xl"
                />
              </div>
              <Button onClick={handleAddTechnology} disabled={isCreating} className="w-full rounded-2xl">
                {isCreating ? "Adding..." : "Add Technology"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Technologies Grid */}
      {technologies.length === 0 ? (
        <Card className="rounded-3xl border-[var(--border-color)] bg-[var(--card-bg)]">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Cpu className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No technologies yet</p>
            <Button onClick={() => setIsCreateOpen(true)} className="rounded-2xl text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add First Technology
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(technologiesByCategory).map(([category, categoryTechs]) => (
            categoryTechs.length > 0 && (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4 capitalize flex items-center gap-2">
                  {categoryIcons[category as TechCategory]}
                  {category.replace("_", " ")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTechs.map((tech) => (
                    <Card key={tech.id} className="rounded-3xl border-[var(--border-color)] hover:border-[var(--color-dev)]/50 bg-[var(--card-bg)] transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-[var(--bg)]">
                              {categoryIcons[tech.category]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm">{tech.name}</h3>
                              {tech.version && (
                                <p className="text-xs text-muted-foreground">v{tech.version}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg"
                              onClick={() => openEditDialog(tech)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg"
                              onClick={() => handleDeleteTechnology(tech.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {tech.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {tech.description}
                          </p>
                        )}
                        <Badge 
                          className={`rounded-full text-xs ${categoryColors[tech.category]}`}
                          variant="outline"
                        >
                          {tech.category}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-3xl bg-white text-black">
          <DialogHeader>
            <DialogTitle>Edit Technology</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Technology Name</Label>
              <Input
                id="edit-name"
                value={newTechName}
                onChange={(e) => setNewTechName(e.target.value)}
                placeholder="e.g., React, Node.js, PostgreSQL"
                className="rounded-2xl"
              />
            </div>
            <div>
              <Label htmlFor="edit-version">Version (optional)</Label>
              <Input
                id="edit-version"
                value={newTechVersion}
                onChange={(e) => setNewTechVersion(e.target.value)}
                placeholder="e.g., 18.2.0"
                className="rounded-2xl"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={newTechCategory} onValueChange={(val: TechCategory) => setNewTechCategory(val)}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="game_engine">Game Engine</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="ai">AI/ML</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={newTechDescription}
                onChange={(e) => setNewTechDescription(e.target.value)}
                placeholder="Brief description of the technology"
                className="rounded-2xl min-h-[80px]"
              />
            </div>
            <div>
              <Label htmlFor="edit-icon">Icon Slug (optional)</Label>
              <Input
                id="edit-icon"
                value={newTechIcon}
                onChange={(e) => setNewTechIcon(e.target.value)}
                placeholder="e.g., react, nodejs"
                className="rounded-2xl"
              />
            </div>
            <Button onClick={handleEditTechnology} disabled={isCreating} className="w-full rounded-2xl">
              {isCreating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
