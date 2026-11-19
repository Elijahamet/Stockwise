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
import { Users, Mail, Phone, ArrowRight } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { SelectField } from '../../components/forms/SelectField';
import { Button } from '../../components/buttons/Button';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export default function OnboardingInviteEmployeesScreen() {
  const { addEmployee } = useApp();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [role, setRole] = useState<UserRole>('staff');

  const [error, setError] = useState('');

  const handleInviteAndContinue = () => {
    if (name.trim()) {
      addEmployee({
        name: name.trim(),
        contact: contact.trim() || 'No contact provided',
        role,
        status: 'invited',
        permissions: {
          canManageInventory: role === 'manager',
          canAddStock: true,
          canRemoveStock: role === 'manager',
          canRecordSales: true,
          canViewReports: role === 'manager',
          canManageEmployees: false,
          canChangeSettings: false,
        },
      });
    }

    router.push('/onboarding/completion');
  };

  const handleSkip = () => {
    router.push('/onboarding/completion');
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
          <Text style={styles.stepTag}>Step 4 of 4 (Optional)</Text>
          <Text style={styles.title}>Invite your team</Text>
          <Text style={styles.subtitle}>
            Empower store attendants and shop assistants to record sales and stock updates.
          </Text>
        </View>

        <View style={styles.formCard}>
          <InputField
            label="Worker Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Ama Osei"
            icon={<Users size={18} color={Colors.textMuted} />}
          />

          <InputField
            label="Phone Number or Email"
            value={contact}
            onChangeText={setContact}
            placeholder="e.g. 0555 333 222 or ama@gmail.com"
            icon={<Phone size={18} color={Colors.textMuted} />}
          />

          <SelectField
            label="Assigned Role"
            value={role}
            options={[
              { label: 'Shop Attendant / Staff', value: 'staff' },
              { label: 'Store Manager', value: 'manager' },
            ]}
            onSelect={(val) => setRole(val as UserRole)}
          />

          <View style={styles.roleSummary}>
            <Text style={styles.roleTitle}>Role summary:</Text>
            <Text style={styles.roleDescription}>
              {role === 'staff'
                ? 'Can record daily sales and view product stock levels.'
                : 'Can manage stock movements, view reports, and manage inventory.'}
            </Text>
          </View>

          <Button
            title={name.trim() ? 'Invite & Finish' : 'Finish Setup'}
            onPress={handleInviteAndContinue}
            size="lg"
            icon={<ArrowRight size={18} color={Colors.white} />}
            iconPosition="right"
            style={styles.submitBtn}
          />

          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip, I will invite team members later</Text>
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
  },
  roleSummary: {
    backgroundColor: Colors.softBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  roleTitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: 2,
  },
  roleDescription: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  submitBtn: {
    marginTop: Spacing.xs,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skipText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});
