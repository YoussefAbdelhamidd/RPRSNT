export type TabKey = 'rebuttal' | 'checklist' | 'script'

export type RebuttalItem = {
  id: string
  question: string
  response: string
}

export type ChecklistItem = {
  id: string
  label: string
  checked: boolean
}
