"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
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
import type { Player } from "@/lib/team-site-data";
import type { SupabaseClient, DashboardMode } from "../types";

type Props = {
  players: Player[];
  canEdit: boolean;
  mode: DashboardMode;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  setStatusMessage: (m: string | null) => void;
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
      setStatusMessage("Player added (demo mode).");
      closeDialog();
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

    closeDialog();
    await onRefresh();
  }

  async function handleDelete(id: string) {
    if (mode !== "live" || !supabaseRef.current) {
      setStatusMessage("Player removed (demo mode).");
      return;
    }

    setIsSaving(true);
    const { error } = await supabaseRef.current.from("players").delete().eq("id", id);
    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }
    await onRefresh();
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
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black uppercase sm:text-3xl">Roster</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {canCrud ? "Maintain the official player roster." : "View the official player roster."}
          </p>
        </div>
        {canCrud && (
          <Dialog onOpenChange={setIsAddOpen} open={isAddOpen}>
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
                  <Input onChange={(e) => setPName(e.target.value)} value={pName} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Position</Label>
                    <Input onChange={(e) => setPPos(e.target.value)} value={pPos} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Second Position</Label>
                    <Input onChange={(e) => setPSecondPos(e.target.value)} value={pSecondPos} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
              <DialogFooter>
                <Button className="w-full font-bold" disabled={isSaving} onClick={handleAdd}>
                  {isSaving ? "Saving..." : "Save Player"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
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
                        <Button
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(player.id)}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
