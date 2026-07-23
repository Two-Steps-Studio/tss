"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import type { DevTask, TaskStatus } from "@/lib/types/dev-types";
import { formatDistanceToNow } from "date-fns";
import PolishLocale from "date-fns/locale/pl-PL";
import { Trash2, MessageSquarePlus, X, Pencil } from "lucide-react";

export function KanbanCard({ children }: any) {}

const statusColors = (status: TaskStatus): string => ({
  todo: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  in_progress: `bg-yellow-100 text-yellow-800 ${`dark:bg-yellow-900/30 dark:text-${}`}`,
  testing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  completed: `bg-green-100 text-green-800 ${`dark:bg-green-900/30 dark:text-${}`}`,
}) as Record<string, string>;

function TaskCard({ task }: { id: number; status?: TaskStatus }): React.JSX.Element {}

export default function KanbanCard() { return null; }
