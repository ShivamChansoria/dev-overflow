"use server";

import action from "@/lib/handlers/action";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import { SignInSchema, SignUpSchema } from "../validation";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import User from "@/database/user.model";
import bcrypt from "bcryptjs";
import Account from "@/database/account.model";
import { signIn } from "@/auth";
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

/**
 * Flow Chart of Sign In Process:
 *
 * 1. Start
 *    ↓
 * 2. Validate Input Parameters (email, password)
 *    ↓
 * 3. Check if User Exists
 *    ├── If Not Exists → Throw NotFoundError
 *    └── If Exists → Continue
 *    ↓
 * 4. Check if Account Exists
 *    ├── If Not Exists → Throw NotFoundError
 *    └── If Exists → Continue
 *    ↓
 * 5. Verify Password
 *    ├── If Invalid → Throw ValidationError
 *    └── If Valid → Continue
 *    ↓
 * 6. Sign In User
 *    ↓
 * 7. Return Success Response
 *    ↓
 * 8. End
 *
 * Error Handling:
 * ├── Validation Error → Return Validation Error Response
 * ├── User Not Found → Return NotFoundError
 * ├── Account Not Found → Return NotFoundError
 * ├── Invalid Password → Return ValidationError
 * └── Any Other Error → Return Generic Error Response
 */

/**
 * Handles user authentication with email/password credentials
 * @param params - User authentication data (email, password)
 * @returns Promise<ActionResponse> - Success or error response
 */

export async function signInWithCredentials(
  params: Pick<AuthCredentials, "email" | "password">
): Promise<ActionResponse> {
  // Step 1: Validate input parameters against schema
  const validationResult = await action({
    params,
    schema: SignInSchema,
  });

  // Step 2: Return error if validation fails
  if (validationResult instanceof Error) {
    return handleError(validationResult, "server") as ActionResponse<null>;
  }

  // Step 3: Extract validated email and password
  const { email, password } = validationResult.params;

  try {
    // Step 4: Check if user exists with the provided email
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new NotFoundError("User");
    }

    // Step 5: Check if account exists for this user with credentials provider
    const existingAccount = await Account.findOne({
      provider: "credentials",
      providerAccountId: email,
    });
    if (!existingAccount) {
      throw new NotFoundError("Account");
    }

    // Step 6: Verify password matches the stored hash
    const passwrodMatch = await bcrypt.compare(
      password,
      existingAccount.password
    );
    if (!passwrodMatch) {
      throw new ValidationError({
        password: ["Invalid password"],
      });
    }

    // Step 7: Sign in the user using NextAuth
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // Step 8: Return success response
    return { success: true, data: null } as ActionResponse;
  } catch (error) {
    // Step 9: Handle any errors that occur during the process
    return handleError(error) as ActionResponse;
  }
}
