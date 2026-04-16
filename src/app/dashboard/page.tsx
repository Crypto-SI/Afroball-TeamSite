"use client";

import { useState } from "react";
import Link from "next/link";
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
import {
  canEdit,
  getSidebarItemsForRole,
  ROLE_LABELS,
  type SectionId,
} from "@/lib/dashboard-config";

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
import { useDashboardData } from "./use-dashboard-data";

// ── Dashboard Page ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const {
    supabaseConfigured,
    supabaseRef,
    userRole,
    userId,
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
    setSiteSettings,
    setProfiles,
    refreshFromSupabase,
    signOut,
  } = useDashboardData();

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
                  <Button onClick={signOut} size="sm" variant="outline">
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
                      setFixtures={setFixtures}
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
                      setPlayers={setPlayers}
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
                      setStaff={setStaff}
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
                      onRefresh={() => refreshFromSupabase()}
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
                      setPlayers={setPlayers}
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
