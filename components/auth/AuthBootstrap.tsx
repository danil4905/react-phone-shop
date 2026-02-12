"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import type { UserPublic } from "@repo/shared";

export function AuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser);
  const logoutLocal = useAuthStore((s) => s.logoutLocal);
  const setCsrfToken = useAuthStore((s) => s.setCsrfToken);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          if (!cancelled) logoutLocal();
          return;
        }
        const data = (await res.json()) as { user?: UserPublic };
        if (!cancelled && data.user) {
          setUser(data.user);
          // CSRF token is needed for write requests when auth is cookie-based.
          const csrfRes = await fetch("/api/auth/csrf", { credentials: "include" });
          if (csrfRes.ok) {
            const csrfData = (await csrfRes.json()) as { csrfToken?: string };
            setCsrfToken(csrfData.csrfToken ?? null);
          }
        }
      } catch {
        if (!cancelled) logoutLocal();
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [logoutLocal, setCsrfToken, setUser]);

  return null;
}
