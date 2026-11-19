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
  PlusCircle,
  MinusCircle,
  SlidersHorizontal,
  History,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  TrendingUp,
  Package,
  Calendar,
  FileText,
  FileSpreadsheet,
  DollarSign,
  Award,
  CheckCircle2,
  BarChart3,
  Layers,
  Barcode,
  AlertTriangle,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/common/Header';
import { SyncStatusBanner } from '../../components/common/SyncStatusBanner';
import { StatCard } from '../../components/cards/StatCard';
import { CategoryDistributionChart } from '../../components/charts/CategoryDistributionChart';
import { EmptyState } from '../../components/common/EmptyState';

type MainView = 'operations' | 'reports';
type ReportTab = 'inventory' | 'sales' | 'movements';
type DateRange = 'today' | 'week' | 'month' | 'all';

export default function StockScreen() {
  const { stockMovements, products, sales, settings } = useApp();

  // Top level switch: Operations vs Reports (Reports embedded inside Stock)
  const [mainView, setMainView] = useState<MainView>('operations');

  // Operations filter
  const [movementFilter, setMovementFilter] = useState<'all' | 'add' | 'remove' | 'adjustment' | 'sale'>('all');

  // Reports filters & states
  const [reportTab, setReportTab] = useState<ReportTab>('inventory');
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Operations Calculations
  const filteredMovements = stockMovements.filter((m) => {
    if (movementFilter === 'all') return true;
    return m.type === movementFilter;
  });

  const totalRestocked = stockMovements
    .filter((m) => m.type === 'add')
    .reduce((sum, m) => sum + Math.abs(m.quantityChange), 0);

  const totalDeducted = stockMovements
    .filter((m) => m.type === 'remove' || m.type === 'sale')
    .reduce((sum, m) => sum + Math.abs(m.quantityChange), 0);

  // Reports Calculations
  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const costValuation = products.reduce((sum, p) => sum + p.quantity * p.buyingPrice, 0);
  const retailValuation = products.reduce((sum, p) => sum + p.quantity * p.sellingPrice, 0);
  const potentialProfit = retailValuation - costValuation;

  const lowStockCount = products.filter(
    (p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold
  ).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalDiscounts = sales.reduce((sum, s) => sum + s.discount, 0);
  const totalTransactions = sales.length;
  const avgBasketValue = totalTransactions > 0 ? totalSalesRevenue / totalTransactions : 0;

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

  const categoryMap: Record<string, number> = {};
  products.forEach((p) => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([category, count]) => ({
    category,
    count,
  }));

  const handleExport = (type: 'PDF' | 'CSV') => {
    const filename = `Stockwise_${reportTab.toUpperCase()}_Report_${dateRange}.${type.toLowerCase()}`;
    setExportNotice(`Exported ${filename} successfully.`);
    setTimeout(() => {
      setExportNotice(null);
    }, 3500);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Header
        title="Stock & Analytics"
        subtitle="Manage inventory movements & financial reports"
        showBusinessInfo={false}
      />
      <SyncStatusBanner />

      {/* Primary Top View Switcher: Operations vs Reports */}
      <View style={styles.topSegmentContainer}>
        <View style={styles.segmentTrack}>
          <TouchableOpacity
            style={[styles.segmentBtn, mainView === 'operations' && styles.segmentBtnActive]}
            onPress={() => setMainView('operations')}
            activeOpacity={0.8}
          >
            <Layers size={15} color={mainView === 'operations' ? Colors.deepEmerald : Colors.textMuted} />
            <Text
              style={[
                styles.segmentBtnText,
                mainView === 'operations' && styles.segmentBtnTextActive,
              ]}
            >
              Stock Operations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, mainView === 'reports' && styles.segmentBtnActive]}
            onPress={() => setMainView('reports')}
            activeOpacity={0.8}
          >
            <BarChart3 size={15} color={mainView === 'reports' ? Colors.deepEmerald : Colors.textMuted} />
            <Text
              style={[
                styles.segmentBtnText,
                mainView === 'reports' && styles.segmentBtnTextActive,
              ]}
            >
              Reports & Analytics
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== VIEW 1: STOCK OPERATIONS ==================== */}
        {mainView === 'operations' && (
          <View style={styles.operationsWrapper}>
            {/* Section Label */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.microSectionLabel}>CORE ACTIONS</Text>
            </View>

            {/* 3 Core Action Cards */}
            <View style={styles.actionsContainer}>
              {/* Add Stock Card */}
              <TouchableOpacity
                style={styles.freshaActionCard}
                onPress={() => router.push('/stock/add')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#E8F6F1', '#D4EFE4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionIconPill}
                >
                  <PlusCircle size={22} color={Colors.freshGreen} />
                </LinearGradient>
                <View style={styles.actionCardContent}>
                  <View style={styles.actionTitleRow}>
                    <Text style={styles.actionCardTitle}>Add Stock</Text>
                    <View style={[styles.pillBadge, { backgroundColor: Colors.emeraldLight }]}>
                      <Text style={[styles.pillBadgeText, { color: Colors.deepEmerald }]}>PURCHASE</Text>
                    </View>
                  </View>
                  <Text style={styles.actionCardDesc}>
                    Record deliveries, new supplier purchases & restocks.
                  </Text>
                </View>
                <ChevronRight size={18} color={Colors.textLight} />
              </TouchableOpacity>

              {/* Remove Stock Card */}
              <TouchableOpacity
                style={styles.freshaActionCard}
                onPress={() => router.push('/stock/remove')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#FDF1F1', '#FBE2E2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionIconPill}
                >
                  <MinusCircle size={22} color={Colors.softRed} />
                </LinearGradient>
                <View style={styles.actionCardContent}>
                  <View style={styles.actionTitleRow}>
                    <Text style={styles.actionCardTitle}>Remove Stock</Text>
                    <View style={[styles.pillBadge, { backgroundColor: Colors.redLight }]}>
                      <Text style={[styles.pillBadgeText, { color: Colors.softRed }]}>DEDUCTION</Text>
                    </View>
                  </View>
                  <Text style={styles.actionCardDesc}>
                    Log damaged items, expired products, shrinkage or internal use.
                  </Text>
                </View>
                <ChevronRight size={18} color={Colors.textLight} />
              </TouchableOpacity>

              {/* Adjust Stock Card */}
              <TouchableOpacity
                style={styles.freshaActionCard}
                onPress={() => router.push('/stock/adjust')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#FEF6EA', '#FCEBD2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionIconPill}
                >
                  <SlidersHorizontal size={22} color={Colors.amberDark} />
                </LinearGradient>
                <View style={styles.actionCardContent}>
                  <View style={styles.actionTitleRow}>
                    <Text style={styles.actionCardTitle}>Adjust Stock</Text>
                    <View style={[styles.pillBadge, { backgroundColor: Colors.amberLight }]}>
                      <Text style={[styles.pillBadgeText, { color: Colors.amberDark }]}>AUDIT</Text>
                    </View>
                  </View>
                  <Text style={styles.actionCardDesc}>
                    Reconcile physical stock counts with recorded inventory numbers.
                  </Text>
                </View>
                <ChevronRight size={18} color={Colors.textLight} />
              </TouchableOpacity>

              {/* Expiry Management Card */}
              <TouchableOpacity
                style={styles.freshaActionCard}
                onPress={() => router.push('/expiry')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#FFF5F5', '#FED7D7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionIconPill}
                >
                  <AlertTriangle size={22} color={Colors.softRed} />
                </LinearGradient>
                <View style={styles.actionCardContent}>
                  <View style={styles.actionTitleRow}>
                    <Text style={styles.actionCardTitle}>Expiry Management</Text>
                    <View style={[styles.pillBadge, { backgroundColor: Colors.redLight }]}>
                      <Text style={[styles.pillBadgeText, { color: Colors.softRed }]}>SHELF LIFE</Text>
                    </View>
                  </View>
                  <Text style={styles.actionCardDesc}>
                    Track expiration dates, monitor batches & record expired stock.
                  </Text>
                </View>
                <ChevronRight size={18} color={Colors.textLight} />
              </TouchableOpacity>

              {/* Barcode & Expiry Scanner Card */}
              <TouchableOpacity
                style={styles.freshaActionCard}
                onPress={() => router.push('/scanner')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#E8F6F1', '#C6EFE0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionIconPill}
                >
                  <Barcode size={22} color={Colors.deepEmerald} />
                </LinearGradient>
                <View style={styles.actionCardContent}>
                  <View style={styles.actionTitleRow}>
                    <Text style={styles.actionCardTitle}>Barcode Scanner</Text>
                    <View style={[styles.pillBadge, { backgroundColor: Colors.emeraldLight }]}>
                      <Text style={[styles.pillBadgeText, { color: Colors.deepEmerald }]}>CAMERA</Text>
                    </View>
                  </View>
                  <Text style={styles.actionCardDesc}>
                    Instant camera barcode scanning with automatic expiry detection.
                  </Text>
                </View>
                <ChevronRight size={18} color={Colors.textLight} />
              </TouchableOpacity>
            </View>

            {/* Quick Audit Metrics */}
            {stockMovements.length > 0 && (
              <View style={styles.metricsSummaryCard}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>TOTAL RESTOCKED</Text>
                  <Text style={[styles.metricValue, { color: Colors.freshGreen }]}>
                    +{totalRestocked}
                  </Text>
                  <Text style={styles.metricSub}>units received</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>TOTAL OUTFLOW</Text>
                  <Text style={[styles.metricValue, { color: Colors.charcoal }]}>
                    -{totalDeducted}
                  </Text>
                  <Text style={styles.metricSub}>sold or removed</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>AUDIT LOGS</Text>
                  <Text style={[styles.metricValue, { color: Colors.deepEmerald }]}>
                    {stockMovements.length}
                  </Text>
                  <Text style={styles.metricSub}>recorded events</Text>
                </View>
              </View>
            )}

            {/* Movement History Section Header */}
            <View style={styles.historySectionHeader}>
              <View>
                <Text style={styles.microSectionLabel}>AUDIT TRAIL</Text>
                <Text style={styles.sectionTitle}>Movement Log</Text>
              </View>

              {stockMovements.length > 0 && (
                <TouchableOpacity
                  style={styles.viewFullLogPill}
                  onPress={() => router.push('/stock/history')}
                >
                  <Text style={styles.viewFullLogText}>View Full Log</Text>
                  <ChevronRight size={14} color={Colors.freshGreen} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPillsRow}
            >
              {(
                [
                  { key: 'all', label: `All (${stockMovements.length})` },
                  { key: 'add', label: 'Restocked' },
                  { key: 'sale', label: 'Sales' },
                  { key: 'remove', label: 'Removed' },
                  { key: 'adjustment', label: 'Adjustments' },
                ] as const
              ).map((pill) => {
                const isSelected = movementFilter === pill.key;
                return (
                  <TouchableOpacity
                    key={pill.key}
                    style={[styles.filterPill, isSelected && styles.activeFilterPill]}
                    onPress={() => setMovementFilter(pill.key)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        isSelected && styles.activeFilterPillText,
                      ]}
                    >
                      {pill.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {filteredMovements.length === 0 ? (
              <EmptyState
                icon={<History size={36} color={Colors.freshGreen} />}
                title="No Stock Movements Yet"
                description={
                  products.length === 0
                    ? 'Add your first product to start logging incoming and outgoing stock.'
                    : 'Choose Add Stock, Remove Stock, or Adjust Stock above to record your first movement.'
                }
                actionTitle={products.length === 0 ? '+ Add Product' : '+ Add Stock'}
                onAction={
                  products.length === 0
                    ? () => router.push('/products/new')
                    : () => router.push('/stock/add')
                }
              />
            ) : (
              <View style={styles.movementsCard}>
                {filteredMovements.slice(0, 10).map((movement, idx) => {
                  const isPositive = movement.quantityChange > 0;
                  const isSale = movement.type === 'sale';
                  const isAdjustment = movement.type === 'adjustment';

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
                    <View
                      key={movement.id}
                      style={[
                        styles.movementItem,
                        idx === filteredMovements.slice(0, 10).length - 1 && { borderBottomWidth: 0 },
                      ]}
                    >
                      <View style={[styles.movementIconWrap, { backgroundColor: badgeBg }]}>
                        {isPositive ? (
                          <ArrowUpRight size={18} color={badgeColor} />
                        ) : (
                          <ArrowDownRight size={18} color={badgeColor} />
                        )}
                      </View>

                      <View style={styles.movementDetails}>
                        <View style={styles.movementTitleRow}>
                          <Text style={styles.movementName} numberOfLines={1}>
                            {movement.productName}
                          </Text>
                          <View style={[styles.miniBadge, { backgroundColor: badgeBg }]}>
                            <Text style={[styles.miniBadgeText, { color: badgeColor }]}>
                              {badgeText}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.movementReasonText} numberOfLines={1}>
                          {movement.reason}
                        </Text>

                        <Text style={styles.movementMeta}>
                          {new Date(movement.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          • {movement.employeeName}
                        </Text>

                        {movement.notes && (
                          <Text style={styles.movementNotes} numberOfLines={1}>
                            "{movement.notes}"
                          </Text>
                        )}
                      </View>

                      <View style={styles.movementDiffCol}>
                        <Text
                          style={[
                            styles.diffNumber,
                            { color: isPositive ? Colors.freshGreen : Colors.charcoal },
                          ]}
                        >
                          {isPositive ? `+${movement.quantityChange}` : movement.quantityChange}
                        </Text>
                        <View style={styles.diffPill}>
                          <Text style={styles.diffRange}>
                            {movement.previousQuantity} → {movement.newQuantity}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ==================== VIEW 2: REPORTS & ANALYTICS (EMBEDDED) ==================== */}
        {mainView === 'reports' && (
          <View style={styles.reportsWrapper}>
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

            {/* Report Sub-Tabs */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tabItem, reportTab === 'inventory' && styles.activeTabItem]}
                onPress={() => setReportTab('inventory')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, reportTab === 'inventory' && styles.activeTabText]}>
                  Valuation
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, reportTab === 'sales' && styles.activeTabItem]}
                onPress={() => setReportTab('sales')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, reportTab === 'sales' && styles.activeTabText]}>
                  Sales Performance
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, reportTab === 'movements' && styles.activeTabItem]}
                onPress={() => setReportTab('movements')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, reportTab === 'movements' && styles.activeTabText]}>
                  Stock Audits
                </Text>
              </TouchableOpacity>
            </View>

            {/* SUB-TAB 1: INVENTORY VALUATION */}
            {reportTab === 'inventory' && (
              <View style={styles.tabContent}>
                <View style={styles.statsGrid}>
                  <View style={styles.gridCol}>
                    <StatCard
                      title="Inventory at Cost"
                      value={`${settings.currency}${costValuation.toFixed(2)}`}
                      subtitle="Purchase investment"
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

                {/* Stock Health Overview Card */}
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

                {/* Category Breakdown */}
                <View style={styles.chartSectionCard}>
                  <Text style={styles.cardHeaderTitle}>Category Breakdown</Text>
                  <Text style={styles.cardHeaderSubtitle}>
                    Stock concentration across product lines
                  </Text>
                  <CategoryDistributionChart categories={categoryData} />
                </View>
              </View>
            )}

            {/* SUB-TAB 2: SALES PERFORMANCE */}
            {reportTab === 'sales' && (
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

                {/* Top Selling Products */}
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
              </View>
            )}

            {/* SUB-TAB 3: STOCK AUDITS */}
            {reportTab === 'movements' && (
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
              </View>
            )}

            {/* Export Section */}
            <View style={styles.exportSectionCard}>
              <View style={styles.exportTextCol}>
                <Text style={styles.exportSectionTitle}>Export Data Report</Text>
                <Text style={styles.exportSectionSub}>
                  Download formatted offline {reportTab} summary for audits
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
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.softBackground,
  },
  topSegmentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: '#EAEFEA',
    borderRadius: BorderRadius.full,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
  },
  segmentBtnActive: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  segmentBtnTextActive: {
    color: Colors.charcoal,
    fontWeight: '800',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  operationsWrapper: {
    gap: Spacing.md,
  },
  reportsWrapper: {
    gap: Spacing.md,
  },
  sectionHeaderRow: {
    marginBottom: 2,
  },
  microSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  actionsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  freshaActionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  actionIconPill: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  actionCardContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  actionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  actionCardDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  metricsSummaryCard: {
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
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricSub: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.borderLight,
  },
  historySectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
    marginTop: 2,
  },
  viewFullLogPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.emeraldLight,
  },
  viewFullLogText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.freshGreen,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
    paddingBottom: Spacing.xs,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  activeFilterPill: {
    backgroundColor: Colors.deepEmerald,
    borderColor: Colors.deepEmerald,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  activeFilterPillText: {
    color: Colors.white,
    fontWeight: '700',
  },
  movementsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  movementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  movementIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  movementDetails: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  movementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  movementName: {
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
  movementReasonText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  movementMeta: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  movementNotes: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  movementDiffCol: {
    alignItems: 'flex-end',
  },
  diffNumber: {
    fontSize: 15,
    fontWeight: '800',
  },
  diffPill: {
    backgroundColor: Colors.softBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginTop: 4,
  },
  diffRange: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },

  // Reports Styles
  exportSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.emeraldLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
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
    marginBottom: Spacing.xs,
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
    marginBottom: Spacing.sm,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
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
    fontWeight: '800',
  },
  tabContent: {
    gap: Spacing.md,
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
  exportSectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
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
