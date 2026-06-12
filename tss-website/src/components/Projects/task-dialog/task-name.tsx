import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function TaskName({ initialValue = "" }: { initialValue?: string }) {
    const [value, setValue] = useState(initialValue);

    return (
        <div className='flex flex-col gap-2'>
            <Label className="opacity-75 text-sm font-medium">Task Title</Label>
            <Input
                value={value}
                onChange={(e) => {
                    const newValue = e.target.value.substring(0, 100);
                    setValue(newValue);
                }}
                placeholder="Joe Doe..."
                className="h-11"
                maxLength={100}
            />

            <div className="text-slate-500 text-[12px] flex items-center gap-1">
                <span className="truncate">Max 100 characters</span>
            </div>
        </div>
    )
}