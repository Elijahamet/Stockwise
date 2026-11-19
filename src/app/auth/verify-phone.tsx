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
import { Phone, Smartphone, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/buttons/Button';
import { useApp } from '../../context/AppContext';

export default function VerifyPhoneScreen() {
  const { setIsOnboarded, setUser } = useApp();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCodeSent(true);
    }, 600);
  };

  const handleVerifyOtp = () => {
    if (!otpCode.trim() || otpCode.length < 4) {
      setError('Please enter the 4 or 6-digit SMS code');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUser({
        id: `user-phone-${Date.now()}`,
        fullName: 'Store Partner',
        phoneNumber,
        email: 'user@stockwise.store',
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
          <View style={styles.iconCircle}>
            <Smartphone size={32} color={Colors.freshGreen} />
          </View>
          <Text style={styles.title}>Phone Verification</Text>
          <Text style={styles.subtitle}>
            Authenticate instantly via SMS one-time password (OTP).
          </Text>
        </View>

        <View style={styles.formCard}>
          {!codeSent ? (
            <>
              <InputField
                label="Phone Number"
                value={phoneNumber}
                onChangeText={(t) => {
                  setPhoneNumber(t);
                  setError('');
                }}
                placeholder="e.g. 0244 123 456"
                keyboardType="phone-pad"
                icon={<Phone size={18} color={Colors.textMuted} />}
                error={error}
              />

              <Button
                title="Send SMS Code"
                onPress={handleSendCode}
                loading={loading}
                size="lg"
                style={styles.actionBtn}
              />
            </>
          ) : (
            <>
              <View style={styles.codeSentInfo}>
                <Text style={styles.sentInfoText}>
                  SMS sent to <Text style={styles.phoneHighlight}>{phoneNumber}</Text>
                </Text>
                <TouchableOpacity onPress={() => setCodeSent(false)}>
                  <Text style={styles.changePhoneText}>Change number</Text>
                </TouchableOpacity>
              </View>

              <InputField
                label="SMS One-Time Code"
                value={otpCode}
                onChangeText={(t) => {
                  setOtpCode(t);
                  setError('');
                }}
                placeholder="e.g. 892341"
                keyboardType="number-pad"
                error={error}
              />

              <Button
                title="Verify & Enter Dashboard"
                onPress={handleVerifyOtp}
                loading={loading}
                size="lg"
                style={styles.actionBtn}
              />
            </>
          )}
        </View>

        <View style={styles.footerRow}>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.footerLink}>Return to Password Login</Text>
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
  codeSentInfo: {
    backgroundColor: Colors.softBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentInfoText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  phoneHighlight: {
    fontWeight: '700',
    color: Colors.charcoal,
  },
  changePhoneText: {
    ...Typography.caption,
    color: Colors.freshGreen,
    fontWeight: '700',
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
