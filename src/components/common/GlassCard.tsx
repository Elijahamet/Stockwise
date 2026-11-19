import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  variant?: 'emeraldDark' | 'frostedLight' | 'obsidian';
  noBorder?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 45,
  tint = 'dark',
  variant = 'emeraldDark',
  noBorder = false,
}) => {
  const isLight = variant === 'frostedLight';

  // Base background tint colors for different glass variants
  const gradientColors = isLight
    ? (['rgba(255, 255, 255, 0.75)', 'rgba(255, 255, 255, 0.45)'] as const)
    : variant === 'emeraldDark'
    ? (['rgba(15, 51, 42, 0.72)', 'rgba(10, 36, 29, 0.85)'] as const)
    : (['rgba(26, 39, 35, 0.82)', 'rgba(15, 22, 20, 0.92)'] as const);

  const borderColor = isLight
    ? 'rgba(255, 255, 255, 0.65)'
    : 'rgba(44, 229, 167, 0.22)';

  return (
    <View
      style={[
        styles.outerContainer,
        !noBorder && { borderColor },
        isLight ? styles.lightShadow : styles.darkShadow,
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={isLight ? 'light' : tint}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Specular Top Edge Light Reflection */}
      <View
        style={[
          styles.specularEdge,
          {
            backgroundColor: isLight
              ? 'rgba(255, 255, 255, 0.85)'
              : 'rgba(255, 255, 255, 0.28)',
          },
        ]}
      />
      <View style={styles.contentWrap}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  darkShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  lightShadow: {
    shadowColor: '#0F332A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  specularEdge: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    borderRadius: 1,
  },
  contentWrap: {
    position: 'relative',
    zIndex: 2,
  },
});
