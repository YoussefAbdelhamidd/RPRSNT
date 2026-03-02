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

const AUX_TIME_STORAGE_KEY = 'call-assistant-aux-time-by-type-v1'

function getInitialBreakTimeByType(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(AUX_TIME_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object') return {}
    const out: Record<string, number> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof key === 'string' && typeof value === 'number' && Number.isFinite(value))
        out[key] = value
    }
    return out
  } catch {
    return {}
  }
}

function saveBreakTimeByType(data: Record<string, number>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(AUX_TIME_STORAGE_KEY, JSON.stringify(data))
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

export function useTimeTracker(
  onActivity?: (action: string) => void
): TimeTrackerState & TimeTrackerComputed & TimeTrackerActions {
  const [punchedInAt, setPunchedInAt] = useState<number | null>(null)
  const [punchedOutAt, setPunchedOutAt] = useState<number | null>(null)
  const [breakStartedAt, setBreakStartedAt] = useState<number | null>(null)
  const [currentBreakType, setCurrentBreakType] = useState<BreakType | null>(null)
  const [accumulatedBreakMs, setAccumulatedBreakMs] = useState(0)
  const [breakTimeByType, setBreakTimeByType] = useState<Record<string, number>>(getInitialBreakTimeByType)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    saveBreakTimeByType(breakTimeByType)
  }, [breakTimeByType])

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
