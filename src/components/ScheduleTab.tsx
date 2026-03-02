import { useState, useEffect, useCallback } from 'react'
import type { DailyScheduleItem, DailyScheduleItemType, WorkingDayItem } from '../types'
import {
  getDailySchedule,
  saveDailySchedule,
  getWorkingDaysSchedule,
  saveWorkingDaysSchedule,
} from '../utils'

const TIME_OPTIONS: string[] = (() => {
  const times: string[] = []
  for (let h = 6; h <= 23; h++) {
    for (const m of [0, 30]) {
      if (h === 23 && m === 30) break
      const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
      const ampm = h < 12 ? 'AM' : 'PM'
      times.push(`${hour}:${m.toString().padStart(2, '0')} ${ampm}`)
    }
  }
  return times
})()

const SCHEDULE_TYPES: DailyScheduleItemType[] = ['Call', 'Callback', 'Meeting', 'Break', 'Admin']

function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return -1
  let h = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  const ampm = match[3].toUpperCase()
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  return h * 60 + m
}

function getCurrentTimeMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export function ScheduleTab() {
  const [dailyItems, setDailyItems] = useState<DailyScheduleItem[]>(getDailySchedule)
  const [workingDays, setWorkingDays] = useState<WorkingDayItem[]>(getWorkingDaysSchedule)
  const [notice, setNotice] = useState<{ title: string; time: string } | null>(null)
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<DailyScheduleItem | null>(null)
  const [newItem, setNewItem] = useState<Partial<DailyScheduleItem>>({
    time: '9:00 AM',
    title: '',
    type: 'Callback',
    contactName: '',
    phone: '',
    notes: '',
  })

  useEffect(() => {
    saveDailySchedule(dailyItems)
  }, [dailyItems])

  useEffect(() => {
    saveWorkingDaysSchedule(workingDays)
  }, [workingDays])

  const checkScheduleNotifications = useCallback(() => {
    const now = getCurrentTimeMinutes()
    for (const item of dailyItems) {
      const itemMins = parseTimeToMinutes(item.time)
      if (itemMins < 0) continue
      if (Math.abs(now - itemMins) <= 1 && !notifiedIds.has(item.id)) {
        setNotifiedIds((prev) => new Set(prev).add(item.id))
        setNotice({ title: item.title, time: item.time })
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`Schedule: ${item.title}`, {
            body: `Scheduled for ${item.time}`,
            icon: '/favicon.ico',
          })
        }
      }
    }
  }, [dailyItems, notifiedIds])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(checkScheduleNotifications, 30_000)
    checkScheduleNotifications()
    return () => clearInterval(interval)
  }, [checkScheduleNotifications])

  const handleAddDailyItem = () => {
    if (!newItem.time || !newItem.title?.trim()) return
    const id = `ds-${Date.now()}`
    setDailyItems((prev) => [
      ...prev,
      {
        id,
        time: newItem.time!,
        title: newItem.title!.trim(),
        type: newItem.type ?? 'Callback',
        contactName: newItem.contactName?.trim() ?? '',
        phone: newItem.phone?.trim() ?? '',
        notes: newItem.notes?.trim() ?? '',
      },
    ])
    setNewItem({
      time: '9:00 AM',
      title: '',
      type: 'Callback',
      contactName: '',
      phone: '',
      notes: '',
    })
  }

  const handleStartEdit = (item: DailyScheduleItem) => {
    setEditingId(item.id)
    setEditDraft({ ...item })
  }

  const handleSaveEdit = () => {
    if (!editDraft) return
    setDailyItems((prev) =>
      prev.map((item) => (item.id === editDraft.id ? editDraft : item)),
    )
    setEditingId(null)
    setEditDraft(null)
  }

  const handleDeleteDailyItem = (id: string) => {
    setDailyItems((prev) => prev.filter((item) => item.id !== id))
    setEditingId(null)
    setEditDraft(null)
  }

  const handleToggleWorkingDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.map((item) =>
        item.day === day ? { ...item, hasShift: !item.hasShift } : item,
      ),
    )
  }

  const handleUpdateShiftTime = (day: string, shiftStartTime: string) => {
    setWorkingDays((prev) =>
      prev.map((item) => (item.day === day ? { ...item, shiftStartTime } : item)),
    )
  }

  const getTypeBadgeClass = (type: DailyScheduleItemType) => {
    switch (type) {
      case 'Call':
      case 'Callback':
        return 'bg-[#e2ebfa] text-[#10233f]'
      case 'Meeting':
        return 'bg-[#d4e8d4] text-[#1a4d1a]'
      case 'Break':
        return 'bg-[#fff3cd] text-[#856404]'
      default:
        return 'bg-[#f3f6fc] text-[#5f7087]'
    }
  }

  const sortedDailyItems = [...dailyItems].sort(
    (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time),
  )

  return (
    <div className="mt-4 space-y-6 font-medium text-[#233955]">
      {notice && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-xl border-2 border-[#10233f] bg-[#e2ebfa] px-4 py-3 text-[#10233f]"
        >
          <span className="font-semibold">
            Up now: {notice.title} ({notice.time})
          </span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="rounded px-2 py-1 text-sm hover:bg-[#c4d2e8]"
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="rounded-xl border border-[#dde5f2] bg-[#f8faff] p-5">
        <h2 className="mb-1 text-lg font-bold text-[#10233f]">Daily Schedule</h2>
        <p className="mb-4 text-sm text-[#5f7087]">
          Add callbacks and tasks with contact details. You&apos;ll get a notice when it&apos;s time.
        </p>

        <div className="mb-4 grid grid-cols-1 gap-2 md:flex md:flex-wrap md:items-end">
          <label className="flex flex-col gap-1 text-sm md:w-auto">
            <span className="text-[#5f7087]">Time</span>
            <select
              value={newItem.time}
              onChange={(e) => setNewItem((p) => ({ ...p, time: e.target.value }))}
              className="rounded-lg border border-[#cad7ea] px-3 py-2 text-[#10233f]"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm md:w-auto">
            <span className="text-[#5f7087]">Type</span>
            <select
              value={newItem.type}
              onChange={(e) =>
                setNewItem((p) => ({ ...p, type: e.target.value as DailyScheduleItemType }))
              }
              className="rounded-lg border border-[#cad7ea] px-3 py-2 text-[#10233f]"
            >
              {SCHEDULE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-1 min-w-[140px] flex-col gap-1 text-sm md:w-auto">
            <span className="text-[#5f7087]">Title</span>
            <input
              type="text"
              value={newItem.title ?? ''}
              onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Callback - ABC Corp"
              className="rounded-lg border border-[#cad7ea] px-3 py-2 text-[#10233f]"
            />
          </label>
          <label className="flex flex-1 min-w-[140px] flex-col gap-1 text-sm md:w-auto">
            <span className="text-[#5f7087]">Name</span>
            <input
              type="text"
              value={newItem.contactName ?? ''}
              onChange={(e) => setNewItem((p) => ({ ...p, contactName: e.target.value }))}
              placeholder="Customer name"
              className="rounded-lg border border-[#cad7ea] px-3 py-2 text-[#10233f]"
            />
          </label>
          <label className="flex flex-1 min-w-[140px] flex-col gap-1 text-sm md:w-auto">
            <span className="text-[#5f7087]">Phone</span>
            <input
              type="tel"
              value={newItem.phone ?? ''}
              onChange={(e) => setNewItem((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Phone number"
              className="rounded-lg border border-[#cad7ea] px-3 py-2 text-[#10233f]"
            />
          </label>
          <button
            type="button"
            onClick={handleAddDailyItem}
            disabled={!newItem.title?.trim()}
            className="rounded-lg border border-[#10233f] bg-[#10233f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a3a5c] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        <ul className="space-y-3">
          {sortedDailyItems.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-lg border border-[#dde5f2] bg-white px-4 py-3"
            >
              {editingId === item.id && editDraft ? (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={editDraft.time}
                      onChange={(e) => setEditDraft((p) => p && { ...p, time: e.target.value })}
                      className="rounded border border-[#cad7ea] px-2 py-1 text-sm"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <select
                      value={editDraft.type}
                      onChange={(e) =>
                        setEditDraft((p) => p && { ...p, type: e.target.value as DailyScheduleItemType })
                      }
                      className="rounded border border-[#cad7ea] px-2 py-1 text-sm"
                    >
                      {SCHEDULE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editDraft.title}
                      onChange={(e) => setEditDraft((p) => p && { ...p, title: e.target.value })}
                      className="min-w-[140px] flex-1 rounded border border-[#cad7ea] px-2 py-1 text-sm"
                      placeholder="Title"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={editDraft.contactName ?? ''}
                      onChange={(e) => setEditDraft((p) => p && { ...p, contactName: e.target.value })}
                      className="min-w-[140px] rounded border border-[#cad7ea] px-2 py-1 text-sm"
                      placeholder="Name"
                    />
                    <input
                      type="tel"
                      value={editDraft.phone ?? ''}
                      onChange={(e) => setEditDraft((p) => p && { ...p, phone: e.target.value })}
                      className="min-w-[140px] rounded border border-[#cad7ea] px-2 py-1 text-sm"
                      placeholder="Phone"
                    />
                  </div>
                  <textarea
                    value={editDraft.notes ?? ''}
                    onChange={(e) => setEditDraft((p) => p && { ...p, notes: e.target.value })}
                    className="w-full rounded border border-[#cad7ea] px-2 py-1 text-sm"
                    rows={2}
                    placeholder="Notes"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="rounded px-2 py-1 text-sm text-[#5f7087] hover:bg-[#f3f6fc]"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDailyItem(item.id)}
                      className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="min-w-20 font-semibold text-[#10233f]">
                      {item.time}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${getTypeBadgeClass(item.type)}`}
                    >
                      {item.type}
                    </span>
                    <span className="flex-1 text-[#233955]">{item.title}</span>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="rounded px-2 py-1 text-sm text-[#5f7087] hover:bg-[#f3f6fc]"
                    >
                      Edit
                    </button>
                  </div>
                  {(item.contactName || item.phone) && (
                    <div className="text-xs text-[#5f7087] flex flex-wrap gap-3">
                      {item.contactName && <span>Name: {item.contactName}</span>}
                      {item.phone && <span>Phone: {item.phone}</span>}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-xs text-[#233955]">
                      Notes: {item.notes}
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-[#dde5f2] bg-[#f8faff] p-5">
        <h2 className="mb-1 text-lg font-bold text-[#10233f]">Working Days</h2>
        <p className="mb-4 text-sm text-[#5f7087]">
          Set which days you have shifts and when they start.
        </p>

        <ul className="space-y-3">
          {workingDays.map((item) => (
            <li
              key={item.day}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-[#dde5f2] bg-white px-4 py-3"
            >
              <span className="min-w-12 font-semibold text-[#10233f]">
                {item.day}
              </span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.hasShift}
                  onChange={() => handleToggleWorkingDay(item.day)}
                  className="h-4 w-4 rounded border-[#cad7ea]"
                />
                <span className="text-sm text-[#233955]">
                  {item.hasShift ? 'Shift' : 'Free'}
                </span>
              </label>
              {item.hasShift && (
                <label className="flex items-center gap-2">
                  <span className="text-sm text-[#5f7087]">Starts at</span>
                  <select
                    value={item.shiftStartTime}
                    onChange={(e) => handleUpdateShiftTime(item.day, e.target.value)}
                    className="rounded border border-[#cad7ea] px-2 py-1 text-sm text-[#10233f]"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
