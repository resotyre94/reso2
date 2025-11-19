
export enum CustomerCategory {
  INDIVIDUAL = 'Individual',
  GROUP = 'Group',
  CASH = 'Cash',
}

export enum PriceClass {
  A = 'A',
  B = 'B',
  C = 'C',
}

export interface User {
  username: string;
  password?: string;
  role: 'Admin' | 'Staff';
  name: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  active: boolean;
  blockReason?: string; // Explanation if blocked
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  active: boolean;
  category: CustomerCategory;
  creditLimitDays: number;
  blockReason?: string; // Explanation if blocked
}

export interface Item {
  id: string;
  code: string;
  name: string;
  barcode: string;
  shortName: string;
  supplierId: string;
  priceA: number;
  priceB: number;
  priceC: number;
  minStock: number;
  alertEnabled: boolean;
}

export interface PurchaseItem {
  itemId: string;
  description: string;
  quantity: number;
  amount: number;
  gstRate: number; // Changed from boolean to number (default 18)
  total: number;
}

export interface Purchase {
  id: string;
  transactionNo: string;
  supplierId: string;
  docNo: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
  createdBy: string;
  createdAt: number;
  
  // New Payment Fields
  paymentStatus: 'Full' | 'Part' | 'Credit';
  paidAmount: number;
  balanceAmount: number;
  notes: string;
}

export interface SaleItem {
  mode: 'Service' | 'Stock';
  itemId?: string;
  serviceName?: string;
  description: string;
  quantity: number;
  price: number;
  gstRate: number; // Changed from boolean to number
  total: number;
}

export interface Sale {
  id: string;
  transactionNo: string;
  date: string;
  customerCategory: CustomerCategory;
  vehicleNo: string;
  contactNo: string;
  priceClass: PriceClass;
  items: SaleItem[];
  totalAmount: number;
  createdBy: string;
  createdAt: number;

  // New Payment Fields
  paymentStatus: 'Received' | 'Part' | 'Credit';
  receivedAmount: number;
  balanceAmount: number;
  notes: string;
}

export interface UtilityBill {
  id: string;
  category: string; // Changed to string to allow custom categories
  date: string;
  amount: number;
  description: string;
  createdBy: string;
  timestamp: number;
}

export interface Partner {
  id: string;
  name: string;
  contribution: number;
  startDate: string;
}

export interface AppState {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  companyLogo: string | null;
  companyName: string;
  companyAddress: string;
  suppliers: Supplier[];
  customers: Customer[];
  items: Item[];
  purchases: Purchase[];
  sales: Sale[];
  utilities: UtilityBill[];
  partners: Partner[];
  totalBudget: number;
  
  // Navigation State
  activeTab: string;
  redirectAfterSave: string | null; // For "Create New" flow
  editTransactionId: string | null; // For "Edit from DayBook" flow
}

export const INITIAL_STATE: AppState = {
  isAuthenticated: false,
  currentUser: null,
  users: [],
  companyLogo: null,
  companyName: 'ALI Inventory System',
  companyAddress: 'Doha, Qatar',
  suppliers: [],
  customers: [],
  items: [],
  purchases: [],
  sales: [],
  utilities: [],
  partners: [],
  totalBudget: 0,
  activeTab: 'dashboard',
  redirectAfterSave: null,
  editTransactionId: null
};
