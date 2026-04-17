"use client";

import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import type { Fixture } from "@/lib/team-site-data";
import { CrudDialog, DeleteIconButton, EmptyTableRow } from "./dashboard-section-ui";

type AddFixtureDialogProps = {
  open: boolean;
  isSaving: boolean;
  opponent: string;
  date: string;
  time: string;
  venue: string;
  onOpenChange: (open: boolean) => void;
  onOpponentChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onVenueChange: (value: string) => void;
  onSubmit: () => void;
};

export function AddFixtureDialog({
  open,
  isSaving,
  opponent,
  date,
  time,
  venue,
  onOpenChange,
  onOpponentChange,
  onDateChange,
  onTimeChange,
  onVenueChange,
  onSubmit,
}: AddFixtureDialogProps) {
  return (
    <CrudDialog
      contentClassName="sm:max-w-[500px]"
      isSaving={isSaving}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      open={open}
      submitLabel="Create Fixture"
      title="Add New Fixture"
      triggerLabel="Add Fixture"
    >
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label>Opponent</Label>
          <Input onChange={(event) => onOpponentChange(event.target.value)} value={opponent} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Date</Label>
            <Input onChange={(event) => onDateChange(event.target.value)} type="date" value={date} />
          </div>
          <div className="grid gap-2">
            <Label>Time</Label>
            <Input onChange={(event) => onTimeChange(event.target.value)} type="time" value={time} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Venue</Label>
          <Input onChange={(event) => onVenueChange(event.target.value)} value={venue} />
        </div>
      </div>
    </CrudDialog>
  );
}

type FixtureTabsProps = {
  upcoming: Fixture[];
  completed: Fixture[];
  canCrud: boolean;
  onDelete: (fixtureId: string) => void;
  onOpenResult: (fixture: Fixture) => void;
};

export function FixtureTabs({
  upcoming,
  completed,
  canCrud,
  onDelete,
  onOpenResult,
}: FixtureTabsProps) {
  return (
    <Tabs className="w-full" defaultValue="upcoming">
      <TabsList className="mb-6 grid w-full max-w-[400px] grid-cols-2">
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="completed">Results</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">
        <UpcomingFixturesTable
          canCrud={canCrud}
          fixtures={upcoming}
          onDelete={onDelete}
          onOpenResult={onOpenResult}
        />
      </TabsContent>

      <TabsContent value="completed">
        <CompletedFixturesGrid canCrud={canCrud} fixtures={completed} onDelete={onDelete} />
      </TabsContent>
    </Tabs>
  );
}

type UpcomingFixturesTableProps = {
  fixtures: Fixture[];
  canCrud: boolean;
  onDelete: (fixtureId: string) => void;
  onOpenResult: (fixture: Fixture) => void;
};

function UpcomingFixturesTable({
  fixtures,
  canCrud,
  onDelete,
  onOpenResult,
}: UpcomingFixturesTableProps) {
  return (
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
              {fixtures.map((fixture) => (
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
                  <TableCell className="hidden text-sm md:table-cell">{fixture.venue}</TableCell>
                  {canCrud && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          className="h-8 text-xs"
                          onClick={() => onOpenResult(fixture)}
                          size="sm"
                          variant="outline"
                        >
                          Result
                        </Button>
                        <DeleteIconButton onClick={() => onDelete(fixture.id)} />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {fixtures.length === 0 && (
                <EmptyTableRow colSpan={canCrud ? 4 : 3}>
                  No upcoming fixtures scheduled.
                </EmptyTableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

type CompletedFixturesGridProps = {
  fixtures: Fixture[];
  canCrud: boolean;
  onDelete: (fixtureId: string) => void;
};

function CompletedFixturesGrid({ fixtures, canCrud, onDelete }: CompletedFixturesGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {fixtures.map((fixture) => (
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
              <DeleteIconButton
                className="-mr-2 -mt-2 h-8 w-8 text-destructive"
                onClick={() => onDelete(fixture.id)}
              />
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
      {fixtures.length === 0 && (
        <div className="col-span-full rounded-xl border-2 border-dashed py-12 text-center italic text-muted-foreground">
          No match results recorded yet.
        </div>
      )}
    </div>
  );
}
