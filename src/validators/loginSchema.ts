import { z } from "zod";

// Définition du schéma

export const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const passwordSchema = z.object({
  password: z.string({
    required_error: "Please enter your password",
  }),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string({
    required_error: "Please enter your password",
  }),
});

export const updatePasswordSchema = z.object({
  password: z.string({
    required_error: "Please enter your password",
  }),
  newPassword: z.string({
    required_error: "Please enter your password",
  }),
});

export type LoginPayload = z.infer<typeof loginSchema>;

export type UpdateEmailPayload = z.infer<typeof emailSchema> & {
  userId: string;
};

export type UpdatePasswordPayload = z.infer<typeof updatePasswordSchema> & {
  userId: string;
};
