"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Lock, Mail, Phone, ShieldCheck } from "lucide-react";
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
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "no_supabase"
      ? "Supabase is not configured. The admin dashboard requires Supabase env vars to be set."
      : searchParams.get("error") === "reset_failed"
        ? "Password reset link is invalid or has expired. Please request a new one."
        : null
  );
  const [success, setSuccess] = useState<string | null>(
    searchParams.get("reset") === "success"
      ? "Password updated successfully. Please sign in with your new password."
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
    setSuccess(null);
    setIsSubmitting(true);

    const supabase = createClient();

    // Auto-detect email vs phone: contains '@' → email, otherwise try phone
    const trimmed = identifier.trim();
    const isEmail = trimmed.includes("@");
    // Supabase expects E.164 format — normalize by stripping non-digit chars (keep leading +)
    const normalizedPhone = "+" + trimmed.replace(/[^\d]/g, "");
    const isPhone = /^\+\d{7,15}$/.test(normalizedPhone);

    if (!isEmail && !isPhone) {
      setError("Please enter a valid email address or phone number.");
      setIsSubmitting(false);
      return;
    }

    const signInOpts = isEmail
      ? { email: trimmed, password }
      : { phone: normalizedPhone, password };

    const { error: signInError } = await supabase.auth.signInWithPassword(signInOpts);

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    const raw = searchParams.get("redirectedFrom") ?? "/dashboard";
    const safeRedirect = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
    router.replace(safeRedirect);
  }

  async function handleResetSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabaseReady) {
      setError("Supabase environment variables are not configured yet.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const trimmed = resetEmail.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    setIsSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setResetSent(true);
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
                    <CardTitle className="text-base uppercase">Email & Phone</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Sign in with either your email address or phone number.
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
                <CardTitle className="text-2xl font-black uppercase">
                  {resetMode ? "Reset Password" : "Sign In"}
                </CardTitle>
                <CardDescription>
                  {resetMode
                    ? "Enter your email and we'll send you a password reset link."
                    : "Use the editor credentials created in your Supabase project."}
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
                    <AlertTitle>{resetMode ? "Reset Failed" : "Sign In Failed"}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-500/30 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {resetMode ? (
                  resetSent ? (
                    <div className="space-y-4">
                      <Alert className="border-green-500/30 bg-green-500/10">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle>Check Your Email</AlertTitle>
                        <AlertDescription>
                          If an account exists for <strong>{resetEmail}</strong>, you'll
                          receive a password reset link shortly. Click the link to set a new
                          password.
                        </AlertDescription>
                      </Alert>
                      <Button
                        variant="outline"
                        className="w-full font-bold"
                        onClick={() => {
                          setResetMode(false);
                          setResetSent(false);
                          setResetEmail("");
                          setError(null);
                        }}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Sign In
                      </Button>
                    </div>
                  ) : (
                    <form className="space-y-4" onSubmit={handleResetSubmit}>
                      <div className="grid gap-2">
                        <Label htmlFor="reset-email">Email Address</Label>
                        <div className="relative">
                          <Input
                            id="reset-email"
                            type="email"
                            autoComplete="email"
                            placeholder="editor@club.com"
                            value={resetEmail}
                            onChange={(event) => setResetEmail(event.target.value)}
                            className="pl-10"
                            required
                          />
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </div>
                      <Button className="w-full font-bold" disabled={isSubmitting} type="submit">
                        {isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setResetMode(false);
                          setError(null);
                        }}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Sign In
                      </Button>
                    </form>
                  )
                ) : (
                  <>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div className="grid gap-2">
                        <Label htmlFor="identifier">Email or Phone</Label>
                        <div className="relative">
                          <Input
                            id="identifier"
                            type="text"
                            autoComplete="username"
                            placeholder="editor@club.com or +447700000000"
                            value={identifier}
                            onChange={(event) => setIdentifier(event.target.value)}
                            className="pl-10"
                          />
                          {identifier.includes("@") ? (
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          ) : (
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <button
                            type="button"
                            className="text-sm font-medium text-accent hover:underline"
                            onClick={() => {
                              setResetMode(true);
                              setError(null);
                              setSuccess(null);
                            }}
                          >
                            Forgot Password?
                          </button>
                        </div>
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
                  </>
                )}
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
