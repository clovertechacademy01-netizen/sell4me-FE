"use client";

import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

const BACKGROUND_ENDPOINTS = new Set([
  "unreadNotificationCount",
  "getCart",
]);

export function useGlobalLoading() {
  return useAppSelector((state) => {
    const apiState = state.sell4meApi;
    const queriesBusy = Object.values(apiState.queries).some((query) => {
      if (!query || query.status !== "pending") return false;
      if (BACKGROUND_ENDPOINTS.has(query.endpointName)) return false;
      return true;
    });
    const mutationsBusy = Object.values(apiState.mutations).some(
      (mutation) => mutation?.status === "pending",
    );
    return queriesBusy || mutationsBusy;
  });
}

export function HeartbeatLoader({
  className,
  label = "Loading…",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "app-loader fixed inset-0 z-[100] grid place-items-center",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="app-loader__gloss absolute inset-0" />
      <div className="relative flex flex-col items-center gap-4">
        <div className="logo-heartbeat grid size-16 place-items-center rounded-2xl bg-brand text-xl font-bold text-white shadow-[0_16px_40px_rgba(11,61,46,0.4)]">
          S4
        </div>
      </div>
    </div>
  );
}

/** Global overlay when RTK Query endpoints are loading. */
export function AppLoader() {
  const loading = useGlobalLoading();
  if (!loading) return null;
  return <HeartbeatLoader />;
}
