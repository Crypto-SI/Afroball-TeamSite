"use client";

import { useState } from "react";
import { ShieldCheck, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type Props = {
  profiles: ProfileRow[];
  mode: DashboardMode;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  setStatusMessage: (m: string | null) => void;
  setProfiles: (p: ProfileRow[]) => void;
  supabaseRef: React.MutableRefObject<SupabaseClient | null>;
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
}: Props) {
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
    const { error } = await supabaseRef.current
      .from("profiles")
      .update({ role: newRole as Database["public"]["Tables"]["profiles"]["Update"]["role"] })
      .eq("id", userId);
    setIsSaving(false);

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
  }

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
      <div>
        <h2 className="text-2xl font-black uppercase sm:text-3xl">User Management</h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Manage registered users and their roles.
        </p>
      </div>

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
