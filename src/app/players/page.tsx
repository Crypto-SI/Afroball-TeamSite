import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SQUAD = [
  { id: 1, name: "Leo Marino", pos: "Defender", no: "4", bio: "The rock of the defense and club captain.", img: "player-1" },
  { id: 2, name: "Elias Thorne", pos: "Forward", no: "9", bio: "A clinical finisher with a record-breaking season.", img: "player-2" },
  { id: 3, name: "Samir Vance", pos: "Midfielder", no: "10", bio: "The engine room of the Mariners, master of the assist.", img: "player-1" },
  { id: 4, name: "Jack Port", pos: "Goalkeeper", no: "1", bio: "Safest hands in the league with 12 clean sheets.", img: "player-3" },
  { id: 5, name: "Milo Wave", pos: "Defender", no: "3", bio: "Explosive full-back known for his pace.", img: "player-2" },
  { id: 6, name: "Adrian Fleet", pos: "Forward", no: "7", bio: "Speedy winger who creates havoc on the flanks.", img: "player-1" },
];

export default function PlayersPage() {
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
            {SQUAD.map((player) => {
              const img = PlaceHolderImages.find(i => i.id === player.img);
              return (
                <Card key={player.id} className="group overflow-hidden bg-card border-accent/10 hover:border-accent/30 transition-all">
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={img?.imageUrl || ""}
                      alt={player.name}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      data-ai-hint="soccer athlete"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="text-6xl font-black text-white/20 italic">{player.no}</span>
                    </div>
                  </div>
                  <CardHeader className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold">{player.name}</h3>
                      <Badge variant="secondary" className="bg-primary/40 text-accent">{player.pos}</Badge>
                    </div>
                    <CardContent className="p-0 text-muted-foreground text-sm">
                      {player.bio}
                    </CardContent>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}