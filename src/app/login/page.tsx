"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "no_supabase"
      ? "Supabase is not configured. The admin dashboard requires Supabase env vars to be set."
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabaseReady = hasSupabaseEnv();

  useEffect(() => {
    if (!supabaseReady) {
      return;
    }

    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/dashboard");
      }
    });
  }, [router, supabaseReady]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabaseReady) {
      setError("Supabase environment variables are not configured yet.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    const raw = searchParams.get("redirectedFrom") ?? "/dashboard";
    const safeRedirect = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
    router.replace(safeRedirect);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-background via-background to-primary/5">
        <section className="container mx-auto flex min-h-[calc(100vh-9rem)] max-w-5xl items-center px-4 py-12">
          <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.35em] text-accent">
                Editor Access
              </p>
              <h1 className="text-4xl font-black uppercase tracking-tight sm:text-6xl">
                Club Admin Login
              </h1>
              <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
                Use a Supabase-authenticated editor account to manage fixtures,
                results, players, and staff for this club site.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-accent/20 bg-card/50">
                  <CardHeader className="pb-3">
                    <ShieldCheck className="h-5 w-5 text-accent" />
                    <CardTitle className="text-base uppercase">Protected</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    `/dashboard` is guarded by Supabase session middleware.
                  </CardContent>
                </Card>
                <Card className="border-accent/20 bg-card/50">
                  <CardHeader className="pb-3">
                    <Mail className="h-5 w-5 text-accent" />
                    <CardTitle className="text-base uppercase">Email Auth</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Start with email and password for club staff.
                  </CardContent>
                </Card>
                <Card className="border-accent/20 bg-card/50">
                  <CardHeader className="pb-3">
                    <Lock className="h-5 w-5 text-accent" />
                    <CardTitle className="text-base uppercase">RLS Ready</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Public reads, editor writes, service key stays server-only.
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-accent/20 bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase">Sign In</CardTitle>
                <CardDescription>
                  Use the editor credentials created in your Supabase project.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!supabaseReady && (
                  <Alert className="border-amber-500/30 bg-amber-500/10">
                    <AlertTitle>Supabase Not Configured</AlertTitle>
                    <AlertDescription>
                      Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
                      in `.env.local`, then create your tables from the docs.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Sign In Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="editor@club.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                  <Button className="w-full font-bold" disabled={isSubmitting} type="submit">
                    {isSubmitting ? "Signing In..." : "Sign In"}
                  </Button>
                </form>

                <p className="text-sm text-muted-foreground">
                  Need setup help? Start with{" "}
                  <Link className="font-semibold text-accent hover:underline" href="/docs/supabase">
                    the Supabase guide
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginPageContent />
    </Suspense>
  );
}
