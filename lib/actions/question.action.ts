//Server Actions for the Question
"use server";

/**
 * Question Creation Flow Chart:
 *
 * [Start]
 *    ↓
 * [Validate Request]
 *    ↓
 * [Check Authorization]
 *    ↓
 * [Start MongoDB Transaction]
 *    ↓
 * [Create Question Document]
 *    ↓
 * [Process Tags]
 *    │   ↓
 *    │   [Find/Update Each Tag]
 *    │   ↓
 *    │   [Create Tag-Question Relations]
 *    │   ↓
 *    │   [Update Question with Tag IDs]
 *    ↓
 * [Commit Transaction]
 *    ↓
 * [Return Success Response]
 *    ↓
 * [End]
 *
 * Error Handling:
 *    ↓
 * [Validation/Authorization Failed] → [Return Error Response]
 *    ↓
 * [Transaction Failed] → [Abort Transaction] → [Return Error Response]
 */

import action from "@/lib/handlers/action";
import { AskQuestionSchema } from "../validation";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import Question from "@/database/questions.model";
import Tag from "@/database/tag.model";
import TagQuestion from "@/database/tag-question.model";

/**
 * Creates a new question in the database
 * @param params - The question parameters (title, content, tags)
 * @returns Promise with success status and data or error message
 */
export async function createQuestion(
  params: CreateQuestionParams
): Promise<ActionResponse<Question>> {
  // Step 1: Validate request parameters and check user authorization
  // This ensures the request is properly formatted and the user is authenticated
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });

  // Step 2: Handle validation/authorization errors
  // If validation fails or user is not authorized, return error response
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  // Step 4: Start MongoDB transaction
  // This ensures all database operations are atomic - either all succeed or all fail
  const session = await mongoose.startSession();
  session.startTransaction();

  // Step 3: Extract validated data and user ID
  // Destructure the validated parameters and get the authenticated user's ID
  const { title, content, tags } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;
  // console.log("Validation Result", validationResult);

  // Validate userId exists
  if (!userId) {
    return {
      success: false,
      error: { message: "User not authenticated" },
      data: {} as Question,
    };
  }

  try {
    // Step 5: Create the question document
    // Save the basic question information (title, content, author)
    const [question] = await Question.create(
      [{ title, content, author: userId }],
      { session }
    );
    if (!question) {
      throw new Error("Failed to create question");
    }

    // Step 6: Process tags
    // For each tag:
    // 1. Find existing tag or create new one
    // 2. Create tag-question relationship
    // 3. Update question with tag references
    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagQuestionDocuments = [];
    for (const tag of tags) {
      // Find existing tag or create new one
      // Uses case-insensitive regex for tag matching
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
        { upsert: true, new: true, session }
      );
      if (existingTag) {
        tagIds.push(existingTag._id);
        tagQuestionDocuments.push({
          tag: existingTag._id,
          question: question._id,
        });
      }
    }

    // Step 7: Create tag-question relationships
    // Bulk insert all tag-question relationships
    await TagQuestion.insertMany(tagQuestionDocuments, { session });

    // Step 8: Update question with tag references
    // Add all tag IDs to the question's tags array
    await Question.findByIdAndUpdate(
      question._id,
      { $push: { tags: { $each: tagIds } } },
      { new: true, session }
    );

    // Step 9: Commit transaction
    // If all operations succeed, commit the transaction
    await session.commitTransaction();
    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    // Step 10: Handle errors
    // If any operation fails:
    // 1. Abort the transaction
    // 2. Return error response
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    // Step 11: Clean up
    // Always end the session, regardless of success or failure
    await session.endSession();
  }
}
