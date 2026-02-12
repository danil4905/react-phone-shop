import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type Brand,
  type Category,
  type Phone,
} from "@repo/shared";
import { saveBrands, saveCategories, savePhones } from "../src/db/store";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "data", "mobiles-2025.csv");

const categories: Category[] = [
  { id: "category-flagship", name: "Flagship", slug: "flagship" },
  { id: "category-midrange", name: "Midrange", slug: "midrange" },
  { id: "category-budget", name: "Budget", slug: "budget" },
  { id: "category-gaming", name: "Gaming", slug: "gaming" },
  { id: "category-compact", name: "Compact", slug: "compact" },
  { id: "category-foldable", name: "Foldable", slug: "foldable" },
];

const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result.map((value) => value.trim());
}

function parseCsv(content: string): string[][] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map(parseCsvLine);
}

function getNumber(value: string) {
  const digits = value.replace(/[^0-9.]/g, "");
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : null;
}

function getInt(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : null;
}

function deriveStorage(model: string) {
  const matches = [...model.matchAll(/(\d+)\s?GB/gi)].map((m) => Number(m[1]));
  if (!matches.length) return 128;
  return Math.max(...matches);
}

function deriveCategory({
  model,
  screenSize,
  priceUsd,
  ram,
  processor,
}: {
  model: string;
  screenSize: number | null;
  priceUsd: number | null;
  ram: number | null;
  processor: string;
}) {
  const lowerModel = model.toLowerCase();
  const lowerProcessor = processor.toLowerCase();

  if (lowerModel.includes("fold") || lowerModel.includes("flip")) {
    return "foldable";
  }

  if (typeof screenSize === "number" && screenSize <= 6.1) {
    return "compact";
  }

  const gamingChip = lowerProcessor.includes("snapdragon 8") || lowerProcessor.includes("dimensity 9");
  if (gamingChip && (ram ?? 0) >= 12) {
    return "gaming";
  }

  if (typeof priceUsd === "number") {
    if (priceUsd >= 800) return "flagship";
    if (priceUsd >= 350) return "midrange";
    return "budget";
  }

  return "midrange";
}

async function run() {
  const content = await readFile(dataPath, "utf8");
  const rows = parseCsv(content);

  if (rows.length < 2) {
    throw new Error("CSV seems empty or invalid");
  }

  const header = rows[0];
  const body = rows.slice(1);
  const getIndex = (name: string) => header.findIndex((value) => value.toLowerCase() === name.toLowerCase());

  const idxCompany = getIndex("Company Name");
  const idxModel = getIndex("Model Name");
  const idxRam = getIndex("RAM");
  const idxFront = getIndex("Front Camera");
  const idxBack = getIndex("Back Camera");
  const idxProcessor = getIndex("Processor");
  const idxBattery = getIndex("Battery Capacity");
  const idxScreen = getIndex("Screen Size");
  const idxPriceUSA = getIndex("Launched Price (USA)");
  const idxYear = getIndex("Launched Year");

  if ([idxCompany, idxModel, idxRam, idxProcessor, idxBattery, idxScreen, idxPriceUSA].some((idx) => idx === -1)) {
    throw new Error("CSV columns do not match expected headers");
  }

  const phones: Phone[] = [];
  const brandMap = new Map<string, Brand>();

  for (const row of body) {
    const company = row[idxCompany] ?? "";
    const model = row[idxModel] ?? "";

    if (!company || !model) continue;

    const lowerModel = model.toLowerCase();
    if (lowerModel.includes("ipad") || lowerModel.includes("pad")) {
      continue;
    }

    const brandSlug = slugify(company);
    if (!brandMap.has(brandSlug)) {
      brandMap.set(brandSlug, {
        id: `brand-${brandSlug}`,
        name: company,
        slug: brandSlug,
      });
    }

    const ram = getInt(row[idxRam] ?? "") ?? 6;
    const storage = deriveStorage(model);
    const battery = getInt(row[idxBattery] ?? "") ?? 4000;
    const screenSize = getNumber(row[idxScreen] ?? "");
    const priceUsd = getNumber(row[idxPriceUSA] ?? "");
    const processor = row[idxProcessor] ?? "";

    const categorySlug = deriveCategory({
      model,
      screenSize,
      priceUsd,
      ram,
      processor,
    });

    const category = categoryBySlug.get(categorySlug) ?? categoryBySlug.get("midrange")!;

    const createdAt = new Date(`${row[idxYear] ?? "2023"}-06-01`).toISOString();

    phones.push({
      id: `phone-${phones.length + 1}`,
      brandId: `brand-${brandSlug}`,
      categoryId: category.id,
      name: `${company} ${model}`,
      slug: slugify(`${company}-${model}`),
      description: `${company} ${model} with ${storage}GB storage and ${ram}GB RAM.`,
      price: priceUsd ?? 499,
      imageUrl: "/images/phone-placeholder.svg",
      rating: Number((Math.random() * 2 + 3).toFixed(1)),
      stock: Math.floor(Math.random() * 40),
      specs: {
        ram,
        storage,
        display: screenSize ? `${screenSize} inches` : "6.5 inches",
        battery,
        camera: `${row[idxFront] ?? ""} / ${row[idxBack] ?? ""}`.trim(),
        os: company.toLowerCase().includes("apple") ? "iOS" : "Android",
      },
      tags: [category.slug],
      createdAt,
    });

    if (phones.length >= 300) {
      break;
    }
  }

  if (phones.length < 300) {
    console.warn(`Only ${phones.length} phones generated. Check CSV format or filters.`);
  }

  const brands = Array.from(brandMap.values());

  await saveBrands(brands);
  await saveCategories(categories);
  await savePhones(phones);

  console.log(`Imported ${phones.length} phones, ${brands.length} brands.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
