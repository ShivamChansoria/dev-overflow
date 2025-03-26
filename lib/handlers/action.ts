/**
 * Flow Chart of Action Handler Process:
 *
 * 1. Start
 *    ↓
 * 2. Check if Schema Validation is Required
 *    ↓
 * 3. If Yes → Validate Params Against Schema
 *    ├── If Invalid → Return ValidationError
 *    └── If Valid → Continue
 *    ↓
 * 4. Check if Authorization is Required
 *    ↓
 * 5. If Yes → Check User Session
 *    ├── If No Session → Return UnauthorizedError
 *    └── If Session Exists → Continue
 *    ↓
 * 6. Connect to Database
 *    ↓
 * 7. Return Validated Params and Session
 *    ↓
 * 8. End
 */
"use server";

import { auth } from "@/auth";
import { Session } from "inspector";
import { ZodSchema, ZodError } from "zod";
import { ValidationError, UnauthorizedError } from "../http-errors";
import dbConnect from "../mongoose";

export type ActionOptions<T> = {
  params: T; // The parameters to validate
  schema?: ZodSchema<T>; // Optional Zod schema for validation
  authorize?: boolean; // Whether to require authentication
};

/**
 * Generic action handler function that:
 * 1. Validates parameters against a schema if provided
 * 2. Checks authentication if required
 * 3. Connects to the database
 * 4. Returns validated parameters and session
 */
async function action<T>({
  params,
  schema,
  authorize = false, // Default to no authorization required
}: ActionOptions<T>) {
  // Step 1: Schema Validation
  if (schema && params) {
    try {
      schema.parse(params); // Validate params against schema
    } catch (error) {
      if (error instanceof ZodError) {
        // If validation fails, return a ValidationError with field-specific errors
        return new ValidationError(
          error.flatten().fieldErrors as Record<string, string[]>
        );
      } else {
        // Handle unexpected validation errors
        return new Error("Schema validation failed!!!");
      }
    }
  }

  // Step 2: Authentication Check
  let session = null;
  if (authorize) {
    session = await auth(); // Get the current session
    if (!session) {
      // If authorization is required but no session exists, return UnauthorizedError
      return new UnauthorizedError("You must be logged in");
    }
  }

  // Step 3: Database Connection
  await dbConnect(); // Ensure database connection is established

  // Step 4: Return Validated Data
  return { params, session }; // Return validated parameters and session
}

export default action;
