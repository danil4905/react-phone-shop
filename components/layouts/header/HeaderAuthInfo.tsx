import Image from "next/image";
import { THeaderAuthInfo } from "@/types/header-links";
import { getAvatarSrc } from "@/lib/media/get-avatar-src";

export default function HeaderAuthInfo({ avatar, name }: THeaderAuthInfo) {
  return (
    <div className="flex items-center gap-x-2">
      <Image
        src={getAvatarSrc(avatar)}
        alt={name || "Avatar"}
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full border border-zinc-200 object-cover"
      />
      <span className="max-w-36 truncate text-sm font-medium text-zinc-800">{name}</span>
    </div>
  );
}
