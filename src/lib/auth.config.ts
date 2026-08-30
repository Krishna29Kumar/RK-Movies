import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.mobile = (user as { mobile?: string }).mobile;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { mobile?: string }).mobile =
          token.mobile as string | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
