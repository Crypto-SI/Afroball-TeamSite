'use server';
/**
 * @fileOverview This file provides an AI flow for generating concise summaries of past match reports
 * and previews of upcoming fixtures for Toman Mariners FC.
 *
 * - generateMatchSummary - A function that generates a summary or preview based on the provided text.
 * - MatchSummaryInput - The input type for the generateMatchSummary function.
 * - MatchSummaryOutput - The return type for the generateMatchSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchSummaryInputSchema = z.object({
  context: z.string().describe('The full match report text or detailed information about an upcoming fixture.'),
});
export type MatchSummaryInput = z.infer<typeof MatchSummaryInputSchema>;

const MatchSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the match report or a preview of the upcoming fixture.'),
});
export type MatchSummaryOutput = z.infer<typeof MatchSummaryOutputSchema>;

export async function generateMatchSummary(input: MatchSummaryInput): Promise<MatchSummaryOutput> {
  return matchSummaryFlow(input);
}

const matchSummaryPrompt = ai.definePrompt({
  name: 'matchSummaryPrompt',
  input: {schema: MatchSummaryInputSchema},
  output: {schema: MatchSummaryOutputSchema},
  prompt: `You are an AI assistant providing insights for Toman Mariners FC fans.
Based on the following provided text, generate a concise summary or preview.

If the text is a match report for a past game, summarize it by highlighting key events, goals, goal scorers, and the final score.
If the text describes an upcoming fixture, create a preview including participating teams, date, time, venue, and what fans can look forward to.

Keep the output to 2-3 paragraphs, focusing on information relevant to Toman Mariners FC.

Text to process:
{{{context}}}`,
});

const matchSummaryFlow = ai.defineFlow(
  {
    name: 'matchSummaryFlow',
    inputSchema: MatchSummaryInputSchema,
    outputSchema: MatchSummaryOutputSchema,
  },
  async (input) => {
    const {output} = await matchSummaryPrompt(input);
    return output!;
  }
);
