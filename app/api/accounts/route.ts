import Account from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { ForbiddenError, ValidationError } from "@/lib/http-errors";
import logger from "@/lib/logger";
import dbConnect from "@/lib/mongoose";
import { AccountSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json(); // Fetching the data from the request made
    const validateData = AccountSchema.parse(body); // Validating the fields by using the Schema created under ----> lib/validation.ts using Zod

    // Check if account exists
    const existingAccount = await Account.findOne({
      provider: validateData.provider,
      providerAccountId: validateData.providerAccountId,
    });

    if (existingAccount) {
      throw new ForbiddenError("An Account with same provider already exists");
    }
    // Create new account
    const newAccount = await Account.create(validateData);
    logger.info(`Account ${newAccount.username} created successfully`);
    return NextResponse.json(
      {
        success: true,
        data: newAccount,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
