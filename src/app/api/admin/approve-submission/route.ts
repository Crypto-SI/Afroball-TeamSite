import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { z } from "zod";
import type { Database } from "@/types/database";

const EditedFieldsSchema = z.object({
  name: z.string().min(1).optional(),
  pos: z.string().min(1).optional(),
  second_pos: z.string().nullable().optional(),
  height: z.string().nullable().optional(),
  squad_number: z.number().int().min(1).max(99).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
});

const ApproveRequestSchema = z.object({
  submission_id: z.string().uuid("submission_id must be a valid UUID."),
  edited_fields: EditedFieldsSchema.optional(),
});

export async function POST(request: Request) {
  try {
    // ── 1. Parse & validate input ──────────────────────────────────────────
    const parsed = ApproveRequestSchema.safeParse(
      await request.json().catch(() => null)
    );

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 }
      );
    }

    const { submission_id: submissionId, edited_fields: editedFields } =
      parsed.data;

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
        { error: "Only admins and club staff can approve submissions." },
        { status: 403 }
      );
    }

    // ── 3. Fetch submission with service role ────────────────────────────────
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

    const { data: submission, error: fetchError } = await adminClient
      .from("player_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (fetchError || !submission) {
      return Response.json(
        { error: "Submission not found." },
        { status: 404 }
      );
    }

    if (submission.status !== "pending") {
      return Response.json(
        { error: `Submission is already ${submission.status}.` },
        { status: 400 }
      );
    }

    // ── 4. Create auth user ──────────────────────────────────────────────────
    const userEmail = submission.email || null;
    const userPhone = submission.phone || null;

    if (!userEmail && !userPhone) {
      return Response.json(
        { error: "Submission has neither email nor phone." },
        { status: 400 }
      );
    }

    if (!submission.proposed_password) {
      return Response.json(
        { error: "Submission has no password — it may have already been processed." },
        { status: 400 }
      );
    }

    const createParams: Parameters<typeof adminClient.auth.admin.createUser>[0] = {
      password: submission.proposed_password,
      email_confirm: true,
      phone_confirm: true,
    };

    if (userEmail) {
      createParams.email = userEmail;
    }
    if (userPhone) {
      createParams.phone = userPhone;
    }

    const { data: newUser, error: createError } =
      await adminClient.auth.admin.createUser(createParams);

    if (createError) {
      return Response.json(
        { error: `Failed to create user: ${createError.message}` },
        { status: 400 }
      );
    }

    // ── 5. Update profile role to player ─────────────────────────────────────
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        role: "player",
        full_name: editedFields?.name || submission.name,
      })
      .eq("id", newUser.user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      // Continue — profile exists with role=fan, can be updated later
    }

    // ── 6. Create player row ─────────────────────────────────────────────────
    const { data: newPlayer, error: playerError } = await adminClient
      .from("players")
      .insert({
        name: editedFields?.name || submission.name,
        pos: editedFields?.pos || submission.pos,
        second_pos: editedFields?.second_pos ?? submission.second_pos,
        height: editedFields?.height ?? submission.height,
        image_url: editedFields?.image_url ?? submission.image_url,
        squad_number: editedFields?.squad_number ?? submission.squad_number,
        user_id: newUser.user.id,
        is_active: true,
      })
      .select("id")
      .single();

    if (playerError || !newPlayer) {
      console.error("Player creation error:", playerError);
      // Clean up the orphaned auth user so the submission can be retried
      await adminClient.auth.admin.deleteUser(newUser.user.id);
      return Response.json(
        { error: `Player creation failed — user rolled back: ${playerError?.message}` },
        { status: 500 }
      );
    }

    // ── 7. Update submission status ──────────────────────────────────────────
    const { error: updateError } = await adminClient
      .from("player_submissions")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: session.user.id,
        created_player_id: newPlayer.id,
        created_user_id: newUser.user.id,
        proposed_password: null, // Clear the password
        // Apply any edited fields
        ...(editedFields?.name && { name: editedFields.name }),
        ...(editedFields?.pos && { pos: editedFields.pos }),
        ...(editedFields?.second_pos !== undefined && { second_pos: editedFields.second_pos }),
        ...(editedFields?.height !== undefined && { height: editedFields.height }),
        ...(editedFields?.squad_number !== undefined && { squad_number: editedFields.squad_number }),
        ...(editedFields?.image_url !== undefined && { image_url: editedFields.image_url }),
      })
      .eq("id", submissionId);

    if (updateError) {
      console.error("Submission update error:", updateError);
      // User and player are already created — this is a non-critical failure
    }

    return Response.json(
      {
        success: true,
        player: {
          id: newPlayer.id,
          name: editedFields?.name || submission.name,
          user_id: newUser.user.id,
        },
        identifier: userEmail || userPhone,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("approve-submission API error:", err);
    return Response.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
