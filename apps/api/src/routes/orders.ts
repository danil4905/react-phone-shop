import { Router } from "express";
import { randomUUID } from "node:crypto";
import type { Order, Phone } from "@repo/shared";
import { CreateOrderSchema } from "@repo/shared";
import { readJsonFile, writeJsonFile } from "../db/files";
import { authRequired } from "../middleware/auth";

const router = Router();

router.get("/", authRequired, async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const orders = await readJsonFile<Order[]>("orders.json", []);
  const userOrders = orders.filter((order) => order.userId === req.userId);
  return res.json(userOrders);
});

router.post("/", authRequired, async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const phones = await readJsonFile<Phone[]>("phones.json", []);
  const phoneMap = new Map(phones.map((phone) => [phone.id, phone]));

  const items = parsed.data.items.map((item) => {
    const phone = phoneMap.get(item.phoneId);
    if (!phone) {
      return null;
    }

    const unitPrice = phone.price;
    const lineTotal = unitPrice * item.quantity;
    return {
      phoneId: phone.id,
      name: phone.name,
      imageUrl: phone.imageUrl,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
    };
  });

  if (items.some((item) => item === null)) {
    return res.status(400).json({ message: "One or more items are invalid" });
  }

  const normalizedItems = items as NonNullable<(typeof items)[number]>[];
  const total = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const order: Order = {
    id: randomUUID(),
    userId: req.userId,
    items: normalizedItems,
    total,
    createdAt: new Date().toISOString(),
  };

  const orders = await readJsonFile<Order[]>("orders.json", []);
  orders.push(order);
  await writeJsonFile("orders.json", orders);

  return res.status(201).json(order);
});

export default router;
