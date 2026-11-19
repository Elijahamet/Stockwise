import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Package,
  Tag,
  Barcode,
  DollarSign,
  Layers,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { SelectField } from '../../components/forms/SelectField';
import { Button } from '../../components/buttons/Button';
import { useApp } from '../../context/AppContext';
import { calculateExpiryStatus, parseLocalDate } from '../../utils/expiry';

const CATEGORIES = [
  'General Provisions',
  'Beverages & Drinks',
  'Grains & Flour',
  'Dairy & Eggs',
  'Toiletries & Personal Care',
  'Canned Goods',
  'Snacks & Confectionery',
  'Household & Cleaning',
  'Spices & Seasoning',
  'Other',
];

const UNITS = ['pcs', 'kg', 'boxes', 'cartons', 'litres', 'packs', 'bottles', 'sachets'];

export default function NewProductScreen() {
  const params = useLocalSearchParams<{ barcode?: string }>();
  const { addProduct, settings } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState(params.barcode || '');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [expiryDate, setExpiryDate] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const costNum = Number(buyingPrice) || 0;
  const sellNum = Number(sellingPrice) || 0;
  const profitPerUnit = sellNum - costNum;
  const marginPercent = sellNum > 0 ? Math.round((profitPerUnit / sellNum) * 100) : 0;

  // Live expiry status preview
  const expiryPreview = expiryDate.trim().length >= 8 ? calculateExpiryStatus(expiryDate.trim()) : null;

  const validate = () => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = 'Product name is required';
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) < 0) {
      err.quantity = 'Valid quantity required';
    }
    if (!buyingPrice.trim() || isNaN(Number(buyingPrice)) || Number(buyingPrice) < 0) {
      err.buyingPrice = 'Valid cost price required';
    }
    if (!sellingPrice.trim() || isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) {
      err.sellingPrice = 'Valid selling price required';
    }

    if (expiryDate.trim()) {
      const parsed = parseLocalDate(expiryDate.trim());
      if (!parsed) {
        err.expiryDate = 'Use YYYY-MM-DD format (e.g. 2026-12-31)';
      }
    }

    if (manufacturingDate.trim()) {
      const parsedMfg = parseLocalDate(manufacturingDate.trim());
      if (!parsedMfg) {
        err.manufacturingDate = 'Use YYYY-MM-DD format (e.g. 2025-01-15)';
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const generatedSku = sku.trim() || `SKU-${Date.now().toString().slice(-4)}`;
      const cleanExpiry = expiryDate.trim() || undefined;
      const cleanMfg = manufacturingDate.trim() || undefined;
      const cleanBatch = batchNumber.trim();

      const initialBatches = cleanExpiry || cleanBatch ? [
        {
          id: `batch-${Date.now()}`,
          batchNumber: cleanBatch || `BATCH-01`,
          quantity: Number(quantity),
          expiryDate: cleanExpiry,
          manufacturingDate: cleanMfg,
          receivedDate: new Date().toISOString().split('T')[0],
        }
      ] : undefined;

      addProduct({
        name: name.trim(),
        category,
        sku: generatedSku,
        barcode: barcode.trim() || undefined,
        quantity: Number(quantity),
        unit,
        buyingPrice: Number(buyingPrice),
        sellingPrice: Number(sellingPrice),
        lowStockThreshold: Number(lowStockThreshold) || 5,
        expiryDate: cleanExpiry,
        manufacturingDate: cleanMfg,
        batches: initialBatches,
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
          <Text style={styles.microSectionLabel}>BASIC PRODUCT INFO</Text>

          <InputField
            label="Product Name *"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (errors.name) setErrors((e) => ({ ...e, name: '' }));
            }}
            placeholder="e.g. Milo Refill Pack 400g"
            icon={<Package size={18} color={Colors.textMuted} />}
            error={errors.name}
          />

          <SelectField
            label="Category *"
            value={category}
            options={CATEGORIES}
            onSelect={setCategory}
          />

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <InputField
                label="SKU or Code"
                value={sku}
                onChangeText={setSku}
                placeholder="e.g. MILO-01"
                icon={<Tag size={16} color={Colors.textMuted} />}
              />
            </View>
            <View style={styles.halfCol}>
              <InputField
                label="Barcode (Optional)"
                value={barcode}
                onChangeText={setBarcode}
                placeholder="Scan or type"
                icon={<Barcode size={16} color={Colors.textMuted} />}
              />
            </View>
          </View>

          <Text style={[styles.microSectionLabel, { marginTop: Spacing.md }]}>
            STOCK & UNIT
          </Text>

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <InputField
                label="Initial Quantity *"
                value={quantity}
                onChangeText={(t) => {
                  setQuantity(t);
                  if (errors.quantity) setErrors((e) => ({ ...e, quantity: '' }));
                }}
                placeholder="0"
                keyboardType="numeric"
                icon={<Layers size={16} color={Colors.textMuted} />}
                error={errors.quantity}
              />
            </View>
            <View style={styles.halfCol}>
              <SelectField
                label="Unit of Measurement *"
                value={unit}
                options={UNITS}
                onSelect={setUnit}
              />
            </View>
          </View>

          <Text style={[styles.microSectionLabel, { marginTop: Spacing.md }]}>
            PRICING & MARGIN
          </Text>

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <InputField
                label={`Cost Price (${settings.currency}) *`}
                value={buyingPrice}
                onChangeText={(t) => {
                  setBuyingPrice(t);
                  if (errors.buyingPrice) setErrors((e) => ({ ...e, buyingPrice: '' }));
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
                icon={<DollarSign size={16} color={Colors.textMuted} />}
                error={errors.buyingPrice}
              />
            </View>
            <View style={styles.halfCol}>
              <InputField
                label={`Selling Price (${settings.currency}) *`}
                value={sellingPrice}
                onChangeText={(t) => {
                  setSellingPrice(t);
                  if (errors.sellingPrice) setErrors((e) => ({ ...e, sellingPrice: '' }));
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
                icon={<DollarSign size={16} color={Colors.textMuted} />}
                error={errors.sellingPrice}
              />
            </View>
          </View>

          {/* Live Margin Calculation Preview */}
          {sellNum > 0 && costNum > 0 && (
            <View style={styles.marginPreview}>
              <View style={styles.marginIconWrap}>
                <TrendingUp size={16} color={Colors.freshGreen} />
              </View>
              <View style={styles.marginTexts}>
                <Text style={styles.marginTitle}>
                  Margin: {marginPercent}% • Profit: {settings.currency}{profitPerUnit.toFixed(2)}/unit
                </Text>
                <Text style={styles.marginSub}>
                  {profitPerUnit >= 0 ? 'Profitable markup' : 'Warning: Selling below cost price'}
                </Text>
              </View>
            </View>
          )}

          <Text style={[styles.microSectionLabel, { marginTop: Spacing.md }]}>
            INVENTORY ALERTS
          </Text>

          <InputField
            label="Low-Stock Alert Threshold"
            value={lowStockThreshold}
            onChangeText={setLowStockThreshold}
            placeholder="5"
            keyboardType="numeric"
            suffix={unit}
          />

          <Text style={[styles.microSectionLabel, { marginTop: Spacing.md }]}>
            EXPIRY & BATCH TRACKING (OPTIONAL)
          </Text>

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <InputField
                label="Expiry Date"
                value={expiryDate}
                onChangeText={(t) => {
                  setExpiryDate(t);
                  if (errors.expiryDate) setErrors((e) => ({ ...e, expiryDate: '' }));
                }}
                placeholder="YYYY-MM-DD"
                icon={<Calendar size={16} color={Colors.textMuted} />}
                error={errors.expiryDate}
              />
            </View>
            <View style={styles.halfCol}>
              <InputField
                label="Mfg Date (Opt)"
                value={manufacturingDate}
                onChangeText={(t) => {
                  setManufacturingDate(t);
                  if (errors.manufacturingDate) setErrors((e) => ({ ...e, manufacturingDate: '' }));
                }}
                placeholder="YYYY-MM-DD"
                icon={<Clock size={16} color={Colors.textMuted} />}
                error={errors.manufacturingDate}
              />
            </View>
          </View>

          <InputField
            label="Batch or Lot Number (Optional)"
            value={batchNumber}
            onChangeText={setBatchNumber}
            placeholder="e.g. LOT-2026-A"
            icon={<Tag size={16} color={Colors.textMuted} />}
          />

          {/* Live Expiry Status Preview Card */}
          {expiryPreview && (
            <View
              style={[
                styles.expiryStatusCard,
                { backgroundColor: expiryPreview.bgColor, borderColor: expiryPreview.borderColor },
              ]}
            >
              <View style={styles.expiryStatusHeader}>
                <View style={styles.expiryStatusBadgeRow}>
                  {expiryPreview.isExpired ? (
                    <AlertTriangle size={15} color={expiryPreview.color} />
                  ) : (
                    <CheckCircle2 size={15} color={expiryPreview.color} />
                  )}
                  <Text style={[styles.expiryStatusBadgeText, { color: expiryPreview.color }]}>
                    {expiryPreview.badgeText}
                  </Text>
                </View>

                <Text style={styles.expiryDaysText}>
                  {expiryPreview.isExpired
                    ? `Overdue by ${Math.abs(expiryPreview.daysRemaining ?? 0)} days`
                    : `${expiryPreview.daysRemaining} days remaining`}
                </Text>
              </View>

              {expiryPreview.isExpired && (
                <Text style={styles.expiredWarningText}>
                  WARNING: This product is expired and cannot be sold.
                </Text>
              )}
            </View>
          )}

          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              style={styles.cancelBtn}
            />
            <Button
              title="Save Product"
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
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfCol: {
    flex: 1,
  },
  marginPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.emeraldLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  marginIconWrap: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marginTexts: {
    flex: 1,
  },
  marginTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.deepEmerald,
  },
  marginSub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  expiryStatusCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  expiryStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryStatusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  expiryStatusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  expiryDaysText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  expiredWarningText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.softRed,
    marginTop: Spacing.xs,
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
