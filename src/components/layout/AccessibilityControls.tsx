import { Contrast } from 'lucide-react'

import { LANGUAGES, type LanguageCode } from '@/context/UiContext'
import { useUi } from '@/hooks/useUi'
import { cn } from '@/utils/cn'

/**
 * `A- A A+`, contrast toggle and language switcher.
 * WCAG 2.1 AA is non-negotiable for this portal, and Ref. 45 mandates
 * English / Tamil / Malayalam / Telugu.
 */
export function AccessibilityControls({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { decreaseFont, resetFont, increaseFont, toggleContrast, highContrast, language, setLanguage } =
    useUi()

  const base =
    tone === 'light'
      ? 'text-white/85 hover:text-white hover:bg-white/10'
      : 'text-grey-600 hover:text-navy-900 hover:bg-grey-100'

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center rounded-md">
        <button type="button" onClick={decreaseFont} aria-label="Decrease text size" className={cn('px-1.5 py-1 text-[13px] rounded-md', base)}>
          A-
        </button>
        <button type="button" onClick={resetFont} aria-label="Reset text size" className={cn('px-1.5 py-1 text-[14px] rounded-md', base)}>
          A
        </button>
        <button type="button" onClick={increaseFont} aria-label="Increase text size" className={cn('px-1.5 py-1 text-[16px] rounded-md', base)}>
          A+
        </button>
      </div>

      <button
        type="button"
        onClick={toggleContrast}
        aria-pressed={highContrast}
        aria-label="Toggle high contrast"
        className={cn('rounded-md p-1.5', base)}
      >
        <Contrast className="size-4" />
      </button>

      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
        aria-label="Select language"
        className={cn(
          'rounded-md border-0 bg-transparent py-1 pr-6 pl-2 text-[13px] focus:ring-2',
          tone === 'light' ? 'text-white/90 focus:ring-white/40' : 'text-grey-700 focus:ring-navy-700/30',
        )}
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code} className="text-navy-900">
            {item.label}
          </option>
        ))}
      </select>
    </div>
  )
}
