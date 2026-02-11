import { Router } from "express";
import type { Category } from "@repo/shared";
import { readJsonFile } from "../db/files";

const router = Router();

router.get("/", async (_req, res) => {
  const categories = await readJsonFile<Category[]>("categories.json", []);
  return res.json(categories);
});

export default router;
