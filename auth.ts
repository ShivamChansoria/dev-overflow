import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { api } from "./lib/api";
import { IAccount } from "./database/account.model";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub, Google],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub as string;
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        const { success, data: existingAccount } =
          (await api.accounts.getByProvider(
            account.providerAccountId
          )) as ActionResponse<IAccount>;

        if (success && existingAccount?.userId) {
          token.sub = existingAccount.userId.toString();
        }
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      if (account?.type === "credentials") {
        return true;
      }
      if (!account || !user) return false;

      try {
        const userInfo = {
          provider: account.provider as "github" | "google",
          providerAccountId: account.providerAccountId,
          email: user.email!,
          name: user.name!,
          image: user.image!,
          username:
            account.provider === "github"
              ? (profile?.login as string)
              : (user.name?.toLowerCase() as string),
        };

        const response = (await api.auth.oAuthSignIn({
          user: userInfo,
          provider: userInfo.provider,
          providerAccountId: userInfo.providerAccountId,
        })) as ActionResponse;

        if (!response.success) {
          console.error("OAuth sign-in failed:", response);
          return false;
        }

        return true;
      } catch (error) {
        console.error("Error during OAuth sign-in:", error);
        return false;
      }
    },
  },
});
