import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

declare module "express-serve-static-core" {
  interface Request {
    validated?: unknown;
  }
}

export function validate<T extends ZodTypeAny>(schema: T, getter: (req: Request) => unknown) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(getter(req));
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        issues: result.error.issues,
      });
    }
    req.validated = result.data;
    return next();
  };
}
