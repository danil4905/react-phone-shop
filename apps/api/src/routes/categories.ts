import { Router } from "express";
import { getCategories } from "../db/store";

const router = Router();

router.get("/", async (_req, res) => {
  const categories = await getCategories();
  return res.json(categories);
});

export default router;
