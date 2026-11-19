import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { DollarSign, Check, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/buttons/Button';

interface CurrencyOption {
  name: string;
  symbol: string;
  code: string;
  country: string;
}

const CURRENCIES: CurrencyOption[] = [
  { name: 'Ghanaian Cedi (Default)', symbol: 'GH₵', code: 'GHS', country: 'Ghana' },
  { name: 'US Dollar', symbol: '$', code: 'USD', country: 'United States' },
  { name: 'Nigerian Naira', symbol: '₦', code: 'NGN', country: 'Nigeria' },
  { name: 'Kenyan Shilling', symbol: 'KSh', code: 'KES', country: 'Kenya' },
  { name: 'British Pound', symbol: '£', code: 'GBP', country: 'United Kingdom' },
  { name: 'Euro', symbol: '€', code: 'EUR', country: 'European Union' },
  { name: 'West African CFA Franc', symbol: 'CFA', code: 'XOF', country: 'West Africa' },
  { name: 'South African Rand', symbol: 'R', code: 'ZAR', country: 'South Africa' },
];

export default function CurrencySettingsScreen() {
  const { settings, updateSettings, business, updateBusiness } = useApp();

  const [selectedCode, setSelectedCode] = useState(settings.currencyCode || 'GHS');
  const [customSymbol, setCustomSymbol] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSelect = (curr: CurrencyOption) => {
    setSelectedCode(curr.code);
    updateSettings({ currency: curr.symbol, currencyCode: curr.code });
    if (business) {
      updateBusiness({ currency: curr.symbol, currencyCode: curr.code });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleApplyCustom = () => {
    if (customSymbol.trim()) {
      updateSettings({
        currency: customSymbol.trim(),
        currencyCode: customSymbol.trim(),
      });
      if (business) {
        updateBusiness({
          currency: customSymbol.trim(),
          currencyCode: customSymbol.trim(),
        });
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isSaved && (
          <View style={styles.successBanner}>
            <CheckCircle2 size={16} color={Colors.freshGreen} />
            <Text style={styles.successText}>Currency updated across the entire app!</Text>
          </View>
        )}

        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>Select Store Currency</Text>
          <Text style={styles.headerSubtitle}>
            Stockwise defaults to Ghanaian Cedi (GH₵). Changing currency affects how prices and receipts are formatted.
          </Text>
        </View>

        <View style={styles.currencyListCard}>
          {CURRENCIES.map((curr) => {
            const isSelected = selectedCode === curr.code;
            return (
              <TouchableOpacity
                key={curr.code}
                style={[styles.currencyItem, isSelected && styles.selectedItem]}
                onPress={() => handleSelect(curr)}
                activeOpacity={0.7}
              >
                <View style={styles.symbolCircle}>
                  <Text style={styles.symbolText}>{curr.symbol}</Text>
                </View>

                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyName}>{curr.name}</Text>
                  <Text style={styles.currencyMeta}>
                    {curr.code} • {curr.country}
                  </Text>
                </View>

                {isSelected && <Check size={20} color={Colors.freshGreen} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Currency Symbol Section */}
        <View style={styles.customCard}>
          <Text style={styles.customTitle}>Custom Currency Symbol</Text>
          <Text style={styles.customDesc}>
            If your preferred regional currency is not listed above, enter its symbol below:
          </Text>

          <View style={styles.customRow}>
            <InputField
              value={customSymbol}
              onChangeText={setCustomSymbol}
              placeholder="e.g. UGX, TZS, or د.إ"
              style={{ flex: 1, marginBottom: 0 }}
            />
            <Button
              title="Apply"
              onPress={handleApplyCustom}
              style={{ minWidth: 90 }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.softBackground,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.emeraldLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.freshGreen,
  },
  successText: {
    ...Typography.bodySmall,
    color: Colors.deepEmerald,
    fontWeight: '600',
  },
  headerBox: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.charcoal,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },
  currencyListCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  selectedItem: {
    backgroundColor: Colors.emeraldLight,
  },
  symbolCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.softBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  symbolText: {
    ...Typography.body,
    fontWeight: '800',
    color: Colors.deepEmerald,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyName: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  currencyMeta: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 1,
  },
  customCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  customTitle: {
    ...Typography.h4,
    color: Colors.charcoal,
  },
  customDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
