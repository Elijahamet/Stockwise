import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.deepEmerald,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: Colors.softBackground,
        },
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="register-account" options={{ title: 'Create Account' }} />
      <Stack.Screen name="register-business" options={{ title: 'Business Details' }} />
      <Stack.Screen name="add-products" options={{ title: 'First Product' }} />
      <Stack.Screen name="invite-employees" options={{ title: 'Invite Team' }} />
      <Stack.Screen name="completion" options={{ headerShown: false }} />
    </Stack>
  );
}
