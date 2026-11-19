import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import {
  Bell,
  AlertTriangle,
  XCircle,
  Package,
  ShoppingCart,
  Users,
  Wifi,
  CheckCheck,
  Trash2,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../../components/common/EmptyState';
import { NotificationCategory } from '../../types';

export default function NotificationsScreen() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | NotificationCategory>('all');

  const filtered = notifications.filter((n) => {
    if (activeCategory !== 'all' && n.category !== activeCategory) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'low_stock':
        return {
          icon: <AlertTriangle size={18} color={Colors.amberDark} />,
          bg: Colors.amberLight,
        };
      case 'out_of_stock':
        return {
          icon: <XCircle size={18} color={Colors.softRed} />,
          bg: Colors.redLight,
        };
      case 'stock_update':
        return {
          icon: <Package size={18} color={Colors.freshGreen} />,
          bg: Colors.emeraldLight,
        };
      case 'sale':
        return {
          icon: <ShoppingCart size={18} color={Colors.freshGreen} />,
          bg: Colors.emeraldLight,
        };
      case 'employee':
        return {
          icon: <Users size={18} color={Colors.deepEmerald} />,
          bg: Colors.emeraldLight,
        };
      case 'expired':
        return {
          icon: <XCircle size={18} color={Colors.softRed} />,
          bg: Colors.redLight,
        };
      case 'expiry_warning':
        return {
          icon: <AlertTriangle size={18} color={Colors.amberDark} />,
          bg: Colors.amberLight,
        };
      case 'sync':
      default:
        return {
          icon: <Wifi size={18} color={Colors.deepEmerald} />,
          bg: Colors.softBackground,
        };
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header Actions */}
        <View style={styles.headerBar}>
          <View style={styles.unreadPill}>
            <Text style={styles.unreadPillText}>
              {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
            </Text>
          </View>

          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.markAllBtn}
                onPress={markAllNotificationsRead}
                activeOpacity={0.7}
              >
                <CheckCheck size={15} color={Colors.freshGreen} />
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}

            {notifications.length > 0 && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={clearNotifications}
                activeOpacity={0.7}
              >
                <Trash2 size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filters */}
        <View style={styles.filterRow}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              { key: 'all', label: 'All Alerts' },
              { key: 'low_stock', label: 'Low Stock' },
              { key: 'out_of_stock', label: 'Out of Stock' },
              { key: 'sale', label: 'Sales' },
              { key: 'stock_update', label: 'Restock' },
              { key: 'employee', label: 'Team' },
              { key: 'sync', label: 'Sync' },
            ]}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => {
              const isSelected = activeCategory === item.key;
              return (
                <TouchableOpacity
                  style={[styles.filterChip, isSelected && styles.activeChip]}
                  onPress={() => setActiveCategory(item.key as any)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bell size={36} color={Colors.freshGreen} />}
            title="All Caught Up!"
            description={
              notifications.length === 0
                ? 'Important store alerts such as low-stock warnings, offline sync updates, and sales will appear here.'
                : 'No notifications in this filter category.'
            }
            actionTitle={notifications.length === 0 ? 'Go to Inventory' : 'View All'}
            onAction={
              notifications.length === 0
                ? () => router.push('/(tabs)/inventory')
                : () => setActiveCategory('all')
            }
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const styleMeta = getCategoryIcon(item.category);
              return (
                <TouchableOpacity
                  style={[
                    styles.notifCard,
                    !item.read ? styles.unreadCard : null,
                  ]}
                  onPress={() => markNotificationRead(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconWrap, { backgroundColor: styleMeta.bg }]}>
                    {styleMeta.icon}
                  </View>

                  <View style={styles.notifContent}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.title, !item.read && styles.unreadTitle]}>
                        {item.title}
                      </Text>
                      {!item.read && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={styles.message}>{item.message}</Text>

                    <Text style={styles.timestamp}>
                      {new Date(item.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
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
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  unreadPill: {
    backgroundColor: Colors.emeraldLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  unreadPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.deepEmerald,
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.freshGreen,
  },
  clearBtn: {
    padding: Spacing.xs,
  },
  filterRow: {
    marginBottom: Spacing.md,
  },
  filterList: {
    gap: Spacing.xs + 2,
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
  listContent: {
    paddingBottom: Spacing.xxxl,
    gap: Spacing.sm,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  unreadCard: {
    borderColor: Colors.freshGreen,
    backgroundColor: '#FAFDFB',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  notifContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  unreadTitle: {
    fontWeight: '800',
    color: Colors.deepEmerald,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.freshGreen,
  },
  message: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 4,
  },
});
