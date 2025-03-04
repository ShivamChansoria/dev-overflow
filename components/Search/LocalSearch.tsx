"use client";
import Image from "next/image";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { formUrlQuery, removeKeysFormQuery } from "@/lib/url";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

interface Props {
  route: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
}
const LocalSearch = ({ route, imgSrc, placeholder, otherClasses }: Props) => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const router = useRouter();
  const pathName = usePathname();
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: searchQuery,
        });
        router.push(newUrl, { scroll: false });
      } else {
        if (pathName === route) {
          const newUrl = removeKeysFormQuery({
            params: searchParams.toString(),
            keysToRemove: ["query"],
          });
        }
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, router, route, searchParams]);
  return (
    <div
      className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      <Image
        src={imgSrc}
        width={24}
        height={24}
        alt="Search"
        className="cursor-pointer"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
      />
    </div>
  );
};

export default LocalSearch;
