import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

interface SignOption extends SignOptions {
  expiresIn: string | number;
}

const DEFAULT_SIGN_OPTION: SignOption = {
  expiresIn: "1d",
};

// Génère un token JWT avec la charge utile spécifiée.
export function signJwt(
  payload: JwtPayload,
  option: SignOption = DEFAULT_SIGN_OPTION,
): string {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey)
    throw new Error(
      "La variable d'environnement JWT_SECRET n'est pas définie.",
    );

  const token = jwt.sign(payload, secretKey, option);
  return token;
}

// Vérifie un token JWT et retourne la charge utile décodée, ou null en cas d'échec.
export function verifyJwt(token: string): JwtPayload | null {
  try {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey)
      throw new Error(
        "La variable d'environnement JWT_SECRET n'est pas définie.",
      );

    const decoded = jwt.verify(token, secretKey);
    return decoded as JwtPayload;
  } catch (e) {
    console.error("Échec de la vérification du JWT :", e);
    return null;
  }
}
