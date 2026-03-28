import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Point { x: number; y: number; }

interface Stroke {
  points: Point[];
  color: string;
  size: number;
}

export interface DrawingCanvasRef {
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

interface Props {
  width: number;
  height: number;
  brushColor?: string;
  brushSize?: number;
  onStrokesChange?: (strokes: Stroke[]) => void;
}

const pointsToPath = (points: Point[]): string => {
  if (points.length < 2) return '';
  const [first, ...rest] = points;
  const d = [`M ${first.x} ${first.y}`];
  rest.forEach((p) => d.push(`L ${p.x} ${p.y}`));
  return d.join(' ');
};

const DrawingCanvas = forwardRef<DrawingCanvasRef, Props>(({
  width,
  height,
  brushColor = '#FF3B30',
  brushSize = 4,
  onStrokesChange,
}, ref) => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const redoStack = useRef<Stroke[]>([]);
  const currentStroke = useRef<Point[]>([]);
  const strokesRef = useRef<Stroke[]>([]);

  // Mantener strokesRef sincronizado
  const updateStrokes = (newStrokes: Stroke[]) => {
    strokesRef.current = newStrokes;
    setStrokes(newStrokes);
    onStrokesChange?.(newStrokes);
  };

  // Exponer undo/redo/clear al padre
  useImperativeHandle(ref, () => ({
    undo: () => {
      if (strokesRef.current.length === 0) return;
      const last = strokesRef.current[strokesRef.current.length - 1];
      redoStack.current.push(last);
      updateStrokes(strokesRef.current.slice(0, -1));
    },
    redo: () => {
      if (redoStack.current.length === 0) return;
      const restored = redoStack.current.pop()!;
      updateStrokes([...strokesRef.current, restored]);
    },
    clear: () => {
      redoStack.current = [];
      updateStrokes([]);
    },
    getPaths: () => strokesRef.current,  // ← esto es lo único que agregás
  }));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      redoStack.current = []; // nuevo trazo borra el redo
      const { locationX, locationY } = evt.nativeEvent;
      currentStroke.current = [{ x: locationX, y: locationY }];
    },

    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      currentStroke.current = [...currentStroke.current, { x: locationX, y: locationY }];
      setStrokes([
        ...strokesRef.current,
        { points: [...currentStroke.current], color: brushColor, size: brushSize },
      ]);
    },

    onPanResponderRelease: () => {
      if (currentStroke.current.length > 0) {
        const newStroke = { points: currentStroke.current, color: brushColor, size: brushSize };
        updateStrokes([...strokesRef.current, newStroke]);
        currentStroke.current = [];
      }
    },
  });

  return (
    <View style={[styles.container, { width, height }]} {...panResponder.panHandlers}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {strokes.map((stroke, index) => (
          <Path
            key={index}
            d={pointsToPath(stroke.points)}
            stroke={stroke.color}
            strokeWidth={stroke.size}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { backgroundColor: 'transparent' },
});

export default DrawingCanvas;