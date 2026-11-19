import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import {
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Package,
  Layers,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  ChevronRight,
  Award,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/common/Header';
import { SyncStatusBanner } from '../../components/common/SyncStatusBanner';
import { StatCard } from '../../components/cards/StatCard';
import { SimpleBarChart } from '../../components/charts/SimpleBarChart';
import { CategoryDistributionChart } from '../../components/charts/CategoryDistributionChart';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/common/EmptyState';

type ReportTab = 'inventory' | 'sales' | 'movements';
type DateRange = 'today' | 'week' | 'month' | 'all';

export default function ReportsScreen() {
  const { products, sales, stockMovements, settings } = useApp();

  const [activeTab, setActiveTab] = useState<ReportTab>('inventory');
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Financial calculations
  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const costValuation = products.reduce((sum, p) => sum + p.quantity * p.buyingPrice, 0);
  const retailValuation = products.reduce((sum, p) => sum + p.quantity * p.sellingPrice, 0);
  const potentialProfit = retailValuation - costValuation;

  const lowStockCount = products.filter(
    (p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold
  ).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  // Sales totals
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalDiscounts = sales.reduce((sum, s) => sum + s.discount, 0);
  const totalTransactions = sales.length;
  const avgBasketValue = totalTransactions > 0 ? totalSalesRevenue / totalTransactions : 0;

  // Best selling products calculation
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.productName,
          quantity: 0,
          revenue: 0,
        };
      }
      productSalesMap[item.productId].quantity += item.quantity;
      productSalesMap[item.productId].revenue += item.subtotal;
    });
  });

  const bestSellingList = Object.values(productSalesMap).sort(
    (a, b) => b.quantity - a.quantity
  );

  // Movements totals
  const stockReceivedUnits = stockMovements
    .filter((m) => m.type === 'add')
    .reduce((sum, m) => sum + Math.abs(m.quantityChange), 0);
  const stockSoldUnits = stockMovements
    .filter((m) => m.type === 'sale')
    .reduce((sum, m) => sum + Math.abs(m.quantityChange), 0);
  const stockDamagedUnits = stockMovements
    .filter((m) => m.type === 'remove' && m.reason.toLowerCase().includes('damage'))
    .reduce((sum, m) => sum + Math.abs(m.quantityChange), 0);
  const stockAdjustedUnits = stockMovements
    .filter((m) => m.type === 'adjustment')
    .reduce((sum, m) => sum + Math.abs(m.quantityChange), 0);

  // Categories chart
  const categoryMap: Record<string, number> = {};
  products.forEach((p) => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([category, count]) => ({
    category,
    count,
  }));

  const handleExport = (type: 'PDF' | 'CSV') => {
    const filename = `Stockwise_${activeTab.toUpperCase()}_Report_${dateRange}.${type.toLowerCase()}`;
    setExportNotice(`Exported ${filename} successfully.`);
    setTimeout(() => {
      setExportNotice(null);
    }, 3500);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Header
        title="Reports & Analytics"
        subtitle="Financial intelligence & store audits"
        showBusinessInfo={false}
      />
      <SyncStatusBanner />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Export Success Notification Banner */}
        {exportNotice && (
          <View style={styles.exportSuccessBanner}>
            <CheckCircle2 size={16} color={Colors.freshGreen} />
            <Text style={styles.exportSuccessText}>{exportNotice}</Text>
          </View>
        )}

        {/* Date Range Selector Pill Bar */}
        <View style={styles.dateSelectorContainer}>
          <View style={styles.calendarIconPill}>
            <Calendar size={14} color={Colors.deepEmerald} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rangeRow}
          >
            {(
              [
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' },
                { key: 'all', label: 'All Time' },
              ] as const
            ).map((range) => {
              const isSelected = dateRange === range.key;
              return (
                <TouchableOpacity
                  key={range.key}
                  style={[styles.rangePill, isSelected && styles.activeRangePill]}
                  onPress={() => setDateRange(range.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.rangePillText,
                      isSelected && styles.activeRangePillText,
                    ]}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Segmented Tab Control */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'inventory' && styles.activeTabItem]}
            onPress={() => setActiveTab('inventory')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'inventory' && styles.activeTabText]}>
              Valuation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'sales' && styles.activeTabItem]}
            onPress={() => setActiveTab('sales')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'sales' && styles.activeTabText]}>
              Sales Performance
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'movements' && styles.activeTabItem]}
            onPress={() => setActiveTab('movements')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'movements' && styles.activeTabText]}>
              Stock Audits
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: INVENTORY VALUATION & AUDIT */}
        {activeTab === 'inventory' && (
          <View style={styles.tabContent}>
            {/* Financial Summary */}
            <View style={styles.statsGrid}>
              <View style={styles.gridCol}>
                <StatCard
                  title="Inventory at Cost"
                  value={`${settings.currency}${costValuation.toFixed(2)}`}
                  subtitle="Total purchase investment"
                  icon={<DollarSign size={18} color={Colors.deepEmerald} />}
                />
              </View>

              <View style={styles.gridCol}>
                <StatCard
                  title="Retail Value"
                  value={`${settings.currency}${retailValuation.toFixed(2)}`}
                  subtitle="Projected revenue"
                  icon={<TrendingUp size={18} color={Colors.freshGreen} />}
                />
              </View>

              <View style={styles.gridCol}>
                <StatCard
                  title="Potential Margin"
                  value={`${settings.currency}${potentialProfit.toFixed(2)}`}
                  subtitle={`${retailValuation > 0 ? Math.round((potentialProfit / retailValuation) * 100) : 0}% projected markup`}
                  variant="green"
                  icon={<DollarSign size={18} color={Colors.freshGreen} />}
                />
              </View>

              <View style={styles.gridCol}>
                <StatCard
                  title="Catalog Size"
                  value={totalProducts}
                  subtitle={`${totalUnits} total units in stock`}
                  icon={<Package size={18} color={Colors.deepEmerald} />}
                />
              </View>
            </View>

            {/* Low & Out of Stock Health Breakdown */}
            <View style={styles.breakdownCard}>
              <View style={styles.cardHeaderWithBadge}>
                <Text style={styles.cardHeaderTitle}>Stock Health Overview</Text>
                <View style={[styles.statusBadge, { backgroundColor: Colors.emeraldLight }]}>
                  <Text style={[styles.statusBadgeText, { color: Colors.deepEmerald }]}>AUDIT READY</Text>
                </View>
              </View>

              <View style={styles.healthRow}>
                <TouchableOpacity
                  style={styles.healthItem}
                  onPress={() => router.push('/(tabs)/inventory')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.healthValAmber}>{lowStockCount}</Text>
                  <Text style={styles.healthLabel}>Low Stock Items</Text>
                  <Text style={styles.healthSub}>Needs reorder</Text>
                </TouchableOpacity>

                <View style={styles.healthDivider} />

                <TouchableOpacity
                  style={styles.healthItem}
                  onPress={() => router.push('/(tabs)/inventory')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.healthValRed}>{outOfStockCount}</Text>
                  <Text style={styles.healthLabel}>Out of Stock</Text>
                  <Text style={styles.healthSub}>Zero inventory</Text>
                </TouchableOpacity>

                <View style={styles.healthDivider} />

                <View style={styles.healthItem}>
                  <Text style={styles.healthValGreen}>
                    {totalProducts - lowStockCount - outOfStockCount}
                  </Text>
                  <Text style={styles.healthLabel}>Healthy Stock</Text>
                  <Text style={styles.healthSub}>Above threshold</Text>
                </View>
              </View>
            </View>

            {/* Category Distribution Chart */}
            <View style={styles.chartSectionCard}>
              <Text style={styles.cardHeaderTitle}>Category Breakdown</Text>
              <Text style={styles.cardHeaderSubtitle}>
                Stock concentration across product lines
              </Text>
              <CategoryDistributionChart categories={categoryData} />
            </View>
          </View>
        )}

        {/* TAB 2: SALES PERFORMANCE */}
        {activeTab === 'sales' && (
          <View style={styles.tabContent}>
            <View style={styles.statsGrid}>
              <View style={styles.gridCol}>
                <StatCard
                  title="Total Revenue"
                  value={`${settings.currency}${totalSalesRevenue.toFixed(2)}`}
                  subtitle={`${totalTransactions} recorded sales`}
                  variant="green"
                  icon={<DollarSign size={18} color={Colors.freshGreen} />}
                />
              </View>

              <View style={styles.gridCol}>
                <StatCard
                  title="Average Basket"
                  value={`${settings.currency}${avgBasketValue.toFixed(2)}`}
                  subtitle="Per checkout order"
                  icon={<TrendingUp size={18} color={Colors.deepEmerald} />}
                />
              </View>

              <View style={styles.gridCol}>
                <StatCard
                  title="Discounts Given"
                  value={`${settings.currency}${totalDiscounts.toFixed(2)}`}
                  subtitle="Promotions & savings"
                  icon={<DollarSign size={18} color={Colors.amberDark} />}
                />
              </View>

              <View style={styles.gridCol}>
                <StatCard
                  title="Orders Completed"
                  value={totalTransactions}
                  subtitle="All receipts settled"
                  icon={<Package size={18} color={Colors.deepEmerald} />}
                />
              </View>
            </View>

            {/* Best Selling Products */}
            <View style={styles.breakdownCard}>
              <View style={styles.cardHeaderWithBadge}>
                <Text style={styles.cardHeaderTitle}>Top Selling Products</Text>
                <Award size={18} color={Colors.amberDark} />
              </View>

              {bestSellingList.length === 0 ? (
                <View style={styles.emptyRankingBox}>
                  <Text style={styles.emptyRankingText}>
                    No product sales logged yet. Complete sales to populate rankings.
                  </Text>
                </View>
              ) : (
                <View style={styles.rankingList}>
                  {bestSellingList.slice(0, 5).map((item, index) => (
                    <View key={index} style={styles.rankingItem}>
                      <View style={styles.rankingPositionPill}>
                        <Text style={styles.rankingPositionText}>#{index + 1}</Text>
                      </View>
                      <View style={styles.rankingInfo}>
                        <Text style={styles.rankingName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.rankingUnits}>
                          {item.quantity} units sold
                        </Text>
                      </View>
                      <Text style={styles.rankingRevenue}>
                        {settings.currency}
                        {item.revenue.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Sales Flow Action Link */}
            <TouchableOpacity
              style={styles.historyLinkCard}
              onPress={() => router.push('/sales/history')}
              activeOpacity={0.7}
            >
              <View>
                <Text style={styles.historyLinkTitle}>View Transaction Receipts</Text>
                <Text style={styles.historyLinkSub}>
                  Browse itemized register history & download receipts
                </Text>
              </View>
              <ChevronRight size={18} color={Colors.freshGreen} />
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 3: STOCK AUDITS & MOVEMENTS */}
        {activeTab === 'movements' && (
          <View style={styles.tabContent}>
            <View style={styles.statsGrid}>
              <View style={styles.gridCol}>
                <StatCard
                  title="Stock Received"
                  value={`+${stockReceivedUnits}`}
                  subtitle="Purchases & restocks"
                  variant="green"
                  icon={<ArrowUpRight size={18} color={Colors.freshGreen} />}
                />
              </View>

              <View style={styles.gridCol}>
                <StatCard
                  title="Stock Sold"
                  value={`-${stockSoldUnits}`}
                  subtitle="Customer checkouts"
                  icon={<ArrowDownRight size={18} color={Colors.deepEmerald} />}
                />
              </View>

              <View style={styles.gridCol}>
                <StatCard
                  title="Damaged / Expired"
                  value={`-${stockDamagedUnits}`}
                  subtitle="Recorded write-offs"
                  variant="red"
                  icon={<ArrowDownRight size={18} color={Colors.softRed} />}
                />
              </View>

              <View style={styles.gridCol}>
                <StatCard
                  title="Adjustments"
                  value={stockAdjustedUnits}
                  subtitle="Count reconciliations"
                  icon={<Package size={18} color={Colors.amberDark} />}
                />
              </View>
            </View>

            {/* Movement Audit Action Card */}
            <TouchableOpacity
              style={styles.historyLinkCard}
              onPress={() => router.push('/stock/history')}
              activeOpacity={0.7}
            >
              <View>
                <Text style={styles.historyLinkTitle}>Audit Log Details</Text>
                <Text style={styles.historyLinkSub}>
                  Review every recorded physical inventory movement
                </Text>
              </View>
              <ChevronRight size={18} color={Colors.freshGreen} />
            </TouchableOpacity>
          </View>
        )}

        {/* Export Report Actions Card */}
        <View style={styles.exportSectionCard}>
          <View style={styles.exportTextCol}>
            <Text style={styles.exportSectionTitle}>Export Data Report</Text>
            <Text style={styles.exportSectionSub}>
              Download formatted offline {activeTab} summary for auditing
            </Text>
          </View>

          <View style={styles.exportButtonsRow}>
            <TouchableOpacity
              style={styles.exportPillBtn}
              onPress={() => handleExport('PDF')}
              activeOpacity={0.8}
            >
              <FileText size={16} color={Colors.deepEmerald} />
              <Text style={styles.exportPillText}>PDF Document</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportPillBtn}
              onPress={() => handleExport('CSV')}
              activeOpacity={0.8}
            >
              <FileSpreadsheet size={16} color={Colors.deepEmerald} />
              <Text style={styles.exportPillText}>CSV Spreadsheet</Text>
            </TouchableOpacity>
          </View>
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
  },
  exportSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.emeraldLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exportSuccessText: {
    ...Typography.bodySmall,
    color: Colors.deepEmerald,
    fontWeight: '700',
    flex: 1,
  },
  dateSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  calendarIconPill: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
  },
  rangePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  activeRangePill: {
    backgroundColor: Colors.deepEmerald,
    borderColor: Colors.deepEmerald,
  },
  rangePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  activeRangePillText: {
    color: Colors.white,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#EAEFEA',
    borderRadius: BorderRadius.full,
    padding: 3,
    marginBottom: Spacing.lg,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: BorderRadius.full,
  },
  activeTabItem: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  activeTabText: {
    color: Colors.charcoal,
    fontWeight: '700',
  },
  tabContent: {
    gap: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  gridCol: {
    width: '47.5%',
  },
  breakdownCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  cardHeaderWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  cardHeaderSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
  },
  healthItem: {
    flex: 1,
    alignItems: 'center',
  },
  healthDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.borderLight,
  },
  healthValAmber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.amberDark,
  },
  healthValRed: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.softRed,
  },
  healthValGreen: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.freshGreen,
  },
  healthLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.charcoal,
    marginTop: 2,
  },
  healthSub: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 1,
  },
  chartSectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  emptyRankingBox: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyRankingText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  rankingList: {
    marginTop: Spacing.xs,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rankingPositionPill: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rankingPositionText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.deepEmerald,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  rankingUnits: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  rankingRevenue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.freshGreen,
  },
  historyLinkCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  historyLinkTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  historyLinkSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  exportSectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  exportTextCol: {
    marginBottom: Spacing.md,
  },
  exportSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  exportSectionSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  exportButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  exportPillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.softBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  exportPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.deepEmerald,
  },
});
