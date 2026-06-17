import { RateLimiterRedis } from "rate-limiter-flexible";

import { redis } from "./redis";

const limiter = (points: number, duration: number) =>
  new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: "calrix:rl",
    points,
    duration,
  });

export const rateLimiters = {
  default: limiter(60, 60), // 60 req/min  — general API
  chat: limiter(10, 60), // 10 req/min  — AI / expensive calls
  actions: limiter(200, 60), // 200 req/min — lightweight action reads
  strict: limiter(5, 60), // 5 req/min   — sensitive / auth-adjacent
  triage: limiter(3, 3600), // 3/hour  — expensive LLM pipeline
} as const;

export type RateLimitTier = keyof typeof rateLimiters;
