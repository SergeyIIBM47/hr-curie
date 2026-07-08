import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import {
  isLoginRateLimited,
  recordLoginFailure,
  clearLoginFailures,
} from "@/lib/rate-limit";
import type { Role } from "@prisma/client";

// Compared for unknown emails so response timing does not reveal whether
// an account exists (bcrypt.compare only runs for real users otherwise).
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("timing-equalizer", 12);

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      name: string;
      image?: string;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        if (isLoginRateLimited(email)) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            employee: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        });

        if (!user) {
          await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
          recordLoginFailure(email);
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          recordLoginFailure(email);
          return null;
        }

        clearLoginFailures(email);

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.employee
            ? `${user.employee.firstName} ${user.employee.lastName}`
            : user.email,
          image: user.employee?.avatarUrl ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.role = token.role as Role;
      return session;
    },
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
});
