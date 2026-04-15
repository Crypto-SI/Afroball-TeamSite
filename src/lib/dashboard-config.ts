import React from "react";
import {
  Calendar,
  Heart,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ShoppingCart,
  User,
  UserCog,
  Users,
  Video,
} from "lucide-react";

/** Matches any Lucide icon component */
type IconComponent = React.ComponentType<{ className?: string }>;

// ── Role Types ──────────────────────────────────────────────────────────────

export type UserRole = "admin" | "club" | "creator" | "player" | "fan";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  club: "Club Staff",
  creator: "Content Creator",
  player: "Player",
  fan: "Fan",
};

// ── Section IDs ─────────────────────────────────────────────────────────────

export type SectionId =
  | "overview"
  | "fixtures"
  | "players"
  | "staff"
  | "partnerships"
  | "fixture-media"
  | "settings"
  | "users"
  | "purchases"
  | "my-profile";

// ── Sidebar Item Definition ─────────────────────────────────────────────────

export type SidebarItem = {
  id: SectionId;
  label: string;
  icon: IconComponent;
  /** Which roles can see this sidebar item */
  roles: UserRole[];
  /** Which roles get full CRUD (others see read-only) */
  crudRoles?: UserRole[];
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["admin", "club", "creator", "player", "fan"],
  },
  {
    id: "fixtures",
    label: "Fixtures & Results",
    icon: Calendar,
    roles: ["admin", "club", "creator", "player", "fan"],
    crudRoles: ["admin", "club"],
  },
  {
    id: "players",
    label: "First Team Squad",
    icon: Users,
    roles: ["admin", "club", "fan"],
    crudRoles: ["admin", "club"],
  },
  {
    id: "staff",
    label: "Leadership & Staff",
    icon: ShieldCheck,
    roles: ["admin", "club", "fan"],
    crudRoles: ["admin", "club"],
  },
  {
    id: "partnerships",
    label: "Partnerships",
    icon: Heart,
    roles: ["admin", "club", "player", "fan"],
    crudRoles: ["admin", "club"],
  },
  {
    id: "fixture-media",
    label: "Fixture Media",
    icon: Video,
    roles: ["admin", "club", "creator"],
    crudRoles: ["admin", "creator"],
  },
  {
    id: "settings",
    label: "Site Settings",
    icon: Settings,
    roles: ["admin", "club"],
    crudRoles: ["admin", "club"], // club gets limited edit
  },
  {
    id: "users",
    label: "User Management",
    icon: UserCog,
    roles: ["admin"],
    crudRoles: ["admin"],
  },
  {
    id: "purchases",
    label: "Fan Purchases",
    icon: ShoppingCart,
    roles: ["admin", "fan"],
    crudRoles: ["admin"],
  },
  {
    id: "my-profile",
    label: "My Profile",
    icon: User,
    roles: ["player"],
    crudRoles: ["player"],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the sidebar items visible to a given role */
export function getSidebarItemsForRole(role: UserRole): SidebarItem[] {
  return SIDEBAR_ITEMS.filter((item) => item.roles.includes(role));
}

/** Returns whether a role has CRUD access for a section */
export function canEdit(role: UserRole, sectionId: SectionId): boolean {
  const item = SIDEBAR_ITEMS.find((s) => s.id === sectionId);
  if (!item?.crudRoles) return false;
  return item.crudRoles.includes(role);
}

/** Returns the first section a role should see (always "overview") */
export function getDefaultSection(_role: UserRole): SectionId {
  return "overview";
}
