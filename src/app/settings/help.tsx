import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  HelpCircle,
  WifiOff,
  RefreshCw,
  Phone,
  Mail,
  MessageCircle,
  ChevronDown,
  Info,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Button } from '../../components/buttons/Button';

export default function HelpScreen() {
  const faqs = [
    {
      q: 'How does Stockwise work without an internet connection?',
      a: 'All product catalogs, stock movements, and customer sales are written directly to your phone’s high-speed local database first. You do not need any cellular network or Wi-Fi to keep running transactions.',
    },
    {
      q: 'What happens when internet connection returns?',
      a: 'Stockwise detects the connection automatically and uploads your local pending changes to the cloud. If multiple staff members made conflicting updates, the Conflict Resolution screen will prompt you to choose.',
    },
    {
      q: 'Can multiple workers use Stockwise at the same store?',
      a: 'Yes. You can invite workers with custom roles (Manager or Staff) from the Employee Management screen. Each staff member logs in with their credentials and records audited actions.',
    },
    {
      q: 'How do I generate and export inventory reports?',
      a: 'Head to the Reports tab at the bottom. You can view valuation figures, best sellers, and export full reports in PDF or CSV format directly to your phone storage.',
    },
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBox}>
          <View style={styles.heroIconWrap}>
            <HelpCircle size={32} color={Colors.white} />
          </View>
          <Text style={styles.heroTitle}>Stockwise Support Center</Text>
          <Text style={styles.heroSubtitle}>
            Get help with offline inventory, daily operations, and synchronization.
          </Text>
        </View>

        {/* Contact Support Options */}
        <View style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Direct Help Channels</Text>

          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL('tel:+233244000111')}
            >
              <Phone size={20} color={Colors.freshGreen} />
              <Text style={styles.contactBtnText}>Call Support</Text>
              <Text style={styles.contactSub}>Mon-Sat 8am-8pm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL('mailto:support@stockwise.store')}
            >
              <Mail size={20} color={Colors.freshGreen} />
              <Text style={styles.contactBtnText}>Email Desk</Text>
              <Text style={styles.contactSub}>support@stockwise.store</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Frequently Asked Questions */}
        <View style={styles.faqCard}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {faqs.map((faq, idx) => (
            <View
              key={idx}
              style={[
                styles.faqItem,
                idx === faqs.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}
        </View>

        {/* Offline Best Practices */}
        <View style={styles.tipCard}>
          <View style={styles.tipTitleRow}>
            <Info size={18} color={Colors.deepEmerald} />
            <Text style={styles.tipTitle}>Offline Best Practices</Text>
          </View>
          <Text style={styles.tipBody}>
            • Always perform routine physical stock audits at least once per month using the Stock Adjustment tool.{'\n'}
            • Keep your device battery charged during business hours.{'\n'}
            • Connect to Wi-Fi at the end of each business day to reconcile pending changes and download remote updates.
          </Text>
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
  heroBox: {
    backgroundColor: Colors.deepEmerald,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.freshGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    ...Typography.h3,
    color: Colors.white,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...Typography.caption,
    color: Colors.emeraldLight,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
    lineHeight: 16,
  },
  contactCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.charcoal,
    marginBottom: Spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  contactBtn: {
    flex: 1,
    backgroundColor: Colors.softBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  contactBtnText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.charcoal,
    marginTop: Spacing.xs,
  },
  contactSub: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  faqCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  faqItem: {
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  faqQuestion: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: 4,
  },
  faqAnswer: {
    ...Typography.caption,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  tipCard: {
    backgroundColor: Colors.emeraldLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(32, 166, 122, 0.3)',
  },
  tipTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  tipTitle: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.deepEmerald,
  },
  tipBody: {
    ...Typography.caption,
    color: Colors.deepEmerald,
    lineHeight: 18,
  },
});
