import type { z, ZodError } from "zod";
import { ErrorCode } from "./error.types";

const STATUS_CODE_MAP: Record<ErrorCode, number> = {
  // Auth
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  // Request
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.VALIDATION_ERROR]: 422,
  // Resource
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.CONFLICT]: 409,
  // Rate limit
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  // AI
  [ErrorCode.AI_PROVIDER_ERROR]: 502,
  [ErrorCode.AI_GENERATION_FAILED]: 500,
  [ErrorCode.AI_TOOL_EXECUTION_FAILED]: 500,
  // Command bar
  [ErrorCode.COMMAND_NOT_UNDERSTOOD]: 400,
  [ErrorCode.ACTION_REQUIRES_CONFIRMATION]: 202,
  // Calendar
  [ErrorCode.CALENDAR_CONFLICT]: 409,
  // Providers
  [ErrorCode.PROVIDER_TOKEN_MISSING]: 401,
  [ErrorCode.PROVIDER_TOKEN_EXPIRED]: 401,
  [ErrorCode.PROVIDER_RATE_LIMIT]: 429,
  [ErrorCode.PROVIDER_API_ERROR]: 502,
  // System
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
};

export class ApiError extends Error {
  public readonly errorCode: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly zodError?: z.ZodError;

  constructor(
    message: string,
    errorCode: ErrorCode,
    isOperational = true,
    zodError?: z.ZodError,
  ) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = STATUS_CODE_MAP[errorCode];
    this.isOperational = isOperational;
    this.zodError = zodError;
  }

  // Auth
  public static unauthorized(message = "Unauthorized") {
    return new ApiError(message, ErrorCode.UNAUTHORIZED);
  }

  public static forbidden(message = "Forbidden") {
    return new ApiError(message, ErrorCode.FORBIDDEN);
  }

  public static invalidCredentials(message = "Invalid credentials") {
    return new ApiError(message, ErrorCode.INVALID_CREDENTIALS);
  }

  public static tokenExpired(message = "Token expired") {
    return new ApiError(message, ErrorCode.TOKEN_EXPIRED);
  }

  // Request
  public static badRequest(message = "Bad request") {
    return new ApiError(message, ErrorCode.BAD_REQUEST);
  }

  public static validationError(zodError: ZodError, message = "Validation error") {
    return new ApiError(message, ErrorCode.VALIDATION_ERROR, true, zodError);
  }

  // Resource
  public static notFound(message = "Not found") {
    return new ApiError(message, ErrorCode.NOT_FOUND);
  }

  public static conflict(message = "Conflict") {
    return new ApiError(message, ErrorCode.CONFLICT);
  }

  // Rate limit
  public static tooManyRequests(message = "Too many requests") {
    return new ApiError(message, ErrorCode.TOO_MANY_REQUESTS);
  }

  // AI
  public static aiProviderError(message = "AI provider error") {
    return new ApiError(message, ErrorCode.AI_PROVIDER_ERROR);
  }

  public static aiGenerationFailed(message = "AI generation failed") {
    return new ApiError(message, ErrorCode.AI_GENERATION_FAILED);
  }

  public static aiToolExecutionFailed(message = "AI tool execution failed") {
    return new ApiError(message, ErrorCode.AI_TOOL_EXECUTION_FAILED);
  }

  // Command bar
  public static commandNotUnderstood(message = "Command not understood") {
    return new ApiError(message, ErrorCode.COMMAND_NOT_UNDERSTOOD);
  }

  public static actionRequiresConfirmation(
    message = "Action requires confirmation",
  ) {
    return new ApiError(message, ErrorCode.ACTION_REQUIRES_CONFIRMATION);
  }

  // Calendar
  public static calendarConflict(message = "Calendar conflict") {
    return new ApiError(message, ErrorCode.CALENDAR_CONFLICT);
  }

  // Providers
  public static providerTokenMissing(
    message = "Provider account not connected",
  ) {
    return new ApiError(message, ErrorCode.PROVIDER_TOKEN_MISSING);
  }

  public static providerTokenExpired(
    message = "Provider access token expired, please reconnect",
  ) {
    return new ApiError(message, ErrorCode.PROVIDER_TOKEN_EXPIRED);
  }

  public static providerRateLimit(
    message = "Provider rate limit exceeded, please try again later",
  ) {
    return new ApiError(message, ErrorCode.PROVIDER_RATE_LIMIT);
  }

  public static providerApiError(message = "Provider API error") {
    return new ApiError(message, ErrorCode.PROVIDER_API_ERROR);
  }

  // System
  public static serviceUnavailable(message = "Service unavailable") {
    return new ApiError(message, ErrorCode.SERVICE_UNAVAILABLE, false);
  }

  public static internal(message = "Internal server error") {
    return new ApiError(message, ErrorCode.INTERNAL_SERVER_ERROR, false);
  }
}
