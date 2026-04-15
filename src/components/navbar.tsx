"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Anchor, CalendarDays, Menu, X, ShoppingBag, Ticket, Users, Phone, ShieldCheck, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { useAuthState } from "@/hooks/use-auth-state";

export function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = useAuthState();

  async function handleLogout() {
    if (!hasSupabaseEnv()) return;
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setIsOpen(false);
      router.replace("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const navItems = [
    { name: "Players", href: "/players", icon: Users },
    { name: "Staff", href: "/staff", icon: ShieldCheck },
    { name: "Fixtures", href: "/fixtures", icon: CalendarDays },
    { name: "Tickets", href: "/tickets", icon: Ticket },
    { name: "Merch", href: "/merch", icon: ShoppingBag },
    { name: "Partnership", href: "/partnership", icon: ShieldCheck },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Anchor className="h-8 w-8 text-accent" />
              <span className="text-xl font-bold tracking-tighter text-foreground sm:inline-block">
                TOMAN <span className="text-accent">MARINERS</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              {isLoggedIn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="mr-1.5 h-4 w-4" />
                  Logout
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t bg-card animate-in slide-in-from-top-2">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
