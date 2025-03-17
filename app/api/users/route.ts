import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { UserSchema } from "@/lib/validation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const users =
      await User.find(); /*Getting the users from UserModel ---> database.ts */
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body =
      await request.json(); /*Fetching the data from the request made */

    const validateData =
      UserSchema.safeParse(
        body
      ); /*Validating the fields by using the Schema created under ----> lib/validation.ts using Zod */
    if (!validateData.success) {
      throw new ValidationError(validateData.error.flatten().fieldErrors);
    }

    const { email, username } = validateData.data;
    // Check if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new ValidationError({
        email: ["User with this email already exists"],
      });
    }

    // Check if username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new ValidationError({
        username: ["Username already exists"],
      });
    }

    // Create new user
    const newUser = await User.create(validateData.data);

    return Response.json(
      {
        success: true,
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
