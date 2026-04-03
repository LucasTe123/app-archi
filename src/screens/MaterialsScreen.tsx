import React, { useRef, useState } from 'react';
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
  Dimensions,
  PanResponder,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../theme';
import { useAppStore, Material } from '../store/useAppStore';
import DrawingCanvas, { DrawingCanvasRef } from '../components/DrawingCanvas';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const EDITOR_HEIGHT = SCREEN_HEIGHT * 0.58;
const MIN_SIZE = 2;
const MAX_SIZE = 30;
const SLIDER_HEIGHT = 140;

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val));

// ─── Icons ───────────────────────────────────────────────────────────────────

const UndoIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M3 10h10a6 6 0 0 1 0 12H7" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 10l4-4M3 10l4 4" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const RedoIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10H11a6 6 0 0 0 0 12h6" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 10l-4-4M21 10l-4 4" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PenIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Slider helpers ───────────────────────────────────────────────────────────

const sizeToThumbY = (size: number) =>
  SLIDER_HEIGHT * (1 - (size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE));

const yToSize = (y: number) => {
  const ratio = 1 - Math.max(0, Math.min(1, y / SLIDER_HEIGHT));
  return Math.round(MIN_SIZE + ratio * (MAX_SIZE - MIN_SIZE));
};

// ─── Pinch helpers ───────────────────────────────────────────────────────────

const getTouchDist = (t1: any, t2: any) =>
  Math.sqrt(Math.pow(t1.pageX - t2.pageX, 2) + Math.pow(t1.pageY - t2.pageY, 2));

const getTouchMid = (t1: any, t2: any) => ({
  x: (t1.pageX + t2.pageX) / 2,
  y: (t1.pageY + t2.pageY) / 2,
});

// ─── Color options (highlighter semitransparente) ─────────────────────────────
interface ColorOption {
  color: string;
  opacity: number;
}

const COLOR_OPTIONS: ColorOption[] = [
  { color: '#FFFF00', opacity: 0.45 }, // amarillo highlighter
  { color: '#00CFFF', opacity: 0.45 }, // celeste
  { color: '#FF3B30', opacity: 0.45 }, // rojo
  { color: '#34C759', opacity: 0.45 }, // verde
  { color: '#FF9500', opacity: 0.45 }, // naranja
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function MaterialsScreen({ navigation }: any) {
  const { materials, addMaterial, updateMaterialPaths } = useAppStore();

  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [canvasKey, setCanvasKey] = useState(0);

  // FIX #2: guardamos los paths existentes para pasarlos al canvas al abrir
  const [initialStrokes, setInitialStrokes] = useState<any[]>([]);

  const [selectedColor, setSelectedColor] = useState<ColorOption>(COLOR_OPTIONS[0]);
  const [brushSize, setBrushSize] = useState(7);
  const [sliderVisible, setSliderVisible] = useState(false);
  const [sliderThumbY, setSliderThumbY] = useState(sizeToThumbY(7));
  const sliderThumbYRef = useRef(sizeToThumbY(7));
  const sliderStartY = useRef(0);
  const sliderStartThumbY = useRef(sizeToThumbY(7));

  const [imgW, setImgW] = useState(SCREEN_WIDTH);
  const [imgH, setImgH] = useState(EDITOR_HEIGHT);

  const scaleRef = useRef(1);
  const txRef = useRef(0);
  const tyRef = useRef(0);
  const [viewTransform, setViewTransform] = useState({ scale: 1, tx: 0, ty: 0 });

  const commitTransform = () =>
    setViewTransform({ scale: scaleRef.current, tx: txRef.current, ty: tyRef.current });

  const clampTranslation = (tx: number, ty: number, s: number) => {
    const maxTx = (imgW * (s - 1)) / 2;
    const maxTy = (imgH * (s - 1)) / 2;
    return { tx: clamp(tx, -maxTx, maxTx), ty: clamp(ty, -maxTy, maxTy) };
  };

  const isPinching = useRef(false);
  const lastPinchDist = useRef(0);
  const lastPinchMid = useRef({ x: 0, y: 0 });
  const wrapperLayout = useRef({ x: 0, y: 0 });

  const screenToCanvas = (pageX: number, pageY: number) => {
    const localX = pageX - wrapperLayout.current.x;
    const localY = pageY - wrapperLayout.current.y;
    const cx = imgW / 2;
    const cy = imgH / 2;
    const canvasX = (localX - cx - txRef.current) / scaleRef.current + cx;
    const canvasY = (localY - cy - tyRef.current) / scaleRef.current + cy;
    return { x: canvasX, y: canvasY };
  };

  const canvasPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length >= 2) {
          isPinching.current = true;
          lastPinchDist.current = getTouchDist(touches[0], touches[1]);
          lastPinchMid.current = getTouchMid(touches[0], touches[1]);
          canvasRef.current?.handleTouchEnd();
        } else {
          isPinching.current = false;
          const t = touches[0] ?? evt.nativeEvent;
          const pt = screenToCanvas(t.pageX, t.pageY);
          canvasRef.current?.handleTouchStart(pt.x, pt.y);
        }
      },

      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length >= 2) {
          if (!isPinching.current) {
            isPinching.current = true;
            lastPinchDist.current = getTouchDist(touches[0], touches[1]);
            lastPinchMid.current = getTouchMid(touches[0], touches[1]);
            canvasRef.current?.handleTouchEnd();
            return;
          }
          const newDist = getTouchDist(touches[0], touches[1]);
          const newMid = getTouchMid(touches[0], touches[1]);
          const factor = newDist / lastPinchDist.current;
          const newScale = clamp(scaleRef.current * factor, MIN_SCALE, MAX_SCALE);
          const dmx = newMid.x - lastPinchMid.current.x;
          const dmy = newMid.y - lastPinchMid.current.y;
          const { tx, ty } = clampTranslation(txRef.current + dmx, tyRef.current + dmy, newScale);
          scaleRef.current = newScale;
          txRef.current = tx;
          tyRef.current = ty;
          lastPinchDist.current = newDist;
          lastPinchMid.current = newMid;
          commitTransform();
        } else if (!isPinching.current) {
          const t = touches[0] ?? evt.nativeEvent;
          const pt = screenToCanvas(t.pageX, t.pageY);
          canvasRef.current?.handleTouchMove(pt.x, pt.y);
        }
      },

      onPanResponderRelease: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 0) isPinching.current = false;
        if (!isPinching.current) canvasRef.current?.handleTouchEnd();
      },

      onPanResponderTerminate: () => {
        isPinching.current = false;
        canvasRef.current?.handleTouchEnd();
      },
    })
  ).current;

  const sliderPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt) => {
        sliderStartY.current = evt.nativeEvent.pageY;
        sliderStartThumbY.current = sliderThumbYRef.current;
      },
      onPanResponderMove: (evt) => {
        const dy = evt.nativeEvent.pageY - sliderStartY.current;
        const newY = Math.max(0, Math.min(SLIDER_HEIGHT, sliderStartThumbY.current + dy));
        sliderThumbYRef.current = newY;
        setSliderThumbY(newY);
        setBrushSize(yToSize(newY));
      },
      onPanResponderRelease: (evt) => {
        const dy = evt.nativeEvent.pageY - sliderStartY.current;
        const newY = Math.max(0, Math.min(SLIDER_HEIGHT, sliderStartThumbY.current + dy));
        sliderThumbYRef.current = newY;
        setSliderThumbY(newY);
        setBrushSize(yToSize(newY));
      },
    })
  ).current;

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleAdd = () => {
    Alert.alert('Agregar material', 'Elige cómo quieres cargar el material', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Tomar foto', onPress: pickFromCamera },
      { text: 'Elegir de biblioteca', onPress: pickFromLibrary },
    ]);
  };

  const pickFromLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso requerido', 'Necesitas dar acceso a la galería.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.[0]) addMaterial(result.assets[0].uri);
    } catch {
      Alert.alert('Error', 'No se pudo abrir la galería.');
    }
  };

  const pickFromCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso requerido', 'Necesitas dar acceso a la cámara.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
        cameraType: ImagePicker.CameraType.back,
      });
      if (!result.canceled && result.assets?.[0]) addMaterial(result.assets[0].uri);
    } catch {
      Alert.alert('Error', 'No se pudo abrir la cámara.');
    }
  };

  const handleEdit = (mat: Material) => {
    // FIX #2: cargamos los paths guardados antes de montar el canvas
    setInitialStrokes(mat.paths ?? []);
    setActiveMaterial(mat);
    setSelectedColor(COLOR_OPTIONS[0]);
    setBrushSize(7);
    setSliderThumbY(sizeToThumbY(7));
    sliderThumbYRef.current = sizeToThumbY(7);
    scaleRef.current = 1;
    txRef.current = 0;
    tyRef.current = 0;
    setViewTransform({ scale: 1, tx: 0, ty: 0 });
    // key +1 para re-montar el canvas con los nuevos initialStrokes
    setCanvasKey((k) => k + 1);
  };

  const handleSave = () => {
    if (!activeMaterial) return;
    const paths = canvasRef.current?.getPaths() ?? [];
    updateMaterialPaths(activeMaterial.id, paths);
    setActiveMaterial(null);
  };

  const handleImageLoad = (e: any) => {
    const { width, height } = e.nativeEvent.source;
    const fitScale = Math.min(SCREEN_WIDTH / width, EDITOR_HEIGHT / height);
    setImgW(width * fitScale);
    setImgH(height * fitScale);
  };

  // ─── Editor view ──────────────────────────────────────────────────────────

  if (activeMaterial) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <Text style={styles.label}>EDITING</Text>
          <Text style={styles.title}>{activeMaterial.label}</Text>
          <Text style={styles.subtitle}>Pinch to zoom · Draw to mark zones.</Text>
        </View>

        <View
          style={styles.canvasWrapper}
          onLayout={(e) => {
            e.target.measure((_x, _y, _w, _h, pageX, pageY) => {
              wrapperLayout.current = { x: pageX, y: pageY };
            });
          }}
          {...canvasPanResponder.panHandlers}
        >
          <View
            style={[
              styles.imageContainer,
              {
                width: imgW,
                height: imgH,
                left: (SCREEN_WIDTH - imgW) / 2,
                top: (EDITOR_HEIGHT - imgH) / 2,
                transform: [
                  { translateX: viewTransform.tx },
                  { translateY: viewTransform.ty },
                  { scale: viewTransform.scale },
                ],
              },
            ]}
            pointerEvents="none"
          >
            <Image
              source={{ uri: activeMaterial.uri }}
              style={{ width: imgW, height: imgH }}
              resizeMode="cover"
              onLoad={handleImageLoad}
            />

            <View style={StyleSheet.absoluteFill}>
              {/* FIX #2: initialStrokes carga las zonas ya guardadas */}
              <DrawingCanvas
                ref={canvasRef}
                key={canvasKey}
                width={imgW}
                height={imgH}
                brushColor={selectedColor.color}
                brushOpacity={selectedColor.opacity}
                brushSize={brushSize}
                strokeScale={viewTransform.scale}
                initialStrokes={initialStrokes}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.sliderToggleBtn}
            onPress={() => setSliderVisible((v) => !v)}
          >
            <PenIcon />
          </TouchableOpacity>

          {sliderVisible && (
            <View style={styles.sliderPanel}>
              <Text style={styles.sliderLabel}>{brushSize}</Text>
              <View style={styles.trackContainer} {...sliderPanResponder.panHandlers}>
                <View style={styles.trackLine} />
                <View style={[styles.trackFill, { height: SLIDER_HEIGHT - sliderThumbY }]} />
                <View style={[styles.thumb, { top: sliderThumbY - 10 }]} />
              </View>
              {/* Preview del color con su opacidad real */}
              <View
                style={{
                  width: Math.max(4, brushSize * 0.65),
                  height: Math.max(4, brushSize * 0.65),
                  borderRadius: 20,
                  backgroundColor: selectedColor.color,
                  opacity: selectedColor.opacity,
                }}
              />
            </View>
          )}
        </View>

        <View style={styles.toolbar}>
          <View style={styles.undoRedoRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => canvasRef.current?.undo()}>
              <UndoIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => canvasRef.current?.redo()}>
              <RedoIcon />
            </TouchableOpacity>
          </View>

          {/* FIX #1: colores tipo highlighter semitransparentes */}
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.color}
                onPress={() => setSelectedColor(opt)}
                style={[
                  styles.colorDotPicker,
                  {
                    backgroundColor: opt.color,
                    opacity: selectedColor.color === opt.color ? 1 : 0.4,
                  },
                  selectedColor.color === opt.color && styles.colorDotSelected,
                ]}
              />
            ))}
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
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.buttonPrimaryText}>Save zone →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Materials list view ──────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.label}>STEP 2 OF 3</Text>
        <Text style={styles.title}>Reference materials</Text>
        <Text style={styles.subtitle}>Add images and mark the zones you want to use.</Text>
      </View>

      {materials.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No materials yet</Text>
          <Text style={styles.emptySubtitle}>Add at least one reference image to continue.</Text>
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
                  <View style={[styles.colorDot, { backgroundColor: item.assignedColor }]} />
                  <Text style={styles.materialLabel}>{item.label}</Text>
                </View>
                <Text style={styles.materialStatus}>
                  {item.paths.length > 0 ? `${item.paths.length} zone(s) marked` : 'Tap to mark zones'}
                </Text>
              </View>
              <Text style={styles.editArrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAdd} activeOpacity={0.8}>
        <Text style={styles.addButtonText}>+ Add material</Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.buttonSecondaryText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonPrimary, materials.length === 0 && styles.buttonDisabled]}
          onPress={() => {
            if (materials.length === 0) { Alert.alert('Required', 'Add at least one material.'); return; }
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: { marginBottom: spacing.lg },
  label: { fontSize: typography.xs, color: colors.textFaint, letterSpacing: 3, marginBottom: spacing.sm },
  title: { fontSize: typography.xl, color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { fontSize: typography.base, color: colors.textSecondary },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  emptyTitle: { fontSize: typography.base, color: colors.textPrimary, fontWeight: '600' },
  emptySubtitle: { fontSize: typography.sm, color: colors.textFaint, textAlign: 'center', maxWidth: 240 },
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
  materialThumb: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.surfaceElevated },
  materialInfo: { flex: 1, marginLeft: spacing.md, gap: 4 },
  materialLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  materialLabel: { fontSize: typography.base, color: colors.textPrimary, fontWeight: '600' },
  materialStatus: { fontSize: typography.xs, color: colors.textFaint },
  editArrow: { fontSize: 24, color: colors.textFaint, paddingLeft: spacing.sm },
  canvasWrapper: {
    width: SCREEN_WIDTH,
    height: EDITOR_HEIGHT,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  imageContainer: { position: 'absolute' },
  sliderToggleBtn: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(20,20,20,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderPanel: {
    position: 'absolute',
    right: 14,
    bottom: 66,
    width: 44,
    backgroundColor: 'rgba(15,15,15,0.92)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    alignItems: 'center',
    gap: 10,
  },
  sliderLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600' },
  trackContainer: { width: 20, height: SLIDER_HEIGHT, alignItems: 'center', overflow: 'visible' },
  trackLine: {
    position: 'absolute', left: 8, top: 0, width: 4, height: SLIDER_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2,
  },
  trackFill: {
    position: 'absolute', left: 8, bottom: 0, width: 4,
    backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 2,
  },
  thumb: {
    position: 'absolute', left: 0, width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#FFFFFF', borderWidth: 2.5, borderColor: '#0A0A0A',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5, shadowRadius: 4, elevation: 6,
  },
  toolbar: { paddingTop: 14, gap: 14 },
  undoRedoRow: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  colorRow: { flexDirection: 'row', gap: 12 },
  colorDotPicker: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  colorDotSelected: { borderColor: colors.accent, transform: [{ scale: 1.15 }] },
  addButton: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
    borderRadius: radius.md, paddingVertical: spacing.md,
    alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.lg,
  },
  addButtonText: { color: colors.accent, fontSize: typography.base, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  buttonPrimary: {
    flex: 1, backgroundColor: colors.accent,
    paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center',
  },
  buttonPrimaryText: { color: colors.background, fontSize: typography.base, fontWeight: '600' },
  buttonSecondary: {
    flex: 1, backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.md, borderRadius: radius.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  buttonSecondaryText: { color: colors.textPrimary, fontSize: typography.base, fontWeight: '500' },
  buttonDisabled: { opacity: 0.4 },
});