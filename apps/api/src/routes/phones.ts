import { Router } from "express";
import { z } from "zod";
import { getPhones } from "../db/store";
import { validate } from "../middleware/validate";
import { parseNumberList, parseStringList } from "../utils/query";

const router = Router();

const querySchema = z
  .object({
    q: z.string().optional(),
    brand: z.union([z.string(), z.array(z.string())]).optional(),
    category: z.union([z.string(), z.array(z.string())]).optional(),
    priceMin: z.coerce.number().optional(),
    priceMax: z.coerce.number().optional(),
    ram: z.union([z.string(), z.array(z.string())]).optional(),
    storage: z.union([z.string(), z.array(z.string())]).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
    sort: z.enum(["price-asc", "price-desc", "rating-desc", "newest"]).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (typeof data.priceMin === "number" && typeof data.priceMax === "number") {
      if (data.priceMin > data.priceMax) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "priceMin must be <= priceMax",
        });
      }
    }
  });

const paramsSchema = z.object({ id: z.string().min(1) }).strict();

router.get("/", validate(querySchema, (req) => req.query), async (req, res) => {
  const { q, brand, category, priceMin, priceMax, ram, storage, page, limit, sort } =
    req.validated as z.infer<typeof querySchema>;

  const brands = parseStringList(brand);
  const categories = parseStringList(category);
  const rams = parseNumberList(ram);
  const storages = parseNumberList(storage);

  let phones = await getPhones();

  if (q) {
    const term = q.toLowerCase();
    phones = phones.filter((phone) => phone.name.toLowerCase().includes(term));
  }

  if (brands.length) {
    const brandSet = new Set(brands);
    phones = phones.filter((phone) => brandSet.has(phone.brandId));
  }

  if (categories.length) {
    const categorySet = new Set(categories);
    phones = phones.filter((phone) => categorySet.has(phone.categoryId));
  }

  if (typeof priceMin === "number") {
    phones = phones.filter((phone) => phone.price >= priceMin);
  }

  if (typeof priceMax === "number") {
    phones = phones.filter((phone) => phone.price <= priceMax);
  }

  if (rams.length) {
    const ramSet = new Set(rams);
    phones = phones.filter((phone) => ramSet.has(phone.specs.ram));
  }

  if (storages.length) {
    const storageSet = new Set(storages);
    phones = phones.filter((phone) => storageSet.has(phone.specs.storage));
  }

  if (sort === "price-asc") {
    phones = [...phones].sort((a, b) => a.price - b.price);
  }

  if (sort === "price-desc") {
    phones = [...phones].sort((a, b) => b.price - a.price);
  }

  if (sort === "rating-desc") {
    phones = [...phones].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }

  if (sort === "newest") {
    phones = [...phones].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const total = phones.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const items = phones.slice(start, start + limit);

  return res.json({
    items,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

router.get("/:id", validate(paramsSchema, (req) => req.params), async (req, res) => {
  const { id } = req.validated as z.infer<typeof paramsSchema>;
  const phones = await getPhones();
  const phone = phones.find((item) => item.id === id);

  if (!phone) {
    return res.status(404).json({ message: "Phone not found" });
  }

  return res.json(phone);
});

export default router;
