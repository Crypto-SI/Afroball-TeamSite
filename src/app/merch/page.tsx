import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

const PRODUCTS = [
  { id: 1, name: "2024 Home Kit", price: "$85.00", cat: "Jerseys" },
  { id: 2, name: "2024 Away Kit", price: "$85.00", cat: "Jerseys" },
  { id: 3, name: "Mariner Scarf", price: "$25.00", cat: "Accessories" },
  { id: 4, name: "Training Top", price: "$45.00", cat: "Training" },
  { id: 5, name: "Team Hoodie", price: "$65.00", cat: "Apparel" },
  { id: 6, name: "Mariner Cap", price: "$20.00", cat: "Accessories" },
];

export default function MerchPage() {
  const kitImg = PlaceHolderImages.find(i => i.id === "merch-kit");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl mb-4">MARINER SHOP</h1>
            <p className="text-muted-foreground">Wear the colors. Support the crew.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((prod) => (
              <Card key={prod.id} className="bg-card border-accent/10 overflow-hidden group">
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={kitImg?.imageUrl || ""}
                    alt={prod.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    data-ai-hint="soccer kit"
                  />
                  <div className="absolute top-4 right-4">
                    <Button size="icon" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/80">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs text-accent uppercase font-bold tracking-widest mb-1">{prod.cat}</p>
                  <h3 className="text-xl font-bold mb-2">{prod.name}</h3>
                  <p className="text-2xl font-black">{prod.price}</p>
                  <Button className="w-full mt-6 bg-primary font-bold">ADD TO CART</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
