import { create } from 'zustand';

export interface DrawnPath {
  points: { x: number; y: number }[];
  color: string;
  size: number;
}

export interface Material {
  id: string;
  uri: string;
  paths: DrawnPath[];       // zonas marcadas encima del material
  assignedColor: string;    // color asignado automáticamente
  label: string;            // "Material 1", "Material 2", etc.
}

// Colores asignados automáticamente a cada material
const MATERIAL_COLORS = [
  '#FF3B30', // rojo
  '#34C759', // verde
  '#007AFF', // azul
  '#FF9500', // naranja
  '#AF52DE', // violeta
  '#FF2D55', // rosa
  '#5AC8FA', // celeste
  '#FFCC00', // amarillo
];

interface AppState {
  mainImageUri: string | null;
  materials: Material[];
  mainImagePaths: { materialId: string; paths: DrawnPath[] }[];

  setMainImage: (uri: string) => void;
  addMaterial: (uri: string) => void;
  updateMaterialPaths: (id: string, paths: DrawnPath[]) => void;
  setMainImagePaths: (materialId: string, paths: DrawnPath[]) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  mainImageUri: null,
  materials: [],
  mainImagePaths: [],

  setMainImage: (uri) => set({ mainImageUri: uri }),

  addMaterial: (uri) => {
    const { materials } = get();
    const index = materials.length;
    const newMaterial: Material = {
      id: `material_${Date.now()}`,
      uri,
      paths: [],
      assignedColor: MATERIAL_COLORS[index % MATERIAL_COLORS.length],
      label: `Material ${index + 1}`,
    };
    set({ materials: [...materials, newMaterial] });
  },

  updateMaterialPaths: (id, paths) =>
    set((state) => ({
      materials: state.materials.map((m) =>
        m.id === id ? { ...m, paths } : m
      ),
    })),

  setMainImagePaths: (materialId, paths) =>
    set((state) => {
      const existing = state.mainImagePaths.filter(
        (p) => p.materialId !== materialId
      );
      return { mainImagePaths: [...existing, { materialId, paths }] };
    }),

  reset: () => set({ mainImageUri: null, materials: [], mainImagePaths: [] }),
}));