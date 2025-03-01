"use server";

import { createUser } from "@/db/user";
import { signJwt } from "@/auth/jwt";
import { sendMail } from "@/emails/mail";
import { RegisterPayload } from "@/validators/registerSchema";
import { genSaltSync, hash } from "bcryptjs";

export async function registerAction(
  user: Omit<RegisterPayload, "accepted" | "confirmPassword">,
) {
  try {
    const hashedPassword = await hash(user.password, genSaltSync(10));
    const newUser = await createUser(user, hashedPassword);

    console.log("Nouvel utilisateur :", newUser);
    if (!newUser) throw new Error("Échec de la création de l'utilisateur");

    const jwtUserId = signJwt({ id: newUser.id });
    const activationUrl = `${process.env.NEXTAUTH_URL}/auth/activation/${jwtUserId}`;
    console.log("Activation URL :", activationUrl);

    // ✅ Envoi de l'e-mail d'activation
    await sendMail({
      to: [user.email],
      name: user.firstname,
      subject: "Activez votre compte",
      url: activationUrl,
    });

    console.log("Mail envoyé");
    return newUser;
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    throw new Error("L'inscription a échoué");
  }
}
