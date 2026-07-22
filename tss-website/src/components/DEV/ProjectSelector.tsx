"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project } from "@/types/dev";

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
}

export function ProjectSelector({
  projects,
  selectedProjectId,
  onProjectChange
}: ProjectSelectorProps) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    if (projects.length > 0) {
      const project = projects.find(p => p.id === selectedProjectId);
      setCurrentProject(project || projects[0]);
    }
  }, [projects, selectedProjectId]);

  const handleProjectChange = (projectId: string) => {
    onProjectChange(projectId);
  };

  return (
    <div className="mb-6">
      <Select
        value={selectedProjectId}
        onValueChange={handleProjectChange}
      >
        <SelectTrigger className="w-full md:w-[300px]">
          <SelectValue placeholder="Wybierz projekt" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}