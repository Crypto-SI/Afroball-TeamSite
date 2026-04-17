"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Fixture, Goal } from "@/lib/team-site-data";
import { DeleteIconButton } from "./dashboard-section-ui";

type MatchResultDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFixture: Fixture | null;
  marinersScore: number;
  opponentScore: number;
  goals: Omit<Goal, "id">[];
  isSaving: boolean;
  onMarinersScoreChange: (score: number) => void;
  onOpponentScoreChange: (score: number) => void;
  onGoalsChange: (goals: Omit<Goal, "id">[]) => void;
  onSubmit: () => void;
};

export function MatchResultDialog({
  open,
  onOpenChange,
  selectedFixture,
  marinersScore,
  opponentScore,
  goals,
  isSaving,
  onMarinersScoreChange,
  onOpponentScoreChange,
  onGoalsChange,
  onSubmit,
}: MatchResultDialogProps) {
  function updateGoal(index: number, updates: Partial<Omit<Goal, "id">>) {
    const updated = [...goals];
    updated[index] = { ...updated[index], ...updates };
    onGoalsChange(updated);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
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
                onChange={(e) => onMarinersScoreChange(Number(e.target.value))}
                type="number"
                value={marinersScore}
              />
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase sm:text-xs">
                {selectedFixture?.opponent || "OPPONENT"}
              </Label>
              <Input
                className="mt-1 text-center text-xl font-black sm:text-3xl"
                onChange={(e) => onOpponentScoreChange(Number(e.target.value))}
                type="number"
                value={opponentScore}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-widest sm:text-xs">Goalscorers</h4>
              <Button
                className="h-7 text-xs"
                onClick={() => onGoalsChange([...goals, { player: "", minute: 0, team: "Mariners" }])}
                size="sm"
                variant="outline"
              >
                Add Goal
              </Button>
            </div>
            <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
              {goals.map((goal, index) => (
                <div className="flex flex-col gap-2 rounded-md border border-accent/10 bg-muted/20 p-3 sm:flex-row" key={`${goal.player}-${index}`}>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[9px] uppercase text-muted-foreground">Player</Label>
                    <Input
                      className="h-8 text-sm"
                      onChange={(e) => updateGoal(index, { player: e.target.value })}
                      placeholder="Player Name"
                      value={goal.player}
                    />
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-2 sm:w-24 sm:grid-cols-1">
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase text-muted-foreground">Min</Label>
                      <Input
                        className="h-8 text-sm"
                        onChange={(e) => updateGoal(index, { minute: Number(e.target.value) })}
                        type="number"
                        value={goal.minute}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase text-muted-foreground">Team</Label>
                      <select
                        className="h-8 w-full rounded border bg-background px-2 text-xs"
                        onChange={(e) => updateGoal(index, { team: e.target.value as Goal["team"] })}
                        value={goal.team}
                      >
                        <option value="Mariners">Mariners</option>
                        <option value="Opponent">Opponent</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <DeleteIconButton
                      className="h-8 w-8 shrink-0 text-destructive"
                      iconClassName="h-3 w-3"
                      onClick={() => onGoalsChange(goals.filter((_, goalIndex) => goalIndex !== index))}
                    />
                  </div>
                </div>
              ))}
              {goals.length === 0 && (
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
            onClick={onSubmit}
          >
            {isSaving ? "Saving..." : "Record Final Result"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
