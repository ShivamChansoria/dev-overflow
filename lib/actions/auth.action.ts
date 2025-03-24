"use server";

/**
 * Flow Chart of Sign Up Process:
 *
 * 1. Start
 *    ↓
 * 2. Validate Input Parameters
 *    ↓
 * 3. Check for Existing User
 *    ├── If Exists → Throw Error
 *    └── If Not → Continue
 *    ↓
 * 4. Hash Password
 *    ↓
 * 5. Start MongoDB Transaction
 *    ↓
 * 6. Create User Record
 *    ↓
 * 7. Create Account Record
 *    ↓
 * 8. Commit Transaction
 *    ↓
 * 9. Return Success Response
 *    ↓
 * 10. End
 *
 * Error Handling:
 * ├── Validation Error → Return Validation Error Response
 * ├── Existing User → Return User Exists Error
 * ├── Transaction Error → Abort Transaction & Return Error
 * └── Any Other Error → Return Generic Error Response
 */

import action from "@/lib/handlers/action";
import { ValidationError } from "@/lib/http-errors";
import { SignUpSchema } from "../validation";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import User from "@/database/user.model";
import bcrypt from "bcryptjs";
import Account from "@/database/account.model";
import { signIn } from "@/auth";

/**
 * Handles user registration with email/password credentials
 * @param params - User registration data (name, username, email, password)
 * @returns Promise<ActionResponse> - Success or error response
 */
export async function signUpWithCredentials(
  params: AuthCredentials
): Promise<ActionResponse> {
  // Step 1: Validate input parameters against schema
  const validationResult = await action({
    params,
    schema: SignUpSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult, "server") as ActionResponse<null>;
  }

  // Step 2: Extract validated parameters
  const { name, username, email, password } = validationResult.params;

  // Step 3: Initialize MongoDB transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 4: Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Step 5: Hash password for secure storage
    const hashedPassword = await bcrypt.hash(password, 12);

    // Step 6: Create new user record
    const [newUser] = await User.create(
      [
        {
          name,
          username,
          email,
        },
      ],
      { session }
    );

    // Step 7: Create associated account record
    await Account.create(
      [
        {
          userId: newUser._id,
          name: name,
          provider: "credentials",
          providerAccountId: email,
          password: hashedPassword,
        },
      ],
      { session }
    );

    // Step 8: Commit transaction and return success
    await session.commitTransaction();

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true, data: null } as ActionResponse;
  } catch (error) {
    // Step 9: Handle errors by aborting transaction
    await session.abortTransaction();
    return handleError(error) as ActionResponse;
  } finally {
    // Step 10: Clean up by ending session
    await session.endSession();
  }
}
