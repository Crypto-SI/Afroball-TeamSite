"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  INITIAL_FIXTURES,
  INITIAL_PLAYERS,
  INITIAL_STAFF,
  type Fixture,
  type Player,
  type StaffMember,
} from "@/lib/team-site-data";
import type { UserRole } from "@/lib/dashboard-config";
import type { DashboardMode, SupabaseClient } from "./types";
import {
  fetchAdminDashboardData,
  fetchCommonDashboardData,
  fetchCoreDashboardData,
  fetchFanPurchases,
  type FanPurchaseRow,
  type FixtureMediaRow,
  type PartnershipRow,
  type ProfileRow,
  type SiteSettingsRow,
} from "./dashboard-queries";

const DEMO_SITE_SETTINGS: SiteSettingsRow = {
  id: "demo-site-settings",
  club_name: "Toman Mariners FC",
  short_name: "Mariners",
  primary_color: "#0f172a",
  accent_color: "#f59e0b",
  stadium_name: "Mariner Dome",
  contact_email: "hello@tomanmariners.example",
  contact_phone: "+44 20 0000 0000",
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

export function useDashboardData() {
  const router = useRouter();
  const supabaseConfigured = hasSupabaseEnv();
  const supabaseRef = useRef<SupabaseClient | null>(null);

  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const [fixtures, setFixtures] = useState<Fixture[]>(INITIAL_FIXTURES);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [partnerships, setPartnerships] = useState<PartnershipRow[]>([]);
  const [fixtureMedia, setFixtureMedia] = useState<FixtureMediaRow[]>([]);
  const [fanPurchases, setFanPurchases] = useState<FanPurchaseRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsRow | null>(
    supabaseConfigured ? null : DEMO_SITE_SETTINGS
  );

  const [mode, setMode] = useState<DashboardMode>(supabaseConfigured ? "live" : "mock");
  const [isLoading, setIsLoading] = useState(supabaseConfigured);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(
    supabaseConfigured
      ? "Connecting to Supabase..."
      : "Supabase env vars are not set. The dashboard is running in local demo mode."
  );

  useEffect(() => {
    if (!supabaseConfigured) {
      setUserRole("admin");
      return;
    }

    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }

    let mounted = true;

    async function bootstrap() {
      const supabase = supabaseRef.current;
      if (!supabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", session.user.id)
        .single();

      let role: UserRole = "fan";
      if (profile) {
        role = mapLegacyRole(profile.role);
        setUserName(profile.full_name);
      }

      setUserRole(role);
      await refreshFromSupabase(mounted, role, session.user.id);
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [router, supabaseConfigured]);

  async function refreshFromSupabase(
    mounted = true,
    roleOverride?: UserRole,
    idOverride?: string | null
  ) {
    const supabase = supabaseRef.current;
    if (!supabase) return;

    setIsLoading(true);

    const { data, error } = await fetchCoreDashboardData(supabase);

    if (!mounted) return;

    if (error || !data) {
      setMode("schema-missing");
      setStatusMessage("Supabase is configured, but the required tables or policies are not ready yet. Run the SQL in docs/supabase/02-schema-and-rls.md.");
      setIsLoading(false);
      return;
    }

    setFixtures(data.fixtures);
    setPlayers(data.players);
    setStaff(data.staff);

    const effectiveRole = roleOverride ?? userRole;
    const effectiveId = idOverride !== undefined ? idOverride : userId;
    fetchAdditionalData(supabase, effectiveRole, effectiveId);

    setMode("live");
    setStatusMessage("Connected to Supabase. Changes now persist.");
    setIsLoading(false);
  }

  async function fetchAdditionalData(
    supabase: SupabaseClient,
    role: UserRole | null,
    id: string | null
  ) {
    const commonData = await fetchCommonDashboardData(supabase);

    setPartnerships(commonData.partnerships);
    setFixtureMedia(commonData.fixtureMedia);
    setSiteSettings(commonData.siteSettings);

    if (role === "admin") {
      const adminData = await fetchAdminDashboardData(supabase);
      setProfiles(adminData.profiles);
      setFanPurchases(adminData.fanPurchases);
    }

    if (role === "fan" && id) {
      setFanPurchases(await fetchFanPurchases(supabase, id));
    }
  }

  async function signOut() {
    if (!supabaseRef.current) {
      router.push("/");
      return;
    }

    await supabaseRef.current.auth.signOut();
    router.replace("/login");
  }

  return {
    supabaseConfigured,
    supabaseRef,
    userRole,
    userId,
    userName,
    fixtures,
    players,
    staff,
    partnerships,
    fixtureMedia,
    fanPurchases,
    profiles,
    siteSettings,
    mode,
    isLoading,
    isSaving,
    statusMessage,
    setIsSaving,
    setStatusMessage,
    setFixtures,
    setPlayers,
    setStaff,
    setPartnerships,
    setFixtureMedia,
    setFanPurchases,
    setProfiles,
    setSiteSettings,
    refreshFromSupabase,
    signOut,
  };
}

function mapLegacyRole(role: string): UserRole {
  const roleMap: Record<string, UserRole> = {
    owner: "admin",
    admin: "admin",
    editor: "club",
    club: "club",
    creator: "creator",
    player: "player",
    fan: "fan",
  };

  return roleMap[role] ?? "fan";
}
