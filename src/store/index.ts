import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ExerciseType =
  | 'clade-classification'
  | 'homology-type'
  | 'character-placement'
  | 'leaf-placement'
  | 'sister-group'
  | 'taxon-drag'
  | 'relative-proximity';

export interface Exercise {
  type: ExerciseType;
  question: string;
  correctAnswer: string;
  explanation: string;
  meta?: {
    highlightTaxa?: string[];
    hiddenLeaf?: string;
    cardLabel?: string;
    hints?: string[];
    /** Dois táxons clicáveis no exercício relative-proximity */
    choiceTaxa?: string[];
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

export interface AnswerRecord {
  ts: number;
  correct: boolean;
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
      'sister-group':         { correct: 0, incorrect: 0 },
      'taxon-drag':           { correct: 0, incorrect: 0 },
      'relative-proximity':   { correct: 0, incorrect: 0 },
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
  answerHistory: AnswerRecord[];
  
  // Tree of Life state
  unlockedCards: string[];

  // Dev tools (apenas em import.meta.env.DEV — não persistido)
  devUnlockAll: boolean;
  toggleDevUnlockAll: () => void;

  recordAnswer: (type: ExerciseType, correct: boolean, moduleId: string, question: string) => void;
  resetSession: () => void;
  saveTree: (newick: string, moduleId: string, label: string) => void;
  removeSavedTree: (id: string) => void;
  toggleTheme: () => void;
  audioMuted: boolean;
  toggleAudioMuted: () => void;
  fxMuted: boolean;
  toggleFxMuted: () => void;

  // Tree of Life actions
  unlockCard: (id: string) => void;
}

export const useCladexStore = create<CladexState>()(
  persist(
    (set, get) => ({
      sessionStats: emptyStats(),
      allTimeStats: emptyStats(),
      savedTrees: [],
      theme: 'dark',
      audioMuted: true, // padrão seguro — o browser bloqueia autoplay
      fxMuted: true,    // usuário habilita explicitamente
      errorLog: [],
      answerHistory: [],
      unlockedCards: [],
      stickyNotes: [],
      devUnlockAll: false,

      recordAnswer: (type, correct, moduleId, question) => {
        const currentAllTime = get().allTimeStats;
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

        const updatedAllTime = update(currentAllTime);
        const newError: ErrorRecord | null = correct ? null : {
          ts: Date.now(), moduleId, type, question: question.slice(0, 80),
        };
        const newRecord: AnswerRecord = { ts: Date.now(), correct };
        
        set({
          sessionStats: update(get().sessionStats),
          allTimeStats: updatedAllTime,
          errorLog: newError
            ? [newError, ...get().errorLog].slice(0, 100)
            : get().errorLog,
          answerHistory: [...get().answerHistory, newRecord].slice(-300),
        });

        // Trigger auto-unlock check (async to avoid blocking)
        import('../data/treeoflife').then(({ TREE_OF_LIFE }) => {
          const newlyUnlocked: string[] = [];
          const currentlyUnlocked = get().unlockedCards;
          
          const traverse = (node: any) => {
            if (node.unlockModule && node.unlockMinCorrect !== undefined) {
              const modStats = updatedAllTime.byModule[node.unlockModule];
              if (modStats && modStats.correct >= node.unlockMinCorrect) {
                if (!currentlyUnlocked.includes(node.id)) {
                  newlyUnlocked.push(node.id);
                }
              }
            }
            node.children?.forEach(traverse);
          };
          
          traverse(TREE_OF_LIFE);
          if (newlyUnlocked.length > 0) {
            set({ unlockedCards: [...currentlyUnlocked, ...newlyUnlocked] });
          }
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

      toggleAudioMuted: () =>
        set((s) => ({ audioMuted: !s.audioMuted })),

      toggleFxMuted: () =>
        set((s) => ({ fxMuted: !s.fxMuted })),

      unlockCard: (id) => set((s) => ({
        unlockedCards: s.unlockedCards.includes(id) ? s.unlockedCards : [...s.unlockedCards, id]
      })),

      toggleDevUnlockAll: () => {
        if (!import.meta.env.DEV) return; // nunca ativa em produção
        set((s) => ({ devUnlockAll: !s.devUnlockAll }));
      },
    }),
    {
      name: 'cladex-storage',
      partialize: (s) => ({
        savedTrees: s.savedTrees,
        allTimeStats: s.allTimeStats,
        theme: s.theme,
        audioMuted: s.audioMuted,
        fxMuted: s.fxMuted,
        errorLog: s.errorLog,
        answerHistory: s.answerHistory,
        unlockedCards: s.unlockedCards,
      }),
    },
  ),
);

