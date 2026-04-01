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
import { useAppStore } from '../store/useAppStore';   // ← LÍNEA NUEVA

export default function DrawMaskScreen({ navigation }: any) {
  const { mainImageUri } = useAppStore();   // ← LÍNEA NUEVA

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.label}>STEP 2 OF 4</Text>
        <Text style={styles.title}>Mark the zone</Text>
        <Text style={styles.subtitle}>
          Draw over the areas you want to modify.
        </Text>
      </View>

      <View style={styles.canvas}>
        <Text style={styles.canvasPlaceholder}>Drawing canvas coming soon</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonSecondaryText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => navigation.navigate('Materials')}// ← CAMBIADO
          activeOpacity={0.8}
        >
          <Text style={styles.buttonPrimaryText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.xs,
    color: colors.textFaint,
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.xl,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  canvas: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  canvasPlaceholder: {
    fontSize: typography.sm,
    color: colors.textFaint,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: colors.background,
    fontSize: typography.base,
    fontWeight: '600',
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonSecondaryText: {
    color: colors.textPrimary,
    fontSize: typography.base,
    fontWeight: '500',
  },
});