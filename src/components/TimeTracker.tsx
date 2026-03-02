import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'

const BUBBLE_SIZE = 68
const TRACKER_WIDTH = 440
const TRACKER_HEIGHT = 220

import type { BreakType } from '../hooks'
import { toDuration } from '../utils'

export type TimeTrackerProps = {
  isPunchedIn: boolean
  isOnBreak: boolean
  currentBreakType: BreakType | null
  breakTimeByType: Record<string, number>
  currentBreakSegmentMs?: number
  netWorkDuration: string
  currentBreakDuration: string
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

  const bubbleDragOffset = useRef({ x: 0, y: 0 })
  const trackerDragOffset = useRef({ x: 0, y: 0 })
  const bubbleVelocity = useRef({ x: 0, y: 0 })
  const bubbleLastPointer = useRef({ x: 0, y: 0, time: 0 })
  const trackerVelocity = useRef({ x: 0, y: 0 })
  const trackerLastPointer = useRef({ x: 0, y: 0, time: 0 })
  const bubblePhysicsFrame = useRef<number | null>(null)
  const trackerPhysicsFrame = useRef<number | null>(null)
  const bubbleMoved = useRef(false)

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
        <button type="button" className={actionBtnClass} onClick={onPunchOut} disabled={!isPunchedIn}>
          Punch Out
        </button>
      </div>
    </aside>
  )
}
