// types/sales.ts
export enum SaleStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet',
  CHECK = 'check',
  OTHER = 'other'
}

export interface SaleItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  subtotal: number;
  tax?: number;
  total: number;
}

export interface Sale {
  _id: string;
  saleNumber: string;
  customerId?: string;
  customerInfo?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'failed';
  status: SaleStatus;
  notes?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface SaleFilter {
  status?: SaleStatus[];
  paymentMethod?: PaymentMethod[];
  paymentStatus?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  customerId?: string;
  createdBy?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  averageOrderValue: number;
  totalOrders: number;
  period: {
    start: Date;
    end: Date;
  };
  dailySales: {
    date: string;
    sales: number;
    revenue: number;
    orders: number;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }[];
  topCustomers: {
    customerId: string;
    customerName: string;
    totalSpent: number;
    orders: number;
  }[];
  paymentMethodBreakdown: {
    method: PaymentMethod;
    count: number;
    amount: number;
    percentage: number;
  }[];
}
