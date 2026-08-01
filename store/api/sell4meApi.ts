import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQueryFn } from "@/lib/axios";
import type {
  AffiliateLink,
  Cart,
  CheckoutResponse,
  FezState,
  FezTrackingResponse,
  NotificationItem,
  Order,
  Pagination,
  PaymentRecord,
  Product,
  ProductCategory,
  RelatedStoreCatalog,
  Store,
  TrackingOrder,
  User,
  UserDevice,
  Wallet,
  WalletTransaction,
} from "@/lib/types";

export const sell4meApi = createApi({
  reducerPath: "sell4meApi",
  baseQuery: axiosBaseQueryFn,
  tagTypes: [
    "Auth",
    "Cart",
    "Store",
    "Product",
    "Order",
    "PartnerLink",
    "PartnerOrder",
    "Wallet",
    "Notification",
  ],
  endpoints: (builder) => ({
    // Auth
    register: builder.mutation<
      { message: string; user: User },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/api/v1/auth/register",
        method: "POST",
        data: body,
        auth: false,
      }),
    }),
    verifyEmail: builder.mutation<
      { message: string; user: User },
      { email: string; otp: string }
    >({
      query: (body) => ({
        url: "/api/v1/auth/verify-email",
        method: "POST",
        data: body,
        auth: false,
      }),
    }),
    login: builder.mutation<
      {
        message: string;
        user: User;
        access_token?: string;
        refresh_token?: string;
      },
      { email: string; password: string }
    >({
      query: (body) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        data: body,
        auth: false,
        // Cookie-first auth. Opt into body tokens only for local/debug clients.
        ...(process.env.NEXT_PUBLIC_INCLUDE_AUTH_TOKENS === "true"
          ? { headers: { "x-include-tokens": "true" } }
          : {}),
      }),
      invalidatesTags: ["Auth", "Store", "Product", "Order", "Wallet", "Notification"],
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: "/api/v1/auth/forgot-password",
        method: "POST",
        data: body,
        auth: false,
      }),
    }),
    resetPassword: builder.mutation<
      { message: string },
      { email: string; otp: string; new_password: string }
    >({
      query: (body) => ({
        url: "/api/v1/auth/reset-password",
        method: "POST",
        data: body,
        auth: false,
      }),
    }),
    resendOtp: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: "/api/v1/auth/resend-otp",
        method: "POST",
        data: body,
        auth: false,
      }),
    }),
    me: builder.query<{ user: User }, void>({
      query: () => ({ url: "/api/v1/auth/me" }),
      providesTags: ["Auth"],
    }),
    listDevices: builder.query<{ devices: UserDevice[] }, void>({
      query: () => ({ url: "/api/v1/auth/devices" }),
      providesTags: ["Auth"],
    }),
    blockDevice: builder.mutation<
      { message: string; device: UserDevice },
      { deviceId: string }
    >({
      query: ({ deviceId }) => ({
        url: `/api/v1/auth/devices/${deviceId}/block`,
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    blockDeviceByToken: builder.mutation<
      { message: string; device: UserDevice },
      { token: string }
    >({
      query: (body) => ({
        url: "/api/v1/auth/devices/block-by-token",
        method: "POST",
        data: body,
        auth: false,
      }),
    }),

    // Public catalog / cart / checkout
    getAffiliate: builder.query<
      | {
          type: "product";
          product: Product;
          store: Store;
          store_products: Product[];
          similar_products: Product[];
          general_products: Product[];
          attribution?: {
            attributed: boolean;
            already_attributed: boolean;
          };
        }
      | {
          type: "store";
          store: Store;
          store_products: Product[];
          similar_stores: RelatedStoreCatalog[];
          general_stores: RelatedStoreCatalog[];
          attribution?: {
            attributed: boolean;
            already_attributed: boolean;
          };
        },
      string
    >({
      query: (code) => ({
        url: `/api/v1/public/affiliate/${code}`,
        auth: false,
        // Stamp first-touch partner attribution on the guest cart at landing.
        guest: true,
      }),
      async onQueryStarted(_code, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(sell4meApi.util.invalidateTags(["Cart"]));
        } catch {
          // ignore — landing errors are handled by the page
        }
      },
    }),
    listPublicCategories: builder.query<{ items: ProductCategory[] }, void>({
      query: () => ({
        url: "/api/v1/public/categories",
        auth: false,
      }),
    }),
    listPublicProducts: builder.query<
      { items: Product[]; pagination: Pagination },
      {
        page?: number;
        limit?: number;
        category_id?: string;
        store_id?: string;
        exclude_store_id?: string;
      } | void
    >({
      query: (params) => ({
        url: "/api/v1/public/products",
        auth: false,
        params: params || undefined,
      }),
    }),
    getPublicProduct: builder.query<
      {
        product: Product;
        store: Store;
        store_products: Product[];
        similar_products: Product[];
        general_products: Product[];
      },
      string
    >({
      query: (id) => ({
        url: `/api/v1/public/products/${id}`,
        auth: false,
      }),
    }),
    listPublicStores: builder.query<
      { items: RelatedStoreCatalog[]; pagination: Pagination },
      {
        page?: number;
        limit?: number;
        product_category?: string;
        exclude_store_id?: string;
      } | void
    >({
      query: (params) => ({
        url: "/api/v1/public/stores",
        auth: false,
        params: params || undefined,
      }),
    }),
    getPublicStore: builder.query<
      {
        store: Store;
        products: Product[];
        similar_stores: RelatedStoreCatalog[];
        general_stores: RelatedStoreCatalog[];
      },
      string
    >({
      query: (id) => ({
        url: `/api/v1/public/stores/${id}`,
        auth: false,
      }),
    }),
    getPublicRelatedProducts: builder.query<
      {
        similar_products: Product[];
        general_products: Product[];
      },
      string
    >({
      query: (id) => ({
        url: `/api/v1/public/products/${id}/related`,
        auth: false,
      }),
    }),
    getPublicRelatedStores: builder.query<
      {
        similar_stores: RelatedStoreCatalog[];
        general_stores: RelatedStoreCatalog[];
      },
      string
    >({
      query: (id) => ({
        url: `/api/v1/public/stores/${id}/related`,
        auth: false,
      }),
    }),
    getCart: builder.query<{ message: string; cart: Cart }, void>({
      query: () => ({
        url: "/api/v1/public/cart",
        auth: false,
        guest: true,
      }),
      providesTags: ["Cart"],
    }),
    addCartItems: builder.mutation<
      { message: string; cart: Cart },
      {
        items: Array<{ product_id: string; quantity: number }>;
        affiliate_code?: string | null;
      }
    >({
      query: ({ items, affiliate_code }) => ({
        url: "/api/v1/public/cart/items",
        method: "POST",
        data: { items },
        auth: false,
        guest: true,
        // Fallback attribution if landing stamp did not run.
        params: affiliate_code ? { affiliate_code } : undefined,
      }),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation<
      { message: string; cart: Cart },
      { product_id: string; quantity: number }
    >({
      query: ({ product_id, quantity }) => ({
        url: `/api/v1/public/cart/items/${product_id}`,
        method: "PATCH",
        data: { quantity },
        auth: false,
        guest: true,
      }),
      invalidatesTags: ["Cart"],
    }),
    removeCartItem: builder.mutation<
      { message: string; cart: Cart },
      string
    >({
      query: (product_id) => ({
        url: `/api/v1/public/cart/items/${product_id}`,
        method: "DELETE",
        auth: false,
        guest: true,
      }),
      invalidatesTags: ["Cart"],
    }),
    clearCart: builder.mutation<{ message: string; cart: Cart }, void>({
      query: () => ({
        url: "/api/v1/public/cart",
        method: "DELETE",
        auth: false,
        guest: true,
      }),
      invalidatesTags: ["Cart"],
    }),
    estimateDelivery: builder.mutation<
      {
        message: string;
        store_id: string;
        delivery_fee: number;
        fez_cost: number;
        markup: number;
      },
      {
        store_id: string;
        recipient_state: string;
        value_of_items: number;
      }
    >({
      query: (body) => ({
        url: "/api/v1/public/delivery/estimate",
        method: "POST",
        data: body,
        auth: false,
      }),
    }),
    checkout: builder.mutation<CheckoutResponse, Record<string, unknown>>({
      query: (body) => ({
        url: "/api/v1/public/orders/checkout",
        method: "POST",
        data: body,
        auth: false,
        guest: true,
      }),
      invalidatesTags: ["Cart"],
    }),
    trackByToken: builder.query<
      { message: string; orders: TrackingOrder[] },
      string
    >({
      query: (token) => ({
        url: "/api/v1/public/orders/track-delivery",
        auth: false,
        params: { token },
      }),
    }),
    trackByLookup: builder.mutation<
      { message: string; orders: TrackingOrder[] },
      { email: string; order_id?: string; payment_tx_ref?: string }
    >({
      query: (body) => ({
        url: "/api/v1/public/orders/track-delivery",
        method: "POST",
        data: body,
        auth: false,
      }),
    }),

    // Stores
    listStores: builder.query<
      { items: Store[]; pagination: Pagination },
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({
        url: "/api/v1/stores",
        params: params || undefined,
      }),
      providesTags: ["Store"],
    }),
    getStore: builder.query<{ store: Store }, string>({
      query: (id) => ({ url: `/api/v1/stores/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Store", id }],
    }),
    createStore: builder.mutation<
      { message: string; store: Store },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/api/v1/stores",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Store"],
    }),
    updateStore: builder.mutation<
      { message: string; store: Store },
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/stores/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Store"],
    }),
    deleteStore: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/v1/stores/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Store", "Product"],
    }),
    suspendStore: builder.mutation<
      { message: string; store: Store },
      string
    >({
      query: (id) => ({
        url: `/api/v1/stores/${id}/suspend`,
        method: "PATCH",
      }),
      invalidatesTags: ["Store", "Product"],
    }),
    activateStore: builder.mutation<
      { message: string; store: Store },
      string
    >({
      query: (id) => ({
        url: `/api/v1/stores/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: ["Store", "Product"],
    }),

    // Products
    listProductCategories: builder.query<{ items: ProductCategory[] }, void>({
      query: () => ({
        url: "/api/v1/products/categories",
      }),
      providesTags: ["Product"],
    }),
    listProducts: builder.query<
      { items: Product[]; pagination: Pagination },
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({
        url: "/api/v1/products",
        params: params || undefined,
      }),
      providesTags: ["Product"],
    }),
    getProduct: builder.query<{ message: string; product: Product }, string>({
      query: (id) => ({ url: `/api/v1/products/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),
    createProducts: builder.mutation<
      { message: string; products: Product[] },
      { store_id: string; products: Array<Record<string, unknown>> }
    >({
      query: (body) => ({
        url: "/api/v1/products",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<
      { message: string; product: Product },
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/products/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/v1/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    suspendProduct: builder.mutation<
      { message: string; product: Product },
      string
    >({
      query: (id) => ({
        url: `/api/v1/products/${id}/suspend`,
        method: "PATCH",
      }),
      invalidatesTags: ["Product"],
    }),
    activateProduct: builder.mutation<
      { message: string; product: Product },
      string
    >({
      query: (id) => ({
        url: `/api/v1/products/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: ["Product"],
    }),

    // Orders
    listOrders: builder.query<
      { items: Order[]; pagination: Pagination },
      {
        page?: number;
        limit?: number;
        status?: string;
        store_id?: string;
      } | void
    >({
      query: (params) => ({
        url: "/api/v1/orders",
        params: params || undefined,
      }),
      providesTags: ["Order"],
    }),
    getOrder: builder.query<{ order: Order }, string>({
      query: (id) => ({ url: `/api/v1/orders/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),
    updateOrderStatus: builder.mutation<
      { message: string; order: Order },
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/api/v1/orders/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: ["Order"],
    }),

    // Partner
    createAffiliateLink: builder.mutation<
      { message: string; affiliate_link: AffiliateLink },
      { type: "product" | "store"; store_id?: string; product_id?: string }
    >({
      query: (body) => ({
        url: "/api/v1/partner/affiliate-links",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["PartnerLink"],
    }),
    listAffiliateLinks: builder.query<{ items: AffiliateLink[] }, void>({
      query: () => ({ url: "/api/v1/partner/affiliate-links" }),
      providesTags: ["PartnerLink"],
    }),
    getAffiliateLink: builder.query<
      { message: string; affiliate_link: AffiliateLink },
      string
    >({
      query: (id) => ({ url: `/api/v1/partner/affiliate-links/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "PartnerLink", id }],
    }),
    listPartnerOrders: builder.query<
      { items: Order[]; pagination: Pagination },
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({
        url: "/api/v1/partner/orders",
        params: params || undefined,
      }),
      providesTags: ["PartnerOrder"],
    }),

    // Wallet / payments
    getWallet: builder.query<{ message: string; wallet: Wallet }, void>({
      query: () => ({ url: "/api/v1/wallet/me" }),
      providesTags: ["Wallet"],
    }),
    listWalletTransactions: builder.query<
      { items: WalletTransaction[]; pagination: Pagination },
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/api/v1/wallet/transactions",
        params: params || undefined,
      }),
      providesTags: ["Wallet"],
    }),
    listBanks: builder.query<
      | { data?: Array<{ code: string; name: string }> }
      | Array<{ code: string; name: string }>,
      string | void
    >({
      query: (country_code = "NG") => ({
        url: `/api/v1/payments/flutterwave/banks/${country_code || "NG"}`,
      }),
    }),
    verifyBankAccount: builder.mutation<
      {
        data?: { account_name?: string; account_number?: string };
        account_name?: string;
      },
      { bank_code: string; account_number: string }
    >({
      query: (body) => ({
        url: "/api/v1/payments/flutterwave/verify-account",
        method: "POST",
        data: body,
      }),
    }),
    transferFunds: builder.mutation<
      { message: string; transfer_reference: string },
      {
        bank_code: string;
        account_number: string;
        amount: number;
        currency?: string;
        narration: string;
      }
    >({
      query: (body) => ({
        url: "/api/v1/payments/flutterwave/transfer",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Wallet"],
    }),
    listPayments: builder.query<
      { items: PaymentRecord[]; pagination: Pagination },
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({
        url: "/api/v1/payments",
        params: params || undefined,
      }),
    }),
    verifyCheckoutPayment: builder.query<Record<string, unknown>, string>({
      query: (tx_ref) => ({
        url: `/api/v1/payments/flutterwave/verify/${tx_ref}`,
      }),
    }),

    // Notifications
    listNotifications: builder.query<
      {
        items: NotificationItem[];
        meta: Pagination;
        unread_count: number;
      },
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/api/v1/notifications",
        params: params || undefined,
      }),
      providesTags: ["Notification"],
    }),
    unreadNotificationCount: builder.query<{ unread_count: number }, void>({
      query: () => ({ url: "/api/v1/notifications/unread-count" }),
      providesTags: ["Notification"],
    }),
    markNotificationRead: builder.mutation<
      { message: string; notification: NotificationItem },
      string
    >({
      query: (id) => ({
        url: `/api/v1/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    markAllNotificationsRead: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/api/v1/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Fez delivery
    listFezStates: builder.query<FezState[] | { items?: FezState[] }, void>({
      query: () => ({
        url: "/api/v1/delivery/fez/states",
      }),
    }),
    trackFezOrder: builder.query<FezTrackingResponse, string>({
      query: (orderNo) => ({
        url: `/api/v1/delivery/fez/orders/${orderNo}/track`,
      }),
    }),

    // Uploads
    uploadFile: builder.mutation<
      { success: boolean; file_url: string; file_key: string },
      {
        endpoint: "/uploads" | "/uploads/user-avatar" | "/uploads/organization-logo";
        file: File;
      }
    >({
      query: ({ endpoint, file }) => {
        const form = new FormData();
        form.append("file", file);
        return {
          url: endpoint,
          method: "POST",
          data: form,
          auth: false,
        };
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendOtpMutation,
  useMeQuery,
  useLazyMeQuery,
  useListDevicesQuery,
  useBlockDeviceMutation,
  useBlockDeviceByTokenMutation,
  useGetAffiliateQuery,
  useListPublicCategoriesQuery,
  useListPublicProductsQuery,
  useGetPublicProductQuery,
  useListPublicStoresQuery,
  useGetPublicStoreQuery,
  useGetPublicRelatedProductsQuery,
  useGetPublicRelatedStoresQuery,
  useGetCartQuery,
  useLazyGetCartQuery,
  useAddCartItemsMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useEstimateDeliveryMutation,
  useCheckoutMutation,
  useTrackByTokenQuery,
  useTrackByLookupMutation,
  useListStoresQuery,
  useGetStoreQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
  useSuspendStoreMutation,
  useActivateStoreMutation,
  useListProductCategoriesQuery,
  useListProductsQuery,
  useGetProductQuery,
  useCreateProductsMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useSuspendProductMutation,
  useActivateProductMutation,
  useListOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useCreateAffiliateLinkMutation,
  useListAffiliateLinksQuery,
  useGetAffiliateLinkQuery,
  useListPartnerOrdersQuery,
  useGetWalletQuery,
  useListWalletTransactionsQuery,
  useListBanksQuery,
  useVerifyBankAccountMutation,
  useTransferFundsMutation,
  useListPaymentsQuery,
  useVerifyCheckoutPaymentQuery,
  useListNotificationsQuery,
  useUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useListFezStatesQuery,
  useTrackFezOrderQuery,
  useUploadFileMutation,
} = sell4meApi;
