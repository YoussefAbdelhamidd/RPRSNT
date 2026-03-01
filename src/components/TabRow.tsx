import type { TabKey } from '../types'

export type TabRowProps = {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  tabs: { key: TabKey; label: string }[]
}

export function TabRow({ activeTab, onTabChange, tabs }: TabRowProps) {
  return (
    <div className="mt-5 flex gap-2.5 flex-wrap">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`rounded-lg py-2 px-4 font-semibold border ${
            activeTab === key
              ? 'bg-[#10233f] text-white border-[#10233f]'
              : 'bg-[#f3f6fc] text-[#10233f] border-[#d2d9e6]'
          }`}
          onClick={() => onTabChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
