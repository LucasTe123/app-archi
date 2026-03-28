// src/store/useAppStore.ts
import { create } from 'zustand';

export interface ImageAsset {
  uri: string;
  width: number;
  height: number;
}

interface AppState {
  // Imagen principal
  mainImage: ImageAsset | null;
  setMainImage: (image: ImageAsset) => void;
  clearMainImage: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  mainImage: null,
  setMainImage: (image) => set({ mainImage: image }),
  clearMainImage: () => set({ mainImage: null }),
}));