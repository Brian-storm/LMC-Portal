import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface User {
    role?: string;
    organization?: string | null;
  }
  interface Session {
    user: {
      id?: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      organization?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
    userId?: string;
    organization?: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      // 1. Check if both fields were provided
      if (!credentials?.email || !credentials?.password) return null;

      const email = credentials.email as string;
      const password = credentials.password as string;

      // 2. Find the user in the database by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      // 3. Reject if user doesn't exist or has no password hash saved
      if (!user) return null;
      if (!user.passwordHash) return null;

      // 4. Compare the raw password with the hashed password in DB
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) return null; // Passwords do not match

      // 5. Success! Return the user object (this gets passed to the jwt callback)
      return {
        id: user.id,
        email: user.email,
        name: user.nameEn,
        role: user.role,
        organization: user.organization,
      };
    },
  }),
  ],
  callbacks: {
  // Step 1: Modifies the encrypted cookie payload
  async jwt({ token, user }) {
    if (user) { 
      // 'user' is only defined on the VERY FIRST login attempt
      token.role = user.role as string;
      token.userId = user.id as string;
      token.organization = user.organization as string | null;
    }
    return token; // Saved to browser cookie
  },

  // Step 2: Controls what data is accessible in your app via auth() or useSession()
  async session({ session, token }) {
    // Reads from the token created above and attaches it to the session object
    session.user.role = token.role as string | undefined;
    session.user.id = (token.userId ?? token.sub) as string;
    session.user.organization = token.organization as string | null | undefined;
    return session; 
  },
  },
  pages: {
    signIn: "/en/login",
  },
});