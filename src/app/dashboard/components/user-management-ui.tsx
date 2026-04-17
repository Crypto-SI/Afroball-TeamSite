"use client";

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
import { EmptyTableRow } from "./dashboard-section-ui";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  error: string | null;
  isCreating: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onRoleChange: (role: UserRole) => void;
  onSubmit: (event: React.FormEvent) => void;
};

const AVAILABLE_ROLES: UserRole[] = ["admin", "club", "creator", "player", "fan"];

export function CreateUserDialog({
  open,
  onOpenChange,
  email,
  password,
  fullName,
  role,
  error,
  isCreating,
  onEmailChange,
  onPasswordChange,
  onFullNameChange,
  onRoleChange,
  onSubmit,
}: CreateUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="uppercase font-black">Create New Account</DialogTitle>
          <DialogDescription>
            Create a new user account. The user will be able to sign in immediately with the email and password you set.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-email">Email *</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Password *</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              minLength={6}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-fullname">Full Name</Label>
            <Input
              id="new-fullname"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-role">Role *</Label>
            <select
              id="new-role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={role}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              disabled={isCreating}
            >
              {AVAILABLE_ROLES.map((availableRole) => (
                <option key={availableRole} value={availableRole}>
                  {ROLE_LABELS[availableRole]}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
  );
}

type UsersTableProps = {
  profiles: ProfileRow[];
  isSaving: boolean;
  onRoleChange: (userId: string, role: string) => void;
};

export function UsersTable({ profiles, isSaving, onRoleChange }: UsersTableProps) {
  return (
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
                      onChange={(e) => onRoleChange(profile.id, e.target.value)}
                      value={profile.role}
                    >
                      {AVAILABLE_ROLES.map((availableRole) => (
                        <option key={availableRole} value={availableRole}>
                          {ROLE_LABELS[availableRole]}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                </TableRow>
              ))}
              {profiles.length === 0 && (
                <EmptyTableRow colSpan={4}>No users found.</EmptyTableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

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
