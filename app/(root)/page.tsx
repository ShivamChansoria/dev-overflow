import QuestionCard from "@/components/cards/QuestionCard";
import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/Search/LocalSearch";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import { title } from "process";

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>; //Directly returning the Promise object
}

const questions = [
  {
    _id: "1",
    title: "How to learn React?",
    description: "I want to learn React, can someone help me?",
    tags: [
      { _id: "1", name: "React" },
      { _id: "2", name: "JavaScript" },
    ],
  },
  {
    _id: "2",
    title: "How to learn Next.js?",
    description: "I want to learn Next.js, can someone help me?",
    tags: [
      { _id: "1", name: "Next.js" },
      { _id: "2", name: "JavaScript" },
    ],
  },
  {
    _id: "3",
    title: "How to learn Node.js?",
    description: "I want to learn Node.js, can someone help me?",
    tags: [
      { _id: "1", name: "Node.js" },
      { _id: "2", name: "JavaScript" },
    ],
  },
];
const Home = async ({ searchParams }: SearchParams) => {
  const { query, filter } = await searchParams; //Getting query as promise from searchParams
  const filteredQuestions = questions.filter((question) => {
    if (query && question.title) {
      return question.title.toLowerCase().includes(query.toLowerCase());
    }
    return false; // Exclude this item if query or question.title is undefined
  });
  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark-100_light900">All Questions</h1>
        <Button
          className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900"
          asChild
        >
          <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>
      <section className="mt-11">
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          placeholder="Search Questions..."
          otherClasses="flex-1"
        />
      </section>
      <HomeFilter />
      <div className="mt-10 flex w-full flex-col gap-6">
        {filteredQuestions.map((question) => (
          <QuestionCard /key={question._id} question={question} />
        ))}
      </div>
    </>
  );
};

export default Home;
