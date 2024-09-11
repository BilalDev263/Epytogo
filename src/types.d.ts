import { User } from "../prisma/generated/client";

declare module "next-auth" {
  interface Session {
    user: Omit<User, "password">;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: Omit<User, "password">;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: "development" | "production" | "test";
      readonly DATABASE_URL: string;
      readonly JWT_SECRET: string;
      readonly NEXTAUTH_SECRET: string;
      readonly NEXTAUTH_URL: string;
      readonly SMTP_USER: string;
      readonly SMTP_PASS: string;
    }
  }
}
