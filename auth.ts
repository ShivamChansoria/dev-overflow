/**
 * NextAuth Configuration and Setup
 *
 * This file configures authentication for the application using NextAuth.js
 * It supports three authentication methods:
 * 1. GitHub OAuth
 * 2. Google OAuth
 * 3. Email/Password Credentials
 */

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { api } from "./lib/api";
import { IUser } from "./database/user.model";
import { SignInSchema } from "./lib/validation";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import { IAccount } from "./database/account.model";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Google,
    Credentials({
      async authorize(credentials) {
        const validatedFields = SignInSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        // Step 2: Extract validated email and password
        const { email, password } = validatedFields.data;

        // Step 3: Check if account exists with the email
        const { success, data: existingAccount } =
          (await api.accounts.getByProvider(email)) as ActionResponse<IAccount>;

        if (!success || !existingAccount) {
          return null;
        }

        // Step 4: Get associated user data
        const { data: existingUser } = (await api.users.getById(
          existingAccount.userId.toString()
        )) as ActionResponse<IUser>;
        if (!success || !existingUser) {
          return null;
        }

        // Step 5: Verify password
        const isValidPassword = await bcrypt.compare(
          password,
          existingAccount.password!
        );

        // Step 6: Return user data if password is valid
        if (isValidPassword) {
          return {
            id: existingUser._id, // Changed from id to _id to match IUser interface
            name: existingUser.name,
            email: existingUser.email,
            image: existingUser.image,
            username: existingUser.username,
          };
        }

        return null;
      },
    }),
  ],

  // Callbacks for handling authentication events
  callbacks: {
    // Callback 1: Session Management
    // Adds user ID to the session object
    async session({ session, token }) {
      session.user.id = token.sub as string;
      return session;
    },

    // Callback 2: JWT Token Management
    // Adds user ID to the JWT token for OAuth providers
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

    // Callback 3: Sign In Process
    // Handles both credential and OAuth sign-in
    async signIn({ user, account, profile }) {
      // For credential sign-in, always allow
      if (account?.type === "credentials") {
        return true;
      }

      // For OAuth sign-in, validate user and account
      if (!account || !user) return false;

      try {
        // Prepare user information for OAuth sign-in
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

        // Call OAuth sign-in API
        const response = (await api.auth.oAuthSignIn({
          user: userInfo,
          provider: userInfo.provider,
          providerAccountId: userInfo.providerAccountId,
        })) as ActionResponse;

        // Return success/failure based on API response
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
