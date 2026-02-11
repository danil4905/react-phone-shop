import { Router } from "express";
import type { Brand } from "@repo/shared";
import { readJsonFile } from "../db/files";

const router = Router();

router.get("/", async (_req, res) => {
  const brands = await readJsonFile<Brand[]>("brands.json", []);
  return res.json(brands);
});

export default router;
