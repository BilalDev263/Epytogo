"use server";

import { createUser, findOneUser } from "@/db/user";
import { RegisterPayload } from "@/validators/registerSchema";
import { genSaltSync, hash } from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function registerAction(
  user: Omit<RegisterPayload, "accepted" | "confirmPassword">,
) {
  try {
    const existingUser = await findOneUser({ email: user.email });
    
    if (existingUser) {
      throw new Error("Un compte avec cet email existe déjà");
    }

    const hashedPassword = await hash(user.password, genSaltSync(10));
    
    const newUser = await createUser(user, hashedPassword);

    console.log("Nouvel utilisateur :", newUser);
    if (!newUser) throw new Error("Échec de la création de l'utilisateur");

    return newUser;
  } catch (error) {
    console.error("Erreur détaillée lors de l'inscription :", error);
    console.error("Type d'erreur :", typeof error);
    console.error("Message d'erreur :", error instanceof Error ? error.message : String(error));
    
    if (error instanceof PrismaClientKnownRequestError) {
      console.error("Code d'erreur Prisma :", error.code);
      if (error.code === 'P2002') {
        throw new Error("Un compte avec cet email existe déjà");
      }
    }
    
    throw new Error(error instanceof Error ? error.message : "L'inscription a échoué");
  }
}