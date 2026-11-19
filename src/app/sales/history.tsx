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
  TrendingUp,
  Search,
  ShoppingCart,
  ChevronRight,
  Plus,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../../components/common/EmptyState';
import { PaymentMethod } from '../../types';

export default function SalesHistoryScreen() {
  const { sales, settings } = useApp();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.createdAt.startsWith(todayStr));
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const overallTotal = sales.reduce((sum, s) => sum + s.total, 0);

  const filtered = sales.filter((s) => {
    if (methodFilter !== 'all' && s.paymentMethod !== methodFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRec = s.receiptNumber.toLowerCase().includes(q);
      const matchSold = s.soldBy.toLowerCase().includes(q);
      return matchRec || matchSold;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
        {/* Sales Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCol}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>TODAY'S REVENUE</Text>
              <Text style={styles.summaryValue}>
                {settings.currency}
                {todayTotal.toFixed(2)}
              </Text>
              <Text style={styles.summarySub}>
                {todaySales.length} sale{todaySales.length === 1 ? '' : 's'} recorded today
              </Text>
            </View>
          </View>

          <View style={styles.summaryCol}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>ALL TIME REVENUE</Text>
              <Text style={styles.summaryValue}>
                {settings.currency}
                {overallTotal >= 1000 ? `${(overallTotal / 1000).toFixed(1)}k` : overallTotal.toFixed(2)}
              </Text>
              <Text style={styles.summarySub}>{sales.length} transactions total</Text>
            </View>
          </View>
        </View>

        {/* Search & New Sale Button */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by receipt # or cashier..."
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
            style={styles.newSaleBtn}
            onPress={() => router.push('/sales/new')}
            activeOpacity={0.8}
          >
            <Plus size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Payment Method Filters */}
        <View style={styles.filterRow}>
          {(
            [
              { key: 'all', label: `All (${sales.length})` },
              { key: 'cash', label: 'Cash' },
              { key: 'momo', label: 'MoMo' },
              { key: 'card', label: 'Card' },
              { key: 'other', label: 'Other' },
            ] as const
          ).map((m) => {
            const isSelected = methodFilter === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                style={[styles.filterChip, isSelected && styles.activeChip]}
                onPress={() => setMethodFilter(m.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sales List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<TrendingUp size={36} color={Colors.freshGreen} />}
            title={search ? 'No Matches Found' : 'No Sales Recorded Yet'}
            description={
              search
                ? `No sales transactions found matching "${search}".`
                : 'Every recorded sale will automatically deduct inventory, generate receipts, and appear here.'
            }
            actionTitle={search ? 'Clear Search' : '+ Record New Sale'}
            onAction={search ? () => setSearch('') : () => router.push('/sales/new')}
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.saleCard}
                onPress={() => router.push(`/sales/${item.id}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.saleTopRow}>
                  <View style={styles.saleInfo}>
                    <Text style={styles.receiptNumber}>{item.receiptNumber}</Text>
                    <Text style={styles.saleMeta}>
                      {new Date(item.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      • {item.soldBy}
                    </Text>
                  </View>

                  <View style={styles.amountCol}>
                    <Text style={styles.saleTotal}>
                      {settings.currency}
                      {item.total.toFixed(2)}
                    </Text>
                    <View style={styles.paymentMethodBadge}>
                      <Text style={styles.paymentMethodText}>
                        {item.paymentMethod.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.saleBottomRow}>
                  <Text style={styles.itemsSummary} numberOfLines={1}>
                    {item.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                  </Text>
                  <ChevronRight size={16} color={Colors.textLight} />
                </View>
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
  summaryGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryCol: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    color: Colors.charcoal,
    fontWeight: '800',
  },
  summarySub: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 14,
    marginLeft: Spacing.sm,
    color: Colors.charcoal,
  },
  clearText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  newSaleBtn: {
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
    gap: Spacing.sm,
  },
  saleCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  saleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saleInfo: {
    flex: 1,
  },
  receiptNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  saleMeta: {
    fontSize: 11,
    color: Colors.textLight,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  saleTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  paymentMethodBadge: {
    backgroundColor: Colors.emeraldLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.xs,
    marginTop: 3,
  },
  paymentMethodText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.deepEmerald,
    letterSpacing: 0.4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  saleBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemsSummary: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
    marginRight: Spacing.sm,
  },
});
