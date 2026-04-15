"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import type { StaffMember } from "@/lib/team-site-data";
import type { SupabaseClient, DashboardMode } from "../types";

type Props = {
  staff: StaffMember[];
  canEdit: boolean;
  mode: DashboardMode;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  setStatusMessage: (m: string | null) => void;
  onRefresh: () => Promise<void>;
  supabaseRef: React.MutableRefObject<SupabaseClient | null>;
};

export function StaffSection({
  staff,
  canEdit: canCrud,
  mode,
  isSaving,
  setIsSaving,
  setStatusMessage,
  onRefresh,
  supabaseRef,
}: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [sName, setSName] = useState("");
  const [sRole, setSRole] = useState("");
  const [sBio, setSBio] = useState("");
  const [sImageUrl, setSImageUrl] = useState("");

  async function handleAdd() {
    if (!sName || !sRole) {
      setStatusMessage("Staff name and role are required.");
      return;
    }

    if (mode !== "live" || !supabaseRef.current) {
      setStatusMessage("Staff member added (demo mode).");
      closeDialog();
      return;
    }

    setIsSaving(true);
    const { error } = await supabaseRef.current.from("staff").insert({
      name: sName,
      role: sRole,
      bio: sBio || null,
      image_url: sImageUrl || null,
      is_active: true,
    });
    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    closeDialog();
    await onRefresh();
  }

  async function handleDelete(id: string) {
    if (mode !== "live" || !supabaseRef.current) {
      setStatusMessage("Staff member removed (demo mode).");
      return;
    }

    setIsSaving(true);
    const { error } = await supabaseRef.current.from("staff").delete().eq("id", id);
    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }
    await onRefresh();
  }

  function closeDialog() {
    setIsAddOpen(false);
    setSName("");
    setSRole("");
    setSBio("");
    setSImageUrl("");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black uppercase sm:text-3xl">Staff</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {canCrud ? "Manage coaching and administrative roles." : "View coaching and administrative staff."}
          </p>
        </div>
        {canCrud && (
          <Dialog onOpenChange={setIsAddOpen} open={isAddOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-accent font-bold text-accent-foreground sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Staff Member</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input onChange={(e) => setSName(e.target.value)} value={sName} />
                </div>
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <Input onChange={(e) => setSRole(e.target.value)} value={sRole} />
                </div>
                <div className="grid gap-2">
                  <Label>Image URL</Label>
                  <Input onChange={(e) => setSImageUrl(e.target.value)} placeholder="https://..." value={sImageUrl} />
                </div>
                <div className="grid gap-2">
                  <Label>Bio</Label>
                  <Textarea onChange={(e) => setSBio(e.target.value)} value={sBio} />
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full font-bold" disabled={isSaving} onClick={handleAdd}>
                  {isSaving ? "Saving..." : "Save Member"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Img</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  {canCrud && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-accent/20 bg-muted">
                        <Image
                          alt={member.name}
                          className="object-cover"
                          fill
                          sizes="40px"
                          src={member.imageUrl || "https://picsum.photos/seed/staff-fallback/400/500"}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">{member.name}</TableCell>
                    <TableCell className="text-xs font-semibold uppercase tracking-wider text-accent sm:text-sm">
                      {member.role}
                    </TableCell>
                    {canCrud && (
                      <TableCell className="text-right">
                        <Button
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(member.id)}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
