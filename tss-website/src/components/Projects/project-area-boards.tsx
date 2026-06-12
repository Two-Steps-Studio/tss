import SingleBoard, { Board } from "@/components/Projects/board/single-board";
import { Project, Task } from "@/components/Projects/project-selection/project-selection";

type ProjectAreaBoardsProps = {
    projects: Project[];
    setProjects: (projects: Project[]) => void;
    tasks: Task[];
    setTasks: (tasks: Task[]) => void;
};

export default function ProjectAreaBoards({ projects, setProjects, tasks, setTasks }: ProjectAreaBoardsProps) {
    // Filter tasks by status instead of hardcoded empty arrays
    const todo = tasks.filter(t => t.status === "todo");
    const inProgress = tasks.filter(t => t.status === "in-progress");
    const completed = tasks.filter(t => t.status === "completed");

    const boards: Board[] = [
        { name: "To Do", createdAt: new Date(), tasks: todo },
        { name: "In Progress", createdAt: new Date(), tasks: inProgress },
        { name: "Completed", createdAt: new Date(), tasks: completed },
    ];

    return (
        <div className="h-full rounded-2xl flex items-center mt-4 gap-3 overflow-x-auto pb-2">
            {boards.map((board, index) => (
                <SingleBoard key={index} board={board} />
            ))}
        </div>
    );
}