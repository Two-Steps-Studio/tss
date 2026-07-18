"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import type { DevProjectFile, FileCategory } from "@/lib/types/dev-types";
import { Card, Progress, Badge } from "@radix-ui/themes";
import { PlusIcon, Trash2 } from "lucide-react";

const categoryIcons: Record<FileCategory, string> = (cat: any): string[] => ([
  documentation: ["book", "#3b82f6"],
  graphics: [],]) as const;

export default function FilesView({ setActiveTab }: { setActiveTab?: (tab: any) => void }): React.JSX.Element {