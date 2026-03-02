import { useState, useEffect, useMemo } from 'react'
import { toDuration } from '../utils'

export type BreakType =
  | 'Coaching'
  | 'Ready'
  | 'Short break'
  | 'Lunch'
  | 'Team huddle'
  | 'Training'

export const BREAK_TYPE_OPTIONS: BreakType[] = [
  'Coaching',
  'Ready',
  'Short break',
  'Lunch',
  'Team huddle',
  'Training',
]

const SESSION_STORAGE_KEY = 'call-assistant-time-tracker-session-v1'

type StoredSession = {
  punchedInAt: number
  breakStartedAt: number | null
  currentBreakType: BreakType | null
  accumulatedBreakMs: number
  breakTimeByType: Record<string, number>
}

function loadSession(): StoredSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object') return null
    const punchedInAt = typeof parsed.punchedInAt === 'number' && Number.isFinite(parsed.punchedInAt)
      ? parsed.punchedInAt
      : null
    if (punchedInAt === null) return null
    const breakStartedAt =
      parsed.breakStartedAt != null && typeof parsed.breakStartedAt === 'number' && Number.isFinite(parsed.breakStartedAt)
        ? parsed.breakStartedAt
        : null
    const currentBreakType =
      typeof parsed.currentBreakType === 'string' && BREAK_TYPE_OPTIONS.includes(parsed.currentBreakType as BreakType)
        ? (parsed.currentBreakType as BreakType)
        : null
    const accumulatedBreakMs =
      typeof parsed.accumulatedBreakMs === 'number' && Number.isFinite(parsed.accumulatedBreakMs)
        ? Math.max(0, parsed.accumulatedBreakMs)
        : 0
    const breakTimeByType: Record<string, number> = {}
    if (parsed.breakTimeByType != null && typeof parsed.breakTimeByType === 'object') {
      for (const [key, value] of Object.entries(parsed.breakTimeByType)) {
        if (typeof key === 'string' && typeof value === 'number' && Number.isFinite(value))
          breakTimeByType[key] = value
      }
    }
    return {
      punchedInAt,
      breakStartedAt,
      currentBreakType,
      accumulatedBreakMs,
      breakTimeByType,
    }
  } catch {
    return null
  }
}

function saveSession(session: StoredSession): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // ignore
  }
}

function clearSession(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export type TimeTrackerState = {
  punchedInAt: number | null
  punchedOutAt: number | null
  breakStartedAt: number | null
  currentBreakType: BreakType | null
  accumulatedBreakMs: number
  breakTimeByType: Record<string, number>
  now: number
}

export type TimeTrackerComputed = {
  isPunchedIn: boolean
  isOnBreak: boolean
  netWorkMs: number
  currentBreakMs: number
  currentBreakSegmentMs: number
  netWorkDuration: string
  currentBreakDuration: string
}

export type TimeTrackerActions = {
  punchIn: () => void
  punchOut: () => void
  startBreak: (type: BreakType) => void
  endBreak: () => void
}

function getInitialState() {
  const session = loadSession()
  if (!session) {
    return {
      punchedInAt: null as number | null,
      punchedOutAt: null as number | null,
      breakStartedAt: null as number | null,
      currentBreakType: null as BreakType | null,
      accumulatedBreakMs: 0,
      breakTimeByType: {} as Record<string, number>,
    }
  }
  return {
    punchedInAt: session.punchedInAt,
    punchedOutAt: null as number | null,
    breakStartedAt: session.breakStartedAt,
    currentBreakType: session.currentBreakType,
    accumulatedBreakMs: session.accumulatedBreakMs,
    breakTimeByType: session.breakTimeByType,
  }
}

export function useTimeTracker(
  onActivity?: (action: string) => void
): TimeTrackerState & TimeTrackerComputed & TimeTrackerActions {
  const [initial] = useState(getInitialState)
  const [punchedInAt, setPunchedInAt] = useState<number | null>(initial.punchedInAt)
  const [punchedOutAt, setPunchedOutAt] = useState<number | null>(initial.punchedOutAt)
  const [breakStartedAt, setBreakStartedAt] = useState<number | null>(initial.breakStartedAt)
  const [currentBreakType, setCurrentBreakType] = useState<BreakType | null>(initial.currentBreakType)
  const [accumulatedBreakMs, setAccumulatedBreakMs] = useState(initial.accumulatedBreakMs)
  const [breakTimeByType, setBreakTimeByType] = useState<Record<string, number>>(initial.breakTimeByType)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (punchedInAt !== null && punchedOutAt === null) {
      saveSession({
        punchedInAt,
        breakStartedAt,
        currentBreakType,
        accumulatedBreakMs,
        breakTimeByType,
      })
    }
  }, [punchedInAt, punchedOutAt, breakStartedAt, currentBreakType, accumulatedBreakMs, breakTimeByType])

  const isPunchedIn = punchedInAt !== null && punchedOutAt === null
  const isOnBreak = breakStartedAt !== null

  const currentBreakMs = useMemo(() => {
    if (breakStartedAt === null) return accumulatedBreakMs
    return accumulatedBreakMs + (now - breakStartedAt)
  }, [accumulatedBreakMs, breakStartedAt, now])

  const currentBreakSegmentMs = breakStartedAt !== null ? now - breakStartedAt : 0

  const grossMs = useMemo(() => {
    if (punchedInAt === null) return 0
    const end = punchedOutAt ?? now
    return Math.max(0, end - punchedInAt)
  }, [now, punchedInAt, punchedOutAt])

  const netWorkMs = Math.max(0, grossMs - currentBreakMs)

  function addCurrentBreakToType() {
    if (breakStartedAt === null || currentBreakType === null) return
    if (currentBreakType === 'Ready') return
    const delta = Date.now() - breakStartedAt
    setBreakTimeByType((prev) => ({
      ...prev,
      [currentBreakType]: (prev[currentBreakType] ?? 0) + delta,
    }))
    setBreakStartedAt(null)
    setCurrentBreakType(null)
  }

  const punchIn = () => {
    const ts = Date.now()
    setPunchedInAt(ts)
    setPunchedOutAt(null)
    setBreakStartedAt(null)
    setCurrentBreakType(null)
    setAccumulatedBreakMs(0)
    onActivity?.('Punched in')
  }

  const punchOut = () => {
    if (!isPunchedIn || punchedInAt === null) return
    const ts = Date.now()
    if (breakStartedAt !== null && currentBreakType !== null && currentBreakType !== 'Ready') {
      const delta = ts - breakStartedAt
      setBreakTimeByType((prev) => ({
        ...prev,
        [currentBreakType]: (prev[currentBreakType] ?? 0) + delta,
      }))
      setAccumulatedBreakMs((prev) => prev + delta)
      setBreakStartedAt(null)
      setCurrentBreakType(null)
      onActivity?.('Ended break (auto on punch out)')
    }
    setPunchedOutAt(ts)
    setBreakTimeByType({})
    clearSession()
    onActivity?.('Punched out')
  }

  const startBreak = (type: BreakType) => {
    if (!isPunchedIn) return
    const ts = Date.now()
    if (type === 'Ready') {
      if (breakStartedAt !== null && currentBreakType !== null && currentBreakType !== 'Ready') {
        const delta = ts - breakStartedAt
        setBreakTimeByType((prev) => ({
          ...prev,
          [currentBreakType]: (prev[currentBreakType] ?? 0) + delta,
        }))
        setAccumulatedBreakMs((prev) => prev + delta)
        onActivity?.(`Ended break: ${currentBreakType}`)
      }
      setBreakStartedAt(null)
      setCurrentBreakType(null)
      return
    }
    if (breakStartedAt !== null && currentBreakType !== null && currentBreakType !== 'Ready') {
      const delta = ts - breakStartedAt
      setBreakTimeByType((prev) => ({
        ...prev,
        [currentBreakType]: (prev[currentBreakType] ?? 0) + delta,
      }))
      setAccumulatedBreakMs((prev) => prev + delta)
      setBreakStartedAt(null)
      setCurrentBreakType(null)
      onActivity?.(`Ended break: ${currentBreakType}`)
    }
    setBreakStartedAt(ts)
    setCurrentBreakType(type)
    onActivity?.(`Started break: ${type}`)
  }

  const endBreak = () => {
    if (!isPunchedIn || breakStartedAt === null) return
    const ts = Date.now()
    const delta = ts - breakStartedAt
    addCurrentBreakToType()
    setAccumulatedBreakMs((prev) => prev + delta)
    onActivity?.('Ended break')
  }

  return {
    punchedInAt,
    punchedOutAt,
    breakStartedAt,
    currentBreakType,
    accumulatedBreakMs,
    breakTimeByType,
    now,
    isPunchedIn,
    isOnBreak,
    netWorkMs,
    currentBreakMs,
    netWorkDuration: toDuration(netWorkMs),
    currentBreakDuration: toDuration(currentBreakMs),
    currentBreakSegmentMs,
    punchIn,
    punchOut,
    startBreak,
    endBreak,
  }
}
