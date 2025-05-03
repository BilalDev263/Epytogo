// src/auth/auth.ts
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { User } from "@prisma/client";
import { findOneUser } from "@/db/user";
import prisma from "@/db/prisma";

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

  // Vérifie si l'utilisateur a un mot de passe (pas Google Auth)
  if (!user.password) throw new Error("Utilisez Google pour vous connecter");

  const isPasswordCorrect = await compare(credentials.password, user.password);

  // Vérifie si le mot de passe est correct.
  if (!isPasswordCorrect)
    throw new Error("Nom d'utilisateur ou mot de passe incorrect");

  // Vérifie si l'email a été vérifié (seulement pour les comptes classiques).
  if (!user.emailVerified && user.password) {
    throw new Error(
      "Votre compte n'est pas encore activé. Veuillez vérifier votre boîte mail pour activer votre compte.",
    );
  }

  // Retourner l'utilisateur sans le mot de passe, en gérant les valeurs null
  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    firstname: userWithoutPassword.firstname || '',
    lastname: userWithoutPassword.lastname || '',
  };
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
    // Provider Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Provider existant
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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Vérifier si l'utilisateur existe déjà
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (existingUser) {
            // Utilisateur existe, on met à jour ses infos si nécessaire
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                image: user.image,
                emailVerified: new Date(), // Marquer comme vérifié
              }
            });
          } else {
            // Créer un nouvel utilisateur
            await prisma.user.create({
              data: {
                email: user.email!,
                firstname: user.name?.split(' ')[0] || '',
                lastname: user.name?.split(' ').slice(1).join(' ') || '',
                image: user.image,
                emailVerified: new Date(),
                // password est optionnel, donc on ne le met pas
              }
            });
          }
          return true;
        } catch (error) {
          console.error("Erreur lors de la création/mise à jour de l'utilisateur Google:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        // Pour les utilisateurs Google, récupérer les infos de la DB
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! }
        });
        if (dbUser) {
          token.user = {
            ...dbUser,
            firstname: dbUser.firstname || '',
            lastname: dbUser.lastname || '',
          };
        }
      } else if (user) {
        // Pour les utilisateurs classiques
        token.user = user as any;
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