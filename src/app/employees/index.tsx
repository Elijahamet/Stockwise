import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ChevronRight,
  UserCheck,
  Mail,
  Phone,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../../components/common/EmptyState';
import { UserRole } from '../../types';

export default function EmployeeListScreen() {
  const { employees, user } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  const filtered = employees.filter((emp) => {
    if (roleFilter !== 'all' && emp.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.contact.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
        {/* Search & Add Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search team members by name..."
              placeholderTextColor={Colors.textLight}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/employees/new')}
            activeOpacity={0.8}
          >
            <UserPlus size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Role Filters */}
        <View style={styles.filterRow}>
          {(
            [
              { key: 'all', label: `All (${employees.length})` },
              { key: 'manager', label: 'Managers' },
              { key: 'staff', label: 'Staff' },
            ] as const
          ).map((item) => {
            const isSelected = roleFilter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterChip, isSelected && styles.activeChip]}
                onPress={() => setRoleFilter(item.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Current Active Store Owner Card */}
        {user && (
          <View style={styles.ownerCard}>
            <View style={styles.ownerAvatar}>
              <Shield size={20} color={Colors.white} />
            </View>
            <View style={styles.ownerInfo}>
              <View style={styles.ownerTitleRow}>
                <Text style={styles.ownerName}>{user.fullName}</Text>
                <View style={styles.ownerBadge}>
                  <Text style={styles.ownerBadgeText}>STORE OWNER</Text>
                </View>
              </View>
              <Text style={styles.ownerContact}>{user.phoneNumber || user.email}</Text>
              <Text style={styles.ownerSub}>Full administrative & financial access</Text>
            </View>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.microSectionLabel}>TEAM MEMBERS</Text>
          <Text style={styles.teamCount}>
            {filtered.length} member{filtered.length === 1 ? '' : 's'}
          </Text>
        </View>

        {/* Employee List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={36} color={Colors.freshGreen} />}
            title={search ? 'No Matching Members' : 'No Team Members Added'}
            description={
              search
                ? `No employees match "${search}".`
                : 'Invite store assistants, managers, or cashiers to access the app with role-based permissions.'
            }
            actionTitle={search ? 'Clear Search' : '+ Add Employee'}
            onAction={search ? () => setSearch('') : () => router.push('/employees/new')}
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.employeeCard}
                onPress={() => router.push(`/employees/${item.id}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.empAvatar}>
                  <Text style={styles.empInitials}>
                    {item.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </Text>
                </View>

                <View style={styles.empDetails}>
                  <View style={styles.empNameRow}>
                    <Text style={styles.empName}>{item.name}</Text>
                    <View
                      style={[
                        styles.roleBadge,
                        item.role === 'manager'
                          ? styles.managerBadge
                          : styles.staffBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleBadgeText,
                          item.role === 'manager'
                            ? styles.managerBadgeText
                            : styles.staffBadgeText,
                        ]}
                      >
                        {item.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.empContact}>{item.contact}</Text>
                  <Text style={styles.empDate}>
                    Joined {new Date(item.createdAt).toLocaleDateString([], {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <ChevronRight size={18} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.softBackground,
  },
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    height: 48,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...Typography.body,
    fontSize: 14,
    color: Colors.charcoal,
  },
  clearText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.freshGreen,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  activeChip: {
    backgroundColor: Colors.deepEmerald,
    borderColor: Colors.deepEmerald,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  activeChipText: {
    color: Colors.white,
    fontWeight: '700',
  },
  ownerCard: {
    backgroundColor: Colors.deepEmerald,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.freshGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.white,
  },
  ownerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  ownerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  ownerContact: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  ownerSub: {
    fontSize: 11,
    color: Colors.freshGreen,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  microSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  teamCount: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textLight,
  },
  listContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  employeeCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  empAvatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  empInitials: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.deepEmerald,
  },
  empDetails: {
    flex: 1,
  },
  empNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  empName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.full,
  },
  managerBadge: {
    backgroundColor: Colors.emeraldLight,
  },
  staffBadge: {
    backgroundColor: Colors.softBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  managerBadgeText: {
    color: Colors.deepEmerald,
  },
  staffBadgeText: {
    color: Colors.textMuted,
  },
  empContact: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  empDate: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 2,
  },
});
