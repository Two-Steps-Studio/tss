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
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function DevDashboard() {
  const { activeProject, stats, isLoading, error } = useDevProject();

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

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No project selected. Create a project to get started.</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      href: "/dev/tasks",
      title: "Tasks",
      description: `${stats.inProgress} in progress`,
      icon: CheckSquare,
      color: "text-blue-500"
    },
    {
      href: "/dev/roadmap",
      title: "Roadmap",
      description: "View project phases",
      icon: Map,
      color: "text-purple-500"
    },
    {
      href: "/dev/files",
      title: "Files",
      description: "Project resources",
      icon: FileText,
      color: "text-green-500"
    },
    {
      href: "/dev/technology",
      title: "Technologies",
      description: "Tech stack",
      icon: Cpu,
      color: "text-orange-500"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="relative p-8 md:p-12 rounded-[2.5rem] overflow-hidden bg-[var(--color-dev)]/5 border border-[var(--color-dev)]/20 backdrop-blur-md shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-dev)]/10 via-transparent to-transparent opacity-60" />
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[var(--color-dev)]/20 blur-3xl" />

        <div className="relative z-10 space-y-4">
          <Badge className="bg-[var(--color-dev)]/20 text-[var(--color-dev)] border-0 px-4 py-1.5 text-sm font-medium rounded-full backdrop-blur-sm">
            Active Project
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white font-[family-name:var(--font-space)] tracking-tight">
            {activeProject.name}
          </h1>

          {activeProject.description && (
            <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl font-[family-name:var(--font-outfit)] text-lg md:text-xl leading-relaxed">
              {activeProject.description}
            </p>
          )}

          {activeProject.planned_end_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={16} />
              <span>Planned completion: {new Date(activeProject.planned_end_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-3xl border-[var(--border-color)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-[var(--border-color)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-[var(--border-color)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-[var(--border-color)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--color-dev)]">{stats.completionPercentage}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Card className="rounded-3xl border-[var(--border-color)] hover:border-[var(--color-dev)]/50 transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Icon className={`h-6 w-6 ${action.color}`} />
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Task Status Breakdown */}
      <Card className="rounded-3xl border-[var(--border-color)]">
        <CardHeader>
          <CardTitle>Task Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">To Do</span>
              <span className="font-semibold">{stats.todo}</span>
            </div>
            <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2">
              <div 
                className="bg-gray-400 h-2 rounded-full transition-all" 
                style={{ width: `${stats.total > 0 ? (stats.todo / stats.total) * 100 : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">In Progress</span>
              <span className="font-semibold">{stats.inProgress}</span>
            </div>
            <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all" 
                style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Testing</span>
              <span className="font-semibold">{stats.testing}</span>
            </div>
            <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all" 
                style={{ width: `${stats.total > 0 ? (stats.testing / stats.total) * 100 : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="font-semibold">{stats.completed}</span>
            </div>
            <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all" 
                style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}