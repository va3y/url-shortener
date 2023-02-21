import type { Urls } from "@prisma/client";
import { nanoid, urlAlphabet } from "nanoid";
import { isUrl } from "~/utils/isUrl";

import { procedure, router } from "../utils";

const UNIQUE_CHARS_TOLERANCE = 0.001;

function calculateLogarithmWithCustomBase(base: number, x: number) {
  return Math.log(x) / Math.log(base);
}

type HandlerResult = Promise<
  | { status: "alreadyCreated" | "ok"; createdSlug: string }
  | { status: "invalidUrl" }
>;

export default router({
  getLinks: procedure.query(({ ctx }) => ctx.prisma.urls.findMany()),
  setLink: procedure
    .input((input) => input as Pick<Urls, "link">)
    .mutation(async ({ ctx, input }): HandlerResult => {
      if (!isUrl(input.link)) return { status: "invalidUrl" };

      const res = await ctx.prisma.urls.findUnique({
        where: { link: input.link },
        select: { shortenedSlug: true },
      });
      if (res?.shortenedSlug)
        return { status: "alreadyCreated", createdSlug: res.shortenedSlug };

      const totalRows = await ctx.prisma.urls.count({});

      const createRowCall = () =>
        ctx.prisma.urls.create({
          data: {
            link: input.link,
            shortenedSlug: nanoid(
              // Should probably be stored somewhere else as const
              Math.ceil(
                calculateLogarithmWithCustomBase(
                  urlAlphabet.length,
                  totalRows / UNIQUE_CHARS_TOLERANCE
                )
              )
            ),
          },
          select: { shortenedSlug: true },
        });

      const createNewUrlResponse = await createRowCall().catch((err) => {
        // P2002 is a Prisma code for "Unique constraint failed"
        // This probably means that the generated id already existed in db
        // https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
        if (err.code === "P2002")
          return { error: "idClash", shortenedSlug: null };
        throw err;
      });

      if (!("error" in createNewUrlResponse))
        return {
          status: "ok",
          createdSlug: createNewUrlResponse.shortenedSlug,
        };

      // id Clash, worth a second try
      return {
        status: "ok",
        createdSlug: (await createRowCall()).shortenedSlug,
      };
    }),
});
