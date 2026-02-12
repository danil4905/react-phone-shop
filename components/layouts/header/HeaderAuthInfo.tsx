import Image from "next/image";
import { THeaderAuthInfo } from "@/types/header-links";

function getAvatarSrc(avatar?: string) {
  if (!avatar) {
    return "/images/placeholder-avatar.svg";
  }

  if (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("/api/")) {
    return avatar;
  }

  if (avatar.startsWith("/images/")) {
    return `/api${avatar}`;
  }

  return "/images/placeholder-avatar.svg";
}

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
