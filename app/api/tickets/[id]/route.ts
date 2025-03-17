import { tickets } from "@/app/database";
import logger from "@/lib/logger";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const ticketId = parseInt(id);
    const ticket = tickets.find((ticket) => ticket.id === ticketId);

    if (!ticket) {
      logger.error({ ticketId }, "Ticket not found");
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    logger.info({ ticketId }, "Ticket found");
    return NextResponse.json({ ticket });
  } catch (error) {
    logger.error(error, "Error processing ticket request");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, status, type } = await request.json();

  const ticket = tickets.find((ticket) => ticket.id === parseInt(id));
  if (!ticket) {
    logger.error({ ticketId: parseInt(id) }, "Ticket not found");
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  if (name) ticket.name = name;
  if (status) ticket.status = status;
  if (type) ticket.type = type;
  logger.info({ ticketId: parseInt(id) }, "Ticket updated");
  return NextResponse.json({ ticket });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const ticketIndex = tickets.findIndex(
      (ticket) => ticket.id === parseInt(id)
    );

    if (ticketIndex === -1) {
      logger.error({ ticketId: parseInt(id) }, "Ticket not found");
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    tickets.splice(ticketIndex, 1);
    logger.info({ ticketId: parseInt(id) }, "Ticket deleted");
    return NextResponse.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    logger.error(error, "Error deleting ticket");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
