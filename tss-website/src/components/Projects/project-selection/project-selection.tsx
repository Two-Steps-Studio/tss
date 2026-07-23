import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { FaMobileRetro} from "react-icons/fa6";
import { IconType} from "react-icons";
import { FaFlagCheckered} from "react-icons/fa6";
import ProjectCommandItems from "./project-command-items";
import { useState } from "react";

export type Project = {
    id: string;
    name: string;
    icon: IconType;
    createdAt: Date;
    tasks: Task[];
};

export type Task = {
    id: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: "todo" | "in-progress" | "completed";
    project: Project;
};

export const mockProjects: Project[] = [
    {
        id: "1",
        name: "Project 1",
        icon: FaMobileRetro,
        createdAt: new Date(),
        tasks: [{id: "1", title: "Task 1", description: "Create content", priority: "low", status: "todo", project: {id: "1", name: "Project 1", icon: FaMobileRetro, createdAt: new Date(), tasks: []}}],
    },
    {
        id: "2",
        name: "Project 2",
        icon: FaMobileRetro,
        createdAt: new Date(),
        tasks: [{id: "2", title: "Task 2", description: "Review code", priority: "medium", status: "in-progress", project: {id: "2", name: "Project 2", icon: FaMobileRetro, createdAt: new Date(), tasks: []}}],
    },
    {
        id: "3",
        name: "Project 3",
        icon: FaMobileRetro,
        createdAt: new Date(),
        tasks: [{id: "3", title: "Task 3", description: "Deploy app", priority: "high", status: "completed", project: {id: "3", name: "Project 3", icon: FaMobileRetro, createdAt: new Date(), tasks: []}}],
    }
];

export type ProjectSelectionDropDownProps = {
    projects: Project[];
    setProjects: (projects: Project[]) => void;
    selectedProject: Project;
    setSelectedProject: (project: Project) => void;
};

export default function ProjectSelectionDropDown({
    projects,
    setProjects,
    selectedProject,
    setSelectedProject
}: ProjectSelectionDropDownProps) {
    const Icon = selectedProject.icon;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"ghost"}
                    className="w-full flex justify-between py-9 rounded-xl bg-gray-50"
                >
                    <div className="flex items-start flex-col text-[16px] gap-1">
                        <p className="text-[13px] text-slate-500">PROJECT</p>
                        <p className="font-bold">{selectedProject.name}</p>
                    </div>

                    <div
                        className="size-10 bg-primary rounded-full flex items-center justify-center text-2xl text-white"
                    >
                        <Icon />
                    </div>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="p-2 space-grotesk rounded-xl">
                <ProjectCommandItems
                    projects={projects}
                    setProjects={setProjects}
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                />
            </PopoverContent>
        </Popover>
    );
}