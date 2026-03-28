import React, { useRef, useState } from 'react';
import { View, PanResponder, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
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

const DrawingCanvas: React.FC<Props> = ({
  width,
  height,
  brushColor = '#FF3B30',
  brushSize = 4,
  onStrokesChange,
}) => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStroke = useRef<Point[]>([]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      currentStroke.current = [{ x: locationX, y: locationY }];
    },

    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      currentStroke.current = [
        ...currentStroke.current,
        { x: locationX, y: locationY },
      ];
      // Forzar re-render para ver el trazo en tiempo real
      setStrokes((prev) => {
        const updated = [...prev];
        updated[updated.length] = {
          points: [...currentStroke.current],
          color: brushColor,
        };
        return updated;
      });
    },

    onPanResponderRelease: () => {
      if (currentStroke.current.length > 0) {
        const newStrokes = [
          ...strokes,
          { points: currentStroke.current, color: brushColor },
        ];
        setStrokes(newStrokes);
        onStrokesChange?.(newStrokes);
        currentStroke.current = [];
      }
    },
  });

  const clearCanvas = () => {
    setStrokes([]);
    onStrokesChange?.([]);
  };

  return (
    <View
      style={[styles.container, { width, height }]}
      {...panResponder.panHandlers}
    >
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {strokes.map((stroke, index) => (
          <Path
            key={index}
            d={pointsToPath(stroke.points)}
            stroke={stroke.color}
            strokeWidth={brushSize}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </Svg>
    </View>
  );
};

// Exportamos clearCanvas como ref para poder llamarlo desde afuera
export interface DrawingCanvasRef {
  clear: () => void;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
});

export default DrawingCanvas;