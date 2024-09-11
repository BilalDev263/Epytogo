import { z } from "zod";
export const RegisterSchema = z
  .object({
    firstname: z
      .string()
      .min(2, "First name must be atleast 2 characters")
      .max(45, "First name must be less than 45 characters")
      .regex(/^[a-zA-Z]+$/, "No special character allowed!"),
    lastname: z
      .string()
      .min(2, "Last name must be atleast 2 characters")
      .max(45, "Last name must be less than 45 characters")
      .regex(/^[a-zA-Z]+$/, "No special character allowed!"),
    email: z.string().email("Please enter a valid email address"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters ")
      .max(50, "Password must be less than 50 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters ")
      .max(50, "Password must be less than 50 characters"),
    accepted: z.literal(true, {
      errorMap: () => ({
        message: "Please accept all terms",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password doesn't match!",
    path: ["confirmPassword"],
  });

export type RegisterPayload = z.infer<typeof RegisterSchema>;
