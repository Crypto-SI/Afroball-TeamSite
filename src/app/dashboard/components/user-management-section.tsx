"use client";

import { useState } from "react";
import type { Database } from "@/types/database";
import { ROLE_LABELS, type UserRole } from "@/lib/dashboard-config";
import {
  CreateUserRequestSchema,
  getCreateUserValidationMessage,
} from "@/lib/admin-create-user-schema";
import type { SupabaseClient, DashboardMode } from "../types";
import { getMutationErrorMessage, updateUserRole } from "../dashboard-mutations";
import { CreateUserDialog, UsersTable } from "./user-management-ui";

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

    const parsed = CreateUserRequestSchema.safeParse({
      email: newEmail,
      password: newPassword,
      full_name: newFullName.trim() || null,
      role: newRole,
    });

    if (!parsed.success) {
      setCreateError(getCreateUserValidationMessage(parsed.error));
      return;
    }

    if (mode !== "live" || !supabaseRef.current) {
      const profile: ProfileRow = {
        id: createDemoId("user"),
        full_name: parsed.data.full_name || parsed.data.email,
        role: parsed.data.role,
        created_at: new Date().toISOString(),
      };
      setProfiles([profile, ...profiles]);
      setStatusMessage(`User ${parsed.data.email} created locally in demo mode.`);
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
        body: JSON.stringify(parsed.data),
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
    } catch {
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase sm:text-3xl">User Management</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Manage registered users and their roles.
          </p>
        </div>

        <CreateUserDialog
          email={newEmail}
          error={createError}
          fullName={newFullName}
          isCreating={isCreating}
          onEmailChange={setNewEmail}
          onFullNameChange={setNewFullName}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetDialogForm();
          }}
          onPasswordChange={setNewPassword}
          onRoleChange={setNewRole}
          onSubmit={handleCreateUser}
          password={newPassword}
          role={newRole}
        />
      </div>

      <UsersTable
        isSaving={isSaving}
        onRoleChange={handleRoleChange}
        profiles={profiles}
      />
    </div>
  );
}

function createDemoId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
