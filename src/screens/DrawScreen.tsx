import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import DrawingCanvas from '../components/DrawingCanvas';
import { COLORS, FONTS } from '../theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_HEIGHT = SCREEN_WIDTH * 1.2;

interface Props {
  route?: { params?: { imageUri?: string } };
  navigation?: any;
}

const DrawScreen: React.FC<Props> = ({ route, navigation }) => {
  const imageUri = route?.params?.imageUri;
  const [brushColor, setBrushColor] = useState('#FF3B30');
  const [canvasKey, setCanvasKey] = useState(0);

  const colorOptions = ['#FF3B30', '#FF9500', '#34C759', '#007AFF', '#FFFFFF'];

  const handleClear = () => {
    setCanvasKey((k) => k + 1); // Re-monta el canvas limpio
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.headerBtn}>Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seleccionar zona</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={[styles.headerBtn, { color: COLORS.error }]}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas sobre imagen */}
      <View style={styles.canvasWrapper}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>Sin imagen</Text>
          </View>
        )}
        <View style={StyleSheet.absoluteFill}>
          <DrawingCanvas
            key={canvasKey}
            width={SCREEN_WIDTH}
            height={CANVAS_HEIGHT}
            brushColor={brushColor}
            brushSize={5}
          />
        </View>
      </View>

      {/* Selector de color */}
      <View style={styles.toolbar}>
        <Text style={styles.toolbarLabel}>Color del trazo:</Text>
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

        <TouchableOpacity style={styles.confirmBtn}>
          <Text style={styles.confirmBtnText}>Confirmar selección</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.text,
  },
  headerBtn: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.accent,
  },
  canvasWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
    overflow: 'hidden',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
  },
  placeholder: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
  },
  toolbar: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  toolbarLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textMuted,
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
    marginTop: 8,
  },
  confirmBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default DrawScreen;