import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  clearAuthStorage,
  clearAuthCookies,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
} from "@/lib/session";
import type { User } from "@/lib/types";
import { sell4meApi } from "@/store/api/sell4meApi";

type AuthState = {
  user: User | null;
  token: string | null;
  hydrated: boolean;
};

const initialState: AuthState = {
  user: null,
  token: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth(state) {
      state.user = getStoredUser<User>();
      state.token = getAccessToken();
      state.hydrated = true;
    },
    setSession(
      state,
      action: PayloadAction<{ user: User; token?: string | null }>,
    ) {
      state.user = action.payload.user;
      if (action.payload.token) {
        state.token = action.payload.token;
        setAccessToken(action.payload.token);
      } else {
        state.token = null;
        setAccessToken(null);
      }
      setStoredUser(action.payload.user);
    },
    clearSession(state) {
      state.user = null;
      state.token = null;
      clearAuthStorage();
      void clearAuthCookies();
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        sell4meApi.endpoints.login.matchFulfilled,
        (state, action) => {
          state.user = action.payload.user;
          // Cookie-first: only keep a local Bearer token when the API returns one
          // (e.g. NEXT_PUBLIC_INCLUDE_AUTH_TOKENS=true for local debugging).
          if (action.payload.access_token) {
            state.token = action.payload.access_token;
            setAccessToken(action.payload.access_token);
          } else {
            state.token = null;
            setAccessToken(null);
          }
          setStoredUser(action.payload.user);
          state.hydrated = true;
        },
      )
      .addMatcher(sell4meApi.endpoints.me.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
        setStoredUser(action.payload.user);
      })
      .addMatcher(sell4meApi.endpoints.me.matchRejected, (state) => {
        state.user = null;
        state.token = null;
        clearAuthStorage();
        void clearAuthCookies();
      });
  },
});

export const { hydrateAuth, setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
