import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Barcode,
  Flashlight,
  FlashlightOff,
  X,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Package,
  Plus,
  Eye,
  Calendar,
  Trash2,
  RefreshCw,
  Search,
  Layers,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Product, ProductBatch } from '../../types';
import { getProductExpiryOverview, formatDisplayDate, calculateExpiryStatus } from '../../utils/expiry';
import { Button } from '../../components/buttons/Button';

export default function BarcodeExpiryScannerScreen() {
  const { products, getProductByBarcode, updateProductExpiry, recordExpiredStock, settings } = useApp();

  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [isNotFoundVisible, setIsNotFoundVisible] = useState(false);

  // Manual barcode entry modal
  const [isManualModalVisible, setIsManualModalVisible] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  // Quick Expiry Update Modal
  const [isEditExpiryModalVisible, setIsEditExpiryModalVisible] = useState(false);
  const [newExpiryInput, setNewExpiryInput] = useState('');
  const [newMfgInput, setNewMfgInput] = useState('');

  // Cooldown to prevent multiple scans within 2 seconds
  const isCooldownRef = useRef(false);

  // Auto-request permission on mount if not determined
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const processBarcode = (rawBarcode: string) => {
    if (!rawBarcode || isCooldownRef.current) return;
    isCooldownRef.current = true;

    const cleanBarcode = rawBarcode.trim();
    setScannedBarcode(cleanBarcode);

    const found = getProductByBarcode(cleanBarcode);

    if (found) {
      setMatchedProduct(found);
      setIsResultVisible(true);
      setIsNotFoundVisible(false);
    } else {
      setMatchedProduct(null);
      setIsResultVisible(false);
      setIsNotFoundVisible(true);
    }

    // Cooldown reset after 2.5 seconds
    setTimeout(() => {
      isCooldownRef.current = false;
    }, 2500);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!isResultVisible && !isNotFoundVisible && !isManualModalVisible) {
      processBarcode(data);
    }
  };

  const handleManualSubmit = () => {
    if (!manualBarcode.trim()) return;
    setIsManualModalVisible(false);
    processBarcode(manualBarcode.trim());
    setManualBarcode('');
  };

  const handleCloseResults = () => {
    setIsResultVisible(false);
    setIsNotFoundVisible(false);
    setMatchedProduct(null);
    setScannedBarcode(null);
    isCooldownRef.current = false;
  };

  const handleOpenUpdateExpiry = () => {
    if (!matchedProduct) return;
    setNewExpiryInput(matchedProduct.expiryDate || '');
    setNewMfgInput(matchedProduct.manufacturingDate || '');
    setIsEditExpiryModalVisible(true);
  };

  const handleSaveExpiry = () => {
    if (!matchedProduct) return;
    updateProductExpiry(matchedProduct.id, newExpiryInput, newMfgInput);
    // Refresh matched product in result view
    const updated = products.find((p) => p.id === matchedProduct.id);
    if (updated) {
      setMatchedProduct({
        ...updated,
        expiryDate: newExpiryInput.trim() || undefined,
        manufacturingDate: newMfgInput.trim() || undefined,
      });
    }
    setIsEditExpiryModalVisible(false);
  };

  const handleRecordExpired = () => {
    if (!matchedProduct) return;
    handleCloseResults();
    router.push({
      pathname: '/stock/remove',
      params: {
        productId: matchedProduct.id,
        reason: 'Expired products',
      },
    });
  };

  // Expiry calculation for matched product
  const expiryInfo = matchedProduct ? getProductExpiryOverview(matchedProduct) : null;
  const isProductExpired = expiryInfo?.overall.isExpired ?? false;

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <X size={20} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Barcode & Expiry Scanner</Text>

        <TouchableOpacity
          style={[styles.circleBtn, torchEnabled && styles.torchActiveBtn]}
          onPress={() => setTorchEnabled(!torchEnabled)}
          activeOpacity={0.7}
        >
          {torchEnabled ? (
            <FlashlightOff size={20} color={Colors.white} />
          ) : (
            <Flashlight size={20} color={Colors.white} />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Viewport Container */}
      <View style={styles.cameraWrapper}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={torchEnabled}
            barcodeScannerSettings={{
              barcodeTypes: [
                'qr',
                'ean13',
                'ean8',
                'upc_a',
                'upc_e',
                'code128',
                'code39',
                'code93',
                'itf14',
                'datamatrix',
              ],
            }}
            onBarcodeScanned={handleBarcodeScanned}
          />
        ) : (
          <View style={styles.permissionFallback}>
            <Barcode size={54} color={Colors.emeraldLight} />
            <Text style={styles.fallbackTitle}>Camera Access Required</Text>
            <Text style={styles.fallbackSubtitle}>
              To scan product barcodes directly from supermarket shelves, camera access is needed.
            </Text>
            <Button
              title="Grant Camera Access"
              onPress={requestPermission}
              style={styles.grantBtn}
            />
            <TouchableOpacity
              style={styles.manualEntryLink}
              onPress={() => setIsManualModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.manualEntryLinkText}>Or Enter Barcode Manually ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Viewfinder Reticle Overlay */}
        {permission?.granted && (
          <View style={styles.overlayContainer} pointerEvents="none">
            <View style={styles.reticleFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <View style={styles.scanLaser} />
            </View>
            <Text style={styles.guideInstruction}>
              Align product barcode inside the frame
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Control Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.manualButton}
          onPress={() => setIsManualModalVisible(true)}
          activeOpacity={0.8}
        >
          <Barcode size={18} color={Colors.white} />
          <Text style={styles.manualButtonText}>Enter Barcode Manually</Text>
        </TouchableOpacity>
      </View>

      {/* =========================================================================
          MODAL 1: SCANNING RESULTS SCREEN (MATCHED PRODUCT)
         ========================================================================= */}
      <Modal
        visible={isResultVisible && !!matchedProduct}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseResults}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            {/* Header Handle */}
            <View style={styles.cardHandle} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultScroll}>
              {/* Prominent EXPIRED Warning Banner */}
              {isProductExpired && (
                <View style={styles.expiredBanner}>
                  <AlertTriangle size={24} color={Colors.white} />
                  <View style={styles.bannerTextCol}>
                    <Text style={styles.expiredBannerTitle}>
                      WARNING: THIS PRODUCT HAS EXPIRED
                    </Text>
                    <Text style={styles.expiredBannerSub}>
                      DO NOT SELL THIS PRODUCT TO CUSTOMERS.
                    </Text>
                  </View>
                </View>
              )}

              {/* Expiring Soon Banner */}
              {expiryInfo?.overall.isExpiringSoon && (
                <View style={styles.expiringSoonBanner}>
                  <AlertTriangle size={20} color={Colors.amberDark} />
                  <View style={styles.bannerTextCol}>
                    <Text style={styles.expiringSoonTitle}>
                      Attention: Product Expiring Soon
                    </Text>
                    <Text style={styles.expiringSoonSub}>
                      {expiryInfo.overall.label}. Discount or plan stock movement.
                    </Text>
                  </View>
                </View>
              )}

              {/* Product Info Header */}
              <View style={styles.productHeaderRow}>
                <View style={styles.avatarSquircle}>
                  <Package size={28} color={Colors.deepEmerald} />
                </View>
                <View style={styles.productHeaderTexts}>
                  <Text style={styles.resultProductName} numberOfLines={2}>
                    {matchedProduct?.name}
                  </Text>
                  <Text style={styles.resultProductCategory}>
                    {matchedProduct?.category} • SKU: {matchedProduct?.sku}
                  </Text>
                </View>
              </View>

              {/* Details Metrics Grid */}
              <View style={styles.metricsBox}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Scanned Barcode</Text>
                  <Text style={styles.metricValueMono}>{scannedBarcode}</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Current Quantity</Text>
                  <Text style={styles.metricValueBold}>
                    {matchedProduct?.quantity} {matchedProduct?.unit}
                  </Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Expiry Date</Text>
                  <Text style={styles.metricValue}>
                    {formatDisplayDate(matchedProduct?.expiryDate)}
                  </Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Expiry Status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: expiryInfo?.overall.bgColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: expiryInfo?.overall.color },
                      ]}
                    >
                      {expiryInfo?.overall.badgeText}
                    </Text>
                  </View>
                </View>

                {expiryInfo?.overall.daysRemaining !== null && (
                  <>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>
                        {isProductExpired ? 'Overdue By' : 'Days Remaining'}
                      </Text>
                      <Text
                        style={[
                          styles.metricValueBold,
                          { color: expiryInfo?.overall.color },
                        ]}
                      >
                        {isProductExpired
                          ? `${Math.abs(expiryInfo?.overall.daysRemaining || 0)} days overdue`
                          : `${expiryInfo?.overall.daysRemaining} days`}
                      </Text>
                    </View>
                  </>
                )}

                {matchedProduct?.manufacturingDate && (
                  <>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>Manufacturing Date</Text>
                      <Text style={styles.metricValue}>
                        {formatDisplayDate(matchedProduct.manufacturingDate)}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* Multi-Batch Breakdown If Present */}
              {expiryInfo && expiryInfo.batchesInfo.length > 0 && (
                <View style={styles.batchesSection}>
                  <View style={styles.batchesHeader}>
                    <Layers size={14} color={Colors.deepEmerald} />
                    <Text style={styles.batchesTitle}>
                      Stock Batches ({expiryInfo.batchesInfo.length})
                    </Text>
                  </View>
                  {expiryInfo.batchesInfo.map(({ batch, calculation }) => (
                    <View key={batch.id} style={styles.batchItem}>
                      <View>
                        <Text style={styles.batchNum}>Batch #{batch.batchNumber}</Text>
                        <Text style={styles.batchExpiry}>
                          Expires: {formatDisplayDate(batch.expiryDate)}
                        </Text>
                      </View>
                      <View style={styles.batchRight}>
                        <Text style={styles.batchQty}>
                          {batch.quantity} {matchedProduct?.unit}
                        </Text>
                        <View
                          style={[
                            styles.batchBadge,
                            { backgroundColor: calculation.bgColor },
                          ]}
                        >
                          <Text style={[styles.batchBadgeText, { color: calculation.color }]}>
                            {calculation.badgeText}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtonsCol}>
                <Button
                  title="View Product Details"
                  variant="primary"
                  onPress={() => {
                    handleCloseResults();
                    router.push(`/products/${matchedProduct?.id}` as any);
                  }}
                  icon={<Eye size={18} color={Colors.white} />}
                />

                <Button
                  title="Update Expiry Date"
                  variant="secondary"
                  onPress={handleOpenUpdateExpiry}
                  icon={<Calendar size={18} color={Colors.white} />}
                />

                {isProductExpired && (
                  <Button
                    title="Record Expired Stock (Remove)"
                    variant="danger"
                    onPress={handleRecordExpired}
                    icon={<Trash2 size={18} color={Colors.white} />}
                  />
                )}

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCloseResults}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Close / Scan Next</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          MODAL 2: PRODUCT NOT FOUND
         ========================================================================= */}
      <Modal
        visible={isNotFoundVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseResults}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notFoundCard}>
            <View style={styles.notFoundIconCircle}>
              <HelpCircle size={38} color={Colors.amberDark} />
            </View>

            <Text style={styles.notFoundHeader}>
              Product Not Found in Your Inventory
            </Text>

            <Text style={styles.notFoundDesc}>
              No product in your store matches the scanned barcode:
            </Text>

            <View style={styles.scannedBarcodePill}>
              <Text style={styles.scannedBarcodeText}>{scannedBarcode}</Text>
            </View>

            <View style={styles.notFoundActions}>
              <Button
                title="+ Add This Product"
                variant="primary"
                onPress={() => {
                  handleCloseResults();
                  router.push({
                    pathname: '/products/new',
                    params: { barcode: scannedBarcode || '' },
                  });
                }}
                icon={<Plus size={18} color={Colors.white} />}
              />

              <Button
                title="Scan Again"
                variant="outline"
                onPress={handleCloseResults}
                icon={<RefreshCw size={16} color={Colors.charcoal} />}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          MODAL 3: MANUAL BARCODE INPUT
         ========================================================================= */}
      <Modal
        visible={isManualModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsManualModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.manualCard}>
            <View style={styles.manualHeader}>
              <Text style={styles.manualTitle}>Enter Product Barcode</Text>
              <TouchableOpacity onPress={() => setIsManualModalVisible(false)}>
                <X size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.manualSubtitle}>
              Type the numbers from the product package or shelf label:
            </Text>

            <View style={styles.manualInputWrap}>
              <Barcode size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.manualInput}
                placeholder="e.g. 012345678905"
                placeholderTextColor={Colors.textPlaceholder}
                value={manualBarcode}
                onChangeText={setManualBarcode}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            <View style={styles.manualBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setIsManualModalVisible(false)}
                style={styles.manualCancelBtn}
              />
              <Button
                title="Search Product"
                variant="primary"
                onPress={handleManualSubmit}
                style={styles.manualSubmitBtn}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          MODAL 4: QUICK EXPIRY DATE UPDATE
         ========================================================================= */}
      <Modal
        visible={isEditExpiryModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsEditExpiryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.manualCard}>
            <View style={styles.manualHeader}>
              <Text style={styles.manualTitle}>Update Expiry Date</Text>
              <TouchableOpacity onPress={() => setIsEditExpiryModalVisible(false)}>
                <X size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.manualSubtitle}>
              Set the product's valid expiration date (YYYY-MM-DD):
            </Text>

            <View style={styles.manualInputWrap}>
              <Calendar size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.manualInput}
                placeholder="YYYY-MM-DD (e.g. 2026-12-31)"
                placeholderTextColor={Colors.textPlaceholder}
                value={newExpiryInput}
                onChangeText={setNewExpiryInput}
              />
            </View>

            <Text style={[styles.manualSubtitle, { marginTop: 12 }]}>
              Optional Manufacturing Date (YYYY-MM-DD):
            </Text>

            <View style={styles.manualInputWrap}>
              <Calendar size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.manualInput}
                placeholder="YYYY-MM-DD (e.g. 2025-06-01)"
                placeholderTextColor={Colors.textPlaceholder}
                value={newMfgInput}
                onChangeText={setNewMfgInput}
              />
            </View>

            <View style={styles.manualBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setIsEditExpiryModalVisible(false)}
                style={styles.manualCancelBtn}
              />
              <Button
                title="Save Expiry Date"
                variant="primary"
                onPress={handleSaveExpiry}
                style={styles.manualSubmitBtn}
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
    backgroundColor: '#061712',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    zIndex: 10,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  torchActiveBtn: {
    backgroundColor: Colors.freshGreen,
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  permissionFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    backgroundColor: '#081E17',
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  fallbackSubtitle: {
    fontSize: 14,
    color: Colors.emeraldLight,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  grantBtn: {
    marginTop: Spacing.xl,
    width: '100%',
  },
  manualEntryLink: {
    marginTop: Spacing.lg,
    paddingVertical: 8,
  },
  manualEntryLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2CE5A7',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleFrame: {
    width: 270,
    height: 220,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#2CE5A7',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  scanLaser: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#2CE5A7',
    shadowColor: '#2CE5A7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  guideInstruction: {
    marginTop: 24,
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    letterSpacing: 0.2,
  },
  bottomBar: {
    padding: Spacing.lg,
    backgroundColor: '#081E17',
    borderTopWidth: 1,
    borderTopColor: 'rgba(22, 152, 108, 0.25)',
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  manualButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 12,
  },
  cardHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  resultScroll: {
    gap: Spacing.md,
  },
  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#C93B3B',
    padding: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E04848',
  },
  bannerTextCol: {
    flex: 1,
  },
  expiredBannerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  expiredBannerSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFE2E2',
    marginTop: 2,
  },
  expiringSoonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.amberLight,
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.amber,
  },
  expiringSoonTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.amberDark,
  },
  expiringSoonSub: {
    fontSize: 11,
    color: Colors.charcoal,
    marginTop: 2,
  },
  productHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarSquircle: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productHeaderTexts: {
    flex: 1,
  },
  resultProductName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.charcoal,
    lineHeight: 22,
  },
  resultProductCategory: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 3,
    fontWeight: '500',
  },
  metricsBox: {
    backgroundColor: Colors.softBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metricDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 6,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  metricValue: {
    fontSize: 13,
    color: Colors.charcoal,
    fontWeight: '600',
  },
  metricValueBold: {
    fontSize: 13,
    color: Colors.charcoal,
    fontWeight: '800',
  },
  metricValueMono: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.deepEmerald,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  batchesSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.sm + 2,
  },
  batchesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  batchesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.deepEmerald,
  },
  batchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  batchNum: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  batchExpiry: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  batchRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  batchQty: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  batchBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  batchBadgeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  actionButtonsCol: {
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  notFoundCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    marginHorizontal: Spacing.xl,
    marginBottom: 'auto',
    marginTop: 'auto',
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.lg,
  },
  notFoundIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  notFoundHeader: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.charcoal,
    textAlign: 'center',
  },
  notFoundDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  scannedBarcodePill: {
    backgroundColor: Colors.softBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  scannedBarcodeText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.deepEmerald,
    letterSpacing: 1,
  },
  notFoundActions: {
    width: '100%',
    gap: 10,
  },
  manualCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    marginHorizontal: Spacing.lg,
    marginBottom: 'auto',
    marginTop: 'auto',
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  manualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  manualTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  manualSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  manualInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.softBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 48,
  },
  manualInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.charcoal,
    fontWeight: '600',
  },
  manualBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: Spacing.lg,
  },
  manualCancelBtn: {
    flex: 1,
  },
  manualSubmitBtn: {
    flex: 1.5,
  },
});
