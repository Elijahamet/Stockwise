import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Package,
  Plus,
  Search,
  ArrowUpDown,
  Tag,
  ChevronRight,
  Trash2,
  Edit2,
  SlidersHorizontal,
  Barcode,
  CheckSquare,
  Square,
  Calendar,
  AlertTriangle,
  Check,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, Shadows, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/common/Header';
import { SyncStatusBanner } from '../../components/common/SyncStatusBanner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import { Product } from '../../types';
import { calculateExpiryStatus } from '../../utils/expiry';

type TabView = 'all' | 'low' | 'out' | 'categories' | 'expired';
type SortOption = 'name' | 'quantity_asc' | 'quantity_desc' | 'price';

export default function InventoryScreen() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const { products, deleteProduct, deleteProducts, settings, currentTheme } = useApp();

  const themePrimaryGrad = currentTheme?.colors?.primaryGradient || ['#072030', '#0B3B59', '#0284C7'];
  const themeAccent = currentTheme?.colors?.accent || '#0284C7';
  const themeAccentLight = currentTheme?.colors?.accentLight || '#E0F2FE';
  const themePrimary = currentTheme?.colors?.primary || '#082538';

  const [activeTab, setActiveTab] = useState<TabView>(
    params.filter === 'low'
      ? 'low'
      : params.filter === 'out'
      ? 'out'
      : params.filter === 'expired'
      ? 'expired'
      : 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Selection mode for multi-product deletion
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const categoriesList = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    if (activeTab === 'low' && (product.quantity === 0 || product.quantity > product.lowStockThreshold)) {
      return false;
    }
    if (activeTab === 'out' && product.quantity > 0) {
      return false;
    }
    if (activeTab === 'expired') {
      const exp = calculateExpiryStatus(product.expiryDate);
      if (!exp.isExpired) return false;
    }
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchSku = product.sku.toLowerCase().includes(q);
      const matchBarcode = product.barcode?.toLowerCase().includes(q);
      return matchName || matchSku || matchBarcode;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'quantity_asc':
        return a.quantity - b.quantity;
      case 'quantity_desc':
        return b.quantity - a.quantity;
      case 'price':
        return b.sellingPrice - a.sellingPrice;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const lowStockCount = products.filter(
    (p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold
  ).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;
  const expiredCount = products.filter((p) => calculateExpiryStatus(p.expiryDate).isExpired).length;

  const toggleSelectProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === sortedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedProducts.map((p) => p.id));
    }
  };

  const handleBulkDeleteConfirm = () => {
    deleteProducts(selectedIds);
    setSelectedIds([]);
    setIsSelectionMode(false);
    setShowBulkDeleteModal(false);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Header title="Products Catalog" subtitle="Track units, pricing & threshold limits" showBusinessInfo={false} />
      <SyncStatusBanner />

      <View style={styles.contentContainer}>
        {/* Fresha-style Search & Quick Add Floating Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, SKU or barcode..."
              placeholderTextColor={Colors.textPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Barcode & Expiry Scanner Button */}
          <TouchableOpacity
            onPress={() => router.push('/scanner')}
            style={styles.scannerIconBtn}
            activeOpacity={0.8}
            accessibilityLabel="Scan Barcode"
          >
            <Barcode size={22} color={themeAccent} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/products/new')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={themePrimaryGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addBtn}
            >
              <Plus size={22} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Capsule Segment Switcher */}
        <View style={styles.tabCapsule}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'all' && styles.activeTabItem]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All ({products.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'low' && styles.activeTabItem]}
            onPress={() => setActiveTab('low')}
          >
            <View style={styles.tabBadgeRow}>
              <Text style={[styles.tabText, activeTab === 'low' && styles.activeTabText]}>
                Low Stock
              </Text>
              {lowStockCount > 0 && (
                <View style={styles.amberBadge}>
                  <Text style={styles.badgeNumber}>{lowStockCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'out' && styles.activeTabItem]}
            onPress={() => setActiveTab('out')}
          >
            <View style={styles.tabBadgeRow}>
              <Text style={[styles.tabText, activeTab === 'out' && styles.activeTabText]}>
                Out
              </Text>
              {outOfStockCount > 0 && (
                <View style={styles.redBadge}>
                  <Text style={styles.badgeNumber}>{outOfStockCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'expired' && styles.activeTabItem]}
            onPress={() => setActiveTab('expired')}
          >
            <View style={styles.tabBadgeRow}>
              <Text style={[styles.tabText, activeTab === 'expired' && styles.activeTabText]}>
                Expired
              </Text>
              {expiredCount > 0 && (
                <View style={styles.redBadge}>
                  <Text style={styles.badgeNumber}>{expiredCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'categories' && styles.activeTabItem]}
            onPress={() => setActiveTab('categories')}
          >
            <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
              Cats
            </Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Category Pill Filter */}
        {activeTab !== 'categories' && categoriesList.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryFilterRow}
          >
            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, isSelected && styles.activeCategoryPill]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      isSelected && styles.activeCategoryPillText,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Sort Controls Bar & Selection Mode */}
        {activeTab !== 'categories' && products.length > 0 && (
          <View style={styles.sortBar}>
            <Text style={styles.resultsCount}>
              {sortedProducts.length} product{sortedProducts.length === 1 ? '' : 's'}
            </Text>

            <View style={styles.sortRightControls}>
              <TouchableOpacity
                style={styles.selectToggleBtn}
                onPress={() => {
                  setIsSelectionMode(!isSelectionMode);
                  if (isSelectionMode) setSelectedIds([]);
                }}
                activeOpacity={0.7}
              >
                {isSelectionMode ? (
                  <Check size={13} color={Colors.deepEmerald} />
                ) : (
                  <CheckSquare size={13} color={Colors.deepEmerald} />
                )}
                <Text style={styles.selectToggleText}>
                  {isSelectionMode ? 'Cancel' : 'Select'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sortBtn}
                onPress={() => setShowSortMenu(!showSortMenu)}
                activeOpacity={0.7}
              >
                <SlidersHorizontal size={13} color={Colors.textMuted} />
                <Text style={styles.sortBtnText}>
                  {sortBy === 'name'
                    ? 'Name'
                    : sortBy === 'quantity_asc'
                    ? 'Lowest'
                    : sortBy === 'quantity_desc'
                    ? 'Highest'
                    : 'Price'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bulk Action Bar when selection mode is active */}
        {isSelectionMode && (
          <View style={styles.bulkActionBar}>
            <Text style={styles.bulkActionCount}>
              {selectedIds.length} selected
            </Text>
            <View style={styles.bulkButtonsRow}>
              <TouchableOpacity
                style={styles.bulkSelectAllBtn}
                onPress={handleSelectAll}
                activeOpacity={0.7}
              >
                <Text style={styles.bulkBtnText}>
                  {selectedIds.length === sortedProducts.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>

              {selectedIds.length > 0 && (
                <TouchableOpacity
                  style={styles.bulkDeleteBtn}
                  onPress={() => setShowBulkDeleteModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.bulkBtnText}>Delete ({selectedIds.length})</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Sort Popup Menu */}
        {showSortMenu && (
          <View style={styles.sortDropdown}>
            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortBy('name');
                setShowSortMenu(false);
              }}
            >
              <Text style={sortBy === 'name' ? styles.activeSortText : styles.sortText}>
                Product Name (A-Z)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortBy('quantity_asc');
                setShowSortMenu(false);
              }}
            >
              <Text style={sortBy === 'quantity_asc' ? styles.activeSortText : styles.sortText}>
                Lowest Stock First
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortBy('quantity_desc');
                setShowSortMenu(false);
              }}
            >
              <Text style={sortBy === 'quantity_desc' ? styles.activeSortText : styles.sortText}>
                Highest Stock First
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortBy('price');
                setShowSortMenu(false);
              }}
            >
              <Text style={sortBy === 'price' ? styles.activeSortText : styles.sortText}>
                Highest Selling Price
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Products / Categories List */}
        {activeTab === 'categories' ? (
          categoriesList.filter((c) => c !== 'All').length === 0 ? (
            <EmptyState
              icon={<Tag size={28} color={Colors.freshGreen} />}
              title="No Categories Yet"
              description="Add products and select categories to view your inventory organized into groups."
              actionTitle="+ Add First Product"
              onAction={() => router.push('/products/new')}
            />
          ) : (
            <FlatList
              data={categoriesList.filter((c) => c !== 'All')}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item: categoryName }) => {
                const categoryProducts = products.filter((p) => p.category === categoryName);
                const totalUnits = categoryProducts.reduce((sum, p) => sum + p.quantity, 0);

                return (
                  <TouchableOpacity
                    style={styles.categoryCard}
                    onPress={() => {
                      setSelectedCategory(categoryName);
                      setActiveTab('all');
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryAvatar}>
                      <Tag size={18} color={Colors.deepEmerald} />
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryTitle}>{categoryName}</Text>
                      <Text style={styles.categoryMeta}>
                        {categoryProducts.length} items • {totalUnits} total units
                      </Text>
                    </View>
                    <ChevronRight size={18} color={Colors.textLight} />
                  </TouchableOpacity>
                );
              }}
            />
          )
        ) : sortedProducts.length === 0 ? (
          <EmptyState
            icon={<Package size={32} color={Colors.freshGreen} />}
            title={
              searchQuery
                ? 'No Matching Products'
                : activeTab === 'low'
                ? 'No Low Stock Warnings'
                : activeTab === 'out'
                ? 'No Out of Stock Items'
                : 'Inventory Catalog Empty'
            }
            description={
              searchQuery
                ? `No products found matching "${searchQuery}".`
                : activeTab === 'low'
                ? 'All registered products currently have adequate stock on hand.'
                : activeTab === 'out'
                ? 'None of your registered products are completely out of stock.'
                : 'Add your first product to start tracking inventory levels and processing sales.'
            }
            actionTitle={searchQuery ? 'Clear Search' : '+ Add Product'}
            onAction={
              searchQuery
                ? () => setSearchQuery('')
                : () => router.push('/products/new')
            }
          />
        ) : (
          <FlatList
            data={sortedProducts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isOutOfStock = item.quantity === 0;
              const isLowStock = !isOutOfStock && item.quantity <= item.lowStockThreshold;
              const exp = calculateExpiryStatus(item.expiryDate);
              const isSelected = selectedIds.includes(item.id);

              return (
                <TouchableOpacity
                  style={[
                    styles.productCard,
                    isSelectionMode && isSelected && styles.selectedProductCard,
                  ]}
                  onPress={() => {
                    if (isSelectionMode) {
                      toggleSelectProduct(item.id);
                    } else {
                      router.push(`/products/${item.id}` as any);
                    }
                  }}
                  onLongPress={() => {
                    if (!isSelectionMode) {
                      setIsSelectionMode(true);
                      setSelectedIds([item.id]);
                    }
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.productMainRow}>
                    {/* Checkbox when in selection mode */}
                    {isSelectionMode && (
                      <View style={styles.checkboxContainer}>
                        {isSelected ? (
                          <CheckSquare size={20} color={Colors.deepEmerald} />
                        ) : (
                          <Square size={20} color={Colors.textMuted} />
                        )}
                      </View>
                    )}

                    {/* Monogram Box */}
                    <View
                      style={[
                        styles.monogramBox,
                        {
                          backgroundColor: exp.isExpired
                            ? Colors.redLight
                            : isOutOfStock
                            ? Colors.redLight
                            : isLowStock
                            ? Colors.amberLight
                            : Colors.freshGreenLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.monogramText,
                          {
                            color: exp.isExpired
                              ? Colors.softRed
                              : isOutOfStock
                              ? Colors.softRed
                              : isLowStock
                              ? Colors.amberDark
                              : Colors.freshGreen,
                          },
                        ]}
                      >
                        {item.name.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle} numberOfLines={1}>
                        {item.name}
                      </Text>

                      <View style={styles.metaRow}>
                        <View style={styles.categoryBadgePill}>
                          <Text style={styles.categoryBadgeText} numberOfLines={1}>
                            {item.category}
                          </Text>
                        </View>
                        <Text style={styles.skuText}>SKU: {item.sku}</Text>
                      </View>

                      {/* Expiry Status Pill */}
                      {exp.isExpired ? (
                        <View style={styles.expiryBadgeExpired}>
                          <AlertTriangle size={10} color={Colors.softRed} />
                          <Text style={styles.expiryBadgeExpiredText}>
                            EXPIRED ({Math.abs(exp.daysRemaining ?? 0)}d ago)
                          </Text>
                        </View>
                      ) : exp.isExpiringSoon ? (
                        <View style={styles.expiryBadgeWarning}>
                          <AlertTriangle size={10} color={Colors.amberDark} />
                          <Text style={styles.expiryBadgeWarningText}>
                            Expires in {exp.daysRemaining}d
                          </Text>
                        </View>
                      ) : exp.status === 'NOT_EXPIRED' ? (
                        <View style={styles.expiryBadgeHealthy}>
                          <Calendar size={10} color={Colors.textMuted} />
                          <Text style={styles.expiryHealthyText}>
                            Exp: {exp.daysRemaining}d
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Price on right */}
                    <View style={styles.priceColumn}>
                      <Text style={styles.priceNumber}>
                        {settings.currency}
                        {item.sellingPrice.toFixed(2)}
                      </Text>
                      <View
                        style={[
                          styles.stockPill,
                          isOutOfStock
                            ? styles.stockPillRed
                            : isLowStock
                            ? styles.stockPillAmber
                            : styles.stockPillGreen,
                        ]}
                      >
                        <Text
                          style={[
                            styles.stockPillText,
                            isOutOfStock
                              ? styles.stockTextRed
                              : isLowStock
                              ? styles.stockTextAmber
                              : styles.stockTextGreen,
                          ]}
                        >
                          {item.quantity} {item.unit}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.cardFooter}>
                    <Text style={styles.costText}>
                      Cost: {settings.currency}
                      {item.buyingPrice.toFixed(2)} • Margin: +{settings.currency}
                      {(item.sellingPrice - item.buyingPrice).toFixed(2)}
                    </Text>

                    {!isSelectionMode && (
                      <View style={styles.microActions}>
                        <TouchableOpacity
                          style={styles.actionIconBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            router.push(`/products/edit/${item.id}` as any);
                          }}
                        >
                          <Edit2 size={15} color={Colors.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionIconBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            setProductToDelete(item);
                          }}
                        >
                          <Trash2 size={15} color={Colors.softRed} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* Delete Single Product Confirmation */}
      <ConfirmModal
        visible={!!productToDelete}
        title="Delete Product?"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}"? All product records will be removed.`}
        confirmText="Yes, Delete"
        cancelText="Keep Product"
        isDestructive={true}
        onConfirm={() => {
          if (productToDelete) {
            deleteProduct(productToDelete.id);
            setProductToDelete(null);
          }
        }}
        onCancel={() => setProductToDelete(null)}
      />

      {/* Bulk Delete Products Confirmation */}
      <ConfirmModal
        visible={showBulkDeleteModal}
        title={`Delete ${selectedIds.length} Products?`}
        message={`Are you sure you want to permanently delete these ${selectedIds.length} selected products? This action cannot be undone.`}
        confirmText={`Delete ${selectedIds.length} Items`}
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setShowBulkDeleteModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.softBackground,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    fontSize: 14,
    marginLeft: Spacing.sm,
    color: Colors.charcoal,
  },
  clearText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  scannerIconBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.freshGreen,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  tabCapsule: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
  },
  activeTabItem: {
    backgroundColor: Colors.deepEmerald,
  },
  tabText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  activeTabText: {
    color: Colors.white,
    fontWeight: '700',
  },
  tabBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amberBadge: {
    backgroundColor: Colors.amber,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  redBadge: {
    backgroundColor: Colors.softRed,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeNumber: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.white,
  },
  categoryFilterRow: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
    paddingBottom: Spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeCategoryPill: {
    backgroundColor: Colors.freshGreen,
    borderColor: Colors.freshGreen,
  },
  categoryPillText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  activeCategoryPillText: {
    color: Colors.white,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  resultsCount: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textMuted,
  },
  sortRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  selectToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectToggleText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.deepEmerald,
  },
  bulkActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.deepEmerald,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  bulkActionCount: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  bulkButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  bulkSelectAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  bulkDeleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.softRed,
  },
  bulkBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sortBtnText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  sortDropdown: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xs,
    marginBottom: Spacing.sm,
    ...Shadows.md,
  },
  sortOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  sortText: {
    ...Typography.bodySmall,
    color: Colors.charcoal,
  },
  activeSortText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.freshGreen,
  },
  listContainer: {
    paddingBottom: Spacing.xxxl,
    gap: Spacing.sm,
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  selectedProductCard: {
    borderColor: Colors.freshGreen,
    backgroundColor: '#F3FAF7',
  },
  checkboxContainer: {
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monogramBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  monogramText: {
    fontSize: 15,
    fontWeight: '800',
  },
  productInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  productTitle: {
    ...Typography.body,
    fontWeight: '700',
    fontSize: 15,
    color: Colors.charcoal,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryBadgePill: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  skuText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textLight,
  },
  expiryBadgeExpired: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.redLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  expiryBadgeExpiredText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.softRed,
  },
  expiryBadgeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.amberLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  expiryBadgeWarningText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.amberDark,
  },
  expiryBadgeHealthy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
    alignSelf: 'flex-start',
  },
  expiryHealthyText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  priceNumber: {
    ...Typography.body,
    fontWeight: '800',
    fontSize: 16,
    color: Colors.charcoal,
    marginBottom: 4,
  },
  stockPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  stockPillGreen: {
    backgroundColor: Colors.freshGreenLight,
  },
  stockPillAmber: {
    backgroundColor: Colors.amberLight,
  },
  stockPillRed: {
    backgroundColor: Colors.redLight,
  },
  stockPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stockTextGreen: {
    color: Colors.freshGreen,
  },
  stockTextAmber: {
    color: Colors.amberDark,
  },
  stockTextRed: {
    color: Colors.softRed,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
  },
  microActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
    ...Shadows.sm,
  },
  categoryAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  categoryMeta: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
