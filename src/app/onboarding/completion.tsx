import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { CheckCircle2, ArrowRight, Store, Package, Wifi } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Button } from '../../components/buttons/Button';
import { useApp } from '../../context/AppContext';

export default function OnboardingCompletionScreen() {
  const { business, user, products, setIsOnboarded } = useApp();

  const handleGoToDashboard = () => {
    setIsOnboarded(true);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.centerSection}>
          <View style={styles.checkCircle}>
            <CheckCircle2 size={54} color={Colors.white} />
          </View>

          <Text style={styles.title}>You are all set!</Text>
          <Text style={styles.subtitle}>
            Welcome to Stockwise. Your store is registered and ready for seamless offline-first inventory management.
          </Text>

          {/* Quick Recap Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Store size={18} color={Colors.freshGreen} />
              <Text style={styles.summaryLabel}>Store:</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {business?.name || 'My Store'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Package size={18} color={Colors.freshGreen} />
              <Text style={styles.summaryLabel}>Products registered:</Text>
              <Text style={styles.summaryValue}>{products.length}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Wifi size={18} color={Colors.freshGreen} />
              <Text style={styles.summaryLabel}>Offline mode:</Text>
              <Text style={styles.summaryValue}>Active & Ready</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <Button
            title="Go to Dashboard"
            onPress={handleGoToDashboard}
            size="lg"
            icon={<ArrowRight size={18} color={Colors.white} />}
            iconPosition="right"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepEmerald,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.freshGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    ...Typography.h1,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.emeraldLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
    maxWidth: 320,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryLabel: {
    ...Typography.bodySmall,
    color: Colors.emeraldLight,
  },
  summaryValue: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.white,
    flex: 1,
    textAlign: 'right',
  },
  bottomSection: {
    paddingVertical: Spacing.md,
  },
});
