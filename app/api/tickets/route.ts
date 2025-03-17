import { NextResponse } from "next/server";
import { tickets } from "@/app/database";
import logger from "@/lib/logger";
import handleError from "@/lib/handlers/error";

export async function GET() {
  try {
    logger.info("Fetching all tickets");
    return NextResponse.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    return handleError(error, "api");
  }
}

export async function POST(request: Request) {
  const ticket = await request.json();
  try {
    tickets.push({ id: tickets.length + 1, ...ticket });
    logger.info(`Ticket added: ${ticket.name}`);
    return NextResponse.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    logger.error(`Error adding ticket: ${error}`);
    return NextResponse.json({
      success: false,
      error: error,
    });
  }
}
