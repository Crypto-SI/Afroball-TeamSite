"use client";

import { useState } from "react";
import { ExternalLink, Plus, Trash2, Video } from "lucide-react";
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
import type { Fixture } from "@/lib/team-site-data";
import type { Database } from "@/types/database";
import type { SupabaseClient, DashboardMode } from "../types";
import { createFixtureMedia, deleteFixtureMedia, getMutationErrorMessage } from "../dashboard-mutations";

type FixtureMediaRow = Database["public"]["Tables"]["fixture_media"]["Row"];

type Props = {
  media: FixtureMediaRow[];
  fixtures: Fixture[];
  canEdit: boolean;
  mode: DashboardMode;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  setStatusMessage: (m: string | null) => void;
  setMedia: (m: FixtureMediaRow[]) => void;
  supabaseRef: React.MutableRefObject<SupabaseClient | null>;
};

export function FixtureMediaSection({
  media,
  fixtures,
  canEdit: canCrud,
  mode,
  isSaving,
  setIsSaving,
  setStatusMessage,
  setMedia,
  supabaseRef,
}: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [fixtureId, setFixtureId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");

  function getFixtureOpponent(fId: string): string {
    return fixtures.find((f) => f.id === fId)?.opponent ?? "Unknown Fixture";
  }

  async function handleAdd() {
    if (!fixtureId || !videoUrl) {
      setStatusMessage("Select a fixture and enter a video URL.");
      return;
    }

    if (mode !== "live" || !supabaseRef.current) {
      setMedia([
        {
          id: createDemoId("media"),
          fixture_id: fixtureId,
          video_url: videoUrl,
          title: title || null,
          created_by: null,
          created_at: new Date().toISOString(),
        },
        ...media,
      ]);
      setStatusMessage("Media added (demo mode).");
      closeDialog();
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await createFixtureMedia(supabaseRef.current, {
        fixtureId,
        videoUrl,
        title,
      });

      if (error) {
        setStatusMessage(error.message);
        return;
      }

      if (data) {
        setMedia([...(data as FixtureMediaRow[]), ...media]);
      }
      closeDialog();
    } catch (error) {
      setStatusMessage(getMutationErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (mode !== "live" || !supabaseRef.current) {
      setMedia(media.filter((m) => m.id !== id));
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await deleteFixtureMedia(supabaseRef.current, id);

      if (error) {
        setStatusMessage(error.message);
        return;
      }
      setMedia(media.filter((m) => m.id !== id));
    } catch (error) {
      setStatusMessage(getMutationErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function closeDialog() {
    setIsAddOpen(false);
    setFixtureId("");
    setVideoUrl("");
    setTitle("");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black uppercase sm:text-3xl">Fixture Media</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {canCrud ? "Manage video links for fixtures." : "View video links for fixtures."}
          </p>
        </div>
        {canCrud && (
          <Dialog onOpenChange={setIsAddOpen} open={isAddOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-accent font-bold text-accent-foreground sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Media
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Fixture Media</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Fixture</Label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    onChange={(e) => setFixtureId(e.target.value)}
                    value={fixtureId}
                  >
                    <option value="">Select a fixture...</option>
                    {fixtures.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.opponent} — {f.date}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Video URL</Label>
                  <Input
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    value={videoUrl}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Title (optional)</Label>
                  <Input onChange={(e) => setTitle(e.target.value)} placeholder="Match Highlights" value={title} />
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full font-bold" disabled={isSaving} onClick={handleAdd}>
                  {isSaving ? "Saving..." : "Save Media"}
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
                  <TableHead>Fixture</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Video</TableHead>
                  {canCrud && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {media.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-bold">
                      {getFixtureOpponent(item.fixture_id)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.title || "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <a
                        className="flex items-center gap-1 text-xs text-accent hover:underline"
                        href={item.video_url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Watch
                      </a>
                    </TableCell>
                    {canCrud && (
                      <TableCell className="text-right">
                        <Button
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(item.id)}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {media.length === 0 && (
                  <TableRow>
                    <TableCell className="py-12 text-center text-muted-foreground italic" colSpan={canCrud ? 4 : 3}>
                      <Video className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                      No media uploaded yet.
                    </TableCell>
                  </TableRow>
                )}
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
