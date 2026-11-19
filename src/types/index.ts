export type UserRole = 'owner' | 'manager' | 'staff';

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: UserRole;
  businessId?: string;
  avatarUrl?: string;
}

export type BusinessType =
  | 'Supermarket'
  | 'Grocery shop'
  | 'Provision shop'
  | 'Retail store'
  | 'Pharmacy'
  | 'Wholesale shop'
  | 'Other';

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  phoneNumber: string;
  email?: string;
  country: string;
  region: string;
  city: string;
  address?: string;
  logoUrl?: string;
  currency: string;
  currencyCode: string;
  createdAt: string;
}

export type ExpiryStatus =
  | 'NOT_EXPIRED'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'EXPIRY_DATE_UNKNOWN';

export interface ProductBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate?: string; // YYYY-MM-DD
  manufacturingDate?: string; // YYYY-MM-DD
  receivedDate?: string;
  supplier?: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  barcode?: string;
  quantity: number;
  unit: string;
  buyingPrice: number;
  sellingPrice: number;
  lowStockThreshold: number;
  imageUrl?: string;
  expiryDate?: string; // Primary/Earliest recorded expiry date (YYYY-MM-DD)
  manufacturingDate?: string; // Optional manufacturing date (YYYY-MM-DD)
  batches?: ProductBatch[]; // Multi-batch support for products with different expiry dates
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = 'add' | 'remove' | 'adjustment' | 'sale';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  previousQuantity: number;
  quantityChange: number;
  newQuantity: number;
  reason: string;
  notes?: string;
  supplier?: string;
  buyingPrice?: number;
  employeeName: string;
  employeeId: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'momo' | 'card' | 'other';

export interface Sale {
  id: string;
  receiptNumber: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentNotes?: string;
  soldBy: string;
  soldById: string;
  createdAt: string;
}

export interface EmployeePermissions {
  canManageInventory: boolean;
  canAddStock: boolean;
  canRemoveStock: boolean;
  canRecordSales: boolean;
  canViewReports: boolean;
  canManageEmployees: boolean;
  canChangeSettings: boolean;
}

export interface Employee {
  id: string;
  name: string;
  contact: string;
  role: UserRole;
  permissions: EmployeePermissions;
  status: 'active' | 'invited' | 'disabled';
  createdAt: string;
}

export type NotificationCategory =
  | 'low_stock'
  | 'out_of_stock'
  | 'stock_update'
  | 'sale'
  | 'employee'
  | 'sync'
  | 'expiry_warning'
  | 'expired';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  read: boolean;
  createdAt: string;
}

export type ConnectionStatus = 'online' | 'offline' | 'syncing';

export interface PendingChange {
  id: string;
  entityType: 'product' | 'stock_movement' | 'sale' | 'employee';
  action: 'create' | 'update' | 'delete';
  description: string;
  timestamp: string;
  payload: any;
}

export interface ConflictField {
  fieldName: string;
  serverVal: string | number;
  localVal: string | number;
}

export interface ConflictItem {
  id: string;
  entityType: 'product';
  entityId: string;
  entityName: string;
  serverValue: Record<string, any>;
  localValue: Record<string, any>;
  updatedBy: string;
  updatedAt: string;
  fields: ConflictField[];
}

export interface SyncState {
  connectionStatus: ConnectionStatus;
  lastSyncTime: string | null;
  pendingChanges: PendingChange[];
  conflictItems: ConflictItem[];
}

export type AppThemeId =
  | 'emerald'
  | 'glass_ios27'
  | 'midnight'
  | 'nordic'
  | 'champagne'
  | 'cyberpunk';

export interface ThemeConfig {
  id: AppThemeId;
  name: string;
  tagline: string;
  description: string;
  badge?: string;
  isGlass?: boolean;
  isDark?: boolean;
  colors: {
    background: string;
    card: string;
    cardBorder: string;
    text: string;
    textMuted: string;
    primary: string;
    primaryGradient: [string, string, ...string[]];
    accent: string;
    highlight: string;
  };
  previewColors: string[];
}

export interface UserSettings {
  currency: string;
  currencyCode: string;
  theme: 'light' | 'dark';
  activeTheme?: AppThemeId;
  notificationsEnabled: boolean;
  lowStockAlerts: boolean;
  offlineSyncInterval: string;
  defaultMeasurementUnit: string;
}
