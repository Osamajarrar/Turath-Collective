import { PostHog } from "posthog-node";

let client: PostHog | null = null;

export function getPostHog(): PostHog | null {
  if (client) return client;
  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) return null;
  client = new PostHog(apiKey, {
    host: process.env.POSTHOG_HOST ?? "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
  return client;
}

export async function shutdownPostHog(): Promise<void> {
  if (client) await client.shutdown();
}
