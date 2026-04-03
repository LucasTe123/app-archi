import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  size: number;
}

export interface DrawingCanvasRef {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  getPaths: () => Stroke[];
  // Called by parent with canvas-space coordinates
  handleTouchStart: (x: number, y: number) => void;
  handleTouchMove: (x: number, y: number) => void;
  handleTouchEnd: () => void;
}

interface Props {
  width: number;
  height: number;
  brushColor?: string;
  brushSize?: number;
  strokeScale?: number; // passed from parent so strokes look same size at any zoom
  onStrokesChange?: (strokes: Stroke[]) => void;
}

const pointsToPath = (points: Point[]): string => {
  if (points.length < 2) return '';
  const [first, ...rest] = points;
  const d = [`M ${first.x} ${first.y}`];
  rest.forEach((p) => d.push(`L ${p.x} ${p.y}`));
  return d.join(' ');
};

const DrawingCanvas = forwardRef<DrawingCanvasRef, Props>(
  (
    {
      width,
      height,
      brushColor = '#FF3B30',
      brushSize = 4,
      strokeScale = 1,
      onStrokesChange,
    },
    ref
  ) => {
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const redoStack = useRef<Stroke[]>([]);
    const currentStroke = useRef<Point[]>([]);
    const strokesRef = useRef<Stroke[]>([]);

    const updateStrokes = (newStrokes: Stroke[]) => {
      strokesRef.current = newStrokes;
      setStrokes(newStrokes);
      onStrokesChange?.(newStrokes);
    };

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
      getPaths: () => strokesRef.current,

      handleTouchStart: (x: number, y: number) => {
        redoStack.current = [];
        currentStroke.current = [{ x, y }];
      },

      handleTouchMove: (x: number, y: number) => {
        currentStroke.current = [...currentStroke.current, { x, y }];
        setStrokes([
          ...strokesRef.current,
          {
            points: [...currentStroke.current],
            color: brushColor,
            size: brushSize,
          },
        ]);
      },

      handleTouchEnd: () => {
        if (currentStroke.current.length > 0) {
          updateStrokes([
            ...strokesRef.current,
            {
              points: currentStroke.current,
              color: brushColor,
              size: brushSize,
            },
          ]);
          currentStroke.current = [];
        }
      },
    }));

    return (
      // pointerEvents="none" — all touches handled by the parent wrapper
      <View
        style={[styles.container, { width, height }]}
        pointerEvents="none"
      >
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          {strokes.map((stroke, index) => (
            <Path
              key={index}
              d={pointsToPath(stroke.points)}
              stroke={stroke.color}
              strokeWidth={stroke.size / strokeScale}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
        </Svg>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: { backgroundColor: 'transparent' },
});

export default DrawingCanvas;