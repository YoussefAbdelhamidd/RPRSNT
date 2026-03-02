import type { RebuttalItem, ChecklistItem, DailyScheduleItem, WorkingDayItem } from '../types'

export const REBUTTAL_STORAGE_KEY = 'call-assistant-rebuttals-v1'
export const DAILY_SCHEDULE_STORAGE_KEY = 'call-assistant-daily-schedule-v1'
export const WORKING_DAYS_STORAGE_KEY = 'call-assistant-working-days-v1'
export const CHECKLIST_STORAGE_KEY = 'call-assistant-checklist-v1'
export const ACCESS_SESSION_STORAGE_KEY = 'call-assistant-access-session-v1'

export const AGENT_CREDENTIALS: Record<string, string> = {
  'yamna.arif': 'yamna123',
  'areeba.tahir': 'areeba123',
  'abeera.qadeer': 'abeera123',
  'abdullah.subhani': 'abdullah123',
  'arham.amir': 'arham123',
  'safa.mariam': 'safa123',
  'muaaz.ahmed': 'muaaz123',
  'mariam.mowafi': 'mariam123',
  'maram.ahmed': 'maram123',
  'ahmed.hossam': 'ahmed123',
  'ibrahim.noby': 'ibrahim123',
  'tamer.spahi': 'tamer123',
  'jasmine.roushdy': 'jasmine123',
  'hussien.abouziied': 'hussien123',
  'abdullah.adel': 'abdullah123',
  'mazin.ali': 'mazin123',
  'abdelrahman.moustafa': 'abdelrahman123',
  'andrew.sedrak': 'andrew123',
  'mohamed.sami': 'mohamed123',
  'youssef.alsaghier': 'youssef123',
  'ahmed.yasser': 'ahmed123',
  'Youssef.hasaay': '21122001_Psn',
  'farah.ehab': 'fe2123456',
  'Mariam.bannis': 'mb123456',
  'seif.abady': 'sa123456',
}

export const INITIAL_REBUTTAL_QUESTIONS: RebuttalItem[] = [
  {
    id: 'r1',
    question: 'Bankruptcy vs. Program Value + deciding question',
    response:
      'Bankruptcy can indirectly control income and force payments based on court decisions. A trustee may manage parts of the bankruptcy estate and this can remain on credit for years, affecting loans, housing, and some jobs. Our program focuses on financial freedom through a structured debt relief plan with one manageable payment path, step-by-step guidance, and full visibility in an online portal. Funds are held in an FDIC-insured trust account so you can track progress clearly. Deciding question: Which feels more comfortable, a court-led process with reduced control, or a guided debt-free path where you stay informed and in control? Follow-up: Can I take a few more minutes to explain how this works and see if you qualify?',
  },
  {
    id: 'r2',
    question: 'Contract concerns',
    response:
      "The contract includes all plan types that may exist in your state, including services we do not provide, because legal disclosures require customers to see all options. The document is disclosure-heavy by law, and your enrollment today is for the consolidation-focused program. We must advise accurately and follow compliance standards.",
  },
  {
    id: 'r3',
    question: 'How did you get my information?',
    response:
      'We work with credit bureaus, including Experian, Equifax, and TransUnion, to identify people who may benefit based on financial profile indicators. Information is used under privacy laws and handled securely and responsibly.',
  },
  {
    id: 'r4',
    question: "I can't afford the monthly payment",
    response:
      "We can adjust structure by splitting debt handling into staged agreements so the first batch is handled now and the second batch later. Operational note: reduce debt to the lowest threshold for each payoff length bracket (example ranges: 7.5k-8k for 22 months, 10k for 36 months, 15k for 42 months).",
  },
  {
    id: 'r5',
    question: 'Late payment concerns',
    response:
      "Creditor agreements are built around retention and payoff outcomes. The program aims to remove unreasonable interest and resolve balances through established lender relationships. Script direction: reassure there are no late fees under this process and position it as accelerated lender recovery instead of small rolling penalties.",
  },
  {
    id: 'r6',
    question: 'Confirming identity details / last 4 SSN objection',
    response:
      'Identity confirmation protects the customer against impersonation and fraud. Credit-bureau workflow requires verification of core details. For last 4 SSN: system validation opens the profile only when matched; mismatch flags potential fraud. Emphasize safety and data protection standards.',
  },
  {
    id: 'r7',
    question: 'Wants contract before banking information',
    response:
      "Use a compliance-first explanation that missing required fields can block or invalidate processing. Guide the customer only through relevant pages (for example key exhibits and deposit schedule), keep momentum, and explain secure form automation for sensitive data entry. Avoid unsupported claims and keep language professional.",
  },
  {
    id: 'r8',
    question: 'Tax implications concern',
    response:
      'Explain that tax outcomes depend on individual circumstances and should be reviewed with licensed tax professionals. If debt is forgiven and tax forms are issued, customers may be advised on next filing steps (such as insolvency-related filing paths) by qualified professionals. Do not promise zero-tax outcomes.',
  },
  {
    id: 'r9',
    question: 'Why not listed on BBB?',
    response:
      "Our focus is on transparent service delivery and measurable client outcomes. Listing decisions on third-party platforms can change over time due to cost and policy considerations. If needed, we can share alternative credibility indicators, customer experience records, and support channels.",
  },
  {
    id: 'r10',
    question: 'Why can I not have this approval later if I have it now?',
    response:
      'Approvals are underwriting-dependent and can vary by review timing, policy windows, and current file conditions. A file may be reassessed at enrollment completion, and criteria can become stricter later. The best approach is to complete accurate enrollment while the current approval conditions are active.',
  },
  {
    id: 'r11',
    question: "I'm busy right now",
    response: "Totally understand. This takes about 20 seconds. If it's not useful, I can close the file on my side. Fair?",
  },
  {
    id: 'r12',
    question: 'Just send me an email',
    response:
      "Happy to. Before I send it, let me ask one quick question so I send something relevant instead of generic information. Okay?",
  },
  {
    id: 'r13',
    question: "I'm not looking for funding",
    response:
      "Totally fair. Many strong clients were not actively looking, they simply compared options and kept leverage available in case terms were better.",
  },
  {
    id: 'r14',
    question: 'I already have funding',
    response:
      "Perfect. This is mainly a market check to see if current terms can be improved. If not, you keep what you have with no forced change.",
  },
  {
    id: 'r15',
    question: "I don't like hard credit pulls",
    response:
      'That makes sense. The process can start with soft-pull style pre-qualification and only move further if you choose to proceed.',
  },
  {
    id: 'r16',
    question: "I've been burned by lenders before",
    response:
      "Understood. The approach is to compare offers across options so you are not dependent on a single lender and you keep decision control.",
  },
  {
    id: 'r17',
    question: "What's the catch?",
    response:
      'Positioning answer: no hidden catch in the comparison step. Customers can compare options and decide whether to proceed based on fit.',
  },
  {
    id: 'r18',
    question: "My credit isn't great",
    response:
      'Acknowledge concern and explain that qualification may consider multiple factors, not only personal credit, depending on program criteria.',
  },
  {
    id: 'r19',
    question: "I'm good with what I have",
    response:
      'Great. We can still benchmark current terms against market options. If your current setup is best, you keep it and lose nothing by checking.',
  },
  {
    id: 'r20',
    question: "I don't want to give my info over the phone",
    response:
      'Totally fair. We can send a secure application link by text or email so you enter sensitive data yourself when convenient.',
  },
  {
    id: 'r21',
    question: 'Hard no / not interested',
    response:
      'Understood. Quick question before I close this out: is it mainly timing, or concern based on prior bad offers?',
  },
]

export const INITIAL_DAILY_SCHEDULE: DailyScheduleItem[] = [
  { id: 'ds1', time: '9:00 AM', title: 'Team standup', type: 'Meeting' },
  { id: 'ds2', time: '10:30 AM', title: 'Call block', type: 'Call' },
  { id: 'ds3', time: '2:00 PM', title: 'Lunch break', type: 'Break' },
  { id: 'ds4', time: '4:30 PM', title: 'Punch-out & wrap-up', type: 'Admin' },
]

export const INITIAL_WORKING_DAYS: WorkingDayItem[] = [
  { day: 'Mon', hasShift: true, shiftStartTime: '9:00 AM' },
  { day: 'Tue', hasShift: true, shiftStartTime: '9:00 AM' },
  { day: 'Wed', hasShift: true, shiftStartTime: '9:00 AM' },
  { day: 'Thu', hasShift: true, shiftStartTime: '9:00 AM' },
  { day: 'Fri', hasShift: true, shiftStartTime: '9:00 AM' },
  { day: 'Sat', hasShift: false, shiftStartTime: '9:00 AM' },
  { day: 'Sun', hasShift: false, shiftStartTime: '9:00 AM' },
]

export const INITIAL_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'c1', label: 'Opened call and set agenda', checked: false, notes: '' },
  { id: 'c2', label: 'Verified identity and customer details', checked: false, notes: '' },
  { id: 'c3', label: 'Explained program vs alternatives clearly', checked: false, notes: '' },
  { id: 'c4', label: 'Handled contract disclosure concerns', checked: false, notes: '' },
  { id: 'c5', label: 'Handled payment affordability objection', checked: false, notes: '' },
  { id: 'c6', label: 'Handled late payment concern', checked: false, notes: '' },
  { id: 'c7', label: 'Handled tax implication concern (no guarantees)', checked: false, notes: '' },
  { id: 'c8', label: 'Handled trust/privacy data source concern', checked: false, notes: '' },
  { id: 'c9', label: 'Confirmed customer comfort with secure form flow', checked: false, notes: '' },
  { id: 'c10', label: 'Shared next steps and asked for decision', checked: false, notes: '' },
]
