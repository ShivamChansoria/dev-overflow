/**
 * Flow Chart of OAuth Sign In Process:
 *
 * 1. Start
 *    ↓
 * 2. Validate Database Connection
 *    ↓
 * 3. Start MongoDB Session & Transaction
 *    ↓
 * 4. Parse & Validate Request Body
 *    ↓
 * 5. Check if User Exists
 *    ├── If No → Create New User
 *    └── If Yes → Update User Info if Needed
 *    ↓
 * 6. Check if Account Exists
 *    ├── If No → Create New Account
 *    └── If Yes → Skip Account Creation
 *    ↓
 * 7. Commit Transaction
 *    ↓
 * 8. Return Success Response
 *    ↓
 * 9. If Error:
 *    ├── Abort Transaction
 *    └── Return Error Response
 *    ↓
 * 10. End Session
 *     ↓
 * 11. End
 */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { SignInWithOAuthSchema } from "@/lib/validation";
import User from "@/database/user.model";
import Account from "@/database/account.model";
import mongoose from "mongoose";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import slugify from "slugify";

export async function POST(request: NextRequest) {
  // Connect to database first
  await connectToDatabase();

  // Initialize MongoDB session for transaction management
  const session = await mongoose.startSession();
  // Start a new transaction within the session
  session.startTransaction();

  try {
    const { provider, providerAccountId, user } =
      await request.json(); /*-------> ALways use "await" with request.json() */

    // Validate request body
    const validatedData = SignInWithOAuthSchema.safeParse({
      provider,
      providerAccountId,
      user,
    });

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }

    const { name, username, email, image } = user;
    const slugifiedUsername = slugify(username, {
      lower: true,
      strict: true,
      trim: true,
    });

    // Check if user exists
    let existingUser = await User.findOne({ email }).session(
      session
    ); /*Checking if the user already exists with the email. &  making the changes in the same session.*/

    if (!existingUser) {
      // Create new user if doesn't exist
      existingUser = await User.create({
        name,
        username: slugifiedUsername,
        email,
        image,
      });
    } else {
      const updatedData: { name?: string; image?: string } = {}; //Creating a new object to store the updated data.
      if (existingUser.name !== name) updatedData.name = name;
      if (existingUser.image !== image) updatedData.image = image;
      if (Object.keys(updatedData).length > 0) {
        //Checking if there is any updated data.
        await existingUser
          .updateOne({ _id: existingUser._id }, { $set: updatedData })
          .session(
            session
          ); /*----> Updating the data in the DataBase and making the changes in the same session. */
      }
    }

    // Checking if the account already exists.
    const existingAccount = await Account.findOne({
      userId: existingUser._id,
      provider,
      providerAccountId,
    }).session(session);

    if (!existingAccount) {
      // Create new account if doesn't exist
      await Account.create(
        [
          {
            userId: existingUser._id,
            provider,
            providerAccountId,
            name: existingUser.name,
          },
        ],
        { session }
      );
    }

    // Commit all changes made within the session
    await session.commitTransaction();

    return NextResponse.json(
      {
        success: true,
        message: "Authentication successful",
        user: existingUser,
      },
      { status: 200 }
    );
  } catch (error) {
    // Rollback all changes if any error occurs
    await session.abortTransaction();

    return handleError(error, "api") as APIErrorResponse;
  } finally {
    // Always end the session to clean up resources
    session.endSession();
  }
}
