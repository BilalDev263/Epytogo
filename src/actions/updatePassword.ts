"use server";
import { UpdatePasswordPayload } from "@/validators/loginSchema";
import { compare, genSaltSync, hashSync } from "bcryptjs";
import { findOneUser, updateUser } from "@/db/user";

export const updatePasswordAction = async ({
  userId,
  password,
  newPassword,
}: UpdatePasswordPayload) => {
  // Vérification des paramètres requis
  if (!userId || !password || !newPassword)
    throw new Error(
      "L'ID utilisateur, le mot de passe actuel, et le nouveau mot de passe sont requis",
    );

  try {
    // Recherche de l'utilisateur dans la base de données
    const user = await findOneUser({ id: userId });

    if (!user || !user.password)
      throw new Error("Utilisateur non trouvé ou mot de passe non défini");

    // Vérification du mot de passe actuel
    const isPasswordCorrect = await compare(password, user.password);

    if (!isPasswordCorrect)
      throw new Error("Le mot de passe actuel est incorrect");

    const hashedPassword = hashSync(newPassword, genSaltSync(10));

    // Mise à jour du mot de passe de l'utilisateur dans la base de données
    const userUpdated = await updateUser(userId, { password: hashedPassword });

    if (!userUpdated)
      throw new Error("Échec de la mise à jour du mot de passe");

    // Supprime le mot de passe de l'objet utilisateur avant de le retourner
    const { password: _, ...userWithoutPassword } = userUpdated;

    return userWithoutPassword;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe :", error);
    throw new Error(
      "Une erreur est survenue lors de la mise à jour du mot de passe. Veuillez réessayer plus tard.",
    );
  }
};
