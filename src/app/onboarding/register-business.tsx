import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Store, Phone, Mail, MapPin, Globe, ArrowRight } from 'lucide-react-native';
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

export default function RegisterBusinessScreen() {
  const { setBusiness, settings } = useApp();

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('Provision shop');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Ghana');
  const [region, setRegion] = useState('Greater Accra');
  const [city, setCity] = useState('Accra');
  const [address, setAddress] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Business phone is required';
    if (!country.trim()) newErrors.country = 'Country is required';
    if (!city.trim()) newErrors.city = 'City or town is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    setBusiness({
      id: `biz-${Date.now()}`,
      name: businessName.trim(),
      type: businessType,
      phoneNumber: phoneNumber.trim(),
      email: email.trim() || undefined,
      country: country.trim(),
      region: region.trim(),
      city: city.trim(),
      address: address.trim() || undefined,
      currency: settings.currency,
      currencyCode: settings.currencyCode,
      createdAt: new Date().toISOString(),
    });

    router.push('/onboarding/add-products');
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
          <Text style={styles.stepTag}>Step 2 of 4</Text>
          <Text style={styles.title}>Register your business</Text>
          <Text style={styles.subtitle}>
            Tell us about your store so we can personalize your inventory experience.
          </Text>
        </View>

        <View style={styles.formCard}>
          <InputField
            label="Business Name *"
            value={businessName}
            onChangeText={(t) => {
              setBusinessName(t);
              if (errors.businessName) setErrors((e) => ({ ...e, businessName: '' }));
            }}
            placeholder="e.g. Mensah Provisions & Mart"
            icon={<Store size={18} color={Colors.textMuted} />}
            error={errors.businessName}
          />

          <SelectField
            label="Business Type *"
            value={businessType}
            options={BUSINESS_TYPES}
            onSelect={(val) => setBusinessType(val as BusinessType)}
          />

          <InputField
            label="Business Phone Number *"
            value={phoneNumber}
            onChangeText={(t) => {
              setPhoneNumber(t);
              if (errors.phoneNumber) setErrors((e) => ({ ...e, phoneNumber: '' }));
            }}
            placeholder="e.g. 0302 987 654"
            keyboardType="phone-pad"
            icon={<Phone size={18} color={Colors.textMuted} />}
            error={errors.phoneNumber}
          />

          <InputField
            label="Business Email (Optional)"
            value={email}
            onChangeText={setEmail}
            placeholder="e.g. store@mensahprovisions.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={18} color={Colors.textMuted} />}
          />

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <InputField
                label="Country *"
                value={country}
                onChangeText={(t) => {
                  setCountry(t);
                  if (errors.country) setErrors((e) => ({ ...e, country: '' }));
                }}
                placeholder="Country"
                icon={<Globe size={16} color={Colors.textMuted} />}
                error={errors.country}
              />
            </View>
            <View style={styles.halfCol}>
              <InputField
                label="Region / State"
                value={region}
                onChangeText={setRegion}
                placeholder="e.g. Greater Accra"
              />
            </View>
          </View>

          <InputField
            label="City or Town *"
            value={city}
            onChangeText={(t) => {
              setCity(t);
              if (errors.city) setErrors((e) => ({ ...e, city: '' }));
            }}
            placeholder="e.g. Accra Central"
            icon={<MapPin size={18} color={Colors.textMuted} />}
            error={errors.city}
          />

          <InputField
            label="Physical Address / Landmark (Optional)"
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. Shop 12, Oxford Street, Osu"
            icon={<MapPin size={18} color={Colors.textMuted} />}
          />

          <Button
            title="Continue to Product Setup"
            onPress={handleNext}
            size="lg"
            icon={<ArrowRight size={18} color={Colors.white} />}
            iconPosition="right"
            style={styles.submitBtn}
          />
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
});
