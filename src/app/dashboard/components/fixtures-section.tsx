"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Fixture, Goal } from "@/lib/team-site-data";
import type { SupabaseClient, DashboardMode } from "../types";

type Props = {
  fixtures: Fixture[];
  canEdit: boolean;
  mode: DashboardMode;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  setStatusMessage: (m: string | null) => void;
  onRefresh: () => Promise<void>;
  supabaseRef: React.MutableRefObject<SupabaseClient | null>;
};

export function FixturesSection({
  fixtures,
  canEdit: canCrud,
  mode,
  isSaving,
  setIsSaving,
  setStatusMessage,
  onRefresh,
  supabaseRef,
}: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  const [newOpponent, setNewOpponent] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [mScore, setMScore] = useState(0);
  const [oScore, setOScore] = useState(0);
  const [matchGoals, setMatchGoals] = useState<Omit<Goal, "id">[]>([]);

  const upcoming = fixtures.filter((f) => f.status === "upcoming");
  const completed = fixtures.filter((f) => f.status === "completed");

  async function handleAdd() {
    if (!newOpponent || !newDate || !newTime || !newVenue) {
      setStatusMessage("Fill in opponent, date, time, and venue before saving.");
      return;
    }

    if (mode !== "live" || !supabaseRef.current) {
      setStatusMessage("Fixture added (demo mode).");
      closeAddDialog();
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

    closeAddDialog();
    await onRefresh();
  }

  async function handleDelete(id: string) {
    if (mode !== "live" || !supabaseRef.current) {
      setStatusMessage("Fixture deleted (demo mode).");
      return;
    }

    setIsSaving(true);
    const { error } = await supabaseRef.current.from("fixtures").delete().eq("id", id);
    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }
    await onRefresh();
  }

  async function handleSubmitResult() {
    if (!selectedFixture) return;

    if (mode !== "live" || !supabaseRef.current) {
      setStatusMessage("Result submitted (demo mode).");
      setIsResultOpen(false);
      return;
    }

    setIsSaving(true);
    const { error: rpcError } = await supabaseRef.current.rpc("submit_match_result", {
      p_fixture_id: selectedFixture.id,
      p_mariners_score: mScore,
      p_opponent_score: oScore,
      p_goals: matchGoals.map((goal) => ({
        player_name: goal.player,
        minute: Number(goal.minute),
        team: goal.team,
      })),
    });

    if (rpcError) {
      setIsSaving(false);
      setStatusMessage(rpcError.message);
      return;
    }

    setIsSaving(false);
    setIsResultOpen(false);
    await onRefresh();
  }

  function closeAddDialog() {
    setIsAddOpen(false);
    setNewOpponent("");
    setNewDate("");
    setNewTime("");
    setNewVenue("");
  }

  function openResultDialog(fixture: Fixture) {
    setSelectedFixture(fixture);
    setMScore(fixture.result?.marinersScore ?? 0);
    setOScore(fixture.result?.opponentScore ?? 0);
    setMatchGoals(
      fixture.result?.goals.map((g) => ({
        player: g.player,
        minute: g.minute,
        team: g.team,
      })) ?? []
    );
    setIsResultOpen(true);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black uppercase sm:text-3xl">Match Center</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {canCrud ? "Manage fixtures, results, and scorers." : "View fixtures and results."}
          </p>
        </div>
        {canCrud && (
          <Dialog onOpenChange={setIsAddOpen} open={isAddOpen}>
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
                  <Input onChange={(e) => setNewOpponent(e.target.value)} value={newOpponent} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Date</Label>
                    <Input onChange={(e) => setNewDate(e.target.value)} type="date" value={newDate} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Time</Label>
                    <Input onChange={(e) => setNewTime(e.target.value)} type="time" value={newTime} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Venue</Label>
                  <Input onChange={(e) => setNewVenue(e.target.value)} value={newVenue} />
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full font-bold" disabled={isSaving} onClick={handleAdd}>
                  {isSaving ? "Saving..." : "Create Fixture"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
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
                      <TableHead className="hidden sm:table-cell">DateTime</TableHead>
                      <TableHead className="hidden md:table-cell">Venue</TableHead>
                      {canCrud && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcoming.map((fixture) => (
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
                        {canCrud && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                className="h-8 text-xs"
                                onClick={() => openResultDialog(fixture)}
                                size="sm"
                                variant="outline"
                              >
                                Result
                              </Button>
                              <Button
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDelete(fixture.id)}
                                size="icon"
                                variant="ghost"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {upcoming.length === 0 && (
                      <TableRow>
                        <TableCell className="py-12 text-center text-muted-foreground italic" colSpan={canCrud ? 4 : 3}>
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
            {completed.map((fixture) => (
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
                  {canCrud && (
                    <Button
                      className="-mr-2 -mt-2 h-8 w-8 text-destructive"
                      onClick={() => handleDelete(fixture.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
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
            {completed.length === 0 && (
              <div className="col-span-full rounded-xl border-2 border-dashed py-12 text-center italic text-muted-foreground">
                No match results recorded yet.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Match Result Dialog ─────────────────────────────────────────── */}
      {canCrud && (
        <Dialog onOpenChange={setIsResultOpen} open={isResultOpen}>
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
                    onChange={(e) => setMScore(Number(e.target.value))}
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
                    onChange={(e) => setOScore(Number(e.target.value))}
                    type="number"
                    value={oScore}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest sm:text-xs">Goalscorers</h4>
                  <Button
                    className="h-7 text-xs"
                    onClick={() => setMatchGoals([...matchGoals, { player: "", minute: 0, team: "Mariners" }])}
                    size="sm"
                    variant="outline"
                  >
                    Add Goal
                  </Button>
                </div>
                <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
                  {matchGoals.map((goal, index) => (
                    <div className="flex flex-col gap-2 rounded-md border border-accent/10 bg-muted/20 p-3 sm:flex-row" key={`${goal.player}-${index}`}>
                      <div className="flex-1 space-y-1">
                        <Label className="text-[9px] uppercase text-muted-foreground">Player</Label>
                        <Input
                          className="h-8 text-sm"
                          onChange={(e) => {
                            const updated = [...matchGoals];
                            updated[index].player = e.target.value;
                            setMatchGoals(updated);
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
                            onChange={(e) => {
                              const updated = [...matchGoals];
                              updated[index].minute = Number(e.target.value);
                              setMatchGoals(updated);
                            }}
                            type="number"
                            value={goal.minute}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] uppercase text-muted-foreground">Team</Label>
                          <select
                            className="h-8 w-full rounded border bg-background px-2 text-xs"
                            onChange={(e) => {
                              const updated = [...matchGoals];
                              updated[index].team = e.target.value as Goal["team"];
                              setMatchGoals(updated);
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
                          onClick={() => setMatchGoals(matchGoals.filter((_, i) => i !== index))}
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
      )}
    </div>
  );
}
