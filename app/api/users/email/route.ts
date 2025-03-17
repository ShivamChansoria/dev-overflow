import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import dbConnect from "@/lib/mongoose";
import { NotFoundError } from "@/lib/http-errors";
import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email } = await request.json();

    if (!email) {
      throw new NotFoundError("Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFoundError("User not found with this email");
    }

    logger.info(`User found with email: ${email}`);
    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
