import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Shield, Lock, Fingerprint, Key, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { SelectField } from '../../components/forms/SelectField';
import { Button } from '../../components/buttons/Button';

export default function SecuritySettingsScreen() {
  const [requirePin, setRequirePin] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [autoLockTimeout, setAutoLockTimeout] = useState('5 mins');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  const handleUpdatePassword = () => {
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setIsSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isSaved && (
          <View style={styles.successBanner}>
            <CheckCircle2 size={16} color={Colors.freshGreen} />
            <Text style={styles.successText}>Security settings updated successfully!</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>App Protection & Terminal Lock</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchLabel}>Biometric Login</Text>
              <Text style={styles.switchDesc}>
                Unlock Stockwise using Fingerprint or Face ID
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: Colors.border, true: Colors.freshGreen }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchLabel}>Require 4-Digit Security PIN</Text>
              <Text style={styles.switchDesc}>
                Prompt for cash drawer or admin supervisor approval
              </Text>
            </View>
            <Switch
              value={requirePin}
              onValueChange={setRequirePin}
              trackColor={{ false: Colors.border, true: Colors.freshGreen }}
              thumbColor={Colors.white}
            />
          </View>

          <SelectField
            label="Inactivity Auto-Lock Timeout"
            value={autoLockTimeout}
            options={['Immediately', '1 min', '5 mins', '15 mins', 'Never']}
            onSelect={setAutoLockTimeout}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Change Account Password</Text>

          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

          <InputField
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            secureTextEntry
            icon={<Lock size={16} color={Colors.textMuted} />}
          />

          <InputField
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Min 6 characters"
            secureTextEntry
            icon={<Key size={16} color={Colors.textMuted} />}
          />

          <InputField
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repeat new password"
            secureTextEntry
            icon={<Key size={16} color={Colors.textMuted} />}
          />

          <Button
            title="Update Password"
            onPress={handleUpdatePassword}
            style={{ marginTop: Spacing.xs }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
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
  errorBanner: {
    ...Typography.bodySmall,
    color: Colors.softRed,
    backgroundColor: Colors.redLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.charcoal,
    marginBottom: Spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  switchTextCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
  switchLabel: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  switchDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
