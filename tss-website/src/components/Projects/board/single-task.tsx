import { Card, CardContent, CardHeader } from "@/components/ui/card";
import TasksDropDown from "@/components/task-drop-down";
import { Task } from "@/components/Projects/project-selection/project-selection";

export default function SingleTask({ task }: { task: Task }) {
    return (
        <Card className="shadow-none hover:shadow-md transition-shadow">
            <CardHeader className="p-4">
                <div className="flex justify-between items-center">
                    <div
                        className={`p-1 py-[4px] rounded-3xl px-2 pr-4 font-medium flex items-center gap-1 text-sm ${
                            task.priority === "low"
                                ? "bg-green-500/15 text-green-900"
                                : task.priority === "medium"
                                ? "bg-yellow-500/15 text-yellow-900"
                                : "bg-red-500/15 text-red-900"
                        }`}
                    >
                        <span className="text-[12px]">{task.priority}</span>
                    </div>
                    <TasksDropDown task={task} />
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 mt-1">
                <span className="font-bold text-lg">{task.title}</span>
                <span className="text-sm text-gray-600">
                    {task.description}
                </span>
            </CardContent>
        </Card>
    );
}