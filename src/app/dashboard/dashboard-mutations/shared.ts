import { z } from "zod";

export const nonEmptyString = z.string().trim().min(1);
export const optionalUrlString = z.string().trim().url().or(z.literal(""));

export function getMutationErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid form input.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}
