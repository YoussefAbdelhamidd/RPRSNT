import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'

const BUBBLE_SIZE = 68
const TRACKER_WIDTH = 440
const TRACKER_HEIGHT = 220
const CALL_CARD_WIDTH = 360
const CALL_CARD_HEIGHT = 280

import type { BreakType } from '../hooks'
import { toDuration, submitCallSheetForm, getLoggedInUsername } from '../utils'

export type TimeTrackerProps = {
  isPunchedIn: boolean
  isOnBreak: boolean
  currentBreakType: BreakType | null
  breakTimeByType: Record<string, number>
  currentBreakSegmentMs?: number
  netWorkDuration: string
  currentBreakDuration: string
  punchedInAt: number | null
  netWorkMs: number
  onPunchIn: () => void
  onPunchOut: () => void
  onStartBreak: (type: BreakType) => void
  onEndBreak: () => void
  onMinimize: () => void
  onExpand: () => void
  isMinimized: boolean
  breakTypeOptions: BreakType[]
}

const floatingCardClass =
  'fixed flex flex-row items-stretch gap-0 bg-[#10233f] text-[#f7fbff] rounded-2xl p-5 shadow-xl z-[35] select-none will-change-[left,top,transform] origin-center min-w-[340px] max-w-[min(540px,calc(100vw-1rem))]'
const actionsColumnClass =
  'flex flex-col justify-center gap-2 shrink-0 pl-5 border-l border-[rgba(223,232,247,0.2)]'
const actionBtnClass =
  'min-w-[108px] min-h-[48px] rounded-xl border border-[rgba(223,232,247,0.2)] py-2.5 px-4 text-base font-bold leading-tight whitespace-nowrap bg-[rgba(223,232,247,0.12)] text-[#f7fbff] disabled:opacity-45 disabled:cursor-not-allowed transition-opacity hover:opacity-95'
const metricsColumnClass =
  'flex flex-col justify-center gap-3 min-w-0 flex-1 pr-5'
const breakDropdownClass =
  'w-full min-w-[120px] rounded-lg border border-[rgba(223,232,247,0.25)] bg-[#10233f] px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#94a8c4] disabled:opacity-60 disabled:cursor-not-allowed [&_option]:bg-[#10233f] [&_option]:text-white'

export function TimeTracker({
  isPunchedIn,
  isOnBreak,
  currentBreakType,
  breakTimeByType,
  currentBreakSegmentMs = 0,
  netWorkDuration,
  currentBreakDuration,
  punchedInAt,
  netWorkMs,
  onPunchIn,
  onPunchOut,
  onStartBreak,
  onEndBreak,
  onMinimize,
  onExpand,
  isMinimized,
  breakTypeOptions,
}: TimeTrackerProps) {
  const [selectedBreakType, setSelectedBreakType] = useState<BreakType>('Ready')
  const [bubblePosition, setBubblePosition] = useState({ x: 24, y: 120 })
  const [trackerPosition, setTrackerPosition] = useState({ x: 24, y: 24 })
  const [trackerTilt, setTrackerTilt] = useState(0)
  const [bubbleTilt, setBubbleTilt] = useState(0)
  const [isDraggingBubble, setIsDraggingBubble] = useState(false)
  const [isDraggingTracker, setIsDraggingTracker] = useState(false)
  const [dragPointerId, setDragPointerId] = useState<number | null>(null)

  const [isCallPopupOpen, setIsCallPopupOpen] = useState(false)
  const [callPosition, setCallPosition] = useState({ x: 80, y: 80 })
  const [callTilt, setCallTilt] = useState(0)
  const [isDraggingCall, setIsDraggingCall] = useState(false)
  const [callAgent, setCallAgent] = useState('')
  const [callCustomerName, setCallCustomerName] = useState('')
  const [callPhone, setCallPhone] = useState('')
  const [callEmail, setCallEmail] = useState('')
  const [callAddress, setCallAddress] = useState('')
  const [callTransfer, setCallTransfer] = useState<'yes' | 'no'>('no')
  const [callPointerId, setCallPointerId] = useState<number | null>(null)

  const bubbleDragOffset = useRef({ x: 0, y: 0 })
  const trackerDragOffset = useRef({ x: 0, y: 0 })
  const bubbleVelocity = useRef({ x: 0, y: 0 })
  const bubbleLastPointer = useRef({ x: 0, y: 0, time: 0 })
  const trackerVelocity = useRef({ x: 0, y: 0 })
  const trackerLastPointer = useRef({ x: 0, y: 0, time: 0 })
  const bubblePhysicsFrame = useRef<number | null>(null)
  const trackerPhysicsFrame = useRef<number | null>(null)
  const bubbleMoved = useRef(false)

  const callDragOffset = useRef({ x: 0, y: 0 })
  const callVelocity = useRef({ x: 0, y: 0 })
  const callLastPointer = useRef({ x: 0, y: 0, time: 0 })
  const callPhysicsFrame = useRef<number | null>(null)

  useEffect(() => {
    const centerX = Math.max(0, (window.innerWidth - TRACKER_WIDTH) / 2)
    const centerY = Math.max(0, (window.innerHeight - TRACKER_HEIGHT) / 2)
    setBubblePosition({
      x: Math.max(16, window.innerWidth - 90),
      y: Math.max(16, window.innerHeight - 120),
    })
    setTrackerPosition({
      x: centerX,
      y: centerY,
    })
  }, [])

  useEffect(() => {
    if ((!isDraggingBubble && !isDraggingTracker) || dragPointerId === null) return

    function onPointerMove(event: PointerEvent) {
      if (event.pointerId !== dragPointerId) return
      if (isDraggingBubble) {
        bubbleMoved.current = true
        const maxX = Math.max(0, window.innerWidth - BUBBLE_SIZE)
        const maxY = Math.max(0, window.innerHeight - BUBBLE_SIZE)
        const nextX = event.clientX - bubbleDragOffset.current.x
        const nextY = event.clientY - bubbleDragOffset.current.y
        const nowTime = performance.now()
        const deltaTime = Math.max(1, nowTime - bubbleLastPointer.current.time)
        bubbleVelocity.current = {
          x: ((event.clientX - bubbleLastPointer.current.x) / deltaTime) * 16,
          y: ((event.clientY - bubbleLastPointer.current.y) / deltaTime) * 16,
        }
        bubbleLastPointer.current = { x: event.clientX, y: event.clientY, time: nowTime }
        setBubblePosition({
          x: Math.min(Math.max(0, nextX), maxX),
          y: Math.min(Math.max(0, nextY), maxY),
        })
        setBubbleTilt(Math.max(-10, Math.min(10, bubbleVelocity.current.x * 0.45)))
      }

      if (isDraggingTracker) {
        const maxX = Math.max(0, window.innerWidth - TRACKER_WIDTH)
        const maxY = Math.max(0, window.innerHeight - TRACKER_HEIGHT)
        const nextX = event.clientX - trackerDragOffset.current.x
        const nextY = event.clientY - trackerDragOffset.current.y
        const nowTime = performance.now()
        const deltaTime = Math.max(1, nowTime - trackerLastPointer.current.time)
        trackerVelocity.current = {
          x: ((event.clientX - trackerLastPointer.current.x) / deltaTime) * 16,
          y: ((event.clientY - trackerLastPointer.current.y) / deltaTime) * 16,
        }
        trackerLastPointer.current = { x: event.clientX, y: event.clientY, time: nowTime }
        setTrackerPosition({
          x: Math.min(Math.max(0, nextX), maxX),
          y: Math.min(Math.max(0, nextY), maxY),
        })
        setTrackerTilt(Math.max(-8, Math.min(8, trackerVelocity.current.x * 0.35)))
      }
    }

    function onPointerUp(event: PointerEvent) {
      if (event.pointerId !== dragPointerId) return
      setIsDraggingBubble(false)
      setIsDraggingTracker(false)
      setDragPointerId(null)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [dragPointerId, isDraggingBubble, isDraggingTracker])

  useEffect(() => {
    if (isDraggingBubble || !isMinimized) return
    const threshold = 0.15
    if (
      Math.abs(bubbleVelocity.current.x) < threshold &&
      Math.abs(bubbleVelocity.current.y) < threshold &&
      Math.abs(bubbleTilt) < 0.1
    ) {
      setBubbleTilt(0)
      return
    }

    function step() {
      setBubblePosition((prev) => {
        let nextX = prev.x + bubbleVelocity.current.x
        let nextY = prev.y + bubbleVelocity.current.y
        const maxX = Math.max(0, window.innerWidth - BUBBLE_SIZE)
        const maxY = Math.max(0, window.innerHeight - BUBBLE_SIZE)

        bubbleVelocity.current.x *= 0.965
        bubbleVelocity.current.y *= 0.965

        if (nextX <= 0 || nextX >= maxX) {
          nextX = Math.min(Math.max(0, nextX), maxX)
          bubbleVelocity.current.x *= -0.74
        }

        if (nextY <= 0 || nextY >= maxY) {
          nextY = Math.min(Math.max(0, nextY), maxY)
          bubbleVelocity.current.y *= -0.74
        }

        return { x: nextX, y: nextY }
      })

      setBubbleTilt((prev) => {
        const next = prev * 0.9 + bubbleVelocity.current.x * 0.18
        return Math.abs(next) < 0.1 ? 0 : next
      })

      if (
        Math.abs(bubbleVelocity.current.x) >= threshold ||
        Math.abs(bubbleVelocity.current.y) >= threshold ||
        Math.abs(bubbleTilt) >= 0.1
      ) {
        bubblePhysicsFrame.current = window.requestAnimationFrame(step)
      } else {
        bubblePhysicsFrame.current = null
      }
    }

    bubblePhysicsFrame.current = window.requestAnimationFrame(step)
    return () => {
      if (bubblePhysicsFrame.current !== null) {
        window.cancelAnimationFrame(bubblePhysicsFrame.current)
        bubblePhysicsFrame.current = null
      }
    }
  }, [bubbleTilt, isDraggingBubble, isMinimized])

  useEffect(() => {
    if (isDraggingTracker || isMinimized) return
    const threshold = 0.15
    if (
      Math.abs(trackerVelocity.current.x) < threshold &&
      Math.abs(trackerVelocity.current.y) < threshold &&
      Math.abs(trackerTilt) < 0.1
    ) {
      setTrackerTilt(0)
      return
    }

    function step() {
      setTrackerPosition((prev) => {
        let nextX = prev.x + trackerVelocity.current.x
        let nextY = prev.y + trackerVelocity.current.y
        const maxX = Math.max(0, window.innerWidth - TRACKER_WIDTH)
        const maxY = Math.max(0, window.innerHeight - TRACKER_HEIGHT)

        trackerVelocity.current.x *= 0.96
        trackerVelocity.current.y *= 0.96

        if (nextX <= 0 || nextX >= maxX) {
          nextX = Math.min(Math.max(0, nextX), maxX)
          trackerVelocity.current.x *= -0.72
        }

        if (nextY <= 0 || nextY >= maxY) {
          nextY = Math.min(Math.max(0, nextY), maxY)
          trackerVelocity.current.y *= -0.72
        }

        return { x: nextX, y: nextY }
      })

      setTrackerTilt((prev) => {
        const next = prev * 0.9 + trackerVelocity.current.x * 0.12
        return Math.abs(next) < 0.1 ? 0 : next
      })

      if (
        Math.abs(trackerVelocity.current.x) >= threshold ||
        Math.abs(trackerVelocity.current.y) >= threshold ||
        Math.abs(trackerTilt) >= 0.1
      ) {
        trackerPhysicsFrame.current = window.requestAnimationFrame(step)
      } else {
        trackerPhysicsFrame.current = null
      }
    }

    trackerPhysicsFrame.current = window.requestAnimationFrame(step)
    return () => {
      if (trackerPhysicsFrame.current !== null) {
        window.cancelAnimationFrame(trackerPhysicsFrame.current)
        trackerPhysicsFrame.current = null
      }
    }
  }, [isDraggingTracker, isMinimized, trackerTilt])

  function handleBubblePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault()
    bubbleMoved.current = false
    if (bubblePhysicsFrame.current !== null) {
      window.cancelAnimationFrame(bubblePhysicsFrame.current)
      bubblePhysicsFrame.current = null
    }
    bubbleVelocity.current = { x: 0, y: 0 }
    bubbleLastPointer.current = { x: event.clientX, y: event.clientY, time: performance.now() }
    bubbleDragOffset.current = {
      x: event.clientX - bubblePosition.x,
      y: event.clientY - bubblePosition.y,
    }
    setDragPointerId(event.pointerId)
    setIsDraggingBubble(true)
  }

  function handleBubbleClick() {
    if (bubbleMoved.current) {
      bubbleMoved.current = false
      return
    }
    onExpand()
  }

  function handleTrackerPointerDown(event: ReactPointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement
    if (target.closest('button, input, textarea, select, label')) return
    event.preventDefault()
    if (trackerPhysicsFrame.current !== null) {
      window.cancelAnimationFrame(trackerPhysicsFrame.current)
      trackerPhysicsFrame.current = null
    }
    trackerVelocity.current = { x: 0, y: 0 }
    trackerLastPointer.current = { x: event.clientX, y: event.clientY, time: performance.now() }
    trackerDragOffset.current = {
      x: event.clientX - trackerPosition.x,
      y: event.clientY - trackerPosition.y,
    }
    setDragPointerId(event.pointerId)
    setIsDraggingTracker(true)
  }

  const statusLabel = isPunchedIn
    ? isOnBreak && currentBreakType
      ? currentBreakType
      : 'Ready'
    : 'Not Punched In'

  function submitDailyReportForm() {
    if (punchedInAt === null) return
    const now = Date.now()
    const msToMinutes = (ms: number) => Math.round(ms / 60_000)
    const d = new Date(punchedInAt)
    const checkInHour = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    const currentSegment = currentBreakType && currentBreakType !== 'Ready' ? currentBreakSegmentMs : 0
    const lunchMs = (breakTimeByType['Lunch'] ?? 0) + (currentBreakType === 'Lunch' ? currentSegment : 0)
    const meetingMs = (breakTimeByType['Team huddle'] ?? 0) + (currentBreakType === 'Team huddle' ? currentSegment : 0)
    const breakMs = (breakTimeByType['Short break'] ?? 0) + (currentBreakType === 'Short break' ? currentSegment : 0)
    const MAX_READY_MINUTES = 8 * 60 // 8 hours max
    submitCallSheetForm({
      agent: getLoggedInUsername(),
      checkInHour,
      totalReadyMinutes: Math.min(msToMinutes(netWorkMs), MAX_READY_MINUTES),
      lunchMinutes: msToMinutes(lunchMs),
      meetingMinutes: msToMinutes(meetingMs),
      breakMinutes: msToMinutes(breakMs),
      totalTimeMinutes: msToMinutes(now - punchedInAt),
    })
  }

  function handleCallPopupPointerDown(event: ReactPointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement
    if (target.closest('button, input, textarea, select, label')) return
    event.preventDefault()
    if (callPhysicsFrame.current !== null) {
      window.cancelAnimationFrame(callPhysicsFrame.current)
      callPhysicsFrame.current = null
    }
    callVelocity.current = { x: 0, y: 0 }
    callLastPointer.current = { x: event.clientX, y: event.clientY, time: performance.now() }
    callDragOffset.current = {
      x: event.clientX - callPosition.x,
      y: event.clientY - callPosition.y,
    }
    setCallPointerId(event.pointerId)
    setIsDraggingCall(true)
  }

  useEffect(() => {
    if (!isDraggingCall || callPointerId === null) return

    function onPointerMove(event: PointerEvent) {
      if (event.pointerId !== callPointerId) return
      const maxX = Math.max(0, window.innerWidth - CALL_CARD_WIDTH)
      const maxY = Math.max(0, window.innerHeight - CALL_CARD_HEIGHT)
      const nextX = event.clientX - callDragOffset.current.x
      const nextY = event.clientY - callDragOffset.current.y
      const nowTime = performance.now()
      const deltaTime = Math.max(1, nowTime - callLastPointer.current.time)
      callVelocity.current = {
        x: ((event.clientX - callLastPointer.current.x) / deltaTime) * 16,
        y: ((event.clientY - callLastPointer.current.y) / deltaTime) * 16,
      }
      callLastPointer.current = { x: event.clientX, y: event.clientY, time: nowTime }
      setCallPosition({
        x: Math.min(Math.max(0, nextX), maxX),
        y: Math.min(Math.max(0, nextY), maxY),
      })
      setCallTilt(Math.max(-6, Math.min(6, callVelocity.current.x * 0.35)))
    }

    function onPointerUp(event: PointerEvent) {
      if (event.pointerId !== callPointerId) return
      setIsDraggingCall(false)
      setCallPointerId(null)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [callPointerId, isDraggingCall])

  useEffect(() => {
    if (isDraggingCall || !isCallPopupOpen) return
    const threshold = 0.15
    if (
      Math.abs(callVelocity.current.x) < threshold &&
      Math.abs(callVelocity.current.y) < threshold &&
      Math.abs(callTilt) < 0.1
    ) {
      setCallTilt(0)
      return
    }

    function step() {
      setCallPosition((prev) => {
        let nextX = prev.x + callVelocity.current.x
        let nextY = prev.y + callVelocity.current.y
        const maxX = Math.max(0, window.innerWidth - CALL_CARD_WIDTH)
        const maxY = Math.max(0, window.innerHeight - CALL_CARD_HEIGHT)

        callVelocity.current.x *= 0.96
        callVelocity.current.y *= 0.96

        if (nextX <= 0 || nextX >= maxX) {
          nextX = Math.min(Math.max(0, nextX), maxX)
          callVelocity.current.x *= -0.72
        }

        if (nextY <= 0 || nextY >= maxY) {
          nextY = Math.min(Math.max(0, nextY), maxY)
          callVelocity.current.y *= -0.72
        }

        return { x: nextX, y: nextY }
      })

      setCallTilt((prev) => {
        const next = prev * 0.9 + callVelocity.current.x * 0.12
        return Math.abs(next) < 0.1 ? 0 : next
      })

      if (
        Math.abs(callVelocity.current.x) >= threshold ||
        Math.abs(callVelocity.current.y) >= threshold ||
        Math.abs(callTilt) >= 0.1
      ) {
        callPhysicsFrame.current = window.requestAnimationFrame(step)
      } else {
        callPhysicsFrame.current = null
      }
    }

    callPhysicsFrame.current = window.requestAnimationFrame(step)
    return () => {
      if (callPhysicsFrame.current !== null) {
        window.cancelAnimationFrame(callPhysicsFrame.current)
        callPhysicsFrame.current = null
      }
    }
  }, [callTilt, isCallPopupOpen, isDraggingCall])

  if (isMinimized) {
    return (
      <button
        type="button"
        className={`fixed w-[68px] h-[68px] rounded-full border-0 bg-[#10233f] text-[#f7fbff] font-bold shadow-lg z-40 cursor-grab will-change-[left,top,transform] origin-center ${
          isDraggingBubble ? 'cursor-grabbing' : ''
        }`}
        style={{
          left: `${bubblePosition.x}px`,
          top: `${bubblePosition.y}px`,
          transform: `rotate(${bubbleTilt}deg)`,
        }}
        onPointerDown={handleBubblePointerDown}
        onClick={handleBubbleClick}
      >
        Open
      </button>
    )
  }

  return (
    <>
      <aside
        className={floatingCardClass}
        style={{
          left: `${trackerPosition.x}px`,
          top: `${trackerPosition.y}px`,
          transform: `rotate(${trackerTilt}deg)`,
        }}
        onPointerDown={handleTrackerPointerDown}
      >
        {/* Column 1: Metrics */}
        <div className={metricsColumnClass}>
          <div>
            <div className="text-[0.7rem] uppercase tracking-wider text-[#94a8c4] font-semibold mb-0.5">Status</div>
            <div className="text-base font-bold text-white">{statusLabel}</div>
          </div>
          <div>
            <div className="text-[0.7rem] uppercase tracking-wider text-[#94a8c4] font-semibold mb-0.5">Work Time</div>
            <div className="text-base font-bold text-white tabular-nums">{netWorkDuration}</div>
          </div>
          <div>
            <div className="text-[0.7rem] uppercase tracking-wider text-[#94a8c4] font-semibold mb-0.5">Break Time</div>
            <div className="text-base font-bold text-white tabular-nums">{currentBreakDuration}</div>
          </div>
          <div className="pt-2 border-t border-[rgba(223,232,247,0.15)]">
            <div className="text-[0.7rem] uppercase tracking-wider text-[#94a8c4] font-semibold mb-1.5">Break time by type</div>
            <div className="flex flex-col gap-0.5 max-h-24 overflow-y-auto">
              {breakTypeOptions
                .filter((type) => type !== 'Ready')
                .map((type) => {
                  const savedMs = breakTimeByType[type] ?? 0
                  const currentSegment = currentBreakType === type ? currentBreakSegmentMs : 0
                  const ms = savedMs + currentSegment
                  return (
                    <div key={type} className="flex justify-between items-baseline gap-2 text-sm">
                      <span className="text-[#c8d8f2] truncate">{type}</span>
                      <span className="text-white font-bold tabular-nums shrink-0">{toDuration(ms)}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
        {/* Column 2: Action buttons (end) */}
        <div className={actionsColumnClass}>
          <button
            type="button"
            className={actionBtnClass}
            onClick={() => setIsCallPopupOpen(true)}
            disabled={!isPunchedIn}
          >
            Call Sheet
          </button>
          <button
            type="button"
            className={`${actionBtnClass} bg-[#b8c7e4]! text-[#10233f]`}
            onClick={onMinimize}
          >
            Minimize
          </button>
          <button type="button" className={actionBtnClass} onClick={onPunchIn} disabled={isPunchedIn}>
            Punch In
          </button>
          <select
            className={breakDropdownClass}
            value={currentBreakType ?? selectedBreakType}
            onChange={(e) => {
              const type = e.target.value as BreakType
              setSelectedBreakType(type)
              onStartBreak(type)
            }}
            disabled={!isPunchedIn}
            aria-label="Aux / break type"
          >
            {breakTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {isOnBreak ? (
            <button
              type="button"
              className={actionBtnClass}
              onClick={() => {
                onEndBreak()
                setSelectedBreakType('Ready')
              }}
            >
              End Break
            </button>
          ) : null}
          <button
            type="button"
            className={actionBtnClass}
            onClick={() => {
              if (isPunchedIn) {
                submitDailyReportForm()
                onPunchOut()
              }
            }}
            disabled={!isPunchedIn}
          >
            Punch Out
          </button>
        </div>
      </aside>

      {isCallPopupOpen && (
        <aside
          className="fixed z-[40] max-w-[420px] rounded-2xl bg-[#0f1b30] text-[#f7fbff] shadow-2xl border border-[rgba(223,232,247,0.2)] p-4 will-change-[left,top,transform] origin-center"
          style={{
            left: `${callPosition.x}px`,
            top: `${callPosition.y}px`,
            transform: `rotate(${callTilt}deg)`,
          }}
          onPointerDown={handleCallPopupPointerDown}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#c8d8f2]">
                Call Sheet
              </h2>
              <p className="text-xs text-[#9fb2d3]">
                Quick details for the current call.
              </p>
            </div>
            <button
              type="button"
              className="rounded-full px-2 py-1 text-xs text-[#c8d8f2] hover:bg-[rgba(223,232,247,0.12)]"
              onClick={() => setIsCallPopupOpen(false)}
            >
              Close
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <label className="block">
              <span className="mb-0.5 block text-[0.7rem] uppercase tracking-wide text-[#9fb2d3]">
                Agent
              </span>
              <input
                type="text"
                value={callAgent}
                onChange={(e) => setCallAgent(e.target.value)}
                className="w-full rounded-lg border border-[rgba(223,232,247,0.25)] bg-[#151f36] px-2.5 py-1.5 text-xs text-[#f7fbff] focus:outline-none focus:ring-2 focus:ring-[#94a8c4]"
                placeholder="Your name"
              />
            </label>

            <div className="grid grid-cols-1 gap-2">
              <label className="block">
                <span className="mb-0.5 block text-[0.7rem] uppercase tracking-wide text-[#9fb2d3]">
                  Customer name
                </span>
                <input
                  type="text"
                  value={callCustomerName}
                  onChange={(e) => setCallCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(223,232,247,0.25)] bg-[#151f36] px-2.5 py-1.5 text-xs text-[#f7fbff] focus:outline-none focus:ring-2 focus:ring-[#94a8c4]"
                  placeholder="Customer name"
                />
              </label>
              <label className="block">
                <span className="mb-0.5 block text-[0.7rem] uppercase tracking-wide text-[#9fb2d3]">
                  Phone
                </span>
                <input
                  type="tel"
                  value={callPhone}
                  onChange={(e) => setCallPhone(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(223,232,247,0.25)] bg-[#151f36] px-2.5 py-1.5 text-xs text-[#f7fbff] focus:outline-none focus:ring-2 focus:ring-[#94a8c4]"
                  placeholder="Phone number"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-0.5 block text-[0.7rem] uppercase tracking-wide text-[#9fb2d3]">
                Customer email
              </span>
              <input
                type="email"
                value={callEmail}
                onChange={(e) => setCallEmail(e.target.value)}
                className="w-full rounded-lg border border-[rgba(223,232,247,0.25)] bg-[#151f36] px-2.5 py-1.5 text-xs text-[#f7fbff] focus:outline-none focus:ring-2 focus:ring-[#94a8c4]"
                placeholder="email@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-0.5 block text-[0.7rem] uppercase tracking-wide text-[#9fb2d3]">
                Customer address
              </span>
              <textarea
                value={callAddress}
                onChange={(e) => setCallAddress(e.target.value)}
                className="w-full rounded-lg border border-[rgba(223,232,247,0.25)] bg-[#151f36] px-2.5 py-1.5 text-xs text-[#f7fbff] focus:outline-none focus:ring-2 focus:ring-[#94a8c4] resize-y min-h-[48px]"
                placeholder="Street, city, state"
                rows={2}
              />
            </label>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[0.7rem] uppercase tracking-wide text-[#9fb2d3]">
                  Transfer
                </span>
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setCallTransfer('yes')}
                    className={`rounded-full px-3 py-1 border text-[0.7rem] ${
                      callTransfer === 'yes'
                        ? 'border-[#7bd3a2] bg-[#1d3a33] text-[#c7f5dd]'
                        : 'border-[rgba(223,232,247,0.25)] bg-[#151f36] text-[#c8d8f2]'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setCallTransfer('no')}
                    className={`rounded-full px-3 py-1 border text-[0.7rem] ${
                      callTransfer === 'no'
                        ? 'border-[#f6b8b8] bg-[#3b1b1b] text-[#ffe1e1]'
                        : 'border-[rgba(223,232,247,0.25)] bg-[#151f36] text-[#c8d8f2]'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-[rgba(223,232,247,0.35)] bg-[#151f36] px-3 py-1.5 text-[0.7rem] font-semibold text-[#f7fbff] hover:bg-[#1b2740]"
                  onClick={() => {
                    setCallAgent('')
                    setCallCustomerName('')
                    setCallPhone('')
                    setCallEmail('')
                    setCallAddress('')
                    setCallTransfer('no')
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#7bd3a2] bg-[#1d3a33] px-4 py-1.5 text-[0.7rem] font-semibold text-[#c7f5dd] hover:bg-[#225040]"
                  onClick={() => {
                    submitDailyReportForm()
                    setIsCallPopupOpen(false)
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  )
}
