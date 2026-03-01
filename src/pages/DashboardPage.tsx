import { useState, useEffect } from 'react'
import type { TabKey, RebuttalItem, ChecklistItem } from '../types'
import {
  PageHeader,
  TabRow,
  RebuttalTab,
  ChecklistTab,
 
  TimeTracker,
} from '../components'
import { useTimeTracker, BREAK_TYPE_OPTIONS } from '../hooks'
import { INITIAL_CHECKLIST_ITEMS } from '../constants'
import { getInitialRebuttals, saveRebuttals } from '../utils'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'rebuttal', label: 'Rebuttal Questions' },
  { key: 'checklist', label: 'Call Checklist' },
]

function noop(_message: string) {}

export type DashboardPageProps = {
  onLogout: () => void
}

export function DashboardPage({ onLogout }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('rebuttal')
  const [rebuttals, setRebuttals] = useState<RebuttalItem[]>(getInitialRebuttals)
  const [selectedRebuttalId, setSelectedRebuttalId] = useState('')
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(INITIAL_CHECKLIST_ITEMS)
  const [isTrackerMinimized, setIsTrackerMinimized] = useState(false)

  const timeTracker = useTimeTracker(noop)

  useEffect(() => {
    saveRebuttals(rebuttals)
  }, [rebuttals])

  useEffect(() => {
    if (rebuttals.length === 0) return
    const hasSelection = rebuttals.some((item) => item.id === selectedRebuttalId)
    if (!hasSelection) setSelectedRebuttalId(rebuttals[0].id)
  }, [rebuttals, selectedRebuttalId])

  const handleAddRebuttal = () => {
    const id = `r-${Date.now()}`
    const newItem: RebuttalItem = {
      id,
      question: `New Rebuttal ${rebuttals.length + 1}`,
      response: '',
    }
    setRebuttals((prev) => [...prev, newItem])
    setSelectedRebuttalId(id)
  }

  const handleUpdateQuestion = (question: string) => {
    setRebuttals((prev) =>
      prev.map((item) =>
        item.id === selectedRebuttalId ? { ...item, question } : item,
      ),
    )
  }

  const handleUpdateResponse = (response: string) => {
    setRebuttals((prev) =>
      prev.map((item) =>
        item.id === selectedRebuttalId ? { ...item, response } : item,
      ),
    )
  }

  const handleReorderRebuttals = (reordered: RebuttalItem[]) => {
    setRebuttals(reordered)
  }

  const handleToggleChecklist = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        return { ...item, checked: !item.checked }
      }),
    )
  }

  return (
    <main className="min-h-screen p-8 max-md:p-4 max-md:pb-72 bg-gradient-to-br from-[#f5f7fb] to-[#e8eef9] text-[#0e1a2b]">
      <section className="max-w-[900px] mx-auto bg-white rounded-2xl p-6 shadow-lg">
        <PageHeader
          title="Call Assistant Dashboard"
          lead="Track rebuttals, complete call steps, and submit your session at punch-out."
          action={
            <button
              type="button"
              className="border border-[#c4d2e8] rounded-lg py-2 px-3 bg-[#10233f] text-white font-semibold"
              onClick={onLogout}
            >
              Logout
            </button>
          }
        />

        <TabRow
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={TABS}
        />

        <div className="mt-4">
          {activeTab === 'rebuttal' ? (
            <RebuttalTab
              rebuttals={rebuttals}
              selectedId={selectedRebuttalId}
              onSelect={setSelectedRebuttalId}
              onReorder={handleReorderRebuttals}
              onAdd={handleAddRebuttal}
              onUpdateQuestion={handleUpdateQuestion}
              onUpdateResponse={handleUpdateResponse}
            />
          ) : (
            <ChecklistTab items={checklistItems} onToggle={handleToggleChecklist} />
          )}
        </div>

     
      </section>

      <TimeTracker
        isPunchedIn={timeTracker.isPunchedIn}
        isOnBreak={timeTracker.isOnBreak}
        currentBreakType={timeTracker.currentBreakType}
        breakTimeByType={timeTracker.breakTimeByType}
        currentBreakSegmentMs={timeTracker.currentBreakSegmentMs}
        netWorkDuration={timeTracker.netWorkDuration}
        currentBreakDuration={timeTracker.currentBreakDuration}
        onPunchIn={timeTracker.punchIn}
        onPunchOut={timeTracker.punchOut}
        onStartBreak={timeTracker.startBreak}
        onEndBreak={timeTracker.endBreak}
        onMinimize={() => setIsTrackerMinimized(true)}
        onExpand={() => setIsTrackerMinimized(false)}
        isMinimized={isTrackerMinimized}
        breakTypeOptions={BREAK_TYPE_OPTIONS}
      />
    </main>
  )
}
