import NextAuth from "next-auth";
import { authOptions } from "@/auth/auth";

// Force la route à être dynamique
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };