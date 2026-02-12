import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";
import { z } from "zod";
import { UpdateProfileSchema } from "@repo/shared";
import { authRequired } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { getUsers, saveUsers } from "../db/store";
import { toPublicUser } from "../utils/user";

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const avatarDir = path.join(__dirname, "..", "..", "public", "images", "avatars");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdir(avatarDir, { recursive: true })
      .then(() => cb(null, avatarDir))
      .catch((error) => cb(error, avatarDir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    const safeExt = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext) ? ext : ".png";
    const userId = req.userId ?? "user";
    const fileName = `${userId}-${Date.now()}${safeExt}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed"));
  },
});

router.patch(
  "/me",
  authRequired,
  validate(UpdateProfileSchema, (req) => req.body),
  async (req, res) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const update = req.validated as z.infer<typeof UpdateProfileSchema>;
    const users = await getUsers();
    const userIndex = users.findIndex((item) => item.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    let nextEmail = users[userIndex].email;
    if (update.email) {
      const normalizedEmail = update.email.toLowerCase();
      const conflict = users.some(
        (user) => user.id !== req.userId && user.email.toLowerCase() === normalizedEmail
      );
      if (conflict) {
        return res.status(409).json({ message: "Email already in use" });
      }
      nextEmail = normalizedEmail;
    }

    const updated = {
      ...users[userIndex],
      ...update,
      email: nextEmail,
    };

    users[userIndex] = updated;
    await saveUsers(users);

    return res.json({ user: toPublicUser(updated) });
  }
);

router.post(
  "/me/avatar",
  authRequired,
  upload.single("avatar"),
  async (req, res) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    const users = await getUsers();
    const userIndex = users.findIndex((item) => item.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    const previousAvatar = users[userIndex].avatarUrl;
    const avatarUrl = `/images/avatars/${req.file.filename}`;
    const updated = { ...users[userIndex], avatarUrl };
    users[userIndex] = updated;
    await saveUsers(users);

    if (previousAvatar && previousAvatar.startsWith("/images/avatars/")) {
      const previousFile = path.basename(previousAvatar);
      const previousPath = path.join(avatarDir, previousFile);
      fs.unlink(previousPath).catch(() => undefined);
    }

    return res.json({ user: toPublicUser(updated) });
  }
);

export default router;
