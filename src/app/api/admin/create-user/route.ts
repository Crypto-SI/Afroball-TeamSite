import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { CreateUserRequestSchema } from "@/lib/admin-create-user-schema";

export async function POST(request: Request) {
  try {
    // ── 1. Parse input ──────────────────────────────────────────────────────
    const parsed = CreateUserRequestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 }
      );
    }

    const { email, password, full_name, role } = parsed.data;

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
          role,
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
