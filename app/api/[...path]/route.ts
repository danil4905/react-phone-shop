import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getApiUrl() {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("API_URL is not set. Define it in .env.local");
  }
  return apiUrl.replace(/\/$/, "");
}

async function proxy(request: NextRequest, params: { path: string[] }) {
  const apiUrl = getApiUrl();
  const path = params.path.join("/");

  const url = new URL(`${apiUrl}/${path}`);
  url.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");

  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  const response = await fetch(url, {
    method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: "manual",
    // @ts-expect-error duplex is required when passing a stream body in Node.js
    duplex: "half",
  });

  const responseHeaders = new Headers(response.headers);
  const setCookie = (response.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.();
  if (setCookie) {
    responseHeaders.delete("set-cookie");
    setCookie.forEach((cookie) => responseHeaders.append("set-cookie", cookie));
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context.params);
}

export async function POST(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context.params);
}

export async function PUT(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context.params);
}

export async function PATCH(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context.params);
}

export async function DELETE(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context.params);
}

export async function OPTIONS(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context.params);
}
