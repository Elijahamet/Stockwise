import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart3 } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';

interface BarData {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  title: string;
  data: BarData[];
  currencySymbol?: string;
  emptyMessage?: string;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  title,
  data = [],
  currencySymbol = '',
  emptyMessage = 'No sales or activity recorded yet',
}) => {
  const safeData = data || [];
  const maxValue = safeData.length > 0 ? Math.max(...safeData.map((d) => d.value), 0) : 0;
  const hasData = safeData.some((d) => d.value > 0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      {!hasData ? (
        <View style={styles.emptyContainer}>
          <BarChart3 size={32} color={Colors.textLight} />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
          <Text style={styles.emptySubtext}>
            Charts will automatically populate when you start recording sales or stock.
          </Text>
        </View>
      ) : (
        <View style={styles.chartContainer}>
          <View style={styles.barsRow}>
            {safeData.map((item, index) => {
              const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
              return (
                <View key={index} style={styles.barColumn}>
                  <Text style={styles.barValueText}>
                    {currencySymbol}
                    {item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${Math.max(heightPercent, 4)}%`,
                          backgroundColor:
                            item.value === maxValue && maxValue > 0
                              ? Colors.freshGreen
                              : Colors.deepEmerald,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.label}</Text>
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
  chartContainer: {
    paddingTop: Spacing.sm,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValueText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  barTrack: {
    width: 24,
    height: 100,
    backgroundColor: Colors.softBackground,
    borderRadius: BorderRadius.xs,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: BorderRadius.xs,
  },
  barLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 6,
  },
});
