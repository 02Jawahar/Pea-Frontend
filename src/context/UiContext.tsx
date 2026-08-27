import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { storage } from '@/utils/storage'

/**
 * Accessibility preferences — 00-README.md makes these non-negotiable:
 * "Font resize (A- A A+) and high-contrast toggle persist across sessions."
 */
const PREFS_KEY = 'pea.a11y'

const FONT_STEPS = [0.9, 1, 1.15, 1.3] as const

export type LanguageCode = 'en' | 'ta' | 'ml' | 'te'

export const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
]

interface Prefs {
  fontStep: number
  highContrast: boolean
  language: LanguageCode
}

export interface UiContextValue extends Prefs {
  increaseFont: () => void
  decreaseFont: () => void
  resetFont: () => void
  toggleContrast: () => void
  setLanguage: (code: LanguageCode) => void
}

export const UiContext = createContext<UiContextValue | undefined>(undefined)

const DEFAULTS: Prefs = { fontStep: 1, highContrast: false, language: 'en' }

export function UiProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => storage.get<Prefs>(PREFS_KEY) ?? DEFAULTS)

  // The root element carries the preferences so CSS in index.css can react.
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--font-scale', String(FONT_STEPS[prefs.fontStep]))
    root.classList.toggle('high-contrast', prefs.highContrast)
    root.lang = prefs.language
    storage.set(PREFS_KEY, prefs)
  }, [prefs])

  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs((previous) => ({ ...previous, ...patch }))
  }, [])

  const value = useMemo<UiContextValue>(
    () => ({
      ...prefs,
      increaseFont: () =>
        setPrefs((p) => ({ ...p, fontStep: Math.min(FONT_STEPS.length - 1, p.fontStep + 1) })),
      decreaseFont: () => setPrefs((p) => ({ ...p, fontStep: Math.max(0, p.fontStep - 1) })),
      resetFont: () => setPrefs((p) => ({ ...p, fontStep: 1 })),
      toggleContrast: () => setPrefs((p) => ({ ...p, highContrast: !p.highContrast })),
      setLanguage: (language: LanguageCode) => update({ language }),
    }),
    [prefs, update],
  )

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}
