import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/auth";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
    userEmail?: string;
  }
}

function extractToken(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  if (req.cookies && typeof req.cookies.token === "string") {
    return req.cookies.token;
  }

  return null;
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
