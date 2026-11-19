import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Store, ChevronDown, Wifi, WifiOff } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { router } from 'expo-router';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBusinessInfo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBusinessInfo = true,
}) => {
  const { business, user, notifications, syncState } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const isOffline = syncState.connectionStatus === 'offline';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <LinearGradient
      colors={['#081E17', '#0A251E', '#0F3429']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.topRow}>
        <View style={styles.leftContainer}>
          {showBusinessInfo ? (
            <>
              {/* Fresha-style Store Selector Pill */}
              <TouchableOpacity
                style={styles.storePill}
                onPress={() => router.push('/settings/business-profile')}
                activeOpacity={0.7}
              >
                <View style={styles.storeIconWrap}>
                  <Store size={13} color={Colors.deepEmerald} />
                </View>
                <Text style={styles.storeName} numberOfLines={1}>
                  {business?.name || 'Stockwise Store'}
                </Text>
                <View
                  style={[
                    styles.liveDot,
                    { backgroundColor: isOffline ? Colors.amber : Colors.freshGreen },
                  ]}
                />
              </TouchableOpacity>

              <Text style={styles.greetingText}>
                {getGreeting()}, <Text style={styles.userName}>{user?.fullName?.split(' ')[0] || 'Partner'}</Text>
              </Text>
            </>
          ) : (
            <View style={styles.standaloneHeader}>
              <Text style={styles.screenTitle}>{title}</Text>
              {subtitle && <Text style={styles.screenSubtitle}>{subtitle}</Text>}
            </View>
          )}
        </View>

        {/* Right Action Icons */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.75}
          >
            <Bell size={19} color={Colors.white} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push('/settings/personal-profile')}
            activeOpacity={0.75}
          >
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>
                  {user?.fullName
                    ? user.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'SW'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  storePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  storeIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  storeName: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    maxWidth: 160,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  greetingText: {
    ...Typography.h2,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    fontSize: 20,
  },
  userName: {
    color: Colors.white,
    fontWeight: '800',
  },
  standaloneHeader: {
    paddingVertical: 2,
  },
  screenTitle: {
    ...Typography.h2,
    color: Colors.white,
    fontSize: 22,
  },
  screenSubtitle: {
    ...Typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.softRed,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.deepEmerald,
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: Colors.freshGreen,
    overflow: 'hidden',
    backgroundColor: Colors.emeraldLight,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.emeraldLight,
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.deepEmerald,
  },
});
