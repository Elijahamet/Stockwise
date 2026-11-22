import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product, Sale, StockMovement, Business } from '../types';

export interface SyncResult {
  success: boolean;
  syncedProducts: number;
  syncedSales: number;
  syncedMovements: number;
  errors: string[];
}

/**
 * Upload local products to Supabase PostgreSQL table.
 */
export async function syncProductsToCloud(
  products: Product[],
  businessId?: string
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!isSupabaseConfigured || products.length === 0) {
    return { success: true, count: 0 };
  }

  try {
    const payload = products.map((p) => ({
      id: p.id,
      business_id: businessId || null,
      name: p.name,
      category: p.category,
      sku: p.sku,
      barcode: p.barcode || null,
      cost_price: p.buyingPrice,
      selling_price: p.sellingPrice,
      quantity: p.quantity,
      unit: p.unit,
      low_stock_threshold: p.lowStockThreshold,
      expiry_date: p.expiryDate || null,
      manufacturing_date: p.manufacturingDate || null,
      image_url: p.imageUrl || null,
      updated_at: p.updatedAt,
    }));

    const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' });
    if (error) {
      return { success: false, count: 0, error: error.message };
    }
    return { success: true, count: payload.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Sync failed' };
  }
}

/**
 * Fetch products from Supabase PostgreSQL table into local inventory.
 */
export async function fetchProductsFromCloud(
  businessId?: string
): Promise<{ products: Product[]; error?: string }> {
  if (!isSupabaseConfigured) {
    return { products: [] };
  }

  try {
    let query = supabase.from('products').select('*');
    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    const { data, error } = await query;
    if (error) {
      return { products: [], error: error.message };
    }

    const products: Product[] = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      sku: row.sku,
      barcode: row.barcode || undefined,
      buyingPrice: Number(row.cost_price || 0),
      sellingPrice: Number(row.selling_price || 0),
      quantity: Number(row.quantity || 0),
      unit: row.unit || 'pcs',
      lowStockThreshold: Number(row.low_stock_threshold || 5),
      expiryDate: row.expiry_date || undefined,
      manufacturingDate: row.manufacturing_date || undefined,
      imageUrl: row.image_url || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { products };
  } catch (err: any) {
    return { products: [], error: err?.message };
  }
}

/**
 * Upload completed sales records to Supabase.
 */
export async function syncSalesToCloud(
  sales: Sale[],
  businessId?: string
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!isSupabaseConfigured || sales.length === 0) {
    return { success: true, count: 0 };
  }

  try {
    const salesPayload = sales.map((s) => ({
      id: s.id,
      business_id: businessId || null,
      receipt_number: s.receiptNumber,
      subtotal: s.subtotal,
      discount: s.discount,
      total: s.total,
      payment_method: s.paymentMethod,
      payment_notes: s.paymentNotes || null,
      sold_by: s.soldBy,
      sold_by_id: s.soldById,
      created_at: s.createdAt,
    }));

    const { error: salesError } = await supabase
      .from('sales')
      .upsert(salesPayload, { onConflict: 'id' });
    if (salesError) {
      return { success: false, count: 0, error: salesError.message };
    }

    // Insert sale items
    const allItems = sales.flatMap((s) =>
      s.items.map((i) => ({
        sale_id: s.id,
        product_id: i.productId,
        product_name: i.productName,
        sku: i.sku || null,
        unit_price: i.unitPrice,
        cost_price: 0,
        quantity: i.quantity,
        unit: 'pcs',
        total: i.subtotal,
      }))
    );

    if (allItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('sale_items')
        .upsert(allItems, { onConflict: 'id' });
      if (itemsError) {
        console.warn('Warning syncing sale items:', itemsError.message);
      }
    }

    return { success: true, count: sales.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message };
  }
}

/**
 * Upload stock movements audit records to Supabase.
 */
export async function syncStockMovementsToCloud(
  movements: StockMovement[],
  businessId?: string
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!isSupabaseConfigured || movements.length === 0) {
    return { success: true, count: 0 };
  }

  try {
    const payload = movements.map((m) => ({
      id: m.id,
      business_id: businessId || null,
      product_id: m.productId,
      product_name: m.productName,
      type: m.type,
      quantity_change: m.quantityChange,
      previous_quantity: m.previousQuantity,
      new_quantity: m.newQuantity,
      reason: m.reason,
      notes: m.notes || null,
      cost_price: m.buyingPrice || null,
      employee_name: m.employeeName,
      employee_id: m.employeeId,
      created_at: m.createdAt,
    }));

    const { error } = await supabase
      .from('stock_movements')
      .upsert(payload, { onConflict: 'id' });
    if (error) {
      return { success: false, count: 0, error: error.message };
    }
    return { success: true, count: movements.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message };
  }
}

/**
 * Full synchronization routine triggered manually or on reconnect.
 */
export async function performFullSync(params: {
  products: Product[];
  sales: Sale[];
  stockMovements: StockMovement[];
  business?: Business | null;
}): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    syncedProducts: 0,
    syncedSales: 0,
    syncedMovements: 0,
    errors: [],
  };

  if (!isSupabaseConfigured) {
    // Graceful offline-first completion: local state is preserved
    return result;
  }

  const businessId = params.business?.id;

  // 1. Sync Products
  const prodRes = await syncProductsToCloud(params.products, businessId);
  result.syncedProducts = prodRes.count;
  if (!prodRes.success && prodRes.error) result.errors.push(prodRes.error);

  // 2. Sync Sales
  const saleRes = await syncSalesToCloud(params.sales, businessId);
  result.syncedSales = saleRes.count;
  if (!saleRes.success && saleRes.error) result.errors.push(saleRes.error);

  // 3. Sync Stock Movements
  const movRes = await syncStockMovementsToCloud(params.stockMovements, businessId);
  result.syncedMovements = movRes.count;
  if (!movRes.success && movRes.error) result.errors.push(movRes.error);

  result.success = result.errors.length === 0;
  return result;
}
