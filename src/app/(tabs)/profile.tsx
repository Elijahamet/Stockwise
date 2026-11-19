import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  User,
  Store,
  Users,
  Bell,
  Wifi,
  WifiOff,
  Coins,
  Scale,
  Shield,
  HelpCircle,
  ChevronRight,
  LogOut,
  Sparkles,
  ArrowRight,
  FileText,
  Palette,
  Check,
  CheckCircle2,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import { THEME_LIST, THEME_PRESETS } from '../../constants/themePresets';
import { AppThemeId } from '../../types';

export default function ProfileScreen() {
  const {
    user,
    business,
    employees,
    notifications,
    syncState,
    settings,
    currentTheme,
    setAppTheme,
    setIsOnboarded,
  } = useApp();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isOnline = syncState.connectionStatus === 'online';

  const handleSelectTheme = (themeId: AppThemeId) => {
    setAppTheme(themeId);
    const target = THEME_PRESETS[themeId];
    setAppliedNotice(target ? `${target.name} applied!` : 'Theme updated!');
    setTimeout(() => setAppliedNotice(null), 2500);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    setIsOnboarded(false);
    router.replace('/onboarding/welcome');
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile & Business Hero Card with Rich Gradient */}
        <LinearGradient
          colors={currentTheme?.colors?.primaryGradient || ['#0A241D', '#0F332A', '#16986C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, currentTheme?.isGlass && styles.heroCardGlass]}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarInitials}>
                {user?.fullName
                  ? user.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : 'OW'}
              </Text>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? Colors.freshGreen : Colors.amber },
                ]}
              />
            </View>

            <View style={styles.heroInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.fullName || 'Business Owner'}
                </Text>
                <View style={styles.ownerBadge}>
                  <Text style={styles.ownerBadgeText}>OWNER</Text>
                </View>
              </View>

              <Text style={styles.bizNameText} numberOfLines={1}>
                {business?.name || 'Stockwise Store'}
              </Text>

              <Text style={styles.contactText}>
                {user?.phoneNumber || user?.email || 'No contact specified'}
              </Text>
            </View>
          </View>

          {/* Quick Business Details Pill Bar */}
          <View style={styles.bizMetaRow}>
            <View style={styles.bizMetaItem}>
              <Store size={13} color={Colors.white} />
              <Text style={styles.bizMetaText}>
                {business?.city || 'Accra'}, {business?.country || 'Ghana'}
              </Text>
            </View>

            <View style={styles.bizMetaDivider} />

            <View style={styles.bizMetaItem}>
              <Coins size={13} color={Colors.white} />
              <Text style={styles.bizMetaText}>
                {settings.currency} ({settings.currencyCode})
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Offline & Sync Status Card */}
        <TouchableOpacity
          style={styles.syncCard}
          onPress={() => router.push('/sync')}
          activeOpacity={0.7}
        >
          <View style={styles.syncLeft}>
            <View
              style={[
                styles.syncIconWrap,
                { backgroundColor: isOnline ? Colors.emeraldLight : Colors.amberLight },
              ]}
            >
              {isOnline ? (
                <Wifi size={18} color={Colors.freshGreen} />
              ) : (
                <WifiOff size={18} color={Colors.amberDark} />
              )}
            </View>
            <View>
              <Text style={styles.syncTitle}>
                {isOnline ? 'Online • Local Database Active' : 'Offline Mode • Local Queue'}
              </Text>
              <Text style={styles.syncSub}>
                {syncState.pendingChanges.length === 0
                  ? 'All changes safely stored locally'
                  : `${syncState.pendingChanges.length} changes queued for sync`}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={Colors.textLight} />
        </TouchableOpacity>

        {/* SECTION 1: STORE & TEAM */}
        <View style={styles.sectionContainer}>
          <Text style={styles.microSectionLabel}>STORE & TEAM OPERATIONS</Text>

          <View style={styles.menuGroup}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/settings/business-profile')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#E8F6F1', '#D4EFE4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.menuIconWrap}
              >
                <Store size={18} color={Colors.deepEmerald} />
              </LinearGradient>
              <View style={styles.menuTexts}>
                <Text style={styles.menuTitle}>Business Profile</Text>
                <Text style={styles.menuSub}>Store name, address, tax info & logo</Text>
              </View>
              <ChevronRight size={18} color={Colors.textLight} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/employees')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#E8F6F1', '#D4EFE4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.menuIconWrap}
              >
                <Users size={18} color={Colors.deepEmerald} />
              </LinearGradient>
              <View style={styles.menuTexts}>
                <Text style={styles.menuTitle}>Team & Permissions</Text>
                <Text style={styles.menuSub}>Manage cashiers, managers & roles</Text>
              </View>
              <View style={styles.pillBadge}>
                <Text style={styles.pillBadgeText}>
                  {employees.length + 1}
                </Text>
              </View>
              <ChevronRight size={18} color={Colors.textLight} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/notifications')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#E8F6F1', '#D4EFE4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.menuIconWrap}
              >
                <Bell size={18} color={Colors.deepEmerald} />
              </LinearGradient>
              <View style={styles.menuTexts}>
                <Text style={styles.menuTitle}>Store Notifications</Text>
                <Text style={styles.menuSub}>Low stock alerts, sales & sync logs</Text>
              </View>
              {unreadCount > 0 && (
                <View style={[styles.pillBadge, { backgroundColor: Colors.freshGreen }]}>
                  <Text style={[styles.pillBadgeText, { color: Colors.white }]}>
                    {unreadCount}
                  </Text>
                </View>
              )}
              <ChevronRight size={18} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION: THEME & DISPLAY APPEARANCE (6 THEMES INCL. iOS 27 GLASS UI) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.microSectionLabel}>THEME & DISPLAY APPEARANCE</Text>
            <View style={styles.activeThemeIndicator}>
              <Sparkles size={12} color={currentTheme?.colors?.accent || Colors.freshGreen} />
              <Text
                style={[
                  styles.activeThemeIndicatorText,
                  { color: currentTheme?.colors?.accent || Colors.deepEmerald },
                ]}
              >
                {currentTheme?.name || 'Classic Emerald'}
              </Text>
            </View>
          </View>

          {/* Applied Notice Banner */}
          {appliedNotice && (
            <View style={styles.themeAppliedToast}>
              <CheckCircle2 size={16} color={Colors.freshGreen} />
              <Text style={styles.themeAppliedToastText}>{appliedNotice}</Text>
            </View>
          )}

          {/* 6 Themes Carousel Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themeCarousel}
          >
            {THEME_LIST.map((item) => {
              const currentActive = settings.activeTheme || 'emerald';
              const isSelected =
                currentActive === item.id ||
                (item.id === 'glass' && currentActive === 'glass_ios27');
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.themeCard,
                    isSelected && styles.themeCardActive,
                    item.isGlass && styles.themeCardGlass,
                  ]}
                  onPress={() => handleSelectTheme(item.id)}
                  activeOpacity={0.8}
                >
                  {/* Subtle glass reflection glow for iOS 27 theme */}
                  {item.isGlass && (
                    <LinearGradient
                      colors={['rgba(44, 229, 167, 0.22)', 'rgba(8, 30, 24, 0.75)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.glassCardGlow}
                    />
                  )}

                  <View style={styles.themeCardTop}>
                    {/* Color Swatch Dots */}
                    <View style={styles.swatchRow}>
                      {item.previewColors.map((color, idx) => (
                        <View
                          key={idx}
                          style={[styles.swatchDot, { backgroundColor: color }]}
                        />
                      ))}
                    </View>

                    {/* Badge */}
                    {item.badge && (
                      <View
                        style={[
                          styles.themeBadge,
                          item.isGlass
                            ? styles.glassThemeBadge
                            : item.isDark
                            ? styles.darkThemeBadge
                            : styles.lightThemeBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.themeBadgeText,
                            item.isGlass
                              ? styles.glassThemeBadgeText
                              : item.isDark
                              ? styles.darkThemeBadgeText
                              : styles.lightThemeBadgeText,
                          ]}
                        >
                          {item.badge}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.themeCardInfo}>
                    <Text
                      style={[
                        styles.themeCardName,
                        (item.isDark || item.isGlass) && styles.whiteText,
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.themeCardTagline,
                        (item.isDark || item.isGlass) && styles.slateText,
                      ]}
                      numberOfLines={2}
                    >
                      {item.tagline}
                    </Text>
                  </View>

                  {/* Active vs Tap Status */}
                  <View style={styles.themeCardFooter}>
                    {isSelected ? (
                      <View style={styles.activeCheckPill}>
                        <Check size={11} color={Colors.white} />
                        <Text style={styles.activeCheckPillText}>Active Theme</Text>
                      </View>
                    ) : (
                      <View style={styles.tapPill}>
                        <Text style={styles.tapPillText}>Tap to Apply</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* SECTION 2: APP PREFERENCES */}
        <View style={styles.sectionContainer}>
          <Text style={styles.microSectionLabel}>PREFERENCES & SECURITY</Text>

          <View style={styles.menuGroup}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/settings/theme')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: Colors.softBackground }]}>
                <Palette size={18} color={Colors.deepEmerald} />
              </View>
              <View style={styles.menuTexts}>
                <Text style={styles.menuTitle}>Theme & Appearance</Text>
                <Text style={styles.menuSub}>{currentTheme?.name || 'Classic Emerald'} (6 Themes)</Text>
              </View>
              <ChevronRight size={18} color={Colors.textLight} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/settings/currency')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: Colors.softBackground }]}>
                <Coins size={18} color={Colors.deepEmerald} />
              </View>
              <View style={styles.menuTexts}>
                <Text style={styles.menuTitle}>Currency Setting</Text>
                <Text style={styles.menuSub}>Default: {settings.currency} ({settings.currencyCode})</Text>
              </View>
              <ChevronRight size={18} color={Colors.textLight} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/settings/units')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: Colors.softBackground }]}>
                <Scale size={18} color={Colors.deepEmerald} />
              </View>
              <View style={styles.menuTexts}>
                <Text style={styles.menuTitle}>Measurement Units</Text>
                <Text style={styles.menuSub}>Pcs, kg, boxes, cartons & packs</Text>
              </View>
              <ChevronRight size={18} color={Colors.textLight} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/settings/security')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: Colors.softBackground }]}>
                <Shield size={18} color={Colors.deepEmerald} />
              </View>
              <View style={styles.menuTexts}>
                <Text style={styles.menuTitle}>Security & Offline PIN</Text>
                <Text style={styles.menuSub}>Protect manager functions & audits</Text>
              </View>
              <ChevronRight size={18} color={Colors.textLight} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/settings/help')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: Colors.softBackground }]}>
                <HelpCircle size={18} color={Colors.deepEmerald} />
              </View>
              <View style={styles.menuTexts}>
                <Text style={styles.menuTitle}>Help & User Guide</Text>
                <Text style={styles.menuSub}>Offline workflows, FAQs & support</Text>
              </View>
              <ChevronRight size={18} color={Colors.textLight} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/onboarding/welcome')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: 'rgba(22, 152, 108, 0.12)' }]}>
                <Sparkles size={18} color={Colors.freshGreen} />
              </View>
              <View style={styles.menuTexts}>
                <Text style={styles.menuTitle}>App Intro & Feature Tour</Text>
                <Text style={styles.menuSub}>Revisit the 4-slide landing tour</Text>
              </View>
              <ChevronRight size={18} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.7}
        >
          <LogOut size={18} color={Colors.softRed} />
          <Text style={styles.logoutBtnText}>Log Out / Switch Account</Text>
        </TouchableOpacity>

        {/* Version info footer */}
        <Text style={styles.versionText}>
          Stockwise v1.0.0 • Offline-First Retail OS
        </Text>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={showLogoutModal}
        title="Sign Out of Stockwise?"
        message="Your local database and offline transaction queue are safely stored on this device."
        confirmText="Yes, Log Out"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
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
    gap: Spacing.lg,
  },
  heroCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(44, 229, 167, 0.35)',
    shadowColor: '#0A241D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  heroInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginBottom: 2,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
    flexShrink: 1,
  },
  ownerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  ownerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  bizNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  contactText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  bizMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  bizMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bizMetaText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
  bizMetaDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  syncCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  syncLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  syncIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  syncSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  sectionContainer: {
    gap: Spacing.xs,
  },
  microSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
    marginLeft: 4,
  },
  menuGroup: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuTexts: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  menuSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  pillBadge: {
    backgroundColor: Colors.emeraldLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.deepEmerald,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FBE8E8',
    ...Shadows.sm,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.softRed,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  heroCardGlass: {
    borderColor: 'rgba(44, 229, 167, 0.65)',
    shadowColor: '#2CE5A7',
    shadowOpacity: 0.45,
    shadowRadius: 22,
    borderWidth: 1.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  activeThemeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  activeThemeIndicatorText: {
    fontSize: 10,
    fontWeight: '800',
  },
  themeAppliedToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F6F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.freshGreen,
    marginBottom: Spacing.xs,
  },
  themeAppliedToastText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.deepEmerald,
  },
  themeCarousel: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.lg,
  },
  themeCard: {
    width: 200,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    justifyContent: 'space-between',
    minHeight: 155,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.sm,
  },
  themeCardActive: {
    borderColor: Colors.freshGreen,
    backgroundColor: '#F3FAF7',
    ...Shadows.md,
  },
  themeCardGlass: {
    backgroundColor: '#081E18',
    borderColor: 'rgba(44, 229, 167, 0.45)',
  },
  glassCardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  themeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  swatchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  themeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  glassThemeBadge: {
    backgroundColor: 'rgba(44, 229, 167, 0.25)',
    borderWidth: 1,
    borderColor: '#2CE5A7',
  },
  darkThemeBadge: {
    backgroundColor: '#1E293B',
  },
  lightThemeBadge: {
    backgroundColor: Colors.surfaceSubtle,
  },
  themeBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  glassThemeBadgeText: {
    color: '#2CE5A7',
  },
  darkThemeBadgeText: {
    color: '#38BDF8',
  },
  lightThemeBadgeText: {
    color: Colors.textMuted,
  },
  themeCardInfo: {
    flex: 1,
    marginBottom: Spacing.sm,
  },
  themeCardName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.charcoal,
    marginBottom: 2,
  },
  themeCardTagline: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 15,
  },
  whiteText: {
    color: Colors.white,
  },
  slateText: {
    color: '#94A3B8',
  },
  themeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  activeCheckPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.freshGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  activeCheckPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
  },
  tapPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
  },
  tapPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});
