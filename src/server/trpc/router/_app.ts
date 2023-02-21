import { router } from "../utils";
import example from "./links";

export const appRouter = router({
  example,
});

export type IAppRouter = typeof appRouter;
