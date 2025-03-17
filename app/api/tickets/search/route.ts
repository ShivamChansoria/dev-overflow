import { tickets } from "@/app/database";
import logger from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const Params = request.nextUrl.searchParams;
  const query =
    Params.get(
      "query"
    ); /*Will fetch the queries from the url provided to "query=" */

  if (!query) {
    logger.error("No query provided");
    return NextResponse.json({ tickets }, { status: 400 });
  }
  const filteredTickets = tickets.filter((ticket) =>
    ticket.name.toLowerCase().includes(query.toLowerCase())
  );
  logger.info({ query, matches: filteredTickets.length }, "Search results");
  return NextResponse.json({ filteredTickets }, { status: 200 });
}
