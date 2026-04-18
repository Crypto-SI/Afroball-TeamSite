"use client";

import { useState, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Pencil,
  Eye,
  EyeOff,
  FolderOpen,
  Copy,
  Save,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import type { SupabaseClient, DashboardMode } from "../types";

type Submission = Database["public"]["Tables"]["player_submissions"]["Row"];
type SubmissionUpdate = Database["public"]["Tables"]["player_submissions"]["Update"];

type Props = {
  mode: DashboardMode;
  supabaseRef: React.MutableRefObject<SupabaseClient | null>;
  setStatusMessage: (m: string | null) => void;
  registrationOpen?: boolean;
  onToggleRegistration?: (open: boolean) => void;
  gatePassword?: string | null;
  onUpdateGatePassword?: (password: string) => Promise<void>;
};

const POSITIONS = [
  "GK", "CB", "LB", "RB", "LWB", "RWB",
  "CDM", "CM", "CAM", "LM", "RM",
  "LW", "RW", "CF", "ST",
];

export function SubmissionsSection({
  mode,
  supabaseRef,
  setStatusMessage,
  registrationOpen,
  onToggleRegistration,
  gatePassword,
  onUpdateGatePassword,
}: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  // Settings tab state
  const [settingsPassword, setSettingsPassword] = useState(gatePassword ?? "");
  const [showSettingsPassword, setShowSettingsPassword] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Sync settingsPassword with gatePassword prop
  useEffect(() => {
    setSettingsPassword(gatePassword ?? "");
  }, [gatePassword]);

  const registrationUrl = typeof window !== "undefined" ? `${window.location.origin}/register` : "/register";

  const handleSaveSettings = async () => {
    if (!onUpdateGatePassword) return;
    setIsSavingSettings(true);
    try {
      await onUpdateGatePassword(settingsPassword);
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(registrationUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Fallback
      setStatusMessage("Failed to copy URL to clipboard.");
    }
  };

  // Edit dialog state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPos, setEditPos] = useState("");
  const [editSecondPos, setEditSecondPos] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editSquadNumber, setEditSquadNumber] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // View dialog state
  const [viewSubmission, setViewSubmission] = useState<Submission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [showViewPassword, setShowViewPassword] = useState(false);

  // Reject dialog state
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  // Processing state
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    const supabase = supabaseRef.current;
    if (!supabase) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("player_submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      setStatusMessage(`Failed to load submissions: ${error.message}`);
    } else {
      setSubmissions(data || []);
    }
    setIsLoading(false);
  }, [supabaseRef, setStatusMessage]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const pending = submissions.filter((s) => s.status === "pending");
  const approved = submissions.filter((s) => s.status === "approved");
  const rejected = submissions.filter((s) => s.status === "rejected");

  // ── Edit handler ────────────────────────────────────────────────────────
  const openEdit = (s: Submission) => {
    setEditId(s.id);
    setEditName(s.name);
    setEditPos(s.pos);
    setEditSecondPos(s.second_pos ?? "");
    setEditHeight(s.height ?? "");
    setEditSquadNumber(s.squad_number?.toString() ?? "");
    setEditPassword(s.proposed_password ?? "");
    setEditDialogOpen(true);
  };

  const openView = (s: Submission) => {
    setViewSubmission(s);
    setShowViewPassword(false);
    setViewDialogOpen(true);
  };

  const handleEditSave = async () => {
    const supabase = supabaseRef.current;
    if (!supabase || !editId) return;

    const update: SubmissionUpdate = {
      name: editName,
      pos: editPos,
      second_pos: editSecondPos || null,
      height: editHeight || null,
      squad_number: editSquadNumber ? parseInt(editSquadNumber, 10) : null,
    };

    // Only include password if it was changed and is valid
    if (editPassword && editPassword.length >= 6) {
      update.proposed_password = editPassword;
    }

    const { error } = await supabase
      .from("player_submissions")
      .update(update)
      .eq("id", editId);

    if (error) {
      setStatusMessage(`Edit failed: ${error.message}`);
    } else {
      setStatusMessage("Submission updated.");
      setEditDialogOpen(false);
      fetchSubmissions();
    }
  };

  // ── Approve handler ─────────────────────────────────────────────────────
  const handleApprove = async (submissionId: string) => {
    setProcessingId(submissionId);
    try {
      const supabase = supabaseRef.current;
      if (!supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatusMessage("Not authenticated.");
        return;
      }

      // edited_fields are only sent when the edit dialog is open for this submission
      // (i.e. the user explicitly saved edits before approving)
      const editedFields = undefined;

      const res = await fetch("/api/admin/approve-submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          submission_id: submissionId,
          edited_fields: editedFields,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setStatusMessage(`Approval failed: ${result.error}`);
        return;
      }

      setStatusMessage(
        `Approved! Player account created for ${result.player?.name || "player"}.`
      );
      fetchSubmissions();
    } catch (err) {
      setStatusMessage("Approval failed unexpectedly.");
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  // ── Reject handler ──────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectId) return;
    setProcessingId(rejectId);
    try {
      const supabase = supabaseRef.current;
      if (!supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatusMessage("Not authenticated.");
        return;
      }

      const res = await fetch("/api/admin/reject-submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          submission_id: rejectId,
          reviewer_notes: rejectNotes || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setStatusMessage(`Rejection failed: ${result.error}`);
        return;
      }

      setStatusMessage("Submission rejected.");
      setRejectDialogOpen(false);
      setRejectNotes("");
      setRejectId(null);
      fetchSubmissions();
    } catch (err) {
      setStatusMessage("Rejection failed unexpectedly.");
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  // ── Reset edit state when dialog closes ────────────────────────────────
  const resetEditState = useCallback(() => {
    setEditId(null);
    setEditName("");
    setEditPos("");
    setEditSecondPos("");
    setEditHeight("");
    setEditSquadNumber("");
    setEditPassword("");
  }, []);

  // ── Submission Card ─────────────────────────────────────────────────────
  const SubmissionCard = memo(function SubmissionCard({
    s,
    processingId,
    onEdit,
    onApprove,
    onReject,
    onView,
  }: {
    s: Submission;
    processingId: string | null;
    onEdit: (s: Submission) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onView: (s: Submission) => void;
  }) {
    return (
    <Card className="border-accent/10 bg-card/50">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          {s.image_url ? (
            <div className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden border-2 border-accent/20">
              <Image
                src={s.image_url}
                alt={s.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-16 w-16 shrink-0 rounded-full bg-muted border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground text-xs">
              No img
            </div>
          )}

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold truncate">{s.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {s.pos}{s.second_pos ? ` / ${s.second_pos}` : ""}
                  {s.height ? ` · ${s.height}` : ""}
                  {s.squad_number ? ` · #${s.squad_number}` : ""}
                </p>
              </div>
              <Badge
                variant={
                  s.status === "pending"
                    ? "secondary"
                    : s.status === "approved"
                    ? "default"
                    : "destructive"
                }
                className="shrink-0"
              >
                {s.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                {s.status === "approved" && <CheckCircle className="mr-1 h-3 w-3" />}
                {s.status === "rejected" && <XCircle className="mr-1 h-3 w-3" />}
                {s.status}
              </Badge>
            </div>

            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {s.email && <span>📧 {s.email}</span>}
              {s.phone && <span>📱 {s.phone}</span>}
              <span>📅 {new Date(s.submitted_at).toLocaleDateString()}</span>
            </div>

            {s.reviewer_notes && (
              <p className="mt-1 text-xs text-muted-foreground italic">
                Note: {s.reviewer_notes}
              </p>
            )}

            {/* Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(s)}
              >
                <FolderOpen className="mr-1 h-3 w-3" />
                Open
              </Button>
              {s.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(s)}
                    disabled={processingId === s.id}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(s.id)}
                    disabled={processingId === s.id}
                  >
                    {processingId === s.id ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(s.id)}
                    disabled={processingId === s.id}
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    );
  });

  // ── Render ──────────────────────────────────────────────────────────────

  if (mode === "mock") {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-black uppercase sm:text-3xl">Player Submissions</h2>
        <Card className="border-accent/10 bg-card/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            Player submissions require a live Supabase connection.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase sm:text-3xl">Player Submissions</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Review and approve player registration requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onToggleRegistration && registrationOpen !== undefined && (
            <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
              <Label htmlFor="reg-toggle" className="text-xs font-medium cursor-pointer">
                Registration
              </Label>
              <Switch
                id="reg-toggle"
                checked={registrationOpen}
                onCheckedChange={onToggleRegistration}
              />
              <Badge variant={registrationOpen ? "default" : "secondary"} className="text-xs">
                {registrationOpen ? "Open" : "Closed"}
              </Badge>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={fetchSubmissions} disabled={isLoading}>
            <RefreshCw className={`mr-1 h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
            {pending.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                {pending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </TabsTrigger>
          {registrationOpen && (
            <TabsTrigger value="settings" className="gap-1">
              <Settings className="h-3 w-3" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : pending.length === 0 ? (
            <Card className="border-accent/10 bg-card/50">
              <CardContent className="py-12 text-center text-muted-foreground">
                No pending submissions. Players can register at /register when registration is open.
              </CardContent>
            </Card>
          ) : (
            pending.map((s) => (
              <SubmissionCard
                key={s.id}
                s={s}
                processingId={processingId}
                onEdit={openEdit}
                onApprove={handleApprove}
                onReject={(id) => { setRejectId(id); setRejectDialogOpen(true); }}
                onView={openView}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : approved.length === 0 ? (
            <Card className="border-accent/10 bg-card/50">
              <CardContent className="py-12 text-center text-muted-foreground">
                No approved submissions yet.
              </CardContent>
            </Card>
          ) : (
            approved.map((s) => (
              <SubmissionCard
                key={s.id}
                s={s}
                processingId={processingId}
                onEdit={openEdit}
                onApprove={handleApprove}
                onReject={(id) => { setRejectId(id); setRejectDialogOpen(true); }}
                onView={openView}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : rejected.length === 0 ? (
            <Card className="border-accent/10 bg-card/50">
              <CardContent className="py-12 text-center text-muted-foreground">
                No rejected submissions.
              </CardContent>
            </Card>
          ) : (
            rejected.map((s) => (
              <SubmissionCard
                key={s.id}
                s={s}
                processingId={processingId}
                onEdit={openEdit}
                onApprove={handleApprove}
                onReject={(id) => { setRejectId(id); setRejectDialogOpen(true); }}
                onView={openView}
              />
            ))
          )}
        </TabsContent>

        {/* Settings Tab — only when registration is open */}
        {registrationOpen && (
          <TabsContent value="settings" className="mt-4 space-y-4">
            <Card className="border-accent/10 bg-card/50">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-accent">
                  Registration Link
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p className="text-xs text-muted-foreground">
                  Share this URL with prospective players so they can submit their details.
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={registrationUrl}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyUrl}
                    className="shrink-0"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    {copiedUrl ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/10 bg-card/50">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-accent">
                  Gate Password
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p className="text-xs text-muted-foreground">
                  Players must enter this password to access the registration form. Share it in-person with prospective players. Leave empty to remove the password requirement.
                </p>
                <div className="relative">
                  <Input
                    type={showSettingsPassword ? "text" : "password"}
                    placeholder="Enter gate password..."
                    value={settingsPassword}
                    onChange={(e) => setSettingsPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowSettingsPassword(!showSettingsPassword)}
                  >
                    {showSettingsPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <Button
                  className="bg-accent font-bold text-accent-foreground"
                  disabled={isSavingSettings}
                  onClick={handleSaveSettings}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSavingSettings ? "Saving..." : "Save Password"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) resetEditState(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Submission</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Position</Label>
              <Select value={editPos} onValueChange={setEditPos}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Second Position</Label>
              <Select value={editSecondPos} onValueChange={setEditSecondPos}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None</SelectItem>
                  {POSITIONS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Height</Label>
              <Input value={editHeight} onChange={(e) => setEditHeight(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Squad Number</Label>
              <Input
                type="number"
                min={1}
                max={99}
                value={editSquadNumber}
                onChange={(e) => setEditSquadNumber(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Password {editPassword ? "" : "(not set)"}</Label>
              <Input
                type="password"
                placeholder="Min 6 characters"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank or unchanged to keep the existing password.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-accent text-accent-foreground" onClick={handleEditSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {viewSubmission && (
            <div className="grid gap-4">
              {/* Image & Name */}
              <div className="flex items-center gap-4">
                {viewSubmission.image_url ? (
                  <div className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden border-2 border-accent/20">
                    <Image
                      src={viewSubmission.image_url}
                      alt={viewSubmission.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 shrink-0 rounded-full bg-muted border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground text-xs">
                    No img
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold">{viewSubmission.name}</h3>
                  <Badge
                    variant={
                      viewSubmission.status === "pending"
                        ? "secondary"
                        : viewSubmission.status === "approved"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {viewSubmission.status}
                  </Badge>
                </div>
              </div>

              {/* Contact */}
              <div className="grid gap-1 text-sm">
                <p><span className="font-medium">Email:</span> {viewSubmission.email || "—"}</p>
                <p><span className="font-medium">Phone:</span> {viewSubmission.phone || "—"}</p>
              </div>

              {/* Playing Details */}
              <div className="grid gap-1 text-sm">
                <p><span className="font-medium">Position:</span> {viewSubmission.pos}{viewSubmission.second_pos ? ` / ${viewSubmission.second_pos}` : ""}</p>
                <p><span className="font-medium">Height:</span> {viewSubmission.height || "—"}</p>
                <p><span className="font-medium">Squad Number:</span> {viewSubmission.squad_number ?? "—"}</p>
              </div>

              {/* Password */}
              <div className="grid gap-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Password:</span>
                  <span className="font-mono text-xs">
                    {viewSubmission.proposed_password
                      ? (showViewPassword ? viewSubmission.proposed_password : "••••••••")
                      : "(cleared — already processed)"}
                  </span>
                  {viewSubmission.proposed_password && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setShowViewPassword(!showViewPassword)}
                    >
                      {showViewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid gap-1 text-sm text-muted-foreground">
                <p>Submitted: {new Date(viewSubmission.submitted_at).toLocaleString()}</p>
                {viewSubmission.reviewed_at && (
                  <p>Reviewed: {new Date(viewSubmission.reviewed_at).toLocaleString()}</p>
                )}
              </div>

              {/* Reviewer Notes */}
              {viewSubmission.reviewer_notes && (
                <div className="rounded-lg border p-3 text-sm">
                  <p className="font-medium mb-1">Reviewer Notes</p>
                  <p className="text-muted-foreground">{viewSubmission.reviewer_notes}</p>
                </div>
              )}

              {/* Linked records (approved) */}
              {(viewSubmission.created_player_id || viewSubmission.created_user_id) && (
                <div className="grid gap-1 text-xs text-muted-foreground">
                  {viewSubmission.created_player_id && (
                    <p>Player ID: {viewSubmission.created_player_id}</p>
                  )}
                  {viewSubmission.created_user_id && (
                    <p>User ID: {viewSubmission.created_user_id}</p>
                  )}
                </div>
              )}

              {/* Quick actions from view */}
              {viewSubmission.status === "pending" && (
                <div className="flex gap-2 justify-end border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewDialogOpen(false);
                      openEdit(viewSubmission);
                    }}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleApprove(viewSubmission.id);
                    }}
                    disabled={processingId === viewSubmission.id}
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setViewDialogOpen(false);
                      setRejectId(viewSubmission.id);
                      setRejectDialogOpen(true);
                    }}
                    disabled={processingId === viewSubmission.id}
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              Are you sure you want to reject this submission? This action cannot be undone.
            </div>
            <div className="grid gap-2">
              <Label>Notes (optional)</Label>
              <Input
                placeholder="Reason for rejection..."
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={processingId === rejectId}>
                {processingId === rejectId ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <XCircle className="mr-1 h-3 w-3" />
                )}
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
