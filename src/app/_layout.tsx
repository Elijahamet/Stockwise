import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../context/AppContext';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.deepEmerald,
            },
            headerTintColor: Colors.white,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: Colors.softBackground,
            },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="products/new"
            options={{ title: 'Add Product', presentation: 'card' }}
          />
          <Stack.Screen
            name="products/[id]"
            options={{ title: 'Product Details' }}
          />
          <Stack.Screen
            name="products/edit/[id]"
            options={{ title: 'Edit Product' }}
          />
          <Stack.Screen
            name="stock/add"
            options={{ title: 'Add Stock' }}
          />
          <Stack.Screen
            name="stock/remove"
            options={{ title: 'Remove Stock' }}
          />
          <Stack.Screen
            name="stock/adjust"
            options={{ title: 'Stock Adjustment' }}
          />
          <Stack.Screen
            name="stock/history"
            options={{ title: 'Stock Movement History' }}
          />
          <Stack.Screen
            name="sales/new"
            options={{ title: 'Record Sale' }}
          />
          <Stack.Screen
            name="sales/history"
            options={{ title: 'Sales History' }}
          />
          <Stack.Screen
            name="sales/[id]"
            options={{ title: 'Sale Receipt' }}
          />
          <Stack.Screen
            name="employees/index"
            options={{ title: 'Employees' }}
          />
          <Stack.Screen
            name="employees/new"
            options={{ title: 'Add Employee' }}
          />
          <Stack.Screen
            name="employees/[id]"
            options={{ title: 'Employee Profile' }}
          />
          <Stack.Screen
            name="employees/edit/[id]"
            options={{ title: 'Edit Employee' }}
          />
          <Stack.Screen
            name="notifications/index"
            options={{ title: 'Notifications' }}
          />
          <Stack.Screen
            name="sync/index"
            options={{ title: 'Sync & Connection' }}
          />
          <Stack.Screen
            name="sync/pending"
            options={{ title: 'Pending Offline Changes' }}
          />
          <Stack.Screen
            name="sync/conflicts"
            options={{ title: 'Conflict Resolution' }}
          />
          <Stack.Screen
            name="settings/index"
            options={{ title: 'Settings' }}
          />
          <Stack.Screen
            name="settings/business-profile"
            options={{ title: 'Business Profile' }}
          />
          <Stack.Screen
            name="settings/personal-profile"
            options={{ title: 'Personal Profile' }}
          />
          <Stack.Screen
            name="settings/currency"
            options={{ title: 'Currency Settings' }}
          />
          <Stack.Screen
            name="settings/units"
            options={{ title: 'Measurement Units' }}
          />
          <Stack.Screen
            name="settings/theme"
            options={{ title: 'Theme Preferences' }}
          />
          <Stack.Screen
            name="settings/security"
            options={{ title: 'Security Settings' }}
          />
          <Stack.Screen
            name="settings/help"
            options={{ title: 'Help & Support' }}
          />
          <Stack.Screen
            name="scanner/index"
            options={{ title: 'Barcode & Expiry Scanner', presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="expiry/index"
            options={{ title: 'Expiry Management' }}
          />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
