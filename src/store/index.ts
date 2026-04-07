import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ExerciseType =
  | 'clade-classification'
  | 'homology-type'
  | 'character-placement'
  | 'leaf-placement';

export interface Exercise {
  type: ExerciseType;
  question: string;
  correctAnswer: string;
  explanation: string;
  meta?: {
    highlightTaxa?: string[];
    hiddenLeaf?: string;
    cardLabel?: string;
  };
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
  byModule: Partial<Record<string, { correct: number; incorrect: number }>>;
}

export interface ErrorRecord {
  ts: number;
  moduleId: string;
  type: ExerciseType;
  question: string;
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
      'homology-type':        { correct: 0, incorrect: 0 },
      'character-placement':  { correct: 0, incorrect: 0 },
      'leaf-placement':       { correct: 0, incorrect: 0 },
    },
    byModule: {},
  };
}

interface CladexState {
  sessionStats: SessionStats;
  allTimeStats: SessionStats;
  savedTrees: SavedTree[];
  theme: 'dark' | 'light';
  errorLog: ErrorRecord[];

  recordAnswer: (type: ExerciseType, correct: boolean, moduleId: string, question: string) => void;
  resetSession: () => void;
  saveTree: (newick: string, moduleId: string, label: string) => void;
  removeSavedTree: (id: string) => void;
  toggleTheme: () => void;
}

export const useCladexStore = create<CladexState>()(
  persist(
    (set, get) => ({
      sessionStats: emptyStats(),
      allTimeStats: emptyStats(),
      savedTrees: [],
      theme: 'dark',
      errorLog: [],

      recordAnswer: (type, correct, moduleId, question) => {
        const update = (s: SessionStats): SessionStats => ({
          treesAttempted: s.treesAttempted + 1,
          correct: s.correct + (correct ? 1 : 0),
          incorrect: s.incorrect + (correct ? 0 : 1),
          byType: {
            ...s.byType,
            [type]: {
              correct: (s.byType[type]?.correct ?? 0) + (correct ? 1 : 0),
              incorrect: (s.byType[type]?.incorrect ?? 0) + (correct ? 0 : 1),
            },
          },
          byModule: {
            ...(s.byModule ?? {}),
            [moduleId]: {
              correct: (s.byModule?.[moduleId]?.correct ?? 0) + (correct ? 1 : 0),
              incorrect: (s.byModule?.[moduleId]?.incorrect ?? 0) + (correct ? 0 : 1),
            },
          },
        });
        const newError: ErrorRecord | null = correct ? null : {
          ts: Date.now(), moduleId, type, question: question.slice(0, 80),
        };
        set({
          sessionStats: update(get().sessionStats),
          allTimeStats: update(get().allTimeStats),
          errorLog: newError
            ? [newError, ...get().errorLog].slice(0, 100)
            : get().errorLog,
        });
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

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'cladex-storage',
      partialize: (s) => ({
        savedTrees: s.savedTrees,
        allTimeStats: s.allTimeStats,
        theme: s.theme,
        errorLog: s.errorLog,
      }),
    },
  ),
);
