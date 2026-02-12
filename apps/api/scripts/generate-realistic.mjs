import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const publicDir = path.join(__dirname, "..", "public", "images");
const phonesDir = path.join(publicDir, "phones");
const brandsDir = path.join(publicDir, "brands");

const categories = [
  { id: "category-flagship", name: "Flagship", slug: "flagship" },
  { id: "category-midrange", name: "Midrange", slug: "midrange" },
  { id: "category-budget", name: "Budget", slug: "budget" },
  { id: "category-gaming", name: "Gaming", slug: "gaming" },
  { id: "category-compact", name: "Compact", slug: "compact" },
  { id: "category-foldable", name: "Foldable", slug: "foldable" },
];

const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

function makeRng(seed = 42) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 10000) / 10000;
  };
}

const rand = makeRng(20250301);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const pickInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pickFloat = (min, max, step = 0.1) => {
  const scaled = Math.round((min + rand() * (max - min)) / step) * step;
  return Number(scaled.toFixed(1));
};

const brandConfigs = [
  {
    name: "Apple",
    models: ["iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15", "iPhone 16"],
    variants: ["", "Plus", "Pro", "Pro Max"],
    extras: ["iPhone SE (2022)", "iPhone SE (2024)", "iPhone 13 mini"],
  },
  {
    name: "Samsung",
    models: ["Galaxy S20", "Galaxy S21", "Galaxy S22", "Galaxy S23", "Galaxy S24"],
    variants: ["", "FE", "Ultra"],
    extras: [
      "Galaxy Z Fold 3",
      "Galaxy Z Fold 4",
      "Galaxy Z Fold 5",
      "Galaxy Z Fold 6",
      "Galaxy Z Flip 3",
      "Galaxy Z Flip 4",
      "Galaxy Z Flip 5",
      "Galaxy Z Flip 6",
      "Galaxy A14",
      "Galaxy A24",
      "Galaxy A34",
      "Galaxy A54",
      "Galaxy A74",
      "Galaxy M14",
      "Galaxy M34",
      "Galaxy M54",
    ],
  },
  {
    name: "Oppo",
    models: ["Oppo Find X3", "Oppo Find X5", "Oppo Find X6", "Oppo Find X7"],
    variants: ["", "Pro", "Ultra"],
    extras: ["Oppo Reno 8", "Oppo Reno 9", "Oppo Reno 10", "Oppo Reno 11", "Oppo A78", "Oppo A98"],
  },
  {
    name: "Vivo",
    models: ["Vivo X60", "Vivo X70", "Vivo X80", "Vivo X90", "Vivo X100"],
    variants: ["", "Pro", "Pro+"],
    extras: ["Vivo V23", "Vivo V25", "Vivo V27", "Vivo V29", "Vivo Y36", "Vivo Y78"],
  },
  {
    name: "iQOO",
    models: ["iQOO 9", "iQOO 10", "iQOO 11", "iQOO 12"],
    variants: ["", "Pro"],
    extras: ["iQOO Neo 7", "iQOO Neo 8", "iQOO Neo 9", "iQOO Z7", "iQOO Z8"],
  },
  {
    name: "Google",
    models: ["Pixel 6", "Pixel 7", "Pixel 8", "Pixel 9"],
    variants: ["", "Pro"],
    extras: ["Pixel 6a", "Pixel 7a", "Pixel 8a", "Pixel Fold"],
  },
  {
    name: "OnePlus",
    models: ["OnePlus 8", "OnePlus 9", "OnePlus 10", "OnePlus 11", "OnePlus 12"],
    variants: ["", "Pro", "R"],
    extras: ["OnePlus Nord 2", "OnePlus Nord 3", "OnePlus Nord CE 3"],
  },
  {
    name: "Xiaomi",
    models: ["Xiaomi 11", "Xiaomi 12", "Xiaomi 13", "Xiaomi 14"],
    variants: ["", "Pro", "Ultra", "T"],
    extras: ["Redmi Note 10", "Redmi Note 11", "Redmi Note 12", "Redmi Note 13", "Poco F3", "Poco F4", "Poco F5", "Poco F6"],
  },
  {
    name: "Poco",
    models: ["Poco F3", "Poco F4", "Poco F5", "Poco F6"],
    variants: ["", "Pro", "GT"],
    extras: ["Poco X4", "Poco X5", "Poco X6", "Poco M4", "Poco M5", "Poco M6"],
  },
  {
    name: "Redmi",
    models: ["Redmi Note 10", "Redmi Note 11", "Redmi Note 12", "Redmi Note 13"],
    variants: ["", "Pro", "Pro+"],
    extras: ["Redmi 12", "Redmi 13", "Redmi A2", "Redmi A3"],
  },
  {
    name: "Huawei",
    models: ["Huawei P40", "Huawei P50", "Huawei P60"],
    variants: ["", "Pro"],
    extras: ["Huawei Mate 40", "Huawei Mate 50", "Huawei Mate 60", "Huawei Nova 10", "Huawei Nova 11", "Huawei Nova 12"],
  },
  {
    name: "Honor",
    models: ["Honor Magic 4", "Honor Magic 5", "Honor Magic 6"],
    variants: ["", "Pro", "Ultimate"],
    extras: ["Honor 70", "Honor 80", "Honor 90", "Honor X8", "Honor X9", "Honor X10"],
  },
  {
    name: "Nubia",
    models: ["Nubia Z50", "Nubia Z60", "Nubia Z70"],
    variants: ["", "Ultra"],
    extras: ["RedMagic 7", "RedMagic 8", "RedMagic 9", "RedMagic 10"],
  },
  {
    name: "ZTE",
    models: ["ZTE Axon 30", "ZTE Axon 40", "ZTE Axon 50"],
    variants: ["", "Ultra"],
    extras: ["ZTE Blade V40", "ZTE Blade V50", "ZTE Blade A71"],
  },
  {
    name: "Realme",
    models: ["Realme 9", "Realme 10", "Realme 11", "Realme 12"],
    variants: ["", "Pro", "Pro+"],
    extras: ["Realme GT 2", "Realme GT 3", "Realme GT 5", "Realme Narzo 50", "Realme Narzo 60", "Realme Narzo 70"],
  },
  {
    name: "Motorola",
    models: ["Moto G Power", "Moto G Play", "Moto G Stylus"],
    variants: ["2022", "2023", "2024"],
    extras: ["Motorola Edge 20", "Motorola Edge 30", "Motorola Edge 40", "Motorola Edge 50", "Motorola RAZR 2022", "Motorola RAZR 2023"],
  },
  {
    name: "Sony",
    models: ["Xperia 1", "Xperia 5", "Xperia 10"],
    variants: ["III", "IV", "V", "VI"],
    extras: [],
  },
  {
    name: "LG",
    models: ["LG Velvet", "LG Wing", "LG V60"],
    variants: [""],
    extras: ["LG G8", "LG G8X"],
  },
  {
    name: "HTC",
    models: ["HTC U20", "HTC U23", "HTC U24"],
    variants: [""],
    extras: ["HTC Desire 21", "HTC Desire 22"],
  },
  {
    name: "Nokia",
    models: ["Nokia G11", "Nokia G21", "Nokia G42", "Nokia X20", "Nokia X30"],
    variants: [""],
    extras: ["Nokia C21", "Nokia C31", "Nokia C32"],
  },
  {
    name: "Asus",
    models: ["ROG Phone 6", "ROG Phone 7", "ROG Phone 8"],
    variants: ["", "Pro"],
    extras: ["Zenfone 8", "Zenfone 9", "Zenfone 10", "Zenfone 11"],
  },
  {
    name: "TCL",
    models: ["TCL 20", "TCL 30", "TCL 40"],
    variants: ["", "Pro"],
    extras: ["TCL 20 SE", "TCL 30 SE", "TCL 40 SE"],
  },
  {
    name: "Alcatel",
    models: ["Alcatel 1", "Alcatel 3", "Alcatel 5"],
    variants: ["(2022)", "(2023)", "(2024)"],
    extras: [],
  },
  {
    name: "Fairphone",
    models: ["Fairphone 4", "Fairphone 5"],
    variants: [""],
    extras: [],
  },
  {
    name: "Nothing",
    models: ["Phone (1)", "Phone (2)", "Phone (2a)"],
    variants: [""],
    extras: [],
  },
  {
    name: "Infinix",
    models: ["Infinix Note 12", "Infinix Note 20", "Infinix Note 30"],
    variants: ["", "Pro"],
    extras: ["Infinix Hot 11", "Infinix Hot 20", "Infinix Hot 30"],
  },
  {
    name: "Tecno",
    models: ["Tecno Spark 8", "Tecno Spark 10", "Tecno Spark 20"],
    variants: ["", "Pro"],
    extras: ["Tecno Camon 18", "Tecno Camon 20", "Tecno Camon 30", "Tecno Pova 4", "Tecno Pova 5", "Tecno Pova 6"],
  },
];

function buildModels() {
  const names = [];
  for (const brand of brandConfigs) {
    for (const base of brand.models) {
      for (const variant of brand.variants) {
        const name = variant ? `${base} ${variant}` : base;
        names.push({ brand: brand.name, model: name });
      }
    }
    for (const extra of brand.extras) {
      names.push({ brand: brand.name, model: extra });
    }
  }

  const storageLabels = ["128GB", "256GB", "512GB", "1TB"];
  const expanded = [];
  for (const item of names) {
    expanded.push(item);
    for (const label of storageLabels) {
      expanded.push({ brand: item.brand, model: `${item.model} ${label}` });
    }
  }

  return expanded;
}

function deriveCategory(model) {
  const lower = model.toLowerCase();
  if (lower.includes("fold") || lower.includes("flip") || lower.includes("razr")) return "foldable";
  if (lower.includes("rog") || lower.includes("redmagic") || lower.includes("pova")) return "gaming";
  if (lower.includes("mini") || lower.includes("se") || lower.includes("zenfone")) return "compact";
  if (lower.includes("ultra") || lower.includes("pro max") || lower.includes("pro") || lower.includes("magic") || lower.includes("mate") || lower.includes("pixel 9") || lower.includes("s24") || lower.includes("s23") || lower.includes("iphone 15") || lower.includes("iphone 16")) return "flagship";
  if (lower.includes("note") || lower.includes("nord") || lower.includes("a54") || lower.includes("a74") || lower.includes("edge") || lower.includes("gt")) return "midrange";
  if (lower.includes("c") || lower.includes("g") || lower.includes("hot") || lower.includes("spark") || lower.includes("play")) return "budget";
  return "midrange";
}

function hashColor(seed) {
  const palette = [
    ["#0F172A", "#38BDF8"],
    ["#111827", "#F97316"],
    ["#0B0F19", "#A855F7"],
    ["#0F172A", "#34D399"],
    ["#111827", "#F43F5E"],
    ["#111827", "#FACC15"],
    ["#111827", "#60A5FA"],
    ["#111827", "#22D3EE"],
  ];
  const index = Math.abs(seed) % palette.length;
  return palette[index];
}

function brandInitials(name) {
  const parts = name.replace(/[()]/g, "").split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function renderBrandSvg(name, slug, index) {
  const [bg, accent] = hashColor(index + slug.length);
  const initials = brandInitials(name);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">\n  <defs>\n    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">\n      <stop offset="0%" stop-color="${bg}" />\n      <stop offset="100%" stop-color="${accent}" />\n    </linearGradient>\n  </defs>\n  <rect width="160" height="160" rx="40" fill="url(#g)" />\n  <circle cx="120" cy="40" r="18" fill="rgba(255,255,255,0.18)" />\n  <text x="80" y="95" text-anchor="middle" font-family="Arial" font-size="44" fill="#F8FAFC" font-weight="700">${initials}</text>\n  <text x="80" y="125" text-anchor="middle" font-family="Arial" font-size="12" fill="rgba(248,250,252,0.7)">${name}</text>\n</svg>`;
}

function renderPhoneSvg(phone, index) {
  const [bg, accent] = hashColor(index + phone.name.length);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="600" height="1000" viewBox="0 0 600 1000" fill="none" xmlns="http://www.w3.org/2000/svg">\n  <defs>\n    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">\n      <stop offset="0%" stop-color="${bg}" />\n      <stop offset="100%" stop-color="${accent}" />\n    </linearGradient>\n  </defs>\n  <rect width="600" height="1000" rx="80" fill="#0B0F19" />\n  <rect x="30" y="30" width="540" height="940" rx="60" fill="url(#bg)" />\n  <rect x="210" y="60" width="180" height="10" rx="5" fill="rgba(255,255,255,0.4)" />\n  <circle cx="500" cy="140" r="36" fill="rgba(0,0,0,0.3)" />\n  <circle cx="500" cy="140" r="22" fill="rgba(255,255,255,0.25)" />\n  <circle cx="500" cy="220" r="30" fill="rgba(0,0,0,0.3)" />\n  <circle cx="500" cy="220" r="18" fill="rgba(255,255,255,0.25)" />\n  <rect x="90" y="720" width="420" height="160" rx="24" fill="rgba(15,23,42,0.55)" />\n  <text x="300" y="780" text-anchor="middle" font-family="Arial" font-size="28" fill="#F8FAFC" font-weight="600">${phone.name}</text>\n  <text x="300" y="820" text-anchor="middle" font-family="Arial" font-size="18" fill="rgba(248,250,252,0.8)">${phone.specs.storage}GB · ${phone.specs.ram}GB RAM</text>\n</svg>`;
}

function specForCategory(categorySlug, brandName) {
  const os = brandName === "Apple" ? "iOS" : "Android";
  const tiers = {
    flagship: {
      ram: [8, 12, 16],
      storage: [256, 512, 1024],
      price: [800, 1400],
      battery: [4300, 5500],
      display: [6.5, 6.9],
      camera: [50, 108, 200],
    },
    midrange: {
      ram: [6, 8, 12],
      storage: [128, 256, 512],
      price: [350, 800],
      battery: [4300, 5200],
      display: [6.4, 6.7],
      camera: [48, 64, 108],
    },
    budget: {
      ram: [4, 6, 8],
      storage: [64, 128, 256],
      price: [150, 350],
      battery: [4000, 5000],
      display: [6.3, 6.6],
      camera: [13, 50, 64],
    },
    gaming: {
      ram: [12, 16],
      storage: [256, 512, 1024],
      price: [600, 1200],
      battery: [5000, 6500],
      display: [6.7, 6.9],
      camera: [50, 64, 108],
    },
    compact: {
      ram: [6, 8],
      storage: [128, 256, 512],
      price: [400, 900],
      battery: [3300, 4500],
      display: [5.8, 6.2],
      camera: [12, 48, 50],
    },
    foldable: {
      ram: [12, 16],
      storage: [256, 512, 1024],
      price: [1200, 2000],
      battery: [4200, 5000],
      display: [7.2, 7.6],
      camera: [50, 108, 200],
    },
  };

  const tier = tiers[categorySlug] ?? tiers.midrange;

  const ram = pick(tier.ram);
  const storage = pick(tier.storage);
  const price = pickInt(tier.price[0], tier.price[1]);
  const battery = pickInt(tier.battery[0], tier.battery[1]);
  const display = pickFloat(tier.display[0], tier.display[1], 0.1);
  const mainCamera = pick(tier.camera);

  return {
    ram,
    storage,
    price,
    battery,
    display: `${display} inches`,
    camera: `${mainCamera}MP + ${pick([8, 12, 16, 32])}MP`,
    os,
  };
}

async function run() {
  const allModels = buildModels();
  const shuffled = [...allModels].sort(() => rand() - 0.5);
  const pickedModels = shuffled.slice(0, 300);

  const brandMap = new Map();
  const phones = [];

  for (const item of pickedModels) {
    const brandSlug = slugify(item.brand);
    if (!brandMap.has(brandSlug)) {
      brandMap.set(brandSlug, {
        id: `brand-${brandSlug}`,
        name: item.brand,
        slug: brandSlug,
        logoUrl: `/images/brands/${brandSlug}.svg`,
      });
    }

    const categorySlug = deriveCategory(item.model);
    const category = categoryBySlug.get(categorySlug) ?? categoryBySlug.get("midrange");
    const spec = specForCategory(categorySlug, item.brand);

    const createdAt = new Date(2022 + pickInt(0, 3), pickInt(0, 11), pickInt(1, 28)).toISOString();
    const phoneId = phones.length + 1;

    const phone = {
      id: `phone-${phoneId}`,
      brandId: `brand-${brandSlug}`,
      categoryId: category.id,
      name: `${item.brand} ${item.model}`.replace(`${item.brand} ${item.brand}`, item.brand),
      slug: slugify(`${item.brand}-${item.model}`),
      description: `${item.brand} ${item.model} with ${spec.storage}GB storage and ${spec.ram}GB RAM.`,
      price: spec.price,
      imageUrl: `/images/phones/phone-${phoneId}.svg`,
      rating: Number((3 + rand() * 2).toFixed(1)),
      stock: pickInt(0, 60),
      specs: {
        ram: spec.ram,
        storage: spec.storage,
        display: spec.display,
        battery: spec.battery,
        camera: spec.camera,
        os: spec.os,
      },
      tags: [category.slug],
      createdAt,
    };

    phones.push(phone);
  }

  const brands = Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(phonesDir, { recursive: true });
  await fs.mkdir(brandsDir, { recursive: true });

  await fs.writeFile(path.join(dataDir, "brands.json"), JSON.stringify(brands, null, 2));
  await fs.writeFile(path.join(dataDir, "categories.json"), JSON.stringify(categories, null, 2));
  await fs.writeFile(path.join(dataDir, "phones.json"), JSON.stringify(phones, null, 2));

  await Promise.all(
    brands.map((brand, index) => {
      const svg = renderBrandSvg(brand.name, brand.slug, index);
      return fs.writeFile(path.join(brandsDir, `${brand.slug}.svg`), svg);
    })
  );

  await Promise.all(
    phones.map((phone, index) => {
      const svg = renderPhoneSvg(phone, index);
      return fs.writeFile(path.join(phonesDir, `phone-${index + 1}.svg`), svg);
    })
  );

  console.log(`Generated ${phones.length} phones across ${brands.length} brands.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
