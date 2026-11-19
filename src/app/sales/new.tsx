import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  CreditCard,
  Smartphone,
  Banknote,
  MoreHorizontal,
  Check,
  Search,
  Barcode,
  AlertTriangle,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing, Typography } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import { calculateExpiryStatus } from '../../utils/expiry';

interface CartItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  availableStock: number;
  unit: string;
  quantity: number;
}

export default function RecordSaleScreen() {
  const params = useLocalSearchParams<{ barcode?: string }>();
  const { products, recordSale, settings, getProductByBarcode } = useApp();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [discount, setDiscount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expiredWarning, setExpiredWarning] = useState<string | null>(null);

  // Auto-add scanned barcode from route params
  useEffect(() => {
    if (params.barcode) {
      const match = getProductByBarcode(params.barcode);
      if (match) {
        addToCart(match);
      } else {
        setError(`Scanned barcode "${params.barcode}" does not match any product in inventory.`);
      }
    }
  }, [params.barcode]);

  if (products.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={<ShoppingCart size={32} color={Colors.freshGreen} />}
          title="No Products to Sell"
          description="Register items in your inventory first before recording customer checkouts."
          actionTitle="+ Add Product"
          onAction={() => router.push('/products/new')}
        />
      </View>
    );
  }

  const availableProducts = products.filter((p) => {
    if (p.quantity <= 0) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const addToCart = (product: typeof products[0]) => {
    setError('');
    setExpiredWarning(null);

    // EXPIRY SAFETY CHECK
    const exp = calculateExpiryStatus(product.expiryDate);
    if (exp.isExpired) {
      setExpiredWarning(
        `WARNING: THIS PRODUCT HAS EXPIRED (${product.name}). DO NOT SELL IT.`
      );
      return;
    }

    const existingIndex = cart.findIndex((item) => item.productId === product.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= product.quantity) {
        setError(`Cannot exceed available stock of ${product.name} (${product.quantity} ${product.unit})`);
        return;
      }
      setCart((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.sellingPrice,
          availableStock: product.quantity,
          unit: product.unit,
          quantity: 1,
        },
      ]);
    }
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setError('');
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.availableStock) {
              setError(`Max available stock is ${item.availableStock} ${item.unit}`);
              return item;
            }
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountAmount = Math.min(Number(discount) || 0, subtotal);
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      setError('Please add at least one item to checkout');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const sale = recordSale({
        items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
        discount: discountAmount,
        paymentMethod,
        paymentNotes: paymentNotes.trim() || undefined,
      });

      if (sale) {
        router.replace(`/sales/${sale.id}` as any);
      }
    }, 400);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        {/* PROMINENT EXPIRED WARNING BANNER */}
        {expiredWarning ? (
          <View style={styles.expiredWarningBanner}>
            <AlertTriangle size={20} color={Colors.white} />
            <Text style={styles.expiredWarningBannerText}>{expiredWarning}</Text>
          </View>
        ) : null}

        {/* 1. Product Selection Carousel */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. Select Products</Text>

          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Search size={16} color={Colors.textMuted} />
              <InputField
                value={productSearch}
                onChangeText={setProductSearch}
                placeholder="Search available stock..."
                style={styles.searchInputField}
              />
            </View>

            <TouchableOpacity
              style={styles.scanBarcodeBtn}
              onPress={() => router.push('/scanner')}
              activeOpacity={0.8}
            >
              <Barcode size={20} color={Colors.deepEmerald} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productPickerRow}
          >
            {availableProducts.slice(0, 10).map((product) => {
              const inCartItem = cart.find((c) => c.productId === product.id);
              const isExpired = calculateExpiryStatus(product.expiryDate).isExpired;

              return (
                <TouchableOpacity
                  key={product.id}
                  style={[
                    styles.productTile,
                    inCartItem ? styles.productTileActive : null,
                    isExpired ? styles.productTileExpired : null,
                  ]}
                  onPress={() => addToCart(product)}
                  activeOpacity={0.75}
                >
                  {isExpired && (
                    <View style={styles.tileExpiredBadge}>
                      <Text style={styles.tileExpiredText}>EXPIRED</Text>
                    </View>
                  )}

                  <View style={styles.tileHeader}>
                    <Text style={styles.tileName} numberOfLines={2}>
                      {product.name}
                    </Text>
                  </View>

                  <View style={styles.tileBottom}>
                    <Text style={styles.tilePrice}>
                      {settings.currency}
                      {product.sellingPrice.toFixed(2)}
                    </Text>
                    <Text style={styles.tileStock}>
                      {product.quantity} {product.unit} left
                    </Text>
                  </View>

                  {inCartItem && (
                    <View style={styles.inCartIndicator}>
                      <Text style={styles.inCartText}>{inCartItem.quantity}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 2. Order Cart Items */}
        <View style={styles.card}>
          <View style={styles.cartHeader}>
            <Text style={styles.cardTitle}>2. Sale Items</Text>
            <View style={styles.itemCountPill}>
              <Text style={styles.itemCountText}>
                {cart.reduce((sum, i) => sum + i.quantity, 0)} units
              </Text>
            </View>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCartBox}>
              <ShoppingCart size={30} color={Colors.textLight} />
              <Text style={styles.emptyCartTitle}>Cart is Empty</Text>
              <Text style={styles.emptyCartSub}>
                Tap on any product above to add it to this sale.
              </Text>
            </View>
          ) : (
            <View style={styles.cartItemsList}>
              {cart.map((item) => (
                <View key={item.productId} style={styles.cartRow}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName} numberOfLines={1}>
                      {item.productName}
                    </Text>
                    <Text style={styles.cartItemUnitPrice}>
                      {settings.currency}
                      {item.unitPrice.toFixed(2)} per {item.unit}
                    </Text>
                  </View>

                  {/* Quantity Stepper Capsule */}
                  <View style={styles.stepperCapsule}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateCartQuantity(item.productId, -1)}
                    >
                      <Minus size={13} color={Colors.charcoal} />
                    </TouchableOpacity>

                    <Text style={styles.stepperValue}>{item.quantity}</Text>

                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateCartQuantity(item.productId, 1)}
                    >
                      <Plus size={13} color={Colors.charcoal} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.cartItemSubtotal}>
                    {settings.currency}
                    {(item.unitPrice * item.quantity).toFixed(2)}
                  </Text>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => removeFromCart(item.productId)}
                  >
                    <Trash2 size={16} color={Colors.softRed} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 3. Payment Method & Checkout */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>3. Payment Method</Text>

          <View style={styles.paymentMethodGrid}>
            {(
              [
                { key: 'cash', label: 'Cash', icon: <Banknote size={18} /> },
                { key: 'momo', label: 'MoMo', icon: <Smartphone size={18} /> },
                { key: 'card', label: 'Card', icon: <CreditCard size={18} /> },
                { key: 'other', label: 'Other', icon: <MoreHorizontal size={18} /> },
              ] as const
            ).map((pm) => {
              const isSelected = paymentMethod === pm.key;
              return (
                <TouchableOpacity
                  key={pm.key}
                  style={[
                    styles.paymentTile,
                    isSelected && styles.paymentTileActive,
                  ]}
                  onPress={() => setPaymentMethod(pm.key)}
                >
                  <View
                    style={[
                      styles.paymentIconWrap,
                      isSelected && styles.paymentIconWrapActive,
                    ]}
                  >
                    {pm.icon}
                  </View>
                  <Text
                    style={[
                      styles.paymentTileText,
                      isSelected && styles.paymentTileTextActive,
                    ]}
                  >
                    {pm.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <InputField
            label={`Discount Amount (${settings.currency})`}
            value={discount}
            onChangeText={setDiscount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            icon={<DollarSign size={16} color={Colors.textMuted} />}
          />

          <InputField
            label="Sale Reference or Note (Optional)"
            value={paymentNotes}
            onChangeText={setPaymentNotes}
            placeholder="e.g. Regular customer, MoMo Trans ID #8921"
          />

          {/* Breakdown Receipt Card */}
          <View style={styles.calcBox}>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Subtotal</Text>
              <Text style={styles.calcValue}>
                {settings.currency}
                {subtotal.toFixed(2)}
              </Text>
            </View>

            {discountAmount > 0 && (
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Discount</Text>
                <Text style={[styles.calcValue, { color: Colors.softRed }]}>
                  -{settings.currency}
                  {discountAmount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.calcDivider} />

            <View style={styles.calcRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>
                {settings.currency}
                {grandTotal.toFixed(2)}
              </Text>
            </View>
          </View>

          <Button
            title={`Complete Checkout • ${settings.currency}${grandTotal.toFixed(2)}`}
            onPress={handleCompleteSale}
            loading={loading}
            size="lg"
            icon={<Check size={18} color={Colors.white} />}
            disabled={cart.length === 0}
            style={styles.completeBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.softBackground,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  errorBanner: {
    ...Typography.bodySmall,
    color: Colors.softRed,
    backgroundColor: Colors.redLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    fontWeight: '600',
  },
  expiredWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.softRed,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  expiredWarningBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardTitle: {
    ...Typography.h4,
    fontSize: 16,
    color: Colors.charcoal,
    marginBottom: Spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  scanBarcodeBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputField: {
    flex: 1,
    marginBottom: 0,
  },
  productPickerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  productTile: {
    width: 136,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.2,
    borderColor: Colors.border,
    justifyContent: 'space-between',
    minHeight: 110,
    position: 'relative',
  },
  productTileActive: {
    borderColor: Colors.freshGreen,
    backgroundColor: Colors.freshGreenLight,
  },
  productTileExpired: {
    borderColor: Colors.softRed,
    backgroundColor: '#FFF2F2',
  },
  tileExpiredBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.softRed,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  tileExpiredText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.white,
  },
  tileHeader: {
    flex: 1,
  },
  tileName: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.charcoal,
    fontSize: 13,
    lineHeight: 17,
  },
  tileBottom: {
    marginTop: Spacing.xs,
  },
  tilePrice: {
    ...Typography.body,
    fontWeight: '800',
    color: Colors.freshGreen,
    fontSize: 15,
  },
  tileStock: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  inCartIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.freshGreen,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  inCartText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  itemCountPill: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  itemCountText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  emptyCartBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyCartTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.charcoal,
    marginTop: Spacing.xs,
  },
  emptyCartSub: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  cartItemsList: {
    gap: Spacing.xs,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  cartItemInfo: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  cartItemName: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  cartItemUnitPrice: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  stepperCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: Spacing.sm,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    ...Typography.bodySmall,
    fontWeight: '800',
    minWidth: 26,
    textAlign: 'center',
    color: Colors.charcoal,
  },
  cartItemSubtotal: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.charcoal,
    minWidth: 64,
    textAlign: 'right',
    marginRight: Spacing.xs,
  },
  deleteBtn: {
    padding: Spacing.xs,
  },
  paymentMethodGrid: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.md,
  },
  paymentTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    borderWidth: 1.2,
    borderColor: Colors.border,
  },
  paymentTileActive: {
    backgroundColor: Colors.freshGreenLight,
    borderColor: Colors.freshGreen,
  },
  paymentIconWrap: {
    marginBottom: 4,
  },
  paymentIconWrapActive: {
    //
  },
  paymentTileText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  paymentTileTextActive: {
    color: Colors.deepEmerald,
  },
  calcBox: {
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.md,
    gap: Spacing.xs,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabel: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  calcValue: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  calcDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  totalLabel: {
    ...Typography.h4,
    color: Colors.charcoal,
  },
  totalValue: {
    ...Typography.h2,
    fontSize: 22,
    color: Colors.freshGreen,
    fontWeight: '900',
  },
  completeBtn: {
    marginTop: Spacing.xs,
  },
});
