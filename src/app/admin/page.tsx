"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  LayoutDashboard,
  LogOut,
  Plus,
  ShieldCheck,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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

type DashboardMode = "mock" | "live" | "schema-missing";
type SupabaseClient = ReturnType<typeof createClient>;
type FixtureRow = Database["public"]["Tables"]["fixtures"]["Row"];
type GoalRow = Database["public"]["Tables"]["goals"]["Row"];
type PlayerRow = Database["public"]["Tables"]["players"]["Row"];
type StaffRow = Database["public"]["Tables"]["staff"]["Row"];
type FixtureWithGoals = FixtureRow & { goals: GoalRow[] | null };

export default function AdminPage() {
  const router = useRouter();
  const supabaseConfigured = hasSupabaseEnv();
  const supabaseRef = useRef<SupabaseClient | null>(null);

  const [view, setView] = useState<"fixtures" | "players" | "staff">("fixtures");
  const [fixtures, setFixtures] = useState<Fixture[]>(INITIAL_FIXTURES);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [mode, setMode] = useState<DashboardMode>(supabaseConfigured ? "live" : "mock");
  const [isLoading, setIsLoading] = useState(supabaseConfigured);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(
    supabaseConfigured
      ? "Connecting to Supabase..."
      : "Supabase env vars are not set. The dashboard is running in local demo mode."
  );

  const [isAddFixtureOpen, setIsAddFixtureOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  const [newOpponent, setNewOpponent] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [mScore, setMScore] = useState(0);
  const [oScore, setOScore] = useState(0);
  const [matchGoals, setMatchGoals] = useState<Omit<Goal, "id">[]>([]);

  const [pName, setPName] = useState("");
  const [pPos, setPPos] = useState("");
  const [pSecondPos, setPSecondPos] = useState("");
  const [pHeight, setPHeight] = useState("");
  const [pImageUrl, setPImageUrl] = useState("");

  const [sName, setSName] = useState("");
  const [sRole, setSRole] = useState("");
  const [sBio, setSBio] = useState("");
  const [sImageUrl, setSImageUrl] = useState("");

  const viewTitle = {
    fixtures: "Fixtures & Results",
    players: "First Team Squad",
    staff: "Leadership & Staff",
  }[view];

  useEffect(() => {
    if (!supabaseConfigured) {
      return;
    }

    // Create the Supabase client inside the effect, not during render
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }

    let mounted = true;

    async function bootstrap() {
      const supabase = supabaseRef.current;
      if (!supabase) {
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      await refreshFromSupabase(mounted);
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [router, supabaseConfigured]);

  async function refreshFromSupabase(mounted = true) {
    const supabase = supabaseRef.current;
    if (!supabase) {
      return;
    }

    setIsLoading(true);

    const [fixturesResponse, playersResponse, staffResponse] = await Promise.all([
      supabase
        .from("fixtures")
        .select(
          "id, opponent, fixture_date, fixture_time, venue, status, mariners_score, opponent_score, created_at, updated_at, goals(id, fixture_id, player_name, minute, team, created_at)"
        )
        .order("fixture_date", { ascending: false }),
      supabase.from("players").select("*").eq("is_active", true).order("name"),
      supabase.from("staff").select("*").eq("is_active", true).order("name"),
    ]);

    if (!mounted) {
      return;
    }

    const firstError =
      fixturesResponse.error ?? playersResponse.error ?? staffResponse.error;

    if (firstError) {
      setMode("schema-missing");
      setStatusMessage(
        "Supabase is configured, but the required tables or policies are not ready yet. Run the SQL in docs/supabase/02-schema-and-rls.md."
      );
      setIsLoading(false);
      return;
    }

    const fixtureRows = (fixturesResponse.data ?? []) as FixtureWithGoals[];
    const playerRows = (playersResponse.data ?? []) as PlayerRow[];
    const staffRows = (staffResponse.data ?? []) as StaffRow[];

    setFixtures(
      fixtureRows.map((fixture) => mapFixtureRecord(fixture, fixture.goals ?? []))
    );
    setPlayers(playerRows.map(mapPlayerRecord));
    setStaff(staffRows.map(mapStaffRecord));
    setMode("live");
    setStatusMessage("Connected to Supabase. Admin changes now persist.");
    setIsLoading(false);
  }

  async function handleAddFixture() {
    if (!newOpponent || !newDate || !newTime || !newVenue) {
      setStatusMessage("Fill in opponent, date, time, and venue before saving.");
      return;
    }

    if (mode !== "live" || !supabaseRef.current) {
      const fixture: Fixture = {
        id: Math.random().toString(36).slice(2, 11),
        opponent: newOpponent,
        date: newDate,
        time: newTime,
        venue: newVenue,
        status: "upcoming",
      };
      setFixtures([fixture, ...fixtures]);
      closeFixtureDialog();
      return;
    }

    setIsSaving(true);
    const { error } = await supabaseRef.current.from("fixtures").insert({
      opponent: newOpponent,
      fixture_date: newDate,
      fixture_time: newTime,
      venue: newVenue,
      status: "upcoming",
    });

    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    closeFixtureDialog();
    await refreshFromSupabase();
  }

  async function handleDeleteFixture(id: string) {
    if (mode !== "live" || !supabaseRef.current) {
      setFixtures(fixtures.filter((fixture) => fixture.id !== id));
      return;
    }

    setIsSaving(true);
    const { error } = await supabaseRef.current.from("fixtures").delete().eq("id", id);
    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    await refreshFromSupabase();
  }

  async function handleSubmitResult() {
    if (!selectedFixture) {
      return;
    }

    if (mode !== "live" || !supabaseRef.current) {
      setFixtures(
        fixtures.map((fixture) =>
          fixture.id === selectedFixture.id
            ? {
                ...fixture,
                status: "completed",
                result: {
                  marinersScore: mScore,
                  opponentScore: oScore,
                  goals: matchGoals.map((goal) => ({
                    ...goal,
                    id: Math.random().toString(36).slice(2, 7),
                  })),
                },
              }
            : fixture
        )
      );
      setIsResultDialogOpen(false);
      return;
    }

    setIsSaving(true);

    // Use the atomic RPC function to update fixture + replace goals in one call
    const { error: rpcError } = await supabaseRef.current.rpc(
      "submit_match_result",
      {
        p_fixture_id: selectedFixture.id,
        p_mariners_score: mScore,
        p_opponent_score: oScore,
        p_goals: matchGoals.map((goal) => ({
          player_name: goal.player,
          minute: Number(goal.minute),
          team: goal.team,
        })),
      }
    );

    if (rpcError) {
      setIsSaving(false);
      setStatusMessage(rpcError.message);
      return;
    }

    setIsSaving(false);
    setIsResultDialogOpen(false);
    await refreshFromSupabase();
  }

  async function handleAddPlayer() {
    if (!pName || !pPos) {
      setStatusMessage("Player name and primary position are required.");
      return;
    }

    if (mode !== "live" || !supabaseRef.current) {
      const player: Player = {
        id: Math.random().toString(36).slice(2, 11),
        name: pName,
        pos: pPos,
        secondPos: pSecondPos,
        height: pHeight,
        imageUrl: pImageUrl || `https://picsum.photos/seed/p${Math.random()}/400/500`,
      };
      setPlayers([...players, player]);
      closePlayerDialog();
      return;
    }

    setIsSaving(true);
    const { error } = await supabaseRef.current.from("players").insert({
      name: pName,
      pos: pPos,
      second_pos: pSecondPos || null,
      height: pHeight || null,
      image_url: pImageUrl || null,
      is_active: true,
    });

    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    closePlayerDialog();
    await refreshFromSupabase();
  }

  async function handleDeletePlayer(id: string) {
    if (mode !== "live" || !supabaseRef.current) {
      setPlayers(players.filter((player) => player.id !== id));
      return;
    }

    setIsSaving(true);
    const { error } = await supabaseRef.current.from("players").delete().eq("id", id);
    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    await refreshFromSupabase();
  }

  async function handleAddStaff() {
    if (!sName || !sRole) {
      setStatusMessage("Staff name and role are required.");
      return;
    }

    if (mode !== "live" || !supabaseRef.current) {
      const member: StaffMember = {
        id: Math.random().toString(36).slice(2, 11),
        name: sName,
        role: sRole,
        bio: sBio,
        imageUrl: sImageUrl || `https://picsum.photos/seed/s${Math.random()}/400/500`,
      };
      setStaff([...staff, member]);
      closeStaffDialog();
      return;
    }

    setIsSaving(true);
    const { error } = await supabaseRef.current.from("staff").insert({
      name: sName,
      role: sRole,
      bio: sBio || null,
      image_url: sImageUrl || null,
      is_active: true,
    });
    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    closeStaffDialog();
    await refreshFromSupabase();
  }

  async function handleDeleteStaff(id: string) {
    if (mode !== "live" || !supabaseRef.current) {
      setStaff(staff.filter((member) => member.id !== id));
      return;
    }

    setIsSaving(true);
    const { error } = await supabaseRef.current.from("staff").delete().eq("id", id);
    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    await refreshFromSupabase();
  }

  async function handleSignOut() {
    if (!supabaseRef.current) {
      router.push("/");
      return;
    }

    await supabaseRef.current.auth.signOut();
    router.replace("/login");
  }

  function closeFixtureDialog() {
    setIsAddFixtureOpen(false);
    setNewOpponent("");
    setNewDate("");
    setNewTime("");
    setNewVenue("");
  }

  function closePlayerDialog() {
    setIsAddPlayerOpen(false);
    setPName("");
    setPPos("");
    setPSecondPos("");
    setPHeight("");
    setPImageUrl("");
  }

  function closeStaffDialog() {
    setIsAddStaffOpen(false);
    setSName("");
    setSRole("");
    setSBio("");
    setSImageUrl("");
  }

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
                  Editor
                </span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className="uppercase tracking-widest text-[10px]">
                  Management
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={view === "fixtures"}
                        onClick={() => setView("fixtures")}
                        tooltip="Fixtures"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Fixtures & Results</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={view === "players"}
                        onClick={() => setView("players")}
                        tooltip="Players"
                      >
                        <Users className="h-4 w-4" />
                        <span>First Team Squad</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={view === "staff"}
                        onClick={() => setView("staff")}
                        tooltip="Staff"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Leadership & Staff</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <SidebarInset className="flex-1 bg-background">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator className="mr-2 h-4" orientation="vertical" />
              <h1 className="truncate text-sm font-bold uppercase tracking-tight sm:text-lg">
                {viewTitle}
              </h1>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant={mode === "live" ? "default" : "outline"}>
                  {mode === "live" ? "Supabase Live" : "Demo Mode"}
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
                <Card className="border-accent/20 bg-card/60">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Loading team data from Supabase...
                  </CardContent>
                </Card>
              ) : (
                <>
                  {view === "fixtures" && (
                    <div className="space-y-8">
                      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                          <h2 className="text-2xl font-black uppercase sm:text-3xl">
                            Match Center
                          </h2>
                          <p className="text-xs text-muted-foreground sm:text-sm">
                            Manage fixtures, results, and scorers.
                          </p>
                        </div>
                        <Dialog onOpenChange={setIsAddFixtureOpen} open={isAddFixtureOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full bg-accent font-bold text-accent-foreground sm:w-auto">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Fixture
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Add New Fixture</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label>Opponent</Label>
                                <Input
                                  onChange={(event) => setNewOpponent(event.target.value)}
                                  value={newOpponent}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label>Date</Label>
                                  <Input
                                    onChange={(event) => setNewDate(event.target.value)}
                                    type="date"
                                    value={newDate}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Time</Label>
                                  <Input
                                    onChange={(event) => setNewTime(event.target.value)}
                                    type="time"
                                    value={newTime}
                                  />
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label>Venue</Label>
                                <Input
                                  onChange={(event) => setNewVenue(event.target.value)}
                                  value={newVenue}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button className="w-full font-bold" disabled={isSaving} onClick={handleAddFixture}>
                                {isSaving ? "Saving..." : "Create Fixture"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <Tabs className="w-full" defaultValue="upcoming">
                        <TabsList className="mb-6 grid w-full max-w-[400px] grid-cols-2">
                          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                          <TabsTrigger value="completed">Results</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upcoming">
                          <Card className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Opponent</TableHead>
                                      <TableHead className="hidden sm:table-cell">
                                        DateTime
                                      </TableHead>
                                      <TableHead className="hidden md:table-cell">
                                        Venue
                                      </TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {fixtures
                                      .filter((fixture) => fixture.status === "upcoming")
                                      .map((fixture) => (
                                        <TableRow key={fixture.id}>
                                          <TableCell>
                                            <div className="font-bold">{fixture.opponent}</div>
                                            <div className="text-xs text-muted-foreground sm:hidden">
                                              {fixture.date} • {fixture.time}
                                            </div>
                                          </TableCell>
                                          <TableCell className="hidden text-sm sm:table-cell">
                                            {fixture.date} at {fixture.time}
                                          </TableCell>
                                          <TableCell className="hidden text-sm md:table-cell">
                                            {fixture.venue}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                              <Button
                                                className="h-8 text-xs"
                                                onClick={() => {
                                                  setSelectedFixture(fixture);
                                                  setMScore(fixture.result?.marinersScore ?? 0);
                                                  setOScore(fixture.result?.opponentScore ?? 0);
                                                  setMatchGoals(
                                                    fixture.result?.goals.map((goal) => ({
                                                      player: goal.player,
                                                      minute: goal.minute,
                                                      team: goal.team,
                                                    })) ?? []
                                                  );
                                                  setIsResultDialogOpen(true);
                                                }}
                                                size="sm"
                                                variant="outline"
                                              >
                                                Result
                                              </Button>
                                              <Button
                                                className="h-8 w-8 text-destructive"
                                                onClick={() => handleDeleteFixture(fixture.id)}
                                                size="icon"
                                                variant="ghost"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    {fixtures.filter((fixture) => fixture.status === "upcoming").length === 0 && (
                                      <TableRow>
                                        <TableCell className="py-12 text-center text-muted-foreground italic" colSpan={4}>
                                          No upcoming fixtures scheduled.
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                        <TabsContent value="completed">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {fixtures
                              .filter((fixture) => fixture.status === "completed")
                              .map((fixture) => (
                                <Card className="border-accent/20 bg-card/50 p-5" key={fixture.id}>
                                  <div className="mb-4 flex items-start justify-between">
                                    <div>
                                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-accent">
                                        {fixture.date}
                                      </p>
                                      <h3 className="text-base font-bold uppercase tracking-tight">
                                        Mariners{" "}
                                        <span className="mx-1 text-accent">
                                          {fixture.result?.marinersScore} - {fixture.result?.opponentScore}
                                        </span>{" "}
                                        {fixture.opponent}
                                      </h3>
                                    </div>
                                    <Button
                                      className="-mr-2 -mt-2 h-8 w-8 text-destructive"
                                      onClick={() => handleDeleteFixture(fixture.id)}
                                      size="icon"
                                      variant="ghost"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="space-y-2 border-t pt-3">
                                    {fixture.result?.goals.map((goal) => (
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground" key={goal.id}>
                                        <Trophy className="h-3 w-3 shrink-0 text-accent" />
                                        <span className="truncate">
                                          {goal.player} ({goal.minute}') - {goal.team}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </Card>
                              ))}
                            {fixtures.filter((fixture) => fixture.status === "completed").length === 0 && (
                              <div className="col-span-full rounded-xl border-2 border-dashed py-12 text-center italic text-muted-foreground">
                                No match results recorded yet.
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}

                  {view === "players" && (
                    <div className="space-y-8">
                      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                          <h2 className="text-2xl font-black uppercase sm:text-3xl">Roster</h2>
                          <p className="text-xs text-muted-foreground sm:text-sm">
                            Maintain the official player roster.
                          </p>
                        </div>
                        <Dialog onOpenChange={setIsAddPlayerOpen} open={isAddPlayerOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full bg-accent font-bold text-accent-foreground sm:w-auto">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Player
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Add New Player</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label>Name</Label>
                                <Input onChange={(event) => setPName(event.target.value)} value={pName} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label>Position</Label>
                                  <Input onChange={(event) => setPPos(event.target.value)} value={pPos} />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Second Position</Label>
                                  <Input
                                    onChange={(event) => setPSecondPos(event.target.value)}
                                    value={pSecondPos}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label>Height</Label>
                                  <Input
                                    onChange={(event) => setPHeight(event.target.value)}
                                    value={pHeight}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Image URL</Label>
                                  <Input
                                    onChange={(event) => setPImageUrl(event.target.value)}
                                    placeholder="https://..."
                                    value={pImageUrl}
                                  />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button className="w-full font-bold" disabled={isSaving} onClick={handleAddPlayer}>
                                {isSaving ? "Saving..." : "Save Player"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <Card className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[60px]">Img</TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead className="hidden sm:table-cell">Position</TableHead>
                                  <TableHead className="hidden md:table-cell">Height</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {players.map((player) => (
                                  <TableRow key={player.id}>
                                    <TableCell>
                                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-accent/20 bg-muted">
                                        <Image
                                          alt={player.name}
                                          className="object-cover"
                                          fill
                                          sizes="40px"
                                          src={player.imageUrl || "https://picsum.photos/seed/player-fallback/400/500"}
                                        />
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="font-bold">{player.name}</div>
                                      <div className="sm:hidden">
                                        <Badge className="px-1.5 py-0" variant="outline">
                                          {player.pos}
                                        </Badge>
                                      </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                      <Badge variant="outline">{player.pos}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                                      {player.height}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => handleDeletePlayer(player.id)}
                                        size="icon"
                                        variant="ghost"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {view === "staff" && (
                    <div className="space-y-8">
                      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                          <h2 className="text-2xl font-black uppercase sm:text-3xl">Staff</h2>
                          <p className="text-xs text-muted-foreground sm:text-sm">
                            Manage coaching and administrative roles.
                          </p>
                        </div>
                        <Dialog onOpenChange={setIsAddStaffOpen} open={isAddStaffOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full bg-accent font-bold text-accent-foreground sm:w-auto">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Staff Member
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Staff Member</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label>Name</Label>
                                <Input onChange={(event) => setSName(event.target.value)} value={sName} />
                              </div>
                              <div className="grid gap-2">
                                <Label>Role</Label>
                                <Input onChange={(event) => setSRole(event.target.value)} value={sRole} />
                              </div>
                              <div className="grid gap-2">
                                <Label>Image URL</Label>
                                <Input
                                  onChange={(event) => setSImageUrl(event.target.value)}
                                  placeholder="https://..."
                                  value={sImageUrl}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Bio</Label>
                                <Textarea onChange={(event) => setSBio(event.target.value)} value={sBio} />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button className="w-full font-bold" disabled={isSaving} onClick={handleAddStaff}>
                                {isSaving ? "Saving..." : "Save Member"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <Card className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[60px]">Img</TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Role</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {staff.map((member) => (
                                  <TableRow key={member.id}>
                                    <TableCell>
                                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-accent/20 bg-muted">
                                        <Image
                                          alt={member.name}
                                          className="object-cover"
                                          fill
                                          sizes="40px"
                                          src={member.imageUrl || "https://picsum.photos/seed/staff-fallback/400/500"}
                                        />
                                      </div>
                                    </TableCell>
                                    <TableCell className="font-bold">{member.name}</TableCell>
                                    <TableCell className="text-xs font-semibold uppercase tracking-wider text-accent sm:text-sm">
                                      {member.role}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => handleDeleteStaff(member.id)}
                                        size="icon"
                                        variant="ghost"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>

      <Dialog onOpenChange={setIsResultDialogOpen} open={isResultDialogOpen}>
        <DialogContent className="max-h-[90vh] w-[95%] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Enter Match Result</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/30 p-4 text-center sm:gap-8">
              <div>
                <Label className="text-[10px] font-bold text-accent sm:text-xs">MARINERS</Label>
                <Input
                  className="mt-1 text-center text-xl font-black sm:text-3xl"
                  onChange={(event) => setMScore(Number(event.target.value))}
                  type="number"
                  value={mScore}
                />
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase sm:text-xs">
                  {selectedFixture?.opponent || "OPPONENT"}
                </Label>
                <Input
                  className="mt-1 text-center text-xl font-black sm:text-3xl"
                  onChange={(event) => setOScore(Number(event.target.value))}
                  type="number"
                  value={oScore}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-widest sm:text-xs">
                  Goalscorers
                </h4>
                <Button
                  className="h-7 text-xs"
                  onClick={() =>
                    setMatchGoals([...matchGoals, { player: "", minute: 0, team: "Mariners" }])
                  }
                  size="sm"
                  variant="outline"
                >
                  Add Goal
                </Button>
              </div>
              <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
                {matchGoals.map((goal, index) => (
                  <div
                    className="flex flex-col gap-2 rounded-md border border-accent/10 bg-muted/20 p-3 sm:flex-row"
                    key={`${goal.player}-${index}`}
                  >
                    <div className="flex-1 space-y-1">
                      <Label className="text-[9px] uppercase text-muted-foreground">Player</Label>
                      <Input
                        className="h-8 text-sm"
                        onChange={(event) => {
                          const updatedGoals = [...matchGoals];
                          updatedGoals[index].player = event.target.value;
                          setMatchGoals(updatedGoals);
                        }}
                        placeholder="Player Name"
                        value={goal.player}
                      />
                    </div>
                    <div className="grid shrink-0 grid-cols-2 gap-2 sm:w-24 sm:grid-cols-1">
                      <div className="space-y-1">
                        <Label className="text-[9px] uppercase text-muted-foreground">Min</Label>
                        <Input
                          className="h-8 text-sm"
                          onChange={(event) => {
                            const updatedGoals = [...matchGoals];
                            updatedGoals[index].minute = Number(event.target.value);
                            setMatchGoals(updatedGoals);
                          }}
                          type="number"
                          value={goal.minute}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] uppercase text-muted-foreground">Team</Label>
                        <select
                          className="h-8 w-full rounded border bg-background px-2 text-xs"
                          onChange={(event) => {
                            const updatedGoals = [...matchGoals];
                            updatedGoals[index].team = event.target.value as Goal["team"];
                            setMatchGoals(updatedGoals);
                          }}
                          value={goal.team}
                        >
                          <option value="Mariners">Mariners</option>
                          <option value="Opponent">Opponent</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button
                        className="h-8 w-8 shrink-0 text-destructive"
                        onClick={() =>
                          setMatchGoals(matchGoals.filter((_, goalIndex) => goalIndex !== index))
                        }
                        size="icon"
                        variant="ghost"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {matchGoals.length === 0 && (
                  <p className="py-4 text-center text-[10px] italic text-muted-foreground">
                    No goals added for this match.
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="h-12 w-full bg-accent font-black text-accent-foreground"
              disabled={isSaving}
              onClick={handleSubmitResult}
            >
              {isSaving ? "Saving..." : "Record Final Result"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
