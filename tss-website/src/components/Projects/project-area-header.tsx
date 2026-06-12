import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { SortingDropDown } from "@/components/sorting-drop-down";

type ProjectAreaHeaderProps = {
    onAddTask?: () => void;
};

export default function ProjectAreaHeader({ onAddTask }: ProjectAreaHeaderProps) {
    return (
        <div className="flex justify-between items-center">

            <div className="flex gap-3 items-center">
                <span className="text-2xl font-bold">Projects</span>
            </div>

            <div className="flex items-center gap-4">

                <div className="flex items-center gap-1">
                    <Settings className="text-xl text-gray-500" />
                    <span className="text-gray-500 text-sm">Sort</span>
                </div>

                <SortingDropDown />

                {/* Button is shown if onAddTask is provided and it's a valid function */}
                {onAddTask && typeof onAddTask === 'function' && (
                    <Button
                        onClick={onAddTask}
                        className="rounded-3xl px-4"
                    >
                        Add Task
                    </Button>
                )}

            </div>
        </div>
    );
}