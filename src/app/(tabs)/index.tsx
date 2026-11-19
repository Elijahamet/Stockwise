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
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Menu,
  Bell,
  Plus,
  Package,
  ShoppingCart,
  ArrowLeftRight,
  Home as HomeIcon,
  ChevronRight,
  TrendingUp,
  X,
  Store,
  Users,
  Wifi,
  Settings,
  HelpCircle,
  FileText,
  Barcode,
  AlertTriangle,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { SyncStatusBanner } from '../../components/common/SyncStatusBanner';
import { SmoothLineGraph } from '../../components/charts/SmoothLineGraph';
import { EmptyState } from '../../components/common/EmptyState';

export default function DashboardScreen() {
  const { products, sales, stockMovements, notifications, business, user, settings, currentTheme } = useApp();

  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [productTab, setProductTab] = useState<'products' | 'report'>('products');

  const themePrimaryGrad = currentTheme?.colors?.primaryGradient || ['#072030', '#0B3B59', '#0284C7'];
  const themeAccent = currentTheme?.colors?.accent || '#0284C7';
  const themeAccentLight = currentTheme?.colors?.accentLight || '#E0F2FE';
  const themeBg = currentTheme?.colors?.background || '#F7F9F8';

  const unreadCount = notifications.filter((n) => !n.read).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales
    .filter((s) => s.createdAt.startsWith(todayStr))
    .reduce((sum, s) => sum + s.total, 0);

  const lowStockProducts = products.filter(
    (p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Top Bar matching image: Menu on left, Stockwise in center, Bell on right */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.menuIconBtn}
          onPress={() => setMenuModalVisible(true)}
          activeOpacity={0.7}
        >
          <Menu size={22} color={Colors.charcoal} />
        </TouchableOpacity>

        <Text style={styles.brandTitle}>Stockwise</Text>

        <TouchableOpacity
          style={styles.bellIconBtn}
          onPress={() => router.push('/notifications')}
          activeOpacity={0.7}
        >
          <Bell size={20} color={Colors.charcoal} />
          {unreadCount > 0 && <View style={styles.unreadNotificationDot} />}
        </TouchableOpacity>
      </View>

      <SyncStatusBanner />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Soft Ambient Glow Banner */}
        <LinearGradient
          colors={[themeAccentLight, themeBg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.ambientGlow}
        />

        {/* Dashboard Title & Action Pill Header */}
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.dashboardTitle}>Dashboard</Text>
            <Text style={styles.dashboardSubtitle}>Inventory Management</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/sales/new')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={themePrimaryGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionPillBtn}
            >
              <Plus size={16} color={Colors.white} />
              <Text style={styles.actionPillBtnText}>Record Sale</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Four Squircle Feature Cards with Luxury Linear Gradients (matching reference image) */}
        <View style={styles.featureGrid}>
          {/* Card 1: Home */}
          <TouchableOpacity
            style={styles.featureTile}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={themePrimaryGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.squircleIcon}
            >
              <HomeIcon size={22} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.featureTileLabel}>Home</Text>
          </TouchableOpacity>

          {/* Card 2: Products */}
          <TouchableOpacity
            style={styles.featureTile}
            onPress={() => router.push('/(tabs)/inventory')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={themePrimaryGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.squircleIcon}
            >
              <Package size={22} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.featureTileLabel}>Products</Text>
          </TouchableOpacity>

          {/* Card 3: Sales */}
          <TouchableOpacity
            style={styles.featureTile}
            onPress={() => router.push('/sales/history')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={themePrimaryGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.squircleIcon}
            >
              <ShoppingCart size={22} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.featureTileLabel}>Sales</Text>
          </TouchableOpacity>

          {/* Card 4: Stock */}
          <TouchableOpacity
            style={styles.featureTile}
            onPress={() => router.push('/(tabs)/stock')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={themePrimaryGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.squircleIcon}
            >
              <ArrowLeftRight size={22} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.featureTileLabel}>Stock</Text>
          </TouchableOpacity>
        </View>

        {/* Smooth Curved Line Graph Section (matching reference image) */}
        <View style={styles.graphSection}>
          <SmoothLineGraph
            currencySymbol={settings.currency}
            todaySales={todaySales}
          />
        </View>

        {/* Products Section (matching reference image) */}
        <View style={styles.productsSectionCard}>
          {/* Products Header with See All */}
          <View style={styles.productsHeaderRow}>
            <Text style={styles.productsSectionTitle}>Products</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/inventory')}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Sub-Tabs: Products | Report with Gradient Pill */}
          <View style={styles.subTabRow}>
            <TouchableOpacity
              onPress={() => setProductTab('products')}
              activeOpacity={0.7}
            >
              {productTab === 'products' ? (
                <LinearGradient
                  colors={themePrimaryGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.subTabItemGradient}
                >
                  <Text style={styles.subTabTextActive}>Products</Text>
                </LinearGradient>
              ) : (
                <View style={styles.subTabItemInactive}>
                  <Text style={styles.subTabTextInactive}>Products</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setProductTab('report')}
              activeOpacity={0.7}
            >
              {productTab === 'report' ? (
                <LinearGradient
                  colors={themePrimaryGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.subTabItemGradient}
                >
                  <Text style={styles.subTabTextActive}>Report</Text>
                </LinearGradient>
              ) : (
                <View style={styles.subTabItemInactive}>
                  <Text style={styles.subTabTextInactive}>Report</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Product Items List or Report Breakdown */}
          {productTab === 'products' ? (
            products.length === 0 ? (
              <EmptyState
                icon={<Package size={32} color={Colors.freshGreen} />}
                title="No Products Registered"
                description="Begin by adding items to your store catalog."
                actionTitle="+ Add Product"
                onAction={() => router.push('/products/new')}
              />
            ) : (
              <View style={styles.productList}>
                {products.slice(0, 5).map((item, idx) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.productRow,
                      idx === Math.min(products.length, 5) - 1 && { borderBottomWidth: 0 },
                    ]}
                    onPress={() => router.push(`/products/${item.id}` as any)}
                    activeOpacity={0.7}
                  >
                    {/* Left Monogram / Gradient Icon Thumbnail */}
                    <LinearGradient
                      colors={['#E8F6F1', '#D4EFE4']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.productThumbnail}
                    >
                      <Package size={20} color={Colors.deepEmerald} />
                    </LinearGradient>

                    {/* Middle Info */}
                    <View style={styles.productInfoCol}>
                      <Text style={styles.productNameText} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.productSubtext}>
                        {item.category} • {item.quantity} {item.unit}
                      </Text>
                    </View>

                    {/* Right Prices */}
                    <View style={styles.productPriceCol}>
                      <Text style={styles.sellingPriceText}>
                        {settings.currency}{item.sellingPrice.toFixed(2)}
                      </Text>
                      <Text style={styles.costPriceText}>
                        {settings.currency}{item.buyingPrice.toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )
          ) : (
            /* Report Quick Tab View */
            <View style={styles.quickReportBox}>
              <View style={styles.quickReportStatRow}>
                <View style={styles.quickReportStat}>
                  <Text style={styles.quickReportStatLabel}>TOTAL PRODUCTS</Text>
                  <Text style={styles.quickReportStatVal}>{products.length}</Text>
                </View>
                <View style={styles.quickReportDivider} />
                <View style={styles.quickReportStat}>
                  <Text style={styles.quickReportStatLabel}>LOW STOCK</Text>
                  <Text style={[styles.quickReportStatVal, { color: Colors.amberDark }]}>
                    {lowStockProducts.length}
                  </Text>
                </View>
                <View style={styles.quickReportDivider} />
                <View style={styles.quickReportStat}>
                  <Text style={styles.quickReportStatLabel}>TODAY'S REVENUE</Text>
                  <Text style={[styles.quickReportStatVal, { color: Colors.freshGreen }]}>
                    {settings.currency}{todaySales.toFixed(2)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.fullReportLink}
                onPress={() => router.push('/(tabs)/stock')}
                activeOpacity={0.7}
              >
                <Text style={styles.fullReportLinkText}>View Full Analytics & Valuation</Text>
                <ChevronRight size={16} color={Colors.deepEmerald} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Slide-over Quick Menu Modal */}
      <Modal
        visible={menuModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setMenuModalVisible(false)}
        >
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.drawerCard}>
            <LinearGradient
              colors={themePrimaryGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.drawerGradientHeader}
            >
              <View>
                <Text style={styles.drawerTitle}>{business?.name || 'Stockwise Store'}</Text>
                <Text style={styles.drawerSubtitle}>{user?.fullName || 'Store Owner'}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setMenuModalVisible(false)}
                style={styles.drawerCloseBtn}
              >
                <X size={20} color={Colors.white} />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.drawerMenuItems}>
              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  router.push('/(tabs)/inventory');
                }}
              >
                <Package size={18} color={themeAccent} />
                <Text style={styles.drawerItemText}>Inventory Catalog</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  router.push('/(tabs)/stock');
                }}
              >
                <ArrowLeftRight size={18} color={themeAccent} />
                <Text style={styles.drawerItemText}>Stock & Reports</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  router.push('/scanner');
                }}
              >
                <Barcode size={18} color={themeAccent} />
                <Text style={styles.drawerItemText}>Barcode & Expiry Scanner</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  router.push('/expiry');
                }}
              >
                <AlertTriangle size={18} color={themeAccent} />
                <Text style={styles.drawerItemText}>Expiry Management</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  router.push('/sales/history');
                }}
              >
                <ShoppingCart size={18} color={themeAccent} />
                <Text style={styles.drawerItemText}>Sales Receipts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  router.push('/employees');
                }}
              >
                <Users size={18} color={themeAccent} />
                <Text style={styles.drawerItemText}>Team Members</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  router.push('/sync');
                }}
              >
                <Wifi size={18} color={themeAccent} />
                <Text style={styles.drawerItemText}>Offline Sync Queue</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  router.push('/(tabs)/profile');
                }}
              >
                <Settings size={18} color={Colors.deepEmerald} />
                <Text style={styles.drawerItemText}>Settings & Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  router.push('/settings/help');
                }}
              >
                <HelpCircle size={18} color={Colors.deepEmerald} />
                <Text style={styles.drawerItemText}>User Guide & Help</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.softBackground,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIconBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.softBackground,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.deepEmerald,
    letterSpacing: -0.3,
  },
  bellIconBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.softBackground,
    position: 'relative',
  },
  unreadNotificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.freshGreen,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.charcoal,
    letterSpacing: -0.3,
  },
  dashboardSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(44, 229, 167, 0.45)',
    shadowColor: '#16986C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  actionPillBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    zIndex: 2,
  },
  featureTile: {
    flex: 1,
    alignItems: 'center',
  },
  squircleIcon: {
    width: 62,
    height: 62,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#0A241D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  featureTileLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  graphSection: {
    width: '100%',
    zIndex: 2,
  },
  productsSectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
    zIndex: 2,
  },
  productsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  productsSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.freshGreen,
  },
  subTabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  subTabItemGradient: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  subTabItemInactive: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.softBackground,
  },
  subTabTextInactive: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  subTabTextActive: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: '700',
  },
  productList: {
    gap: Spacing.xs,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  productThumbnail: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  productInfoCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  productNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  productSubtext: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  productPriceCol: {
    alignItems: 'flex-end',
  },
  sellingPriceText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  costPriceText: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  quickReportBox: {
    backgroundColor: Colors.softBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  quickReportStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickReportStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickReportStatLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  quickReportStatVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  quickReportDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.borderLight,
  },
  fullReportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  fullReportLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.deepEmerald,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-start',
  },
  drawerCard: {
    backgroundColor: Colors.white,
    width: '80%',
    height: '100%',
    paddingBottom: Spacing.xl,
    ...Shadows.lg,
  },
  drawerGradientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.xl,
    paddingTop: Spacing.xxxl,
    marginBottom: Spacing.md,
  },
  drawerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
  drawerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  drawerCloseBtn: {
    padding: Spacing.xs,
  },
  drawerMenuItems: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  drawerItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
  },
});
