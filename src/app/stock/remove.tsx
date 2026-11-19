import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MinusCircle, AlertTriangle, FileText, ArrowRight, Package } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { SelectField } from '../../components/forms/SelectField';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useApp } from '../../context/AppContext';

const REMOVAL_REASONS = [
  'Damaged products',
  'Expired products',
  'Lost products',
  'Internal use',
  'Stock correction',
];

export default function RemoveStockScreen() {
  const { productId: initialProductId, reason: initialReason } = useLocalSearchParams<{
    productId?: string;
    reason?: string;
  }>();
  const { products, removeStock } = useApp();

  const [selectedProductId, setSelectedProductId] = useState(
    initialProductId || (products.length > 0 ? products[0].id : '')
  );
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState(initialReason || REMOVAL_REASONS[0]);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (products.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={<MinusCircle size={36} color={Colors.softRed} />}
          title="No Products to Remove"
          description="You do not have any registered products in your inventory yet."
          actionTitle="+ Add Product"
          onAction={() => router.push('/products/new')}
        />
      </View>
    );
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const qtyNumber = Number(quantity) || 0;
  const currentQty = selectedProduct?.quantity || 0;
  const newQty = Math.max(0, currentQty - qtyNumber);

  const productOptions = products.map((p) => ({
    label: `${p.name} (${p.quantity} ${p.unit} in stock)`,
    value: p.id,
  }));

  const validate = () => {
    const err: Record<string, string> = {};
    if (!selectedProductId) err.productId = 'Select a product';
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      err.quantity = 'Enter a valid quantity greater than 0';
    } else if (selectedProduct && Number(quantity) > selectedProduct.quantity) {
      err.quantity = `Cannot remove more than available stock (${selectedProduct.quantity} ${selectedProduct.unit})`;
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      removeStock({
        productId: selectedProductId,
        quantity: Number(quantity),
        reason,
        notes: notes.trim() || undefined,
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
            label="Product to Deduct *"
            value={selectedProductId}
            options={productOptions}
            onSelect={setSelectedProductId}
            error={errors.productId}
          />

          {selectedProduct && (
            <View style={styles.stockPreviewCard}>
              <View style={styles.previewTop}>
                <View style={[styles.productIconWrap, { backgroundColor: Colors.redLight }]}>
                  <Package size={18} color={Colors.softRed} />
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>{selectedProduct.name}</Text>
                  <Text style={styles.previewCategory}>{selectedProduct.category}</Text>
                </View>
              </View>

              <View style={styles.calculationRow}>
                <View style={styles.calcBox}>
                  <Text style={styles.calcLabel}>AVAILABLE STOCK</Text>
                  <Text style={styles.calcVal}>{currentQty} {selectedProduct.unit}</Text>
                </View>

                <ArrowRight size={16} color={Colors.softRed} />

                <View style={[styles.calcBox, styles.calcBoxHighlighted]}>
                  <Text style={[styles.calcLabel, { color: Colors.softRed }]}>AFTER REMOVAL</Text>
                  <Text style={[styles.calcVal, { color: Colors.softRed }]}>
                    {newQty} {selectedProduct.unit}
                    {qtyNumber > 0 && <Text style={styles.deltaRed}> (-{qtyNumber})</Text>}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <Text style={[styles.microSectionLabel, { marginTop: Spacing.md }]}>
            REMOVAL REASON
          </Text>

          {/* Quick Reason Chips */}
          <View style={styles.reasonChipsRow}>
            {REMOVAL_REASONS.map((r) => {
              const isSelected = reason === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.reasonChip, isSelected && styles.activeReasonChip]}
                  onPress={() => setReason(r)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.reasonChipText, isSelected && styles.activeReasonChipText]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <InputField
            label="Quantity to Remove *"
            value={quantity}
            onChangeText={(t) => {
              setQuantity(t);
              if (errors.quantity) setErrors((e) => ({ ...e, quantity: '' }));
            }}
            placeholder="e.g. 5"
            keyboardType="numeric"
            suffix={selectedProduct?.unit || 'units'}
            error={errors.quantity}
          />

          <InputField
            label="Explanation / Incident Note (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Broken packaging discovered during weekly shelf cleaning"
            icon={<FileText size={16} color={Colors.textMuted} />}
          />

          <View style={styles.warningNote}>
            <AlertTriangle size={16} color={Colors.amberDark} />
            <Text style={styles.warningText}>
              This deduction will permanently reduce recorded stock and appear on employee audit logs.
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              style={styles.cancelBtn}
            />
            <Button
              title="Confirm Removal"
              variant="danger"
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
  deltaRed: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.softRed,
  },
  reasonChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.md,
  },
  reasonChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.softBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  activeReasonChip: {
    backgroundColor: Colors.deepEmerald,
    borderColor: Colors.deepEmerald,
  },
  reasonChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  activeReasonChipText: {
    color: Colors.white,
    fontWeight: '700',
  },
  warningNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.amberLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  warningText: {
    fontSize: 11,
    color: Colors.amberDark,
    lineHeight: 16,
    flex: 1,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 2,
  },
});
