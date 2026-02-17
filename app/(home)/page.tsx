import PhoneCard from "@/components/phones/PhoneCard";
import PhonesList from "@/components/phones/PhonesList";
import type { PaginatedResult, Phone } from "@repo/shared";
import { headers } from "next/headers";

const getBaseUrl = async () => {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error("Host header is missing");
  }

  return `${protocol}://${host}`;
};

const getCatalog = async () => {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/phones`, { cache: "no-store" });
    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as PaginatedResult<Phone>;
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default async function Home() {
  let catalogList: Phone[] = [];
  const res = await getCatalog();
  if (res !== null) {
    catalogList = res.items;
  }

  return (
    <div className="container mx-auto max-md:px-4 pt-10">
      {catalogList?.length > 0 && <PhonesList phonesList={catalogList} />}
    </div>
  );
}
