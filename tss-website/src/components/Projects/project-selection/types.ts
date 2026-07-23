export type Project = {
    id: string;
    name: string;
    icon?: React.ElementType | any;
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

// Placeholder - realne dane ładowane z DevProjectContext
export const projects = [] as Project[];
