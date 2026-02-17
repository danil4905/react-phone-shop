import { create } from "zustand";
import type { UserPublic } from "@repo/shared";

export type AuthStatus = "unknown" | "guest" | "auth";

type AuthState = {
  status: AuthStatus;
  user: UserPublic | null;
  csrfToken: string | null;
};

type AuthActions = {
  setUser: (user: UserPublic) => void;
  setCsrfToken: (token: string | null) => void;
  hydrateFromSession: (payload: { user: UserPublic; csrfToken?: string | null }) => void;
  logoutLocal: () => void;
  logout: () => Promise<void>;
};

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  status: "unknown",
  user: null,
  csrfToken: null,
};

export const useAuthStore = create<AuthStore>()((set, get) => ({
  ...initialState,

  setUser: (user) => {
    set({ user, status: "auth" });
  },

  setCsrfToken: (token) => {
    set({ csrfToken: token });
  },

  hydrateFromSession: ({ user, csrfToken }) => {
    set({
      user,
      status: "auth",
      csrfToken: csrfToken ?? null,
    });
  },

  logoutLocal: () => {
    set({
      status: "guest",
      user: null,
      csrfToken: null,
    });
  },

  logout: async () => {
    const { csrfToken } = get();

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { "x-csrf-token": csrfToken } : undefined,
      });
    } finally {
      get().logoutLocal();
    }
  },
}));
