import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Store, Phone, Mail, MapPin, Globe, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { SelectField } from '../../components/forms/SelectField';
import { Button } from '../../components/buttons/Button';
import { useApp } from '../../context/AppContext';
import { BusinessType } from '../../types';

const BUSINESS_TYPES: BusinessType[] = [
  'Supermarket',
  'Grocery shop',
  'Provision shop',
  'Retail store',
  'Pharmacy',
  'Wholesale shop',
  'Other',
];

export default function BusinessProfileScreen() {
  const { business, updateBusiness, setBusiness, settings } = useApp();

  const [name, setName] = useState(business?.name || '');
  const [type, setType] = useState<BusinessType>(business?.type || 'Provision shop');
  const [phoneNumber, setPhoneNumber] = useState(business?.phoneNumber || '');
  const [email, setEmail] = useState(business?.email || '');
  const [country, setCountry] = useState(business?.country || 'Ghana');
  const [region, setRegion] = useState(business?.region || 'Greater Accra');
  const [city, setCity] = useState(business?.city || 'Accra');
  const [address, setAddress] = useState(business?.address || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = 'Business name is required';
    if (!phoneNumber.trim()) err.phoneNumber = 'Phone number is required';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const bizData = {
        name: name.trim(),
        type,
        phoneNumber: phoneNumber.trim(),
        email: email.trim() || undefined,
        country: country.trim(),
        region: region.trim(),
        city: city.trim(),
        address: address.trim() || undefined,
      };

      if (business) {
        updateBusiness(bizData);
      } else {
        setBusiness({
          ...bizData,
          id: `biz-${Date.now()}`,
          currency: settings.currency,
          currencyCode: settings.currencyCode,
          createdAt: new Date().toISOString(),
        });
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
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
      >
        {isSaved && (
          <View style={styles.successBanner}>
            <CheckCircle2 size={16} color={Colors.freshGreen} />
            <Text style={styles.successText}>Business profile updated successfully!</Text>
          </View>
        )}

        <View style={styles.formCard}>
          <InputField
            label="Business Name *"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (errors.name) setErrors((e) => ({ ...e, name: '' }));
            }}
            placeholder="Store name"
            icon={<Store size={18} color={Colors.textMuted} />}
            error={errors.name}
          />

          <SelectField
            label="Business Type *"
            value={type}
            options={BUSINESS_TYPES}
            onSelect={(val) => setType(val as BusinessType)}
          />

          <InputField
            label="Store Contact Phone *"
            value={phoneNumber}
            onChangeText={(t) => {
              setPhoneNumber(t);
              if (errors.phoneNumber) setErrors((e) => ({ ...e, phoneNumber: '' }));
            }}
            placeholder="Store phone"
            keyboardType="phone-pad"
            icon={<Phone size={18} color={Colors.textMuted} />}
            error={errors.phoneNumber}
          />

          <InputField
            label="Store Email (Optional)"
            value={email}
            onChangeText={setEmail}
            placeholder="Store email"
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={18} color={Colors.textMuted} />}
          />

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <InputField
                label="Country"
                value={country}
                onChangeText={setCountry}
                icon={<Globe size={16} color={Colors.textMuted} />}
              />
            </View>
            <View style={styles.halfCol}>
              <InputField
                label="Region / State"
                value={region}
                onChangeText={setRegion}
              />
            </View>
          </View>

          <InputField
            label="City / Town"
            value={city}
            onChangeText={setCity}
            icon={<MapPin size={18} color={Colors.textMuted} />}
          />

          <InputField
            label="Physical Store Address / Landmark"
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. Oxford Street, Shop 4"
            icon={<MapPin size={18} color={Colors.textMuted} />}
          />

          <Button
            title="Save Business Profile"
            onPress={handleSave}
            loading={loading}
            style={styles.saveBtn}
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
  saveBtn: {
    marginTop: Spacing.sm,
  },
});
