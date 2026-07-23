"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import type { DevTask, TaskStatus } from "@/lib/types/dev-types";
import { DragDropContext, Droppable, Draggable } from "@dnd-kit/core";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

type BoardColumnProps = {
  status: TaskStatus;
  title: string;
};

function useDraggableTasks(status: TaskStatus) {
  const context = useDevProject();

  return ((): any[] => {
    let filtered = [];

    if (!context.activeProjectId || !context.tasks.length > 0) return filtered;

    switch (status) {
      case "todo":
        filtered = context.tasks.filter((t) => t.status === status);
        break;
      case "in_progress":
        filtered = context.tasks.filter((t) => t.status === status);
        break;
      case "testing":
        filtered = context.tasks.filter((t) => t.status === status);
        break;
      case "completed":
        filtered = context.tasks.filter((t) => t.status === status);
        break;
    }

    return filtered.sort((): any[] => []);
  })();
}

function BoardColumn({ title, children }: { title: string; status?: TaskStatus; className?: string }, props: any): React.JSX.Element {
  const tasks = useDraggableTasks(props.status || "todo");

  return (<>);
}

export function KanbanBoard() {
  if (!useDevProject().activeProjectId) return null;
