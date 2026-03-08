import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ticket, Info, MapPin } from "lucide-react";

export default function TicketsPage() {
  const categories = [
    { name: "General Admission", price: "$35", perks: ["South Stand Seating", "Access to Fan Zone"] },
    { name: "Premium Seating", price: "$75", perks: ["Main Stand Seating", "Padded Seats", "Half-time Drink"] },
    { name: "Family Pack", price: "$100", perks: ["2 Adults + 2 Kids", "Reserved Family Zone", "Meet Mascot"] },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-16 text-center">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl mb-4">MATCHDAY TICKETS</h1>
            <p className="text-muted-foreground text-lg">
              Witness the passion, the power, and the goals. Join the Mariner Navy at the dome.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 mb-16">
            {categories.map((cat) => (
              <Card key={cat.name} className="flex flex-col border-accent/20 bg-card hover:shadow-accent/5 transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl">{cat.name}</CardTitle>
                  <CardDescription className="text-4xl font-black text-accent mt-2">{cat.price}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 mb-8">
                    {cat.perks.map(p => (
                      <li key={p} className="flex items-center text-sm text-muted-foreground">
                        <Info className="h-4 w-4 mr-2 text-accent" /> {p}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-primary font-bold">SELECT TICKET</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="bg-primary/10 border-accent/20">
              <CardHeader>
                <div className="h-10 w-10 bg-accent/20 rounded-full flex items-center justify-center mb-2">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Stadium Info</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2">
                <p><strong>Mariner Dome</strong></p>
                <p>Capacity: 25,000</p>
                <p>Gates open 90 minutes before kickoff.</p>
                <p>Parking available in lots A, B, and C.</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/10 border-accent/20">
              <CardHeader>
                <div className="h-10 w-10 bg-accent/20 rounded-full flex items-center justify-center mb-2">
                  <Ticket className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Season Tickets</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-4">Become a part of the crew for the entire 2024 season. Season ticket holders get exclusive benefits including 15% off at the Mariner Shop.</p>
                <Button variant="outline" className="border-accent text-accent">Learn More</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}