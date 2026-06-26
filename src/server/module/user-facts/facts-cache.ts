import { redis } from "@/server/lib/redis";
import { FactCategory } from "@/server/db/schema/user-facts";
import { userFactsRepo, type UserFact } from "./user-facts.repo";

const key = (userId: string) => `user:${userId}:facts`;
const TTL_SECONDS = 60 * 60 * 6; // 6h safety net; write-through keeps it fresh
const EMPTY = "__empty__"; // sentinel so a no-facts user isn't re-warmed every turn
const handle = (id: string) => id.slice(0, 8);

/** Load all of a user's facts from Postgres into a Redis HASH (field = 8-char handle). */
export async function warmFactsCache(userId: string): Promise<void> {
  const facts = await userFactsRepo.listForUser(userId);
  const k = key(userId);
  const pipe = redis.multi().del(k);

  if (facts.length) {
    const entries: Record<string, string> = {};
    for (const f of facts) entries[handle(f.id)] = JSON.stringify(f);
    pipe.hset(k, entries);
  } else {
    pipe.hset(k, EMPTY, "1");
  }

  await pipe.expire(k, TTL_SECONDS).exec();
}

/** Render the prompt block from Redis; lazy-warm on a cold miss. O(1) on a hit. */
export async function getProfileBlock(userId: string): Promise<string> {
  const k = key(userId);
  let raw = await redis.hgetall(k);

  if (!raw || Object.keys(raw).length === 0) {
    await warmFactsCache(userId);
    raw = await redis.hgetall(k);
  }

  const facts = Object.entries(raw)
    .filter(([field]) => field !== EMPTY)
    .map(([, v]) => JSON.parse(v) as UserFact)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return render(facts);
}

/** Write-through add — atomic single-field HSET, no read-modify-write. */
export async function cacheAddFact(
  userId: string,
  fact: UserFact,
): Promise<void> {
  const k = key(userId);
  await redis.hset(k, handle(fact.id), JSON.stringify(fact));
  await redis.hdel(k, EMPTY);
}

/** Write-through remove — atomic HDEL by handle. */
export async function cacheRemoveFact(
  userId: string,
  shortId: string,
): Promise<void> {
  await redis.hdel(key(userId), shortId.slice(0, 8));
}

const HEADINGS: Record<FactCategory, string> = {
  identity: "Identity",
  relationship: "People",
  preference: "Preferences",
  work: "Work context",
  other: "Other",
};

function render(facts: UserFact[]): string {
  if (facts.length === 0) return "";

  const byCat = new Map<FactCategory, UserFact[]>();
  for (const f of facts) {
    const list = byCat.get(f.category) ?? byCat.set(f.category, []).get(f.category)!;
    list.push(f);
  }

  const lines = [
    "Saved facts about the user (use them; if the user corrects one, call forget_fact with its [id]):",
  ];
  for (const cat of Object.keys(HEADINGS) as FactCategory[]) {
    const items = byCat.get(cat);
    if (!items?.length) continue;
    lines.push(`${HEADINGS[cat]}:`);
    for (const f of items) lines.push(`- [${handle(f.id)}] ${f.content}`);
  }

  return lines.join("\n");
}
