import { CommandItem } from "@/components/ui/command";
import { Project, projects, Task } from "./project-selection";
import { IoMdCheckmark, IoMdDelete } from "react-icons/io";
import { FaTrash, FaPlus } from "react-icons/fa6";
import { Trash } from "lucide-react";

export function SingleProjectCommandItem( {
    project,
    isSelected,
    onSelectedItem,
    onDeleteProject,
    isDeletable,
}: {
    project: Project;
    isSelected: boolean;
    onSelectedItem: (project: Project) => void;
    onDeleteProject?: (project: Project) => void;
    isDeletable?: boolean;
} ) {
    const { name: projectName, tasks, icon: ProjectIcon } = project;

    return (
        <CommandItem
        value={projectName}
        onSelect={(value: string) => {
            const findProject = projects.find((proj) => proj.name === value);

            if (findProject) {
                onSelectedItem(findProject);
            }
        }}
        className="cursor-pointer hover:bg-gray-100 rounded-lg p-2"
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <ProjectIcon className="text-primary" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-500">
                        {tasks.length} Tasks
                    </span>
                    {isDeletable && onDeleteProject && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteProject(project);
                            }}
                            className="hover:text-red-600 p-1"
                        >
                            <Trash className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
            <div className="flex flex-col">
                <span className="font-medium">{projectName}</span>
            </div>
        </CommandItem>
    )
}
