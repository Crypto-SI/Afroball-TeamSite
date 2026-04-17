import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { ShieldCheck, TrendingUp, Users, Globe } from "lucide-react";

export default function PartnershipPage() {
  const sponsors = [
    { name: "Global Port Logistics", tier: "Principal Partner" },
    { name: "Ocean Energy", tier: "Official Kit Sponsor" },
    { name: "Harbor Bank", tier: "Community Partner" },
    { name: "Sail Beverages", tier: "Official Drink" },
    { name: "Webara Studio", tier: "Digital Media Partner", href: "https://webarastudio.com" },
    { name: "TLC (Touchline Creator)", tier: "Digital Content Partner" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-12 md:mb-16 text-center">
            <h1 className="text-3xl font-black tracking-tight sm:text-6xl mb-4 uppercase">PARTNERSHIPS</h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Partner with Toman Mariners FC and connect your brand with our passionate community.
            </p>
          </div>

          {/* Current Partners */}
          <section className="mb-20 md:mb-24">
            <h2 className="text-center text-xs font-bold uppercase tracking-[0.2em] text-accent mb-10">OUR PRINCIPAL PARTNERS</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {sponsors.map((s) => {
                const CardUI = (
                  <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-card border border-accent/10 rounded-xl hover:border-accent/30 transition-all text-center h-full group">
                    <div className="h-10 sm:h-12 w-full flex items-center justify-center mb-3">
                      <div className="text-sm sm:text-base font-black italic opacity-60 leading-tight group-hover:opacity-100 transition-opacity">
                        {s.name.length > 15 ? s.name.substring(0, 12) + '...' : s.name}
                      </div>
                    </div>
                    <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{s.tier}</p>
                  </div>
                );

                return s.href ? (
                  <Link key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="block transition-transform hover:scale-[1.02]">
                    {CardUI}
                  </Link>
                ) : (
                  <div key={s.name}>
                    {CardUI}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Why Partner? */}
          <section className="grid gap-12 lg:grid-cols-2 items-center mb-20 md:mb-24">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl font-black mb-6 uppercase">WHY PARTNER WITH THE MARINERS?</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-8">
                Toman Mariners FC is more than just a soccer club. We are a cultural touchstone with a massive, loyal following that transcends age and demographic. Our partnership programs are designed to deliver real business value while supporting the growth of the beautiful game.
              </p>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-accent">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">COMMUNITY</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Reach over 500k active local fans.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-accent">
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">GLOBAL REACH</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">International match broadcasts.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-accent">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">GROWTH</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">High engagement across social media.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-accent">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">BRAND</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Align with a legacy of excellence.</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden border-4 border-accent/20">
               <Image
                  src={PlaceHolderImages.find(i => i.id === "hero-stadium")?.imageUrl || ""}
                  alt="Partnership"
                  fill
                  className="object-cover opacity-80"
                  data-ai-hint="soccer crowd"
                />
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center p-4">
                   <div className="text-center p-6 sm:p-8 bg-background/90 backdrop-blur rounded-2xl max-w-xs border border-accent/20">
                      <h3 className="text-lg sm:text-xl font-bold mb-2">Request Media Kit</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4">Get detailed stats on our audience and partnership tiers.</p>
                      <Button className="w-full bg-accent text-accent-foreground font-bold h-10">DOWNLOAD PDF</Button>
                   </div>
                </div>
            </div>
          </section>

          {/* Become a Partner CTA */}
          <section className="bg-primary/20 rounded-3xl p-8 sm:p-12 text-center border border-accent/20">
            <h2 className="text-2xl sm:text-3xl font-black mb-4 uppercase">READY TO SET SAIL WITH US?</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-8">
              We offer bespoke sponsorship packages tailored to your brand's specific goals. Let's discuss how we can grow together.
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-accent text-accent-foreground font-bold px-10 h-14 w-full sm:w-auto">
                CONTACT COMMERCIAL TEAM
              </Button>
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
