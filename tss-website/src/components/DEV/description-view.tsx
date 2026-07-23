"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import { Textarea, Card } from "@radix-ui/themes";

export default function DescriptionView({ activeProjectName }: { setActiveTab?: (tab: any) => void; activeProjectName?: string }): React.JSX.Element {}
