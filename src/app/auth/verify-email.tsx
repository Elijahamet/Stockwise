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
import { Mail, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/buttons/Button';
import { useApp } from '../../context/AppContext';

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { setIsOnboarded } = useApp();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleVerify = () => {
    if (!code.trim() || code.length < 4) {
      setError('Please enter the 4 or 6-digit verification code');
      return;
    }

    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsOnboarded(true);
      router.replace('/(tabs)');
    }, 600);
  };

  const handleResend = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
          <View style={styles.iconCircle}>
            <Mail size={32} color={Colors.freshGreen} />
          </View>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a verification code to{' '}
            <Text style={styles.emailHighlight}>{email || 'your email'}</Text>. Enter the code below to verify your account.
          </Text>
        </View>

        <View style={styles.formCard}>
          <InputField
            label="Verification Code"
            value={code}
            onChangeText={(t) => {
              setCode(t);
              setError('');
            }}
            placeholder="e.g. 543210"
            keyboardType="number-pad"
            error={error}
          />

          <Button
            title="Verify & Continue"
            onPress={handleVerify}
            loading={loading}
            size="lg"
            style={styles.actionBtn}
          />

          <View style={styles.resendRow}>
            {resendCooldown > 0 ? (
              <Text style={styles.cooldownText}>
                Resend code in {resendCooldown}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendText}>Didn't receive email? Resend code</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.footerRow}>
          <TouchableOpacity onPress={() => router.push('/auth/verify-phone')}>
            <Text style={styles.footerLink}>Switch to phone verification instead</Text>
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
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.charcoal,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  emailHighlight: {
    fontWeight: '700',
    color: Colors.charcoal,
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
  resendRow: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  resendText: {
    ...Typography.bodySmall,
    color: Colors.freshGreen,
    fontWeight: '600',
  },
  cooldownText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
  footerRow: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  footerLink: {
    ...Typography.bodySmall,
    color: Colors.deepEmerald,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
