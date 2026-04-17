import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { getSiteSettings, getStaff } from "@/lib/team-data-loaders";

export default async function StaffPage() {
  const [staff, settings] = await Promise.all([getStaff(), getSiteSettings()]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl mb-4">LEADERSHIP & STAFF</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The minds and hands behind the Mariners' success. Meet our dedicated coaching and management team.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {staff.map((member) => (
              <Card key={member.id} className="bg-card border-primary/20 overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={member.imageUrl || "https://picsum.photos/seed/staff-fallback/400/500"}
                    alt={member.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover opacity-80"
                    data-ai-hint="coach"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-accent text-sm font-semibold mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
