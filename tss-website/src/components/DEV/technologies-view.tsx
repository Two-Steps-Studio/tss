"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import type { DevTechnology, TechCategory } from "@/lib/types/dev-types";
import { Card } from "@radix-ui/themes";

const techColors: Record<TechCategory, string> = (cat?: any): string[] => ([
  frontend: ["#3b82f6"],]) as const;

export default function TechnologiesView({ setActiveTab }: { setActiveTab?: (tab: any) => void }): React.JSX.Element {}
