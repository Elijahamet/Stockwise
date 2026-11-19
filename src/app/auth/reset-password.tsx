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
import { router, useLocalSearchParams } from 'expo-router';
import { Lock, KeyRound, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/buttons/Button';

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!otpCode.trim() || otpCode.length < 4) err.otpCode = 'Enter the 4 or 6-digit code';
    if (!newPassword || newPassword.length < 6) err.newPassword = 'Min 6 characters';
    if (newPassword !== confirmPassword) err.confirmPassword = 'Passwords do not match';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleReset = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
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
          <Text style={styles.title}>Set new password</Text>
          <Text style={styles.subtitle}>
            Enter the code sent to {email || 'your email'} and choose a strong password.
          </Text>
        </View>

        <View style={styles.formCard}>
          {isSuccess ? (
            <View style={styles.successBox}>
              <CheckCircle2 size={40} color={Colors.freshGreen} />
              <Text style={styles.successTitle}>Password Updated</Text>
              <Text style={styles.successDesc}>
                Your password has been reset successfully. You can now log in with your new credentials.
              </Text>
              <Button
                title="Go to Login"
                onPress={() => router.replace('/auth/login')}
                style={styles.actionBtn}
              />
            </View>
          ) : (
            <>
              <InputField
                label="Reset Code"
                value={otpCode}
                onChangeText={(t) => {
                  setOtpCode(t);
                  if (errors.otpCode) setErrors((e) => ({ ...e, otpCode: '' }));
                }}
                placeholder="e.g. 123456"
                keyboardType="numeric"
                icon={<KeyRound size={18} color={Colors.textMuted} />}
                error={errors.otpCode}
              />

              <InputField
                label="New Password"
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  if (errors.newPassword) setErrors((e) => ({ ...e, newPassword: '' }));
                }}
                placeholder="Enter new password"
                secureTextEntry
                icon={<Lock size={18} color={Colors.textMuted} />}
                error={errors.newPassword}
              />

              <InputField
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: '' }));
                }}
                placeholder="Repeat new password"
                secureTextEntry
                icon={<Lock size={18} color={Colors.textMuted} />}
                error={errors.confirmPassword}
              />

              <Button
                title="Update Password"
                onPress={handleReset}
                loading={loading}
                size="lg"
                style={styles.actionBtn}
              />
            </>
          )}
        </View>

        <View style={styles.footerRow}>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.footerLink}>Return to Log in</Text>
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
  actionBtn: {
    marginTop: Spacing.sm,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  successTitle: {
    ...Typography.h3,
    color: Colors.charcoal,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  successDesc: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  footerRow: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  footerLink: {
    ...Typography.bodySmall,
    color: Colors.freshGreen,
    fontWeight: '700',
  },
});
