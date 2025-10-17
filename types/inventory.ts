// types/inventory.ts
export enum ProductCategory {
  CLOTHING = 'clothing',
  ACCESSORIES = 'accessories',
  SHOES = 'shoes',
  ELECTRONICS = 'electronics',
  HOME = 'home',
  BEAUTY = 'beauty',
  SPORTS = 'sports',
  BOOKS = 'books',
  FOOD = 'food',
  OTHER = 'other'
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  OUT_OF_STOCK = 'out_of_stock'
}

export interface ProductVariant {
  _id?: string;
  name: string; // e.g., "Talla M", "Color Rojo"
  value: string; // e.g., "M", "Rojo"
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images?: string[];
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: ProductCategory;
  brand?: string;
  status: ProductStatus;
  basePrice: number;
  baseCost: number;
  sku: string;
  barcode?: string;
  variants: ProductVariant[];
  images: string[];
  tags: string[];
  specifications?: Record<string, any>;
  supplier?: {
    name: string;
    contact: string;
    email?: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface InventoryMovement {
  _id: string;
  productId: string;
  variantId?: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reason: string;
  reference?: string; // Order ID, Transfer ID, etc.
  location?: string;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

export interface StockAlert {
  _id: string;
  productId: string;
  variantId?: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock';
  currentStock: number;
  threshold: number;
  isResolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface ProductFilter {
  category?: ProductCategory[];
  status?: ProductStatus[];
  brand?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  tags?: string[];
  search?: string;
}

export interface InventoryReport {
  totalProducts: number;
  totalVariants: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categoryBreakdown: {
    category: ProductCategory;
    count: number;
    value: number;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }[];
}
