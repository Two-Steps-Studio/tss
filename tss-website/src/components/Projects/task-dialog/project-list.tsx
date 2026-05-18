import { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoCheckmark } from "react-icons/io5";
import { MdOutlineCategory } from "react-icons/md";
import { AiFillSafetyCertificate } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { IoMdSearch } from "react-icons/io";
import { Project, Task } from "@/components/Projects/project-selection/project-selection";

type ProjectItem = {
    name: string;
    icon: React.ElementType;
    taskCount?: number;
};

const ProjectsArray: ProjectItem[] = [
    {
        name: "Project 1",
        icon: MdOutlineCategory,
    },
    {
        name: "Project 2",
        icon: AiFillSafetyCertificate,
    },
];

export default function ProjectList({ projects }: { projects: Project[] }) {
    const [selectedProject, setSelectedProject] = useState<ProjectItem>(ProjectsArray[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const filterBySearchQuery = ProjectsArray.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function renderSelectedProject() {
        const Icon = selectedProject.icon;

        return (
            <div className="flex items-center gap-2">
                <div className="size-7 rounded-md flex items-center justify-center text-lg text-primary bg-primary/10">
                    <Icon />
                </div>
                <span>{selectedProject.name}</span>
            </div>
        );
    }

    function renderDropDownMenuItem(projectItem: ProjectItem) {
        const Icon = projectItem.icon;

        return (
            <div
                className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                    setSelectedProject(projectItem);
                    setIsOpen(false);
                }}
            >
                <div className="size-7 bg-primary/10 rounded-md flex items-center justify-center text-[15px] text-primary">
                    <Icon />
                </div>

                <span>{projectItem.name}</span>

                {projectItem.name === selectedProject.name && (
                    <IoCheckmark className="ml-auto" />
                )}
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Label */}
            <label className="opacity-75 text-sm font-medium">
                Projects
            </label>

            {/* Dropdown Trigger */}
            <div className="mt-1 w-full">
                <Button
                    variant={"outline"}
                    className="w-full h-11 flex justify-between items-center border"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {renderSelectedProject()}
                    <IoIosArrowDown className="text-gray-600" />
                </Button>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute overflow-hidden z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQuery(e.target.value)
                            }
                            className="w-full h-11 p-2 pl-8 text-sm border-b border-gray-300 focus:outline-none"
                            placeholder="Search a project..."
                            autoFocus
                        />
                        <IoMdSearch className="absolute top-[13px] left-2 text-lg text-gray-500" />
                    </div>

                    {/* Items */}
                    <div className="max-h-60 overflow-y-auto my-2">
                        {filterBySearchQuery.map((projectItem, index) => (
                            <div key={index} className="text-sm">
                                {renderDropDownMenuItem(projectItem)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}