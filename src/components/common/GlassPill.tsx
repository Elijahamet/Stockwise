import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';

interface GlassPillProps {
  label: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'emerald' | 'light' | 'dark';
}

export const GlassPill: React.FC<GlassPillProps> = ({
  label,
  icon,
  style,
  textStyle,
  variant = 'emerald',
}) => {
  const gradientColors =
    variant === 'emerald'
      ? (['rgba(22, 152, 108, 0.28)', 'rgba(15, 51, 42, 0.45)'] as const)
      : variant === 'light'
      ? (['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.20)'] as const)
      : (['rgba(255, 255, 255, 0.14)', 'rgba(255, 255, 255, 0.05)'] as const);

  const borderColor =
    variant === 'emerald'
      ? 'rgba(44, 229, 167, 0.35)'
      : variant === 'light'
      ? 'rgba(255, 255, 255, 0.70)'
      : 'rgba(255, 255, 255, 0.18)';

  const defaultTextColor =
    variant === 'emerald'
      ? '#2CE5A7'
      : variant === 'light'
      ? Colors.charcoal
      : Colors.white;

  return (
    <View style={[styles.pillContainer, { borderColor }, style]}>
      <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.contentRow}>
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <Text style={[styles.pillText, { color: defaultTextColor }, textStyle]}>
          {label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    position: 'relative',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
