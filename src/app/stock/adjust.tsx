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
import { SlidersHorizontal, AlertCircle, FileText, ArrowRight, Package } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { SelectField } from '../../components/forms/SelectField';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useApp } from '../../context/AppContext';

const ADJUSTMENT_REASONS = [
  'Routine physical audit',
  'Misplaced items recovered',
  'Data entry correction',
  'Damaged goods audit write-off',
  'Manager manual reconciliation',
];

export default function StockAdjustmentScreen() {
  const { productId: initialProductId } = useLocalSearchParams<{ productId?: string }>();
  const { products, adjustStock } = useApp();

  const [selectedProductId, setSelectedProductId] = useState(
    initialProductId || (products.length > 0 ? products[0].id : '')
  );
  const [newQuantity, setNewQuantity] = useState('');
  const [reason, setReason] = useState(ADJUSTMENT_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (products.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={<SlidersHorizontal size={36} color={Colors.amber} />}
          title="No Products to Adjust"
          description="Register items first before performing physical stock count adjustments."
          actionTitle="+ Add Product"
          onAction={() => router.push('/products/new')}
        />
      </View>
    );
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const productOptions = products.map((p) => ({
    label: `${p.name} (Recorded: ${p.quantity} ${p.unit})`,
    value: p.id,
  }));

  const parsedNewQty = Number(newQuantity);
  const currentQty = selectedProduct?.quantity || 0;
  const isEntering = newQuantity.trim() !== '' && !isNaN(parsedNewQty);
  const delta = isEntering ? parsedNewQty - currentQty : 0;

  const validate = () => {
    const err: Record<string, string> = {};
    if (!selectedProductId) err.productId = 'Select a product';
    if (!newQuantity.trim() || isNaN(Number(newQuantity)) || Number(newQuantity) < 0) {
      err.newQuantity = 'Enter a valid non-negative adjusted quantity';
    }
    if (!reason.trim()) {
      err.reason = 'An adjustment reason is strictly required';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const finalReason = customReason.trim() ? `${reason}: ${customReason.trim()}` : reason;
      adjustStock({
        productId: selectedProductId,
        newQuantity: Number(newQuantity),
        reason: finalReason,
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
            label="Product to Reconcile *"
            value={selectedProductId}
            options={productOptions}
            onSelect={setSelectedProductId}
            error={errors.productId}
          />

          {selectedProduct && (
            <View style={styles.stockPreviewCard}>
              <View style={styles.previewTop}>
                <View style={[styles.productIconWrap, { backgroundColor: Colors.amberLight }]}>
                  <Package size={18} color={Colors.amberDark} />
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>{selectedProduct.name}</Text>
                  <Text style={styles.previewCategory}>{selectedProduct.category}</Text>
                </View>
              </View>

              <View style={styles.calculationRow}>
                <View style={styles.calcBox}>
                  <Text style={styles.calcLabel}>SYSTEM BALANCE</Text>
                  <Text style={styles.calcVal}>{currentQty} {selectedProduct.unit}</Text>
                </View>

                <ArrowRight size={16} color={Colors.amberDark} />

                <View style={[styles.calcBox, styles.calcBoxHighlighted]}>
                  <Text style={[styles.calcLabel, { color: Colors.amberDark }]}>PHYSICAL COUNT</Text>
                  <Text style={[styles.calcVal, { color: Colors.charcoal }]}>
                    {isEntering ? parsedNewQty : currentQty} {selectedProduct.unit}
                  </Text>
                </View>
              </View>

              {isEntering && (
                <View style={styles.deltaPillRow}>
                  <Text style={styles.deltaPillLabel}>COUNT VARIANCE:</Text>
                  <View
                    style={[
                      styles.deltaBadge,
                      delta > 0
                        ? styles.deltaBadgeGreen
                        : delta < 0
                        ? styles.deltaBadgeRed
                        : styles.deltaBadgeNeutral,
                    ]}
                  >
                    <Text
                      style={[
                        styles.deltaBadgeText,
                        delta > 0
                          ? styles.deltaTextGreen
                          : delta < 0
                          ? styles.deltaTextRed
                          : styles.deltaTextNeutral,
                      ]}
                    >
                      {delta > 0
                        ? `+${delta} ${selectedProduct.unit} (Surplus)`
                        : delta < 0
                        ? `${delta} ${selectedProduct.unit} (Shortage)`
                        : 'Balanced (0 variance)'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          <Text style={[styles.microSectionLabel, { marginTop: Spacing.md }]}>
            COUNT & AUDIT REASON
          </Text>

          <InputField
            label="Actual Physical Stock Count *"
            value={newQuantity}
            onChangeText={(t) => {
              setNewQuantity(t);
              if (errors.newQuantity) setErrors((e) => ({ ...e, newQuantity: '' }));
            }}
            placeholder={selectedProduct ? selectedProduct.quantity.toString() : '0'}
            keyboardType="numeric"
            suffix={selectedProduct?.unit || 'units'}
            error={errors.newQuantity}
          />

          {/* Quick Reason Chips */}
          <Text style={styles.fieldSubLabel}>Select Primary Audit Reason *</Text>
          <View style={styles.reasonChipsRow}>
            {ADJUSTMENT_REASONS.map((r) => {
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
            label="Additional Details (Optional)"
            value={customReason}
            onChangeText={setCustomReason}
            placeholder="e.g. Recounted shelf 3B with shift supervisor"
          />

          <InputField
            label="Internal Audit Note (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Audit ref #AUD-883"
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
              title="Save Adjustment"
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
  fieldSubLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.charcoal,
    marginBottom: Spacing.xs,
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
  deltaPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  deltaPillLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  deltaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
  },
  deltaBadgeGreen: {
    backgroundColor: Colors.emeraldLight,
  },
  deltaBadgeRed: {
    backgroundColor: Colors.redLight,
  },
  deltaBadgeNeutral: {
    backgroundColor: Colors.borderLight,
  },
  deltaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deltaTextGreen: {
    color: Colors.deepEmerald,
  },
  deltaTextRed: {
    color: Colors.softRed,
  },
  deltaTextNeutral: {
    color: Colors.textMuted,
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
