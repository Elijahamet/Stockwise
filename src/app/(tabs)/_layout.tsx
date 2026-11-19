import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Package, ArrowLeftRight, User } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Platform, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useApp } from '../../context/AppContext';

interface TabBarIconProps {
  IconComponent: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  focused: boolean;
  gradientColors: [string, string, ...string[]];
  shadowColor: string;
}

const TabBarIcon = ({ IconComponent, focused, gradientColors, shadowColor }: TabBarIconProps) => {
  if (focused) {
    return (
      <View style={styles.activeIconContainer}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.activeIconGradient, { shadowColor }]}
        >
          <IconComponent size={19} color="#FFFFFF" strokeWidth={2.4} />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.inactiveIconContainer}>
      <IconComponent size={21} color="rgba(255, 255, 255, 0.62)" strokeWidth={1.8} />
    </View>
  );
};

export default function TabLayout() {
  const { currentTheme } = useApp();

  const tabBarBgColors = currentTheme?.colors?.tabBarBackground || [
    'rgba(7, 32, 48, 0.95)',
    'rgba(10, 48, 73, 0.96)',
    'rgba(11, 59, 89, 0.97)',
  ];
  const activeTint = currentTheme?.colors?.tabBarActive || '#38BDF8';
  const borderTop = currentTheme?.colors?.tabBarBorder || 'rgba(2, 132, 199, 0.4)';
  const primaryGrad = currentTheme?.colors?.primaryGradient || ['#072030', '#0B3B59', '#0284C7'];
  const accentColor = currentTheme?.colors?.accent || '#0284C7';

  return (
    <Tabs
      screenOptions={{
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={tabBarBgColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ),
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.60)',
        tabBarStyle: {
          backgroundColor: currentTheme?.colors?.primary || '#082538',
          borderTopColor: borderTop,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          elevation: 16,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.2,
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: currentTheme?.colors?.primary || Colors.deepEmerald,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              IconComponent={Home}
              focused={focused}
              gradientColors={primaryGrad}
              shadowColor={accentColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              IconComponent={Package}
              focused={focused}
              gradientColors={primaryGrad}
              shadowColor={accentColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          title: 'Stock',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              IconComponent={ArrowLeftRight}
              focused={focused}
              gradientColors={primaryGrad}
              shadowColor={accentColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              IconComponent={User}
              focused={focused}
              gradientColors={primaryGrad}
              shadowColor={accentColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activeIconGradient: {
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  inactiveIconContainer: {
    width: 44,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});
