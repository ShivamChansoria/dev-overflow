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
import {
  AskQuestionSchema,
  GetQuestionSchema,
  PaginatedSearchParamsSchema,
} from "../validation";
import handleError from "../handlers/error";
import mongoose, { FilterQuery } from "mongoose";
import Question, { IQuestionDoc } from "@/database/questions.model";
import Tag, { ITag, ITagDoc } from "@/database/tag.model";
import TagQuestion from "@/database/tag-question.model";
import { toast } from "sonner";
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

export async function editQuestion(
  params: EditQuestionParams
): Promise<ActionResponse<IQuestionDoc>> {
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
  const { title, content, tags, questionId } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;
  // console.log("Validation Result", validationResult);

  try {
    // Step 5: Find the question by the questionId
    const question = await Question.findById(questionId).populate("tags");
    if (!question) {
      throw new Error("Question not found");
    }
    console.log("Author: ", question.author.toString());
    console.log("User: ", userId);

    if (question.author.toString() !== userId) {
      toast.error("You are not authorized to edit this question");
      throw new Error("Unauthorized");
    }

    // Step 6: Update the question
    if (question.title !== title || question.content !== content) {
      question.title = title;
      question.content = content;
      await question.save({ session });
    }
    const tagsToAdd = tags.filter(
      (tag) =>
        !question.tags.some(
          (t: ITagDoc) => t.name.toLowerCase() === tag.toLowerCase()
        )
    );
    const tagsToRemove = question.tags.filter(
      (tag: ITagDoc) =>
        !tags.some((t) => t.toLowerCase() === tag.name.toLowerCase())
    );

    const newTagDocuments = [];

    if (tagsToAdd.length > 0) {
      for (const tag of tagsToAdd) {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${tag}$`, "i") } },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { upsert: true, new: true, session }
        );
        if (existingTag) {
          newTagDocuments.push({
            tag: existingTag._id,
            question: question._id,
          });
          question.tags.push(existingTag._id);
        }
      }
    }

    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((tag: ITagDoc) => tag._id);
      await Tag.updateMany(
        { _id: { $in: tagIdsToRemove } },
        { $inc: { questions: -1 } },
        { session }
      );
      await TagQuestion.deleteMany(
        { tag: { $in: tagIdsToRemove }, question: question._id },
        { session }
      );
      question.tags = question.tags.filter(
        (tag: mongoose.Types.ObjectId) =>
          !tagIdsToRemove.some((id: mongoose.Types.ObjectId) =>
            id.equals(tag._id)
          )
      );
      if (newTagDocuments.length > 0) {
        await TagQuestion.insertMany(newTagDocuments, { session });
      }
    }
    await question.save({ session });
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
export async function getQuestion(
  params: GetQuestionParams
): Promise<ActionResponse<Question>> {
  // Step 1: Validate request parameters and check user authorization
  // This ensures the request is properly formatted and the user is authenticated
  const validationResult = await action({
    params,
    schema: GetQuestionSchema,
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
  const { questionId } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;
  // console.log("Validation Result", validationResult)

  try {
    const question = await Question.findById(questionId)
      .populate("tags")
      .populate("author", "_id name image");
    if (!question) {
      throw new Error("Question not found");
    }
    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getQuestions(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>> {
  // Step 1: Validate request parameters
  // This ensures the request contains valid pagination, sorting, and filtering parameters
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: false, // No authentication required for viewing questions
  });

  // Step 2: Handle validation errors
  // If the parameters don't match the schema, return an error response
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  // Step 3: Extract validated data from the request
  // Destructure the parameters with default values for pagination
  const {
    page = 1, // Default to first page if not specified
    pageSize = 10, // Default to 10 items per page if not specified
    sort, // Optional sorting criteria
    query, // Optional search query
    filter, // Optional filter criteria
  } = validationResult.params!;

  // Step 4: Calculate pagination parameters
  // Convert page and pageSize to numbers and calculate how many items to skip
  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  // Step 5: Initialize the MongoDB query filter
  // This object will be used to build the database query
  const filterQuery: FilterQuery<typeof Question> = {};

  // Step 6: Handle special filter cases
  // If filter is "recommended", return empty results (placeholder for future implementation)
  if (filter === "recommended") {
    return {
      success: true,
      data: {
        questions: [],
        isNext: false,
      },
    };
  }

  // Step 7: Add search query if provided
  // If a search query exists, search in both title and content fields (case-insensitive)
  if (query) {
    filterQuery.$or = [
      { title: { $regex: new RegExp(query, "i") } },
      { content: { $regex: new RegExp(query, "i") } },
    ];
  }

  // Step 8: Add tag filter if provided
  // If a tag filter is specified, filter questions by that tag
  if (filter) {
    filterQuery.tags = { $in: [filter] };
  }

  // Step 9: Define sorting criteria
  // Set up the sorting object based on the filter parameter
  let sortCriteria = {};

  // Step 10: Apply specific sorting rules based on filter
  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 }; // Sort by newest first
      break;
    case "unanswered":
      filterQuery.answers = 0; // Filter for questions with no answers
      sortCriteria = { answers: 1 }; // Sort by least answers first
      break;
    case "popular":
      sortCriteria = { upvotes: -1 }; // Sort by most upvotes first
      break;
    default:
      sortCriteria = { createdAt: -1 }; // Default to newest first
  }

  try {
    // Step 11: Execute the database query
    // Find questions matching the filter, populate related data, and apply pagination
    const questions = await Question.find(filterQuery)
      .populate("tags", "name") // Populate tag names
      // .populate("author", "name image") // Populate author info
      .lean() // Convert to plain JavaScript objects
      .sort(sortCriteria) // Apply sorting
      .skip(skip) // Skip for pagination
      .limit(limit); // Limit results per page

    // Step 12: Count total matching documents
    // This is used to determine if there are more pages
    const totalQuestions = await Question.countDocuments(filterQuery);

    // Step 13: Determine if there are more questions
    // Check if there are more questions beyond the current page
    const isNext = totalQuestions > skip + questions.length;

    // Step 14: Return the results
    // Return the questions, pagination info, and success status
    return {
      success: true,
      data: {
        questions: JSON.parse(JSON.stringify(questions)), // Deep clone to remove Mongoose metadata
        isNext,
      },
    };
  } catch (error) {
    // Step 15: Handle any errors that occur during the process
    return handleError(error) as ErrorResponse;
  }
}
