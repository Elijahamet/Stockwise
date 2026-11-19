import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  User,
  Phone,
  Shield,
  CheckCircle2,
  XCircle,
  History,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/buttons/Button';
import { ConfirmModal } from '../../components/modals/ConfirmModal';

export default function EmployeeProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { employees, deleteEmployee, stockMovements } = useApp();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const employee = employees.find((e) => e.id === id);

  if (!employee) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <User size={48} color={Colors.textLight} />
        <Text style={styles.notFoundTitle}>Employee Record Not Found</Text>
        <Text style={styles.notFoundSubtitle}>
          This team member may have been removed or does not exist.
        </Text>
        <Button
          title="Back to Employees"
          onPress={() => router.replace('/employees')}
          style={styles.backBtn}
        />
      </SafeAreaView>
    );
  }

  // Activity performed by this employee
  const employeeActivities = stockMovements.filter(
    (m) => m.employeeName.toLowerCase() === employee.name.toLowerCase()
  );

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {employee.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </Text>
          </View>

          <Text style={styles.empName}>{employee.name}</Text>
          <Text style={styles.contactText}>{employee.contact}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{employee.role.toUpperCase()}</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.statusBadgeText}>ACTIVE ACCOUNT</Text>
            </View>
          </View>
        </View>

        {/* Permissions Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.microSectionLabel}>ROLE & SYSTEM PRIVILEGES</Text>

          <View style={styles.permissionsGrid}>
            {(
              [
                { label: 'Record Sales & Issue Receipts', active: employee.permissions.canRecordSales },
                { label: 'Add Stock & Receive Purchases', active: employee.permissions.canAddStock },
                { label: 'Remove & Write-Off Stock', active: employee.permissions.canRemoveStock },
                { label: 'Register & Edit Products', active: employee.permissions.canManageInventory },
                { label: 'View Financial & Audit Reports', active: employee.permissions.canViewReports },
                { label: 'Manage Team & Permissions', active: employee.permissions.canManageEmployees },
                { label: 'Modify Store Profile & Settings', active: employee.permissions.canChangeSettings },
              ] as const
            ).map((perm, idx) => (
              <View key={idx} style={styles.permRow}>
                {perm.active ? (
                  <View style={styles.permIconActive}>
                    <CheckCircle2 size={16} color={Colors.freshGreen} />
                  </View>
                ) : (
                  <View style={styles.permIconInactive}>
                    <XCircle size={16} color={Colors.textLight} />
                  </View>
                )}
                <Text
                  style={[
                    styles.permText,
                    !perm.active && styles.permTextInactive,
                  ]}
                >
                  {perm.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Activity Log for this Employee */}
        <View style={styles.sectionCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.microSectionLabel}>AUDIT LOG</Text>
            <Text style={styles.activityCount}>
              {employeeActivities.length} recorded action{employeeActivities.length === 1 ? '' : 's'}
            </Text>
          </View>

          {employeeActivities.length === 0 ? (
            <View style={styles.emptyActivity}>
              <History size={24} color={Colors.textLight} />
              <Text style={styles.emptyText}>
                No actions logged by this worker yet.
              </Text>
            </View>
          ) : (
            <View style={styles.activityList}>
              {employeeActivities.slice(0, 5).map((act, idx) => (
                <View
                  key={act.id}
                  style={[
                    styles.activityItem,
                    idx === employeeActivities.slice(0, 5).length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.actMain}>
                    <Text style={styles.actProduct}>{act.productName}</Text>
                    <Text style={styles.actReason}>{act.reason}</Text>
                  </View>
                  <View style={styles.actRight}>
                    <Text
                      style={[
                        styles.actDiff,
                        { color: act.quantityChange > 0 ? Colors.freshGreen : Colors.charcoal },
                      ]}
                    >
                      {act.quantityChange > 0 ? `+${act.quantityChange}` : act.quantityChange}
                    </Text>
                    <Text style={styles.actTime}>
                      {new Date(act.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Actions Row */}
        <View style={styles.btnRow}>
          <Button
            title="Edit Permissions"
            variant="secondary"
            icon={<Edit2 size={16} color={Colors.white} />}
            onPress={() => router.push(`/employees/edit/${employee.id}` as any)}
            style={styles.actionBtn}
          />

          <Button
            title="Remove"
            variant="danger"
            icon={<Trash2 size={16} color={Colors.white} />}
            onPress={() => setShowDeleteModal(true)}
            style={styles.actionBtnDelete}
          />
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Remove Team Member?"
        message={`Are you sure you want to remove ${employee.name} from the business? Their historical actions will remain preserved in audit logs.`}
        confirmText="Yes, Remove"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={() => {
          deleteEmployee(employee.id);
          setShowDeleteModal(false);
          router.replace('/employees');
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
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
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.softBackground,
  },
  notFoundTitle: {
    ...Typography.h3,
    color: Colors.charcoal,
    marginTop: Spacing.md,
  },
  notFoundSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  backBtn: {
    minWidth: 180,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadows.sm,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.deepEmerald,
  },
  empName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.charcoal,
    marginBottom: 2,
  },
  contactText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
  },
  roleBadge: {
    backgroundColor: Colors.deepEmerald,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.emeraldLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.freshGreen,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.deepEmerald,
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
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
    marginBottom: Spacing.md,
  },
  permissionsGrid: {
    gap: Spacing.sm,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 3,
  },
  permIconActive: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permIconInactive: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.softBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  permTextInactive: {
    color: Colors.textLight,
    fontWeight: '400',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  activityCount: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textLight,
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  activityList: {
    marginTop: Spacing.xs,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  actMain: {
    flex: 1,
  },
  actProduct: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  actReason: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  actRight: {
    alignItems: 'flex-end',
  },
  actDiff: {
    fontSize: 14,
    fontWeight: '800',
  },
  actTime: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 1,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  actionBtn: {
    flex: 2,
  },
  actionBtnDelete: {
    flex: 1,
  },
});
