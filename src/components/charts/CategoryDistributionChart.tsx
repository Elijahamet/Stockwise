import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';

interface CategoryItem {
  category: string;
  count: number;
}

interface CategoryDistributionProps {
  categories: CategoryItem[];
}

const CATEGORY_COLORS = [
  Colors.freshGreen,
  Colors.deepEmerald,
  Colors.amber,
  '#4A8FE7',
  '#9B51E0',
  '#2D9CDB',
  Colors.softRed,
];

export const CategoryDistributionChart: React.FC<CategoryDistributionProps> = ({ categories = [] }) => {
  const safeCategories = categories || [];
  const total = safeCategories.reduce((sum, c) => sum + (c?.count || 0), 0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Category Distribution</Text>

      {safeCategories.length === 0 || total === 0 ? (
        <View style={styles.emptyContainer}>
          <PieChart size={32} color={Colors.textLight} />
          <Text style={styles.emptyText}>No product categories yet</Text>
          <Text style={styles.emptySubtext}>
            Add products with categories to view your inventory breakdown.
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.barStack}>
            {safeCategories.map((cat, idx) => {
              const widthPct = (cat.count / total) * 100;
              const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
              return (
                <View
                  key={cat.category}
                  style={[
                    styles.barSegment,
                    {
                      width: `${Math.max(widthPct, 2)}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.legendContainer}>
            {categories.map((cat, idx) => {
              const pct = Math.round((cat.count / total) * 100);
              const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
              return (
                <View key={cat.category} style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text style={styles.catName} numberOfLines={1}>
                    {cat.category}
                  </Text>
                  <Text style={styles.catCount}>
                    {cat.count} ({pct}%)
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h4,
    color: Colors.charcoal,
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
  content: {
    gap: Spacing.md,
  },
  barStack: {
    height: 14,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: Colors.softBackground,
  },
  barSegment: {
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.xs,
  },
  catName: {
    ...Typography.bodySmall,
    color: Colors.charcoal,
    flex: 1,
  },
  catCount: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
  },
});
