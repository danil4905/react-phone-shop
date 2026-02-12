import { Router } from "express";
import type { Filters } from "@repo/shared";
import { getBrands, getCategories, getPhones } from "../db/store";

const router = Router();

router.get("/", async (_req, res) => {
  const phones = await getPhones();
  const brands = await getBrands();
  const categories = await getCategories();

  const prices = phones.map((phone) => phone.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const ram = Array.from(new Set(phones.map((phone) => phone.specs.ram))).sort((a, b) => a - b);
  const storage = Array.from(new Set(phones.map((phone) => phone.specs.storage))).sort((a, b) => a - b);

  const filters: Filters = {
    price: {
      min: minPrice,
      max: maxPrice,
    },
    ram,
    storage,
    brands,
    categories,
  };

  return res.json(filters);
});

export default router;
