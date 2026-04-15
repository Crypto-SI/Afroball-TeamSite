"use client";

import { useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from "@/types/database";
import type { SupabaseClient, DashboardMode } from "../types";

type PartnershipRow = Database["public"]["Tables"]["partnerships"]["Row"];

type Props = {
  partnerships: PartnershipRow[];
  canEdit: boolean;
  mode: DashboardMode;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  setStatusMessage: (m: string | null) => void;
  setPartnerships: (p: PartnershipRow[]) => void;
  supabaseRef: React.MutableRefObject<SupabaseClient | null>;
};

const TIER_COLORS: Record<string, string> = {
  platinum: "bg-slate-200 text-slate-800",
  gold: "bg-yellow-100 text-yellow-800",
  silver: "bg-gray-100 text-gray-800",
  bronze: "bg-orange-100 text-orange-800",
};

export function PartnershipsSection({
  partnerships,
  canEdit: canCrud,
  mode,
  isSaving,
  setIsSaving,
  setStatusMessage,
  setPartnerships,
  supabaseRef,
}: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [tier, setTier] = useState<string>("bronze");

  async function handleAdd() {
    if (!name) {
      setStatusMessage("Partner name is required.");
      return;
    }

    if (mode !== "live" || !supabaseRef.current) {
      setStatusMessage("Partner added (demo mode).");
      closeDialog();
      return;
    }

    setIsSaving(true);
    const { data, error } = await supabaseRef.current
      .from("partnerships")
      .insert({
        name,
        description: description || null,
        logo_url: logoUrl || null,
        website_url: websiteUrl || null,
        tier: tier as PartnershipRow["tier"],
        is_active: true,
      })
      .select();
    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    if (data) {
      setPartnerships([...partnerships, ...(data as PartnershipRow[])]);
    }
    closeDialog();
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    if (mode !== "live" || !supabaseRef.current) {
      setStatusMessage("Partner toggled (demo mode).");
      return;
    }

    setIsSaving(true);
    const { error } = await supabaseRef.current
      .from("partnerships")
      .update({ is_active: !currentActive, updated_at: new Date().toISOString() })
      .eq("id", id);
    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    setPartnerships(
      partnerships.map((p) => (p.id === id ? { ...p, is_active: !currentActive } : p))
    );
  }

  async function handleDelete(id: string) {
    if (mode !== "live" || !supabaseRef.current) {
      setPartnerships(partnerships.filter((p) => p.id !== id));
      return;
    }

    setIsSaving(true);
    const { error } = await supabaseRef.current.from("partnerships").delete().eq("id", id);
    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }
    setPartnerships(partnerships.filter((p) => p.id !== id));
  }

  function closeDialog() {
    setIsAddOpen(false);
    setName("");
    setDescription("");
    setLogoUrl("");
    setWebsiteUrl("");
    setTier("bronze");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black uppercase sm:text-3xl">Partnerships</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {canCrud ? "Manage sponsors and partners." : "View our sponsors and partners."}
          </p>
        </div>
        {canCrud && (
          <Dialog onOpenChange={setIsAddOpen} open={isAddOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-accent font-bold text-accent-foreground sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Partner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Partner</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input onChange={(e) => setName(e.target.value)} value={name} />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea onChange={(e) => setDescription(e.target.value)} value={description} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Logo URL</Label>
                    <Input onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." value={logoUrl} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Website URL</Label>
                    <Input onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." value={websiteUrl} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Tier</Label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    onChange={(e) => setTier(e.target.value)}
                    value={tier}
                  >
                    <option value="platinum">Platinum</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="bronze">Bronze</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full font-bold" disabled={isSaving} onClick={handleAdd}>
                  {isSaving ? "Saving..." : "Save Partner"}
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
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Tier</TableHead>
                  <TableHead className="hidden md:table-cell">Website</TableHead>
                  <TableHead>Status</TableHead>
                  {canCrud && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {partnerships.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-bold">{partner.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {partner.tier && (
                        <Badge className={TIER_COLORS[partner.tier] ?? ""} variant="secondary">
                          {partner.tier}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {partner.website_url ? (
                        <a
                          className="flex items-center gap-1 text-xs text-accent hover:underline"
                          href={partner.website_url}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Visit
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={partner.is_active ? "default" : "outline"}>
                        {partner.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    {canCrud && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            className="h-8 text-xs"
                            onClick={() => handleToggleActive(partner.id, partner.is_active)}
                            size="sm"
                            variant="outline"
                          >
                            {partner.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(partner.id)}
                            size="icon"
                            variant="ghost"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {partnerships.length === 0 && (
                  <TableRow>
                    <TableCell className="py-12 text-center text-muted-foreground italic" colSpan={canCrud ? 5 : 4}>
                      No partnerships found.
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
