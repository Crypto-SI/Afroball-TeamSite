"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  INITIAL_FIXTURES,
  INITIAL_PLAYERS,
  INITIAL_STAFF,
  mapFixtureRecord,
  mapPlayerRecord,
  mapStaffRecord,
  type Fixture,
  type Goal,
  type Player,
  type StaffMember,
} from "@/lib/team-site-data";
import type { Database } from "@/types/database";
import {
  canEdit,
  getSidebarItemsForRole,
  ROLE_LABELS,
  type SectionId,
  type UserRole,
} from "@/lib/dashboard-config";
import type { SupabaseClient, DashboardMode } from "./types";

import { OverviewSection } from "./components/overview-section";
import { FixturesSection } from "./components/fixtures-section";
import { PlayersSection } from "./components/players-section";
import { StaffSection } from "./components/staff-section";
import { PartnershipsSection } from "./components/partnerships-section";
import { FixtureMediaSection } from "./components/fixture-media-section";
import { SiteSettingsSection } from "./components/site-settings-section";
import { UserManagementSection } from "./components/user-management-section";
import { FanPurchasesSection } from "./components/fan-purchases-section";
import { MyProfileSection } from "./components/my-profile-section";

// ── Types ───────────────────────────────────────────────────────────────────

type FixtureRow = Database["public"]["Tables"]["fixtures"]["Row"];
type GoalRow = Database["public"]["Tables"]["goals"]["Row"];
type PlayerRow = Database["public"]["Tables"]["players"]["Row"];
type StaffRow = Database["public"]["Tables"]["staff"]["Row"];
type PartnershipRow = Database["public"]["Tables"]["partnerships"]["Row"];
type FixtureMediaRow = Database["public"]["Tables"]["fixture_media"]["Row"];
type FanPurchaseRow = Database["public"]["Tables"]["fan_purchases"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];
type FixtureWithGoals = FixtureRow & { goals: GoalRow[] | null };

// ── Dashboard Page ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const supabaseConfigured = hasSupabaseEnv();
  const supabaseRef = useRef<SupabaseClient | null>(null);

  // Auth & role
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Navigation
  const [activeSection, setActiveSection] = useState<SectionId>("overview");

  // Data
  const [fixtures, setFixtures] = useState<Fixture[]>(INITIAL_FIXTURES);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [partnerships, setPartnerships] = useState<PartnershipRow[]>([]);
  const [fixtureMedia, setFixtureMedia] = useState<FixtureMediaRow[]>([]);
  const [fanPurchases, setFanPurchases] = useState<FanPurchaseRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsRow | null>(null);

  // UI state
  const [mode, setMode] = useState<DashboardMode>(supabaseConfigured ? "live" : "mock");
  const [isLoading, setIsLoading] = useState(supabaseConfigured);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(
    supabaseConfigured
      ? "Connecting to Supabase..."
      : "Supabase env vars are not set. The dashboard is running in local demo mode."
  );

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!supabaseConfigured) {
      setUserRole("admin"); // default for demo mode
      return;
    }

    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }

    let mounted = true;

    async function bootstrap() {
      const supabase = supabaseRef.current;
      if (!supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      setUserId(session.user.id);

      // Fetch user role from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", session.user.id)
        .single();

      let role: UserRole = "fan";
      if (profile) {
        // Map old roles to new roles for backward compatibility
        role = mapLegacyRole(profile.role);
        setUserName(profile.full_name);
      }
      setUserRole(role);

      await refreshFromSupabase(mounted, role, session.user.id);
    }

    bootstrap();

    return () => { mounted = false; };
  }, [router, supabaseConfigured]);

  // ── Data Fetching ─────────────────────────────────────────────────────────

  async function refreshFromSupabase(mounted = true, roleOverride?: UserRole, idOverride?: string | null) {
    const supabase = supabaseRef.current;
    if (!supabase) return;

    setIsLoading(true);

    const [fixturesRes, playersRes, staffRes] = await Promise.all([
      supabase
        .from("fixtures")
        .select("id, opponent, fixture_date, fixture_time, venue, status, mariners_score, opponent_score, created_at, updated_at, goals(id, fixture_id, player_name, minute, team, created_at)")
        .order("fixture_date", { ascending: false }),
      supabase.from("players").select("*").eq("is_active", true).order("name"),
      supabase.from("staff").select("*").eq("is_active", true).order("name"),
    ]);

    if (!mounted) return;

    const firstError = fixturesRes.error ?? playersRes.error ?? staffRes.error;
    if (firstError) {
      setMode("schema-missing");
      setStatusMessage("Supabase is configured, but the required tables or policies are not ready yet. Run the SQL in docs/supabase/02-schema-and-rls.md.");
      setIsLoading(false);
      return;
    }

    const fixtureRows = (fixturesRes.data ?? []) as FixtureWithGoals[];
    const playerRows = (playersRes.data ?? []) as PlayerRow[];
    const staffRows = (staffRes.data ?? []) as StaffRow[];

    setFixtures(fixtureRows.map((f) => mapFixtureRecord(f, f.goals ?? [])));
    setPlayers(playerRows.map(mapPlayerRecord));
    setStaff(staffRows.map(mapStaffRecord));

    // Fetch additional data based on role (non-blocking)
    // Use override values when provided (avoids stale closure from bootstrap)
    const effectiveRole = roleOverride ?? userRole;
    const effectiveId = idOverride !== undefined ? idOverride : userId;
    fetchAdditionalData(supabase, effectiveRole, effectiveId);

    setMode("live");
    setStatusMessage("Connected to Supabase. Changes now persist.");
    setIsLoading(false);
  }

  async function fetchAdditionalData(supabase: SupabaseClient, role: UserRole | null, id: string | null) {
    // These are best-effort — tables may not exist yet
    const [partnershipsRes, mediaRes, settingsRes] = await Promise.all([
      supabase.from("partnerships").select("*").order("name"),
      supabase.from("fixture_media").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*").limit(1).single(),
    ]);

    if (partnershipsRes.data) setPartnerships(partnershipsRes.data as PartnershipRow[]);
    if (mediaRes.data) setFixtureMedia(mediaRes.data as FixtureMediaRow[]);
    if (settingsRes.data) setSiteSettings(settingsRes.data as SiteSettingsRow);

    // Admin-only data
    if (role === "admin") {
      const [profilesRes, purchasesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("fan_purchases").select("*").order("created_at", { ascending: false }),
      ]);
      if (profilesRes.data) setProfiles(profilesRes.data as ProfileRow[]);
      if (purchasesRes.data) setFanPurchases(purchasesRes.data as FanPurchaseRow[]);
    }

    // Fan-specific data
    if (role === "fan" && id) {
      const { data: purchases } = await supabase
        .from("fan_purchases")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });
      if (purchases) setFanPurchases(purchases as FanPurchaseRow[]);
    }
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async function handleSignOut() {
    if (!supabaseRef.current) {
      router.push("/");
      return;
    }
    await supabaseRef.current.auth.signOut();
    router.replace("/login");
  }

  // ── Render ────────────────────────────────────────────────────────────────

  // Wait for role to be determined
  if (!userRole) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const sidebarItems = getSidebarItemsForRole(userRole);
  const canCrud = (sectionId: SectionId) => canEdit(userRole, sectionId);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <SidebarProvider>
        <div className="flex flex-1">
          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader className="flex h-16 items-center border-b px-4">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-accent" />
                <span className="group-data-[collapsible=icon]:hidden font-black uppercase tracking-tight">
                  {ROLE_LABELS[userRole]}
                </span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className="uppercase tracking-widest text-[10px]">
                  Dashboard
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={activeSection === item.id}
                            onClick={() => setActiveSection(item.id)}
                            tooltip={item.label}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          {/* ── Main Content ─────────────────────────────────────────────── */}
          <SidebarInset className="flex-1 bg-background">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator className="mr-2 h-4" orientation="vertical" />
              <h1 className="truncate text-sm font-bold uppercase tracking-tight sm:text-lg">
                {sidebarItems.find((i) => i.id === activeSection)?.label ?? "Dashboard"}
              </h1>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant={mode === "live" ? "default" : "outline"}>
                  {mode === "live" ? "Supabase Live" : "Demo Mode"}
                </Badge>
                <Badge variant="secondary">
                  {ROLE_LABELS[userRole]}
                </Badge>
                {supabaseConfigured && (
                  <Button onClick={handleSignOut} size="sm" variant="outline">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                )}
              </div>
            </header>

            <main className="p-4 md:p-8">
              {statusMessage && (
                <Alert
                  className={
                    mode === "schema-missing"
                      ? "mb-6 border-amber-500/30 bg-amber-500/10"
                      : "mb-6 border-accent/20 bg-card/50"
                  }
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    {mode === "live"
                      ? "Supabase Connected"
                      : mode === "schema-missing"
                        ? "Schema Still Missing"
                        : "Using Template Demo Data"}
                  </AlertTitle>
                  <AlertDescription>
                    {statusMessage}{" "}
                    {(mode === "mock" || mode === "schema-missing") && (
                      <Link className="font-semibold text-accent hover:underline" href="/docs/supabase">
                        Open the setup guide
                      </Link>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">
                  Loading data from Supabase...
                </div>
              ) : (
                <>
                  {activeSection === "overview" && (
                    <OverviewSection
                      role={userRole}
                      fixtures={fixtures}
                      players={players}
                      staff={staff}
                      partnerships={partnerships}
                      fixtureMedia={fixtureMedia}
                      fanPurchases={fanPurchases}
                      profiles={profiles}
                      userId={userId}
                    />
                  )}
                  {activeSection === "fixtures" && (
                    <FixturesSection
                      fixtures={fixtures}
                      canEdit={canCrud("fixtures")}
                      mode={mode}
                      isSaving={isSaving}
                      setIsSaving={setIsSaving}
                      setStatusMessage={setStatusMessage}
                      onRefresh={() => refreshFromSupabase()}
                      supabaseRef={supabaseRef}
                    />
                  )}
                  {activeSection === "players" && (
                    <PlayersSection
                      players={players}
                      canEdit={canCrud("players")}
                      mode={mode}
                      isSaving={isSaving}
                      setIsSaving={setIsSaving}
                      setStatusMessage={setStatusMessage}
                      onRefresh={() => refreshFromSupabase()}
                      supabaseRef={supabaseRef}
                    />
                  )}
                  {activeSection === "staff" && (
                    <StaffSection
                      staff={staff}
                      canEdit={canCrud("staff")}
                      mode={mode}
                      isSaving={isSaving}
                      setIsSaving={setIsSaving}
                      setStatusMessage={setStatusMessage}
                      onRefresh={() => refreshFromSupabase()}
                      supabaseRef={supabaseRef}
                    />
                  )}
                  {activeSection === "partnerships" && (
                    <PartnershipsSection
                      partnerships={partnerships}
                      canEdit={canCrud("partnerships")}
                      mode={mode}
                      isSaving={isSaving}
                      setIsSaving={setIsSaving}
                      setStatusMessage={setStatusMessage}
                      setPartnerships={setPartnerships}
                      supabaseRef={supabaseRef}
                    />
                  )}
                  {activeSection === "fixture-media" && (
                    <FixtureMediaSection
                      media={fixtureMedia}
                      fixtures={fixtures}
                      canEdit={canCrud("fixture-media")}
                      mode={mode}
                      isSaving={isSaving}
                      setIsSaving={setIsSaving}
                      setStatusMessage={setStatusMessage}
                      setMedia={setFixtureMedia}
                      supabaseRef={supabaseRef}
                    />
                  )}
                  {activeSection === "settings" && (
                    <SiteSettingsSection
                      settings={siteSettings}
                      role={userRole}
                      mode={mode}
                      isSaving={isSaving}
                      setIsSaving={setIsSaving}
                      setStatusMessage={setStatusMessage}
                      setSettings={setSiteSettings}
                      supabaseRef={supabaseRef}
                    />
                  )}
                  {activeSection === "users" && (
                    <UserManagementSection
                      profiles={profiles}
                      mode={mode}
                      isSaving={isSaving}
                      setIsSaving={setIsSaving}
                      setStatusMessage={setStatusMessage}
                      setProfiles={setProfiles}
                      supabaseRef={supabaseRef}
                    />
                  )}
                  {activeSection === "purchases" && (
                    <FanPurchasesSection
                      purchases={fanPurchases}
                      role={userRole}
                      userId={userId}
                    />
                  )}
                  {activeSection === "my-profile" && (
                    <MyProfileSection
                      userId={userId}
                      players={players}
                      mode={mode}
                      isSaving={isSaving}
                      setIsSaving={setIsSaving}
                      setStatusMessage={setStatusMessage}
                      onRefresh={() => refreshFromSupabase()}
                      supabaseRef={supabaseRef}
                    />
                  )}
                </>
              )}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>

      <Footer />
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Map legacy roles to the new role system */
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
