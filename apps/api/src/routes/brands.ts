import { Router } from "express";
import { getBrands } from "../db/store";

const router = Router();

router.get("/", async (_req, res) => {
  const brands = await getBrands();
  return res.json(brands);
});

export default router;
