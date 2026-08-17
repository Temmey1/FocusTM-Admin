export interface Product {
  id: string; slug: string; name: string; description: string; price: number;
  images: string[]; category: "tops"|"shirts"|"caps"|"wears";
  sizes: string[]; colors: string[]; customizable: boolean; stock: number; featured?: boolean;
}
export type OrderStatus = "pending"|"paid"|"processing"|"shipped"|"completed"|"cancelled";
export interface Order {
  id: string; orderNumber: string;
  items: { productId: string; name: string; price: number; quantity: number; size: string; color: string; customNote?: string }[];
  subtotal: number; deliveryFee: number; total: number;
  delivery: { fullName: string; phone: string; email?: string; method: string; state: string; city: string; address?: string; note?: string };
  paymentMethod: "whatsapp"|"monnify"; status: OrderStatus;
  createdAt: string; userId?: string|null;
}
export interface AdminStats {
  totalOrders: number; pendingOrders: number; totalProducts: number;
  revenueThisMonth: number; revenueAllTime: number;
}
export interface DeliveryLocation {
  id: string; type: "delivery"|"pickup"; state: string; city?: string;
  address?: string; fee: number; active: boolean; note?: string;
}
export interface AdminUser {
  uid: string; email: string|null; phoneNumber: string|null; displayName: string|null;
  createdAt: string; lastSignInAt: string; admin: boolean;
}
export type CustomOrderStatus = "new"|"reviewing"|"quoted"|"in_progress"|"completed"|"declined";
export interface CustomOrder {
  id: string; requestNumber: string; fullName: string; phone: string; email?: string;
  itemType: string; description: string; budget?: string; referenceImages: string[];
  status: CustomOrderStatus; userId?: string|null; adminNote?: string; createdAt: string;
}
