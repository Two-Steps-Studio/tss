'use client';

import { useState } from 'react';
import { useDevProject } from '@/contexts/dev-project-context';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function RoadmapView({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { activeProjectId, phases, addPhase, updatePhase, deletePhase, isLoading } = useDevProject();

  if (isLoading || !activeProjectId) {
    return <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <Clock /> loading...</p>`,