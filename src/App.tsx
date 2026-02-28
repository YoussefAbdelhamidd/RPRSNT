import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import './App.css'

type TabKey = 'rebuttal' | 'checklist'

type RebuttalItem = {
  id: string
  question: string
  response: string
}

type ChecklistItem = {
  id: string
  label: string
  checked: boolean
}

const initialRebuttalQuestions: RebuttalItem[] = [
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

const initialChecklistItems: ChecklistItem[] = [
  { id: 'c1', label: 'Opened call and set agenda', checked: false },
  { id: 'c2', label: 'Verified identity and customer details', checked: false },
  { id: 'c3', label: 'Explained program vs alternatives clearly', checked: false },
  { id: 'c4', label: 'Handled contract disclosure concerns', checked: false },
  { id: 'c5', label: 'Handled payment affordability objection', checked: false },
  { id: 'c6', label: 'Handled late payment concern', checked: false },
  { id: 'c7', label: 'Handled tax implication concern (no guarantees)', checked: false },
  { id: 'c8', label: 'Handled trust/privacy data source concern', checked: false },
  { id: 'c9', label: 'Confirmed customer comfort with secure form flow', checked: false },
  { id: 'c10', label: 'Shared next steps and asked for decision', checked: false },
]

const rebuttalStorageKey = 'call-assistant-rebuttals-v1'
const accessSessionStorageKey = 'call-assistant-access-session-v1'
const accessUsername = 'admin'
const accessPassword = '123456'

function getInitialRebuttals(): RebuttalItem[] {
  if (typeof window === 'undefined') return initialRebuttalQuestions
  try {
    const raw = window.localStorage.getItem(rebuttalStorageKey)
    if (!raw) return initialRebuttalQuestions
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return initialRebuttalQuestions
    const cleaned = parsed.filter(
      (item): item is RebuttalItem =>
        typeof item?.id === 'string' &&
        typeof item?.question === 'string' &&
        typeof item?.response === 'string',
    )
    return cleaned.length > 0 ? cleaned : initialRebuttalQuestions
  } catch {
    return initialRebuttalQuestions
  }
}

function toDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}

function hasSavedAccessSession(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(accessSessionStorageKey) === 'granted'
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(hasSavedAccessSession)
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('rebuttal')
  const [rebuttalQuestions, setRebuttalQuestions] = useState<RebuttalItem[]>(getInitialRebuttals)
  const [selectedRebuttalId, setSelectedRebuttalId] = useState('')
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(initialChecklistItems)

  const [punchedInAt, setPunchedInAt] = useState<number | null>(null)
  const [punchedOutAt, setPunchedOutAt] = useState<number | null>(null)
  const [breakStartedAt, setBreakStartedAt] = useState<number | null>(null)
  const [accumulatedBreakMs, setAccumulatedBreakMs] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [isTrackerMinimized, setIsTrackerMinimized] = useState(false)
  const [bubblePosition, setBubblePosition] = useState({ x: 24, y: 120 })
  const [trackerPosition, setTrackerPosition] = useState({ x: 24, y: 24 })
  const [trackerTilt, setTrackerTilt] = useState(0)
  const [bubbleTilt, setBubbleTilt] = useState(0)
  const [isDraggingBubble, setIsDraggingBubble] = useState(false)
  const [isDraggingTracker, setIsDraggingTracker] = useState(false)
  const [dragPointerId, setDragPointerId] = useState<number | null>(null)
  const [gameScore, setGameScore] = useState(0)
  const [gameStreak, setGameStreak] = useState(0)
  const [gameTarget, setGameTarget] = useState({ x: 42, y: 42 })
  const bubbleDragOffset = useRef({ x: 0, y: 0 })
  const trackerDragOffset = useRef({ x: 0, y: 0 })
  const bubbleVelocity = useRef({ x: 0, y: 0 })
  const bubbleLastPointer = useRef({ x: 0, y: 0, time: 0 })
  const trackerVelocity = useRef({ x: 0, y: 0 })
  const trackerLastPointer = useRef({ x: 0, y: 0, time: 0 })
  const bubblePhysicsFrame = useRef<number | null>(null)
  const trackerPhysicsFrame = useRef<number | null>(null)
  const bubbleMoved = useRef(false)
  const bubbleSize = 68
  const trackerWidth = 440
  const trackerHeight = 140
  const gameWidth = 188
  const gameHeight = 120
  const targetSize = 26

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    setBubblePosition({
      x: Math.max(16, window.innerWidth - 90),
      y: Math.max(16, window.innerHeight - 120),
    })
    setTrackerPosition({
      x: Math.max(16, window.innerWidth - trackerWidth - 24),
      y: Math.max(16, window.innerHeight - 170),
    })
  }, [])

  useEffect(() => {
    window.localStorage.setItem(rebuttalStorageKey, JSON.stringify(rebuttalQuestions))
  }, [rebuttalQuestions])

  useEffect(() => {
    if (rebuttalQuestions.length === 0) return
    const hasSelection = rebuttalQuestions.some((item) => item.id === selectedRebuttalId)
    if (!hasSelection) setSelectedRebuttalId(rebuttalQuestions[0].id)
  }, [rebuttalQuestions, selectedRebuttalId])

  useEffect(() => {
    if ((!isDraggingBubble && !isDraggingTracker) || dragPointerId === null) return

    function onPointerMove(event: PointerEvent) {
      if (event.pointerId !== dragPointerId) return
      if (isDraggingBubble) {
        bubbleMoved.current = true
        const maxX = Math.max(0, window.innerWidth - bubbleSize)
        const maxY = Math.max(0, window.innerHeight - bubbleSize)
        const nextX = event.clientX - bubbleDragOffset.current.x
        const nextY = event.clientY - bubbleDragOffset.current.y
        const nowTime = performance.now()
        const deltaTime = Math.max(1, nowTime - bubbleLastPointer.current.time)
        bubbleVelocity.current = {
          x: ((event.clientX - bubbleLastPointer.current.x) / deltaTime) * 16,
          y: ((event.clientY - bubbleLastPointer.current.y) / deltaTime) * 16,
        }
        bubbleLastPointer.current = { x: event.clientX, y: event.clientY, time: nowTime }
        setBubblePosition({
          x: Math.min(Math.max(0, nextX), maxX),
          y: Math.min(Math.max(0, nextY), maxY),
        })
        setBubbleTilt(Math.max(-10, Math.min(10, bubbleVelocity.current.x * 0.45)))
      }

      if (isDraggingTracker) {
        const maxX = Math.max(0, window.innerWidth - trackerWidth)
        const maxY = Math.max(0, window.innerHeight - trackerHeight)
        const nextX = event.clientX - trackerDragOffset.current.x
        const nextY = event.clientY - trackerDragOffset.current.y
        const nowTime = performance.now()
        const deltaTime = Math.max(1, nowTime - trackerLastPointer.current.time)
        trackerVelocity.current = {
          x: ((event.clientX - trackerLastPointer.current.x) / deltaTime) * 16,
          y: ((event.clientY - trackerLastPointer.current.y) / deltaTime) * 16,
        }
        trackerLastPointer.current = { x: event.clientX, y: event.clientY, time: nowTime }
        setTrackerPosition({
          x: Math.min(Math.max(0, nextX), maxX),
          y: Math.min(Math.max(0, nextY), maxY),
        })
        setTrackerTilt(Math.max(-8, Math.min(8, trackerVelocity.current.x * 0.35)))
      }
    }

    function onPointerUp(event: PointerEvent) {
      if (event.pointerId !== dragPointerId) return
      setIsDraggingBubble(false)
      setIsDraggingTracker(false)
      setDragPointerId(null)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [bubbleSize, dragPointerId, isDraggingBubble, isDraggingTracker, trackerWidth])

  useEffect(() => {
    if (isDraggingBubble || !isTrackerMinimized) return
    const threshold = 0.15
    if (
      Math.abs(bubbleVelocity.current.x) < threshold &&
      Math.abs(bubbleVelocity.current.y) < threshold &&
      Math.abs(bubbleTilt) < 0.1
    ) {
      setBubbleTilt(0)
      return
    }

    function step() {
      setBubblePosition((prev) => {
        let nextX = prev.x + bubbleVelocity.current.x
        let nextY = prev.y + bubbleVelocity.current.y
        const maxX = Math.max(0, window.innerWidth - bubbleSize)
        const maxY = Math.max(0, window.innerHeight - bubbleSize)

        bubbleVelocity.current.x *= 0.965
        bubbleVelocity.current.y *= 0.965

        if (nextX <= 0 || nextX >= maxX) {
          nextX = Math.min(Math.max(0, nextX), maxX)
          bubbleVelocity.current.x *= -0.74
        }

        if (nextY <= 0 || nextY >= maxY) {
          nextY = Math.min(Math.max(0, nextY), maxY)
          bubbleVelocity.current.y *= -0.74
        }

        return { x: nextX, y: nextY }
      })

      setBubbleTilt((prev) => {
        const next = prev * 0.9 + bubbleVelocity.current.x * 0.18
        return Math.abs(next) < 0.1 ? 0 : next
      })

      if (
        Math.abs(bubbleVelocity.current.x) >= threshold ||
        Math.abs(bubbleVelocity.current.y) >= threshold ||
        Math.abs(bubbleTilt) >= 0.1
      ) {
        bubblePhysicsFrame.current = window.requestAnimationFrame(step)
      } else {
        bubblePhysicsFrame.current = null
      }
    }

    bubblePhysicsFrame.current = window.requestAnimationFrame(step)
    return () => {
      if (bubblePhysicsFrame.current !== null) {
        window.cancelAnimationFrame(bubblePhysicsFrame.current)
        bubblePhysicsFrame.current = null
      }
    }
  }, [bubbleTilt, bubbleSize, isDraggingBubble, isTrackerMinimized])

  useEffect(() => {
    if (isDraggingTracker || isTrackerMinimized) return
    const threshold = 0.15
    if (
      Math.abs(trackerVelocity.current.x) < threshold &&
      Math.abs(trackerVelocity.current.y) < threshold &&
      Math.abs(trackerTilt) < 0.1
    ) {
      setTrackerTilt(0)
      return
    }

    function step() {
      setTrackerPosition((prev) => {
        let nextX = prev.x + trackerVelocity.current.x
        let nextY = prev.y + trackerVelocity.current.y
        const maxX = Math.max(0, window.innerWidth - trackerWidth)
        const maxY = Math.max(0, window.innerHeight - trackerHeight)

        trackerVelocity.current.x *= 0.96
        trackerVelocity.current.y *= 0.96

        if (nextX <= 0 || nextX >= maxX) {
          nextX = Math.min(Math.max(0, nextX), maxX)
          trackerVelocity.current.x *= -0.72
        }

        if (nextY <= 0 || nextY >= maxY) {
          nextY = Math.min(Math.max(0, nextY), maxY)
          trackerVelocity.current.y *= -0.72
        }

        return { x: nextX, y: nextY }
      })

      setTrackerTilt((prev) => {
        const next = prev * 0.9 + trackerVelocity.current.x * 0.12
        return Math.abs(next) < 0.1 ? 0 : next
      })

      if (
        Math.abs(trackerVelocity.current.x) >= threshold ||
        Math.abs(trackerVelocity.current.y) >= threshold ||
        Math.abs(trackerTilt) >= 0.1
      ) {
        trackerPhysicsFrame.current = window.requestAnimationFrame(step)
      } else {
        trackerPhysicsFrame.current = null
      }
    }

    trackerPhysicsFrame.current = window.requestAnimationFrame(step)
    return () => {
      if (trackerPhysicsFrame.current !== null) {
        window.cancelAnimationFrame(trackerPhysicsFrame.current)
        trackerPhysicsFrame.current = null
      }
    }
  }, [isDraggingTracker, isTrackerMinimized, trackerTilt, trackerWidth])

  const isPunchedIn = punchedInAt !== null && punchedOutAt === null
  const isOnBreak = breakStartedAt !== null

  function addActivity(action: string) {
    void action
  }

  function handlePunchIn() {
    const ts = Date.now()
    setPunchedInAt(ts)
    setPunchedOutAt(null)
    setBreakStartedAt(null)
    setAccumulatedBreakMs(0)
    addActivity('Punched in')
  }

  function handleBreakToggle() {
    if (!isPunchedIn) return
    const ts = Date.now()
    if (breakStartedAt === null) {
      setBreakStartedAt(ts)
      addActivity('Started break')
      return
    }

    const breakDelta = ts - breakStartedAt
    setAccumulatedBreakMs((prev) => prev + breakDelta)
    setBreakStartedAt(null)
    addActivity('Ended break')
  }

  const currentBreakMs = useMemo(() => {
    if (breakStartedAt === null) return accumulatedBreakMs
    return accumulatedBreakMs + (now - breakStartedAt)
  }, [accumulatedBreakMs, breakStartedAt, now])

  const grossMs = useMemo(() => {
    if (punchedInAt === null) return 0
    const end = punchedOutAt ?? now
    return Math.max(0, end - punchedInAt)
  }, [now, punchedInAt, punchedOutAt])

  const netWorkMs = Math.max(0, grossMs - currentBreakMs)

  const selectedRebuttal = rebuttalQuestions.find((item) => item.id === selectedRebuttalId) ?? null

  function handlePunchOut() {
    if (!isPunchedIn || punchedInAt === null) return
    const ts = Date.now()

    let finalBreakMs = accumulatedBreakMs
    if (breakStartedAt !== null) {
      finalBreakMs += ts - breakStartedAt
      setBreakStartedAt(null)
      addActivity('Ended break (auto on punch out)')
    }

    setAccumulatedBreakMs(finalBreakMs)
    setPunchedOutAt(ts)
    addActivity('Punched out')
  }

  function toggleChecklist(id: string) {
    setChecklistItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const next = { ...item, checked: !item.checked }
        addActivity(`${next.checked ? 'Checked' : 'Unchecked'} "${next.label}"`)
        return next
      }),
    )
  }

  function updateSelectedRebuttalQuestion(question: string) {
    setRebuttalQuestions((prev) =>
      prev.map((item) => (item.id === selectedRebuttalId ? { ...item, question } : item)),
    )
  }

  function updateSelectedRebuttalResponse(response: string) {
    setRebuttalQuestions((prev) =>
      prev.map((item) => (item.id === selectedRebuttalId ? { ...item, response } : item)),
    )
  }

  function handleAddRebuttal() {
    const id = `r-${Date.now()}`
    const newItem: RebuttalItem = {
      id,
      question: `New Rebuttal ${rebuttalQuestions.length + 1}`,
      response: '',
    }
    setRebuttalQuestions((prev) => [...prev, newItem])
    setSelectedRebuttalId(id)
    addActivity(`Added rebuttal: "${newItem.question}"`)
  }

  function handleBubblePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault()
    bubbleMoved.current = false
    if (bubblePhysicsFrame.current !== null) {
      window.cancelAnimationFrame(bubblePhysicsFrame.current)
      bubblePhysicsFrame.current = null
    }
    bubbleVelocity.current = { x: 0, y: 0 }
    bubbleLastPointer.current = { x: event.clientX, y: event.clientY, time: performance.now() }
    bubbleDragOffset.current = {
      x: event.clientX - bubblePosition.x,
      y: event.clientY - bubblePosition.y,
    }
    setDragPointerId(event.pointerId)
    setIsDraggingBubble(true)
  }

  function handleBubbleClick() {
    if (bubbleMoved.current) {
      bubbleMoved.current = false
      return
    }
    setIsTrackerMinimized(false)
  }

  function handleTrackerPointerDown(event: ReactPointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement
    if (target.closest('button, input, textarea, select, label')) return
    event.preventDefault()
    if (trackerPhysicsFrame.current !== null) {
      window.cancelAnimationFrame(trackerPhysicsFrame.current)
      trackerPhysicsFrame.current = null
    }
    trackerVelocity.current = { x: 0, y: 0 }
    trackerLastPointer.current = { x: event.clientX, y: event.clientY, time: performance.now() }
    trackerDragOffset.current = {
      x: event.clientX - trackerPosition.x,
      y: event.clientY - trackerPosition.y,
    }
    setDragPointerId(event.pointerId)
    setIsDraggingTracker(true)
  }

  function moveGameTarget() {
    const padding = 10
    const maxX = gameWidth - targetSize - padding
    const maxY = gameHeight - targetSize - padding
    setGameTarget({
      x: Math.floor(Math.random() * Math.max(1, maxX - padding + 1)) + padding,
      y: Math.floor(Math.random() * Math.max(1, maxY - padding + 1)) + padding,
    })
  }

  function handleGameHit() {
    setGameScore((prev) => prev + 1)
    setGameStreak((prev) => prev + 1)
    moveGameTarget()
  }

  function handleGameReset() {
    setGameScore(0)
    setGameStreak(0)
    moveGameTarget()
  }

  function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (usernameInput.trim() !== accessUsername.trim() || passwordInput !== accessPassword) {
      setLoginError('Invalid username or password.')
      return
    }
    window.localStorage.setItem(accessSessionStorageKey, 'granted')
    setIsAuthenticated(true)
    setLoginError('')
    setUsernameInput('')
    setPasswordInput('')
  }

  function handleLogout() {
    window.localStorage.removeItem(accessSessionStorageKey)
    setIsAuthenticated(false)
    setIsTrackerMinimized(false)
  }

  if (!isAuthenticated) {
    return (
      <main className="login-shell">
        <section className="login-card">
          <h1>Secure Access</h1>
          <p className="lead">Enter username and password to open the main dashboard.</p>
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <label className="login-field">
              <span>Username</span>
              <input
                type="text"
                value={usernameInput}
                onChange={(event) => {
                  setUsernameInput(event.target.value)
                  if (loginError) setLoginError('')
                }}
                placeholder="Enter username"
              />
            </label>
            <label className="login-field">
              <span>Password</span>
              <input
                type="password"
                value={passwordInput}
                onChange={(event) => {
                  setPasswordInput(event.target.value)
                  if (loginError) setLoginError('')
                }}
                placeholder="Enter password"
              />
            </label>
            {loginError ? <p className="login-error">{loginError}</p> : null}
            <button type="submit" className="login-button">
              Unlock
            </button>
          </form>
          <p className="token-hint">
            Current login: <strong>{accessUsername}</strong> / <strong>{accessPassword}</strong>
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="app-card">
        <div className="page-header">
          <div>
            <h1>Call Assistant Dashboard</h1>
            <p className="lead">Track rebuttals, complete call steps, and submit your session at punch-out.</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="tab-row">
          <button
            className={activeTab === 'rebuttal' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('rebuttal')}
          >
            Rebuttal Questions
          </button>
          <button
            className={activeTab === 'checklist' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('checklist')}
          >
            Call Checklist
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'rebuttal' ? (
            <div className="list-wrap">
              <label className="qa-card">
                <span>Select Rebuttal Title</span>
                <select
                  className="rebuttal-select"
                  value={selectedRebuttalId}
                  onChange={(event) => {
                    const nextId = event.target.value
                    setSelectedRebuttalId(nextId)
                    const picked = rebuttalQuestions.find((item) => item.id === nextId)
                    if (picked) addActivity(`Selected rebuttal: "${picked.question}"`)
                  }}
                >
                  {rebuttalQuestions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.question}
                    </option>
                  ))}
                </select>
              </label>
              <button className="add-rebuttal-btn" onClick={handleAddRebuttal}>
                Add Rebuttal
              </button>

              {selectedRebuttal && (
                <article className="qa-card rebuttal-view">
                  <label className="edit-field">
                    <span>Rebuttal Title</span>
                    <input
                      type="text"
                      value={selectedRebuttal.question}
                      onChange={(event) => updateSelectedRebuttalQuestion(event.target.value)}
                    />
                  </label>
                  <label className="edit-field">
                    <span>Rebuttal Text</span>
                    <textarea
                      value={selectedRebuttal.response}
                      onChange={(event) => updateSelectedRebuttalResponse(event.target.value)}
                    />
                  </label>
                </article>
              )}
            </div>
          ) : (
            <div className="list-wrap">
              {checklistItems.map((item) => (
                <label key={item.id} className="check-card">
                  <input type="checkbox" checked={item.checked} onChange={() => toggleChecklist(item.id)} />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <section className="game-card">
          <div className="game-header">
            <div>
              <h2>Focus Dots</h2>
              <p>Quiet click-target for idle moments between call actions.</p>
            </div>
            <button className="game-reset-btn" onClick={handleGameReset}>
              Reset
            </button>
          </div>
          <div className="game-meta">
            <span>Score: {gameScore}</span>
            <span>Streak: {gameStreak}</span>
          </div>
          <div className="game-board" onClick={() => setGameStreak(0)}>
            <button
              className="game-target"
              style={{ left: `${gameTarget.x}px`, top: `${gameTarget.y}px` }}
              onClick={(event) => {
                event.stopPropagation()
                handleGameHit()
              }}
              aria-label="Focus target"
            />
          </div>
        </section>
      </section>

      {isTrackerMinimized ? (
        <button
          className={isDraggingBubble ? 'tracker-bubble dragging' : 'tracker-bubble'}
          style={{
            left: `${bubblePosition.x}px`,
            top: `${bubblePosition.y}px`,
            transform: `rotate(${bubbleTilt}deg)`,
          }}
          onPointerDown={handleBubblePointerDown}
          onClick={handleBubbleClick}
        >
          Open
        </button>
      ) : (
        <aside
          className={isDraggingTracker ? 'floating-time-card dragging' : 'floating-time-card'}
          style={{
            left: `${trackerPosition.x}px`,
            top: `${trackerPosition.y}px`,
            transform: `rotate(${trackerTilt}deg)`,
          }}
          onPointerDown={handleTrackerPointerDown}
        >
          <div className="metrics">
            <p>
              <strong>Status:</strong> {isPunchedIn ? (isOnBreak ? 'On Break' : 'Working') : 'Not Punched In'}
            </p>
            <p>
              <strong>Work Time:</strong> {toDuration(netWorkMs)}
            </p>
            <p>
              <strong>Break Time:</strong> {toDuration(currentBreakMs)}
            </p>
          </div>
          <div className="actions">
            <button className="minimize-btn" onClick={() => setIsTrackerMinimized(true)}>
              Minimize
            </button>
            <button onClick={handlePunchIn} disabled={isPunchedIn}>
              Punch In
            </button>
            <button onClick={handleBreakToggle} disabled={!isPunchedIn}>
              {isOnBreak ? 'End Break' : 'Start Break'}
            </button>
            <button onClick={handlePunchOut} disabled={!isPunchedIn}>
              Punch Out
            </button>
          </div>
        </aside>
      )}
    </main>
  )
}

export default App
