import { create } from 'zustand';

export interface DrawnPath {
  points: { x: number; y: number }[];
  color: string;
  size: number;
}

interface AppState {
  // Imagen principal
  mainImageUri: string | null;
  mainImagePaths: DrawnPath[];

  // Materiales
  materials: {
    uri: string;
    paths: DrawnPath[];
  }[];

  // Actions
  setMainImage: (uri: string) => void;
  setMainImagePaths: (paths: DrawnPath[]) => void;
  addMaterial: (uri: string) => void;
  setMaterialPaths: (index: number, paths: DrawnPath[]) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  mainImageUri: null,
  mainImagePaths: [],
  materials: [],

  setMainImage: (uri) => set({ mainImageUri: uri }),
  setMainImagePaths: (paths) => set({ mainImagePaths: paths }),
  addMaterial: (uri) =>
    set((state) => ({
      materials: [...state.materials, { uri, paths: [] }],
    })),
  setMaterialPaths: (index, paths) =>
    set((state) => {
      const updated = [...state.materials];
      updated[index] = { ...updated[index], paths };
      return { materials: updated };
    }),
  reset: () =>
    set({ mainImageUri: null, mainImagePaths: [], materials: [] }),
}));