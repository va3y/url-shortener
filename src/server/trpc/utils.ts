import { initTRPC, TRPCError } from "@trpc/server";
import type { IContext } from "./context";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const t = initTRPC.context<IContext>().create();

export const router = t.router;
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(20, "10 s"),
});

export const withRateLimit = t.middleware(async ({ ctx, next }) => {
  const ip = ctx.req.headers.get("x-forwarded-for") ?? "127.0.0.1";

  const { success, pending, limit, reset, remaining } = await ratelimit.limit(
    `mw_${ip}`
  );
  await pending;
  ctx.res.headers["X-RateLimit-Limit"] = limit.toString();
  ctx.res.headers["X-RateLimit-Remaining"] = remaining.toString();
  ctx.res.headers["X-RateLimit-Reset"] = reset.toString();
  if (!success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded, retry in ${
        (reset - Date.now()) / 1000
      } seconds`,
    });
  }
  return next({ ctx });
});

// export const procedure = t.procedure.use(withRateLimit);
