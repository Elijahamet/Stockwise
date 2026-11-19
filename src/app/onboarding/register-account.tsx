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
import { User, Phone, Mail, Lock, ArrowRight } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/buttons/Button';
import { useApp } from '../../context/AppContext';

export default function RegisterAccountScreen() {
  const { setUser } = useApp();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    setUser({
      id: `user-${Date.now()}`,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim().toLowerCase(),
      role: 'owner',
    });

    router.push('/onboarding/register-business');
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
          <Text style={styles.stepTag}>Step 1 of 4</Text>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Enter your personal information as the primary business owner.
          </Text>
        </View>

        <View style={styles.formCard}>
          <InputField
            label="Full Name *"
            value={fullName}
            onChangeText={(t) => {
              setFullName(t);
              if (errors.fullName) setErrors((e) => ({ ...e, fullName: '' }));
            }}
            placeholder="e.g. Kwame Mensah"
            icon={<User size={18} color={Colors.textMuted} />}
            error={errors.fullName}
          />

          <InputField
            label="Phone Number *"
            value={phoneNumber}
            onChangeText={(t) => {
              setPhoneNumber(t);
              if (errors.phoneNumber) setErrors((e) => ({ ...e, phoneNumber: '' }));
            }}
            placeholder="e.g. 0244 123 456"
            keyboardType="phone-pad"
            icon={<Phone size={18} color={Colors.textMuted} />}
            error={errors.phoneNumber}
          />

          <InputField
            label="Email Address *"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((e) => ({ ...e, email: '' }));
            }}
            placeholder="e.g. kwame@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={18} color={Colors.textMuted} />}
            error={errors.email}
          />

          <InputField
            label="Password *"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((e) => ({ ...e, password: '' }));
            }}
            placeholder="Create password"
            secureTextEntry
            icon={<Lock size={18} color={Colors.textMuted} />}
            error={errors.password}
          />

          <InputField
            label="Confirm Password *"
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: '' }));
            }}
            placeholder="Repeat password"
            secureTextEntry
            icon={<Lock size={18} color={Colors.textMuted} />}
            error={errors.confirmPassword}
          />

          <Button
            title="Continue to Business Setup"
            onPress={handleNext}
            size="lg"
            icon={<ArrowRight size={18} color={Colors.white} />}
            iconPosition="right"
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.footerLink}>Log in</Text>
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
    marginBottom: Spacing.lg,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  footerLink: {
    ...Typography.bodySmall,
    color: Colors.freshGreen,
    fontWeight: '700',
  },
});
