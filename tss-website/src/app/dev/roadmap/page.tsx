"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Circle,
  ArrowRight,
  Map
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
import type { PhaseStatus } from "@/lib/types/dev-types";

const statusColors: Record<PhaseStatus, string> = {
  planned: "bg-gray-500",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  blocked: "bg-red-500",
};

const statusIcons: Record<PhaseStatus, React.ReactNode> = {
  planned: <Circle size={16} className="text-gray-500" />,
  in_progress: <Clock size={16} className="text-blue-500" />,
  completed: <CheckCircle size={16} className="text-green-500" />,
  blocked: <AlertCircle size={16} className="text-red-500" />,
};

export default function DevRoadmap() {
  const { phases, activeProject, createPhase, updatePhase, deletePhase, isLoading, error } = useDevProject();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<typeof phases[0] | null>(null);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newPhaseDescription, setNewPhaseDescription] = useState("");
  const [newPhaseStatus, setNewPhaseStatus] = useState<PhaseStatus>("planned");
  const [newPhaseEndDate, setNewPhaseEndDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePhase = async () => {
    if (!newPhaseName.trim() || !activeProject) return;
    setIsCreating(true);
    try {
      await createPhase({
        name: newPhaseName,
        description: newPhaseDescription || undefined,
      });
      setNewPhaseName("");
      setNewPhaseDescription("");
      setNewPhaseStatus("planned");
      setNewPhaseEndDate("");
      setIsCreateOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditPhase = async () => {
    if (!editingPhase || !newPhaseName.trim()) return;
    setIsCreating(true);
    try {
      await updatePhase(editingPhase.id, {
        name: newPhaseName,
        description: newPhaseDescription || undefined,
        status: newPhaseStatus,
        planned_end_date: newPhaseEndDate || undefined,
      });
      setNewPhaseName("");
      setNewPhaseDescription("");
      setNewPhaseStatus("planned");
      setNewPhaseEndDate("");
      setEditingPhase(null);
      setIsEditOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const openEditDialog = (phase: typeof phases[0]) => {
    setEditingPhase(phase);
    setNewPhaseName(phase.name);
    setNewPhaseDescription(phase.description || "");
    setNewPhaseStatus(phase.status);
    setNewPhaseEndDate(phase.planned_end_date || "");
    setIsEditOpen(true);
  };

  const handleDeletePhase = async (id: number) => {
    if (confirm("Are you sure you want to delete this phase?")) {
      await deletePhase(id);
    }
  };

  const handleStatusChange = async (phaseId: number, newStatus: PhaseStatus) => {
    await updatePhase(phaseId, { status: newStatus });
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
          <p className="text-muted-foreground">Select a project to view roadmap</p>
        </div>
      </div>
    );
  }

  const sortedPhases = [...phases].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            <span className="text-[var(--color-dev)]">Roadmap</span>
          </h1>
          <p className="text-muted-foreground">Manage tasks for <span className="text-[var(--color-dev)]">{activeProject.name}</span></p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl">
              <Plus className="mr-2 h-4 w-4" />
              New Phase
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl bg-white text-black">
            <DialogHeader>
              <DialogTitle>Create New Phase</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Phase Name</Label>
                <Input
                  id="name"
                  value={newPhaseName}
                  onChange={(e) => setNewPhaseName(e.target.value)}
                  placeholder="Enter phase name"
                  className="rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newPhaseDescription}
                  onChange={(e) => setNewPhaseDescription(e.target.value)}
                  placeholder="Enter phase description"
                  className="rounded-2xl min-h-[100px]"
                />
              </div>
              <Button onClick={handleCreatePhase} disabled={isCreating} className="w-full rounded-2xl">
                {isCreating ? "Creating..." : "Create Phase"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roadmap Timeline */}
      {sortedPhases.length === 0 ? (
        <Card className="rounded-3xl border-[var(--border-color)]">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Map className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No phases yet</p>
            <Button onClick={() => setIsCreateOpen(true)} className="rounded-2xl">
              <Plus className="mr-2 h-4 w-4" />
              Create First Phase
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedPhases.map((phase, index) => (
            <Card key={phase.id} className="rounded-3xl border-[var(--border-color)]">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColors[phase.status]}`}>
                      {statusIcons[phase.status]}
                    </div>
                    {index < sortedPhases.length - 1 && (
                      <div className="w-0.5 h-16 bg-[var(--border-color)] mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">{phase.name}</h3>
                        {phase.description && (
                          <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`rounded-full ${statusColors[phase.status]} text-white border-0`}
                        >
                          {phase.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4">
                      {phase.planned_end_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar size={14} />
                          <span>Due: {new Date(phase.planned_end_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Progress:</span>
                        <span className="font-semibold">{phase.completion_percentage}%</span>
                      </div>

                      <div className="w-32 bg-black/5 dark:bg-white/5 rounded-full h-2">
                        <div 
                          className="bg-[var(--color-dev)] h-2 rounded-full transition-all" 
                          style={{ width: `${phase.completion_percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex gap-1">
                        {Object.entries(statusIcons).map(([status, icon]) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(phase.id, status as PhaseStatus)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              phase.status === status ? "bg-[var(--color-dev)]/20" : "hover:bg-black/5 dark:hover:bg-white/5"
                            }`}
                            title={`Change to ${status.replace("_", " ")}`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex-1" />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => openEditDialog(phase)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => handleDeletePhase(phase.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-3xl bg-white text-black">
          <DialogHeader>
            <DialogTitle>Edit Phase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Phase Name</Label>
              <Input
                id="edit-name"
                value={newPhaseName}
                onChange={(e) => setNewPhaseName(e.target.value)}
                placeholder="Enter phase name"
                className="rounded-2xl"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={newPhaseDescription}
                onChange={(e) => setNewPhaseDescription(e.target.value)}
                placeholder="Enter phase description"
                className="rounded-2xl min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={newPhaseStatus} onValueChange={(val: PhaseStatus) => setNewPhaseStatus(val)}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-end-date">End Date (optional)</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={newPhaseEndDate}
                  onChange={(e) => setNewPhaseEndDate(e.target.value)}
                  className="rounded-2xl"
                />
              </div>
            </div>
            <Button onClick={handleEditPhase} disabled={isCreating} className="w-full rounded-2xl">
              {isCreating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
