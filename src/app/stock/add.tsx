import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { PlusCircle, DollarSign, Truck, Calendar, FileText, ArrowRight, Package } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { SelectField } from '../../components/forms/SelectField';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useApp } from '../../context/AppContext';

export default function AddStockScreen() {
  const { productId: initialProductId } = useLocalSearchParams<{ productId?: string }>();
  const { products, addStock, settings } = useApp();

  const [selectedProductId, setSelectedProductId] = useState(
    initialProductId || (products.length > 0 ? products[0].id : '')
  );
  const [quantity, setQuantity] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (products.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={<PlusCircle size={36} color={Colors.freshGreen} />}
          title="No Products in Inventory"
          description="Before you can restock or record purchases, you must first register products."
          actionTitle="+ Add Product"
          onAction={() => router.push('/products/new')}
        />
      </View>
    );
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const qtyNumber = Number(quantity) || 0;
  const currentQty = selectedProduct?.quantity || 0;
  const newQty = currentQty + qtyNumber;

  const productOptions = products.map((p) => ({
    label: `${p.name} (Current: ${p.quantity} ${p.unit})`,
    value: p.id,
  }));

  const validate = () => {
    const err: Record<string, string> = {};
    if (!selectedProductId) err.productId = 'Select a product to restock';
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      err.quantity = 'Enter a valid quantity greater than 0';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addStock({
        productId: selectedProductId,
        quantity: Number(quantity),
        buyingPrice: buyingPrice ? Number(buyingPrice) : selectedProduct?.buyingPrice,
        supplier: supplier.trim() || undefined,
        notes: notes.trim() || undefined,
        batchNumber: batchNumber.trim() || undefined,
        expiryDate: expiryDate.trim() || undefined,
      });

      router.back();
    }, 350);
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
        <View style={styles.formCard}>
          <Text style={styles.microSectionLabel}>PRODUCT SELECTION</Text>

          <SelectField
            label="Product to Restock *"
            value={selectedProductId}
            options={productOptions}
            onSelect={setSelectedProductId}
            error={errors.productId}
          />

          {selectedProduct && (
            <View style={styles.stockPreviewCard}>
              <View style={styles.previewTop}>
                <View style={styles.productIconWrap}>
                  <Package size={18} color={Colors.deepEmerald} />
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>{selectedProduct.name}</Text>
                  <Text style={styles.previewCategory}>{selectedProduct.category}</Text>
                </View>
              </View>

              <View style={styles.calculationRow}>
                <View style={styles.calcBox}>
                  <Text style={styles.calcLabel}>CURRENT STOCK</Text>
                  <Text style={styles.calcVal}>{currentQty} {selectedProduct.unit}</Text>
                </View>

                <ArrowRight size={16} color={Colors.freshGreen} />

                <View style={[styles.calcBox, styles.calcBoxHighlighted]}>
                  <Text style={[styles.calcLabel, { color: Colors.deepEmerald }]}>AFTER RESTOCK</Text>
                  <Text style={[styles.calcVal, { color: Colors.deepEmerald }]}>
                    {newQty} {selectedProduct.unit}
                    {qtyNumber > 0 && <Text style={styles.deltaGreen}> (+{qtyNumber})</Text>}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <Text style={[styles.microSectionLabel, { marginTop: Spacing.md }]}>
            DELIVERY & QUANTITY
          </Text>

          <InputField
            label="Quantity Received *"
            value={quantity}
            onChangeText={(t) => {
              setQuantity(t);
              if (errors.quantity) setErrors((e) => ({ ...e, quantity: '' }));
            }}
            placeholder="e.g. 50"
            keyboardType="numeric"
            suffix={selectedProduct?.unit || 'units'}
            error={errors.quantity}
          />

          <InputField
            label={`Purchase Cost Price (${settings.currency})`}
            value={buyingPrice}
            onChangeText={setBuyingPrice}
            placeholder={
              selectedProduct ? selectedProduct.buyingPrice.toFixed(2) : '0.00'
            }
            keyboardType="decimal-pad"
            icon={<DollarSign size={16} color={Colors.textMuted} />}
          />

          <InputField
            label="Supplier / Vendor (Optional)"
            value={supplier}
            onChangeText={setSupplier}
            placeholder="e.g. Golden Cocoa Wholesalers"
            icon={<Truck size={16} color={Colors.textMuted} />}
          />

          <InputField
            label="Delivery Date"
            value={dateStr}
            onChangeText={setDateStr}
            placeholder="YYYY-MM-DD"
            icon={<Calendar size={16} color={Colors.textMuted} />}
          />

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <InputField
                label="Batch / Lot # (Opt)"
                value={batchNumber}
                onChangeText={setBatchNumber}
                placeholder="e.g. BATCH-01"
              />
            </View>
            <View style={styles.halfCol}>
              <InputField
                label="Expiry Date (Opt)"
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="YYYY-MM-DD"
                icon={<Calendar size={16} color={Colors.textMuted} />}
              />
            </View>
          </View>

          <InputField
            label="Purchase Notes / Invoice Ref (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Invoice #2041, Batch #4"
            icon={<FileText size={16} color={Colors.textMuted} />}
          />

          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              style={styles.cancelBtn}
            />
            <Button
              title="Record Restock"
              onPress={handleSave}
              loading={loading}
              style={styles.saveBtn}
            />
          </View>
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
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  microSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  stockPreviewCard: {
    backgroundColor: Colors.softBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  previewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  productIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  previewCategory: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  calculationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  calcBox: {
    flex: 1,
  },
  calcBoxHighlighted: {
    alignItems: 'flex-end',
  },
  calcLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textLight,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  calcVal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  deltaGreen: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.freshGreen,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfCol: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 2,
  },
});
