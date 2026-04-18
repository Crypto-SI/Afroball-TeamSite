"use client";

import { Anchor, Facebook, Instagram, Twitter, Youtube, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/use-auth-state";
import type { SiteSettingsRow } from "@/lib/team-data-loaders";

type FooterContentProps = {
  settings: SiteSettingsRow;
};

export function FooterContent({ settings }: FooterContentProps) {
  const [year, setYear] = useState<number | null>(null);
  const isLoggedIn = useAuthState();
  const clubName = settings.club_name || "Toman Mariners FC";

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Anchor className="h-6 w-6 text-accent" />
              <span className="text-lg font-bold tracking-tighter">{clubName.toUpperCase()}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Founded in 1921, {clubName} is a pillar of excellence and community pride in professional soccer.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-accent">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-accent">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-accent">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-accent">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">The Club</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/fixtures" className="hover:text-accent">Fixtures & Results</Link></li>
              <li><Link href="/players" className="hover:text-accent">First Team</Link></li>
              <li><Link href="/staff" className="hover:text-accent">Management</Link></li>
              <li><Link href="/partnership" className="hover:text-accent">Partners</Link></li>
              <li><Link href="/dashboard" className="hover:text-accent">Dashboard</Link></li>
              {!isLoggedIn && (
                <>
                  <li>
                    <Link href="/register" className="inline-flex items-center gap-1.5 hover:text-accent">
                      <UserPlus className="h-3.5 w-3.5" />
                      Register
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="inline-flex items-center gap-1.5 hover:text-accent">
                      <LogIn className="h-3.5 w-3.5" />
                      Login
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Fan Zone</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/tickets" className="hover:text-accent">Buy Tickets</Link></li>
              <li><Link href="/merch" className="hover:text-accent">Shop Merch</Link></li>
              <li><Link href="/contact" className="hover:text-accent">Support</Link></li>
              <li><Link href="#" className="hover:text-accent">Membership</Link></li>
              {settings.registration_open && (
                <li>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 text-accent font-semibold hover:text-accent/80"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Player Registration
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Contact</h3>
            <address className="not-italic space-y-2 text-sm text-muted-foreground">
              <p>{settings.stadium_name || "Mariner Dome"}</p>
              <p>Port City, PC 10405</p>
              <p>Phone: {settings.contact_phone || "+1 (555) MARINER"}</p>
              <p>Email: {settings.contact_email || "contact@tomanmariners.com"}</p>
            </address>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-xs text-muted-foreground">
          © {year || "..."} {clubName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
