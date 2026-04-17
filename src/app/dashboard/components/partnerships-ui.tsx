"use client";

import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { CrudDialog, DeleteIconButton, EmptyTableRow } from "./dashboard-section-ui";

type PartnershipRow = Database["public"]["Tables"]["partnerships"]["Row"];

const TIER_COLORS: Record<string, string> = {
  platinum: "bg-slate-200 text-slate-800",
  gold: "bg-yellow-100 text-yellow-800",
  silver: "bg-gray-100 text-gray-800",
  bronze: "bg-orange-100 text-orange-800",
};

type PartnershipDialogProps = {
  open: boolean;
  isSaving: boolean;
  name: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  tier: string;
  onOpenChange: (open: boolean) => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onLogoUrlChange: (value: string) => void;
  onWebsiteUrlChange: (value: string) => void;
  onTierChange: (value: string) => void;
  onSubmit: () => void;
};

export function PartnershipDialog({
  open,
  isSaving,
  name,
  description,
  logoUrl,
  websiteUrl,
  tier,
  onOpenChange,
  onNameChange,
  onDescriptionChange,
  onLogoUrlChange,
  onWebsiteUrlChange,
  onTierChange,
  onSubmit,
}: PartnershipDialogProps) {
  return (
    <CrudDialog
      isSaving={isSaving}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      open={open}
      submitLabel="Save Partner"
      title="Add New Partner"
      triggerLabel="Add Partner"
    >
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input onChange={(event) => onNameChange(event.target.value)} value={name} />
        </div>
        <div className="grid gap-2">
          <Label>Description</Label>
          <Textarea onChange={(event) => onDescriptionChange(event.target.value)} value={description} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Logo URL</Label>
            <Input onChange={(event) => onLogoUrlChange(event.target.value)} placeholder="https://..." value={logoUrl} />
          </div>
          <div className="grid gap-2">
            <Label>Website URL</Label>
            <Input
              onChange={(event) => onWebsiteUrlChange(event.target.value)}
              placeholder="https://..."
              value={websiteUrl}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Tier</Label>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            onChange={(event) => onTierChange(event.target.value)}
            value={tier}
          >
            <option value="platinum">Platinum</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
          </select>
        </div>
      </div>
    </CrudDialog>
  );
}

type PartnershipsTableProps = {
  partnerships: PartnershipRow[];
  canCrud: boolean;
  onDelete: (partnerId: string) => void;
  onToggleActive: (partnerId: string, currentActive: boolean) => void;
};

export function PartnershipsTable({
  partnerships,
  canCrud,
  onDelete,
  onToggleActive,
}: PartnershipsTableProps) {
  return (
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
                      <span className="text-xs text-muted-foreground">-</span>
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
                          onClick={() => onToggleActive(partner.id, partner.is_active)}
                          size="sm"
                          variant="outline"
                        >
                          {partner.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <DeleteIconButton onClick={() => onDelete(partner.id)} />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {partnerships.length === 0 && (
                <EmptyTableRow colSpan={canCrud ? 5 : 4}>No partnerships found.</EmptyTableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
