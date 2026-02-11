import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { writeJsonFile } from "../src/db/files";
import type { Brand, Category, Phone, User } from "@repo/shared";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const brandNames = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Google",
  "OnePlus",
  "Huawei",
  "Honor",
  "Realme",
  "Motorola",
  "Sony",
  "Nokia",
  "Asus",
  "Nothing",
  "Infinix",
  "Tecno",
];

const categoryNames = [
  "Flagship",
  "Midrange",
  "Budget",
  "Gaming",
  "Compact",
  "Foldable",
];

const modelNames = [
  "Alpha",
  "Nova",
  "Ultra",
  "Pro",
  "Max",
  "Edge",
  "Prime",
  "Air",
  "Lite",
  "Neo",
  "Pulse",
  "Zen",
  "Apex",
  "Spark",
  "Core",
];

const displaySizes = ["6.1\" OLED", "6.5\" AMOLED", "6.7\" OLED", "6.9\" AMOLED"];
const rams = [4, 6, 8, 12, 16];
const storages = [64, 128, 256, 512, 1024];
const batteries = [3500, 4000, 4500, 5000, 5500, 6000];
const osList = ["Android", "iOS", "Android (custom UI)"];

const randomItem = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDate = () => {
  const now = Date.now();
  const twoYears = 1000 * 60 * 60 * 24 * 365 * 2;
  const timestamp = now - Math.floor(Math.random() * twoYears);
  return new Date(timestamp).toISOString();
};

async function seed() {
  const brands: Brand[] = brandNames.map((name, index) => ({
    id: `brand-${index + 1}`,
    name,
    slug: slugify(name),
  }));

  const categories: Category[] = categoryNames.map((name, index) => ({
    id: `category-${index + 1}`,
    name,
    slug: slugify(name),
  }));

  const phones: Phone[] = Array.from({ length: 500 }, (_, index) => {
    const brand = randomItem(brands);
    const category = randomItem(categories);
    const model = randomItem(modelNames);
    const series = randomInt(1, 20);
    const name = `${brand.name} ${model} ${series}`;

    const priceBase = category.slug === "flagship" ? 900 : category.slug === "midrange" ? 500 : 250;
    const price = priceBase + randomInt(-100, 200);

    return {
      id: `phone-${index + 1}`,
      brandId: brand.id,
      categoryId: category.id,
      name,
      slug: slugify(name),
      description: `${name} with ${randomItem(storages)}GB storage and ${randomItem(rams)}GB RAM.`,
      price: Math.max(price, 150),
      imageUrl: "/images/phone-placeholder.svg",
      rating: Number((Math.random() * 2 + 3).toFixed(1)),
      stock: randomInt(0, 50),
      specs: {
        ram: randomItem(rams),
        storage: randomItem(storages),
        display: randomItem(displaySizes),
        battery: randomItem(batteries),
        camera: `${randomInt(12, 108)}MP`,
        os: randomItem(osList),
      },
      tags: [category.slug],
      createdAt: randomDate(),
    };
  });

  const passwordHash = await bcrypt.hash("demo1234", 10);
  const users: User[] = [
    {
      id: randomUUID(),
      email: "demo@example.com",
      name: "Demo User",
      passwordHash,
    },
  ];

  await writeJsonFile("brands.json", brands);
  await writeJsonFile("categories.json", categories);
  await writeJsonFile("phones.json", phones);
  await writeJsonFile("users.json", users);
  await writeJsonFile("orders.json", []);

  console.log("Seed complete");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
