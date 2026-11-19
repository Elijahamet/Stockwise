import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  let currentTheme: any = null;
  try {
    const app = useApp();
    currentTheme = app?.currentTheme;
  } catch {
    // Safe fallback if used outside AppProvider
  }

  let paddingVertical = 14;
  let paddingHorizontal = Spacing.lg;
  let minHeight = 50;

  if (size === 'sm') {
    paddingVertical = 8;
    paddingHorizontal = Spacing.md;
    minHeight = 36;
  } else if (size === 'lg') {
    paddingVertical = 16;
    paddingHorizontal = Spacing.xxl;
    minHeight = 54;
  }

  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    paddingVertical,
    paddingHorizontal,
    minHeight,
    opacity: disabled || loading ? 0.6 : 1,
  };

  const getTextColor = (): string => {
    if (variant === 'outline') return currentTheme?.colors?.text || Colors.charcoal;
    if (variant === 'ghost') return currentTheme?.colors?.accent || Colors.deepEmerald;
    return Colors.white;
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? (currentTheme?.colors?.accent || Colors.deepEmerald) : Colors.white}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </>
  );

  if (variant === 'primary') {
    const primaryGrad = currentTheme?.colors?.primaryGradient || ['#072030', '#0284C7'];
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={style}
      >
        <LinearGradient
          colors={primaryGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[baseStyle, Shadows.sm]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={style}
      >
        <LinearGradient
          colors={['#0A241D', '#0F332A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[baseStyle, Shadows.sm]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={style}
      >
        <LinearGradient
          colors={['#C93B3B', '#E04848']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[baseStyle, Shadows.sm]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  let backgroundColor = Colors.white;
  let borderWidth = 0;
  let borderColor = 'transparent';

  if (variant === 'outline') {
    borderWidth = 1.5;
    borderColor = Colors.border;
  } else if (variant === 'ghost') {
    backgroundColor = 'transparent';
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        baseStyle,
        { backgroundColor, borderWidth, borderColor },
        variant === 'outline' ? Shadows.sm : null,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Typography.button,
    fontWeight: '700',
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});
