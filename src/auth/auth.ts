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

const authenticate = async (
  credentials: Record<"email" | "password", string>,
) => {
  const user = await findOneUser({ email: credentials.email });

  if (!user) throw new Error("Nom d'utilisateur ou mot de passe incorrect");

  if (!user.password) throw new Error("Utilisez Google pour vous connecter");

  const isPasswordCorrect = await compare(credentials.password, user.password);

  if (!isPasswordCorrect)
    throw new Error("Nom d'utilisateur ou mot de passe incorrect");


  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    firstname: userWithoutPassword.firstname || '',
    lastname: userWithoutPassword.lastname || '',
  };
};

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    CredentialsProvider({
      name: "Identifiants",
      credentials,
      async authorize(credentials) {
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
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (existingUser) {
            // Mettre à jour l'utilisateur existant avec les nouveaux champs si nécessaires
            const updateData: any = {
              image: user.image,
            };

            // Ajouter les champs manquants s'ils n'existent pas
            if (!existingUser.subscription) {
              updateData.subscription = 'FREEMIUM';
            }
            if (!existingUser.subscriptionStatus) {
              updateData.subscriptionStatus = 'ACTIVE';
            }

            await prisma.user.update({
              where: { email: user.email! },
              data: updateData
            });
          } else {
            await prisma.user.create({
              data: {
                email: user.email!,
                firstname: user.name?.split(' ')[0] || '',
                lastname: user.name?.split(' ').slice(1).join(' ') || '',
                image: user.image,
                subscription: 'FREEMIUM',
                subscriptionStatus: 'ACTIVE',
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
        token.user = user as any;
      }

      // Toujours récupérer tous les champs utilisateur depuis la DB pour avoir les données à jour
      if (token.email) {
        const currentUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            role: true,
            subscription: true,
            subscriptionStatus: true,
            firstname: true,
            lastname: true,
            email: true,
            image: true
          }
        });
        if (currentUser && token.user) {
          token.user = {
            ...token.user,
            ...currentUser
          };
        }
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