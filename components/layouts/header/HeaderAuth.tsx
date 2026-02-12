'use client';

import { ROUTES } from "@/config/routes";
import { useAuthStore } from "@/store/auth";
import { HeaderLink } from "./HeaderLink";
import HeaderAuthInfo from "./HeaderAuthInfo";
import { Skeleton } from "@/components/ui/Skeleton";

export default function HeaderAuth() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);

  if (status === "unknown") {
    return (
      <div className="flex items-center gap-x-2" aria-hidden>
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (!user) {
    return <HeaderLink link={{ href: ROUTES.auth.login, text: "Login" }} />;
  }

  const displayName = [user.name, user.lastName].filter(Boolean).join(" ").trim() || user.email;

  return <HeaderAuthInfo avatar={user.avatarUrl} name={displayName} />;
}
