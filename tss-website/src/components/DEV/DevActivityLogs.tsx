"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  UserPlus, 
  UserMinus, 
  Shield, 
  FileText, 
  CheckSquare, 
  Map, 
  Cpu,
  Settings,
  Archive,
  Trash2,
  Mail,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import type { DevActivityLog } from "@/lib/types/dev-types";

const actionIcons: Record<string, any> = {
  project_created: Settings,
  project_updated: Settings,
  project_archived: Archive,
  project_restored: Archive,
  project_deleted: Trash2,
  member_added: UserPlus,
  member_removed: UserMinus,
  member_role_changed: Shield,
  member_permissions_changed: Shield,
  invite_sent: Mail,
  invite_accepted: UserPlus,
  invite_rejected: X,
  invite_cancelled: X,
  task_created: CheckSquare,
  task_updated: CheckSquare,
  task_deleted: Trash2,
  task_status_changed: CheckSquare,
  phase_created: Map,
  phase_updated: Map,
  phase_deleted: Trash2,
  file_uploaded: FileText,
  file_deleted: Trash2,
  technology_added: Cpu,
  technology_updated: Cpu,
  technology_deleted: Trash2,
  description_updated: FileText,
  settings_updated: Settings,
};

const actionColors: Record<string, string> = {
  project_created: "bg-green-500/20 text-green-700 border-green-500/30",
  project_updated: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  project_archived: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  project_restored: "bg-green-500/20 text-green-700 border-green-500/30",
  project_deleted: "bg-red-500/20 text-red-700 border-red-500/30",
  member_added: "bg-green-500/20 text-green-700 border-green-500/30",
  member_removed: "bg-red-500/20 text-red-700 border-red-500/30",
  member_role_changed: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  member_permissions_changed: "bg-purple-500/20 text-purple-700 border-purple-500/30",
  invite_sent: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  invite_accepted: "bg-green-500/20 text-green-700 border-green-500/30",
  invite_rejected: "bg-red-500/20 text-red-700 border-red-500/30",
  invite_cancelled: "bg-orange-500/20 text-orange-700 border-orange-500/30",
  task_created: "bg-green-500/20 text-green-700 border-green-500/30",
  task_updated: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  task_deleted: "bg-red-500/20 text-red-700 border-red-500/30",
  task_status_changed: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  phase_created: "bg-green-500/20 text-green-700 border-green-500/30",
  phase_updated: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  phase_deleted: "bg-red-500/20 text-red-700 border-red-500/30",
  file_uploaded: "bg-green-500/20 text-green-700 border-green-500/30",
  file_deleted: "bg-red-500/20 text-red-700 border-red-500/30",
  technology_added: "bg-green-500/20 text-green-700 border-green-500/30",
  technology_updated: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  technology_deleted: "bg-red-500/20 text-red-700 border-red-500/30",
  description_updated: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  settings_updated: "bg-purple-500/20 text-purple-700 border-purple-500/30",
};

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function DevActivityLogs() {
  const { activeProject } = useDevProject();
  const [logs, setLogs] = useState<DevActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeProject) {
      fetchLogs();
    }
  }, [activeProject]);

  const fetchLogs = async () => {
    if (!activeProject) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/dev/activity?projectId=${activeProject.id}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeProject) {
    return null;
  }

  return (
    <Card className="rounded-3xl border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text)]">
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-dev)]" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity yet.
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {logs.map((log) => {
                const ActionIcon = actionIcons[log.action] || Settings;
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-dev)]/20 flex items-center justify-center shrink-0">
                      <ActionIcon size={16} className="text-[var(--color-dev)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {log.username || 'Unknown User'}
                        </span>
                        <Badge className={`text-xs ${actionColors[log.action] || 'bg-gray-500/20 text-gray-700'}`}>
                          {formatAction(log.action)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {log.details && Object.keys(log.details).length > 0 
                          ? Object.entries(log.details).map(([key, value]) => 
                              `${key}: ${value}`).join(', ')
                          : log.entity_type 
                          ? `${log.entity_type} ${log.entity_id ? `#${log.entity_id}` : ''}`
                          : ''
                        }
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock size={12} />
                        {formatTime(log.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
