import { NextResponse } from "next/server";

export type ResponseType = "api" | "server";

import { ZodError } from "zod";
import { RequestError, ValidationError } from "@/lib/http-errors";
import logger from "../logger";

export const formatResponse = (
  responseType: ResponseType,
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined
) => {
  const responseContent = {
    success: false,
    error: {
      message,
      details: errors,
    },
  };

  return responseType == "api"
    ? NextResponse.json(responseContent, { status })
    : { status, ...responseContent };
};

const handleError = (error: unknown, responseType: ResponseType = "server") => {
  if (error instanceof RequestError) {
    logger.error(
      { err: error },
      `${responseType.toUpperCase()}Error: ${error.message}`
    );
    return formatResponse(
      responseType,
      error.statusCode,
      error.message,
      error.errors
    );
  }

  if (error instanceof ZodError) {
    logger.error({ err: error }, ` ${error.message}`);
    const validationError = new ValidationError(
      error.flatten().fieldErrors as Record<string, string[]>
    );

    return formatResponse(
      responseType,
      validationError.statusCode,
      validationError.message,
      validationError.errors
    );
  }

  console.error(error);
  if (error instanceof Error) {
    logger.error({ err: error }, `${error.message}`);
    return formatResponse(responseType, 500, error.message);
  }

  logger.error({ err: error }, `Error: Internal server error`);
  return formatResponse(responseType, 500, "Internal server error");
};
export default handleError;
