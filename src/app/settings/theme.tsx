import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Sun, Moon, Smartphone, Check, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function ThemePreferencesScreen() {
  const { settings, updateSettings } = useApp();
  const [theme, setTheme] = useState<'light' | 'dark'>(settings.theme || 'light');
  const [isSaved, setIsSaved] = useState(false);

  const handleSelect = (selectedTheme: 'light' | 'dark') => {
    setTheme(selectedTheme);
    updateSettings({ theme: selectedTheme });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
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
            <Text style={styles.successText}>Theme appearance updated!</Text>
          </View>
        )}

        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>Display Theme</Text>
          <Text style={styles.headerSubtitle}>
            Choose between daytime clarity or high-contrast night mode for your shop terminal.
          </Text>
        </View>

        <View style={styles.themeListCard}>
          {/* Light Theme */}
          <TouchableOpacity
            style={[styles.themeItem, theme === 'light' && styles.selectedItem]}
            onPress={() => handleSelect('light')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#FFF9E6' }]}>
              <Sun size={20} color={Colors.amberDark} />
            </View>

            <View style={styles.themeInfo}>
              <Text style={styles.themeName}>Light Emerald (Recommended)</Text>
              <Text style={styles.themeDesc}>
                Clean daylight interface with soft grey background and emerald brand accents.
              </Text>
            </View>

            {theme === 'light' && <Check size={20} color={Colors.freshGreen} />}
          </TouchableOpacity>

          {/* Dark Theme */}
          <TouchableOpacity
            style={[styles.themeItem, theme === 'dark' && styles.selectedItem, { borderBottomWidth: 0 }]}
            onPress={() => handleSelect('dark')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#1A2421' }]}>
              <Moon size={20} color={Colors.emeraldLight} />
            </View>

            <View style={styles.themeInfo}>
              <Text style={styles.themeName}>Dark Slate</Text>
              <Text style={styles.themeDesc}>
                Low-light dark theme to reduce battery draw and eye fatigue during late shifts.
              </Text>
            </View>

            {theme === 'dark' && <Check size={20} color={Colors.freshGreen} />}
          </TouchableOpacity>
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
    fontWeight: '600',
  },
  headerBox: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.charcoal,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },
  themeListCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  selectedItem: {
    backgroundColor: Colors.emeraldLight,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  themeInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  themeName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  themeDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
});
