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
  default: limiter(60, 60), // general API
  chat: limiter(10, 60), // AI / expensive calls
  actions: limiter(200, 60), // lightweight action reads
  strict: limiter(5, 60), // sensitive / auth-adjacent
} as const;

export type RateLimitTier = keyof typeof rateLimiters;
