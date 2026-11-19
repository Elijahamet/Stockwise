import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  Package,
  Tag,
  Barcode,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../../constants/theme';
import { InputField } from '../../../components/forms/InputField';
import { SelectField } from '../../../components/forms/SelectField';
import { Button } from '../../../components/buttons/Button';
import { useApp } from '../../../context/AppContext';
import { calculateExpiryStatus, parseLocalDate } from '../../../utils/expiry';

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

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProductById, updateProduct, settings } = useApp();

  const product = getProductById(id);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [expiryDate, setExpiryDate] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setSku(product.sku);
      setBarcode(product.barcode || '');
      setUnit(product.unit);
      setBuyingPrice(product.buyingPrice.toString());
      setSellingPrice(product.sellingPrice.toString());
      setLowStockThreshold(product.lowStockThreshold.toString());
      setExpiryDate(product.expiryDate || '');
      setManufacturingDate(product.manufacturingDate || '');
    }
  }, [product]);

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Product not found</Text>
      </View>
    );
  }

  const costNum = Number(buyingPrice) || 0;
  const sellNum = Number(sellingPrice) || 0;
  const profitPerUnit = sellNum - costNum;
  const marginPercent = sellNum > 0 ? Math.round((profitPerUnit / sellNum) * 100) : 0;

  // Live expiry status preview
  const expiryPreview = expiryDate.trim().length >= 8 ? calculateExpiryStatus(expiryDate.trim()) : null;

  const validate = () => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = 'Product name is required';
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

  const handleUpdate = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      updateProduct(product.id, {
        name: name.trim(),
        category,
        sku: sku.trim(),
        barcode: barcode.trim() || undefined,
        unit,
        buyingPrice: Number(buyingPrice),
        sellingPrice: Number(sellingPrice),
        lowStockThreshold: Number(lowStockThreshold) || 5,
        expiryDate: expiryDate.trim() || undefined,
        manufacturingDate: manufacturingDate.trim() || undefined,
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
          <Text style={styles.microSectionLabel}>PRODUCT IDENTITY</Text>

          <InputField
            label="Product Name *"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (errors.name) setErrors((e) => ({ ...e, name: '' }));
            }}
            placeholder="Product name"
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
                label="SKU / Code"
                value={sku}
                onChangeText={setSku}
                placeholder="SKU"
                icon={<Tag size={16} color={Colors.textMuted} />}
              />
            </View>
            <View style={styles.halfCol}>
              <InputField
                label="Barcode (Optional)"
                value={barcode}
                onChangeText={setBarcode}
                placeholder="Barcode"
                icon={<Barcode size={16} color={Colors.textMuted} />}
              />
            </View>
          </View>

          <SelectField
            label="Measurement Unit *"
            value={unit}
            options={UNITS}
            onSelect={setUnit}
          />

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
            EXPIRY DATE & STATUS (OPTIONAL)
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
                  WARNING: THIS PRODUCT HAS EXPIRED. DO NOT SELL IT.
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
              title="Save Changes"
              onPress={handleUpdate}
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    ...Typography.body,
    color: Colors.textMuted,
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
