import { nanoid, urlAlphabet } from "nanoid";
import { z } from "zod";

import { procedure, router } from "../utils";

const UNIQUE_CHARS_TOLERANCE = 0.001;

function logN(base: number, x: number) {
  return Math.log(x) / Math.log(base);
}

type HandlerResult = Promise<
  { status: "ok"; createdSlug: string } | { status: "invalidUrl" }
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

      const createNewUrlResponse = await upsertRow().catch((err) => {
        // P2002 is a Prisma error code for "Unique constraint failed"
        // This probably means that the generated id already existed in db
        // https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
        if (err.code === "P2002")
          return { error: "idClash", shortenedSlug: null };
        throw err;
      });

      // id Clash, worth a second try
      if ("error" in createNewUrlResponse)
        return {
          status: "ok",
          createdSlug: (await upsertRow()).shortenedSlug,
        };

      return {
        status: "ok",
        createdSlug: createNewUrlResponse.shortenedSlug,
      };
    }),
});
