"use server";

import { verifyJwt } from "../auth/jwt";
import { findOneUser, updateUser } from "@/db/user";

type ActivateUserFunc = (
  jwtUserId: string,
) => Promise<"userNotExist" | "alreadyActivated" | "success" | "error">;

export const activateUserAction: ActivateUserFunc = async (jwtUserId) => {
  try {
    // Vérification du JWT
    const payload = verifyJwt(jwtUserId);
    if (!payload || !payload.id) return "userNotExist";

    // Récupération de l'utilisateur dans la base de données
    const user = await findOneUser({ id: payload.id });

    if (!user) return "userNotExist";

    if (user.emailVerified) return "alreadyActivated";

    // Mise à jour de l'utilisateur pour indiquer que l'email est vérifié
    await updateUser(user.id, { emailVerified: new Date() });

    return "success";
  } catch (error) {
    console.error("Activation error:", error);
    return "error";
  }
};
