import type { RebuttalItem } from '../types'
import {
  REBUTTAL_STORAGE_KEY,
  ACCESS_SESSION_STORAGE_KEY,
  INITIAL_REBUTTAL_QUESTIONS,
} from '../constants'

export function getInitialRebuttals(): RebuttalItem[] {
  if (typeof window === 'undefined') return INITIAL_REBUTTAL_QUESTIONS
  try {
    const raw = window.localStorage.getItem(REBUTTAL_STORAGE_KEY)
    if (!raw) return INITIAL_REBUTTAL_QUESTIONS
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return INITIAL_REBUTTAL_QUESTIONS
    const cleaned = parsed.filter(
      (item): item is RebuttalItem =>
        typeof item?.id === 'string' &&
        typeof item?.question === 'string' &&
        typeof item?.response === 'string',
    )
    return cleaned.length > 0 ? cleaned : INITIAL_REBUTTAL_QUESTIONS
  } catch {
    return INITIAL_REBUTTAL_QUESTIONS
  }
}

export function hasSavedAccessSession(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(ACCESS_SESSION_STORAGE_KEY) === 'granted'
}

export function saveRebuttals(rebuttals: RebuttalItem[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(REBUTTAL_STORAGE_KEY, JSON.stringify(rebuttals))
}

export function grantAccessSession(): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ACCESS_SESSION_STORAGE_KEY, 'granted')
}

export function revokeAccessSession(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(ACCESS_SESSION_STORAGE_KEY)
}
