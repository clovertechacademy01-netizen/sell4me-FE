import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import {
  clearAuthStorage,
  getAccessToken,
  getGuestSessionId,
} from "@/lib/session";

// Browser calls same-origin `/backend/...`; Next rewrites that to `API_URL`.
// Do NOT use NEXT_PUBLIC_APP_URL here — that is the frontend origin and would
// make requests hit e.g. sell4me-fe.vercel.app/api/... instead of the API.
const API_BASE =
  process.env.NEXT_PUBLIC_API_PROXY?.replace(/\/+$/, "") || "/backend";

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const skipAuth = Boolean(config.headers?.["x-skip-auth"]);
  if (skipAuth) {
    delete config.headers["x-skip-auth"];
  } else {
    // Prefer httpOnly cookies (sent via withCredentials). Bearer is fallback only.
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (config.headers?.["x-use-guest-session"]) {
    delete config.headers["x-use-guest-session"];
    config.headers["x-guest-session-id"] = getGuestSessionId();
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthStorage();
      if (typeof window !== "undefined") {
        void fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      }
    }
    return Promise.reject(error);
  },
);

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function extractMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const message = (payload as { message?: unknown }).message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.join(", ");
  return fallback;
}

export function getErrorMessage(error: unknown, fallback = "Request failed") {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  if (error instanceof ApiError) return error.message;

  if (typeof error === "object") {
    const maybeRtk = error as {
      status?: number | string;
      data?: unknown;
      error?: string;
      message?: string;
    };

    if (maybeRtk.data !== undefined) {
      return extractMessage(maybeRtk.data, maybeRtk.error || fallback);
    }

    if (typeof maybeRtk.message === "string") return maybeRtk.message;
    if (typeof maybeRtk.error === "string") return maybeRtk.error;
  }

  if (axios.isAxiosError(error)) {
    return extractMessage(
      error.response?.data,
      error.message || fallback,
    );
  }

  if (error instanceof Error) return error.message;

  return fallback;
}

export type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  auth?: boolean;
  guest?: boolean;
};

export type AxiosBaseQueryError = {
  status: number | string;
  data: unknown;
  message: string;
};

export const axiosBaseQueryFn: BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  AxiosBaseQueryError
> = async ({
  url,
  method = "GET",
  data,
  params,
  headers,
  auth = true,
  guest = false,
}) => {
  try {
    const cleanParams: Record<string, string | number | boolean> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        cleanParams[key] = value;
      });
    }

    const response = await axiosInstance({
      url,
      method,
      data,
      params: cleanParams,
      headers: {
        ...headers,
        ...(auth === false ? { "x-skip-auth": "1" } : {}),
        ...(guest ? { "x-use-guest-session": "1" } : {}),
      },
    });

    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status ?? 500;
    const payload = axiosError.response?.data ?? axiosError.message;
    return {
      error: {
        status,
        data: payload,
        message: extractMessage(payload, axiosError.message || "Request failed"),
      },
    };
  }
};
