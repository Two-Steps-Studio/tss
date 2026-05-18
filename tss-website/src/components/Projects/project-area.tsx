import { Card } from "@/components/ui/card";
import ProjectsAreaHeader from "@/components/Projects/project-area-header";
import ProjectsAreaBoards from "@/components/Projects/project-area-boards";
import { Project, Task } from "@/components/Projects/project-selection/project-selection";
import { SortingDropDown } from "@/components/sorting-drop-down";

type ProjectsAreaProps = {
    projects: Project[];
    setProjects: (projects: Project[]) => void;
    tasks: Task[];
    setTasks: (tasks: Task[]) => void;
};

export default function ProjectsArea({ projects, setProjects, tasks, setTasks }: ProjectsAreaProps) {
    return (
        <Card className="shadow-none p-6 rounded-3xl flex flex-col gap-6">
            <ProjectsAreaHeader onAddTask={() => {}} />
            <ProjectsAreaBoards projects={projects} setProjects={setProjects} tasks={tasks} setTasks={setTasks} />
        </Card>
    );
}