
export enum TransactionType {
  PURCHASE = 'PURCHASE', // ទិញចូល
  SALE = 'SALE',          // លក់ចេញ
  OTHER_OUT = 'OTHER_OUT', // កាត់ស្តុកផ្សេងៗ (មិនមែនលក់)
  PURCHASE_ORDER = 'PURCHASE_ORDER' // បញ្ជាទិញ (មិនទាន់កាត់ស្តុក)
}

export enum UserRole {
  ADMIN = 'ADMIN',      // អ្នកគ្រប់គ្រង
  STAFF = 'STAFF'       // បុគ្គលិក
}

export interface UserPermissions {
  dashboard: boolean;
  inventory: boolean;
  stockIn: boolean;
  stockOut: boolean;
  otherStockOut: boolean; // សិទ្ធិកាត់ស្តុកផ្សេងៗ
  expenses: boolean;
  reports: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  permissions: UserPermissions;
  createdAt?: string; // ISO string
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  purchasePrice: number;
  salePrice: number;
  unit: string;
  lowStockThreshold?: number; // កម្រិតស្តុកទាបសម្រាប់ផលិតផលនីមួយៗ
  batchNumber?: string; // លេខឡូតិ៍
  expiryDate?: string;  // ថ្ងៃផុតកំណត់ (ISO string or YYYY-MM-DD)
  createdAt?: string; // ISO string
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status?: 'Pending' | 'Received' | 'Cancelled'; // ស្ថានភាពសម្រាប់ Purchase Orders
  date: string; // ISO string
  dueDate?: string; // ថ្ងៃកំណត់បង់ប្រាក់
  items: TransactionItem[];
  subTotal: number; // តម្លៃសរុបមុនបញ្ចុះតម្លៃ
  discountType?: 'percentage' | 'fixed'; // ប្រភេទបញ្ចុះតម្លៃ
  discountValue?: number; // តម្លៃលេខដែលបញ្ជាក់ (ឧ. 10 សម្រាប់ 10%)
  discountAmount: number; // ចំនួនទឹកប្រាក់ដែលបានបញ្ចុះសរុប
  taxRate?: number; // អត្រាពន្ធ (%)
  taxAmount?: number; // ចំនួនទឹកប្រាក់ពន្ធសរុប
  totalAmount: number; // តម្លៃសរុបចុងក្រោយ
  customerOrSupplierName: string;
  note?: string; // បញ្ជាក់មូលហេតុសម្រាប់ការកាត់ស្តុកផ្សេងៗ
  createdBy?: string; // អ្នកដែលបានធ្វើប្រតិបត្តិការ
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  invoiceNumber?: string; // លេខវិក្កយបត្រ ឬលេខឡូតិ៍យោង
  note?: string; // កំណត់សម្គាល់បន្ថែម
}

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string; // Base64 or URL
  currencySymbol: string; // $, ៛, KHR, etc.
  currencyPosition: 'prefix' | 'suffix';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  module: 'Inventory' | 'Transactions' | 'Expenses' | 'Users' | 'Settings';
  timestamp: string;
}
