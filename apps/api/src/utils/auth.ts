import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "@repo/shared";

const DEFAULT_JWT_SECRET = "dev_secret_change_me";

export function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    console.warn("JWT_SECRET is not set. Using an insecure default for development.");
  }
  return process.env.JWT_SECRET ?? DEFAULT_JWT_SECRET;
}

export function signToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
}
