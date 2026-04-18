"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
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
import type { Player } from "@/lib/team-site-data";
import type { SupabaseClient, DashboardMode } from "../types";
import { createPlayer, deletePlayer, getMutationErrorMessage } from "../dashboard-mutations";
import { CrudDialog, DashboardSectionHeader, DeleteIconButton } from "./dashboard-section-ui";

type Props = {
  players: Player[];
  canEdit: boolean;
  mode: DashboardMode;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  setStatusMessage: (m: string | null) => void;
  setPlayers: (players: Player[]) => void;
  onRefresh: () => Promise<void>;
  supabaseRef: React.MutableRefObject<SupabaseClient | null>;
};

export function PlayersSection({
  players,
  canEdit: canCrud,
  mode,
  isSaving,
  setIsSaving,
  setStatusMessage,
  setPlayers,
  onRefresh,
  supabaseRef,
}: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pName, setPName] = useState("");
  const [pPos, setPPos] = useState("");
  const [pSecondPos, setPSecondPos] = useState("");
  const [pHeight, setPHeight] = useState("");
  const [pImageUrl, setPImageUrl] = useState("");

  async function handleAdd() {
    if (!pName || !pPos) {
      setStatusMessage("Player name and primary position are required.");
      return;
    }

    if (mode !== "live" || !supabaseRef.current) {
      const player: Player = {
        id: createDemoId("player"),
        name: pName,
        pos: pPos,
        secondPos: pSecondPos,
        height: pHeight,
        imageUrl: pImageUrl || "https://picsum.photos/seed/player-demo/400/500",
      };
      setPlayers([...players, player]);
      setStatusMessage("Player added (demo mode).");
      closeDialog();
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await createPlayer(supabaseRef.current, {
        name: pName,
        pos: pPos,
        secondPos: pSecondPos,
        height: pHeight,
        imageUrl: pImageUrl,
      });

      if (error) {
        setStatusMessage(error.message);
        return;
      }

      closeDialog();
      await onRefresh();
    } catch (error) {
      setStatusMessage(getMutationErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (mode !== "live" || !supabaseRef.current) {
      setPlayers(players.filter((player) => player.id !== id));
      setStatusMessage("Player removed (demo mode).");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await deletePlayer(supabaseRef.current, id);

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

  function closeDialog() {
    setIsAddOpen(false);
    setPName("");
    setPPos("");
    setPSecondPos("");
    setPHeight("");
    setPImageUrl("");
  }

  return (
    <div className="space-y-8">
      <DashboardSectionHeader
        title="Roster"
        description={canCrud ? "Maintain the official player roster." : "View the official player roster."}
        action={
          canCrud ? (
            <CrudDialog
              contentClassName="sm:max-w-[500px]"
              isSaving={isSaving}
              onOpenChange={setIsAddOpen}
              onSubmit={handleAdd}
              open={isAddOpen}
              submitLabel="Save Player"
              title="Add New Player"
              triggerLabel="Add Player"
            >
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input onChange={(e) => setPName(e.target.value)} value={pName} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Position</Label>
                    <Input onChange={(e) => setPPos(e.target.value)} value={pPos} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Second Position</Label>
                    <Input onChange={(e) => setPSecondPos(e.target.value)} value={pSecondPos} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Height</Label>
                    <Input onChange={(e) => setPHeight(e.target.value)} value={pHeight} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Image URL</Label>
                    <Input onChange={(e) => setPImageUrl(e.target.value)} placeholder="https://..." value={pImageUrl} />
                  </div>
                </div>
              </div>
            </CrudDialog>
          ) : null
        }
      />

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
                  {canCrud && <TableHead className="text-right">Actions</TableHead>}
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
                        <Badge className="px-1.5 py-0" variant="outline">{player.pos}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{player.pos}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {player.height}
                    </TableCell>
                    {canCrud && (
                      <TableCell className="text-right">
                        <DeleteIconButton onClick={() => handleDelete(player.id)} />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function createDemoId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
