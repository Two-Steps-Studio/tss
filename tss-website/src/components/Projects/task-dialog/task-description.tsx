import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChangeEvent, useState } from "react";

export default function TaskDescription({ initialValue = "" }: { initialValue?: string }) {
    const [textCounter, setTextCounter] = useState(initialValue);

    function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setTextCounter(e.target.value);
    }

    return (
        <div className="flex flex-col gap-2 mt-4">
            <Label className="opacity-75 text-sm font-medium">
                Task Description
            </Label>

            <Textarea
                value={textCounter}
                onChange={handleTextChange}
                placeholder="Give a description of the task..."
                className="resize-none"
            />

            <div className="flex justify-between items-center">
                <div className="text-slate-500 text-[12px] flex items-center gap-1">
                    <span className="truncate">Max 300 characters</span>
                </div>
            </div>

            <p className="text-[12px] text-gray-500">
                {textCounter.length}/300 Characters
            </p>
        </div>
    );
}
