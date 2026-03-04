import { GOOGLE_FORM_CALL_SHEET } from '../constants'

export type CallSheetFormData = {
  agent: string
  checkInHour: string
  totalReadyMinutes: number
  lunchMinutes: number
  meetingMinutes: number
  breakMinutes: number
  totalTimeMinutes: number
}

export function buildCallSheetFormPrefillUrl(data: CallSheetFormData): string {
  const { baseUrl, entryIds } = GOOGLE_FORM_CALL_SHEET
  const params = new URLSearchParams({
    [entryIds.agent]: String(data.agent),
    [entryIds.checkInHour]: String(data.checkInHour),
    [entryIds.totalReadyMinutes]: String(data.totalReadyMinutes),
    [entryIds.lunchMinutes]: String(data.lunchMinutes),
    [entryIds.meetingMinutes]: String(data.meetingMinutes),
    [entryIds.breakMinutes]: String(data.breakMinutes),
    [entryIds.totalTimeMinutes]: String(data.totalTimeMinutes),
  })
  return `${baseUrl}?${params.toString()}`
}

/**
 * Submit the Daily Report form in the background (user never sees the form).
 * Uses a hidden form + iframe so the POST is sent by the browser and is not blocked by CORS.
 */
export function submitCallSheetForm(data: CallSheetFormData): void {
  if (typeof document === 'undefined') return
  const { formResponseUrl, entryIds } = GOOGLE_FORM_CALL_SHEET

  const iframe = document.createElement('iframe')
  iframe.name = 'google-form-submit-iframe'
  iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(iframe)

  const form = document.createElement('form')
  form.action = formResponseUrl
  form.method = 'POST'
  form.target = iframe.name
  form.style.display = 'none'

  const fields: [keyof CallSheetFormData, string][] = [
    ['agent', entryIds.agent],
    ['checkInHour', entryIds.checkInHour],
    ['totalReadyMinutes', entryIds.totalReadyMinutes],
    ['lunchMinutes', entryIds.lunchMinutes],
    ['meetingMinutes', entryIds.meetingMinutes],
    ['breakMinutes', entryIds.breakMinutes],
    ['totalTimeMinutes', entryIds.totalTimeMinutes],
  ]
  for (const [key, entryId] of fields) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = entryId
    input.value = String(data[key])
    form.appendChild(input)
  }

  document.body.appendChild(form)
  form.submit()
  setTimeout(() => {
    form.remove()
    iframe.remove()
  }, 2000)
}
