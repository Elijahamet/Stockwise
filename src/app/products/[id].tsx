import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  Package,
  Tag,
  Barcode,
  Calendar,
  Edit2,
  Trash2,
  PlusCircle,
  MinusCircle,
  SlidersHorizontal,
  History,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Boxes,
  X,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/buttons/Button';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import { InputField } from '../../components/forms/InputField';
import {
  calculateExpiryStatus,
  getProductExpiryOverview,
  formatDisplayDate,
  parseLocalDate,
} from '../../utils/expiry';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getProductById,
    deleteProduct,
    stockMovements,
    settings,
    updateProductExpiry,
    recordExpiredStock,
  } = useApp();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [showRecordExpiredModal, setShowRecordExpiredModal] = useState(false);

  // Expiry modal state
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [newMfgDate, setNewMfgDate] = useState('');
  const [expiryError, setExpiryError] = useState('');

  // Record expired modal state
  const [expiredQty, setExpiredQty] = useState('');
  const [expiredNotes, setExpiredNotes] = useState('');
  const [recordExpiredError, setRecordExpiredError] = useState('');

  const product = getProductById(id);

  if (!product) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Package size={48} color={Colors.textLight} />
        <Text style={styles.notFoundTitle}>Product Not Found</Text>
        <Text style={styles.notFoundSubtitle}>
          This product might have been deleted or does not exist.
        </Text>
        <Button
          title="Back to Inventory"
          onPress={() => router.replace('/(tabs)/inventory')}
          style={styles.backBtn}
        />
      </SafeAreaView>
    );
  }

  // Filter movements for this product
  const productMovements = stockMovements.filter((m) => m.productId === product.id);

  const isOutOfStock = product.quantity === 0;
  const isLowStock = !isOutOfStock && product.quantity <= product.lowStockThreshold;

  const profitPerUnit = product.sellingPrice - product.buyingPrice;
  const marginPercent =
    product.sellingPrice > 0
      ? Math.round((profitPerUnit / product.sellingPrice) * 100)
      : 0;

  // Expiry Calculation
  const { overall: expiryOverview } = getProductExpiryOverview(product);
  const isProductExpired = expiryOverview.isExpired;

  const handleOpenExpiryModal = () => {
    setNewExpiryDate(product.expiryDate || '');
    setNewMfgDate(product.manufacturingDate || '');
    setExpiryError('');
    setShowExpiryModal(true);
  };

  const handleSaveExpiry = () => {
    if (newExpiryDate.trim()) {
      const parsed = parseLocalDate(newExpiryDate.trim());
      if (!parsed) {
        setExpiryError('Use YYYY-MM-DD format (e.g. 2026-12-31)');
        return;
      }
    }
    updateProductExpiry(
      product.id,
      newExpiryDate.trim() || undefined,
      newMfgDate.trim() || undefined
    );
    setShowExpiryModal(false);
  };

  const handleOpenRecordExpiredModal = () => {
    setExpiredQty(Math.min(product.quantity, 1).toString());
    setExpiredNotes('Expired stock removal');
    setRecordExpiredError('');
    setShowRecordExpiredModal(true);
  };

  const handleConfirmRecordExpired = () => {
    const qty = Number(expiredQty);
    if (isNaN(qty) || qty <= 0) {
      setRecordExpiredError('Please enter a valid quantity greater than 0');
      return;
    }
    if (qty > product.quantity) {
      setRecordExpiredError(`Cannot remove more than available stock (${product.quantity})`);
      return;
    }

    recordExpiredStock({
      productId: product.id,
      quantity: qty,
      notes: expiredNotes.trim() || undefined,
    });
    setShowRecordExpiredModal(false);
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* PROMINENT EXPIRED WARNING BANNER */}
        {isProductExpired && (
          <View style={styles.expiredAlertBanner}>
            <AlertTriangle size={24} color={Colors.white} />
            <View style={styles.expiredAlertTextWrap}>
              <Text style={styles.expiredAlertTitle}>
                WARNING: THIS PRODUCT HAS EXPIRED. DO NOT SELL IT.
              </Text>
              <Text style={styles.expiredAlertSubtitle}>
                Recorded expiry date was {formatDisplayDate(product.expiryDate)} (
                {Math.abs(expiryOverview.daysRemaining ?? 0)} days overdue).
              </Text>
            </View>
          </View>
        )}

        {/* Product Hero Header Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.productIconWrap}>
              <Package size={26} color={Colors.deepEmerald} />
            </View>
            <View style={styles.heroTitles}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{product.category}</Text>
              </View>
            </View>
          </View>

          {/* Stock Status Bar */}
          <View
            style={[
              styles.stockBanner,
              isOutOfStock
                ? styles.outBanner
                : isLowStock
                ? styles.lowBanner
                : styles.inBanner,
            ]}
          >
            <View>
              <Text style={styles.stockQuantityText}>
                {product.quantity} <Text style={styles.stockUnitText}>{product.unit}</Text>
              </Text>
              <Text
                style={[
                  styles.stockStatusLabel,
                  isOutOfStock
                    ? styles.outText
                    : isLowStock
                    ? styles.lowText
                    : styles.inText,
                ]}
              >
                {isOutOfStock
                  ? 'Out of Stock • Reorder urgently'
                  : isLowStock
                  ? `Low Stock Warning • Below threshold (${product.lowStockThreshold})`
                  : 'In Stock • Optimal level'}
              </Text>
            </View>

            <View
              style={[
                styles.healthStatusPill,
                isOutOfStock
                  ? styles.healthPillRed
                  : isLowStock
                  ? styles.healthPillAmber
                  : styles.healthPillGreen,
              ]}
            >
              <Text
                style={[
                  styles.healthStatusPillText,
                  isOutOfStock
                    ? styles.outText
                    : isLowStock
                    ? styles.lowText
                    : styles.inText,
                ]}
              >
                {isOutOfStock ? 'EMPTY' : isLowStock ? 'LOW' : 'HEALTHY'}
              </Text>
            </View>
          </View>

          {/* Quick Action Buttons Row */}
          <View style={styles.quickActionRow}>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() =>
                router.push({
                  pathname: '/stock/add',
                  params: { productId: product.id },
                })
              }
              activeOpacity={0.7}
            >
              <PlusCircle size={16} color={Colors.freshGreen} />
              <Text style={styles.quickBtnText}>Add Stock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() =>
                router.push({
                  pathname: '/stock/remove',
                  params: { productId: product.id },
                })
              }
              activeOpacity={0.7}
            >
              <MinusCircle size={16} color={Colors.softRed} />
              <Text style={styles.quickBtnText}>Remove</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() =>
                router.push({
                  pathname: '/stock/adjust',
                  params: { productId: product.id },
                })
              }
              activeOpacity={0.7}
            >
              <SlidersHorizontal size={16} color={Colors.amberDark} />
              <Text style={styles.quickBtnText}>Adjust</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* EXPIRY & SHELF-LIFE STATUS CARD */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.microSectionLabel}>EXPIRY & SHELF-LIFE</Text>
            <TouchableOpacity
              onPress={handleOpenExpiryModal}
              style={styles.editDateBtn}
              activeOpacity={0.7}
            >
              <Edit2 size={13} color={Colors.deepEmerald} />
              <Text style={styles.editDateBtnText}>Update Date</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.expiryOverviewBanner,
              { backgroundColor: expiryOverview.bgColor, borderColor: expiryOverview.borderColor },
            ]}
          >
            <View style={styles.expiryBadgeRow}>
              {expiryOverview.isExpired ? (
                <AlertTriangle size={18} color={expiryOverview.color} />
              ) : expiryOverview.isExpiringSoon ? (
                <AlertTriangle size={18} color={expiryOverview.color} />
              ) : expiryOverview.status === 'NOT_EXPIRED' ? (
                <CheckCircle2 size={18} color={expiryOverview.color} />
              ) : (
                <Clock size={18} color={expiryOverview.color} />
              )}
              <View>
                <Text style={[styles.expiryStatusTitle, { color: expiryOverview.color }]}>
                  {expiryOverview.label}
                </Text>
                <Text style={styles.expiryStatusSubtitle}>
                  {expiryOverview.daysRemaining !== null
                    ? expiryOverview.daysRemaining > 0
                      ? `${expiryOverview.daysRemaining} days remaining`
                      : expiryOverview.daysRemaining === 0
                      ? 'Expires today'
                      : `Expired ${Math.abs(expiryOverview.daysRemaining)} days ago`
                    : 'No expiry date recorded for this product'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.expiryStatusPill,
                { backgroundColor: expiryOverview.color + '20', borderColor: expiryOverview.color },
              ]}
            >
              <Text style={[styles.expiryStatusPillText, { color: expiryOverview.color }]}>
                {expiryOverview.badgeText}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Calendar size={16} color={Colors.textMuted} />
              <Text style={styles.detailLabel}>Recorded Expiry Date</Text>
            </View>
            <Text style={styles.detailValue}>
              {formatDisplayDate(product.expiryDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Clock size={16} color={Colors.textMuted} />
              <Text style={styles.detailLabel}>Manufacturing Date</Text>
            </View>
            <Text style={styles.detailValue}>
              {formatDisplayDate(product.manufacturingDate)}
            </Text>
          </View>

          {/* Action button if expired */}
          {product.quantity > 0 && (
            <View style={styles.expiryActionRow}>
              <TouchableOpacity
                style={[
                  styles.recordExpiredBtn,
                  isProductExpired && styles.recordExpiredBtnUrgent,
                ]}
                onPress={handleOpenRecordExpiredModal}
                activeOpacity={0.8}
              >
                <Trash2 size={15} color={Colors.white} />
                <Text style={styles.recordExpiredBtnText}>
                  {isProductExpired ? 'Remove All Expired Units' : 'Record Expired Stock'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Batches breakdown if multiple batches exist */}
          {product.batches && product.batches.length > 0 && (
            <View style={styles.batchesSection}>
              <View style={styles.batchesHeaderRow}>
                <Boxes size={15} color={Colors.textMuted} />
                <Text style={styles.batchesTitle}>
                  Tracked Batches ({product.batches.length})
                </Text>
              </View>

              {product.batches.map((batch) => {
                const bExp = calculateExpiryStatus(batch.expiryDate);
                return (
                  <View key={batch.id} style={styles.batchItemRow}>
                    <View style={styles.batchLeftCol}>
                      <Text style={styles.batchNumberText}>{batch.batchNumber}</Text>
                      <Text style={styles.batchDateText}>
                        Exp: {formatDisplayDate(batch.expiryDate)}
                      </Text>
                    </View>

                    <View style={styles.batchRightCol}>
                      <Text style={styles.batchQtyText}>
                        {batch.quantity} {product.unit}
                      </Text>
                      <View
                        style={[
                          styles.batchStatusBadge,
                          { backgroundColor: bExp.bgColor, borderColor: bExp.borderColor },
                        ]}
                      >
                        <Text style={[styles.batchStatusText, { color: bExp.color }]}>
                          {bExp.badgeText}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Pricing & Margins Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.microSectionLabel}>FINANCIAL METRICS</Text>

          <View style={styles.infoGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.itemLabel}>SELLING PRICE</Text>
              <Text style={styles.itemValueBold}>
                {settings.currency}
                {product.sellingPrice.toFixed(2)}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.itemLabel}>COST PRICE</Text>
              <Text style={styles.itemValue}>
                {settings.currency}
                {product.buyingPrice.toFixed(2)}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.itemLabel}>GROSS PROFIT / UNIT</Text>
              <Text
                style={[
                  styles.itemValueBold,
                  { color: profitPerUnit >= 0 ? Colors.freshGreen : Colors.softRed },
                ]}
              >
                {settings.currency}
                {profitPerUnit.toFixed(2)}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.itemLabel}>PROJECTED MARGIN</Text>
              <View style={styles.marginPillRow}>
                <Text style={styles.itemValueBold}>{marginPercent}%</Text>
                <View style={styles.marginChip}>
                  <TrendingUp size={12} color={Colors.freshGreen} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Product Identifiers Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.microSectionLabel}>IDENTIFIERS & CODES</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Tag size={16} color={Colors.textMuted} />
              <Text style={styles.detailLabel}>SKU / Code</Text>
            </View>
            <View style={styles.codePill}>
              <Text style={styles.codePillText}>{product.sku}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Barcode size={16} color={Colors.textMuted} />
              <Text style={styles.detailLabel}>Barcode</Text>
            </View>
            <Text style={styles.detailValue}>
              {product.barcode || 'None registered'}
            </Text>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <View style={styles.detailLabelRow}>
              <Calendar size={16} color={Colors.textMuted} />
              <Text style={styles.detailLabel}>Registered On</Text>
            </View>
            <Text style={styles.detailValue}>
              {new Date(product.createdAt).toLocaleDateString([], {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Stock Movement History */}
        <View style={styles.sectionCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.microSectionLabel}>MOVEMENT HISTORY</Text>
            <Text style={styles.historyCount}>
              {productMovements.length} event{productMovements.length === 1 ? '' : 's'}
            </Text>
          </View>

          {productMovements.length === 0 ? (
            <View style={styles.emptyHistory}>
              <History size={24} color={Colors.textLight} />
              <Text style={styles.emptyHistoryText}>
                No stock movements logged yet for this item.
              </Text>
            </View>
          ) : (
            <View style={styles.movementList}>
              {productMovements.map((m, idx) => {
                const isPositive = m.quantityChange > 0;
                return (
                  <View
                    key={m.id}
                    style={[
                      styles.movementItem,
                      idx === productMovements.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <View
                      style={[
                        styles.movementIconWrap,
                        {
                          backgroundColor:
                            m.type === 'sale'
                              ? Colors.emeraldLight
                              : isPositive
                              ? Colors.emeraldLight
                              : Colors.redLight,
                        },
                      ]}
                    >
                      {isPositive ? (
                        <ArrowUpRight size={16} color={Colors.freshGreen} />
                      ) : (
                        <ArrowDownRight
                          size={16}
                          color={m.type === 'sale' ? Colors.freshGreen : Colors.softRed}
                        />
                      )}
                    </View>

                    <View style={styles.movementDetails}>
                      <Text style={styles.movementReason}>{m.reason}</Text>
                      <Text style={styles.movementMeta}>
                        {new Date(m.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        • {m.employeeName}
                      </Text>
                      {m.notes && <Text style={styles.movementNotes}>"{m.notes}"</Text>}
                    </View>

                    <View style={styles.movementValues}>
                      <Text
                        style={[
                          styles.movementDelta,
                          { color: isPositive ? Colors.freshGreen : Colors.charcoal },
                        ]}
                      >
                        {isPositive ? `+${m.quantityChange}` : m.quantityChange}
                      </Text>
                      <Text style={styles.movementNewQty}>
                        Balance: {m.newQuantity} {product.unit}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionButtonsRow}>
          <Button
            title="Edit Product"
            variant="secondary"
            icon={<Edit2 size={16} color={Colors.white} />}
            onPress={() => router.push(`/products/edit/${product.id}` as any)}
            style={styles.actionBtn}
          />

          <Button
            title="Delete"
            variant="danger"
            icon={<Trash2 size={16} color={Colors.white} />}
            onPress={() => setShowDeleteModal(true)}
            style={styles.actionBtnDelete}
          />
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Product?"
        message={`Are you sure you want to permanently delete "${product.name}"? This cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={() => {
          deleteProduct(product.id);
          setShowDeleteModal(false);
          router.replace('/(tabs)/inventory');
        }}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Update Expiry Date Modal */}
      <Modal visible={showExpiryModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Expiry Information</Text>
              <TouchableOpacity onPress={() => setShowExpiryModal(false)}>
                <X size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <InputField
              label="Expiry Date (YYYY-MM-DD)"
              value={newExpiryDate}
              onChangeText={setNewExpiryDate}
              placeholder="e.g. 2026-12-31"
              icon={<Calendar size={16} color={Colors.textMuted} />}
              error={expiryError}
            />

            <InputField
              label="Manufacturing Date (Optional)"
              value={newMfgDate}
              onChangeText={setNewMfgDate}
              placeholder="e.g. 2025-01-15"
              icon={<Clock size={16} color={Colors.textMuted} />}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowExpiryModal(false)}
                style={styles.modalHalfBtn}
              />
              <Button
                title="Save Date"
                onPress={handleSaveExpiry}
                style={styles.modalHalfBtn}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Record Expired Stock Modal */}
      <Modal visible={showRecordExpiredModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Expired Stock</Text>
              <TouchableOpacity onPress={() => setShowRecordExpiredModal(false)}>
                <X size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Permanently remove expired units from inventory and log an expiry adjustment event.
            </Text>

            <InputField
              label={`Quantity to Remove (Max: ${product.quantity} ${product.unit})`}
              value={expiredQty}
              onChangeText={setExpiredQty}
              placeholder="1"
              keyboardType="numeric"
              error={recordExpiredError}
            />

            <InputField
              label="Removal Reason / Notes"
              value={expiredNotes}
              onChangeText={setExpiredNotes}
              placeholder="e.g. Passed shelf life, discarded"
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowRecordExpiredModal(false)}
                style={styles.modalHalfBtn}
              />
              <Button
                title="Remove Units"
                variant="danger"
                onPress={handleConfirmRecordExpired}
                style={styles.modalHalfBtn}
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.softBackground,
  },
  notFoundTitle: {
    ...Typography.h3,
    color: Colors.charcoal,
    marginTop: Spacing.md,
  },
  notFoundSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  backBtn: {
    minWidth: 180,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  productIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  heroTitles: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.charcoal,
    lineHeight: 24,
    marginBottom: 4,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.softBackground,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  stockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  inBanner: {
    backgroundColor: Colors.emeraldLight,
  },
  lowBanner: {
    backgroundColor: Colors.amberLight,
  },
  outBanner: {
    backgroundColor: Colors.redLight,
  },
  stockQuantityText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  stockUnitText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  stockStatusLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  inText: {
    color: Colors.deepEmerald,
  },
  lowText: {
    color: Colors.amberDark,
  },
  outText: {
    color: Colors.softRed,
  },
  healthStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  healthPillGreen: {
    backgroundColor: Colors.white,
  },
  healthPillAmber: {
    backgroundColor: Colors.white,
  },
  healthPillRed: {
    backgroundColor: Colors.white,
  },
  healthStatusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.softBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
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
    marginBottom: Spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  gridItem: {
    width: '47.5%',
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  itemValueBold: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  marginPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  marginChip: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  codePill: {
    backgroundColor: Colors.softBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  codePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.charcoal,
    fontFamily: 'monospace',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyCount: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textLight,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyHistoryText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  movementList: {
    marginTop: Spacing.xs,
  },
  movementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  movementIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  movementDetails: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  movementReason: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  movementMeta: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 1,
  },
  movementNotes: {
    fontSize: 10,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 1,
  },
  movementValues: {
    alignItems: 'flex-end',
  },
  movementDelta: {
    fontSize: 14,
    fontWeight: '800',
  },
  movementNewQty: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  actionBtn: {
    flex: 2,
  },
  actionBtnDelete: {
    flex: 1,
  },
  expiredAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.softRed,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  expiredAlertTextWrap: {
    flex: 1,
  },
  expiredAlertTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  expiredAlertSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  editDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
  },
  editDateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.deepEmerald,
  },
  expiryOverviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  expiryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  expiryStatusTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  expiryStatusSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  expiryStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  expiryStatusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  expiryActionRow: {
    marginTop: Spacing.sm,
  },
  recordExpiredBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.deepEmerald,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  recordExpiredBtnUrgent: {
    backgroundColor: Colors.softRed,
  },
  recordExpiredBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.white,
  },
  batchesSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  batchesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  batchesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  batchItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  batchLeftCol: {
    flex: 1,
  },
  batchNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  batchDateText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  batchRightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  batchQtyText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  batchStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  batchStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalBox: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 420,
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalHalfBtn: {
    flex: 1,
  },
});
