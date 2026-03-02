export type TabKey = 'rebuttal' | 'checklist' | 'script' | 'schedule'

export type DailyScheduleItemType = 'Call' | 'Callback' | 'Meeting' | 'Break' | 'Admin'

export type DailyScheduleItem = {
  id: string
  time: string // e.g. "9:00 AM"
  title: string
  type: DailyScheduleItemType
}

export type WorkingDayItem = {
  day: string // Mon, Tue, etc.
  hasShift: boolean
  shiftStartTime: string // e.g. "9:00 AM"
}

export type RebuttalItem = {
  id: string
  question: string
  response: string
}

export type ChecklistItem = {
  id: string
  label: string
  checked: boolean
  notes: string
}
