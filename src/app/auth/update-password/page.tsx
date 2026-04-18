"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

function UpdatePasswordContent() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabaseReady = hasSupabaseEnv();

  useEffect(() => {
    if (!supabaseReady) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    // Verify the user has a valid session (from the reset link)
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        // No session — redirect to login with error
        router.replace("/login?error=reset_failed");
      } else {
        setLoading(false);
      }
    });
  }, [router, supabaseReady]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);

    // Sign out and redirect to login
    try {
      await supabase.auth.signOut();
    } catch {
      // signOut may fail — redirect anyway so user can clear session manually
    }
    router.replace("/login?reset=success");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 bg-gradient-to-b from-background via-background to-primary/5">
          <section className="container mx-auto flex min-h-[calc(100vh-9rem)] max-w-lg items-center justify-center px-4 py-12">
            <p className="text-muted-foreground">Loading…</p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-background via-background to-primary/5">
        <section className="container mx-auto flex min-h-[calc(100vh-9rem)] max-w-lg items-center px-4 py-12">
          <Card className="w-full border-accent/20 bg-card/80 backdrop-blur">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <KeyRound className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-2xl font-black uppercase">
                Update Password
              </CardTitle>
              <CardDescription>
                Enter your new password below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success ? (
                <Alert className="border-green-500/30 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>Password Updated</AlertTitle>
                  <AlertDescription>
                    Your password has been changed. Redirecting to login…
                  </AlertDescription>
                </Alert>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button
                    className="w-full font-bold"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <UpdatePasswordContent />
    </Suspense>
  );
}
