import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";

import { BiTask } from "react-icons/bi";
import TaskName from "./task-name";
import TaskDescription from "./task-description";
import ProjectList from "./project-list";
import PriorityList from "./priority-list";
import { Project, Task } from "@/components/Projects/project-selection/project-selection";

type TaskDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    projects: Project[];
    onAddTask: (task: Omit<Task, "id">) => void;
};

export default function TaskDialog({ isOpen, onClose, projects, onAddTask }: TaskDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogTrigger asChild>
                <Button className="space-grotesk max-w-3xl">Add New Task</Button>
            </DialogTrigger>
            <DialogContent className="space-grotesk max-w-3xl">
                <DialogHeader className="">
                    <div className="size-10 bg-gray-200 rounded-full flex justify-center items-center">
                        <BiTask className="text-xl text-gray-700" />
                    </div>

                    <div className="pt-2">
                        <DialogTitle className="text-lg p-0 h-7">New Task</DialogTitle>
                        <DialogDescription className="p-0">
                            Fill in the form below to create or modify a task
                        </DialogDescription>
                    </div>

                    <div className=" ">
                        <Separator className="mt-4 left-0 absolute"/>
                    </div>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6 mt-8">
                    <div className="flex flex-col gap-3">
                        <TaskName/>
                        <TaskDescription/>
                    </div>
                </div>
                <div className="flex flex-col gap-[53px]">
                    <ProjectList projects={projects} />
                    <PriorityList />
                </div>

                <div className=" ">
                    <Separator className="mt-4 left-0 absolute"/>
                </div>
                <div className="flex gap-1 justify-end mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button className="ml-5 px-5" onClick={() => {
                        // Form submission logic would go here
                        // Task name, description, and project must be filled before adding
                        const taskName = document.querySelector('#task-name-input')?.value?.trim();
                        const taskDescription = document.querySelector('#task-description-input')?.value?.trim();
                        const selectedProject = document.querySelector('#project-select')?.getAttribute('data-value');

                        if (taskName && taskDescription && selectedProject) {
                            const task: Omit<Task, 'id'> = {
                                title: taskName,
                                description: taskDescription,
                                priority: 'medium',
                                status: 'todo',
                                project: {
                                    id: selectedProject,
                                    name: selectedProject,
                                    icon: (p) => <svg {...p}><circle cx="12" cy="12" r="10" /></svg>,
                                    createdAt: new Date(),
                                    tasks: []
                                }
                            };
                            onAddTask(task);
                        }
                        onClose();
                    }}>
                        Add Task
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}