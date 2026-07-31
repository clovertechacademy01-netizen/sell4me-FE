import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  clearGuestSessionId,
  consumeAffiliateCode,
  peekAffiliateCode,
  setPendingAffiliateCode,
} from "@/lib/session";
import type { Cart } from "@/lib/types";
import { sell4meApi } from "@/store/api/sell4meApi";

type CartState = {
  cart: Cart | null;
  affiliateCode: string | null;
};

const initialState: CartState = {
  cart: null,
  affiliateCode: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    rememberAffiliate(state, action: PayloadAction<string>) {
      state.affiliateCode = action.payload;
      setPendingAffiliateCode(action.payload);
    },
    hydrateAffiliate(state) {
      state.affiliateCode = peekAffiliateCode();
    },
    resetLocalCart(state) {
      clearGuestSessionId();
      state.cart = null;
      state.affiliateCode = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        sell4meApi.endpoints.getCart.matchFulfilled,
        (state, action) => {
          state.cart = action.payload.cart;
        },
      )
      .addMatcher(
        sell4meApi.endpoints.addCartItems.matchFulfilled,
        (state, action) => {
          state.cart = action.payload.cart;
          consumeAffiliateCode();
          state.affiliateCode = null;
        },
      )
      .addMatcher(
        sell4meApi.endpoints.updateCartItem.matchFulfilled,
        (state, action) => {
          state.cart = action.payload.cart;
        },
      )
      .addMatcher(
        sell4meApi.endpoints.removeCartItem.matchFulfilled,
        (state, action) => {
          state.cart = action.payload.cart;
        },
      )
      .addMatcher(
        sell4meApi.endpoints.clearCart.matchFulfilled,
        (state, action) => {
          state.cart = action.payload.cart;
        },
      )
      .addMatcher(sell4meApi.endpoints.checkout.matchFulfilled, (state) => {
        clearGuestSessionId();
        state.cart = null;
        state.affiliateCode = null;
      });
  },
});

export const { rememberAffiliate, hydrateAffiliate, resetLocalCart } =
  cartSlice.actions;

export default cartSlice.reducer;
