"use client";

import { canEdit, type SectionId, type UserRole } from "@/lib/dashboard-config";
import { FixtureMediaSection } from "./fixture-media-section";
import { FixturesSection } from "./fixtures-section";
import { MyProfileSection } from "./my-profile-section";
import { OverviewSection } from "./overview-section";
import { PartnershipsSection } from "./partnerships-section";
import { PlayersSection } from "./players-section";
import { StaffSection } from "./staff-section";
import { SubmissionsSection } from "./submissions-section";
import { UserManagementSection } from "./user-management-section";
import { FanPurchasesSection } from "./fan-purchases-section";
import type { useDashboardData } from "../use-dashboard-data";

type DashboardData = ReturnType<typeof useDashboardData>;

type DashboardSectionsProps = Omit<DashboardData, "userRole"> & {
  activeSection: SectionId;
  userRole: UserRole;
};

export function DashboardSections({
  activeSection,
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
  isSaving,
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
}: DashboardSectionsProps) {
  const canCrud = (sectionId: SectionId) => canEdit(userRole, sectionId);
  const refresh = () => refreshFromSupabase();

  switch (activeSection) {
    case "overview":
      return (
        <OverviewSection
          fixtureMedia={fixtureMedia}
          fixtures={fixtures}
          fanPurchases={fanPurchases}
          partnerships={partnerships}
          players={players}
          profiles={profiles}
          role={userRole}
          staff={staff}
        />
      );
    case "fixtures":
      return (
        <FixturesSection
          canEdit={canCrud("fixtures")}
          fixtures={fixtures}
          isSaving={isSaving}
          mode={mode}
          onRefresh={refresh}
          setFixtures={setFixtures}
          setIsSaving={setIsSaving}
          setStatusMessage={setStatusMessage}
          supabaseRef={supabaseRef}
        />
      );
    case "players":
      return (
        <PlayersSection
          canEdit={canCrud("players")}
          isSaving={isSaving}
          mode={mode}
          onRefresh={refresh}
          players={players}
          setIsSaving={setIsSaving}
          setPlayers={setPlayers}
          setStatusMessage={setStatusMessage}
          supabaseRef={supabaseRef}
        />
      );
    case "staff":
      return (
        <StaffSection
          canEdit={canCrud("staff")}
          isSaving={isSaving}
          mode={mode}
          onRefresh={refresh}
          setIsSaving={setIsSaving}
          setStaff={setStaff}
          setStatusMessage={setStatusMessage}
          staff={staff}
          supabaseRef={supabaseRef}
        />
      );
    case "partnerships":
      return (
        <PartnershipsSection
          canEdit={canCrud("partnerships")}
          isSaving={isSaving}
          mode={mode}
          partnerships={partnerships}
          setIsSaving={setIsSaving}
          setPartnerships={setPartnerships}
          setStatusMessage={setStatusMessage}
          supabaseRef={supabaseRef}
        />
      );
    case "fixture-media":
      return (
        <FixtureMediaSection
          canEdit={canCrud("fixture-media")}
          fixtures={fixtures}
          isSaving={isSaving}
          media={fixtureMedia}
          mode={mode}
          setIsSaving={setIsSaving}
          setMedia={setFixtureMedia}
          setStatusMessage={setStatusMessage}
          supabaseRef={supabaseRef}
        />
      );
    case "submissions":
      return (
        <SubmissionsSection
          mode={mode}
          setStatusMessage={setStatusMessage}
          supabaseRef={supabaseRef}
          registrationOpen={siteSettings?.registration_open ?? false}
          gatePassword={siteSettings?.registration_password ?? null}
          onToggleRegistration={async (open) => {
            if (!supabaseRef.current) return;
            try {
              setIsSaving(true);
              const { data: { session } } = await supabaseRef.current.auth.getSession();
              if (!session) { setStatusMessage("Not authenticated."); return; }

              const res = await fetch("/api/admin/update-registration-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                body: JSON.stringify({ registration_open: open }),
              });
              const result = await res.json();
              if (!res.ok) { setStatusMessage(`Failed: ${result.error}`); return; }

              if (siteSettings) {
                setSiteSettings({ ...siteSettings, registration_open: open });
              } else {
                refreshFromSupabase();
              }
              setStatusMessage(open ? "Registration opened." : "Registration closed.");
            } catch { setStatusMessage("Unexpected error."); } finally { setIsSaving(false); }
          }}
          onUpdateGatePassword={async (password) => {
            if (!supabaseRef.current) return;
            try {
              setIsSaving(true);
              const { data: { session } } = await supabaseRef.current.auth.getSession();
              if (!session) { setStatusMessage("Not authenticated."); return; }

              const res = await fetch("/api/admin/update-registration-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                body: JSON.stringify({ registration_password: password }),
              });
              const result = await res.json();
              if (!res.ok) { setStatusMessage(`Failed: ${result.error}`); return; }

              if (siteSettings) {
                setSiteSettings({ ...siteSettings, registration_password: password || null });
              }
              setStatusMessage(password ? "Gate password updated." : "Gate password removed.");
            } catch { setStatusMessage("Unexpected error."); } finally { setIsSaving(false); }
          }}
        />
      );
    case "users":
      return (
        <UserManagementSection
          isSaving={isSaving}
          mode={mode}
          onRefresh={refresh}
          profiles={profiles}
          setIsSaving={setIsSaving}
          setProfiles={setProfiles}
          setStatusMessage={setStatusMessage}
          supabaseRef={supabaseRef}
        />
      );
    case "purchases":
      return <FanPurchasesSection purchases={fanPurchases} role={userRole} userId={userId} />;
    case "my-profile":
      return (
        <MyProfileSection
          isSaving={isSaving}
          mode={mode}
          onRefresh={refresh}
          players={players}
          setIsSaving={setIsSaving}
          setPlayers={setPlayers}
          setStatusMessage={setStatusMessage}
          supabaseRef={supabaseRef}
        />
      );
    default:
      return null;
  }
}
