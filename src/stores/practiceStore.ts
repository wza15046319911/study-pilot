import { create } from 'zustand'
import type { Question } from '@/types/database'

interface PracticeState {
  // Current practice session
  questions: Question[]
  currentIndex: number
  answers: Record<number, string> // questionId -> answer
  startTime: number | null
  elapsedTime: number

  // Actions
  setQuestions: (questions: Question[]) => void
  setCurrentIndex: (index: number) => void
  setAnswer: (questionId: number, answer: string) => void
  startTimer: () => void
  updateElapsedTime: (time: number) => void
  resetSession: () => void

  // Computed
  getCurrentQuestion: () => Question | null
  getProgress: () => { completed: number; total: number; percentage: number }
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  answers: {},
  startTime: null,
  elapsedTime: 0,

  setQuestions: (questions) => set({ questions }),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  setAnswer: (questionId, answer) => set((state) => ({
    answers: { ...state.answers, [questionId]: answer }
  })),

  startTimer: () => set({ startTime: Date.now() }),

  updateElapsedTime: (time) => set({ elapsedTime: time }),

  resetSession: () => set({
    questions: [],
    currentIndex: 0,
    answers: {},
    startTime: null,
    elapsedTime: 0
  }),

  getCurrentQuestion: () => {
    const { questions, currentIndex } = get()
    return questions[currentIndex] || null
  },

  getProgress: () => {
    const { questions, answers } = get()
    const completed = Object.keys(answers).length
    const total = questions.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completed, total, percentage }
  }
}))
