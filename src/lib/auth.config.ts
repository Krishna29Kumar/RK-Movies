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
        // token.sub is already set to the id returned by authorize().
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { mobile?: string; id?: string }).mobile =
          token.mobile as string | undefined;
        (session.user as typeof session.user & { mobile?: string; id?: string }).id =
          token.sub ?? "";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;