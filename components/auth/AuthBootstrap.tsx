"use client";

import { useEffect } from "react";
import { logoutLocal, setCsrfToken, setUser } from "@/store/auth";
import { useAppDispatch } from "@/store/hooks";
import type { UserPublic } from "@repo/shared";

export function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          if (!cancelled) dispatch(logoutLocal());
          return;
        }
        const data = (await res.json()) as { user?: UserPublic };
        if (!cancelled && data.user) {
          dispatch(setUser(data.user));
          // CSRF token is needed for write requests when auth is cookie-based.
          const csrfRes = await fetch("/api/auth/csrf", { credentials: "include" });
          if (csrfRes.ok) {
            const csrfData = (await csrfRes.json()) as { csrfToken?: string };
            dispatch(setCsrfToken(csrfData.csrfToken ?? null));
          }
        }
      } catch {
        if (!cancelled) dispatch(logoutLocal());
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
}
