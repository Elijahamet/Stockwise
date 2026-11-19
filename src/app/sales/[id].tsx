import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  CheckCircle2,
  Share2,
  Plus,
  Store,
  Calendar,
  User,
  CreditCard,
  Package,
  Receipt,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/buttons/Button';

export default function SaleReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sales, business, settings } = useApp();

  const sale = sales.find((s) => s.id === id);

  if (!sale) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Receipt size={48} color={Colors.textLight} />
        <Text style={styles.notFoundTitle}>Receipt Not Found</Text>
        <Text style={styles.notFoundSubtitle}>
          This sale transaction could not be located.
        </Text>
        <Button
          title="Back to Sales History"
          onPress={() => router.replace('/sales/history')}
          style={styles.backBtn}
        />
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      const itemsList = sale.items
        .map((i) => `${i.quantity}x ${i.productName} - ${settings.currency}${i.subtotal.toFixed(2)}`)
        .join('\n');

      const message = `Receipt: ${sale.receiptNumber}\nStore: ${business?.name || 'Stockwise Store'}\nDate: ${new Date(sale.createdAt).toLocaleString()}\n\n${itemsList}\n\nTotal Paid: ${settings.currency}${sale.total.toFixed(2)} (${sale.paymentMethod.toUpperCase()})\nThank you for your patronage!`;

      await Share.share({ message });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Receipt Container Card */}
        <View style={styles.receiptCard}>
          {/* Top Store Badge */}
          <View style={styles.storeHeader}>
            <View style={styles.storeAvatar}>
              <Store size={22} color={Colors.deepEmerald} />
            </View>
            <Text style={styles.bizName}>{business?.name || 'Stockwise Store'}</Text>
            <Text style={styles.bizSub}>
              {business?.address || business?.city || 'Accra, Ghana'} • {business?.phoneNumber || '0244 000 111'}
            </Text>

            <View style={styles.paidBadge}>
              <CheckCircle2 size={14} color={Colors.freshGreen} />
              <Text style={styles.paidBadgeText}>PAID RECEIPT</Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />

          {/* Transaction Metadata Grid */}
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>RECEIPT NO.</Text>
              <Text style={styles.metaValueMono}>{sale.receiptNumber}</Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>PAYMENT METHOD</Text>
              <View style={styles.paymentMethodPill}>
                <CreditCard size={12} color={Colors.deepEmerald} />
                <Text style={styles.paymentMethodText}>
                  {sale.paymentMethod.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>DATE & TIME</Text>
              <Text style={styles.metaValue}>
                {new Date(sale.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                at{' '}
                {new Date(sale.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>SERVED BY</Text>
              <Text style={styles.metaValue}>{sale.soldBy}</Text>
            </View>
          </View>

          {sale.paymentNotes && (
            <View style={styles.notesRow}>
              <Text style={styles.notesLabel}>REF / NOTE:</Text>
              <Text style={styles.notesValue}>{sale.paymentNotes}</Text>
            </View>
          )}

          <View style={styles.dashedDivider} />

          {/* Itemized Purchased List */}
          <View style={styles.itemsSection}>
            <Text style={styles.microSectionLabel}>PURCHASED ITEMS</Text>

            {sale.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemQtyPill}>
                  <Text style={styles.itemQtyText}>{item.quantity}x</Text>
                </View>

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <Text style={styles.itemSubtext}>
                    {settings.currency}{item.unitPrice.toFixed(2)} each • SKU: {item.sku}
                  </Text>
                </View>

                <Text style={styles.itemTotal}>
                  {settings.currency}{item.subtotal.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.dashedDivider} />

          {/* Totals Breakdown */}
          <View style={styles.totalsSection}>
            <View style={styles.totalLine}>
              <Text style={styles.totalLineLabel}>Subtotal</Text>
              <Text style={styles.totalLineVal}>
                {settings.currency}{sale.subtotal.toFixed(2)}
              </Text>
            </View>

            {sale.discount > 0 && (
              <View style={styles.totalLine}>
                <Text style={styles.totalLineLabel}>Discount Applied</Text>
                <Text style={[styles.totalLineVal, { color: Colors.softRed }]}>
                  -{settings.currency}{sale.discount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.grandTotalLine}>
              <Text style={styles.grandTotalLabel}>Total Paid</Text>
              <Text style={styles.grandTotalValue}>
                {settings.currency}{sale.total.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />

          {/* Receipt Footer */}
          <View style={styles.receiptFooter}>
            <Text style={styles.footerThanks}>Thank you for your patronage!</Text>
            <Text style={styles.footerSub}>
              Verified Offline-First Register • Stockwise POS
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Button
            title="Share Receipt"
            variant="outline"
            icon={<Share2 size={16} color={Colors.deepEmerald} />}
            onPress={handleShare}
            style={styles.actionBtn}
          />

          <Button
            title="New Sale"
            variant="primary"
            icon={<Plus size={16} color={Colors.white} />}
            onPress={() => router.replace('/sales/new')}
            style={styles.actionBtn}
          />
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
  receiptCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  storeHeader: {
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  storeAvatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  bizName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.charcoal,
    letterSpacing: -0.2,
  },
  bizSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.emeraldLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  paidBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.deepEmerald,
    letterSpacing: 0.5,
  },
  dashedDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    borderStyle: 'dashed',
    marginVertical: Spacing.md,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metaItem: {
    width: '47.5%',
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textLight,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValueMono: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.charcoal,
    fontFamily: 'monospace',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  paymentMethodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.emeraldLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginTop: 2,
  },
  paymentMethodText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.deepEmerald,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.softBackground,
    padding: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.sm,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  notesValue: {
    fontSize: 11,
    color: Colors.charcoal,
    fontWeight: '600',
  },
  itemsSection: {
    paddingVertical: Spacing.xs,
  },
  microSectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textLight,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
  },
  itemQtyPill: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.softBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  itemQtyText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  itemInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  itemSubtext: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  totalsSection: {
    gap: Spacing.xs,
  },
  totalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLineLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  totalLineVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  grandTotalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  grandTotalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.freshGreen,
  },
  receiptFooter: {
    alignItems: 'center',
    paddingTop: Spacing.xs,
  },
  footerThanks: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  footerSub: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
