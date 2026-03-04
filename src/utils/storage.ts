import type { RebuttalItem, DailyScheduleItem, WorkingDayItem, ChecklistItem } from '../types'
import {
  REBUTTAL_STORAGE_KEY,
  ACCESS_SESSION_STORAGE_KEY,
  LOGGED_IN_USERNAME_STORAGE_KEY,
  INITIAL_REBUTTAL_QUESTIONS,
  DAILY_SCHEDULE_STORAGE_KEY,
  WORKING_DAYS_STORAGE_KEY,
  CHECKLIST_STORAGE_KEY,
  INITIAL_DAILY_SCHEDULE,
  INITIAL_WORKING_DAYS,
  INITIAL_CHECKLIST_ITEMS,
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
  window.localStorage.removeItem(LOGGED_IN_USERNAME_STORAGE_KEY)
}

export function saveLoggedInUsername(username: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOGGED_IN_USERNAME_STORAGE_KEY, username)
}

export function getLoggedInUsername(): string {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(LOGGED_IN_USERNAME_STORAGE_KEY) ?? ''
}

export function getDailySchedule(): DailyScheduleItem[] {
  if (typeof window === 'undefined') return INITIAL_DAILY_SCHEDULE
  try {
    const raw = window.localStorage.getItem(DAILY_SCHEDULE_STORAGE_KEY)
    if (!raw) return INITIAL_DAILY_SCHEDULE
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return INITIAL_DAILY_SCHEDULE
    const cleaned: DailyScheduleItem[] = []
    for (const item of parsed) {
      if (
        typeof item?.id === 'string' &&
        typeof item?.time === 'string' &&
        typeof item?.title === 'string' &&
        typeof item?.type === 'string'
      ) {
        cleaned.push({
          id: item.id,
          time: item.time,
          title: item.title,
          type: item.type,
          contactName: typeof item.contactName === 'string' ? item.contactName : '',
          phone: typeof item.phone === 'string' ? item.phone : '',
          notes: typeof item.notes === 'string' ? item.notes : '',
        })
      }
    }
    return cleaned.length > 0 ? cleaned : INITIAL_DAILY_SCHEDULE
  } catch {
    return INITIAL_DAILY_SCHEDULE
  }
}

export function saveDailySchedule(items: DailyScheduleItem[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DAILY_SCHEDULE_STORAGE_KEY, JSON.stringify(items))
}

export function getWorkingDaysSchedule(): WorkingDayItem[] {
  if (typeof window === 'undefined') return INITIAL_WORKING_DAYS
  try {
    const raw = window.localStorage.getItem(WORKING_DAYS_STORAGE_KEY)
    if (!raw) return INITIAL_WORKING_DAYS
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return INITIAL_WORKING_DAYS
    const cleaned = parsed.filter(
      (item): item is WorkingDayItem =>
        typeof item?.day === 'string' &&
        typeof item?.hasShift === 'boolean' &&
        typeof item?.shiftStartTime === 'string',
    )
    return cleaned.length > 0 ? cleaned : INITIAL_WORKING_DAYS
  } catch {
    return INITIAL_WORKING_DAYS
  }
}

export function saveWorkingDaysSchedule(items: WorkingDayItem[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(WORKING_DAYS_STORAGE_KEY, JSON.stringify(items))
}

export function getChecklist(): ChecklistItem[] {
  if (typeof window === 'undefined') return INITIAL_CHECKLIST_ITEMS
  try {
    const raw = window.localStorage.getItem(CHECKLIST_STORAGE_KEY)
    if (!raw) return INITIAL_CHECKLIST_ITEMS
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return INITIAL_CHECKLIST_ITEMS
    const byId = new Map<string, { checked: boolean; notes: string }>()
    for (const item of parsed) {
      if (typeof item?.id === 'string' && typeof item?.checked === 'boolean') {
        byId.set(item.id, {
          checked: item.checked,
          notes: typeof item.notes === 'string' ? item.notes : '',
        })
      }
    }
    return INITIAL_CHECKLIST_ITEMS.map((def) => {
      const stored = byId.get(def.id)
      return stored
        ? { ...def, checked: stored.checked, notes: stored.notes }
        : { ...def, notes: def.notes ?? '' }
    })
  } catch {
    return INITIAL_CHECKLIST_ITEMS
  }
}

export function saveChecklist(items: ChecklistItem[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(items))
}
