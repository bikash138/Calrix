import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/better-auth/session";
import { ApiError } from "@/server/errors/api.error";
import { ErrorCode } from "@/server/errors/error.types";
import { errorResponse } from "./response";

type AuthUser = NonNullable<Awaited<ReturnType<typeof getSession>>>["user"];

type HandlerContext<TBody> = {
  req: NextRequest;
  user: AuthUser;
  body: TBody;
};

type HandlerConfig<TBody = undefined> = {
  auth?: boolean;
  schema?: z.ZodType<TBody>;
  handler: (ctx: HandlerContext<TBody>) => Promise<Response>;
};

// Rate limit stub — wire up Upstash or similar here when ready
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function applyRateLimit(_req: NextRequest): Promise<void> {
  // TODO: implement rate limiting
}

export function createHandler<TBody = undefined>(
  config: HandlerConfig<TBody>,
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest) => {
    try {
      await applyRateLimit(req);

      let user: AuthUser | null = null;
      if (config.auth) {
        const session = await getSession();
        if (!session) throw ApiError.unauthorized();
        user = session.user;
      }

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
