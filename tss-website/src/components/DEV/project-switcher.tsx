"use client";

import { useState } from "react";
import { ChevronDown, FolderKanban, Plus } from "lucide-react";
import { useDevProject } from "@/contexts/dev-project-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProjectSwitcher() {
  const { projects, activeProject, activeProjectId, setActiveProjectId, createProject } = useDevProject();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createProject(newName.trim());
      setNewName("");
      setDialogOpen(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[220px] justify-between rounded-2xl border-[var(--color-dev)]/30 bg-[var(--color-dev)]/5 hover:bg-[var(--color-dev)]/10 h-12"
          >
            <div className="flex items-center gap-2 truncate">
              <FolderKanban className="h-4 w-4 text-[var(--color-dev)] shrink-0" />
              <span className="font-semibold truncate">
                {activeProject?.name ?? "Wybierz projekt"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[260px] rounded-xl">
          {projects.map((p) => (
            <DropdownMenuItem
              key={p.id}
              onClick={() => setActiveProjectId(p.id)}
              className={activeProjectId === p.id ? "bg-[var(--color-dev)]/10 font-semibold" : ""}
            >
              {p.name}
            </DropdownMenuItem>
          ))}
          {projects.length === 0 && (
            <DropdownMenuItem disabled>Brak projektów</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nowy projekt
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Nowy projekt</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="project-name">Nazwa projektu</Label>
            <Input
              id="project-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="np. Backend API"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Anuluj</Button>
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              Utwórz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
