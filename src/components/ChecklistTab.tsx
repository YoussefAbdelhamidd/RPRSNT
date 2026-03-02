import { useState } from 'react'
import type { ChecklistItem } from '../types'

export type ChecklistTabProps = {
  items: ChecklistItem[]
  onToggle: (id: string) => void
  onUpdateNotes: (id: string, notes: string) => void
  onSubmit: () => void
}

export function ChecklistTab({
  items,
  onToggle,
  onUpdateNotes,
  onSubmit,
}: ChecklistTabProps) {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    onSubmit()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="grid gap-3 mt-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-[#dde5f2] bg-[#f8faff] p-3.5"
        >
          <label className="flex items-center gap-2 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => onToggle(item.id)}
              className="w-4 h-4"
            />
            <span>{item.label}</span>
          </label>
          <div className="mt-2 pl-6">
            <label className="block text-sm text-[#5f7087] mb-1">Notes</label>
            <textarea
              value={item.notes}
              onChange={(e) => onUpdateNotes(item.id, e.target.value)}
              placeholder="Add notes for this item..."
              className="w-full min-h-[60px] resize-y rounded-lg border border-[#cad7ea] p-2.5 text-sm text-[#233955] placeholder:text-[#9aa5b8]"
              rows={2}
            />
          </div>
        </div>
      ))}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-lg border border-[#10233f] bg-[#10233f] px-6 py-2.5 font-semibold text-white hover:bg-[#1a3a5c]"
        >
          Submit Checklist
        </button>
        {submitted && (
          <span className="text-sm font-medium text-green-600">
            Checklist submitted!
          </span>
        )}
      </div>
    </div>
  )
}
