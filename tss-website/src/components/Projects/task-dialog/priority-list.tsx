import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { IoIosArrowDown } from "react-icons/io";
import { RiArrowDownDoubleFill } from "react-icons/ri";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { MdOutlineKeyboardDoubleArrowUp } from "react-icons/md";
import { IconType } from "react-icons/lib";
import { useState } from "react";
import { IoCheckmark } from "react-icons/io5";

type PriorityItem = {
    name: string;
    icon: IconType;
    textColor: string;
    backgroundColor: string;
};

const PriorityListArray: PriorityItem[] = [
    {
        name: "Low",
        icon: RiArrowDownDoubleFill,
        textColor: "text-green-700",
        backgroundColor: "bg-green-500/10",
    },
    {
        name: "Medium",
        icon: MdKeyboardDoubleArrowRight,
        textColor: "text-yellow-700",
        backgroundColor: "bg-yellow-500/10",
    },
    {
        name: "High",
        icon: MdOutlineKeyboardDoubleArrowUp,
        textColor: "text-red-700",
        backgroundColor: "bg-red-500/10",
    },
];

export default function PriorityList({ initialValue = "low" }: { initialValue?: "low" | "medium" | "high" }) {
    const [selectedPriority, setSelectedPriority] = useState<PriorityItem>(
        PriorityListArray.find(p => p.name === initialValue) || PriorityListArray[0]
    );

    function renderSelectedPriority() {
        return (
            <div className="flex items-center gap-2">
                <div
                    className={`size-6 ${selectedPriority.backgroundColor} rounded-md flex
                    items-center justify-center text-lg ${selectedPriority.textColor}`}
                >
                    <selectedPriority.icon />
                </div>

                <span className={`${selectedPriority.textColor}`}>
                    {selectedPriority.name}
                </span>
            </div>
        );
    }

    function renderDropDownMenuItem(priorityItem: PriorityItem) {
        return (
            <div className="flex items-center gap-2">
                <div
                    className={`size-6 ${priorityItem.backgroundColor} rounded-md flex
                    items-center justify-center text-lg ${priorityItem.textColor}`}
                >
                    <priorityItem.icon />
                </div>

                <span className={`${priorityItem.textColor}`}>
                    {priorityItem.name}
                </span>
            </div>
        );
    }

    function isDropDownItemChecked(priorityItem: PriorityItem) {
        return (
            selectedPriority.name === priorityItem.name && (
                <IoCheckmark className="text-lg" />
            )
        );
    }

    return (
        <div>
            {/* label */}
            <Label className="opacity-75 text-sm font-medium">
                Priority
            </Label>

            <div className="mt-2 w-full">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            id="priority-dropdown"
                            variant={"outline"}
                            className="w-full h-11 flex justify-between"
                        >
                            {renderSelectedPriority()}

                            <IoIosArrowDown className="text-gray-600" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="start"
                        className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)] poppins"
                    >
                        {PriorityListArray.map((priorityItem, index) => (
                            <DropdownMenuItem
                                key={index}
                                className="flex justify-between items-center"
                                onClick={() => {
                                    setSelectedPriority(priorityItem);
                                }}
                            >
                                {renderDropDownMenuItem(priorityItem)}

                                {isDropDownItemChecked(priorityItem)}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}