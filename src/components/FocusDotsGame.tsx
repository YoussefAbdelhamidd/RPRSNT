import { useState, useCallback } from 'react'

const GAME_WIDTH = 188
const GAME_HEIGHT = 120
const TARGET_SIZE = 26
const PADDING = 10

function getRandomTarget() {
  const maxX = GAME_WIDTH - TARGET_SIZE - PADDING
  const maxY = GAME_HEIGHT - TARGET_SIZE - PADDING
  return {
    x: Math.floor(Math.random() * Math.max(1, maxX - PADDING + 1)) + PADDING,
    y: Math.floor(Math.random() * Math.max(1, maxY - PADDING + 1)) + PADDING,
  }
}

export function FocusDotsGame() {
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [target, setTarget] = useState(getRandomTarget)

  const handleHit = useCallback(() => {
    setScore((s) => s + 1)
    setStreak((s) => s + 1)
    setTarget(getRandomTarget())
  }, [])

  const handleMiss = useCallback(() => {
    setStreak(0)
  }, [])

  const handleReset = useCallback(() => {
    setScore(0)
    setStreak(0)
    setTarget(getRandomTarget())
  }, [])

  return (
    <section className="mt-6 p-4 bg-[#f8faff] border border-[#dde5f2] rounded-xl">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="m-0 text-lg">Focus Dots</h2>
          <p className="mt-1.5 text-[#4c5e75] text-sm">
            Quiet click-target for idle moments between call actions.
          </p>
        </div>
        <button
          type="button"
          className="border border-[#c4d2e8] rounded-lg py-1.5 px-2.5 text-[0.82rem] font-semibold bg-[#edf3ff] text-[#0f2a4b]"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
      <div className="flex gap-4 mb-2 text-sm font-semibold text-[#10233f]">
        <span>Score: {score}</span>
        <span>Streak: {streak}</span>
      </div>
      <div
        className="relative w-[188px] h-[120px] bg-[#e8eef9] rounded-lg border border-[#d2d9e6]"
        onClick={handleMiss}
        role="presentation"
      >
        <button
          type="button"
          className="absolute w-[26px] h-[26px] rounded-full bg-[#10233f] border-0 cursor-pointer p-0 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${target.x}px`, top: `${target.y}px` }}
          onClick={(e) => {
            e.stopPropagation()
            handleHit()
          }}
          aria-label="Focus target"
        />
      </div>
    </section>
  )
}
