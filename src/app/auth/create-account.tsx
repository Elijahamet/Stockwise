import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { User, Phone, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/buttons/Button';
import { useApp } from '../../context/AppContext';

export default function CreateAccountScreen() {
  const { setUser, setIsOnboarded } = useApp();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!fullName.trim()) err.fullName = 'Full name is required';
    if (!phoneNumber.trim()) err.phoneNumber = 'Phone number is required';
    if (!email.trim() || !email.includes('@')) err.email = 'Valid email is required';
    if (!password || password.length < 6) err.password = 'Min 6 characters required';
    if (password !== confirmPassword) err.confirmPassword = 'Passwords do not match';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setUser({
        id: `user-${Date.now()}`,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim().toLowerCase(),
        role: 'owner',
      });
      // Navigate to email verification screen to demonstrate multi-step flow
      router.push({
        pathname: '/auth/verify-email',
        params: { email: email.trim() },
      });
    }, 600);
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
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={Colors.deepEmerald} />
          </TouchableOpacity>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Sign up to start managing stock and transactions offline.
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
            placeholder="e.g. Ama Darko"
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
            placeholder="e.g. 0544 987 654"
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
            placeholder="e.g. ama@store.com"
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
            placeholder="Confirm password"
            secureTextEntry
            icon={<Lock size={18} color={Colors.textMuted} />}
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            size="lg"
            icon={<UserPlus size={18} color={Colors.white} />}
            style={styles.btn}
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
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
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
  btn: {
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
