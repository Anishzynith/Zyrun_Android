// app/index.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../service/auth';
import { Colors, Typography, Spacing } from '../constants/theme';

export default function SplashScreen() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (user) {
          router.replace('/(app)/dashboard');
        } else {
          router.replace('/(auth)/login');
        }
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isLoading, user]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>HRMS</Text>
      <Text style={styles.subtitle}>Manage your workforce</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    ...Typography.h1,
    color: Colors.primary,
    fontSize: 48,
    fontWeight: 'bold',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
});