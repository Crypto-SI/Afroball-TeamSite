"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Lock, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

const POSITIONS = [
  "GK", "CB", "LB", "RB", "LWB", "RWB",
  "CDM", "CM", "CAM", "LM", "RM",
  "LW", "RW", "CF", "ST",
];

type Step = "loading" | "closed" | "gate" | "form" | "success" | "error";

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("loading");
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Gate password state
  const [gatePassword, setGatePassword] = useState("");
  const [gateError, setGateError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pos, setPos] = useState("");
  const [secondPos, setSecondPos] = useState("");
  const [height, setHeight] = useState("");
  const [squadNumber, setSquadNumber] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch site settings on mount
  useEffect(() => {
    async function loadSettings() {
      if (!hasSupabaseEnv()) {
        setStep("closed");
        setErrorMessage("Registration is not available at this time.");
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .limit(1)
          .single();

        if (error || !data) {
          setStep("closed");
          setErrorMessage("Registration is not available at this time.");
          return;
        }

        setSettings(data);

        if (!data.registration_open) {
          setStep("closed");
        } else if (!data.registration_password) {
          // No gate password required
          setStep("form");
        } else {
          setStep("gate");
        }
      } catch {
        setStep("closed");
        setErrorMessage("Registration is not available at this time.");
      }
    }

    loadSettings();
  }, []);

  // Handle gate password submission
  const handleGateSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!settings?.registration_password) {
        setStep("form");
        return;
      }
      if (gatePassword === settings.registration_password) {
        setGateError("");
        setStep("form");
      } else {
        setGateError("Incorrect password. Please check with the club staff.");
      }
    },
    [gatePassword, settings]
  );

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image must be less than 5MB.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage("Name is required.");
      return;
    }
    if (!pos) {
      setErrorMessage("Primary position is required.");
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setErrorMessage("At least email or phone is required.");
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Upload image if provided
      let imageUrl: string | null = null;
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const filePath = `submissions/${crypto.randomUUID()}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("registration-uploads")
          .upload(filePath, imageFile, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          setErrorMessage(`Image upload failed: ${uploadError.message}`);
          setIsSubmitting(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("registration-uploads")
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // Insert submission
      const { error: insertError } = await supabase
        .from("player_submissions")
        .insert({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          pos,
          second_pos: secondPos.trim() || null,
          height: height.trim() || null,
          squad_number: squadNumber ? parseInt(squadNumber, 10) : null,
          image_url: imageUrl,
          proposed_password: password,
          status: "pending",
        });

      if (insertError) {
        setErrorMessage(`Submission failed: ${insertError.message}`);
        setIsSubmitting(false);
        return;
      }

      setStep("success");
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tight">
            Player Registration
          </h1>
          <p className="text-muted-foreground text-sm">
            Submit your details to join the team
          </p>
        </div>

        {/* Loading */}
        {step === "loading" && (
          <Card className="border-accent/10 bg-card/50">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </CardContent>
          </Card>
        )}

        {/* Registration Closed */}
        {step === "closed" && (
          <Card className="border-accent/10 bg-card/50">
            <CardContent className="py-12 text-center space-y-4">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h2 className="text-xl font-bold">Registration Closed</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  {errorMessage || "Player registration is not currently open. Please check back later or contact the club."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gate Password */}
        {step === "gate" && (
          <Card className="border-accent/10 bg-card/50">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-accent text-center">
                Enter Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground text-center mb-4">
                Enter the password provided by the club to access the registration form.
              </p>
              <form onSubmit={handleGateSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="gate-password" className="sr-only">
                    Password
                  </Label>
                  <Input
                    id="gate-password"
                    type="password"
                    placeholder="Enter registration password..."
                    value={gatePassword}
                    onChange={(e) => setGatePassword(e.target.value)}
                    autoFocus
                  />
                </div>
                {gateError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {gateError}
                  </p>
                )}
                <Button type="submit" className="w-full bg-accent font-bold text-accent-foreground">
                  <Lock className="mr-2 h-4 w-4" />
                  Unlock Form
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Registration Form */}
        {step === "form" && (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Personal Details */}
            <Card className="border-accent/10 bg-card/50">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-accent">
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide email or phone (or both)
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+44 7700 000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Playing Details */}
            <Card className="border-accent/10 bg-card/50">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-accent">
                  Playing Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Primary Position *</Label>
                  <Select value={pos} onValueChange={setPos}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Second Position</Label>
                  <Select value={secondPos} onValueChange={setSecondPos}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    placeholder={"e.g. 5'10\""}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="squad-number">Squad Number</Label>
                  <Input
                    id="squad-number"
                    type="number"
                    min={1}
                    max={99}
                    placeholder="Preferred number"
                    value={squadNumber}
                    onChange={(e) => setSquadNumber(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Profile Picture */}
            <Card className="border-accent/10 bg-card/50">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-accent">
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-accent/20">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-muted border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label htmlFor="image" className="cursor-pointer">
                      <span className="text-sm text-accent underline">
                        {imageFile ? "Change photo" : "Upload a photo"}
                      </span>
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional. Max 5MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Credentials */}
            <Card className="border-accent/10 bg-card/50">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-accent">
                  Account Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p className="text-xs text-muted-foreground">
                  Choose a password for your future player account. Once approved, you'll use this to log in.
                </p>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password *</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Error message */}
            {errorMessage && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {errorMessage}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-accent font-bold text-accent-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Registration"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Your submission will be reviewed by the club. You'll be notified once approved.
            </p>
          </form>
        )}

        {/* Success */}
        {step === "success" && (
          <Card className="border-accent/10 bg-card/50">
            <CardContent className="py-12 text-center space-y-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <div>
                <h2 className="text-xl font-bold">Registration Submitted!</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  Thank you, {name}! Your details have been submitted and are pending review.
                  The club will approve your account and you'll be able to log in after that.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
