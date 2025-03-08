import ROUTES from "@/constants/routes";
import Link from "next/link";
import { Badge } from "../ui/badge";
import React from "react";
import { getDeviconClassName } from "@/lib/utils";

interface Props {
  _id: string;
  name: string;
<<<<<<< HEAD
  questions: number;
=======
  questions?: number;
>>>>>>> 369607c (added Question Card)
  showCount?: boolean;
  compact?: boolean;
}

const TagCard = ({ _id, name, questions, compact, showCount }: Props) => {
  const iconClass = getDeviconClassName(name);

  return (
    <Link href={ROUTES.TAGS(_id)} className="flex justify-between gap-2">
      <Badge className="subtle-medium background-light800_dark300 text-light400_light500 rounded-md border-none px-4 py-2 uppercase">
        <div className="flex-center space-x-2">
          <i className={`${iconClass} text-sm`}></i>
          <span>{name}</span>
        </div>
      </Badge>
      {showCount && (
        <p className="small-medium text-dark-500_light700">{questions}</p>
      )}
    </Link>
  );
};

export default TagCard;
