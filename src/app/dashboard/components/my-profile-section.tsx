"use client";

import { useState } from "react";
import Image from "next/image";
import { Save, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Player } from "@/lib/team-site-data";
import type { SupabaseClient, DashboardMode } from "../types";

type Props = {
  userId: string | null;
  players: Player[];
  mode: DashboardMode;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  setStatusMessage: (m: string | null) => void;
  onRefresh: () => Promise<void>;
  supabaseRef: React.MutableRefObject<SupabaseClient | null>;
};

export function MyProfileSection({
  userId,
  players,
  mode,
  isSaving,
  setIsSaving,
  setStatusMessage,
  onRefresh,
  supabaseRef,
}: Props) {
  // In a real implementation, the player row would have a user_id column
  // matching the logged-in user. For now, we show the first player as a demo.
  const myPlayer = players[0] ?? null;

  const [name, setName] = useState(myPlayer?.name ?? "");
  const [pos, setPos] = useState(myPlayer?.pos ?? "");
  const [secondPos, setSecondPos] = useState(myPlayer?.secondPos ?? "");
  const [height, setHeight] = useState(myPlayer?.height ?? "");
  const [imageUrl, setImageUrl] = useState(myPlayer?.imageUrl ?? "");

  async function handleSave() {
    if (!myPlayer) {
      setStatusMessage("No linked player profile found.");
      return;
    }

    if (mode !== "live" || !supabaseRef.current) {
      setStatusMessage("Profile saved (demo mode).");
      return;
    }

    setIsSaving(true);
    const { error } = await supabaseRef.current
      .from("players")
      .update({
        name,
        pos,
        second_pos: secondPos || null,
        height: height || null,
        image_url: imageUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", myPlayer.id);
    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    setStatusMessage("Profile updated successfully.");
    await onRefresh();
  }

  if (!myPlayer) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-black uppercase sm:text-3xl">My Profile</h2>
        <Card className="border-accent/10 bg-card/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            <User className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            No linked player profile found. Contact your club admin to link your account.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black uppercase sm:text-3xl">My Profile</h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Edit your personal player information.
        </p>
      </div>

      {/* Profile Card Preview */}
      <Card className="border-accent/20 bg-card/50">
        <CardContent className="flex items-center gap-6 p-6">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-accent/30 bg-muted">
            <Image
              alt={name}
              className="object-cover"
              fill
              sizes="96px"
              src={imageUrl || "https://picsum.photos/seed/player-fallback/400/500"}
            />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase">{name || "Your Name"}</h3>
            <div className="mt-1 flex gap-2">
              {pos && <Badge variant="outline">{pos}</Badge>}
              {secondPos && <Badge variant="secondary">{secondPos}</Badge>}
            </div>
            {height && <p className="mt-1 text-sm text-muted-foreground">{height}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="border-accent/10 bg-card/50">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase tracking-widest text-accent">
            Edit Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input onChange={(e) => setName(e.target.value)} value={name} />
          </div>
          <div className="grid gap-2">
            <Label>Primary Position</Label>
            <Input onChange={(e) => setPos(e.target.value)} value={pos} />
          </div>
          <div className="grid gap-2">
            <Label>Second Position</Label>
            <Input onChange={(e) => setSecondPos(e.target.value)} value={secondPos} />
          </div>
          <div className="grid gap-2">
            <Label>Height</Label>
            <Input onChange={(e) => setHeight(e.target.value)} value={height} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Image URL</Label>
            <Input
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              value={imageUrl}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        className="bg-accent font-bold text-accent-foreground"
        disabled={isSaving}
        onClick={handleSave}
      >
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  );
}
