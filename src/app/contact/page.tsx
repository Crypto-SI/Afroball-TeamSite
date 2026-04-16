import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { getSiteSettings } from "@/lib/team-data-loaders";

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const clubName = settings.club_name || "Toman Mariners FC";
  const contactEmail = settings.contact_email || "contact@tomanmariners.com";
  const contactPhone = settings.contact_phone || "+1 (555) MARINER";
  const stadiumName = settings.stadium_name || "Mariner Dome";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-12 md:mb-16 text-center">
            <h1 className="text-3xl font-black tracking-tight sm:text-6xl mb-4">CONTACT US</h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Have a question about tickets, merch, or trials? We&apos;re here to help the {clubName} family.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <Card className="bg-card border-primary/20 p-4 sm:p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl sm:text-2xl font-bold">SEND A MESSAGE</CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input placeholder="John Doe" className="bg-background" suppressHydrationWarning />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" placeholder="john@example.com" className="bg-background" suppressHydrationWarning />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="Ticket Query" className="bg-background" suppressHydrationWarning />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea placeholder="Tell us how we can help..." className="bg-background min-h-[150px]" suppressHydrationWarning />
                </div>
                <Button className="w-full bg-accent text-accent-foreground font-bold hover:bg-accent/80 h-12">
                  <Send className="h-4 w-4 mr-2" /> SEND MESSAGE
                </Button>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide">DIRECT CONTACT</h2>
                <div className="flex items-start space-x-4">
                  <div className="mt-1 h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-bold">Email Us</p>
                    <p className="text-sm sm:text-base text-muted-foreground">General: {contactEmail}</p>
                    <p className="text-sm sm:text-base text-muted-foreground">Press: media@tomanmariners.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="mt-1 h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-bold">Call Us</p>
                    <p className="text-sm sm:text-base text-muted-foreground">{contactPhone}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground italic">Mon-Fri, 9am - 5pm</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="mt-1 h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-bold">Visit Us</p>
                    <p className="text-sm sm:text-base text-muted-foreground">{stadiumName} Stadium Office</p>
                    <p className="text-sm sm:text-base text-muted-foreground">Port City, PC 10405</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20">
                <h3 className="font-bold mb-2">FAN SUPPORT HOURS</h3>
                <p className="text-sm text-muted-foreground">Our support team is available during standard business hours and 3 hours prior to any home match at the stadium office.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
