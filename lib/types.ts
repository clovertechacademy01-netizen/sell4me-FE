export type DeliveryMethod = "home" | "locker";

export type Role = "admin" | "merchant" | "customer" | "partner" | "delivery_partner";

export interface FezLocker {
  id: string;
  address: string;
}

export interface FezLockersResponse {
  items: FezLocker[];
  max_weight?: number;
  max_value_of_item?: number;
}

export interface DeliveryEstimate {
  message: string;
  store_id: string;
  recipient_state: string;
  value_of_items: number;
  locker: boolean;
  delivery_fee: number;
  fez_cost: number;
  markup: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed";

export type StoreStatus = "active" | "suspended";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  gender?: string;
  role: Role;
  image?: string;
  is_active: boolean;
  is_verified: boolean;
  last_login_at?: string;
}

export interface UserDevice {
  id: string;
  device_name: string;
  browser: string;
  os: string;
  device_type: string;
  ip_address: string;
  location_label: string;
  last_login_at: string;
  is_blocked: boolean;
  is_current: boolean;
}

export interface Store {
  id: string;
  merchant_id: string;
  name: string;
  logo?: string;
  product_category: string;
  description: string;
  business_line: string;
  status: StoreStatus;
}

export interface Product {
  id: string;
  store_id: string;
  merchant_id: string;
  name: string;
  quantity: number;
  /** System category ID (e.g. fashion-apparel) */
  category_id: string;
  /** Resolved display name from category_id */
  category: string;
  unit: string;
  price: number;
  /**
   * Partner commission percentage 0–100.
   * Omitted on public/customer catalog payloads — never added to customer price.
   */
  commission?: number;
  image?: string;
  specifications?: Record<string, string>;
  status: StoreStatus;
}

/** Public discovery block: another store plus a few of its products. */
export interface RelatedStoreCatalog {
  store: Store;
  products: Product[];
}

export interface CartItem {
  product_id: string;
  store_id: string;
  merchant_id: string;
  name: string;
  unit: string;
  price: number;
  /** Omitted on customer cart responses */
  commission?: number;
  image?: string;
  specifications?: Record<string, string>;
  quantity: number;
  line_total: number;
  /** Omitted on customer cart responses */
  line_commission?: number;
}

export interface Cart {
  id: string;
  customer_id?: string;
  guest_session_id?: string;
  partner_id?: string;
  affiliate_link_id?: string;
  items: CartItem[];
  subtotal: number;
  /** Omitted on customer cart responses — total equals subtotal for customers */
  total_commission?: number;
  total: number;
}

export interface AffiliateLink {
  id: string;
  type: "product" | "store";
  store_id: string;
  product_id?: string;
  code: string;
  link_url: string;
  clicks: number;
  is_active: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  examples: string[];
}

export interface OrderItem {
  product_id: string;
  name: string;
  unit: string;
  price: number;
  /** Present for merchant/partner; omitted for customer-facing payloads */
  commission?: number;
  quantity: number;
  line_total: number;
  image?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  store_id: string;
  merchant_id: string;
  store_name: string;
  items: OrderItem[];
  subtotal: number;
  /** Partner share — merchant/partner APIs only */
  total_commission?: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_tx_ref?: string;
  delivery_fee?: number;
  fez_base_delivery_cost?: number;
  delivery_method?: DeliveryMethod;
  locker_id?: string;
  locker_address?: string;
  recipient_phone?: string;
  recipient_address?: string;
  recipient_state?: string;
  city?: string;
  country?: string;
  fez_order_no?: string;
  waybill_number?: string;
  delivery_status?: string;
  partner_id?: string;
  created_at?: string;
  createdAt?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  owner_role: Role;
  balance: number;
  pending_balance: number;
  currency: string;
  status: string;
}

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  category: string;
  amount: number;
  balance_after: number;
  currency: string;
  status: string;
  reference: string;
  order_id?: string;
  description?: string;
  created_at?: string;
  createdAt?: string;
}

export interface PaymentRecord {
  id: string;
  tx_ref: string;
  customer_id: string;
  order_ids: string[];
  amount: number;
  delivery_fee_total: number;
  currency: string;
  status: PaymentStatus;
  customer_email?: string;
  flutterwave_flw_ref?: string;
}

export interface FezState {
  name?: string;
  code?: string;
  id?: string | number;
  [key: string]: unknown;
}

export interface FezTrackingResponse {
  [key: string]: unknown;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  order_id?: string;
  payment_tx_ref?: string;
  data?: Record<string, unknown>;
  read_at?: string | null;
  createdAt?: string;
  created_at?: string;
}

export interface TrackingOrder {
  id: string;
  store_name: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  delivery_status?: string;
  delivery_method?: DeliveryMethod;
  locker_id?: string;
  locker_address?: string;
  fez_order_no?: string;
  waybill_number?: string;
  recipient_state?: string;
  order_cost: number;
  delivery_fee: number;
  total: number;
  created_at?: string;
  fez_tracking?: unknown;
}

export interface CheckoutResponse {
  message: string;
  pricing: {
    order_cost: number;
    delivery_fee_total: number;
    total: number;
  };
  orders: Array<
    Order & {
      order_cost: number;
      delivery_fee: number;
      fez_base_delivery_cost?: number;
      total: number;
    }
  >;
  user: { id: string; email: string; first_name: string; last_name: string };
  payment: {
    payment: {
      id: string;
      tx_ref: string;
      order_cost: number;
      delivery_fee_total: number;
      amount: number;
      currency: string;
      status: string;
    };
    flutterwave: {
      status?: string;
      message?: string;
      data?: {
        link?: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
  };
}
