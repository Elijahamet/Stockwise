import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  Layers,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Database,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/buttons/Button';

export default function SyncScreen() {
  const {
    syncState,
    setConnectionStatus,
    triggerManualSync,
    addSampleConflictForUIPreview,
  } = useApp();

  const { connectionStatus, lastSyncTime, pendingChanges, conflictItems } = syncState;

  const isOffline = connectionStatus === 'offline';
  const isSyncing = connectionStatus === 'syncing';

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Connection Status Card */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIconWrap,
              {
                backgroundColor: isOffline
                  ? Colors.amberLight
                  : isSyncing
                  ? Colors.emeraldLight
                  : Colors.emeraldLight,
              },
            ]}
          >
            {isOffline ? (
              <WifiOff size={32} color={Colors.amberDark} />
            ) : isSyncing ? (
              <RefreshCw size={32} color={Colors.freshGreen} />
            ) : (
              <Wifi size={32} color={Colors.freshGreen} />
            )}
          </View>

          <Text style={styles.statusTitle}>
            {isOffline
              ? 'Offline Working Mode'
              : isSyncing
              ? 'Synchronizing Local Data...'
              : 'Device Connected & Synchronized'}
          </Text>

          <Text style={styles.statusSubtitle}>
            {isOffline
              ? 'Changes made while offline are safely queued in local storage and will sync automatically when reconnecting.'
              : isSyncing
              ? 'Transmitting offline mutations to remote storage...'
              : 'Your local database is fully up to date.'}
          </Text>

          {/* Connection Mode Toggle (Stage 1 Interactive Control) */}
          <View style={styles.modeToggleRow}>
            <TouchableOpacity
              style={[
                styles.modeBtn,
                !isOffline && styles.activeOnlineMode,
              ]}
              onPress={() => setConnectionStatus('online')}
            >
              <Wifi size={16} color={!isOffline ? Colors.white : Colors.textMuted} />
              <Text
                style={[
                  styles.modeBtnText,
                  !isOffline && styles.activeModeText,
                ]}
              >
                Online Mode
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeBtn,
                isOffline && styles.activeOfflineMode,
              ]}
              onPress={() => setConnectionStatus('offline')}
            >
              <WifiOff size={16} color={isOffline ? Colors.white : Colors.textMuted} />
              <Text
                style={[
                  styles.modeBtnText,
                  isOffline && styles.activeModeText,
                ]}
              >
                Simulate Offline
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sync Button */}
          <Button
            title={isSyncing ? 'Synchronizing...' : 'Sync Now'}
            loading={isSyncing}
            icon={<RefreshCw size={16} color={Colors.white} />}
            onPress={triggerManualSync}
            style={styles.syncBtn}
          />
        </View>

        {/* Sync Metadata Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Sync Health & Metrics</Text>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelRow}>
              <Clock size={16} color={Colors.textMuted} />
              <Text style={styles.metricLabel}>Last Successful Sync:</Text>
            </View>
            <Text style={styles.metricValue}>
              {lastSyncTime
                ? `${new Date(lastSyncTime).toLocaleDateString()} at ${new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Not synced yet this session'}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelRow}>
              <Layers size={16} color={Colors.textMuted} />
              <Text style={styles.metricLabel}>Pending Offline Queue:</Text>
            </View>
            <Text
              style={[
                styles.metricValue,
                { color: pendingChanges.length > 0 ? Colors.amberDark : Colors.freshGreen },
              ]}
            >
              {pendingChanges.length} operation{pendingChanges.length === 1 ? '' : 's'}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelRow}>
              <Database size={16} color={Colors.textMuted} />
              <Text style={styles.metricLabel}>Local Storage Engine:</Text>
            </View>
            <Text style={styles.metricValue}>SQLite / In-Memory Queue</Text>
          </View>
        </View>

        {/* Pending Changes Action Link */}
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => router.push('/sync/pending')}
          activeOpacity={0.7}
        >
          <View style={styles.linkIconWrap}>
            <Layers size={20} color={Colors.deepEmerald} />
          </View>
          <View style={styles.linkContent}>
            <Text style={styles.linkTitle}>Pending Offline Queue</Text>
            <Text style={styles.linkSubtitle}>
              {pendingChanges.length} local modification{pendingChanges.length === 1 ? '' : 's'} waiting to transmit
            </Text>
          </View>
          <ChevronRight size={18} color={Colors.textLight} />
        </TouchableOpacity>

        {/* Conflicts Screen Link */}
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => router.push('/sync/conflicts')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.linkIconWrap,
              { backgroundColor: conflictItems.length > 0 ? Colors.redLight : Colors.emeraldLight },
            ]}
          >
            <AlertTriangle
              size={20}
              color={conflictItems.length > 0 ? Colors.softRed : Colors.deepEmerald}
            />
          </View>
          <View style={styles.linkContent}>
            <Text style={styles.linkTitle}>Conflict Resolution Interface</Text>
            <Text style={styles.linkSubtitle}>
              {conflictItems.length} conflict{conflictItems.length === 1 ? '' : 's'} requiring manual resolution
            </Text>
          </View>
          <ChevronRight size={18} color={Colors.textLight} />
        </TouchableOpacity>

        {/* Preview Conflict Test Helper */}
        <View style={styles.previewHelperCard}>
          <Text style={styles.previewHelperTitle}>Reviewer Conflict Demo</Text>
          <Text style={styles.previewHelperDesc}>
            Test the Conflict Resolution UI by generating a simulated multi-user update collision.
          </Text>
          <Button
            title="Generate Demo Conflict"
            variant="outline"
            onPress={addSampleConflictForUIPreview}
            size="sm"
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
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statusIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  statusTitle: {
    ...Typography.h3,
    color: Colors.charcoal,
    textAlign: 'center',
    marginBottom: 4,
  },
  statusSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.lg,
    maxWidth: 290,
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    marginBottom: Spacing.md,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.softBackground,
    borderRadius: BorderRadius.md,
  },
  activeOnlineMode: {
    backgroundColor: Colors.deepEmerald,
  },
  activeOfflineMode: {
    backgroundColor: Colors.amberDark,
  },
  modeBtnText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  activeModeText: {
    color: Colors.white,
  },
  syncBtn: {
    width: '100%',
  },
  infoCard: {
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
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metricLabel: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  metricValue: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  linkIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  linkSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  previewHelperCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  previewHelperTitle: {
    ...Typography.h4,
    color: Colors.charcoal,
  },
  previewHelperDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
});
