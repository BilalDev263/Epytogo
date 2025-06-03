// src/actions/register.ts
"use server";

import { createUser, findOneUser } from "@/db/user";
import { signJwt } from "@/auth/jwt";
import { sendMail } from "@/emails/mail";
import { RegisterPayload } from "@/validators/registerSchema";
import { genSaltSync, hash } from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function registerAction(
  user: Omit<RegisterPayload, "accepted" | "confirmPassword">,
) {
  try {
    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await findOneUser({ email: user.email });
    
    if (existingUser) {
      throw new Error("Un compte avec cet email existe déjà");
    }

    // 2. Hash du mot de passe
    const hashedPassword = await hash(user.password, genSaltSync(10));
    
    // 3. Créer l'utilisateur
    const newUser = await createUser(user, hashedPassword);

    console.log("Nouvel utilisateur :", newUser);
    if (!newUser) throw new Error("Échec de la création de l'utilisateur");

    // 4. Générer le JWT et l'URL d'activation
    const jwtUserId = signJwt({ id: newUser.id });
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const activationUrl = `${baseUrl}/auth/activation/${jwtUserId}`;
    console.log("Activation URL :", activationUrl);

    // 5. Envoyer l'email d'activation
    try {
      await sendMail({
        to: [user.email],
        name: user.firstname,
        subject: "Activez votre compte Epytogo",
        url: activationUrl,
      });
      console.log("Mail envoyé avec succès à:", user.email);
    } catch (emailError) {
      console.error("Erreur envoi email:", emailError);
      
      // En production, on ne fait pas échouer l'inscription si l'email ne part pas
      if (process.env.NODE_ENV === 'production') {
        console.warn("Email non envoyé en production, mais utilisateur créé");
        // Tu pourrais implémenter une logique pour réessayer plus tard
      } else {
        // En développement, on peut faire échouer
        throw new Error("Erreur lors de l'envoi de l'email d'activation");
      }
    }

    return newUser;
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    
    // Gestion spécifique des erreurs Prisma
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error("Un compte avec cet email existe déjà");
      }
    }
    
    // Propager l'erreur avec le message original si c'est une Error, sinon message générique
    throw new Error(error instanceof Error ? error.message : "L'inscription a échoué");
  }
}