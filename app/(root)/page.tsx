import Link from "next/link";

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const Home = async ({ searchParams }: SearchParams) => {
  return <>Home</>;
};

export default Home;
