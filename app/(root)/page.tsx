import { auth } from "@/auth";
import QuestionCard from "@/components/cards/QuestionCard";
import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/Search/LocalSearch";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import { getQuestions } from "@/lib/actions/question.action";
import { api } from "@/lib/api";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import logger from "@/lib/logger";
import { log } from "console";
import { Tags } from "lucide-react";
import Link from "next/link";
import { title } from "process";

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>; //Directly returning the Promise object
}


const test = async () => {
  try {
    return await api.users.getAll();
  } catch (error) {
    return handleError(error);
  }
};
const Home = async ({ searchParams }: SearchParams) => {
  const session = await auth();

  // Log session directly using the logger
  if (session) {
    logger.info({
      type: "session",
      data: session,
    });
  }

  const { page, pageSize, query, filter } = await searchParams; //Getting query as promise from searchParams
  const { data, error, success } = await getQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
  });

  const { questions } = data || {};//Question will be fetched from the data, else empty object.
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
      {success ? (
        <div className="mt-10 flex w-full flex-col gap-6">
          {questions && questions.length > 0 ? questions.map((question) => (
            <QuestionCard key={question._id} question={question} />
          )) : (
            <div className="mt-10 flex w-full items-center justify-center">
              <p className="text-dark-400_light700">No questions found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-10 flex w-full items-center justify-center">
          <p className="text-dark-400_light700">{error?.message || "Failed to fetch questions"}</p>
        </div>
      )}

    </>
  );
};

export default Home;
