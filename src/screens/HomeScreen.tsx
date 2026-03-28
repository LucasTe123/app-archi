// src/screens/HomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors, typography, spacing, radius } from '../theme';

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.label}>AI VISUAL EDITOR</Text>
        <Text style={styles.title}>Transform{'\n'}any space.</Text>
        <Text style={styles.subtitle}>
          Upload a scene, mark what to change,{'\n'}and let AI do the rest.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
  style={styles.button}
  activeOpacity={0.8}
  onPress={() => navigation.navigate('Upload')}
>
  <Text style={styles.buttonText}>Start new project</Text>
</TouchableOpacity>

        <Text style={styles.footerNote}>
          Upload an image to begin
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.xs,
    color: colors.textFaint,
    letterSpacing: 3,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.display,
    color: colors.textPrimary,
    fontWeight: '700',
    lineHeight: 42,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    gap: spacing.sm,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.background,
    fontSize: typography.base,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: typography.sm,
    color: colors.textFaint,
  },
});