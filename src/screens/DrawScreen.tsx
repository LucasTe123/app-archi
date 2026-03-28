import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  SafeAreaView,
  PanResponder,
} from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import DrawingCanvas, { DrawingCanvasRef } from '../components/DrawingCanvas';
import { COLORS } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_HEIGHT = SCREEN_WIDTH * 1.2;

const MIN_SIZE = 2;
const MAX_SIZE = 30;
const SLIDER_HEIGHT = 140;

interface Props {
  route?: { params?: { imageUri?: string } };
  navigation?: any;
}

// Icono SVG: flecha deshacer (curva hacia izquierda)
const UndoIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10h10a6 6 0 0 1 0 12H7"
      stroke={COLORS.textPrimary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 10l4-4M3 10l4 4"
      stroke={COLORS.textPrimary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Icono SVG: flecha rehacer (curva hacia derecha)
const RedoIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10H11a6 6 0 0 0 0 12h6"
      stroke={COLORS.textPrimary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 10l-4-4M21 10l-4 4"
      stroke={COLORS.textPrimary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DrawScreen: React.FC<Props> = ({ route, navigation }) => {
  const imageUri = route?.params?.imageUri;
  const [brushColor, setBrushColor] = useState('#FF3B30');
  const [brushSize, setBrushSize] = useState(7);
  const [canvasKey, setCanvasKey] = useState(0);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const colorOptions = ['#FF3B30', '#FF9500', '#34C759', '#007AFF', '#FFFFFF'];

  const sliderRatio = (brushSize - MIN_SIZE) / (MAX_SIZE - MIN_SIZE);
  const thumbY = SLIDER_HEIGHT * (1 - sliderRatio);

  const sliderPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const y = evt.nativeEvent.locationY;
      const ratio = 1 - Math.max(0, Math.min(1, y / SLIDER_HEIGHT));
      setBrushSize(Math.round(MIN_SIZE + ratio * (MAX_SIZE - MIN_SIZE)));
    },
    onPanResponderMove: (evt) => {
      const y = evt.nativeEvent.locationY;
      const ratio = 1 - Math.max(0, Math.min(1, y / SLIDER_HEIGHT));
      setBrushSize(Math.round(MIN_SIZE + ratio * (MAX_SIZE - MIN_SIZE)));
    },
  });

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.headerBtn}>Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seleccionar zona</Text>
        <TouchableOpacity onPress={() => setCanvasKey((k) => k + 1)}>
          <Text style={[styles.headerBtn, { color: COLORS.error }]}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas — ocupa todo el ancho */}
      <View style={styles.canvasWrapper}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>Sin imagen</Text>
          </View>
        )}

        <View style={StyleSheet.absoluteFill}>
          <DrawingCanvas
            ref={canvasRef}
            key={canvasKey}
            width={SCREEN_WIDTH}
            height={CANVAS_HEIGHT}
            brushColor={brushColor}
            brushSize={brushSize}
          />
        </View>

        {/* Slider flotante sobre la imagen — lado derecho */}
        <View style={styles.sliderFloat} {...sliderPanResponder.panHandlers}>
          {/* Preview del punto arriba */}
          <View style={[styles.dotPreview, {
            width: Math.max(4, brushSize * 0.7),
            height: Math.max(4, brushSize * 0.7),
            borderRadius: 20,
            backgroundColor: brushColor,
          }]} />

          {/* Track */}
          <View style={styles.track} pointerEvents="none">
            <View style={[styles.trackFill, { height: SLIDER_HEIGHT - thumbY }]} />
            <View style={[styles.thumb, { top: thumbY - 11 }]} />
          </View>

          {/* Número abajo */}
          <Text style={styles.sliderNumber}>{brushSize}</Text>
        </View>

      </View>

      {/* Toolbar inferior */}
      <View style={styles.toolbar}>

        {/* Undo / Redo */}
        <View style={styles.undoRedoRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => canvasRef.current?.undo()}
          >
            <UndoIcon />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => canvasRef.current?.redo()}
          >
            <RedoIcon />
          </TouchableOpacity>
        </View>

        {/* Colores */}
        <View style={styles.colorRow}>
          {colorOptions.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setBrushColor(c)}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                brushColor === c && styles.colorDotSelected,
              ]}
            />
          ))}
        </View>

        {/* Confirmar */}
        <TouchableOpacity style={styles.confirmBtn}>
          <Text style={styles.confirmBtnText}>Confirmar selección</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 16, color: COLORS.textPrimary },
  headerBtn: { fontSize: 15, color: COLORS.accent },

  canvasWrapper: {
    width: SCREEN_WIDTH,
    height: CANVAS_HEIGHT,
    overflow: 'hidden',
  },
  image: {
    width: SCREEN_WIDTH,
    height: CANVAS_HEIGHT,
  },
  placeholder: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: COLORS.textFaint },

  // Slider flotante
  sliderFloat: {
    position: 'absolute',
    right: 14,
    top: CANVAS_HEIGHT / 2 - (SLIDER_HEIGHT / 2 + 40),
    width: 36,
    alignItems: 'center',
    gap: 8,
  },
  dotPreview: {
    marginBottom: 4,
  },
  track: {
    width: 4,
    height: SLIDER_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    position: 'relative',
    overflow: 'visible',
  },
  trackFill: {
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
  },
  thumb: {
    position: 'absolute',
    left: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  sliderNumber: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 4,
  },

  // Toolbar
  toolbar: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 14,
  },
  undoRedoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotSelected: {
    borderColor: COLORS.accent,
    transform: [{ scale: 1.15 }],
  },
  confirmBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    color: COLORS.background,
    fontWeight: '600',
  },
});

export default DrawScreen;