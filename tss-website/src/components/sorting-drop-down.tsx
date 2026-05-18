"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { IoMdArrowDown, IoMdArrowUp } from "react-icons/io";

const options = ["A-Z", "Z-A"];

export function SortingDropDown() {
    const [selectedOption, setSelectedOption] = React.useState("A-Z");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                    <span className="font-medium text-sm">{selectedOption}</span>

                    {selectedOption === "A-Z" ? (
                        <IoMdArrowDown className="text-sm" />
                    ) : (
                        <IoMdArrowUp className="text-sm" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-20 space-grotesk">
                {options.map((option) => (
                    <DropdownMenuCheckboxItem
                        key={option}
                        checked={selectedOption === option}
                        onCheckedChange={() => setSelectedOption(option)}
                    >
                        {option}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}