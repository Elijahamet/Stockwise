import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Users, Phone, ShieldCheck, UserCheck, Shield } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/buttons/Button';
import { useApp } from '../../context/AppContext';
import { UserRole, EmployeePermissions } from '../../types';

export default function AddEmployeeScreen() {
  const { addEmployee } = useApp();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [role, setRole] = useState<UserRole>('staff');

  const [permissions, setPermissions] = useState<EmployeePermissions>({
    canManageInventory: false,
    canAddStock: true,
    canRemoveStock: false,
    canRecordSales: true,
    canViewReports: false,
    canManageEmployees: false,
    canChangeSettings: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'manager') {
      setPermissions({
        canManageInventory: true,
        canAddStock: true,
        canRemoveStock: true,
        canRecordSales: true,
        canViewReports: true,
        canManageEmployees: false,
        canChangeSettings: false,
      });
    } else {
      setPermissions({
        canManageInventory: false,
        canAddStock: true,
        canRemoveStock: false,
        canRecordSales: true,
        canViewReports: false,
        canManageEmployees: false,
        canChangeSettings: false,
      });
    }
  };

  const togglePermission = (key: keyof EmployeePermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = 'Employee name is required';
    if (!contact.trim()) err.contact = 'Phone or email is required';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addEmployee({
        name: name.trim(),
        contact: contact.trim(),
        role,
        permissions,
        status: 'active',
      });

      router.back();
    }, 350);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <Text style={styles.microSectionLabel}>TEAM MEMBER PROFILE</Text>

          <InputField
            label="Full Name *"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (errors.name) setErrors((e) => ({ ...e, name: '' }));
            }}
            placeholder="e.g. Yaw Boateng"
            icon={<Users size={18} color={Colors.textMuted} />}
            error={errors.name}
          />

          <InputField
            label="Phone Number or Email *"
            value={contact}
            onChangeText={(t) => {
              setContact(t);
              if (errors.contact) setErrors((e) => ({ ...e, contact: '' }));
            }}
            placeholder="e.g. 0544 111 222 or yaw@store.com"
            icon={<Phone size={18} color={Colors.textMuted} />}
            error={errors.contact}
          />

          <Text style={[styles.microSectionLabel, { marginTop: Spacing.md }]}>
            ASSIGN ROLE
          </Text>

          <View style={styles.roleSelectionRow}>
            {/* Staff Card */}
            <TouchableOpacity
              style={[styles.roleCard, role === 'staff' && styles.activeRoleCard]}
              onPress={() => handleRoleChange('staff')}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIconWrap, role === 'staff' && styles.activeRoleIconWrap]}>
                <UserCheck size={20} color={role === 'staff' ? Colors.white : Colors.textMuted} />
              </View>
              <Text style={[styles.roleTitle, role === 'staff' && styles.activeRoleTitle]}>
                Shop Staff
              </Text>
              <Text style={styles.roleDesc}>
                Processes checkouts & records routine stock in/out
              </Text>
            </TouchableOpacity>

            {/* Manager Card */}
            <TouchableOpacity
              style={[styles.roleCard, role === 'manager' && styles.activeRoleCard]}
              onPress={() => handleRoleChange('manager')}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIconWrap, role === 'manager' && styles.activeRoleIconWrap]}>
                <Shield size={20} color={role === 'manager' ? Colors.white : Colors.textMuted} />
              </View>
              <Text style={[styles.roleTitle, role === 'manager' && styles.activeRoleTitle]}>
                Store Manager
              </Text>
              <Text style={styles.roleDesc}>
                Full stock audits, product catalogs & reports
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Granular Permissions Section */}
        <View style={styles.formCard}>
          <View style={styles.permHeader}>
            <ShieldCheck size={18} color={Colors.deepEmerald} />
            <Text style={styles.sectionTitle}>Access Privileges</Text>
          </View>
          <Text style={styles.permSubtitle}>
            Fine-tune security and operational access for this team member.
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Record Sales & Receipts</Text>
              <Text style={styles.switchDesc}>Process customer checkouts & receipts</Text>
            </View>
            <Switch
              value={permissions.canRecordSales}
              onValueChange={() => togglePermission('canRecordSales')}
              trackColor={{ false: Colors.border, true: Colors.freshGreen }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Restock / Add Stock</Text>
              <Text style={styles.switchDesc}>Log incoming purchases & deliveries</Text>
            </View>
            <Switch
              value={permissions.canAddStock}
              onValueChange={() => togglePermission('canAddStock')}
              trackColor={{ false: Colors.border, true: Colors.freshGreen }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Remove / Deduct Stock</Text>
              <Text style={styles.switchDesc}>Write-off damaged, expired, or lost stock</Text>
            </View>
            <Switch
              value={permissions.canRemoveStock}
              onValueChange={() => togglePermission('canRemoveStock')}
              trackColor={{ false: Colors.border, true: Colors.freshGreen }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Manage Product Catalog</Text>
              <Text style={styles.switchDesc}>Add, edit, or delete items and pricing</Text>
            </View>
            <Switch
              value={permissions.canManageInventory}
              onValueChange={() => togglePermission('canManageInventory')}
              trackColor={{ false: Colors.border, true: Colors.freshGreen }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>View Financial Reports</Text>
              <Text style={styles.switchDesc}>Access revenue, valuation, & margins</Text>
            </View>
            <Switch
              value={permissions.canViewReports}
              onValueChange={() => togglePermission('canViewReports')}
              trackColor={{ false: Colors.border, true: Colors.freshGreen }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Manage Team Members</Text>
              <Text style={styles.switchDesc}>Invite, edit, or remove workers</Text>
            </View>
            <Switch
              value={permissions.canManageEmployees}
              onValueChange={() => togglePermission('canManageEmployees')}
              trackColor={{ false: Colors.border, true: Colors.freshGreen }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Modify Business Settings</Text>
              <Text style={styles.switchDesc}>Change currency, units, and profile</Text>
            </View>
            <Switch
              value={permissions.canChangeSettings}
              onValueChange={() => togglePermission('canChangeSettings')}
              trackColor={{ false: Colors.border, true: Colors.freshGreen }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              style={styles.cancelBtn}
            />
            <Button
              title="Add Team Member"
              onPress={handleSave}
              loading={loading}
              style={styles.saveBtn}
            />
          </View>
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
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  microSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  roleSelectionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.softBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    textAlign: 'center',
  },
  activeRoleCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.deepEmerald,
    ...Shadows.sm,
  },
  roleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  activeRoleIconWrap: {
    backgroundColor: Colors.deepEmerald,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: 4,
  },
  activeRoleTitle: {
    color: Colors.deepEmerald,
    fontWeight: '800',
  },
  roleDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },
  permHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  permSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  switchDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 2,
  },
});
