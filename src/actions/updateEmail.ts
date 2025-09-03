"use server";
import { findOneUser, updateUser } from "@/db/user";
import { validateEmail } from "@/lib/utils";
import { UpdateEmailPayload } from "@/validators/loginSchema";

export async function updateEmailAction({ userId, email }: UpdateEmailPayload) {
  if (!userId || !email)
    throw new Error("L'ID utilisateur et l'email sont requis");

  if (!validateEmail(email)) throw new Error("Format d'email invalide");

  try {
    const userExists = await findOneUser({ id: userId });

    if (!userExists) throw new Error("Utilisateur non trouvé");

    const userUpdated = await updateUser(userId, { email });

    if (!userUpdated) throw new Error("Échec de la mise à jour de l'email");

    const { password, ...userWithoutPassword } = userUpdated;
    return userWithoutPassword;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'email :", error);
    throw new Error(
      "Une erreur est survenue lors de la mise à jour de l'email. Veuillez réessayer plus tard.",
    );
  }
}
