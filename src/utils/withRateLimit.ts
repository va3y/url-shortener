import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { Middleware } from "solid-start/entry-server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(20, "10 s"),
});

export const withRateLimit: Middleware =
  ({ forward }) =>
  async (event) => {
    const ip = event.request.headers.get("x-forwarded-for") ?? "127.0.0.1";

    const { success, pending, limit, reset, remaining } = await ratelimit.limit(
      `mw_${ip}`
    );
    await pending;

    if (!success) {
      return new Response(
        `Rate limit exceeded, retry in ${(reset - Date.now()) / 1000} seconds`,
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }
    return forward(event);
  };
