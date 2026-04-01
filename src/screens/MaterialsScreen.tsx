import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, radius } from '../theme';
import { useAppStore } from '../store/useAppStore';

export default function MaterialsScreen({ navigation }: any) {
  const { materials, addMaterial } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleAddMaterial = async () => {
    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        addMaterial(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not load image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.label}>STEP 3 OF 4</Text>
        <Text style={styles.title}>Reference materials</Text>
        <Text style={styles.subtitle}>
          Upload images of textures or materials you want to apply.
        </Text>
      </View>

      {/* Grid de materiales */}
      {materials.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>◻</Text>
          <Text style={styles.emptyTitle}>No materials yet</Text>
          <Text style={styles.emptySubtitle}>
            Add at least one reference image to continue.
          </Text>
        </View>
      ) : (
        <FlatList
          data={materials}
          keyExtractor={(_, i) => i.toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.uri }} style={styles.cardImage} />
              <Text style={styles.cardLabel}>Material {index + 1}</Text>
            </View>
          )}
        />
      )}

      {/* Botón agregar */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddMaterial}
        activeOpacity={0.8}
        disabled={loading}
      >
        <Text style={styles.addButtonText}>
          {loading ? 'Loading...' : '+ Add material'}
        </Text>
      </TouchableOpacity>

      {/* Acciones */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonSecondaryText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.buttonPrimary,
            materials.length === 0 && styles.buttonDisabled,
          ]}
          onPress={() => {
            if (materials.length === 0) {
              Alert.alert('Required', 'Add at least one material to continue.');
              return;
            }
            // navigation.navigate('Prompt'); ← próxima pantalla
            Alert.alert('Coming soon', 'Prompt generator — next step!');
          }}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyIcon: {
    fontSize: 40,
    color: colors.textFaint,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.base,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: typography.sm,
    color: colors.textFaint,
    textAlign: 'center',
    maxWidth: 240,
  },
  grid: {
    paddingBottom: spacing.md,
  },
  row: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
  },
  cardLabel: {
    fontSize: typography.xs,
    color: colors.textFaint,
    padding: spacing.sm,
    letterSpacing: 1,
  },
  addButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addButtonText: {
    color: colors.accent,
    fontSize: typography.base,
    fontWeight: '500',
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
  buttonDisabled: {
    opacity: 0.4,
  },
});