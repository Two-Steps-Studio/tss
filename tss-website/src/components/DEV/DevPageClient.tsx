"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  FolderKanban, 
  Map, 
  FileText, 
  Cpu,
  ArrowRight,
  Loader2,
  Lock
} from "lucide-react";
import Link from "next/link";
import { DevMembersPanel, DevActivityLogs } from "@/components/DEV";

export function DevPageClient() {
  const { activeProject, stats, isLoading, error, hasAccessToDev, hasPermission } = useDevProject();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-dev)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!hasAccessToDev) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <Lock className="h-12 w-12 text-[var(--color-dev)] mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Brak dostępu do żadnego projektu.</h2>
          <p className="text-muted-foreground mb-4">
            Nie masz dostępu do żadnego projektu deweloperskiego. <a href="/dev/projects" className="text-[var(--color-dev)]"> Stwórz swój </a> lub dołącz do istniejącego po przez zaproszenie.
          </p>
        </div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <FolderKanban className="h-12 w-12 text-[var(--color-dev)] mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Brak aktywnego projektu</h2>
          <p className="text-muted-foreground mb-4">
            Nie masz jeszcze żadnego projektu. Utwórz pierwszy projekt, aby rozpocząć pracę.
          </p>
          <Link href="/dev/projects">
            <Button className="rounded-2xl">
              Przejdź do projektów
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{activeProject.name}</h1>
          <p className="text-muted-foreground mt-1">{activeProject.description || "Brak opisu"}</p>
        </div>
        <Badge className="rounded-2xl" style={{ backgroundColor: activeProject.color }}>
          {activeProject.status}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
        <Card className="rounded-2xl border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Zadania
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedTasks} ukończonych
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Map className="h-4 w-4" />
              Fazy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPhases}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedPhases} ukończonych
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pliki
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dokumenty projektu
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Technologie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTechnologies}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Użyte w projekcie
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        <Link href="/dev/tasks">
          <Card className="rounded-2xl border-[var(--border-color)] hover:border-[var(--color-dev)]/50 transition-colors cursor-pointer bg-[var(--card-bg)] text-[var(--text)]" >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-[var(--color-dev)]" />
                Zarządzaj zadaniami
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Przeglądaj i zarządzaj zadaniami projektu
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dev/roadmap">
          <Card className="rounded-2xl border-[var(--border-color)] hover:border-[var(--color-dev)]/50 transition-colors cursor-pointer bg-[var(--card-bg)] text-[var(--text)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-[var(--color-dev)]" />
                Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Przeglądaj fazy rozwoju projektu
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dev/files">
          <Card className="rounded-2xl border-[var(--border-color)] hover:border-[var(--color-dev)]/50 transition-colors cursor-pointer bg-[var(--card-bg)] text-[var(--text)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--color-dev)]" />
                Pliki
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Zarządzaj dokumentacją projektu
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Members and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DevMembersPanel />
        <DevActivityLogs />
      </div>
    </div>
  );
}
