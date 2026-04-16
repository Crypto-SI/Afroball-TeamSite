import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPlayers, getSiteSettings } from "@/lib/team-data-loaders";

export default async function PlayersPage() {
  const [players, settings] = await Promise.all([getPlayers(), getSiteSettings()]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl mb-4">THE FIRST TEAM</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Meet the warriors representing Toman Mariners FC on the pitch. Dedication, skill, and heart.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((player, index) => (
              <Card key={player.id} className="group overflow-hidden bg-card border-accent/10 hover:border-accent/30 transition-all">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={player.imageUrl || "https://picsum.photos/seed/player-fallback/400/500"}
                    alt={player.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    data-ai-hint="soccer athlete"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="text-6xl font-black text-white/20 italic">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <CardHeader className="p-6">
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <h3 className="text-2xl font-bold">{player.name}</h3>
                    <Badge variant="secondary" className="bg-primary/40 text-accent">{player.pos}</Badge>
                  </div>
                  <CardContent className="p-0 text-muted-foreground text-sm">
                    {player.secondPos ? `${player.secondPos} option` : "First team squad member"}
                    {player.height ? ` • ${player.height}` : ""}
                  </CardContent>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
