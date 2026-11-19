import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { router } from 'expo-router';

export const SyncStatusBanner: React.FC = () => {
  const { syncState, setConnectionStatus, triggerManualSync } = useApp();
  const { connectionStatus, pendingChanges, lastSyncTime, conflictItems } = syncState;

  const handleToggleStatus = () => {
    if (connectionStatus === 'online') {
      setConnectionStatus('offline');
    } else if (connectionStatus === 'offline') {
      setConnectionStatus('online');
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'offline':
        return {
          bgGradient: ['rgba(232, 146, 24, 0.15)', 'rgba(232, 146, 24, 0.08)'] as const,
          border: 'rgba(232, 146, 24, 0.35)',
          textColor: Colors.amberDark,
          text: 'Offline Mode (Local Storage)',
          icon: <WifiOff size={13} color={Colors.amberDark} />,
        };
      case 'syncing':
        return {
          bgGradient: ['rgba(22, 152, 108, 0.20)', 'rgba(22, 152, 108, 0.08)'] as const,
          border: 'rgba(22, 152, 108, 0.35)',
          textColor: Colors.freshGreen,
          text: 'Synchronizing Cloud...',
          icon: <RefreshCw size={13} color={Colors.freshGreen} />,
        };
      case 'online':
      default:
        return {
          bgGradient: ['rgba(22, 152, 108, 0.18)', 'rgba(22, 152, 108, 0.06)'] as const,
          border: 'rgba(22, 152, 108, 0.30)',
          textColor: Colors.freshGreen,
          text: 'Active & Cloud-Synced',
          icon: <Wifi size={13} color={Colors.freshGreen} />,
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <View style={styles.container}>
      <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFill} />

      <TouchableOpacity
        style={[styles.badge, { borderColor: badge.border }]}
        onPress={handleToggleStatus}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={badge.bgGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {badge.icon}
        <Text style={[styles.badgeText, { color: badge.textColor }]}>{badge.text}</Text>
      </TouchableOpacity>

      <View style={styles.rightActions}>
        {pendingChanges.length > 0 && (
          <TouchableOpacity
            style={styles.pendingPill}
            onPress={() => router.push('/sync/pending' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.pendingText}>
              {pendingChanges.length} pending
            </Text>
          </TouchableOpacity>
        )}

        {conflictItems.length > 0 && (
          <TouchableOpacity
            style={styles.conflictPill}
            onPress={() => router.push('/sync/conflicts' as any)}
            activeOpacity={0.7}
          >
            <AlertCircle size={12} color={Colors.white} />
            <Text style={styles.conflictText}>
              {conflictItems.length} conflict{conflictItems.length > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.syncBtn}
          onPress={triggerManualSync}
          disabled={connectionStatus === 'syncing'}
          activeOpacity={0.7}
        >
          <RefreshCw
            size={14}
            color={Colors.deepEmerald}
            style={connectionStatus === 'syncing' ? { opacity: 0.5 } : null}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(22, 152, 108, 0.12)',
    overflow: 'hidden',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    gap: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    zIndex: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    zIndex: 2,
  },
  pendingPill: {
    backgroundColor: Colors.amber,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  pendingText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '800',
  },
  conflictPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.softRed,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  conflictText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '800',
  },
  syncBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(22, 152, 108, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(22, 152, 108, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
