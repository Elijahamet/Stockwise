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
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/buttons/Button';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSent(true);
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
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>
            Enter the email associated with your business account. We'll send instructions to reset your password.
          </Text>
        </View>

        <View style={styles.formCard}>
          {isSent ? (
            <View style={styles.successBox}>
              <CheckCircle2 size={40} color={Colors.freshGreen} />
              <Text style={styles.successTitle}>Password Link Sent</Text>
              <Text style={styles.successDesc}>
                We've sent a password reset link to {email}. You can also proceed directly to the reset code screen.
              </Text>
              <Button
                title="Enter Reset Code"
                onPress={() =>
                  router.push({
                    pathname: '/auth/reset-password',
                    params: { email },
                  })
                }
                style={styles.actionBtn}
              />
            </View>
          ) : (
            <>
              <InputField
                label="Email Address"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError('');
                }}
                placeholder="e.g. owner@store.com"
                keyboardType="email-address"
                autoCapitalize="none"
                icon={<Mail size={18} color={Colors.textMuted} />}
                error={error}
              />

              <Button
                title="Send Reset Instructions"
                onPress={handleSend}
                loading={loading}
                size="lg"
                icon={<ArrowRight size={18} color={Colors.white} />}
                iconPosition="right"
                style={styles.actionBtn}
              />
            </>
          )}
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Remembered your password? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.footerLink}>Back to login</Text>
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
    lineHeight: 20,
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
