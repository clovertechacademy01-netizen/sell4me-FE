"use client";

import { useEffect } from "react";
import { useGetCartQuery } from "@/store/api/sell4meApi";
import { useAppDispatch } from "@/store/hooks";
import { hydrateAuth } from "@/store/slices/authSlice";
import { hydrateAffiliate } from "@/store/slices/cartSlice";

export function StoreHydrator() {
  const dispatch = useAppDispatch();
  useGetCartQuery();

  useEffect(() => {
    dispatch(hydrateAuth());
    dispatch(hydrateAffiliate());
  }, [dispatch]);

  return null;
}
