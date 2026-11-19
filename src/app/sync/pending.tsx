import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
  Layers,
  RefreshCw,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/common/EmptyState';

export default function PendingChangesScreen() {
  const { syncState, triggerManualSync } = useApp();
  const { pendingChanges, connectionStatus } = syncState;

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return {
          bg: Colors.emeraldLight,
          color: Colors.freshGreen,
          label: 'CREATE',
        };
      case 'update':
        return {
          bg: Colors.amberLight,
          color: Colors.amberDark,
          label: 'UPDATE',
        };
      case 'delete':
        return {
          bg: Colors.redLight,
          color: Colors.softRed,
          label: 'DELETE',
        };
      default:
        return {
          bg: Colors.softBackground,
          color: Colors.textMuted,
          label: action.toUpperCase(),
        };
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Top Info Banner */}
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>
            {pendingChanges.length} Change{pendingChanges.length === 1 ? '' : 's'} in Local Queue
          </Text>
          <Text style={styles.headerSubtitle}>
            These changes were recorded locally on this device while offline. They will be pushed to the remote store automatically upon reconnecting.
          </Text>

          {pendingChanges.length > 0 && (
            <Button
              title={connectionStatus === 'syncing' ? 'Syncing...' : 'Sync Pending Changes'}
              loading={connectionStatus === 'syncing'}
              icon={<RefreshCw size={16} color={Colors.white} />}
              onPress={triggerManualSync}
              style={{ marginTop: Spacing.sm }}
            />
          )}
        </View>

        {pendingChanges.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={36} color={Colors.freshGreen} />}
            title="Queue is Empty"
            description="All local records and sales are in sync with your cloud backend. Switch to Offline Mode to test queuing local changes."
            actionTitle="Go to Sync Center"
            onAction={() => router.push('/sync')}
          />
        ) : (
          <FlatList
            data={pendingChanges}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const badge = getActionBadge(item.action);
              return (
                <View style={styles.changeCard}>
                  <View style={styles.topRow}>
                    <View style={[styles.actionBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.actionBadgeText, { color: badge.color }]}>
                        {badge.label}
                      </Text>
                    </View>

                    <Text style={styles.entityTag}>
                      {item.entityType.replace('_', ' ').toUpperCase()}
                    </Text>

                    <Text style={styles.timestamp}>
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  <Text style={styles.descText}>{item.description}</Text>

                  {item.payload && (
                    <View style={styles.payloadBox}>
                      <Text style={styles.payloadLabel}>Local Payload Reference:</Text>
                      <Text style={styles.payloadText} numberOfLines={2}>
                        {JSON.stringify(item.payload)}
                      </Text>
                    </View>
                  )}
                </View>
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
  headerBox: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.charcoal,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: Spacing.xxxl,
    gap: Spacing.sm,
  },
  changeCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  actionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  actionBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  entityTag: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.deepEmerald,
    flex: 1,
  },
  timestamp: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textLight,
  },
  descText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.charcoal,
    marginBottom: Spacing.xs,
  },
  payloadBox: {
    backgroundColor: Colors.softBackground,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  payloadLabel: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  payloadText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
