import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Business,
  User,
  Product,
  ProductBatch,
  StockMovement,
  Sale,
  Employee,
  NotificationItem,
  SyncState,
  PendingChange,
  ConflictItem,
  UserSettings,
  ConnectionStatus,
} from '../types';
import { calculateExpiryStatus } from '../utils/expiry';

const STORAGE_KEYS = {
  USER: '@stockwise_user',
  BUSINESS: '@stockwise_business',
  IS_ONBOARDED: '@stockwise_is_onboarded',
  PRODUCTS: '@stockwise_products',
  STOCK_MOVEMENTS: '@stockwise_stock_movements',
  SALES: '@stockwise_sales',
  EMPLOYEES: '@stockwise_employees',
  NOTIFICATIONS: '@stockwise_notifications',
  SETTINGS: '@stockwise_settings',
  SYNC_STATE: '@stockwise_sync_state',
};

interface AppContextType {
  // User & Business
  user: User | null;
  business: Business | null;
  setUser: (user: User | null) => void;
  setBusiness: (business: Business | null) => void;
  updateBusiness: (updates: Partial<Business>) => void;
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;

  // Products & Inventory
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  deleteProducts: (ids: string[]) => void;
  getProductById: (id: string) => Product | undefined;
  getProductByBarcode: (barcode: string) => Product | undefined;
  updateProductExpiry: (productId: string, expiryDate?: string, manufacturingDate?: string) => void;
  addBatchToProduct: (productId: string, batch: Omit<ProductBatch, 'id'>) => void;

  // Stock Management
  stockMovements: StockMovement[];
  addStock: (params: {
    productId: string;
    quantity: number;
    buyingPrice?: number;
    supplier?: string;
    notes?: string;
    expiryDate?: string;
    batchNumber?: string;
    manufacturingDate?: string;
  }) => void;
  removeStock: (params: {
    productId: string;
    quantity: number;
    reason: string;
    notes?: string;
    batchId?: string;
  }) => void;
  recordExpiredStock: (params: {
    productId: string;
    quantity: number;
    notes?: string;
    batchId?: string;
  }) => void;
  adjustStock: (params: {
    productId: string;
    newQuantity: number;
    reason: string;
    notes?: string;
  }) => void;

  // Sales Management
  sales: Sale[];
  recordSale: (saleData: {
    items: Array<{ productId: string; quantity: number }>;
    discount: number;
    paymentMethod: 'cash' | 'momo' | 'card' | 'other';
    paymentNotes?: string;
  }) => Sale | null;

  // Employee Management
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Offline & Synchronization
  syncState: SyncState;
  setConnectionStatus: (status: ConnectionStatus) => void;
  triggerManualSync: () => void;
  resolveConflict: (conflictId: string, resolution: 'keep_local' | 'accept_server') => void;
  addSampleConflictForUIPreview: () => void;

  // Settings
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

const defaultSettings: UserSettings = {
  currency: 'GH₵',
  currencyCode: 'GHS',
  theme: 'light',
  notificationsEnabled: true,
  lowStockAlerts: true,
  offlineSyncInterval: '15 mins',
  defaultMeasurementUnit: 'pcs',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // STRICT NO-MOCK-DATA: All business arrays start empty
  const [user, setUserState] = useState<User | null>(null);
  const [business, setBusinessState] = useState<Business | null>(null);
  const [isOnboarded, setIsOnboardedState] = useState<boolean>(false);

  const [products, setProductsState] = useState<Product[]>([]);
  const [stockMovements, setStockMovementsState] = useState<StockMovement[]>([]);
  const [sales, setSalesState] = useState<Sale[]>([]);
  const [employees, setEmployeesState] = useState<Employee[]>([]);
  const [notifications, setNotificationsState] = useState<NotificationItem[]>([]);

  const [syncState, setSyncState] = useState<SyncState>({
    connectionStatus: 'online',
    lastSyncTime: null,
    pendingChanges: [],
    conflictItems: [],
  });

  const [settings, setSettingsState] = useState<UserSettings>(defaultSettings);
  const isHydratedRef = useRef(false);

  // Load persisted state from AsyncStorage on application mount
  useEffect(() => {
    const hydrateState = async () => {
      try {
        const [
          storedUser,
          storedBusiness,
          storedOnboarded,
          storedProducts,
          storedMovements,
          storedSales,
          storedEmployees,
          storedNotifications,
          storedSettings,
          storedSync,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.BUSINESS),
          AsyncStorage.getItem(STORAGE_KEYS.IS_ONBOARDED),
          AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS),
          AsyncStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS),
          AsyncStorage.getItem(STORAGE_KEYS.SALES),
          AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEES),
          AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.SYNC_STATE),
        ]);

        if (storedUser) setUserState(JSON.parse(storedUser));
        if (storedBusiness) setBusinessState(JSON.parse(storedBusiness));
        if (storedOnboarded !== null) setIsOnboardedState(JSON.parse(storedOnboarded));
        if (storedProducts) setProductsState(JSON.parse(storedProducts));
        if (storedMovements) setStockMovementsState(JSON.parse(storedMovements));
        if (storedSales) setSalesState(JSON.parse(storedSales));
        if (storedEmployees) setEmployeesState(JSON.parse(storedEmployees));
        if (storedNotifications) setNotificationsState(JSON.parse(storedNotifications));
        if (storedSettings) setSettingsState(JSON.parse(storedSettings));
        if (storedSync) {
          const parsed = JSON.parse(storedSync);
          setSyncState((prev) => ({ ...prev, ...parsed }));
        }
      } catch (err) {
        console.warn('Failed to load local stored data:', err);
      } finally {
        isHydratedRef.current = true;
      }
    };

    hydrateState();
  }, []);

  // Setters with persistent storage
  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser)).catch(() => {});
  };

  const setBusiness = (newBusiness: Business | null) => {
    setBusinessState(newBusiness);
    AsyncStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(newBusiness)).catch(() => {});
  };

  const setIsOnboarded = (val: boolean) => {
    setIsOnboardedState(val);
    AsyncStorage.setItem(STORAGE_KEYS.IS_ONBOARDED, JSON.stringify(val)).catch(() => {});
  };

  const setProducts = (updater: React.SetStateAction<Product[]>) => {
    setProductsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const setStockMovements = (updater: React.SetStateAction<StockMovement[]>) => {
    setStockMovementsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const setSales = (updater: React.SetStateAction<Sale[]>) => {
    setSalesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const setEmployees = (updater: React.SetStateAction<Employee[]>) => {
    setEmployeesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const setNotifications = (updater: React.SetStateAction<NotificationItem[]>) => {
    setNotificationsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  // Helper to record a pending change if offline
  const recordPendingChange = (
    entityType: PendingChange['entityType'],
    action: PendingChange['action'],
    description: string,
    payload: any
  ) => {
    if (syncState.connectionStatus === 'offline') {
      const change: PendingChange = {
        id: `pending-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        entityType,
        action,
        description,
        timestamp: new Date().toISOString(),
        payload,
      };
      setSyncState((prev) => {
        const next = {
          ...prev,
          pendingChanges: [change, ...prev.pendingChanges],
        };
        AsyncStorage.setItem(STORAGE_KEYS.SYNC_STATE, JSON.stringify(next)).catch(() => {});
        return next;
      });
    }
  };

  // Helper to create notification
  const addNotification = (
    title: string,
    message: string,
    category: NotificationItem['category']
  ) => {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      category,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Business Actions
  const updateBusiness = (updates: Partial<Business>) => {
    setBusinessState((prev) => {
      const next = prev ? { ...prev, ...updates } : null;
      AsyncStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(next)).catch(() => {});
      return next;
    });
    recordPendingChange('product', 'update', `Updated business profile`, updates);
  };

  // Product Actions
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Record initial stock movement if quantity > 0
    if (newProduct.quantity > 0) {
      const movement: StockMovement = {
        id: `move-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'add',
        previousQuantity: 0,
        quantityChange: newProduct.quantity,
        newQuantity: newProduct.quantity,
        reason: 'Initial Inventory Entry',
        buyingPrice: newProduct.buyingPrice,
        employeeName: user?.fullName || 'Business Owner',
        employeeId: user?.id || 'owner-1',
        createdAt: now,
      };
      setStockMovements((prev) => [movement, ...prev]);
    }

    // Check low stock on creation
    if (newProduct.quantity === 0) {
      addNotification(
        'Out of Stock Alert',
        `${newProduct.name} was added with 0 quantity.`,
        'out_of_stock'
      );
    } else if (newProduct.quantity <= newProduct.lowStockThreshold) {
      addNotification(
        'Low Stock Warning',
        `${newProduct.name} is at or below threshold (${newProduct.quantity} ${newProduct.unit}).`,
        'low_stock'
      );
    }

    // Check expiry status on creation
    if (newProduct.expiryDate) {
      const expCalc = calculateExpiryStatus(newProduct.expiryDate);
      if (expCalc.isExpired) {
        addNotification(
          'Expired Product Added',
          `WARNING: ${newProduct.name} was added with an expired date (${newProduct.expiryDate}). Do not sell it.`,
          'expired'
        );
      } else if (expCalc.isExpiringSoon) {
        addNotification(
          'Expiry Warning',
          `${newProduct.name} expires soon (${expCalc.label}).`,
          'expiry_warning'
        );
      }
    }

    recordPendingChange('product', 'create', `Added product: ${newProduct.name}`, newProduct);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString();
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: now } : item))
    );
    recordPendingChange('product', 'update', `Updated product: ${id}`, updates);
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((item) => item.id !== id));
    recordPendingChange('product', 'delete', `Deleted product: ${target?.name || id}`, { id });
  };

  const deleteProducts = (ids: string[]) => {
    if (ids.length === 0) return;
    setProducts((prev) => prev.filter((item) => !ids.includes(item.id)));
    recordPendingChange('product', 'delete', `Bulk deleted ${ids.length} products`, { ids });
    addNotification('Products Deleted', `${ids.length} products were deleted from inventory.`, 'stock_update');
  };

  const getProductById = (id: string) => products.find((p) => p.id === id);

  const getProductByBarcode = (barcode: string) => {
    if (!barcode || !barcode.trim()) return undefined;
    const clean = barcode.trim();
    return products.find(
      (p) => p.barcode?.trim() === clean || p.sku.trim().toLowerCase() === clean.toLowerCase()
    );
  };

  const updateProductExpiry = (productId: string, expiryDate?: string, manufacturingDate?: string) => {
    const now = new Date().toISOString();
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              expiryDate: expiryDate?.trim() || undefined,
              manufacturingDate: manufacturingDate?.trim() || undefined,
              updatedAt: now,
            }
          : p
      )
    );
    recordPendingChange('product', 'update', `Updated expiry for product: ${productId}`, {
      expiryDate,
      manufacturingDate,
    });
  };

  const addBatchToProduct = (productId: string, batchData: Omit<ProductBatch, 'id'>) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const newBatch: ProductBatch = {
      ...batchData,
      id: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    const existingBatches = target.batches || [];
    const updatedBatches = [...existingBatches, newBatch];

    // Recalculate earliest expiry
    const datesWithExpiry = updatedBatches
      .map((b) => b.expiryDate)
      .filter(Boolean) as string[];
    const earliestExpiry =
      datesWithExpiry.length > 0 ? datesWithExpiry.sort()[0] : target.expiryDate;

    updateProduct(productId, {
      batches: updatedBatches,
      expiryDate: earliestExpiry,
    });
  };

  // Stock Actions
  const addStock = ({
    productId,
    quantity,
    buyingPrice,
    supplier,
    notes,
    expiryDate,
    batchNumber,
    manufacturingDate,
  }: {
    productId: string;
    quantity: number;
    buyingPrice?: number;
    supplier?: string;
    notes?: string;
    expiryDate?: string;
    batchNumber?: string;
    manufacturingDate?: string;
  }) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const previousQuantity = target.quantity;
    const newQuantity = previousQuantity + quantity;
    const now = new Date().toISOString();

    // If batch information was provided, record batch
    let updatedBatches = target.batches || [];
    if (batchNumber || expiryDate) {
      const newBatch: ProductBatch = {
        id: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        batchNumber: batchNumber?.trim() || `B-${Date.now().toString().slice(-4)}`,
        quantity,
        expiryDate: expiryDate?.trim() || undefined,
        manufacturingDate: manufacturingDate?.trim() || undefined,
        receivedDate: now.split('T')[0],
        supplier,
        notes,
      };
      updatedBatches = [...updatedBatches, newBatch];
    }

    const earliestExpiry =
      expiryDate && (!target.expiryDate || expiryDate < target.expiryDate)
        ? expiryDate
        : target.expiryDate;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              quantity: newQuantity,
              batches: updatedBatches.length > 0 ? updatedBatches : p.batches,
              expiryDate: earliestExpiry,
              updatedAt: now,
            }
          : p
      )
    );

    const movement: StockMovement = {
      id: `move-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId,
      productName: target.name,
      type: 'add',
      previousQuantity,
      quantityChange: quantity,
      newQuantity,
      reason: 'Stock Purchase / Restock',
      buyingPrice: buyingPrice ?? target.buyingPrice,
      supplier,
      notes: notes
        ? `${notes}${batchNumber ? ` (Batch ${batchNumber})` : ''}`
        : batchNumber
        ? `Batch ${batchNumber}`
        : undefined,
      employeeName: user?.fullName || 'Business Owner',
      employeeId: user?.id || 'owner-1',
      createdAt: now,
    };
    setStockMovements((prev) => [movement, ...prev]);

    addNotification(
      'Stock Received',
      `Added ${quantity} ${target.unit} to ${target.name}. New total: ${newQuantity}`,
      'stock_update'
    );

    recordPendingChange(
      'stock_movement',
      'create',
      `Restocked ${quantity} ${target.unit} of ${target.name}`,
      movement
    );
  };

  const removeStock = ({
    productId,
    quantity,
    reason,
    notes,
    batchId,
  }: {
    productId: string;
    quantity: number;
    reason: string;
    notes?: string;
    batchId?: string;
  }) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const previousQuantity = target.quantity;
    const newQuantity = Math.max(0, previousQuantity - quantity);
    const actualReduction = previousQuantity - newQuantity;
    const now = new Date().toISOString();

    // If batch was specified, reduce that batch's quantity
    let updatedBatches = target.batches;
    if (batchId && target.batches) {
      updatedBatches = target.batches
        .map((b) => (b.id === batchId ? { ...b, quantity: Math.max(0, b.quantity - actualReduction) } : b))
        .filter((b) => b.quantity > 0);
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              quantity: newQuantity,
              batches: updatedBatches,
              updatedAt: now,
            }
          : p
      )
    );

    const movement: StockMovement = {
      id: `move-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId,
      productName: target.name,
      type: 'remove',
      previousQuantity,
      quantityChange: -actualReduction,
      newQuantity,
      reason,
      notes,
      employeeName: user?.fullName || 'Business Owner',
      employeeId: user?.id || 'owner-1',
      createdAt: now,
    };
    setStockMovements((prev) => [movement, ...prev]);

    if (newQuantity === 0) {
      addNotification(
        'Out of Stock Alert',
        `${target.name} is now completely out of stock.`,
        'out_of_stock'
      );
    } else if (newQuantity <= target.lowStockThreshold) {
      addNotification(
        'Low Stock Warning',
        `${target.name} has fallen below threshold to ${newQuantity} ${target.unit}.`,
        'low_stock'
      );
    }

    recordPendingChange(
      'stock_movement',
      'create',
      `Removed ${actualReduction} ${target.unit} of ${target.name} (${reason})`,
      movement
    );
  };

  const recordExpiredStock = ({
    productId,
    quantity,
    notes,
    batchId,
  }: {
    productId: string;
    quantity: number;
    notes?: string;
    batchId?: string;
  }) => {
    removeStock({
      productId,
      quantity,
      reason: 'Expired products',
      notes: notes ? `Expired Stock: ${notes}` : 'Removed expired inventory',
      batchId,
    });
    addNotification('Expired Stock Recorded', `Removed ${quantity} expired units from inventory.`, 'expired');
  };

  const adjustStock = ({
    productId,
    newQuantity,
    reason,
    notes,
  }: {
    productId: string;
    newQuantity: number;
    reason: string;
    notes?: string;
  }) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const previousQuantity = target.quantity;
    const diff = newQuantity - previousQuantity;
    const now = new Date().toISOString();

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: newQuantity, updatedAt: now } : p))
    );

    const movement: StockMovement = {
      id: `move-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId,
      productName: target.name,
      type: 'adjustment',
      previousQuantity,
      quantityChange: diff,
      newQuantity,
      reason,
      notes,
      employeeName: user?.fullName || 'Business Owner',
      employeeId: user?.id || 'owner-1',
      createdAt: now,
    };
    setStockMovements((prev) => [movement, ...prev]);

    recordPendingChange(
      'stock_movement',
      'create',
      `Stock adjustment for ${target.name}: ${previousQuantity} → ${newQuantity} (${reason})`,
      movement
    );
  };

  // Sales Actions
  const recordSale = ({
    items,
    discount,
    paymentMethod,
    paymentNotes,
  }: {
    items: Array<{ productId: string; quantity: number }>;
    discount: number;
    paymentMethod: 'cash' | 'momo' | 'card' | 'other';
    paymentNotes?: string;
  }): Sale | null => {
    if (items.length === 0) return null;

    const saleItems = [];
    let subtotal = 0;
    const now = new Date().toISOString();

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      const itemSubtotal = product.sellingPrice * item.quantity;
      subtotal += itemSubtotal;

      saleItems.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.sellingPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });

      // Automatically reduce available stock
      const prevQty = product.quantity;
      const newQty = Math.max(0, prevQty - item.quantity);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, quantity: newQty, updatedAt: now } : p))
      );

      // Record stock movement for the sale
      const movement: StockMovement = {
        id: `move-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        productName: product.name,
        type: 'sale',
        previousQuantity: prevQty,
        quantityChange: -item.quantity,
        newQuantity: newQty,
        reason: 'Sale Transaction',
        employeeName: user?.fullName || 'Business Owner',
        employeeId: user?.id || 'owner-1',
        createdAt: now,
      };
      setStockMovements((prev) => [movement, ...prev]);

      if (newQty === 0) {
        addNotification(
          'Out of Stock Alert',
          `${product.name} is now out of stock following a sale.`,
          'out_of_stock'
        );
      } else if (newQty <= product.lowStockThreshold) {
        addNotification(
          'Low Stock Warning',
          `${product.name} is running low (${newQty} remaining).`,
          'low_stock'
        );
      }
    }

    const total = Math.max(0, subtotal - discount);
    const receiptNum = `REC-${Date.now().toString().slice(-6)}`;

    const newSale: Sale = {
      id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      receiptNumber: receiptNum,
      items: saleItems,
      subtotal,
      discount,
      total,
      paymentMethod,
      paymentNotes,
      soldBy: user?.fullName || 'Business Owner',
      soldById: user?.id || 'owner-1',
      createdAt: now,
    };

    setSales((prev) => [newSale, ...prev]);

    addNotification(
      'Sale Recorded',
      `${receiptNum} completed for ${settings.currency}${total.toFixed(2)} (${paymentMethod.toUpperCase()})`,
      'sale'
    );

    recordPendingChange('sale', 'create', `Recorded sale ${receiptNum}`, newSale);
    return newSale;
  };

  // Employee Actions
  const addEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt'>) => {
    const newEmp: Employee = {
      ...employeeData,
      id: `emp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setEmployees((prev) => [newEmp, ...prev]);
    addNotification('Employee Added', `${newEmp.name} was added as ${newEmp.role}.`, 'employee');
    recordPendingChange('employee', 'create', `Added employee ${newEmp.name}`, newEmp);
    return newEmp;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    recordPendingChange('employee', 'update', `Updated employee: ${id}`, updates);
  };

  const deleteEmployee = (id: string) => {
    const target = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    recordPendingChange('employee', 'delete', `Removed employee: ${target?.name || id}`, { id });
  };

  // Notification Actions
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Offline / Sync Actions
  const setConnectionStatus = (status: ConnectionStatus) => {
    setSyncState((prev) => {
      const next = { ...prev, connectionStatus: status };
      AsyncStorage.setItem(STORAGE_KEYS.SYNC_STATE, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const triggerManualSync = () => {
    setSyncState((prev) => ({ ...prev, connectionStatus: 'syncing' }));

    setTimeout(() => {
      setSyncState((prev) => {
        const next = {
          ...prev,
          connectionStatus: 'online' as ConnectionStatus,
          lastSyncTime: new Date().toISOString(),
          pendingChanges: [],
        };
        AsyncStorage.setItem(STORAGE_KEYS.SYNC_STATE, JSON.stringify(next)).catch(() => {});
        return next;
      });
      addNotification('Local Storage Synced', 'All local mutations persisted to disk cache.', 'sync');
    }, 1200);
  };

  const resolveConflict = (conflictId: string, resolution: 'keep_local' | 'accept_server') => {
    setSyncState((prev) => {
      const conflict = prev.conflictItems.find((c) => c.id === conflictId);
      if (conflict && resolution === 'accept_server') {
        // apply server changes to local products
        setProducts((prods) =>
          prods.map((p) => (p.id === conflict.entityId ? { ...p, ...conflict.serverValue } : p))
        );
      }
      const next = {
        ...prev,
        conflictItems: prev.conflictItems.filter((c) => c.id !== conflictId),
      };
      AsyncStorage.setItem(STORAGE_KEYS.SYNC_STATE, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const addSampleConflictForUIPreview = () => {
    const sampleConflict: ConflictItem = {
      id: `conflict-${Date.now()}`,
      entityType: 'product',
      entityId: products[0]?.id || 'prod-sample',
      entityName: products[0]?.name || 'Sample Product',
      serverValue: { quantity: 45, sellingPrice: 28.0 },
      localValue: { quantity: 38, sellingPrice: 25.0 },
      updatedBy: 'Branch Manager (Accra)',
      updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      fields: [
        { fieldName: 'Stock Quantity', serverVal: '45 pcs', localVal: '38 pcs' },
        {
          fieldName: 'Selling Price',
          serverVal: `${settings.currency}28.00`,
          localVal: `${settings.currency}25.00`,
        },
      ],
    };
    setSyncState((prev) => {
      const next = {
        ...prev,
        conflictItems: [sampleConflict, ...prev.conflictItems],
      };
      AsyncStorage.setItem(STORAGE_KEYS.SYNC_STATE, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        business,
        setUser,
        setBusiness,
        updateBusiness,
        isOnboarded,
        setIsOnboarded,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        deleteProducts,
        getProductById,
        getProductByBarcode,
        updateProductExpiry,
        addBatchToProduct,
        stockMovements,
        addStock,
        removeStock,
        recordExpiredStock,
        adjustStock,
        sales,
        recordSale,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        syncState,
        setConnectionStatus,
        triggerManualSync,
        resolveConflict,
        addSampleConflictForUIPreview,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
