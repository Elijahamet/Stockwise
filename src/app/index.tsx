import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/colors';

export default function Index() {
  const { isOnboarded } = useApp();

  useEffect(() => {
    // If user has completed onboarding, go to tabs dashboard, else onboarding welcome
    const timeout = setTimeout(() => {
      if (isOnboarded) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding/welcome');
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [isOnboarded]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.freshGreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepEmerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
