import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function POST(request: Request) {
  try {
    // ── 1. Parse input ──────────────────────────────────────────────────────
    const body = await request.json().catch(() => null);
    const submissionId = body?.submission_id;
    const reviewerNotes = body?.reviewer_notes as string | undefined;

    if (!submissionId || typeof submissionId !== "string") {
      return Response.json(
        { error: "submission_id is required." },
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
        { error: "Only admins and club staff can reject submissions." },
        { status: 403 }
      );
    }

    // ── 3. Fetch and validate submission ─────────────────────────────────────
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
      .select("id, status")
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

    // ── 4. Update submission to rejected ─────────────────────────────────────
    const { error: updateError } = await adminClient
      .from("player_submissions")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: session.user.id,
        reviewer_notes: reviewerNotes || null,
        proposed_password: null, // Clear the password
      })
      .eq("id", submissionId);

    if (updateError) {
      return Response.json(
        { error: `Failed to reject submission: ${updateError.message}` },
        { status: 500 }
      );
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("reject-submission API error:", err);
    return Response.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
