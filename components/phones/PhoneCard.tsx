import Image from "next/image";
import Link from "next/link";
import type { Phone } from "@repo/shared";
import { ROUTES } from "@/config/routes";

const placeholderImage = "/api/images/phone-placeholder.svg"

type PhoneCardProps = {
  phone: Phone;
};

function getPhoneImageSrc(imageUrl?: string) {
  if (!imageUrl) {
    return placeholderImage;
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("/api/")
  ) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/images/")) {
    return `/api${imageUrl}`;
  }

  return placeholderImage;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function PhoneCard({ phone }: PhoneCardProps) {
  const inStock = phone.stock > 0;

  return (
    <Link
      href={ROUTES.phone(phone.id)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      title={phone.name}
    >
      <div className="relative aspect-[4/5] border-b border-zinc-100 bg-zinc-50">
        <Image
          src={getPhoneImageSrc(phone.imageUrl)}
          alt={phone.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
          className="object-contain p-4"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-2 py-1 text-xs font-medium ${
            inStock ? "bg-emerald-50 text-emerald-700" : "bg-zinc-200 text-zinc-600"
          }`}
        >
          {inStock ? "In stock" : "Out of stock"}
        </span>
      </div>

      <div className="flex h-full flex-col gap-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">{phone.brandId}</p>
          <h3 className="mt-1 text-sm font-semibold text-zinc-900">{phone.name}</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700">
            {phone.specs.ram} GB RAM
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700">
            {phone.specs.storage} GB
          </span>
          {typeof phone.rating === "number" && (
            <span className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-700">
              {phone.rating.toFixed(1)} / 5
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <p className="text-xl font-bold text-zinc-900">{formatPrice(phone.price)}</p>
          <span className="text-xs text-zinc-500">{phone.stock} pcs</span>
        </div>
      </div>
    </Link>
  );
}
