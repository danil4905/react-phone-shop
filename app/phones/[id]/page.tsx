import type { Metadata } from "next";
import type { Phone } from "@repo/shared";
import { headers } from "next/headers";
import { cache } from "react";
import Image from "next/image";
import { getPhoneImageSrc } from "@/lib/media/get-phone-image-src";
import { getBaseUrl } from "@/lib/request/get-base-url";

type Props = {
  params: Promise<{ id: string }>;
};

const getPhone = cache(async (id: string) => {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/phones/${id}`, { cache: "no-store" });
    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as Phone;
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const phone = await getPhone(id);

  if (!phone) {
    return {
      title: "Product Not Found",
      description: "Phone details are unavailable.",
    };
  }

  return {
    title: phone.name,
    description: phone.description,
  };
}

export default async function PhonePage({ params }: Props) {
  const { id } = await params;
  const phone = await getPhone(id);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col lg:flex-row">
        <div className="w-1/3">
          <Image
                src={getPhoneImageSrc(phone?.imageUrl)}
                alt={phone?.name || 'Phone'}
                width={100}
                height={166}
              />
        </div>
        <div className="w-2/3">
          <h1 className="text-2xl font-semibold">{phone?.name ?? "Product Page"}</h1>
        </div>
      </div>

    </main>
  );
}
