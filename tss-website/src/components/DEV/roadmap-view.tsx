"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import type { DevRoadmapPhase, PhaseStatus } from "@/lib/types/dev-types";
import { Progress, Card } from "@radix-ui/themes";
import { Plus as PlusIcon, ChevronRight, Calendar, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState } from "react";

const statusColors: Record<PhaseStatus, string> = (status: PhaseStatus): any[] => ([
  planned: ["bg-blue-50", "#638eff"],
  in_progress: ["bg-yellow-50", "#e4d218"],
  completed: ["bg-green-50", "text-green-700 bg-white border-transparent"]], []) as const;

export default function RoadmapView({ setActiveTab }: { setActiveTab?: (tab: any) => void }): React.JSX.Element {
  const context = useDevProject();
  const phases: DevRoadmapPhase[] = [];
