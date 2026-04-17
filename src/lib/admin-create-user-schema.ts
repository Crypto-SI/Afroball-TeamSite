import { z } from "zod";

export const CREATE_USER_ROLES = ["admin", "club", "creator", "player", "fan"] as const;

export const CreateUserRequestSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  full_name: z.string().trim().optional().nullable(),
  role: z.enum(CREATE_USER_ROLES, {
    errorMap: () => ({ message: `Role must be one of: ${CREATE_USER_ROLES.join(", ")}` }),
  }),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

export function getCreateUserValidationMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid user details.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Invalid user details.";
}
