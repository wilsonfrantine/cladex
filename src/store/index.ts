import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ExerciseType = 'clade-classification' | 'mrca' | 'rotation' | 'synapomorphy';

export interface Exercise {
  type: ExerciseType;
  question: string;
  correctAnswer: string;
  explanation: string;
}

export interface Feedback {
  correct: boolean;
  message: string;
  explanation: string;
}

export interface SessionStats {
  treesAttempted: number;
  correct: number;
  incorrect: number;
  byType: Record<ExerciseType, { correct: number; incorrect: number }>;
}

export interface SavedTree {
  id: string;
  newick: string;
  moduleId: string;
  label: string;
  savedAt: number;
}

function emptyStats(): SessionStats {
  return {
    treesAttempted: 0,
    correct: 0,
    incorrect: 0,
    byType: {
      'clade-classification': { correct: 0, incorrect: 0 },
      mrca: { correct: 0, incorrect: 0 },
      rotation: { correct: 0, incorrect: 0 },
      synapomorphy: { correct: 0, incorrect: 0 },
    },
  };
}

interface CladexState {
  sessionStats: SessionStats;
  allTimeStats: SessionStats;
  savedTrees: SavedTree[];

  recordAnswer: (type: ExerciseType, correct: boolean) => void;
  resetSession: () => void;
  saveTree: (newick: string, moduleId: string, label: string) => void;
  removeSavedTree: (id: string) => void;
}

export const useCladexStore = create<CladexState>()(
  persist(
    (set, get) => ({
      sessionStats: emptyStats(),
      allTimeStats: emptyStats(),
      savedTrees: [],

      recordAnswer: (type, correct) => {
        const update = (s: SessionStats): SessionStats => ({
          treesAttempted: s.treesAttempted + 1,
          correct: s.correct + (correct ? 1 : 0),
          incorrect: s.incorrect + (correct ? 0 : 1),
          byType: {
            ...s.byType,
            [type]: {
              correct: s.byType[type].correct + (correct ? 1 : 0),
              incorrect: s.byType[type].incorrect + (correct ? 0 : 1),
            },
          },
        });
        set({ sessionStats: update(get().sessionStats), allTimeStats: update(get().allTimeStats) });
      },

      resetSession: () => set({ sessionStats: emptyStats() }),

      saveTree: (newick, moduleId, label) => {
        const entry: SavedTree = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          newick,
          moduleId,
          label,
          savedAt: Date.now(),
        };
        set((s) => ({ savedTrees: [entry, ...s.savedTrees].slice(0, 50) }));
      },

      removeSavedTree: (id) =>
        set((s) => ({ savedTrees: s.savedTrees.filter((t) => t.id !== id) })),
    }),
    {
      name: 'cladex-storage',
      partialize: (s) => ({
        savedTrees: s.savedTrees,
        allTimeStats: s.allTimeStats,
      }),
    },
  ),
);
