"use client";

import { useState } from "react";
import { Loader2, Plus, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from "@/types/database";
import { ROLE_LABELS, type UserRole } from "@/lib/dashboard-config";
import type { SupabaseClient, DashboardMode } from "../types";
import { getMutationErrorMessage, updateUserRole } from "../dashboard-mutations";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type Props = {
  profiles: ProfileRow[];
  mode: DashboardMode;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  setStatusMessage: (m: string | null) => void;
  setProfiles: (p: ProfileRow[]) => void;
  supabaseRef: React.MutableRefObject<SupabaseClient | null>;
  onRefresh: () => Promise<void>;
};

const AVAILABLE_ROLES: UserRole[] = ["admin", "club", "creator", "player", "fan"];

export function UserManagementSection({
  profiles,
  mode,
  isSaving,
  setIsSaving,
  setStatusMessage,
  setProfiles,
  supabaseRef,
  onRefresh,
}: Props) {
  // ── Create User Dialog State ──────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("fan");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // ── Role Change Handler ───────────────────────────────────────────────────

  async function handleRoleChange(userId: string, newRole: string) {
    if (mode !== "live" || !supabaseRef.current) {
      setStatusMessage("Role updated (demo mode).");
      setProfiles(
        profiles.map((p) =>
          p.id === userId ? { ...p, role: newRole as ProfileRow["role"] } : p
        )
      );
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await updateUserRole(
        supabaseRef.current,
        userId,
        newRole as ProfileRow["role"]
      );

      if (error) {
        setStatusMessage(error.message);
        return;
      }

      setProfiles(
        profiles.map((p) =>
          p.id === userId ? { ...p, role: newRole as ProfileRow["role"] } : p
        )
      );
      setStatusMessage(`User role updated to ${newRole}.`);
    } catch (error) {
      setStatusMessage(getMutationErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  // ── Create User Handler ───────────────────────────────────────────────────

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    // Client-side validation
    if (!newEmail.trim() || !newEmail.includes("@")) {
      setCreateError("Please enter a valid email address.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setCreateError("Password must be at least 6 characters.");
      return;
    }

    if (mode !== "live" || !supabaseRef.current) {
      const profile: ProfileRow = {
        id: createDemoId("user"),
        full_name: newFullName.trim() || newEmail.trim(),
        role: newRole,
        created_at: new Date().toISOString(),
      };
      setProfiles([profile, ...profiles]);
      setStatusMessage(`User ${newEmail.trim()} created locally in demo mode.`);
      setNewEmail("");
      setNewPassword("");
      setNewFullName("");
      setNewRole("fan");
      setCreateError(null);
      setDialogOpen(false);
      return;
    }

    setIsCreating(true);

    try {
      // Verify the user is authenticated before making the API call
      const { data: { session } } = await supabaseRef.current.auth.getSession();
      if (!session) {
        setCreateError("Not authenticated. Please sign in again.");
        setIsCreating(false);
        return;
      }

      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newEmail.trim(),
          password: newPassword,
          full_name: newFullName.trim() || null,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || "Failed to create user.");
        setIsCreating(false);
        return;
      }

      // Success — refresh data and close dialog
      setStatusMessage(
        `User ${data.user.email} created successfully with role ${ROLE_LABELS[newRole]}.${data.warning ? ` Warning: ${data.warning}` : ""}`
      );

      // Reset form
      setNewEmail("");
      setNewPassword("");
      setNewFullName("");
      setNewRole("fan");
      setCreateError(null);
      setDialogOpen(false);

      // Refresh profiles
      await onRefresh();
    } catch (err) {
      setCreateError("An unexpected error occurred. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  function resetDialogForm() {
    setNewEmail("");
    setNewPassword("");
    setNewFullName("");
    setNewRole("fan");
    setCreateError(null);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  // Map legacy roles for display
  function displayRole(role: string): string {
    return ROLE_LABELS[role as UserRole] ?? role;
  }

  function roleBadgeVariant(role: string): "default" | "secondary" | "outline" | "destructive" {
    switch (role) {
      case "admin":
      case "owner":
        return "destructive";
      case "club":
      case "editor":
        return "default";
      case "creator":
        return "secondary";
      default:
        return "outline";
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase sm:text-3xl">User Management</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Manage registered users and their roles.
          </p>
        </div>

        {/* ── Create New User Button + Dialog ─────────────────────────────── */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetDialogForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="uppercase font-black">
                Create New Account
              </DialogTitle>
              <DialogDescription>
                Create a new user account. The user will be able to sign in
                immediately with the email and password you set.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="new-email">Email *</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  disabled={isCreating}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password">Password *</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isCreating}
                />
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="new-fullname">Full Name</Label>
                <Input
                  id="new-fullname"
                  type="text"
                  placeholder="John Doe"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  disabled={isCreating}
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="new-role">Role *</Label>
                <select
                  id="new-role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  disabled={isCreating}
                >
                  {AVAILABLE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error message */}
              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} className="gap-2">
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Users Table ──────────────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold">{profile.full_name || "Unnamed User"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant(profile.role)}>
                        {displayRole(profile.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <select
                        className="h-8 rounded border bg-background px-2 text-xs"
                        disabled={isSaving}
                        onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                        value={profile.role}
                      >
                        {AVAILABLE_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>
                ))}
                {profiles.length === 0 && (
                  <TableRow>
                    <TableCell className="py-12 text-center text-muted-foreground italic" colSpan={4}>
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function createDemoId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
