import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

export default function SettingsIndex() {
  return <Redirect href="/(tabs)/more" />;
}
