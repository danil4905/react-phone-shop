import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { CreateOrderSchema } from "@repo/shared";
import { getOrders, getPhones, saveOrders } from "../db/store";
import { authRequired } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

router.get("/", authRequired, async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const orders = await getOrders();
  const userOrders = orders.filter((order) => order.userId === req.userId);
  return res.json(userOrders);
});

router.post("/", authRequired, validate(CreateOrderSchema.strict(), (req) => req.body), async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { items } = req.validated as z.infer<typeof CreateOrderSchema>;
  const phones = await getPhones();
  const phoneMap = new Map(phones.map((phone) => [phone.id, phone]));

  const lines = items.map((item) => {
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

  if (lines.some((item) => item === null)) {
    return res.status(400).json({ message: "One or more items are invalid" });
  }

  const normalizedItems = lines as NonNullable<(typeof lines)[number]>[];
  const total = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const order: Order = {
    id: randomUUID(),
    userId: req.userId,
    items: normalizedItems,
    total,
    createdAt: new Date().toISOString(),
  };

  const orders = await getOrders();
  orders.push(order);
  await saveOrders(orders);

  return res.status(201).json(order);
});

export default router;
