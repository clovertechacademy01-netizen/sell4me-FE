import { configureStore } from "@reduxjs/toolkit";
import { sell4meApi } from "@/store/api/sell4meApi";
import authReducer from "@/store/slices/authSlice";
import cartReducer from "@/store/slices/cartSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      [sell4meApi.reducerPath]: sell4meApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(sell4meApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
