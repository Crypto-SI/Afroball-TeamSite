import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function POST(request: Request) {
  try {
    // ── 1. Parse input ──────────────────────────────────────────────────────
    const body = await request.json().catch(() => ({}));
    const { registration_open, registration_password } = body;

    if (registration_open !== undefined && typeof registration_open !== "boolean") {
      return Response.json(
        { error: "registration_open must be a boolean." },
        { status: 400 }
      );
    }

    if (registration_password !== undefined && typeof registration_password !== "string") {
      return Response.json(
        { error: "registration_password must be a string." },
        { status: 400 }
      );
    }

    if (registration_open === undefined && registration_password === undefined) {
      return Response.json(
        { error: "Provide registration_open or registration_password to update." },
        { status: 400 }
      );
    }

    // ── 2. Verify caller is admin or club ────────────────────────────────────
    const cookieStore = await cookies();

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Server-side API routes don't need to set cookies
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return Response.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!callerProfile || !["admin", "club"].includes(callerProfile.role)) {
      return Response.json(
        { error: "Only admins and club staff can update registration settings." },
        { status: 403 }
      );
    }

    // ── 3. Use service role to update site_settings ─────────────────────────
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return Response.json(
        { error: "Server misconfiguration: service role key not set." },
        { status: 500 }
      );
    }

    const adminClient = createAdminClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    // Build update object
    type SiteSettingsUpdate = Database["public"]["Tables"]["site_settings"]["Update"];
    const update: SiteSettingsUpdate = { updated_at: new Date().toISOString() };
    if (registration_open !== undefined) update.registration_open = registration_open;
    if (registration_password !== undefined) update.registration_password = registration_password || null;

    // Check if site_settings row exists
    const { data: existing } = await adminClient
      .from("site_settings")
      .select("id")
      .limit(1)
      .single();

    if (existing) {
      const { error: updateError } = await adminClient
        .from("site_settings")
        .update(update)
        .eq("id", existing.id);

      if (updateError) {
        return Response.json(
          { error: `Failed to update: ${updateError.message}` },
          { status: 500 }
        );
      }
    } else {
      // Create row if none exists
      const { error: insertError } = await adminClient
        .from("site_settings")
        .insert({
          club_name: "My Club",
          registration_open: registration_open ?? false,
          registration_password: registration_password || null,
        });

      if (insertError) {
        return Response.json(
          { error: `Failed to create settings: ${insertError.message}` },
          { status: 500 }
        );
      }
    }

    return Response.json(
      {
        success: true,
        registration_open: registration_open ?? (existing ? true : false),
        registration_password: registration_password ?? null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("update-registration-settings API error:", err);
    return Response.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
