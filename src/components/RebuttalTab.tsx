import { useEffect, useRef, useState } from 'react'
import type { RebuttalItem } from '../types'

export type RebuttalTabProps = {
  rebuttals: RebuttalItem[]
  selectedId: string
  onSelect: (id: string) => void
  onReorder: (reordered: RebuttalItem[]) => void
  onAdd: () => void
  onUpdateQuestion: (question: string) => void
  onUpdateResponse: (response: string) => void
  onActivity?: (message: string) => void
}

function DragHandle({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#7a8fa8]">
        <circle cx="9" cy="6" r="1.5" />
        <circle cx="15" cy="6" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="18" r="1.5" />
        <circle cx="15" cy="18" r="1.5" />
      </svg>
    </span>
  )
}

export function RebuttalTab({
  rebuttals,
  selectedId,
  onSelect,
  onReorder,
  onAdd,
  onUpdateQuestion,
  onUpdateResponse,
  onActivity,
}: RebuttalTabProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = rebuttals.find((item) => item.id === selectedId) ?? null

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (item: RebuttalItem) => {
    onSelect(item.id)
    onActivity?.(`Selected rebuttal: "${item.question}"`)
    setIsOpen(false)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.setData('application/json', JSON.stringify(rebuttals[index]))
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIndex !== null && draggedIndex !== index) setDropTargetIndex(index)
  }

  const handleDragLeave = () => {
    setDropTargetIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const fromIndex = draggedIndex
    setDraggedIndex(null)
    setDropTargetIndex(null)
    if (fromIndex === null || fromIndex === dropIndex) return
    const newOrder = [...rebuttals]
    const [removed] = newOrder.splice(fromIndex, 1)
    newOrder.splice(dropIndex, 0, removed)
    onReorder(newOrder)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDropTargetIndex(null)
  }

  return (
    <div className="grid gap-3 mt-4">
      <div className="grid gap-2 font-semibold bg-[#f8faff] border border-[#dde5f2] rounded-xl p-4">
        <span className="text-[#0e1a2b] text-base">Select Rebuttal</span>
        <p className="text-sm text-[#5f7087] font-normal -mt-0.5">
          Drag the grip to reorder; put ones you use most at the top.
        </p>
        <div className="relative" ref={containerRef}>
          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-3 rounded-xl border-2 border-[#cad7ea] bg-white px-5 py-4 text-left shadow-sm transition-colors hover:border-[#a8bdd9] hover:bg-[#fafbff] focus:outline-none focus:ring-2 focus:ring-[#10233f]/20 focus:ring-offset-2"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label="Choose a rebuttal"
          >
            <span className="text-[#0e1a2b] text-base font-medium leading-snug line-clamp-2 min-w-0">
              {selected ? selected.question : 'Select a rebuttal…'}
            </span>
            <span
              className={`shrink-0 text-[#5f7087] transition-transform ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-20 bg-black/30"
                aria-hidden
                onClick={() => setIsOpen(false)}
              />
              <ul
                className="fixed left-1/2 top-1/2 z-30 w-[90vw] max-w-[90vw] h-[90vh] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border-2 border-[#dde5f2] bg-white py-4 shadow-2xl"
                role="listbox"
                aria-label="Rebuttal list"
              >
              {rebuttals.map((item, index) => {
                const isSelected = item.id === selectedId
                const isDragging = draggedIndex === index
                const isDropTarget = dropTargetIndex === index
                return (
                  <li
                    key={item.id}
                    role="option"
                    aria-selected={isSelected}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`group flex items-stretch gap-0 rounded-lg border-2 transition-colors ${
                      isDragging ? 'opacity-50 border-[#10233f] bg-[#e2ebfa]' : ''
                    } ${isDropTarget ? 'border-[#10233f] bg-[#edf3ff]' : 'border-transparent'}`}
                  >
                    <span
                      className="flex cursor-grab touch-none flex-shrink-0 items-center justify-center self-stretch py-3 pl-3 text-[#7a8fa8] hover:bg-[#e8eef9] active:cursor-grabbing rounded-l-md"
                      onPointerDown={(e) => e.stopPropagation()}
                      aria-label="Drag to reorder"
                    >
                      <DragHandle />
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`flex-1 px-4 py-3.5 text-left transition-colors hover:bg-[#edf3ff] focus:bg-[#edf3ff] focus:outline-none rounded-r-lg ${
                        isSelected ? 'bg-[#e2ebfa] text-[#10233f]' : 'text-[#233955]'
                      }`}
                    >
                      <span className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-7 min-w-[1.75rem] flex-shrink-0 items-center justify-center rounded-lg bg-[#dde5f2] text-sm font-bold text-[#10233f] tabular-nums">
                          {index + 1}
                        </span>
                        <span className="text-base font-medium leading-snug">
                          {item.question}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
              </ul>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        className="w-fit border border-[#c4d2e8] rounded-lg py-2 px-4 text-sm font-semibold bg-[#edf3ff] text-[#0f2a4b] hover:bg-[#e2ebfa]"
        onClick={onAdd}
      >
        Add Rebuttal
      </button>

      {selected && (
        <article className="grid gap-2 font-semibold bg-[#f8faff] border border-[#dde5f2] rounded-xl p-3.5">
          <label className="grid gap-1.5">
            <span>Rebuttal Title</span>
            <input
              type="text"
              value={selected.question}
              onChange={(e) => onUpdateQuestion(e.target.value)}
              className="w-full rounded-lg border border-[#cad7ea] p-2.5"
            />
          </label>
          <label className="grid gap-1.5">
            <span>Rebuttal Text</span>
            <textarea
              value={selected.response}
              onChange={(e) => onUpdateResponse(e.target.value)}
              className="w-full min-h-[220px] resize-y rounded-lg border border-[#cad7ea] p-2.5"
            />
          </label>
        </article>
      )}
    </div>
  )
}
