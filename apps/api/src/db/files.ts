import { promises as fs } from "node:fs";
import path from "node:path";
import type { ZodType } from "zod";

const dataDir = path.join(process.cwd(), "data");
const cache = new Map<string, unknown>();
const writeQueues = new Map<string, Promise<void>>();

export const getDataPath = (fileName: string) => path.join(dataDir, fileName);

export async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

function validateData<T>(fileName: string, data: T, schema?: ZodType<T>) {
  if (!schema) return data;
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => issue.message).join("; ");
    throw new Error(`Invalid data in ${fileName}: ${issues}`);
  }
  return result.data;
}

async function atomicWrite(fileName: string, data: string) {
  const filePath = getDataPath(fileName);
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, data);
  await fs.rename(tempPath, filePath);
}

export async function readJsonFile<T>(fileName: string, fallback: T, schema?: ZodType<T>): Promise<T> {
  if (cache.has(fileName)) {
    return cache.get(fileName) as T;
  }
  await ensureDataDir();
  const filePath = getDataPath(fileName);

  try {
    const content = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(content) as T;
    const validated = validateData(fileName, parsed, schema);
    cache.set(fileName, validated);
    return validated;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const validatedFallback = validateData(fileName, fallback, schema);
      await writeJsonFile(fileName, validatedFallback, schema);
      return validatedFallback;
    }
    throw error;
  }
}

export async function writeJsonFile<T>(fileName: string, data: T, schema?: ZodType<T>): Promise<void> {
  await ensureDataDir();
  const validated = validateData(fileName, data, schema);
  cache.set(fileName, validated);

  const payload = JSON.stringify(validated, null, 2);
  const previous = writeQueues.get(fileName) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(() => atomicWrite(fileName, payload));
  writeQueues.set(fileName, next);
  await next;
}
