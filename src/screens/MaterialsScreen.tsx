import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, FlatList, Image,
  Alert, Dimensions, PanResponder,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../theme';
import { useAppStore, Material, DrawnPath } from '../store/useAppStore';
import DrawingCanvas, { DrawingCanvasRef } from '../components/DrawingCanvas';

const { width: SW, height: SH } = Dimensions.get('window');
const CANVAS_H = SH * 0.52;

export default function MaterialsScreen({ navigation }: any) {
  const { materials, addMaterial, updateMaterialPaths } = useAppStore();

  // Material activo en el editor
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);
  const [brushSize] = useState(8);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [canvasKey, setCanvasKey] = useState(0);
  const [imgW, setImgW] = useState(SW);
  const [imgH, setImgH] = useState(CANVAS_H);

  const handleAdd = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      addMaterial(result.assets[0].uri);
    }
  };

  const handleEdit = (mat: Material) => {
    setActiveMaterial(mat);
    setCanvasKey((k) => k + 1);
  };

  const handleSave = () => {
    if (!activeMaterial) return;
    const paths = canvasRef.current?.getPaths?.() ?? [];
    updateMaterialPaths(activeMaterial.id, paths);
    setActiveMaterial(null);
  };

  const handleImageLoad = (e: any) => {
    const { width, height } = e.nativeEvent.source;
    const scale = Math.min(SW / width, CANVAS_H / height);
    setImgW(width * scale);
    setImgH(height * scale);
  };

  // Vista: editor de material activo
  if (activeMaterial) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.label}>EDITING</Text>
          <Text style={styles.title}>{activeMaterial.label}</Text>
          <Text style={styles.subtitle}>
            Draw over the areas you want to use.
          </Text>
        </View>

        <View style={styles.canvasContainer}>
          <Image
            source={{ uri: activeMaterial.uri }}
            style={{ width: imgW, height: imgH }}
            resizeMode="contain"
            onLoad={handleImageLoad}
          />
          <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
            <DrawingCanvas
              ref={canvasRef}
              key={canvasKey}
              width={imgW}
              height={imgH}
              brushColor={activeMaterial.assignedColor}
              brushSize={brushSize}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => setActiveMaterial(null)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonSecondaryText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonPrimaryText}>Save zone →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Vista: lista de materiales
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.label}>STEP 2 OF 3</Text>
        <Text style={styles.title}>Reference materials</Text>
        <Text style={styles.subtitle}>
          Add images and mark the zones you want to use.
        </Text>
      </View>

      {materials.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No materials yet</Text>
          <Text style={styles.emptySubtitle}>
            Add at least one reference image to continue.
          </Text>
        </View>
      ) : (
        <FlatList
          data={materials}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.materialCard}
              onPress={() => handleEdit(item)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.uri }} style={styles.materialThumb} />
              <View style={styles.materialInfo}>
                <View style={styles.materialLabelRow}>
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: item.assignedColor },
                    ]}
                  />
                  <Text style={styles.materialLabel}>{item.label}</Text>
                </View>
                <Text style={styles.materialStatus}>
                  {item.paths.length > 0
                    ? `${item.paths.length} zone(s) marked`
                    : 'Tap to mark zones'}
                </Text>
              </View>
              <Text style={styles.editArrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAdd}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+ Add material</Text>
      </TouchableOpacity>

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
              Alert.alert('Required', 'Add at least one material.');
              return;
            }
            navigation.navigate('Editor');
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
  header: { marginBottom: spacing.lg },
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
  subtitle: { fontSize: typography.base, color: colors.textSecondary },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
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
  list: { paddingBottom: spacing.md },
  materialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  materialThumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
  },
  materialInfo: { flex: 1, marginLeft: spacing.md, gap: 4 },
  materialLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  materialLabel: {
    fontSize: typography.base,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  materialStatus: { fontSize: typography.xs, color: colors.textFaint },
  editArrow: { fontSize: 24, color: colors.textFaint, paddingLeft: spacing.sm },
  canvasContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  actions: { flexDirection: 'row', gap: spacing.sm },
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
  buttonDisabled: { opacity: 0.4 },
});