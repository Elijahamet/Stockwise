import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Search,
  Barcode,
  Package,
  Layers,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
  X,
  Plus,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Product, ProductBatch, ExpiryStatus } from '../../types';
import {
  getProductExpiryOverview,
  formatDisplayDate,
  calculateExpiryStatus,
} from '../../utils/expiry';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/buttons/Button';
import { Header } from '../../components/common/Header';

type FilterTab = 'all' | 'expired' | 'expiring_soon' | 'healthy' | 'unknown';

export default function ExpiryManagementScreen() {
  const { products, updateProductExpiry, addBatchToProduct, settings, currentTheme } = useApp();

  const themeAccent = currentTheme?.colors?.accent || Colors.freshGreen;
  const themeAccentLight = currentTheme?.colors?.accentLight || Colors.emeraldLight;

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing Expiry Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editMfgDate, setEditMfgDate] = useState('');

  // Adding Batch Modal State
  const [batchingProduct, setBatchingProduct] = useState<Product | null>(null);
  const [newBatchNumber, setNewBatchNumber] = useState('');
  const [newBatchQty, setNewBatchQty] = useState('');
  const [newBatchExpiry, setNewBatchExpiry] = useState('');

  // Overview calculations
  const productOverviews = products.map((product) => ({
    product,
    overview: getProductExpiryOverview(product),
  }));

  const expiredCount = productOverviews.filter((p) => p.overview.overall.isExpired).length;
  const expiringSoonCount = productOverviews.filter(
    (p) => p.overview.overall.isExpiringSoon
  ).length;
  const healthyCount = productOverviews.filter(
    (p) => p.overview.overall.status === 'NOT_EXPIRED'
  ).length;
  const unknownCount = productOverviews.filter(
    (p) => p.overview.overall.status === 'EXPIRY_DATE_UNKNOWN'
  ).length;

  const filteredProducts = productOverviews.filter(({ product, overview }) => {
    // Tab filter
    if (activeFilter === 'expired' && !overview.overall.isExpired) return false;
    if (activeFilter === 'expiring_soon' && !overview.overall.isExpiringSoon) return false;
    if (activeFilter === 'healthy' && overview.overall.status !== 'NOT_EXPIRED') return false;
    if (activeFilter === 'unknown' && overview.overall.status !== 'EXPIRY_DATE_UNKNOWN') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchSku = product.sku.toLowerCase().includes(q);
      const matchBarcode = product.barcode?.toLowerCase().includes(q);
      return matchName || matchSku || matchBarcode;
    }
    return true;
  });

  const handleOpenEditExpiry = (product: Product) => {
    setEditingProduct(product);
    setEditExpiryDate(product.expiryDate || '');
    setEditMfgDate(product.manufacturingDate || '');
  };

  const handleSaveExpiry = () => {
    if (!editingProduct) return;
    updateProductExpiry(editingProduct.id, editExpiryDate, editMfgDate);
    setEditingProduct(null);
  };

  const handleOpenAddBatch = (product: Product) => {
    setBatchingProduct(product);
    setNewBatchNumber(`B-${Date.now().toString().slice(-4)}`);
    setNewBatchQty('');
    setNewBatchExpiry('');
  };

  const handleSaveBatch = () => {
    if (!batchingProduct || !newBatchQty.trim() || Number(newBatchQty) <= 0) return;
    addBatchToProduct(batchingProduct.id, {
      batchNumber: newBatchNumber.trim() || `B-${Date.now().toString().slice(-4)}`,
      quantity: Number(newBatchQty),
      expiryDate: newBatchExpiry.trim() || undefined,
      receivedDate: new Date().toISOString().split('T')[0],
    });
    setBatchingProduct(null);
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      {/* Top Action Bar with Quick Barcode Scan */}
      <View style={styles.topActionBar}>
        <View style={styles.searchBox}>
          <Search size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by product, SKU or barcode..."
            placeholderTextColor={Colors.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => router.push('/scanner')}
          activeOpacity={0.8}
        >
          <Barcode size={18} color={Colors.white} />
          <Text style={styles.scanBtnText}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Banner */}
      <View style={styles.metricsRow}>
        <TouchableOpacity
          style={[styles.metricCard, activeFilter === 'expired' && styles.activeMetricCardRed]}
          onPress={() => setActiveFilter(activeFilter === 'expired' ? 'all' : 'expired')}
          activeOpacity={0.7}
        >
          <Text style={styles.metricCardCountRed}>{expiredCount}</Text>
          <Text style={styles.metricCardLabel}>Expired</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.metricCard,
            activeFilter === 'expiring_soon' && styles.activeMetricCardAmber,
          ]}
          onPress={() =>
            setActiveFilter(activeFilter === 'expiring_soon' ? 'all' : 'expiring_soon')
          }
          activeOpacity={0.7}
        >
          <Text style={styles.metricCardCountAmber}>{expiringSoonCount}</Text>
          <Text style={styles.metricCardLabel}>Expiring Soon</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.metricCard, activeFilter === 'healthy' && styles.activeMetricCardGreen]}
          onPress={() => setActiveFilter(activeFilter === 'healthy' ? 'all' : 'healthy')}
          activeOpacity={0.7}
        >
          <Text style={styles.metricCardCountGreen}>{healthyCount}</Text>
          <Text style={styles.metricCardLabel}>Healthy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.metricCard, activeFilter === 'unknown' && styles.activeMetricCardNeutral]}
          onPress={() => setActiveFilter(activeFilter === 'unknown' ? 'all' : 'unknown')}
          activeOpacity={0.7}
        >
          <Text style={styles.metricCardCountNeutral}>{unknownCount}</Text>
          <Text style={styles.metricCardLabel}>Unknown</Text>
        </TouchableOpacity>
      </View>

      {/* Segment Tabs */}
      <View style={styles.tabScrollWrap}>
        {(
          [
            { key: 'all', label: `All (${products.length})` },
            { key: 'expired', label: `Expired (${expiredCount})` },
            { key: 'expiring_soon', label: `Expiring Soon (${expiringSoonCount})` },
            { key: 'healthy', label: `Healthy (${healthyCount})` },
            { key: 'unknown', label: `Unknown (${unknownCount})` },
          ] as const
        ).map((tab) => {
          const isSelected = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTabPill,
                isSelected && [
                  styles.activeFilterTabPill,
                  { backgroundColor: themeAccentLight, borderColor: themeAccent },
                ],
              ]}
              onPress={() => setActiveFilter(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabPillText,
                  isSelected && [styles.activeFilterTabPillText, { color: themeAccent }],
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main List */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Calendar size={36} color={Colors.freshGreen} />}
          title={
            activeFilter === 'expired'
              ? 'No Expired Products'
              : activeFilter === 'expiring_soon'
              ? 'No Products Expiring Soon'
              : 'No Products Matching Filter'
          }
          description={
            activeFilter === 'expired'
              ? 'Great news! All products in your store inventory are currently within their expiration dates.'
              : activeFilter === 'expiring_soon'
              ? 'No registered products are approaching their 30-day expiry threshold.'
              : 'Add products and record expiry dates to track stock lifespan accurately.'
          }
          actionTitle={searchQuery ? 'Clear Search' : '+ Add Product'}
          onAction={searchQuery ? () => setSearchQuery('') : () => router.push('/products/new')}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={({ product }) => product.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: { product, overview } }) => {
            const isExpired = overview.overall.isExpired;
            const isExpiringSoon = overview.overall.isExpiringSoon;

            return (
              <View
                style={[
                  styles.productExpiryCard,
                  isExpired && styles.cardBorderRed,
                  isExpiringSoon && styles.cardBorderAmber,
                ]}
              >
                {/* Top Row: Name, Category, Expiry Pill Badge */}
                <View style={styles.cardTopRow}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.productNameText} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.productMetaText}>
                      {product.category} • SKU: {product.sku}
                      {product.barcode ? ` • Barcode: ${product.barcode}` : ''}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: overview.overall.bgColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: overview.overall.color },
                      ]}
                    >
                      {overview.overall.badgeText}
                    </Text>
                  </View>
                </View>

                {/* Metrics Breakdown Box */}
                <View style={styles.detailBox}>
                  <View style={styles.metricPair}>
                    <Text style={styles.metricPairLabel}>In Stock</Text>
                    <Text style={styles.metricPairValue}>
                      {product.quantity} {product.unit}
                    </Text>
                  </View>

                  <View style={styles.metricPair}>
                    <Text style={styles.metricPairLabel}>Expiry Date</Text>
                    <Text style={styles.metricPairValue}>
                      {formatDisplayDate(product.expiryDate)}
                    </Text>
                  </View>

                  <View style={styles.metricPair}>
                    <Text style={styles.metricPairLabel}>Timeline</Text>
                    <Text
                      style={[
                        styles.metricPairValueBold,
                        { color: overview.overall.color },
                      ]}
                    >
                      {overview.overall.label}
                    </Text>
                  </View>
                </View>

                {/* Multi-Batch Breakdown if Present */}
                {overview.batchesInfo.length > 0 && (
                  <View style={styles.batchSubSection}>
                    <View style={styles.batchSubHeader}>
                      <Layers size={13} color={Colors.deepEmerald} />
                      <Text style={styles.batchSubHeaderText}>
                        Recorded Batches ({overview.batchesInfo.length})
                      </Text>
                    </View>
                    {overview.batchesInfo.map(({ batch, calculation }) => (
                      <View key={batch.id} style={styles.batchRow}>
                        <View>
                          <Text style={styles.batchRowTitle}>Batch #{batch.batchNumber}</Text>
                          <Text style={styles.batchRowSub}>
                            Expires: {formatDisplayDate(batch.expiryDate)}
                          </Text>
                        </View>
                        <View style={styles.batchRowRight}>
                          <Text style={styles.batchRowQty}>
                            {batch.quantity} {product.unit}
                          </Text>
                          <View
                            style={[
                              styles.miniBatchBadge,
                              { backgroundColor: calculation.bgColor },
                            ]}
                          >
                            <Text style={[styles.miniBatchBadgeText, { color: calculation.color }]}>
                              {calculation.badgeText}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Footer Actions */}
                <View style={styles.cardFooterActions}>
                  <TouchableOpacity
                    style={styles.cardActionBtn}
                    onPress={() => handleOpenEditExpiry(product)}
                    activeOpacity={0.7}
                  >
                    <Edit2 size={13} color={Colors.deepEmerald} />
                    <Text style={styles.cardActionBtnText}>Update Expiry</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cardActionBtn}
                    onPress={() => handleOpenAddBatch(product)}
                    activeOpacity={0.7}
                  >
                    <Plus size={14} color={Colors.deepEmerald} />
                    <Text style={styles.cardActionBtnText}>+ Batch</Text>
                  </TouchableOpacity>

                  {isExpired && (
                    <TouchableOpacity
                      style={[styles.cardActionBtn, styles.dangerBtn]}
                      onPress={() =>
                        router.push({
                          pathname: '/stock/remove',
                          params: { productId: product.id, reason: 'Expired products' },
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <Trash2 size={13} color={Colors.softRed} />
                      <Text style={styles.dangerBtnText}>Remove Expired</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.iconOnlyBtn}
                    onPress={() => router.push(`/products/${product.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <Eye size={15} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* =========================================================================
          MODAL 1: EDIT EXPIRY DATE
         ========================================================================= */}
      <Modal
        visible={!!editingProduct}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEditingProduct(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Expiration Date</Text>
              <TouchableOpacity onPress={() => setEditingProduct(null)}>
                <X size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalProductName} numberOfLines={1}>
              {editingProduct?.name}
            </Text>

            <Text style={styles.inputLabel}>Expiry Date (YYYY-MM-DD):</Text>
            <View style={styles.inputWrap}>
              <Calendar size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD (e.g. 2026-12-31)"
                placeholderTextColor={Colors.textPlaceholder}
                value={editExpiryDate}
                onChangeText={setEditExpiryDate}
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>
              Optional Manufacturing Date (YYYY-MM-DD):
            </Text>
            <View style={styles.inputWrap}>
              <Calendar size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD (e.g. 2025-06-01)"
                placeholderTextColor={Colors.textPlaceholder}
                value={editMfgDate}
                onChangeText={setEditMfgDate}
              />
            </View>

            <View style={styles.modalActionsRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setEditingProduct(null)}
                style={styles.modalBtn}
              />
              <Button
                title="Save Changes"
                variant="primary"
                onPress={handleSaveExpiry}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          MODAL 2: ADD PRODUCT BATCH
         ========================================================================= */}
      <Modal
        visible={!!batchingProduct}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setBatchingProduct(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Product Batch</Text>
              <TouchableOpacity onPress={() => setBatchingProduct(null)}>
                <X size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalProductName} numberOfLines={1}>
              {batchingProduct?.name}
            </Text>

            <Text style={styles.inputLabel}>Batch Number / Code:</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. B-2026-08"
                placeholderTextColor={Colors.textPlaceholder}
                value={newBatchNumber}
                onChangeText={setNewBatchNumber}
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: 10 }]}>Batch Quantity:</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 50"
                placeholderTextColor={Colors.textPlaceholder}
                keyboardType="numeric"
                value={newBatchQty}
                onChangeText={setNewBatchQty}
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: 10 }]}>Batch Expiry (YYYY-MM-DD):</Text>
            <View style={styles.inputWrap}>
              <Calendar size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD (e.g. 2026-11-30)"
                placeholderTextColor={Colors.textPlaceholder}
                value={newBatchExpiry}
                onChangeText={setNewBatchExpiry}
              />
            </View>

            <View style={styles.modalActionsRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setBatchingProduct(null)}
                style={styles.modalBtn}
              />
              <Button
                title="Add Batch"
                variant="primary"
                onPress={handleSaveBatch}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.softBackground,
  },
  topActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.charcoal,
    fontWeight: '500',
  },
  clearSearch: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.deepEmerald,
    paddingHorizontal: 14,
    height: 42,
    borderRadius: BorderRadius.md,
  },
  scanBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: 8,
    marginBottom: Spacing.xs,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  activeMetricCardRed: {
    borderColor: Colors.softRed,
    backgroundColor: Colors.redLight,
  },
  activeMetricCardAmber: {
    borderColor: Colors.amber,
    backgroundColor: Colors.amberLight,
  },
  activeMetricCardGreen: {
    borderColor: Colors.freshGreen,
    backgroundColor: Colors.emeraldLight,
  },
  activeMetricCardNeutral: {
    borderColor: Colors.deepEmerald,
    backgroundColor: Colors.surfaceSubtle,
  },
  metricCardCountRed: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.softRed,
  },
  metricCardCountAmber: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.amberDark,
  },
  metricCardCountGreen: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.freshGreen,
  },
  metricCardCountNeutral: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.charcoal,
  },
  metricCardLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  tabScrollWrap: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    gap: 6,
    flexWrap: 'wrap',
  },
  filterTabPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  activeFilterTabPill: {
    backgroundColor: Colors.deepEmerald,
    borderColor: Colors.deepEmerald,
  },
  filterTabPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  activeFilterTabPillText: {
    color: Colors.white,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  productExpiryCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  cardBorderRed: {
    borderColor: 'rgba(224, 72, 72, 0.5)',
    borderLeftWidth: 4,
    borderLeftColor: Colors.softRed,
  },
  cardBorderAmber: {
    borderColor: 'rgba(232, 146, 24, 0.5)',
    borderLeftWidth: 4,
    borderLeftColor: Colors.amber,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  productNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  productMetaText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  detailBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.softBackground,
    borderRadius: BorderRadius.md,
    padding: 8,
    marginVertical: 10,
  },
  metricPair: {
    alignItems: 'flex-start',
  },
  metricPairLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  metricPairValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.charcoal,
    marginTop: 1,
  },
  metricPairValueBold: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 1,
  },
  batchSubSection: {
    backgroundColor: Colors.softBackground,
    borderRadius: BorderRadius.sm,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  batchSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  batchSubHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.deepEmerald,
  },
  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  batchRowTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  batchRowSub: {
    fontSize: 9,
    color: Colors.textMuted,
  },
  batchRowRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  batchRowQty: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  miniBatchBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  miniBatchBadgeText: {
    fontSize: 7,
    fontWeight: '800',
  },
  cardFooterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.softBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.deepEmerald,
  },
  dangerBtn: {
    backgroundColor: Colors.redLight,
    borderColor: Colors.softRed,
  },
  dangerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.softRed,
  },
  iconOnlyBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.softBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalBox: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  modalProductName: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.charcoal,
    marginBottom: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.softBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.charcoal,
    fontWeight: '600',
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: Spacing.lg,
  },
  modalBtn: {
    flex: 1,
  },
});
