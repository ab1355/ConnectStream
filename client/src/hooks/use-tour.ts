import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TourStep {
  id: string;
  title: string;
  content: string;
  targetId: string;
  placement?: "top" | "right" | "bottom" | "left";
}

interface TourStore {
  currentTour: string | null;
  currentStep: number;
  completedTours: string[];
  setCurrentTour: (tourId: string | null) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetTour: () => void;
  markTourComplete: (tourId: string) => void;
  hasTourBeenCompleted: (tourId: string) => boolean;
}

export const useTourStore = create<TourStore>()(
  persist(
    (set, get) => ({
      currentTour: null,
      currentStep: 0,
      completedTours: [],
      setCurrentTour: (tourId) =>
        set({ currentTour: tourId, currentStep: 0 }),
      nextStep: () =>
        set((state) => ({ currentStep: state.currentStep + 1 })),
      previousStep: () =>
        set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
      resetTour: () =>
        set({ currentTour: null, currentStep: 0 }),
      markTourComplete: (tourId) =>
        set((state) => ({
          completedTours: [...state.completedTours, tourId],
          currentTour: null,
          currentStep: 0,
        })),
      hasTourBeenCompleted: (tourId) =>
        get().completedTours.includes(tourId),
    }),
    {
      name: "tour-storage",
    }
  )
);

export const useTour = () => {
  const store = useTourStore();
  
  return {
    ...store,
    startTour: (tourId: string) => {
      if (!store.hasTourBeenCompleted(tourId)) {
        store.setCurrentTour(tourId);
      }
    },
  };
};
