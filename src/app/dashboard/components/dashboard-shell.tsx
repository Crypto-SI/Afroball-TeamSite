"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, LayoutDashboard, LogOut } from "lucide-react";
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
  getSidebarItemsForRole,
  ROLE_LABELS,
  type SectionId,
  type UserRole,
} from "@/lib/dashboard-config";
import type { DashboardMode } from "../types";

type DashboardShellProps = {
  activeSection: SectionId;
  children: ReactNode;
  isLoading: boolean;
  mode: DashboardMode;
  statusMessage: string | null;
  supabaseConfigured: boolean;
  userRole: UserRole;
  onSectionChange: (sectionId: SectionId) => void;
  onSignOut: () => Promise<void>;
};

export function DashboardShell({
  activeSection,
  children,
  isLoading,
  mode,
  statusMessage,
  supabaseConfigured,
  userRole,
  onSectionChange,
  onSignOut,
}: DashboardShellProps) {
  const sidebarItems = getSidebarItemsForRole(userRole);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <SidebarProvider>
        <div className="flex flex-1">
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
                <SidebarGroupLabel className="text-[10px] uppercase tracking-widest">
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
                            onClick={() => onSectionChange(item.id)}
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

          <SidebarInset className="flex-1 bg-background">
            <header className="flex h-auto min-h-16 shrink-0 items-center gap-2 border-b px-4 py-2 flex-wrap">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator className="mr-2 h-4" orientation="vertical" />
                <h1 className="truncate text-sm font-bold uppercase tracking-tight sm:text-lg">
                  {sidebarItems.find((item) => item.id === activeSection)?.label ?? "Dashboard"}
                </h1>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant={mode === "live" ? "default" : "outline"} className="hidden sm:flex">
                  {mode === "live" ? "Supabase Live" : "Demo Mode"}
                </Badge>
                <Badge variant="secondary" className="hidden sm:flex">{ROLE_LABELS[userRole]}</Badge>
                {supabaseConfigured && (
                  <Button onClick={onSignOut} size="sm" variant="outline">
                    <LogOut className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                )}
              </div>
            </header>

            <main className="p-4 md:p-8">
              {statusMessage && <DashboardStatusAlert mode={mode} message={statusMessage} />}
              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">
                  Loading data from Supabase...
                </div>
              ) : (
                children
              )}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <Footer />
    </div>
  );
}

export function DashboardLoadingScreen() {
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

type DashboardStatusAlertProps = {
  mode: DashboardMode;
  message: string;
};

function DashboardStatusAlert({ mode, message }: DashboardStatusAlertProps) {
  return (
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
        {message}{" "}
        {(mode === "mock" || mode === "schema-missing") && (
          <Link className="font-semibold text-accent hover:underline" href="/docs/supabase">
            Open the setup guide
          </Link>
        )}
      </AlertDescription>
    </Alert>
  );
}
