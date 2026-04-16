import { z } from "zod";
import { generateMatchSummary } from "@/ai/flows/automated-match-summaries";

const MatchSummaryRequestSchema = z.object({
  context: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = MatchSummaryRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json({ error: "A non-empty context is required." }, { status: 400 });
  }

  try {
    const result = await generateMatchSummary(parsed.data);
    return Response.json(result);
  } catch (error) {
    console.error("match-summary API error:", error);
    return Response.json(
      { error: "Unable to generate match summary." },
      { status: 500 }
    );
  }
}
