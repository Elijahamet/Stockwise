import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Package,
  ArrowRight,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../../components/common/GlassCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SlideData {
  id: string;
  headline: string;
  highlightText: string;
  description: string;
  imageUrl: string;
}

const SLIDES: SlideData[] = [
  {
    id: 'offline',
    headline: 'Never Stop Selling.',
    highlightText: 'Zero Internet Required.',
    description:
      'Checkout supermarket customers, print receipts, and log restocking even during total blackouts or network outages.',
    imageUrl:
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'scanner',
    headline: 'Precision Inventory.',
    highlightText: 'Lightning Rapid Scans.',
    description:
      'Scan barcodes in milliseconds, track batch expiration dates, and eliminate shrinkage with automated low-stock reorder triggers.',
    imageUrl:
      'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'analytics',
    headline: 'Know Every Cedi.',
    highlightText: 'Live Profit Margins.',
    description:
      'Real-time gross margin analytics, end-of-day cashier reconciliations, and one-tap PDF & CSV business valuation reports.',
    imageUrl:
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'sync',
    headline: 'Store In Harmony.',
    highlightText: 'Seamless Team Sync.',
    description:
      'Keep cashiers, stock managers, and owners aligned across devices with intelligent, non-destructive conflict resolution.',
    imageUrl:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
  },
];

export default function WelcomeScreen() {
  const { setIsOnboarded } = useApp();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const scrollRef = useRef<any>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentSlideIndex && index >= 0 && index < SLIDES.length) {
      setCurrentSlideIndex(index);
    }
  };

  const handleOpenSignUp = () => {
    router.push('/auth/create-account');
  };

  const handleNext = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      const nextIndex = currentSlideIndex + 1;
      scrollRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentSlideIndex(nextIndex);
    } else {
      // Last slide: open the Sign Up page
      handleOpenSignUp();
    }
  };

  const isLastSlide = currentSlideIndex === SLIDES.length - 1;

  return (
    <View style={styles.rootContainer}>
      <StatusBar style="light" />

      {/* Top Floating Glass Header with Brand & Skip Button */}
      <SafeAreaView style={styles.topSafeArea}>
        <View style={styles.topHeaderRow}>
          {/* Brand Logo & Title with Liquid Glass glow */}
          <View style={styles.brandBadge}>
            <LinearGradient
              colors={['#0F382E', '#16986C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoSquircle}
            >
              <Package size={20} color="#FFFFFF" strokeWidth={2.4} />
            </LinearGradient>
            <View>
              <Text style={styles.brandTitleText}>Stockwise</Text>
              <Text style={styles.brandEditionText}>RETAIL PRO</Text>
            </View>
          </View>

          {/* Liquid Glass Skip Button -> Opens Sign Up */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleOpenSignUp}
            activeOpacity={0.75}
          >
            <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.16)', 'rgba(255, 255, 255, 0.04)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.skipButtonText}>
              {isLastSlide ? 'Sign Up' : 'Skip'}
            </Text>
            <ChevronRight size={14} color="#2CE5A7" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Swipeable Slides Horizontal ScrollView */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.carouselScrollView}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slideContainer}>
            {/* Background Image with Fallback and Emerald Vignette Overlays */}
            <View style={styles.imageBackdropContainer}>
              <Image
                source={{ uri: slide.imageUrl }}
                style={styles.backdropImage}
                resizeMode="cover"
              />
              {/* Luxury Liquid Emerald Multi-layer Gradient Vignette */}
              <LinearGradient
                colors={[
                  'rgba(8, 28, 23, 0.35)',
                  'rgba(8, 28, 23, 0.65)',
                  '#081E17',
                  '#061712',
                ]}
                locations={[0, 0.45, 0.8, 1]}
                style={StyleSheet.absoluteFill}
              />
              {/* Liquid Ambient Light Glow Bubble */}
              <LinearGradient
                colors={['rgba(22, 152, 108, 0.3)', 'transparent']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.ambientGlowTop}
              />
            </View>

            {/* Central Liquid Glass Card with Frosted Depth */}
            <View style={styles.slideContentWrapper}>
              <GlassCard
                variant="emeraldDark"
                intensity={55}
                style={styles.mainGlassCard}
              >
                <View style={styles.cardPadding}>
                  {/* Headline & Highlighting */}
                  <View style={styles.headlineBlock}>
                    <Text style={styles.headlineLight}>{slide.headline}</Text>
                    <Text style={styles.headlineHighlight}>{slide.highlightText}</Text>
                  </View>

                  {/* Body Narrative */}
                  <Text style={styles.descriptionText}>{slide.description}</Text>
                </View>
              </GlassCard>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Sticky Controls: Pagination Dots & Action Buttons */}
      <SafeAreaView style={styles.bottomSafeArea}>
        {/* Futuristic Glass Pagination Dots */}
        <View style={styles.paginationRow}>
          {SLIDES.map((_, i) => {
            const isActive = i === currentSlideIndex;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  scrollRef.current?.scrollTo({
                    x: i * SCREEN_WIDTH,
                    animated: true,
                  });
                  setCurrentSlideIndex(i);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.paginationDot,
                    isActive && styles.paginationDotActive,
                  ]}
                >
                  {isActive && (
                    <LinearGradient
                      colors={['#16986C', '#2CE5A7']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Primary Action Button (Liquid Glass Emerald Gradient) */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#0F382E', '#16986C', '#20A67A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryActionGradient}
            >
              <Text style={styles.primaryActionText}>
                {isLastSlide ? 'Get Started • Sign Up' : 'Continue'}
              </Text>
              <View style={styles.primaryActionIconCircle}>
                <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.4} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Actions on Last Slide vs Earlier Slides */}
          <View style={styles.lastSlideSecondaryRow}>
            <TouchableOpacity
              onPress={() => router.push('/auth/login')}
              style={styles.secondaryTextBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnLabel}>
                Already have an account? <Text style={styles.secondaryBtnHighlight}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#061712',
  },
  topSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'android' ? Spacing.lg : Spacing.sm,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoSquircle: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16986C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  brandTitleText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  brandEditionText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2CE5A7',
    letterSpacing: 1.2,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    overflow: 'hidden',
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  carouselScrollView: {
    flex: 1,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 190 : 170,
  },
  imageBackdropContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#061712',
  },
  backdropImage: {
    width: '100%',
    height: '70%',
    position: 'absolute',
    top: 0,
  },
  ambientGlowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  slideContentWrapper: {
    paddingHorizontal: Spacing.xl,
    zIndex: 10,
  },
  mainGlassCard: {
    borderRadius: 28,
  },
  cardPadding: {
    padding: Spacing.xl,
  },
  headlineBlock: {
    marginBottom: Spacing.sm + 2,
  },
  headlineLight: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 33,
  },
  headlineHighlight: {
    fontSize: 27,
    fontWeight: '800',
    color: '#2CE5A7',
    letterSpacing: -0.5,
    lineHeight: 33,
  },
  descriptionText: {
    fontSize: 14,
    color: 'rgba(232, 246, 241, 0.88)',
    lineHeight: 21,
    fontWeight: '400',
  },
  bottomSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? Spacing.sm : Spacing.md,
    zIndex: 30,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    overflow: 'hidden',
  },
  paginationDotActive: {
    width: 26,
    borderRadius: 5,
  },
  actionButtonsContainer: {
    gap: 10,
  },
  primaryActionButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#16986C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: Spacing.xl,
    gap: 10,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  primaryActionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastSlideSecondaryRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  secondaryTextBtn: {
    paddingVertical: 6,
  },
  secondaryBtnLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
  },
  secondaryBtnHighlight: {
    color: '#2CE5A7',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
