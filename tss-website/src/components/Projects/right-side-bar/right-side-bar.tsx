import { Card } from "@/components/ui/card";
import TasksStats from "./tasks-stats";
import ProjectSelectionDropDown from "../project-selection/project-selection";
import CircularProgress from "./circular-progress";
import { Project, Task } from "@/components/Projects/project-selection/project-selection";

type RightSideBarProps = {
    projects: Project[];
    setProjects: (projects: Project[]) => void;
    selectedProject: Project;
    setSelectedProject: (project: Project) => void;
    tasks: Task[];
};

export default function RightSideBar({
    projects,
    setProjects,
    selectedProject,
    setSelectedProject,
    tasks,
}: RightSideBarProps) {
    return (
        <Card className="shadow-none p-6 rounded-3xl max-h-[640px]">
            <div className="flex flex-col gap-6">
                <ProjectSelectionDropDown
                    projects={projects}
                    setProjects={setProjects}
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                />

                <CircularProgress percentage={Math.floor((tasks.filter(t => t.status === "completed").length / tasks.length) * 100) || 0} />
                <TasksStats tasks={tasks} />
            </div>
        </Card>
    );
}