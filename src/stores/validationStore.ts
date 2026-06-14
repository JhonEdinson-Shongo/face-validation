import { create } from 'zustand'
import type { AppView, Combination } from '../types'

type Theme = 'dark' | 'light'

export const CAPTURE_COUNTDOWN_SECONDS = 3

interface ValidationState {
  theme: Theme
  setTheme: (theme: Theme) => void
  view: AppView
  combination: Combination | null
  enabled: boolean
  capturing: boolean
  done: boolean
  photos: string[]
  currentStep: number
  stepStartTime: number
  completedSteps: number[]
  countdown: number | null

  setView: (view: AppView) => void
  setCombination: (combo: Combination | null) => void
  setEnabled: (enabled: boolean) => void
  setCapturing: (capturing: boolean) => void
  setDone: (done: boolean) => void
  addPhoto: (dataUrl: string) => void
  resetPhotos: () => void
  setCurrentStep: (step: number) => void
  setStepStartTime: (time: number) => void
  setCompletedSteps: (steps: number[]) => void
  setCountdown: (value: number | null) => void
  startValidation: (combo: Combination) => void
  backToCatalog: () => void
}

function getInitialTheme(): Theme {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export const useStore = create<ValidationState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => set({ theme }),
  view: 'catalog',
  combination: null,
  enabled: false,
  capturing: false,
  done: false,
  photos: [],
  currentStep: -1,
  stepStartTime: 0,
  completedSteps: [],
  countdown: null,

  setView: (view) => set({ view }),
  setCombination: (combination) => set({ combination }),
  setEnabled: (enabled) => set({ enabled }),
  setCapturing: (capturing) => set({ capturing }),
  setDone: (done) => set({ done }),
  addPhoto: (dataUrl) => set((s) => ({ photos: [...s.photos, dataUrl] })),
  resetPhotos: () => set({ photos: [] }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setStepStartTime: (stepStartTime) => set({ stepStartTime }),
  setCompletedSteps: (completedSteps) => set({ completedSteps }),
  setCountdown: (countdown) => set({ countdown }),

  startValidation: (combination) => set({
    view: 'validation',
    combination,
    photos: [],
    capturing: false,
    done: false,
    currentStep: -1,
    stepStartTime: 0,
    completedSteps: [],
    countdown: null,
    enabled: true,
  }),

  backToCatalog: () => set({
    view: 'catalog',
    combination: null,
    photos: [],
    capturing: false,
    done: false,
    currentStep: -1,
    completedSteps: [],
    countdown: null,
    enabled: false,
  }),
}))
