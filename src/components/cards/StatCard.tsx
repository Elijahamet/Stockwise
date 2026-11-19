import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing, Typography } from '../../constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'amber' | 'red' | 'green';
  onPress?: () => void;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  onPress,
  style,
}) => {
  const getAccentColor = () => {
    switch (variant) {
      case 'amber':
        return Colors.amber;
      case 'red':
        return Colors.softRed;
      case 'green':
        return Colors.freshGreen;
      default:
        return Colors.deepEmerald;
    }
  };

  const getIconBackground = () => {
    switch (variant) {
      case 'amber':
        return Colors.amberLight;
      case 'red':
        return Colors.redLight;
      case 'green':
        return Colors.freshGreenLight;
      default:
        return Colors.surfaceSubtle;
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      style={[styles.card, style]}
    >
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {icon && (
          <View style={[styles.iconPill, { backgroundColor: getIconBackground() }]}>
            {icon}
          </View>
        )}
      </View>

      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>

      {subtitle && (
        <View style={styles.subtitleRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getAccentColor() },
            ]}
          />
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      )}

      {/* Decorative subtle bottom border line */}
      <View
        style={[
          styles.accentBar,
          { backgroundColor: getAccentColor(), opacity: variant !== 'default' ? 0.9 : 0.2 },
        ]}
      />
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md + 2,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    flex: 1,
    marginRight: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...Typography.h2,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.charcoal,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  subtitle: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    flex: 1,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});
