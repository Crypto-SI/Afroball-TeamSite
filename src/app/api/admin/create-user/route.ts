import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { type UserRole } from "@/lib/dashboard-config";

const VALID_ROLES: UserRole[] = ["admin", "club", "creator", "player", "fan"];

export async function POST(request: Request) {
  try {
    // ── 1. Parse input ──────────────────────────────────────────────────────
    const body = await request.json();
    const { email, password, full_name, role } = body as {
      email?: string;
      password?: string;
      full_name?: string;
      role?: string;
    };

    // Validate required fields
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return Response.json({ error: "A valid email is required." }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return Response.json(
        { error: "Password is required and must be at least 6 characters." },
        { status: 400 }
      );
    }
    if (!role || !VALID_ROLES.includes(role as UserRole)) {
      return Response.json(
        { error: `Role must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    // ── 2. Verify caller is an admin ────────────────────────────────────────
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

    // Check caller's role
    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!callerProfile || callerProfile.role !== "admin") {
      return Response.json(
        { error: "Only admins can create new users." },
        { status: 403 }
      );
    }

    // ── 3. Create user with service role key ────────────────────────────────
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

    const { data: newUser, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError) {
      return Response.json({ error: createError.message }, { status: 400 });
    }

    // ── 4. Upsert profile with role and full_name ───────────────────────────
    // The handle_new_user trigger may or may not have created a profile row yet.
    // Use upsert to handle both cases safely.
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert(
        {
          id: newUser.user.id,
          role: role as Database["public"]["Tables"]["profiles"]["Update"]["role"],
          full_name: full_name || null,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      // User was created but profile upsert failed — still return success
      // but include a warning
      return Response.json(
        {
          success: true,
          user: { id: newUser.user.id, email: newUser.user.email },
          warning: `User created but profile upsert failed: ${profileError.message}`,
        },
        { status: 201 }
      );
    }

    return Response.json(
      {
        success: true,
        user: { id: newUser.user.id, email: newUser.user.email },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("create-user API error:", err);
    return Response.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
