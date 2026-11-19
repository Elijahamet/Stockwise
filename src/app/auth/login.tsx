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
import { Mail, Lock, LogIn, ArrowRight, Info } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/buttons/Button';
import { useApp } from '../../context/AppContext';

export default function LoginScreen() {
  const { setUser, setIsOnboarded } = useApp();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!emailOrPhone.trim()) {
      setError('Please enter your email or phone number');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setIsLoading(true);

    // Frontend interaction simulation
    setTimeout(() => {
      setIsLoading(false);
      setUser({
        id: 'user-demo',
        fullName: emailOrPhone.split('@')[0] || 'Store Owner',
        phoneNumber: '0244000111',
        email: emailOrPhone.includes('@') ? emailOrPhone : 'owner@stockwise.com',
        role: 'owner',
      });
      setIsOnboarded(true);
      router.replace('/(tabs)');
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Enter your credentials to access your store's offline-ready inventory.
          </Text>
        </View>

        <View style={styles.noticeBanner}>
          <Info size={16} color={Colors.deepEmerald} />
          <Text style={styles.noticeText}>
            Stage 1 frontend preview: You can enter any valid test format to interact with the screens.
          </Text>
        </View>

        <View style={styles.formCard}>
          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

          <InputField
            label="Email or Phone Number"
            value={emailOrPhone}
            onChangeText={(t) => {
              setEmailOrPhone(t);
              setError('');
            }}
            placeholder="e.g. 0244123456 or store@mail.com"
            autoCapitalize="none"
            icon={<Mail size={18} color={Colors.textMuted} />}
          />

          <InputField
            label="Password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setError('');
            }}
            placeholder="Enter password"
            secureTextEntry
            icon={<Lock size={18} color={Colors.textMuted} />}
          />

          <View style={styles.forgotRow}>
            <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Log In"
            onPress={handleLogin}
            loading={isLoading}
            size="lg"
            icon={<LogIn size={18} color={Colors.white} />}
            style={styles.loginBtn}
          />

          <View style={styles.verificationLinks}>
            <TouchableOpacity
              onPress={() => router.push('/auth/verify-phone')}
              style={styles.verifyLink}
            >
              <Text style={styles.verifyLinkText}>Log in with Phone OTP instead</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/create-account')}>
            <Text style={styles.footerLink}>Register store</Text>
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
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.emeraldLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(32, 166, 122, 0.2)',
  },
  noticeText: {
    ...Typography.caption,
    color: Colors.deepEmerald,
    flex: 1,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.lg,
  },
  errorBanner: {
    ...Typography.bodySmall,
    color: Colors.softRed,
    backgroundColor: Colors.redLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
  },
  forgotText: {
    ...Typography.bodySmall,
    color: Colors.freshGreen,
    fontWeight: '600',
  },
  loginBtn: {
    marginBottom: Spacing.md,
  },
  verificationLinks: {
    alignItems: 'center',
    paddingTop: Spacing.xs,
  },
  verifyLink: {
    padding: Spacing.xs,
  },
  verifyLinkText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
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
