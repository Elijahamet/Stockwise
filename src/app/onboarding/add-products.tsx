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
import { router } from 'expo-router';
import { Package, Tag, Barcode, DollarSign, ArrowRight } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { SelectField } from '../../components/forms/SelectField';
import { Button } from '../../components/buttons/Button';
import { useApp } from '../../context/AppContext';

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

export default function OnboardingAddProductsScreen() {
  const { addProduct, settings } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) < 0) {
      newErrors.quantity = 'Enter a valid non-negative quantity';
    }
    if (!buyingPrice.trim() || isNaN(Number(buyingPrice)) || Number(buyingPrice) < 0) {
      newErrors.buyingPrice = 'Enter a valid cost price';
    }
    if (!sellingPrice.trim() || isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) {
      newErrors.sellingPrice = 'Enter a valid selling price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = () => {
    if (!validate()) return;

    addProduct({
      name: name.trim(),
      category,
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      barcode: barcode.trim() || undefined,
      quantity: Number(quantity),
      unit,
      buyingPrice: Number(buyingPrice),
      sellingPrice: Number(sellingPrice),
      lowStockThreshold: Number(lowStockThreshold) || 5,
    });

    router.push('/onboarding/invite-employees');
  };

  const handleSkip = () => {
    router.push('/onboarding/invite-employees');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.stepTag}>Step 3 of 4</Text>
          <Text style={styles.title}>Add your first product</Text>
          <Text style={styles.subtitle}>
            Enter a product to initialize your inventory, or skip to explore the dashboard.
          </Text>
        </View>

        <View style={styles.formCard}>
          <InputField
            label="Product Name *"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (errors.name) setErrors((e) => ({ ...e, name: '' }));
            }}
            placeholder="e.g. Carnation Evaporated Milk"
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
                placeholder="e.g. MILK-01"
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
                error={errors.quantity}
              />
            </View>
            <View style={styles.halfCol}>
              <SelectField
                label="Unit *"
                value={unit}
                options={UNITS}
                onSelect={setUnit}
              />
            </View>
          </View>

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

          <InputField
            label="Low-Stock Alert Threshold"
            value={lowStockThreshold}
            onChangeText={setLowStockThreshold}
            placeholder="5"
            keyboardType="numeric"
            suffix="units"
          />

          <Button
            title="Save Product & Continue"
            onPress={handleSaveAndContinue}
            size="lg"
            icon={<ArrowRight size={18} color={Colors.white} />}
            iconPosition="right"
            style={styles.submitBtn}
          />

          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip for now, I will add products later</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.softBackground,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  stepTag: {
    ...Typography.caption,
    color: Colors.freshGreen,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    ...Typography.h2,
    color: Colors.charcoal,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfCol: {
    flex: 1,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skipText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});
