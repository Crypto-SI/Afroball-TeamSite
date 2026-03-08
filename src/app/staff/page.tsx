import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";

const STAFF = [
  { id: 1, name: "Victor Helm", role: "Head Coach", bio: "A master tactician with 20 years of experience.", img: "staff-1" },
  { id: 2, name: "Sarah Anchor", role: "Sporting Director", bio: "Leading the club's long-term vision and recruitment.", img: "staff-1" },
  { id: 3, name: "Dr. Ben Rivers", role: "Head of Medical", bio: "Ensuring our athletes are in peak physical condition.", img: "staff-1" },
  { id: 4, name: "Marco Tide", role: "Assistant Coach", bio: "Specializes in set-piece design and youth development.", img: "staff-1" },
];

export default function StaffPage() {
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
            {STAFF.map((member) => {
              const img = PlaceHolderImages.find(i => i.id === member.img);
              return (
                <Card key={member.id} className="bg-card border-primary/20 overflow-hidden">
                  <div className="relative aspect-square">
                    <Image
                      src={img?.imageUrl || ""}
                      alt={member.name}
                      fill
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
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}