import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, CheckCircle2, Sparkles, Layers, ShieldCheck } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { THEME_LIST, THEME_PRESETS } from '../../constants/themePresets';
import { AppThemeId } from '../../types';

export default function ThemePreferencesScreen() {
  const { settings, currentTheme, setAppTheme } = useApp();
  const [isSaved, setIsSaved] = useState(false);
  const [activeName, setActiveName] = useState<string>('');

  const currentActive = settings.activeTheme || 'emerald';
  const currentThemeId = (
    currentActive === 'glass_ios27' ? 'glass' : currentActive
  ) as AppThemeId;

  const handleSelect = (themeId: AppThemeId) => {
    setAppTheme(themeId);
    const preset = THEME_PRESETS[themeId];
    setActiveName(preset ? preset.name : 'Theme');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isSaved && (
          <View style={styles.successBanner}>
            <CheckCircle2 size={16} color={Colors.freshGreen} />
            <Text style={styles.successText}>{activeName} theme applied across Stockwise!</Text>
          </View>
        )}

        {/* Current Active Preview Header Card */}
        <LinearGradient
          colors={currentTheme?.colors?.primaryGradient || ['#0A241D', '#0F332A', '#16986C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.previewCard, currentTheme?.isGlass && styles.previewCardGlass]}
        >
          <View style={styles.previewTopRow}>
            <View style={styles.previewBadge}>
              <Sparkles size={13} color={Colors.white} />
              <Text style={styles.previewBadgeText}>ACTIVE THEME</Text>
            </View>
            {currentTheme?.badge && (
              <View style={styles.glassBadgePill}>
                <Text style={styles.glassBadgePillText}>{currentTheme.badge}</Text>
              </View>
            )}
          </View>

          <Text style={styles.previewTitle}>{currentTheme?.name || 'Classic Emerald'}</Text>
          <Text style={styles.previewTagline}>{currentTheme?.tagline || 'Signature Stockwise Green & White'}</Text>

          <View style={styles.previewSwatchesRow}>
            {currentTheme?.previewColors?.map((c, i) => (
              <View key={i} style={[styles.previewSwatchBubble, { backgroundColor: c }]} />
            ))}
            <Text style={styles.previewHint}>Real-time synchronized across all screens</Text>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionHeadingTitle}>SELECT APP APPEARANCE</Text>
          <Text style={styles.sectionHeadingSubtitle}>
            Classic Emerald is your signature brand green. You can also choose from Sea Blue, Sunset Orange, Royal Purple, iOS 27 Liquid Glass, Sunburst Yellow, or Crimson Red.
          </Text>
        </View>

        {/* 6 Theme Selection Cards */}
        <View style={styles.themeListWrap}>
          {THEME_LIST.map((item, index) => {
            const isSelected = currentThemeId === item.id;
            const isLast = index === THEME_LIST.length - 1;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.themeItem,
                  isSelected && styles.selectedItem,
                  item.isGlass && styles.glassThemeItem,
                  isLast && { borderBottomWidth: 0 },
                ]}
                onPress={() => handleSelect(item.id)}
                activeOpacity={0.7}
              >
                {/* Glow layer for iOS 27 */}
                {item.isGlass && (
                  <LinearGradient
                    colors={['rgba(44, 229, 167, 0.12)', 'rgba(7, 26, 21, 0.3)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}

                <View style={styles.themeItemContent}>
                  {/* Swatch & Icon Left */}
                  <View style={styles.themeItemLeft}>
                    <View style={styles.swatchStack}>
                      {item.previewColors.map((color, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.stackedSwatch,
                            { backgroundColor: color, left: idx * 10, zIndex: 3 - idx },
                          ]}
                        />
                      ))}
                    </View>
                  </View>

                  {/* Texts */}
                  <View style={styles.themeInfo}>
                    <View style={styles.themeNameRow}>
                      <Text
                        style={[
                          styles.themeName,
                          item.isGlass && styles.glassText,
                          isSelected && styles.selectedText,
                        ]}
                      >
                        {item.name}
                      </Text>
                      {item.badge && (
                        <View
                          style={[
                            styles.badgePill,
                            item.isGlass
                              ? styles.badgeGlass
                              : item.isDark
                              ? styles.badgeDark
                              : styles.badgeLight,
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgePillText,
                              item.isGlass
                                ? styles.badgeGlassText
                                : item.isDark
                                ? styles.badgeDarkText
                                : styles.badgeLightText,
                            ]}
                          >
                            {item.badge}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.themeTagline}>{item.tagline}</Text>
                    <Text style={styles.themeDesc}>{item.description}</Text>
                  </View>

                  {/* Check Indicator */}
                  <View style={styles.checkWrap}>
                    {isSelected ? (
                      <View style={styles.activeCheckCircle}>
                        <Check size={14} color={Colors.white} strokeWidth={3} />
                      </View>
                    ) : (
                      <View style={styles.inactiveCircle} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feature info footer */}
        <View style={styles.footerInfoCard}>
          <Layers size={18} color={Colors.emeraldDark} />
          <View style={styles.footerInfoTexts}>
            <Text style={styles.footerInfoTitle}>Persistent Cloud & Local Storage</Text>
            <Text style={styles.footerInfoBody}>
              Your chosen appearance preference is saved to device storage and immediately active across all tabs, cards, and scanner overlays.
            </Text>
          </View>
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
    gap: Spacing.md,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.emeraldLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.freshGreen,
  },
  successText: {
    ...Typography.bodySmall,
    color: Colors.deepEmerald,
    fontWeight: '700',
    flex: 1,
  },
  previewCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  previewCardGlass: {
    borderWidth: 1.5,
    borderColor: 'rgba(44, 229, 167, 0.45)',
  },
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  previewBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.8,
  },
  glassBadgePill: {
    backgroundColor: 'rgba(44, 229, 167, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(44, 229, 167, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  glassBadgePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5EEAD4',
  },
  previewTitle: {
    ...Typography.h3,
    color: Colors.white,
    fontWeight: '800',
  },
  previewTagline: {
    ...Typography.caption,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  previewSwatchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  previewSwatchBubble: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  previewHint: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginLeft: 4,
    flex: 1,
  },
  sectionHeading: {
    marginTop: Spacing.xs,
  },
  sectionHeadingTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.deepEmerald,
    letterSpacing: 0.8,
  },
  sectionHeadingSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 3,
  },
  themeListWrap: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  themeItem: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    position: 'relative',
  },
  glassThemeItem: {
    backgroundColor: '#0A2019',
  },
  selectedItem: {
    backgroundColor: '#F0FDF8',
  },
  themeItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  themeItemLeft: {
    width: 44,
    height: 36,
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  swatchStack: {
    position: 'relative',
    height: 24,
    width: 40,
  },
  stackedSwatch: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    ...Shadows.sm,
  },
  themeInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  themeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  themeName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  glassText: {
    color: '#FFFFFF',
  },
  selectedText: {
    color: Colors.deepEmerald,
  },
  themeTagline: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.freshGreen,
    marginTop: 2,
  },
  themeDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeGlass: {
    backgroundColor: 'rgba(44, 229, 167, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(44, 229, 167, 0.45)',
  },
  badgeDark: {
    backgroundColor: '#1E293B',
  },
  badgeLight: {
    backgroundColor: Colors.emeraldLight,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  badgeGlassText: {
    color: '#2CE5A7',
  },
  badgeDarkText: {
    color: '#94A3B8',
  },
  badgeLightText: {
    color: Colors.deepEmerald,
  },
  checkWrap: {
    paddingTop: 4,
  },
  activeCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.freshGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.borderLight,
  },
  footerInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.emeraldLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(22, 152, 108, 0.25)',
  },
  footerInfoTexts: {
    flex: 1,
  },
  footerInfoTitle: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.deepEmerald,
  },
  footerInfoBody: {
    fontSize: 11,
    color: Colors.deepEmerald,
    lineHeight: 16,
    marginTop: 2,
    opacity: 0.85,
  },
});
