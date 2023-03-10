import type { Urls } from "@prisma/client";
import { nanoid, urlAlphabet } from "nanoid";
import { z } from "zod";

import { procedure, router } from "../utils";

const UNIQUE_CHARS_TOLERANCE = 0.001;

function logN(base: number, x: number) {
  return Math.log(x) / Math.log(base);
}

// P2002 is a Prisma error code for "Unique constraint failed"
// This probably means that the generated id already existed in db
// https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
const isPrismaUniqueConstraintError = (err: unknown) =>
  typeof err === "object" && err && "code" in err && err.code === "P2002";

type HandlerResult = Promise<
  | { status: "ok"; createdSlug: Urls["shortenedSlug"] }
  | { status: "invalidUrl" }
>;

export default router({
  getLinks: procedure.query(({ ctx }) => ctx.prisma.urls.findMany()),
  setLink: procedure
    .input(z.object({ link: z.string() }))
    .mutation(async ({ ctx, input }): HandlerResult => {
      if (!z.string().url().safeParse(input.link).success)
        return { status: "invalidUrl" };

      const totalRows = await ctx.prisma.urls.count();

      const upsertRow = () =>
        ctx.prisma.urls.upsert({
          where: { link: input.link },
          create: {
            link: input.link,
            shortenedSlug: nanoid(
              // Should probably be stored somewhere else as const,
              // so count() transaction wont be needed
              Math.ceil(
                logN(urlAlphabet.length, totalRows / UNIQUE_CHARS_TOLERANCE)
              )
            ),
          },
          update: {},
        });

      const createNewUrlResponse = await upsertRow().catch((err: unknown) => {
        if (isPrismaUniqueConstraintError(err))
          return { error: "idClash", shortenedSlug: null };
        throw err;
      });

      return {
        status: "ok",
        createdSlug:
          "error" in createNewUrlResponse
            ? // id Clash, worth a second try
              (await upsertRow()).shortenedSlug
            : createNewUrlResponse.shortenedSlug,
      };
    }),
});
