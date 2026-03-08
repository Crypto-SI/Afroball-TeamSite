import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, TrendingUp, Users, Globe } from "lucide-react";

export default function PartnershipPage() {
  const sponsors = [
    { name: "Global Port Logistics", tier: "Principal Partner" },
    { name: "Ocean Energy", tier: "Official Kit Sponsor" },
    { name: "Harbor Bank", tier: "Community Partner" },
    { name: "Sail Beverages", tier: "Official Drink" },
    { name: "Digital Media Partner", tier: "Official Media" },
    { name: "TLC (Touchline Creator)", tier: "Digital Content Partner" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-16 text-center">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl mb-4">PARTNERSHIPS</h1>
            <p className="text-muted-foreground text-lg">
              Partner with Toman Mariners FC and connect your brand with our passionate community.
            </p>
          </div>

          {/* Current Partners */}
          <section className="mb-24">
            <h2 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-accent mb-12">OUR PRINCIPAL PARTNERS</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {sponsors.map((s) => (
                <div key={s.name} className="flex flex-col items-center justify-center p-6 bg-card border border-accent/10 rounded-xl hover:border-accent/30 transition-all text-center">
                  <div className="h-12 w-full flex items-center justify-center mb-3">
                    <div className="text-lg font-black italic opacity-60 leading-tight">
                      {s.name.length > 15 ? s.name.substring(0, 12) + '...' : s.name}
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{s.tier}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Why Partner? */}
          <section className="grid gap-12 lg:grid-cols-2 items-center mb-24">
            <div>
              <h2 className="text-3xl font-black mb-6">WHY PARTNER WITH THE MARINERS?</h2>
              <p className="text-muted-foreground mb-8">
                Toman Mariners FC is more than just a soccer club. We are a cultural touchstone with a massive, loyal following that transcends age and demographic. Our partnership programs are designed to deliver real business value while supporting the growth of the beautiful game.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-accent">
                    <Users className="h-5 w-5" />
                    <span className="font-bold">COMMUNITY</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Reach over 500k active local fans.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-accent">
                    <Globe className="h-5 w-5" />
                    <span className="font-bold">GLOBAL REACH</span>
                  </div>
                  <p className="text-xs text-muted-foreground">International match broadcasts.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-accent">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-bold">GROWTH</span>
                  </div>
                  <p className="text-xs text-muted-foreground">High engagement across social media.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-accent">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="font-bold">BRAND</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Align with a legacy of excellence.</p>
                </div>
              </div>
            </div>
            <div className="relative h-96 rounded-3xl overflow-hidden border-4 border-accent/20">
               <Image
                  src={PlaceHolderImages.find(i => i.id === "hero-stadium")?.imageUrl || ""}
                  alt="Partnership"
                  fill
                  className="object-cover opacity-80"
                  data-ai-hint="soccer crowd"
                />
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                   <div className="text-center p-8 bg-background/80 backdrop-blur rounded-2xl max-w-xs border border-accent/20">
                      <h3 className="text-xl font-bold mb-2">Request Media Kit</h3>
                      <p className="text-sm text-muted-foreground mb-4">Get detailed stats on our audience and partnership tiers.</p>
                      <Button className="w-full bg-accent text-accent-foreground font-bold">DOWNLOAD PDF</Button>
                   </div>
                </div>
            </div>
          </section>

          {/* Become a Partner CTA */}
          <section className="bg-primary/20 rounded-3xl p-12 text-center border border-accent/20">
            <h2 className="text-3xl font-black mb-4">READY TO SET SAIL WITH US?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              We offer bespoke sponsorship packages tailored to your brand's specific goals. Let's discuss how we can grow together.
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-accent text-accent-foreground font-bold px-12 h-14">
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

function Link({ href, children, ...props }: any) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
