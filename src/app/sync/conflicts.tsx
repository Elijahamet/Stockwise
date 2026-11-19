import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import {
  AlertTriangle,
  Server,
  Smartphone,
  CheckCircle2,
  User,
  Clock,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/common/EmptyState';

export default function ConflictResolutionScreen() {
  const { syncState, resolveConflict, addSampleConflictForUIPreview } = useApp();
  const { conflictItems } = syncState;

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
        {/* Explanation Header */}
        <View style={styles.headerBox}>
          <Text style={styles.microSectionLabel}>OFFLINE SYNC ARBITRATION</Text>
          <Text style={styles.headerTitle}>Conflict Resolution</Text>
          <Text style={styles.headerSubtitle}>
            When multiple offline devices modify the same product or transaction before reconnecting, review discrepancies here to safeguard data accuracy.
          </Text>
        </View>

        {conflictItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon={<CheckCircle2 size={36} color={Colors.freshGreen} />}
              title="No Unresolved Conflicts"
              description="There are currently zero data collision conflicts between your local device database and cloud server."
              actionTitle="Add Demo Conflict for UI Preview"
              onAction={addSampleConflictForUIPreview}
            />
          </View>
        ) : (
          <FlatList
            data={conflictItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.conflictCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.alertIconWrap}>
                    <AlertTriangle size={18} color={Colors.softRed} />
                  </View>
                  <View style={styles.headerTitles}>
                    <Text style={styles.conflictEntityName}>{item.entityName}</Text>
                    <Text style={styles.conflictSubtitle}>
                      Conflicting update detected during sync
                    </Text>
                  </View>
                </View>

                {/* Conflict Meta: Who and When */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <User size={13} color={Colors.textMuted} />
                    <Text style={styles.metaText}>Updated by: {item.updatedBy}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={13} color={Colors.textMuted} />
                    <Text style={styles.metaText}>
                      {new Date(item.updatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>

                {/* Comparison Columns (Server vs Local) */}
                <View style={styles.comparisonContainer}>
                  {item.fields.map((field, idx) => (
                    <View key={idx} style={styles.fieldComparisonBox}>
                      <Text style={styles.fieldLabel}>{field.fieldName.toUpperCase()}</Text>

                      <View style={styles.columnsRow}>
                        {/* Server Value */}
                        <View style={styles.serverCol}>
                          <View style={styles.colHeaderRow}>
                            <Server size={13} color={Colors.deepEmerald} />
                            <Text style={styles.colTitle}>Server Value</Text>
                          </View>
                          <Text style={styles.colValue}>{field.serverVal}</Text>
                        </View>

                        <View style={styles.colDivider} />

                        {/* Local Value */}
                        <View style={styles.localCol}>
                          <View style={styles.colHeaderRow}>
                            <Smartphone size={13} color={Colors.freshGreen} />
                            <Text style={styles.colTitle}>This Device</Text>
                          </View>
                          <Text style={styles.colValue}>{field.localVal}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Resolution Action Buttons */}
                <View style={styles.actionsRow}>
                  <Button
                    title="Keep Local Value"
                    variant="outline"
                    onPress={() => resolveConflict(item.id, 'keep_local')}
                    style={styles.actionBtn}
                  />

                  <Button
                    title="Accept Server"
                    variant="primary"
                    onPress={() => resolveConflict(item.id, 'accept_server')}
                    style={styles.actionBtn}
                  />
                </View>
              </View>
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
  headerBox: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  microSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.charcoal,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  conflictCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  alertIconWrap: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.redLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerTitles: {
    flex: 1,
  },
  conflictEntityName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  conflictSubtitle: {
    fontSize: 12,
    color: Colors.softRed,
    fontWeight: '600',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.softBackground,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  comparisonContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  fieldComparisonBox: {
    backgroundColor: Colors.softBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  columnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serverCol: {
    flex: 1,
  },
  colHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  colTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.deepEmerald,
  },
  colValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  colDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.md,
  },
  localCol: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
});
