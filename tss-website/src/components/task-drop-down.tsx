"use client";

import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { JSX } from "react";
import { Task } from "@/components/Projects/project-selection/project-selection";

type MenuItem = {
    icon?: JSX.Element;
    label?: string;
    className?: string;
    separator?: boolean;
    action?: (task: Task) => void;
};

export default function TaskDropDown({ task }: { task: Task }) {
    const menuItems: MenuItem[] = [
        {
            icon: <FaRegEdit />,
            label: "Edit Task",
            className: "",
            action: (task: Task) => console.log("Edit task:", task.id),
        },

        {
            separator: true,
        },

        {
            icon: <MdOutlineDelete />,
            label: "Delete Task",
            className: "text-red-600",
            action: (task: Task) => console.log("Delete task:", task.id),
        },
    ];

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="poppins">
                    {menuItems.map((item, index) =>
                        item.separator ? (
                            <DropdownMenuSeparator key={index} />
                        ) : (
                            <DropdownMenuItem
                                key={index}
                                className={`flex items-center gap-2 p-[10px] ${item.className}`}
                                onClick={() => item.action?.(task)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </DropdownMenuItem>
                        )
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}