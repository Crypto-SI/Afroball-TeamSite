"use client";

import { useState } from "react";
import type { Fixture, Goal } from "@/lib/team-site-data";
import type { SupabaseClient, DashboardMode } from "../types";
import {
  createFixture,
  deleteFixture,
  getMutationErrorMessage,
  submitMatchResult,
} from "../dashboard-mutations";
import { DashboardSectionHeader } from "./dashboard-section-ui";
import { AddFixtureDialog, FixtureTabs } from "./fixture-management-ui";
import { MatchResultDialog } from "./match-result-dialog";

type Props = {
  fixtures: Fixture[];
  canEdit: boolean;
  mode: DashboardMode;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  setStatusMessage: (m: string | null) => void;
  setFixtures: (fixtures: Fixture[]) => void;
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
  setFixtures,
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
      const fixture: Fixture = {
        id: createDemoId("fixture"),
        opponent: newOpponent,
        date: newDate,
        time: newTime,
        venue: newVenue,
        status: "upcoming",
      };
      setFixtures([fixture, ...fixtures]);
      setStatusMessage("Fixture added (demo mode).");
      closeAddDialog();
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await createFixture(supabaseRef.current, {
        opponent: newOpponent,
        date: newDate,
        time: newTime,
        venue: newVenue,
      });

      if (error) {
        setStatusMessage(error.message);
        return;
      }

      closeAddDialog();
      await onRefresh();
    } catch (error) {
      setStatusMessage(getMutationErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (mode !== "live" || !supabaseRef.current) {
      setFixtures(fixtures.filter((fixture) => fixture.id !== id));
      setStatusMessage("Fixture deleted (demo mode).");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await deleteFixture(supabaseRef.current, id);

      if (error) {
        setStatusMessage(error.message);
        return;
      }
      await onRefresh();
    } catch (error) {
      setStatusMessage(getMutationErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmitResult() {
    if (!selectedFixture) return;

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
                    id: createDemoId("goal"),
                  })),
                },
              }
            : fixture
        )
      );
      setStatusMessage("Result submitted (demo mode).");
      setIsResultOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      const { error: rpcError } = await submitMatchResult(
        supabaseRef.current,
        selectedFixture.id,
        mScore,
        oScore,
        matchGoals
      );

      if (rpcError) {
        setStatusMessage(rpcError.message);
        return;
      }

      setIsResultOpen(false);
      await onRefresh();
    } catch (error) {
      setStatusMessage(getMutationErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
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
      <DashboardSectionHeader
        action={
          canCrud ? (
            <AddFixtureDialog
              date={newDate}
              isSaving={isSaving}
              onDateChange={setNewDate}
              onOpenChange={setIsAddOpen}
              onOpponentChange={setNewOpponent}
              onSubmit={handleAdd}
              onTimeChange={setNewTime}
              onVenueChange={setNewVenue}
              open={isAddOpen}
              opponent={newOpponent}
              time={newTime}
              venue={newVenue}
            />
          ) : null
        }
        description={canCrud ? "Manage fixtures, results, and scorers." : "View fixtures and results."}
        title="Match Center"
      />

      <FixtureTabs
        canCrud={canCrud}
        completed={completed}
        onDelete={handleDelete}
        onOpenResult={openResultDialog}
        upcoming={upcoming}
      />

      {canCrud && (
        <MatchResultDialog
          goals={matchGoals}
          isSaving={isSaving}
          marinersScore={mScore}
          onGoalsChange={setMatchGoals}
          onMarinersScoreChange={setMScore}
          onOpenChange={setIsResultOpen}
          onOpponentScoreChange={setOScore}
          onSubmit={handleSubmitResult}
          open={isResultOpen}
          opponentScore={oScore}
          selectedFixture={selectedFixture}
        />
      )}
    </div>
  );
}

function createDemoId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
