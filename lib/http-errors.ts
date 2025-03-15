export class RequestError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "RequestError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
export class ValidationError extends RequestError {
  constructor(fieldErrors: Record<string, string[]>) {
    const message = ValidationError.formatFieldErrors(fieldErrors);
    super(message, 400, fieldErrors);
    this.name = "ValidationError";
    this.errors = fieldErrors;
  }

  static formatFieldErrors(fieldErrors: Record<string, string[]>): string {
    const formattedMessages = Object.entries(fieldErrors).map(
      ([field, messages]) => {
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
        return messages[0] === "Required"
          ? `${fieldName} is required`
          : `${fieldName} ${messages.join(" and ")}`;
      }
    );
    return formattedMessages.join(", ");
  }
}

export class NotFoundError extends RequestError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends RequestError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends RequestError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}
