// src/screens/UploadScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme';
import { pickImageFromLibrary, pickImageFromCamera } from '../services/imageService';
import { useAppStore } from '../store/useAppStore';

export default function UploadScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const { mainImage, setMainImage } = useAppStore();

  async function handlePickLibrary() {
    setLoading(true);
    const image = await pickImageFromLibrary();
    setLoading(false);
    if (image) setMainImage(image);
    else Alert.alert('No image selected');
  }

  async function handlePickCamera() {
    setLoading(true);
    const image = await pickImageFromCamera();
    setLoading(false);
    if (image) setMainImage(image);
    else Alert.alert('Permission denied or cancelled');
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.label}>STEP 1 OF 4</Text>
        <Text style={styles.title}>Main scene</Text>
        <Text style={styles.subtitle}>Upload the image you want to edit.</Text>
      </View>

      {/* Preview de imagen */}
      <View style={styles.previewArea}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} />
        ) : mainImage ? (
          <Image
            source={{ uri: mainImage.uri }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      {/* Botones */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={handlePickLibrary}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonPrimaryText}>Choose from library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={handlePickCamera}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonSecondaryText}>Take a photo</Text>
        </TouchableOpacity>

        {mainImage && (
          <TouchableOpacity
            style={styles.buttonAccent}
            onPress={() => navigation.navigate('DrawMask')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonPrimaryText}>Continue →</Text>
          </TouchableOpacity>
        )}
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
    fontSize: typography.xxl,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  previewArea: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.soft,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: typography.sm,
    color: colors.textFaint,
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
  buttonPrimary: {
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
  buttonAccent: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});