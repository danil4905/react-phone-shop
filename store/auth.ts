import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserPublic } from "@repo/shared";
import type { RootState } from "./index";

export type AuthStatus = "unknown" | "guest" | "auth";

type AuthState = {
  status: AuthStatus;
  user: UserPublic | null;
  csrfToken: string | null;
};

const initialState: AuthState = {
  status: "unknown",
  user: null,
  csrfToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserPublic>) => {
      state.user = action.payload;
      state.status = "auth";
    },
    setCsrfToken: (state, action: PayloadAction<string | null>) => {
      state.csrfToken = action.payload;
    },
    hydrateFromSession: (
      state,
      action: PayloadAction<{ user: UserPublic; csrfToken?: string | null }>
    ) => {
      state.user = action.payload.user;
      state.status = "auth";
      state.csrfToken = action.payload.csrfToken ?? null;
    },
    logoutLocal: (state) => {
      state.status = "guest";
      state.user = null;
      state.csrfToken = null;
    },
  },
});

export const logout = createAsyncThunk<void, void, { state: RootState }>(
  "auth/logout",
  async (_, { getState, dispatch }) => {
    const { csrfToken } = getState().auth;

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { "x-csrf-token": csrfToken } : undefined,
      });
    } finally {
      dispatch(logoutLocal());
    }
  }
);

export const { setUser, setCsrfToken, hydrateFromSession, logoutLocal } = authSlice.actions;

export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthCsrfToken = (state: RootState) => state.auth.csrfToken;

export default authSlice.reducer;
