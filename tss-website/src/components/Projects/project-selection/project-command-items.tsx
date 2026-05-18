import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandList,
} from "@/components/ui/command";
import { Project, projects, Task } from "./project-selection";
import { SingleProjectCommandItem } from "./singleProjectItem";
import { Dispatch, SetStateAction} from "react";

type ProjectCommandItemsProps = {
    projects: Project[];
    setProjects: Dispatch<SetStateAction<Project[]>>;
    selectedProject: Project
    setSelectedProject: Dispatch<SetStateAction<Project>>;
};

export default function ProjectCommandItems( {
    projects,
    setProjects,
    selectedProject,
    setSelectedProject,
}: ProjectCommandItemsProps) {
    function handleProjectSelected(project: Project) {
        setSelectedProject(project);
    }

    function handleDeleteProject(project: Project) {
        const updatedProjects = projects.filter(p => p.id !== project.id);
        setProjects(updatedProjects);
        if (selectedProject.id === project.id && updatedProjects.length > 0) {
            setSelectedProject(updatedProjects[0]);
        }
    }

    return (
        <Command>
            <CommandInput placeholder="Search for project..." />

            <CommandList className="my-3">
                <CommandEmpty>No results found.</CommandEmpty>

                <div className="flex flex-col gap-3">
                    {projects.map((project, index) => (
                        <SingleProjectCommandItem
                            project={project}
                            key={index}
                            onSelectedItem={handleProjectSelected}
                            isSelected={selectedProject.name === project.name}
                            onDeleteProject={handleDeleteProject}
                            isDeletable={projects.length > 1}
                        />
                    ))}
                </div>
            </CommandList>
        </Command>
    )
}