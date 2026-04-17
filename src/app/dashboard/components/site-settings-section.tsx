"use client";

import { useState } from "react";
import { Eye, EyeOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Database } from "@/types/database";
import type { UserRole } from "@/lib/dashboard-config";
import type { SupabaseClient, DashboardMode } from "../types";
import { getMutationErrorMessage, updateSiteSettings } from "../dashboard-mutations";

type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];

type Props = {
  settings: SiteSettingsRow | null;
  role: UserRole;
  mode: DashboardMode;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  setStatusMessage: (m: string | null) => void;
  setSettings: (s: SiteSettingsRow | null) => void;
  supabaseRef: React.MutableRefObject<SupabaseClient | null>;
};

export function SiteSettingsSection({
  settings,
  role,
  mode,
  isSaving,
  setIsSaving,
  setStatusMessage,
  setSettings,
  supabaseRef,
}: Props) {
  // Admin can edit all fields, club can only edit contact fields
  const isAdmin = role === "admin";

  const [clubName, setClubName] = useState(settings?.club_name ?? "");
  const [shortName, setShortName] = useState(settings?.short_name ?? "");
  const [primaryColor, setPrimaryColor] = useState(settings?.primary_color ?? "");
  const [accentColor, setAccentColor] = useState(settings?.accent_color ?? "");
  const [stadiumName, setStadiumName] = useState(settings?.stadium_name ?? "");
  const [contactEmail, setContactEmail] = useState(settings?.contact_email ?? "");
  const [contactPhone, setContactPhone] = useState(settings?.contact_phone ?? "");
  const [registrationOpen, setRegistrationOpen] = useState(settings?.registration_open ?? false);
  const [registrationPassword, setRegistrationPassword] = useState(settings?.registration_password ?? "");
  const [showGatePassword, setShowGatePassword] = useState(false);

  async function handleSave() {
    if (!settings) {
      setStatusMessage("No site settings found. Run the Supabase schema setup first.");
      return;
    }

    const contactUpdate = {
      stadium_name: stadiumName || null,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
      registration_open: registrationOpen,
      registration_password: registrationPassword || null,
      updated_at: new Date().toISOString(),
    };

    const adminUpdate = {
      ...contactUpdate,
      club_name: clubName,
      short_name: shortName || null,
      primary_color: primaryColor || null,
      accent_color: accentColor || null,
    };

    const updateData = isAdmin ? adminUpdate : contactUpdate;

    if (mode !== "live" || !supabaseRef.current) {
      setSettings({ ...settings, ...updateData });
      setStatusMessage("Settings saved (demo mode).");
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await updateSiteSettings(
        supabaseRef.current,
        settings.id,
        updateData
      );

      if (error) {
        setStatusMessage(error.message);
        return;
      }

      if (data) {
        setSettings(data as SiteSettingsRow);
      }
      setStatusMessage("Settings saved successfully.");
    } catch (error) {
      setStatusMessage(getMutationErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-black uppercase sm:text-3xl">Site Settings</h2>
        <Card className="border-accent/10 bg-card/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            No site settings found. Run the Supabase schema setup first.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black uppercase sm:text-3xl">Site Settings</h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {isAdmin ? "Manage club branding and contact information." : "Update contact information only."}
        </p>
      </div>

      {/* Branding — admin only */}
      {isAdmin && (
        <Card className="border-accent/10 bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-accent">
              Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Club Name</Label>
              <Input onChange={(e) => setClubName(e.target.value)} value={clubName} />
            </div>
            <div className="grid gap-2">
              <Label>Short Name</Label>
              <Input onChange={(e) => setShortName(e.target.value)} value={shortName} />
            </div>
            <div className="grid gap-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input onChange={(e) => setPrimaryColor(e.target.value)} value={primaryColor} />
                <div className="h-10 w-10 shrink-0 rounded border" style={{ backgroundColor: primaryColor || "#000" }} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Accent Color</Label>
              <div className="flex gap-2">
                <Input onChange={(e) => setAccentColor(e.target.value)} value={accentColor} />
                <div className="h-10 w-10 shrink-0 rounded border" style={{ backgroundColor: accentColor || "#000" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact — both admin and club */}
      <Card className="border-accent/10 bg-card/50">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase tracking-widest text-accent">
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label>Stadium Name</Label>
            <Input onChange={(e) => setStadiumName(e.target.value)} value={stadiumName} />
          </div>
          <div className="grid gap-2">
            <Label>Contact Email</Label>
            <Input onChange={(e) => setContactEmail(e.target.value)} type="email" value={contactEmail} />
          </div>
          <div className="grid gap-2">
            <Label>Contact Phone</Label>
            <Input onChange={(e) => setContactPhone(e.target.value)} type="tel" value={contactPhone} />
          </div>
        </CardContent>
      </Card>

      {/* Player Registration — both admin and club */}
      <Card className="border-accent/10 bg-card/50">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase tracking-widest text-accent">
            Player Registration
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-xs text-muted-foreground">
            When enabled, prospective players can visit the registration page to submit their details.
            All submissions require approval before a player account is created.
          </p>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Registration Page Open</Label>
              <p className="text-xs text-muted-foreground">
                Allow new players to submit their details at /register
              </p>
            </div>
            <Switch
              checked={registrationOpen}
              onCheckedChange={setRegistrationOpen}
            />
          </div>
          <div className="grid gap-2">
            <Label>Gate Password</Label>
            <p className="text-xs text-muted-foreground">
              Players must enter this password to access the registration form. Share it in-person with prospective players. Leave empty to remove the password requirement.
            </p>
            <div className="relative">
              <Input
                type={showGatePassword ? "text" : "password"}
                placeholder="Enter gate password..."
                value={registrationPassword}
                onChange={(e) => setRegistrationPassword(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowGatePassword(!showGatePassword)}
              >
                {showGatePassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        className="bg-accent font-bold text-accent-foreground"
        disabled={isSaving}
        onClick={handleSave}
      >
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
