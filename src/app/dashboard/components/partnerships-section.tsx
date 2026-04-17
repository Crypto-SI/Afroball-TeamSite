"use client";

import { useState } from "react";
import type { Database } from "@/types/database";
import type { SupabaseClient, DashboardMode } from "../types";
import {
  createPartnership,
  deletePartnership,
  getMutationErrorMessage,
  togglePartnership,
} from "../dashboard-mutations";
import { DashboardSectionHeader } from "./dashboard-section-ui";
import { PartnershipDialog, PartnershipsTable } from "./partnerships-ui";

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
      const now = new Date().toISOString();
      setPartnerships([
        ...partnerships,
        {
          id: createDemoId("partner"),
          name,
          description: description || null,
          logo_url: logoUrl || null,
          website_url: websiteUrl || null,
          tier: tier as PartnershipRow["tier"],
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      ]);
      setStatusMessage("Partner added (demo mode).");
      closeDialog();
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await createPartnership(supabaseRef.current, {
        name,
        description,
        logoUrl,
        websiteUrl,
        tier: tier as PartnershipRow["tier"],
      });

      if (error) {
        setStatusMessage(error.message);
        return;
      }

      if (data) {
        setPartnerships([...partnerships, ...(data as PartnershipRow[])]);
      }
      closeDialog();
    } catch (error) {
      setStatusMessage(getMutationErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    if (mode !== "live" || !supabaseRef.current) {
      setPartnerships(
        partnerships.map((p) => (p.id === id ? { ...p, is_active: !currentActive } : p))
      );
      setStatusMessage("Partner toggled (demo mode).");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await togglePartnership(supabaseRef.current, id, currentActive);

      if (error) {
        setStatusMessage(error.message);
        return;
      }

      setPartnerships(
        partnerships.map((p) => (p.id === id ? { ...p, is_active: !currentActive } : p))
      );
    } catch (error) {
      setStatusMessage(getMutationErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (mode !== "live" || !supabaseRef.current) {
      setPartnerships(partnerships.filter((p) => p.id !== id));
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await deletePartnership(supabaseRef.current, id);

      if (error) {
        setStatusMessage(error.message);
        return;
      }
      setPartnerships(partnerships.filter((p) => p.id !== id));
    } catch (error) {
      setStatusMessage(getMutationErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
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
      <DashboardSectionHeader
        title="Partnerships"
        description={canCrud ? "Manage sponsors and partners." : "View our sponsors and partners."}
        action={
          canCrud ? (
            <PartnershipDialog
              description={description}
              isSaving={isSaving}
              logoUrl={logoUrl}
              name={name}
              onDescriptionChange={setDescription}
              onLogoUrlChange={setLogoUrl}
              onNameChange={setName}
              onOpenChange={setIsAddOpen}
              onSubmit={handleAdd}
              onTierChange={setTier}
              onWebsiteUrlChange={setWebsiteUrl}
              open={isAddOpen}
              tier={tier}
              websiteUrl={websiteUrl}
            />
          ) : null
        }
      />

      <PartnershipsTable
        canCrud={canCrud}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        partnerships={partnerships}
      />
    </div>
  );
}

function createDemoId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
