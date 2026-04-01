import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, typography, spacing } from '../theme';

export default function EditorScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>STEP 3 OF 3</Text>
      <Text style={styles.title}>Editor</Text>
      <Text style={styles.subtitle}>Coming next — paint materials on main image.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
  },
  label: { fontSize: typography.xs, color: colors.textFaint, letterSpacing: 3, marginBottom: spacing.sm },
  title: { fontSize: typography.xl, color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { fontSize: typography.base, color: colors.textSecondary },
});