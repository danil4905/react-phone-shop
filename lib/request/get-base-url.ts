import { headers } from "next/headers";

export async function getBaseUrl(): Promise<string> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error("Host header is missing");
  }

  return `${protocol}://${host}`;
}
