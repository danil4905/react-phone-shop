import { Router } from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import type { User, UserPublic } from "@repo/shared";
import { AuthCredentialsSchema, RegisterSchema } from "@repo/shared";
import { readJsonFile, writeJsonFile } from "../db/files";
import { authRequired } from "../middleware/auth";
import { signToken } from "../utils/auth";

const router = Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

const toPublicUser = (user: User): UserPublic => ({
  id: user.id,
  email: user.email,
  name: user.name,
});

router.post("/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const { email, password, name } = parsed.data;
  const users = await readJsonFile<User[]>("users.json", []);
  const normalizedEmail = email.toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ message: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = {
    id: randomUUID(),
    email: normalizedEmail,
    name,
    passwordHash,
  };

  users.push(user);
  await writeJsonFile("users.json", users);

  const token = signToken({ sub: user.id, email: user.email });
  res.cookie("token", token, cookieOptions);

  return res.status(201).json({ user: toPublicUser(user), token });
});

router.post("/login", async (req, res) => {
  const parsed = AuthCredentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const { email, password } = parsed.data;
  const users = await readJsonFile<User[]>("users.json", []);
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

  return res.json({ user: toPublicUser(user), token });
});

router.get("/me", authRequired, async (req, res) => {
  const users = await readJsonFile<User[]>("users.json", []);
  const user = users.find((item) => item.id === req.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user: toPublicUser(user) });
});

export default router;
