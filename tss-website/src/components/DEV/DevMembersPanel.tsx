"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserPlus,
  Trash2,
  Shield,
  Crown,
  User,
  Code,
  Bug,
  Eye,
  Mail,
  Clock,
  X,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { DevProjectRole, ProjectPermissions, DevProjectInvite, InviteStatus } from "@/lib/types/dev-types";

const roleIcons: Record<DevProjectRole, LucideIcon> = {
  owner: Crown,
  admin: Shield,
  developer: Code,
  tester: Bug,
  viewer: Eye,
};

const roleColors: Record<DevProjectRole, string> = {
  owner: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  admin: "bg-red-500/20 text-red-700 border-red-500/30",
  developer: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  tester: "bg-purple-500/20 text-purple-700 border-purple-500/30",
  viewer: "bg-gray-500/20 text-gray-700 border-gray-500/30",
};

const inviteStatusColors: Record<InviteStatus, string> = {
  pending: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  accepted: "bg-green-500/20 text-green-700 border-green-500/30",
  rejected: "bg-red-500/20 text-red-700 border-red-500/30",
  expired: "bg-gray-500/20 text-gray-700 border-gray-500/30",
  cancelled: "bg-orange-500/20 text-orange-700 border-orange-500/30",
};

export function DevMembersPanel() {
  const { members, activeProject, getUserRole, updateMember, removeMember } = useDevProject();
  const [invites, setInvites] = useState<DevProjectInvite[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteRole, setNewInviteRole] = useState<DevProjectRole>("viewer");
  const [isSending, setIsSending] = useState(false);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);

  const currentUserRole = getUserRole();
  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';

  // Fetch invites when component mounts
  useEffect(() => {
    if (activeProject && canManageMembers) {
      fetchInvites();
    }
  }, [activeProject, canManageMembers]);

  const fetchInvites = async () => {
    if (!activeProject) return;
    try {
      const response = await fetch(`/api/dev/invites?projectId=${activeProject.id}`);
      if (response.ok) {
        const data = await response.json();
        setInvites(data);
      }
    } catch (error) {
      console.error("Failed to fetch invites:", error);
    }
  };

  const handleSendInvite = async () => {
    if (!newInviteEmail.trim() || !activeProject) return;
    
    setIsSending(true);
    try {
      const response = await fetch("/api/dev/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: activeProject.id,
          email: newInviteEmail,
          role: newInviteRole,
        }),
      });

      if (response.ok) {
        setNewInviteEmail("");
        setNewInviteRole("viewer");
        setIsOpen(false);
        await fetchInvites();
      } else {
        const error = await response.json().catch(() => ({ error: "Failed to send invite" }));
        alert(error.error || "Failed to send invite");
      }
    } catch (error) {
      console.error("Failed to send invite:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelInvite = async (inviteId: number) => {
    try {
      const response = await fetch(`/api/dev/invites/${inviteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      if (response.ok) {
        await fetchInvites();
      }
    } catch (error) {
      console.error("Failed to cancel invite:", error);
    }
  };

  const handleRoleChange = async (memberId: number, newRole: DevProjectRole) => {
    try {
      await updateMember(memberId, { role: newRole });
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    
    try {
      await removeMember(memberId);
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const handlePermissionToggle = async (memberId: number, permission: keyof ProjectPermissions, value: boolean) => {
    try {
      const member = members.find((m) => m.id === memberId);
      if (!member) return;

      const updatedPermissions = {
        ...member.permissions,
        [permission]: value,
      };

      await updateMember(memberId, {
        permissions: updatedPermissions,
        keep_custom_permissions: true
      });
    } catch (error) {
      console.error("Failed to update permissions:", error);
    }
  };

  const handleResetToDefaultPermissions = async (memberId: number) => {
    try {
      const member = members.find((m) => m.id === memberId);
      if (!member) return;

      // Get default permissions for the role
      const defaultPermissions: ProjectPermissions = {
        view_project: true,
        edit_project: member.role === 'owner' || member.role === 'admin' || member.role === 'developer',
        manage_tasks: member.role === 'owner' || member.role === 'admin' || member.role === 'developer',
        manage_kanban: member.role === 'owner' || member.role === 'admin' || member.role === 'developer',
        manage_files: member.role !== 'viewer' && member.role !== 'tester',
        manage_description: member.role === 'owner' || member.role === 'admin' || member.role === 'developer',
        manage_roadmap: member.role !== 'viewer' && member.role !== 'developer',
        manage_technologies: member.role !== 'viewer' && member.role !== 'tester',
        manage_members: member.role === 'owner' || member.role === 'admin',
        manage_settings: member.role === 'owner' || member.role === 'admin',
        delete_project: member.role === 'owner',
      };

      await updateMember(memberId, { permissions: defaultPermissions });
    } catch (error) {
      console.error("Failed to reset permissions:", error);
    }
  };

  if (!canManageMembers) {
    return (
      <Card className="rounded-3xl border-[var(--border-color)] bg-white text-black">
        <CardHeader>
          <CardTitle>Project Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You don't have permission to manage members.
          </p>
          <div className="mt-4 space-y-2">
            {members.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No members in this project
              </div>
            ) : (
              members.map((member) => {
                const RoleIcon = roleIcons[member.role];
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-dev)]/20 flex items-center justify-center">
                        <User size={16} className="text-[var(--color-dev)]" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{member.username || member.user_id}</p>
                        <Badge className={`text-xs ${roleColors[member.role]}`}>
                          <RoleIcon size={12} className="mr-1" />
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingInvites = invites.filter(i => i.status === 'pending');

  return (
    <Card className="rounded-3xl border-[var(--border-color)] bg-white text-black">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Management</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-2xl">
              <UserPlus className="mr-2 h-4 w-4" />
              Send Invite
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl bg-white text-black">
            <DialogHeader>
              <DialogTitle>Send Team Invite</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newInviteEmail}
                  onChange={(e) => setNewInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newInviteRole} onValueChange={(val) => setNewInviteRole(val as DevProjectRole)}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="tester">Tester</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSendInvite} disabled={isSending} className="w-full rounded-2xl">
                {isSending ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
            <TabsTrigger value="invites">Invites ({pendingInvites.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="space-y-2 mt-4">
            {members.map((member) => {
              const RoleIcon = roleIcons[member.role];
              const isOwner = member.role === 'owner';
              const isCurrentUser = member.user_id === activeProject?.owner_id;
              
              return (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-dev)]/20 flex items-center justify-center">
                      {member.avatar_url ? (
                        <img 
                          src={member.avatar_url} 
                          alt={member.username || ''} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-[var(--color-dev)]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.username || member.user_id}</p>
                      <Badge className={`text-xs ${roleColors[member.role]}`}>
                        <RoleIcon size={12} className="mr-1" />
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  
                  {!isOwner && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={member.role}
                        onValueChange={(val) => handleRoleChange(member.id, val as DevProjectRole)}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="tester">Tester</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedMember(member.id);
                          setIsPermissionsDialogOpen(true);
                        }}
                      >
                        <Settings size={16} />
                      </Button>
                      {!isCurrentUser && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-xl"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            
            {members.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No members yet. Send your first invite!
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="invites" className="space-y-2 mt-4">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-dev)]/20 flex items-center justify-center">
                    <Mail size={16} className="text-[var(--color-dev)]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{invite.email}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${roleColors[invite.role]}`}>
                        {invite.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-xl"
                  onClick={() => handleCancelInvite(invite.id)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            
            {pendingInvites.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No pending invites.
              </p>
            )}
          </TabsContent>
        </Tabs>

        {/* Permissions Dialog */}
        <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
          <DialogContent className="rounded-3xl bg-white text-black max-w-md">
            <DialogHeader>
              <DialogTitle>Custom Permissions</DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {Object.keys(members.find((m) => m.id === selectedMember)?.permissions || {}).map((perm) => (
                    <div key={perm} className="flex items-center justify-between">
                      <Label className="text-sm capitalize">{perm.replace(/_/g, ' ')}</Label>
                      <Switch
                        checked={members.find((m) => m.id === selectedMember)?.permissions[perm as keyof ProjectPermissions]}
                        onCheckedChange={(checked) => handlePermissionToggle(selectedMember, perm as keyof ProjectPermissions, checked)}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-2xl"
                    onClick={() => handleResetToDefaultPermissions(selectedMember)}
                  >
                    Reset to Default
                  </Button>
                  <Button
                    onClick={() => setIsPermissionsDialogOpen(false)}
                    className="flex-1 rounded-2xl"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
