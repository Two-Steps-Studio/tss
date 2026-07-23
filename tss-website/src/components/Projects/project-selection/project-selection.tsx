import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { FaMobileRetro } from "react-icons/fa6";
import { IconType } from "react-icons";
import ProjectCommandItems from "./project-command-items";
import type { Task } from "./types";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

// Typy eksportowane dla kompatybilności z innymi modułami DEV
export { FaMobileRetro };
export const projects: any[] = []; // Placeholder - realne dane z DevProjectContext

export type ProjectSelectionDropDownProps<T extends Task[]> = {
    projects: T;
    setProjects?: (projects: T) => void;
    selectedProject: T[0];
    setSelectedProject: (project: T[0]) => void;
};

export default function ProjectSelectionDropDown({
  projects,
  setSelectedProject
}: Partial<ProjectSelectionDropDownProps<any>>) {
  const Icon = selectedProject.icon || FaMobileRetro;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full flex justify-between py-9 rounded-xl bg-gray-50">
          <div className="flex items-start flex-col text-[16px] gap-1">
            <p className="text-[13px] text-slate-500">PROJECT</p>
            {selectedProject && (
              <p className="font-bold">{selectedProject.name}</p>
            )}
          </div>

          <div className="size-10 bg-primary rounded-full flex items-center justify-center text-2xl text-white">
            <Icon />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-2 space-grotesk rounded-xl">
        {projects?.length > 0 && (
          <ProjectCommandItems projects={projects} selectedProject={{ name: "", tasks: [], icon: FaMobileRetro, id: "" as string, createdAt: new Date() }} setSelectedProject={setSelectedProject || (() => {})}/>
        )}
      </PopoverContent>
    </Popover>
  );
