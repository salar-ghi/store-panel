
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ColorState {
  primaryColor: string;
  secondaryColor: string;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
}

export const useColorStore = create<ColorState>()(
  persist(
    (set) => ({
      primaryColor: '#9b87f5', // Default primary (purple)
      secondaryColor: '#7E69AB', // Default secondary (darker purple)
      setPrimaryColor: (color) => set({ primaryColor }),
      setSecondaryColor: (color) => set({ secondaryColor }),
    }),
    {
      name: 'color-store',
    }
  )
);
