"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { makeStore, type AppStore } from "@/store";
import { StoreHydrator } from "@/store/hydrator";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <StoreHydrator />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "border border-border bg-white text-foreground shadow-lg",
          },
        }}
      />
    </Provider>
  );
}
