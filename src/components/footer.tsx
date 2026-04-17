"use client";

import { FooterContent } from "@/components/footer-content";
import type { SiteSettingsRow } from "@/lib/team-data-loaders";

const DEFAULT_FOOTER_SETTINGS: SiteSettingsRow = {
  id: "default-footer-settings",
  club_name: "Toman Mariners FC",
  short_name: "Mariners",
  primary_color: "#0f172a",
  accent_color: "#f59e0b",
  stadium_name: "Mariner Dome",
  contact_email: "contact@tomanmariners.com",
  contact_phone: "+1 (555) MARINER",
  registration_open: false,
  registration_password: null,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

export function Footer({ settings = DEFAULT_FOOTER_SETTINGS }: { settings?: SiteSettingsRow }) {
  return <FooterContent settings={settings} />;
}
