// lib/types.ts

import { LucideIcon } from "lucide-react";
import { Config } from "ziggy-js";

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon | null;
  isActive?: boolean;
}

export interface SharedData {
  name: string;
  quote: { message: string; author: string };
  auth: User;
  ziggy: Config & { location: string };
  [key: string]: unknown;
}

// Base Product Interface
// lib/types.ts

export enum ProductType {
  TIRE = "tire",
  BALE = "bale"
}

export enum ProductGrade {
  A = "A",
  B = "B",
  C = "C"
}

// Form data type (without id - used for creating/updating)
export type ProductFormData = {
  product_name: string;
  product_price: number;
  product_quantity: number;
  category: string;
  product_type: ProductType;
  commodity: string;
  branch_ids: string[];
  grade: "A" | "B" | "C";
  // Tire fields
  tire_size?: string;
  tire_type?: string;
  load_index?: string;
  speed_rating?: string;
  warranty_period?: string;
  // Bale fields
  bale_weight?: number;
  bale_category?: string;
  origin_country?: string;
  import_date?: Date;
  bale_count?: number;
};

// Full Product type (with id - used for database records)
export type Product = ProductFormData & {
  id: string;
  created_at?: Date | string;
  updated_at?: Date | string;
};

// Initial data type for editing
export type InitialData = {
  product_name: string;
  product_price: number;
  product_quantity: number;
  category: string;
  product_type: ProductType;
  commodity: string;
  branch_ids: string[];
  grade: "A" | "B" | "C";
  // Tire fields
  tire_size?: string;
  tire_type?: string;
  load_index?: string;
  speed_rating?: string; 
  warranty_period?: string;
  // Bale fields
  bale_weight?: number;
  bale_category?: string;
  origin_country?: string;
  import_date?: string; // Note: string for initial data, Date for form
  bale_count?: number;
};


// Cart Item Interface
export interface CartItem {
  id: string;
  product: {
    id: string;
    product_name: string;
    product_price: number;
    product_quantity: number;
  };
  quantity: number;
  discount?: number; // Keep item-level discount
}

export interface PaymentFormData {
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    discount: number; // Keep item-level discount
    subtotal: number;
  }>;
  total_amount: number;
  branch_id: string;
  cashier_id: string;
  payment_method: "mobile" | "cash" | "card";
  amount_received: number;
  change_amount: number;
  payment_reference: string;
}


// Web Serial API types
export interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream;
  writable: WritableStream;
}

export interface Navigator {
  serial: {
    requestPort(): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  };
}

// Order Item Interface
export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  discount: number; // Keep item-level discount
  subtotal: number;
  product: {
    product_name: string;
  };
}

// Branch Interface
export type Branch = {
  id: string;
  branch_name: string;
  branch_location: string;
};

// Base User Interface
export interface User {
  _id: string; // MongoDB ID as string
  first_name: string;
  last_name: string;
  phone_number?: string;
  email: string;
  password: string;
  role: "Cashier" | "Manager" | "Admin";
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  image?: string; // For avatar/image
}

// Employee Interface - Updated to include both branch_id and branch object
export interface Employee extends User {
  id: string;
  branch_id?: string;
  position?: string;
  // Add branch object for populated data
  branch?: {
    _id: string;
    branch_name: string;
    branch_location: string;
  };
}

export interface Order {
  order_date: string | number | Date;
  createdAt: string | number | Date;
  id: string;
  items: OrderItem[]
  subtotal: number;
  total: number;
  branch: {
    name: string;
    location: string;
  };
  cashier: {
    name: string;
  };
  payment_method: string;
  amount_received: number;
  change_amount: number;
  payment_reference?: string;
  status: string;
}
// Updated Receipt interface to match actual usage
export interface Receipt {
  id: string;
  date: Date | string;
  items: {
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
    discount?: number; // Keep item-level discount
  }[];
  subtotal: number;
  // Remove order-level discount
  total: number;
  cashier: string;
  branch: string;
  payment_method: string;
  amount_received: number;
  change_amount: number;
  payment_reference?: string;
}

// Payment Form Data Interface
export type PaymentMethodType = "mobile" | "cash" | "card";

// Cart Totals Interface
export interface CartTotals {
  subtotal: number;
  totalDiscount: number; // This will be calculated from item discounts
  total: number;
}
// POS Context Interface
export interface PosContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productid: string) => void;
  updateQuantity: (productid: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotals: () => CartTotals;
}

// Component Props Interfaces
export interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (receiptData: Receipt) => void;
  branchId: string;
  cashierId: string;
  branchName: string;
  branchLocation: string;
  cashierName: string;
}

export interface ProductListProps {
  products: Product[];
  branchName: string;
  user: User;
}

export interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export interface ReceiptDialogProps {
  order: Order | null;
  branchName: string;
  cashierName: string;
}

// Filter Types
export type PaymentMethod = 'Cash' | 'Card' | 'Mobile';
export type ProductCategory = 'All' | 'Car Tyres' | '4*4 Tyres' | 'Truck Tyres';
export type ProductCommodity = 'All' | 'New Tyre' | 'Used Tyre';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Error Types
export interface ValidationErrors {
  [key: string]: string | string[];
}

export interface ApiError {
  message: string;
  errors?: ValidationErrors;
}

export interface PageProps {
  filtered_products?: Product[];
  auth: {
    user: User;
  };
  employee?: Employee;
  branches: Branch[];
  requires_branch_selection?: boolean;
}

export interface DashboardPageProps {
  products: number;
  employees: number;
  branches: number;
  orders: number;
  chartData: Array<{
    month: string;
    cash: number;
    card: number;
    mobile_money: number;
    bank_transfer: number;
    total: number;
  }>;
  period: string;
  previousPeriodProducts: number;
  previousPeriodEmployees: number;
  previousPeriodBranches: number;
  previousPeriodOrders: number;
  branchName: string;
  auth: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
  employee?: {
    branch_id: string;
    branch_name: string;
  };

}