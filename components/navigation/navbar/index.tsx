import Theme from "../navbar/Theme";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import MobileNavigation from "./MobileNavigation";
import { auth } from "@/auth";
import UserAvatar from "@/components/UserAvatar";
import logger from "@/lib/logger";

const Navbar = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  logger.info("userId", { data: userId });
  console.log("Full session data:", session);
  console.log("User data:", session?.user);

  return (
    <nav className="flex-between background-light900_dark200 fixed z-50 w-full gap-5 p-6 shadow-light-300 dark:shadow-none sm:px-12">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/images/site-logo.svg"
          width={23}
          height={23}
          alt="Dev Flow logo"
        />
        {/* Here in Next Image tag we don't have to provide the full path */}
        <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden ">
          Dev <span className="text-primary-500">OverFlow</span>
        </p>
      </Link>
      <p>Global Search</p>
      <div className="flex-between gap-5">
        <Theme />
        {session?.user && (
          <UserAvatar
            id={session.user.id || ''}
            name={session.user.name || 'User'}
            imageUrl={session.user.image || ''}
          />
        )}
        <MobileNavigation />
      </div>
    </nav>
  );
};

export default Navbar;
