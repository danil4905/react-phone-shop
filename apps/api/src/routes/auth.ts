import { Router } from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { User } from "@repo/shared";
import { AuthCredentialsSchema, ChangePasswordSchema, RegisterSchema } from "@repo/shared";
import { getUsers, saveUsers } from "../db/store";
import { authRequired } from "../middleware/auth";
import { clearCsrfToken, issueCsrfToken } from "../middleware/csrf";
import { validate } from "../middleware/validate";
import { signToken } from "../utils/auth";
import { toPublicUser } from "../utils/user";

const router = Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

router.post(
  "/register",
  validate(RegisterSchema.strict(), (req) => req.body),
  async (req, res) => {
    const { email, password, name, lastName } = req.validated as z.infer<typeof RegisterSchema>;
    const users = await getUsers();
    const normalizedEmail = email.toLowerCase();

    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = {
      id: randomUUID(),
      email: normalizedEmail,
      name,
      lastName,
      passwordHash,
    };

    users.push(user);
    await saveUsers(users);

    const token = signToken({ sub: user.id, email: user.email });
    res.cookie("token", token, cookieOptions);
    const csrfToken = issueCsrfToken(res);

    return res.status(201).json({ user: toPublicUser(user), token, csrfToken });
  }
);

router.post(
  "/login",
  validate(AuthCredentialsSchema.strict(), (req) => req.body),
  async (req, res) => {
    const { email, password } = req.validated as z.infer<typeof AuthCredentialsSchema>;
    const users = await getUsers();
    const normalizedEmail = email.toLowerCase();
    const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({ sub: user.id, email: user.email });
    res.cookie("token", token, cookieOptions);
    const csrfToken = issueCsrfToken(res);

    return res.json({ user: toPublicUser(user), token, csrfToken });
  }
);

router.get("/csrf", (_req, res) => {
  const csrfToken = issueCsrfToken(res);
  return res.json({ csrfToken });
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  clearCsrfToken(res);
  return res.status(204).send();
});

router.patch(
  "/password",
  authRequired,
  validate(ChangePasswordSchema.strict(), (req) => req.body),
  async (req, res) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.validated as z.infer<typeof ChangePasswordSchema>;
    const users = await getUsers();
    const userIndex = users.findIndex((item) => item.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[userIndex];
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updated = { ...user, passwordHash };
    users[userIndex] = updated;
    await saveUsers(users);

    return res.status(204).send();
  }
);

router.get("/me", authRequired, async (req, res) => {
  const users = await getUsers();
  const user = users.find((item) => item.id === req.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user: toPublicUser(user) });
});

export default router;
