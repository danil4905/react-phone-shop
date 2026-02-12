import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

const CSRF_COOKIE = "csrfToken";

const cookieOptions = {
  httpOnly: false,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

export function issueCsrfToken(res: Response) {
  const token = randomUUID();
  res.cookie(CSRF_COOKIE, token, cookieOptions);
  return token;
}

export function clearCsrfToken(res: Response) {
  res.clearCookie(CSRF_COOKIE);
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return next();
  }

  const hasAuthHeader = typeof req.headers.authorization === "string" &&
    req.headers.authorization.startsWith("Bearer ");
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const hasCookieAuth = typeof req.cookies?.token === "string";

  if (hasAuthHeader || !hasCookieAuth) {
    return next();
  }

  const headerToken = req.headers["x-csrf-token"];
  const headerValue = Array.isArray(headerToken) ? headerToken[0] : headerToken;

  if (!cookieToken || !headerValue || cookieToken !== headerValue) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  return next();
}
