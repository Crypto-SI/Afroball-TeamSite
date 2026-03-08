import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy, ArrowRight } from "lucide-react";
import { AIMatchInsight } from "@/components/ai-match-insight";

export default function Home() {
  const stadiumImg = PlaceHolderImages.find(img => img.id === "hero-stadium");
  
  const lastMatchReport = "Toman Mariners secured a crucial 3-1 victory against Southern Anchors last Saturday. Captain Leo Marino opened the scoring in the 12th minute with a thunderous volley. The Anchors equalized just before halftime, but a double from star striker Elias Thorne in the 67th and 82nd minutes sealed the points for the Mariners at the Mariner Dome. Team spirit was high as the defense held firm under late pressure.";
  
  const nextMatchInfo = "Next Saturday at 18:00, Toman Mariners face the league leaders, Northern Gulls, at the Gulls' Nest. This top-of-the-table clash is expected to be a sell-out. The Mariners are coming off a win, while the Gulls are unbeaten in their last five. Tactical discipline will be key as Thorne looks to continue his scoring streak.";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[70vh] sm:h-[80vh] w-full overflow-hidden">
          <Image
            src={stadiumImg?.imageUrl || ""}
            alt={stadiumImg?.description || "Stadium"}
            fill
            className="object-cover opacity-60"
            priority
            data-ai-hint={stadiumImg?.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <Badge variant="secondary" className="mb-4 bg-accent/20 text-accent border-accent/30 px-4 py-1">
              Matchday Preview
            </Badge>
            <h1 className="mb-6 text-4xl font-black tracking-tighter sm:text-7xl lg:text-8xl uppercase leading-tight">
              CHASING <span className="text-accent italic">GLORY.</span>
            </h1>
            <p className="max-w-xl mb-8 text-base text-muted-foreground sm:text-xl">
              Experience the roar of the crowd at Mariner Dome. Join us as we set sail for another championship season.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Link href="/tickets" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8">
                  GET TICKETS
                </Button>
              </Link>
              <Link href="/players" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-accent text-accent hover:bg-accent/10 h-12 px-8">
                  FIRST TEAM SQUAD
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Match Center */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Latest Result */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">LATEST RESULT</h2>
                <Badge variant="outline">League Match</Badge>
              </div>
              <Card className="bg-card border-accent/20 overflow-hidden">
                <div className="p-6 sm:p-10 flex items-center justify-center gap-4 sm:gap-10 bg-gradient-to-br from-primary/20 to-accent/10">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/40 flex items-center justify-center mb-2 mx-auto">
                      <Trophy className="text-accent h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm block">MARINERS</span>
                  </div>
                  <div className="text-4xl sm:text-6xl font-black flex items-center gap-3">
                    <span>3</span>
                    <span className="text-accent text-xl sm:text-3xl">-</span>
                    <span>1</span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mb-2 mx-auto">
                      <div className="text-xl sm:text-2xl font-bold text-muted-foreground">SA</div>
                    </div>
                    <span className="font-bold text-xs sm:text-sm block">ANCHORS</span>
                  </div>
                </div>
                <CardContent className="pt-6">
                  <CardTitle className="mb-2 text-xl sm:text-2xl">Mariners Dominate Anchors at Home</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {lastMatchReport}
                  </CardDescription>
                  <div className="mt-6">
                    <AIMatchInsight title="Latest Result" context={lastMatchReport} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Fixture */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">NEXT FIXTURE</h2>
                <Link href="/tickets">
                  <Button variant="link" className="text-accent p-0 flex items-center gap-1 text-sm">
                    Tickets Available <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <Card className="bg-card border-primary/20">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Vs. Northern Gulls</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Saturday, Oct 21 • 18:00</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-accent" />
                    The Gulls' Nest, North Harbor
                  </div>
                  <div className="mt-4">
                    <AIMatchInsight title="Upcoming Fixture" context={nextMatchInfo} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Quick Links / CTA Section */}
        <section className="bg-primary/10 py-16 md:py-24">
          <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <Link href="/merch" className="group">
              <div className="relative h-56 sm:h-64 overflow-hidden rounded-2xl border border-accent/20 transition-transform group-hover:scale-[1.02]">
                <Image
                  src={PlaceHolderImages.find(i => i.id === "merch-kit")?.imageUrl || ""}
                  alt="Merch"
                  fill
                  className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                  data-ai-hint="soccer jersey"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute bottom-6 left-6 pr-6">
                  <h3 className="text-xl sm:text-2xl font-bold">OFFICIAL SHOP</h3>
                  <p className="text-accent flex items-center gap-2 text-sm font-semibold">Explore the new kit <ArrowRight className="h-4 w-4" /></p>
                </div>
              </div>
            </Link>
            
            <Link href="/players" className="group">
              <div className="relative h-56 sm:h-64 overflow-hidden rounded-2xl border border-accent/20 transition-transform group-hover:scale-[1.02]">
                <Image
                  src={PlaceHolderImages.find(i => i.id === "player-2")?.imageUrl || ""}
                  alt="Players"
                  fill
                  className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                  data-ai-hint="soccer player"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute bottom-6 left-6 pr-6">
                  <h3 className="text-xl sm:text-2xl font-bold">MEET THE SQUAD</h3>
                  <p className="text-accent flex items-center gap-2 text-sm font-semibold">View player stats <ArrowRight className="h-4 w-4" /></p>
                </div>
              </div>
            </Link>

            <Link href="/partnership" className="group sm:col-span-2 md:col-span-1">
              <div className="relative h-56 sm:h-64 overflow-hidden rounded-2xl border border-accent/20 transition-transform group-hover:scale-[1.02]">
                <div className="absolute inset-0 bg-accent/10 flex items-center justify-center p-8">
                  <ShieldCheck className="w-20 h-20 sm:w-24 sm:h-24 text-accent/20" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute bottom-6 left-6 pr-6">
                  <h3 className="text-xl sm:text-2xl font-bold">PARTNERSHIPS</h3>
                  <p className="text-accent flex items-center gap-2 text-sm font-semibold">Grow with the Mariners <ArrowRight className="h-4 w-4" /></p>
                </div>
              </div>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
