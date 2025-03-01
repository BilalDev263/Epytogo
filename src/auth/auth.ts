import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { User } from "@prisma/client";
import { findOneUser } from "@/db/user";

const credentials = {
  email: { label: "Email", type: "email", placeholder: "Votre adresse email" },
  password: {
    label: "Mot de passe",
    type: "password",
    placeholder: "Votre mot de passe",
  },
};

// Fonction pour authentifier un utilisateur avec les identifiants fournis.
const authenticate = async (
  credentials: Record<"email" | "password", string>,
) => {
  const user = await findOneUser({ email: credentials.email });

  // Vérifie si l'utilisateur existe.
  if (!user) throw new Error("Nom d'utilisateur ou mot de passe incorrect");

  const isPasswordCorrect = await compare(credentials.password, user.password);

  // Vérifie si le mot de passe est correct.
  if (!isPasswordCorrect)
    throw new Error("Nom d'utilisateur ou mot de passe incorrect");

  // Vérifie si l'email a été vérifié.
  if (!user.emailVerified) {
    throw new Error(
      "Votre compte n'est pas encore activé. Veuillez vérifier votre boîte mail pour activer votre compte.",
    );
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Configuration des options d'authentification pour NextAuth.
export const authOptions: AuthOptions = {
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  providers: [
    CredentialsProvider({
      name: "Identifiants",
      credentials,
      async authorize(credentials) {
        // Vérifie que les identifiants sont fournis.
        if (!credentials?.email || !credentials.password) {
          throw new Error("L'email et le mot de passe sont requis");
        }

        return authenticate(credentials);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as User;
      }
      return token;
    },
    async session({ token, session }) {
      if (session && token.user) {
        session.user = token.user;
      }
      return session;
    },
  },
};
