import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { User, Phone, Mail, Shield, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/buttons/Button';
import { useApp } from '../../context/AppContext';

export default function PersonalProfileScreen() {
  const { user, setUser } = useApp();

  const [fullName, setFullName] = useState(user?.fullName || 'Business Owner');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '0244 000 111');
  const [email, setEmail] = useState(user?.email || 'owner@store.com');

  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUser({
        id: user?.id || `user-${Date.now()}`,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        role: user?.role || 'owner',
      });
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
            <Text style={styles.successText}>Personal profile updated!</Text>
          </View>
        )}

        <View style={styles.formCard}>
          <View style={styles.roleHeader}>
            <View style={styles.roleIconWrap}>
              <Shield size={20} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.roleTitle}>Account Level: Owner</Text>
              <Text style={styles.roleSubtitle}>
                Master administrator with unrestricted store access.
              </Text>
            </View>
          </View>

          <InputField
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            icon={<User size={18} color={Colors.textMuted} />}
          />

          <InputField
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            icon={<Phone size={18} color={Colors.textMuted} />}
          />

          <InputField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={18} color={Colors.textMuted} />}
          />

          <Button
            title="Update Profile"
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
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.deepEmerald,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  roleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.freshGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.white,
  },
  roleSubtitle: {
    ...Typography.caption,
    color: Colors.emeraldLight,
    marginTop: 2,
  },
  saveBtn: {
    marginTop: Spacing.sm,
  },
});
