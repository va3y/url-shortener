import { createSignal, type VoidComponent } from "solid-js";
import { trpc } from "../utils/trpc";

const linkPrefix = (() => {
  if (typeof window === "undefined") return "";

  return window.location.href + "api/r/";
})();

const Home: VoidComponent = () => {
  const [url, setUrl] = createSignal<string>();
  const [prompt, setPrompt] = createSignal<string>();
  const createLinkMutation = trpc.example.setLink.useMutation();

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    const currentUrl = url();
    if (!currentUrl) {
      return;
    }
    const res = await createLinkMutation.mutateAsync({ link: currentUrl });
    if (res.status === "invalidUrl")
      setPrompt(`${currentUrl} is an invalid URL`);
    if (res.status === "alreadyCreated")
      setPrompt(`This url already existed with: ${res.createdSlug}`);
    if (res.status === "ok")
      setPrompt(`${linkPrefix + res.createdSlug} created`);
  };
  return (
    <main class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026d56] to-[#152a2c]">
      <div class="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 class="text-5xl font-bold tracking-tight text-white">
          Url shortener
        </h1>
        {prompt() && <p>{prompt()}</p>}
        <form action="POST" onSubmit={onSubmit} class="flex flex-col gap-12">
          <label class="flex flex-col gap-2">
            Url
            <input
              onInput={(e) => setUrl(e.currentTarget.value)}
              type="text"
              placeholder="url"
            />
          </label>
          <button
            type="submit"
            class={`h-8 rounded bg-white ${
              createLinkMutation.isLoading && "bg-gray-400"
            }`}
            disabled={createLinkMutation.isLoading}
          >
            Create
          </button>
        </form>
      </div>
    </main>
  );
};

export default Home;
