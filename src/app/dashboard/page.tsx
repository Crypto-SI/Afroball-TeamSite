"use client";

import { useState } from "react";
import type { SectionId } from "@/lib/dashboard-config";
import { DashboardSections } from "./components/dashboard-sections";
import { DashboardLoadingScreen, DashboardShell } from "./components/dashboard-shell";
import { useDashboardData } from "./use-dashboard-data";

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const dashboardData = useDashboardData();

  if (!dashboardData.userRole) {
    return <DashboardLoadingScreen />;
  }

  return (
    <DashboardShell
      activeSection={activeSection}
      isLoading={dashboardData.isLoading}
      mode={dashboardData.mode}
      onSectionChange={setActiveSection}
      onSignOut={dashboardData.signOut}
      statusMessage={dashboardData.statusMessage}
      supabaseConfigured={dashboardData.supabaseConfigured}
      userRole={dashboardData.userRole}
    >
      <DashboardSections
        activeSection={activeSection}
        {...dashboardData}
        userRole={dashboardData.userRole}
      />
    </DashboardShell>
  );
}
