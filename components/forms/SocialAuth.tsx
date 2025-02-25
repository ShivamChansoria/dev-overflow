"use client";
import React, { ReactNode } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { signIn } from "@/auth";
import ROUTES from "@/constants/routes";

const SocialAuth = ({ children }: { children: ReactNode }) => {
  const handleSignIn = async (provider: "github" | "google") => {
    try {
      await signIn(provider, {
        callbackUrl: ROUTES.HOME,
        redirect: false,
      }); //Here the signIn fuction is built in function of the Auth.js.
    } catch (error) {
      console.error(error);
      toast("Sign in Failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while signing in",
      });
    }
  };
  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      <Button
        className="background-dark400_light900 body-medium text-dark200_light800 rounded-2 min-h-12 flex-1 px-4 py-3"
        onClick={() => handleSignIn("github")}
      >
        <Image
          src="/icons/github.svg"
          alt="Github Logo"
          width={20}
          height={20}
          className="invert-colors mr-2.5 object-contain"
        />
        <span>{children} with GitHub</span>
      </Button>
      <Button
        className="background-dark400_light900 body-medium text-dark200_light800 rounded-2 min-h-12 flex-1 px-4 py-3"
        onClick={() => handleSignIn("google")}
      >
        <Image
          src="/icons/google.svg"
          alt="Google Logo"
          width={20}
          height={20}
          className=" mr-2.5 object-contain"
        />
        <span>{children} with Google</span>
      </Button>
    </div>
  );
};

export default SocialAuth;
