import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { LinearGradient as ExpoGradient } from 'expo-linear-gradient';
import { ChevronDown } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';

interface SmoothLineGraphProps {
  currencySymbol?: string;
  todaySales?: number;
}

export const SmoothLineGraph: React.FC<SmoothLineGraphProps> = ({
  currencySymbol = 'GH₵',
  todaySales = 0,
}) => {
  const [period, setPeriod] = useState<'Month' | 'Week' | 'Year'>('Month');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayAmount = todaySales > 0 ? todaySales.toFixed(2) : '59.30';

  const periods: Array<'Month' | 'Week' | 'Year'> = ['Month', 'Week', 'Year'];

  return (
    <View style={styles.card}>
      {/* Header Row: Title & Dropdown Pill */}
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Graph</Text>

        <View style={styles.dropdownWrap}>
          <TouchableOpacity
            style={styles.periodPill}
            onPress={() => setDropdownOpen(!dropdownOpen)}
            activeOpacity={0.7}
          >
            <Text style={styles.periodPillText}>{period}</Text>
            <ChevronDown size={14} color={Colors.textMuted} />
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdownMenu}>
              {periods.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.dropdownItem, period === p && styles.dropdownItemActive]}
                  onPress={() => {
                    setPeriod(p);
                    setDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      period === p && styles.dropdownTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Main Chart Area */}
      <View style={styles.chartWrapper}>
        {/* Left Y-Axis Labels */}
        <View style={styles.yAxisCol}>
          <Text style={styles.axisLabel}>100</Text>
          <Text style={styles.axisLabel}>75</Text>
          <Text style={styles.axisLabel}>50</Text>
          <Text style={styles.axisLabel}>25</Text>
          <Text style={styles.axisLabel}>0</Text>
        </View>

        {/* SVG Curve Container */}
        <View style={styles.svgCol}>
          {/* Pinned Tooltip Marker with Glowing Glass Gradient */}
          <ExpoGradient
            colors={['#0F382E', '#16986C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tooltipPill}
          >
            <Text style={styles.tooltipText}>
              {currencySymbol}{displayAmount}
            </Text>
          </ExpoGradient>

          <Svg width="100%" height={150} viewBox="0 0 300 150">
            <Defs>
              <LinearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={Colors.freshGreen} stopOpacity="0.32" />
                <Stop offset="80%" stopColor={Colors.freshGreen} stopOpacity="0.04" />
                <Stop offset="100%" stopColor={Colors.freshGreen} stopOpacity="0" />
              </LinearGradient>
            </Defs>

            {/* Area Fill */}
            <Path
              d="M 10 115 C 35 95, 45 90, 65 92 C 90 94, 100 115, 125 116 C 150 117, 160 55, 185 52 C 205 49, 215 68, 235 68 C 255 68, 268 45, 290 40 L 290 148 L 10 148 Z"
              fill="url(#graphGradient)"
            />

            {/* Stroke Line */}
            <Path
              d="M 10 115 C 35 95, 45 90, 65 92 C 90 94, 100 115, 125 116 C 150 117, 160 55, 185 52 C 205 49, 215 68, 235 68 C 255 68, 268 45, 290 40"
              fill="none"
              stroke={Colors.deepEmerald}
              strokeWidth="2.5"
            />

            {/* Indicator Dot on Peak */}
            <Circle
              cx={185}
              cy={52}
              r={5}
              fill={Colors.freshGreen}
              stroke={Colors.white}
              strokeWidth={2}
            />
          </Svg>
        </View>
      </View>

      {/* Bottom X-Axis Labels */}
      <View style={styles.xAxisRow}>
        <Text style={styles.axisLabel}>Jan</Text>
        <Text style={styles.axisLabel}>Feb</Text>
        <Text style={styles.axisLabel}>Mar</Text>
        <Text style={styles.axisLabel}>Apr</Text>
        <Text style={styles.axisLabel}>May</Text>
        <Text style={styles.axisLabel}>Jun</Text>
        <Text style={styles.axisLabel}>Dec</Text>
      </View>
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
    ...Shadows.sm,
    position: 'relative',
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    position: 'relative',
    zIndex: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  dropdownWrap: {
    position: 'relative',
  },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.softBackground,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  periodPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 32,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.md,
    width: 90,
    zIndex: 50,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownItemActive: {
    backgroundColor: Colors.emeraldLight,
  },
  dropdownText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  dropdownTextActive: {
    color: Colors.deepEmerald,
    fontWeight: '800',
  },
  chartWrapper: {
    flexDirection: 'row',
    height: 150,
    alignItems: 'stretch',
    marginTop: Spacing.xs,
  },
  yAxisCol: {
    width: 28,
    justifyContent: 'space-between',
    paddingVertical: 4,
    alignItems: 'flex-start',
  },
  axisLabel: {
    fontSize: 10,
    color: Colors.textLight,
    fontWeight: '500',
  },
  svgCol: {
    flex: 1,
    position: 'relative',
  },
  tooltipPill: {
    position: 'absolute',
    top: 14,
    left: '52%',
    transform: [{ translateX: -35 }],
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(44, 229, 167, 0.45)',
    zIndex: 5,
    shadowColor: '#16986C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  tooltipText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 34,
    paddingRight: 8,
    marginTop: 6,
  },
});
