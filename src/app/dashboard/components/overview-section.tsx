"use client";

import {
  Calendar,
  ShoppingBag,
  TrendingUp,
  Users,
  Video,
  Heart,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Fixture, Player, StaffMember } from "@/lib/team-site-data";
import type { UserRole } from "@/lib/dashboard-config";
import type { Database } from "@/types/database";

type PartnershipRow = Database["public"]["Tables"]["partnerships"]["Row"];
type FixtureMediaRow = Database["public"]["Tables"]["fixture_media"]["Row"];
type FanPurchaseRow = Database["public"]["Tables"]["fan_purchases"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type Props = {
  role: UserRole;
  fixtures: Fixture[];
  players: Player[];
  staff: StaffMember[];
  partnerships: PartnershipRow[];
  fixtureMedia: FixtureMediaRow[];
  fanPurchases: FanPurchaseRow[];
  profiles: ProfileRow[];
};

export function OverviewSection({
  role,
  fixtures,
  players,
  staff,
  partnerships,
  fixtureMedia,
  fanPurchases,
  profiles,
}: Props) {
  const upcomingFixtures = fixtures.filter((f) => f.status === "upcoming");
  const completedFixtures = fixtures.filter((f) => f.status === "completed");
  const activePartnerships = partnerships.filter((p) => p.is_active);
  const nextFixture = upcomingFixtures[0];

  // Calculate wins/losses/draws
  const wins = completedFixtures.filter(
    (f) => (f.result?.marinersScore ?? 0) > (f.result?.opponentScore ?? 0)
  ).length;
  const losses = completedFixtures.filter(
    (f) => (f.result?.marinersScore ?? 0) < (f.result?.opponentScore ?? 0)
  ).length;
  const draws = completedFixtures.filter(
    (f) => (f.result?.marinersScore ?? 0) === (f.result?.opponentScore ?? 0)
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black uppercase sm:text-3xl">Dashboard</h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Welcome back. Here's your overview.
        </p>
      </div>

      {/* ── Admin Overview ──────────────────────────────────────────────── */}
      {role === "admin" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={UserCog} label="Total Users" value={profiles.length} />
          <StatCard icon={Calendar} label="Upcoming Fixtures" value={upcomingFixtures.length} />
          <StatCard icon={Users} label="Active Players" value={players.length} />
          <StatCard icon={ShieldCheck} label="Active Staff" value={staff.length} />
          <StatCard icon={Heart} label="Partnerships" value={activePartnerships.length} />
          <StatCard icon={Video} label="Media Items" value={fixtureMedia.length} />
          <StatCard icon={ShoppingBag} label="Total Purchases" value={fanPurchases.length} />
          <StatCard icon={TrendingUp} label="Record (W/D/L)" value={`${wins}/${draws}/${losses}`} />
        </div>
      )}

      {/* ── Club Overview ───────────────────────────────────────────────── */}
      {role === "club" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Calendar} label="Upcoming Fixtures" value={upcomingFixtures.length} />
          <StatCard icon={Users} label="Active Players" value={players.length} />
          <StatCard icon={ShieldCheck} label="Active Staff" value={staff.length} />
          <StatCard icon={Heart} label="Partnerships" value={activePartnerships.length} />
        </div>
      )}

      {/* ── Creator Overview ────────────────────────────────────────────── */}
      {role === "creator" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={Video} label="Media Uploaded" value={fixtureMedia.length} />
          <StatCard
            icon={Calendar}
            label="Fixtures Missing Media"
            value={fixtures.filter((f) => !fixtureMedia.some((m) => m.fixture_id === f.id)).length}
          />
          <StatCard icon={TrendingUp} label="Total Fixtures" value={fixtures.length} />
        </div>
      )}

      {/* ── Player Overview ─────────────────────────────────────────────── */}
      {role === "player" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={Calendar} label="Upcoming Matches" value={upcomingFixtures.length} />
          <StatCard icon={TrendingUp} label="Team Record (W/D/L)" value={`${wins}/${draws}/${losses}`} />
          <StatCard icon={Heart} label="Active Partners" value={activePartnerships.length} />
        </div>
      )}

      {/* ── Fan Overview ────────────────────────────────────────────────── */}
      {role === "fan" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={Calendar} label="Upcoming Fixtures" value={upcomingFixtures.length} />
          <StatCard icon={ShoppingBag} label="My Purchases" value={fanPurchases.length} />
          <StatCard icon={Heart} label="Partners" value={activePartnerships.length} />
        </div>
      )}

      {/* ── Next Match Card ─────────────────────────────────────────────── */}
      {nextFixture && (
        <Card className="border-accent/20 bg-card/50">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-accent">
              Next Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-black uppercase">{nextFixture.opponent}</p>
                <p className="text-sm text-muted-foreground">
                  {nextFixture.date} at {nextFixture.time} • {nextFixture.venue}
                </p>
              </div>
              <Calendar className="h-10 w-10 text-accent/30" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Recent Results (for roles that care) ────────────────────────── */}
      {completedFixtures.length > 0 && (role === "admin" || role === "club" || role === "player" || role === "fan") && (
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-muted-foreground">
            Recent Results
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {completedFixtures.slice(0, 3).map((fixture) => (
              <Card key={fixture.id} className="border-accent/10 bg-card/30 p-4">
                <p className="text-[10px] font-bold uppercase text-accent">{fixture.date}</p>
                <p className="text-sm font-bold">
                  Mariners{" "}
                  <span className="text-accent">
                    {fixture.result?.marinersScore} - {fixture.result?.opponentScore}
                  </span>{" "}
                  {fixture.opponent}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stat Card Helper ────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="border-accent/10 bg-card/50">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="text-2xl font-black">{value}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
