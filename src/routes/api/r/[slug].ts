import { redirect } from "solid-start";
import type { ApiHandler } from "solid-start/api/types";
import { prisma } from "~/server/db/client";

export const GET: ApiHandler = async ({ params }) => {
  const res = await prisma.urls.findUnique({
    where: { shortenedSlug: params.slug },
    select: { link: true },
  });
  if (!res?.link) return new Response("Not found", { status: 404 });
  return redirect(res.link);
};
