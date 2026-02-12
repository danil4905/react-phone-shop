import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function getBackendOrigin() {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("API_URL is not set. Define it in .env.local");
  }

  return apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const imagePath = path.join("/");
  const origin = getBackendOrigin();

  const url = new URL(`${origin}/images/${imagePath}`);
  url.search = request.nextUrl.search;

  const response = await fetch(url, {
    method: "GET",
    headers: request.headers,
    redirect: "manual",
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
