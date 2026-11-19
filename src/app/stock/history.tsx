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
  History,
  Search,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../../components/common/EmptyState';

export default function StockHistoryScreen() {
  const { stockMovements } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'add' | 'remove' | 'adjustment' | 'sale'>('all');

  const filtered = stockMovements.filter((m) => {
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchProduct = m.productName.toLowerCase().includes(q);
      const matchReason = m.reason.toLowerCase().includes(q);
      const matchEmployee = m.employeeName.toLowerCase().includes(q);
      return matchProduct || matchReason || matchEmployee;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search movements by product or reason..."
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

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {(
            [
              { key: 'all', label: `All (${stockMovements.length})` },
              { key: 'add', label: 'Restock' },
              { key: 'sale', label: 'Sales' },
              { key: 'remove', label: 'Removed' },
              { key: 'adjustment', label: 'Adjusted' },
            ] as const
          ).map((item) => {
            const isSelected = filterType === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterChip, isSelected && styles.activeChip]}
                onPress={() => setFilterType(item.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.chipText, isSelected && styles.activeChipText]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* List of movements */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<History size={36} color={Colors.freshGreen} />}
            title={search ? 'No Matches Found' : 'No Movements Logged'}
            description={
              search
                ? `No stock movements match "${search}".`
                : 'Every stock entry, removal, sale, and count adjustment will be audited here.'
            }
            actionTitle={search ? 'Clear Search' : '+ Add Stock'}
            onAction={search ? () => setSearch('') : () => router.push('/stock/add')}
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isPositive = item.quantityChange > 0;
              const isSale = item.type === 'sale';
              const isAdjustment = item.type === 'adjustment';

              const badgeColor = isSale
                ? Colors.freshGreen
                : isPositive
                ? Colors.deepEmerald
                : isAdjustment
                ? Colors.amberDark
                : Colors.softRed;

              const badgeBg = isSale
                ? Colors.emeraldLight
                : isPositive
                ? Colors.emeraldLight
                : isAdjustment
                ? Colors.amberLight
                : Colors.redLight;

              const badgeText = isSale
                ? 'SALE'
                : isPositive
                ? 'RESTOCK'
                : isAdjustment
                ? 'ADJUST'
                : 'REMOVED';

              return (
                <View style={styles.movementCard}>
                  <View style={styles.cardTopRow}>
                    <View style={[styles.iconWrap, { backgroundColor: badgeBg }]}>
                      {isPositive ? (
                        <ArrowUpRight size={18} color={badgeColor} />
                      ) : (
                        <ArrowDownRight size={18} color={badgeColor} />
                      )}
                    </View>

                    <View style={styles.mainInfo}>
                      <View style={styles.titleWithBadge}>
                        <Text style={styles.productName} numberOfLines={1}>
                          {item.productName}
                        </Text>
                        <View style={[styles.miniBadge, { backgroundColor: badgeBg }]}>
                          <Text style={[styles.miniBadgeText, { color: badgeColor }]}>
                            {badgeText}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.reasonText} numberOfLines={1}>{item.reason}</Text>
                    </View>

                    <View style={styles.quantityCol}>
                      <Text
                        style={[
                          styles.diffValue,
                          { color: isPositive ? Colors.freshGreen : Colors.charcoal },
                        ]}
                      >
                        {isPositive ? `+${item.quantityChange}` : item.quantityChange}
                      </Text>
                      <View style={styles.diffPill}>
                        <Text style={styles.transitionText}>
                          {item.previousQuantity} → {item.newQuantity}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.cardFooter}>
                    <Text style={styles.footerMeta}>
                      Logged by{' '}
                      <Text style={styles.employeeBold}>{item.employeeName}</Text>
                    </Text>
                    <Text style={styles.footerTimestamp}>
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

                  {item.notes && (
                    <Text style={styles.notesText}>Note: "{item.notes}"</Text>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: Spacing.sm,
    color: Colors.charcoal,
  },
  clearText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    gap: Spacing.md,
  },
  movementCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  mainInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
    flexShrink: 1,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  reasonText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  quantityCol: {
    alignItems: 'flex-end',
  },
  diffValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  diffPill: {
    backgroundColor: Colors.softBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginTop: 3,
  },
  transitionText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerMeta: {
    fontSize: 11,
    color: Colors.textLight,
  },
  employeeBold: {
    fontWeight: '700',
    color: Colors.charcoal,
  },
  footerTimestamp: {
    fontSize: 10,
    color: Colors.textLight,
  },
  notesText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
