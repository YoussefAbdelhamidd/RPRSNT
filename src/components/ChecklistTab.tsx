import type { ChecklistItem } from '../types'

export type ChecklistTabProps = {
  items: ChecklistItem[]
  onToggle: (id: string) => void
}

export function ChecklistTab({ items, onToggle }: ChecklistTabProps) {
  return (
    <div className="grid gap-3 mt-4">
      {items.map((item) => (
        <label
          key={item.id}
          className="flex items-center gap-2 font-semibold bg-[#f8faff] border border-[#dde5f2] rounded-xl p-3.5 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => onToggle(item.id)}
            className="w-4 h-4"
          />
          <span>{item.label}</span>
        </label>
      ))}
    </div>
  )
}
