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
import Svg, { Path } from 'react-native-svg';
import DrawingCanvas, { DrawingCanvasRef } from '../components/DrawingCanvas';
import { COLORS } from '../theme';
import { useAppStore } from '../store/useAppStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MIN_SIZE = 2;
const MAX_SIZE = 30;
const SLIDER_HEIGHT = 140;

interface Props {
  route?: { params?: { imageUri?: string } };
  navigation?: any;
}

const UndoIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M3 10h10a6 6 0 0 1 0 12H7" stroke={COLORS.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 10l4-4M3 10l4 4" stroke={COLORS.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const RedoIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10H11a6 6 0 0 0 0 12h6" stroke={COLORS.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 10l-4-4M21 10l-4 4" stroke={COLORS.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PenIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke={COLORS.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const sizeToThumbY = (size: number) =>
  SLIDER_HEIGHT * (1 - (size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE));

const yToSize = (y: number) => {
  const ratio = 1 - Math.max(0, Math.min(1, y / SLIDER_HEIGHT));
  return Math.round(MIN_SIZE + ratio * (MAX_SIZE - MIN_SIZE));
};

const DrawScreen: React.FC<Props> = ({ route, navigation }) => {
  const imageUri = route?.params?.imageUri;
  const setMainImagePaths = useAppStore((s) => s.setMainImagePaths);

  const [brushColor, setBrushColor] = useState('#FF3B30');
  const [sliderVisible, setSliderVisible] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const [canvasHeight, setCanvasHeight] = useState(SCREEN_WIDTH * 1.2);
  const canvasHeightRef = useRef(SCREEN_WIDTH * 1.2);

  const [brushSize, setBrushSize] = useState(7);
  const [sliderThumbY, setSliderThumbY] = useState(sizeToThumbY(7));
  const sliderThumbYRef = useRef(sizeToThumbY(7));
  const sliderStartY = useRef<number>(0);
  const sliderStartThumbY = useRef<number>(sizeToThumbY(7));

  const colorOptions = ['#FF3B30', '#FF9500', '#34C759', '#007AFF', '#FFFFFF'];

  const updateThumb = (y: number) => {
    sliderThumbYRef.current = y;
    setSliderThumbY(y);
  };

  const sliderPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        sliderStartY.current = evt.nativeEvent.pageY;
        sliderStartThumbY.current = sliderThumbYRef.current;
      },
      onPanResponderMove: (evt) => {
        const dy = evt.nativeEvent.pageY - sliderStartY.current;
        const newThumbY = Math.max(0, Math.min(SLIDER_HEIGHT, sliderStartThumbY.current + dy));
        updateThumb(newThumbY);
        setBrushSize(yToSize(newThumbY));
      },
      onPanResponderRelease: (evt) => {
        const dy = evt.nativeEvent.pageY - sliderStartY.current;
        const newThumbY = Math.max(0, Math.min(SLIDER_HEIGHT, sliderStartThumbY.current + dy));
        updateThumb(newThumbY);
        setBrushSize(yToSize(newThumbY));
      },
    })
  ).current;

  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const lastScale = useRef(1);
  const lastDistance = useRef<number | null>(null);
  const lastTranslate = useRef({ x: 0, y: 0 });
  const lastMidpoint = useRef({ x: 0, y: 0 });

  const getDistance = (touches: any[]) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getMidpoint = (touches: any[]) => ({
    x: (touches[0].pageX + touches[1].pageX) / 2,
    y: (touches[0].pageY + touches[1].pageY) / 2,
  });

  const clampTranslate = (tx: number, ty: number, s: number) => {
    const maxX = (SCREEN_WIDTH * (s - 1)) / 2;
    const maxY = (canvasHeightRef.current * (s - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, tx)),
      y: Math.max(-maxY, Math.min(maxY, ty)),
    };
  };

  const zoomPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
      onMoveShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          lastDistance.current = getDistance(touches);
          lastMidpoint.current = getMidpoint(touches);
          lastScale.current = scale;
          lastTranslate.current = { x: translateX, y: translateY };
        }
      },
      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2 && lastDistance.current !== null) {
          const newScale = Math.max(1, Math.min(4,
            lastScale.current * (getDistance(touches) / lastDistance.current)
          ));
          const mid = getMidpoint(touches);
          const rawX = lastTranslate.current.x + (mid.x - lastMidpoint.current.x);
          const rawY = lastTranslate.current.y + (mid.y - lastMidpoint.current.y);
          const clamped = clampTranslate(rawX, rawY, newScale);
          setScale(newScale);
          setTranslateX(clamped.x);
          setTranslateY(clamped.y);
        }
      },
      onPanResponderRelease: () => { lastDistance.current = null; },
    })
  ).current;

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.headerBtn}>Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seleccionar zona</Text>
        <TouchableOpacity onPress={() => {
          setCanvasKey((k) => k + 1);
          setScale(1);
          setTranslateX(0);
          setTranslateY(0);
        }}>
          <Text style={[styles.headerBtn, { color: COLORS.error }]}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[styles.canvasWrapper, { height: canvasHeight }]}
        {...zoomPanResponder.panHandlers}
      >
        <View style={{
          transform: [{ scale }, { translateX }, { translateY }],
          width: SCREEN_WIDTH,
          height: canvasHeight,
        }}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: SCREEN_WIDTH, height: canvasHeight }}
              resizeMode="cover"
              onLoad={(e) => {
                const { width, height } = e.nativeEvent.source;
                const ratio = height / width;
                const h = SCREEN_WIDTH * ratio;
                canvasHeightRef.current = h;
                setCanvasHeight(h);
              }}
            />
          ) : (
            <View style={[{ width: SCREEN_WIDTH, height: canvasHeight }, styles.placeholder]}>
              <Text style={styles.placeholderText}>Sin imagen</Text>
            </View>
          )}
          <View style={StyleSheet.absoluteFill}>
            <DrawingCanvas
              ref={canvasRef}
              key={canvasKey}
              width={SCREEN_WIDTH}
              height={canvasHeight}
              brushColor={brushColor}
              brushSize={brushSize}
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
            <View style={{
              width: Math.max(4, brushSize * 0.65),
              height: Math.max(4, brushSize * 0.65),
              borderRadius: 20,
              backgroundColor: brushColor,
            }} />
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

        <View style={styles.colorRow}>
          {colorOptions.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setBrushColor(c)}
              style={[styles.colorDot, { backgroundColor: c }, brushColor === c && styles.colorDotSelected]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => {
            const paths = canvasRef.current?.getPaths() ?? [];
            setMainImagePaths(paths);
            navigation?.navigate('Materials');
          }}
        >
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
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  placeholder: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: COLORS.textFaint },
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
  sliderLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '600',
  },
  trackContainer: {
    width: 20,
    height: SLIDER_HEIGHT,
    alignItems: 'center',
    overflow: 'visible',
  },
  trackLine: {
    position: 'absolute',
    left: 8,
    top: 0,
    width: 4,
    height: SLIDER_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  trackFill: {
    position: 'absolute',
    left: 8,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#0A0A0A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  toolbar: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 14,
  },
  undoRedoRow: { flexDirection: 'row', gap: 10 },
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
  colorRow: { flexDirection: 'row', gap: 12 },
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