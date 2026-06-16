import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/better-auth/session";
import { ApiError } from "@/server/errors/api.error";
import { ErrorCode } from "@/server/errors/error.types";
import { rateLimiters, type RateLimitTier } from "@/server/lib/rate-limit";
import { errorResponse } from "./response";

type AuthUser = NonNullable<Awaited<ReturnType<typeof getSession>>>["user"];

type HandlerContext<TBody> = {
  req: NextRequest;
  user: AuthUser;
  body: TBody;
};

type HandlerConfig<TBody = undefined> = {
  auth?: boolean;
  rateLimit?: RateLimitTier;
  schema?: z.ZodType<TBody>;
  handler: (ctx: HandlerContext<TBody>) => Promise<Response>;
};

async function applyRateLimit(
  req: NextRequest,
  tier: RateLimitTier,
  userId?: string,
): Promise<void> {
  const key = userId ?? req.headers.get("x-forwarded-for") ?? "anonymous";
  try {
    await rateLimiters[tier].consume(key);
  } catch {
    throw ApiError.tooManyRequests();
  }
}

export function createHandler<TBody = undefined>(
  config: HandlerConfig<TBody>,
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest) => {
    try {
      let user: AuthUser | null = null;
      if (config.auth) {
        const session = await getSession();
        if (!session) throw ApiError.unauthorized();
        user = session.user;
      }

      await applyRateLimit(req, config.rateLimit ?? "default", user?.id);

      let body = undefined as TBody;
      if (config.schema) {
        const raw = await req.json();
        const parsed = config.schema.safeParse(raw);
        if (!parsed.success) {
          throw ApiError.validationError(parsed.error);
        }
        body = parsed.data;
      }

      return await config.handler({ req, user: user as AuthUser, body });
    } catch (err) {
      if (err instanceof ApiError) {
        return errorResponse(
          err.message,
          err.errorCode,
          err.statusCode,
          err.zodError ? z.prettifyError(err.zodError) : undefined,
        );
      }
      console.error("[request-pipeline]", err);
      return errorResponse(
        "Internal server error",
        ErrorCode.INTERNAL_SERVER_ERROR,
        500,
      );
    }
  };
}
