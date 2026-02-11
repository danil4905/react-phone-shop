export function parseStringList(value?: string | string[]) {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : value.split(",");
  return raw.map((item) => item.trim()).filter(Boolean);
}

export function parseNumberList(value?: string | string[]) {
  return parseStringList(value)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
}
