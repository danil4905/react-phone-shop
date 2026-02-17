'use client';

import { ROUTES } from "@/config/routes";
import { useAuthStore } from "@/store/auth";
import { HeaderLink } from "./HeaderLink";
import HeaderAuthInfo from "./HeaderAuthInfo";
import { Skeleton } from "@/components/ui/Skeleton";
import { Dropdown } from "@/components/ui/Dropdown";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HeaderAuth() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

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

  return (
    <Dropdown trigger={<HeaderAuthInfo avatar={user.avatarUrl} name={displayName} />}>
      {({ close }) => (
        <div className="flex flex-col">
          <Link
            href={ROUTES.account.index}
            role="menuitem"
            onClick={close}
            className="rounded-lg px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              close();
              try {
                await logout();
              } finally {
                router.push(ROUTES.home);
                router.refresh();
              }
            }}
            className="rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </Dropdown>
  );
}
