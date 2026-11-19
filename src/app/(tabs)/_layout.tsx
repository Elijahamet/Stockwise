import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Package, ArrowLeftRight, User } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Platform, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface TabBarIconProps {
  IconComponent: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  focused: boolean;
}

const TabBarIcon = ({ IconComponent, focused }: TabBarIconProps) => {
  if (focused) {
    return (
      <View style={styles.activeIconContainer}>
        <LinearGradient
          colors={['#0E382E', '#16986C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeIconGradient}
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
  return (
    <Tabs
      screenOptions={{
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={[
                'rgba(8, 30, 23, 0.94)',
                'rgba(10, 37, 30, 0.95)',
                'rgba(15, 52, 41, 0.96)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ),
        tabBarActiveTintColor: '#2CE5A7',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.60)',
        tabBarStyle: {
          backgroundColor: '#0A241D',
          borderTopColor: 'rgba(22, 152, 108, 0.35)',
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
          backgroundColor: Colors.deepEmerald,
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
            <TabBarIcon IconComponent={Home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon IconComponent={Package} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          title: 'Stock',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon IconComponent={ArrowLeftRight} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon IconComponent={User} focused={focused} />
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
    shadowColor: '#16986C',
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
