import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup, onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../lib/firebase'
import { fetchAllProgress, resetAllProgress, type ProgressMap } from '../lib/progress'
import '../homepage.css'
import { lessons } from '../data/lessons'

/* ==============================================================
   TopicPicker — small interactive widget that mirrors the "platform
   tabs + terminal" style from popular dev landing pages, but adapted
   to our context. Each tab is a CCNA topic; clicking shows what that
   lesson looks like inside a code-styled card. Below it: a link to
   open the full lessons popup.
   ============================================================== */
interface TopicPickerProps {
  onOpenLessons: () => void
}

const TOPICS: Array<{
  key: string
  /** Short tab label */
  label: string
  /** Icon shown in the tab */
  icon: React.ReactNode
  /** Lesson number rendered in the terminal */
  num: string
  /** Lesson title rendered in the terminal */
  title: string
  /** Subtopic ID rendered in the terminal */
  topic: string
}> = [
  {
    key: 'lan',
    label: 'LAN',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="9" width="18" height="6" rx="1.5" />
        <path d="M7 12h.01M11 12h.01M15 12h.01" />
      </svg>
    ),
    num: '1.1',
    title: 'Was ist ein Netzwerk?',
    topic: 'lan · grundlagen',
  },
  {
    key: 'osi',
    label: 'OSI',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="3" rx="0.5" />
        <rect x="3" y="11" width="18" height="3" rx="0.5" />
        <rect x="3" y="16" width="18" height="3" rx="0.5" />
      </svg>
    ),
    num: '1.1b',
    title: 'OSI- & TCP/IP-Modell',
    topic: 'osi · schichten',
  },
  {
    key: 'topology',
    label: 'Topo',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="6" r="2.5" />
        <circle cx="12" cy="18" r="2.5" />
        <path d="M8 7l3 8M16 7l-3 8M8 6h8" />
      </svg>
    ),
    num: '1.2',
    title: 'Netzwerk-Topologien',
    topic: 'topo · spine-leaf',
  },
  {
    key: 'subnet',
    label: 'IP',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    ),
    num: '1.6',
    title: 'IPv4-Adressen & Subnetting',
    topic: 'ipv4 · /24',
  },
  {
    key: 'wifi',
    label: 'WLAN',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13a8 8 0 0 1 14 0" />
        <path d="M8 16a4 4 0 0 1 8 0" />
        <circle cx="12" cy="20" r="1" fill="currentColor" />
      </svg>
    ),
    num: '1.11',
    title: 'Wireless-Grundlagen',
    topic: 'wlan · 2.4 / 5 ghz',
  },
]

/* ==============================================================
   Custom form validation
   --------------------------------------------------------------
   Replaces the browser's native validation tooltip (which can't be
   styled and looks out of place on a dark cyber theme) with
   inline error messages we control. Returns true if valid.
   ============================================================== */
function validateFormCustom(form: HTMLFormElement): boolean {
  const fields = Array.from(form.elements) as Array<HTMLInputElement | HTMLTextAreaElement>
  let firstInvalid: HTMLElement | null = null
  let allValid = true

  fields.forEach(field => {
    if (!('validity' in field) || !field.willValidate) return
    const wrapper =
      (field.closest('label') as HTMLElement | null) ??
      (field.parentElement as HTMLElement | null)
    if (!wrapper) return

    // Always clean up old error before re-checking
    wrapper.classList.remove('is-invalid')
    const oldErr = wrapper.querySelector('.form-error')
    if (oldErr) oldErr.remove()

    if (!field.checkValidity()) {
      allValid = false
      wrapper.classList.add('is-invalid')

      // Pick a friendly German message based on what's wrong
      let msg = 'Bitte prüfe diese Eingabe.'
      const v = field.validity
      if (v.valueMissing) msg = 'Dieses Feld wird benötigt.'
      else if (v.typeMismatch && field.type === 'email') msg = 'Das sieht nicht wie eine gültige Email aus.'
      else if (v.tooShort) msg = `Mindestens ${(field as HTMLInputElement).minLength} Zeichen.`
      else if (v.patternMismatch) msg = 'Format passt nicht.'

      const errEl = document.createElement('small')
      errEl.className = 'form-error'
      errEl.setAttribute('role', 'alert')
      errEl.textContent = msg
      wrapper.appendChild(errEl)

      // Clear on next valid input from the user
      const onChange = () => {
        if (field.checkValidity()) {
          wrapper.classList.remove('is-invalid')
          wrapper.querySelector('.form-error')?.remove()
          field.removeEventListener('input', onChange)
        }
      }
      field.addEventListener('input', onChange)

      if (!firstInvalid) firstInvalid = field
    }
  })

  if (!allValid && firstInvalid) {
    ;(firstInvalid as HTMLElement).focus({ preventScroll: false })
  }
  return allValid
}

/* ==============================================================
   Email notifications via Web3Forms
   --------------------------------------------------------------
   Firebase can't send email on its own (needs paid Cloud Functions
   + SMTP). Web3Forms is a free static-site form backend: we POST the
   submission and it emails Artin.smdzat@gmail.com. Get a free access
   key at https://web3forms.com (no account needed) and paste it below.
   ============================================================== */
const WEB3FORMS_KEY = '73354bfd-014e-4319-a9cd-060de66d249c'

async function sendEmailNotification(fields: Record<string, string>): Promise<void> {
  if (!WEB3FORMS_KEY || WEB3FORMS_KEY.startsWith('PASTE_')) {
    // Key not set yet — skip silently so the UI flow still works.
    console.warn('[Networkly] Web3Forms key not set — email not sent.')
    return
  }
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...fields }),
  })
  if (!res.ok) throw new Error('Web3Forms request failed')
}

function TopicPicker({ onOpenLessons }: TopicPickerProps) {
  const [active, setActive] = useState<string>(TOPICS[0].key)
  const current = TOPICS.find(t => t.key === active) ?? TOPICS[0]

  return (
    <>
      {/* Tab row */}
      <div className="topic-picker" role="tablist" aria-label="Vorschau-Themen">
        {TOPICS.map(t => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === active}
            aria-label={t.label}
            className={`topic-picker__tab${t.key === active ? ' is-active' : ''}`}
            onClick={() => setActive(t.key)}
          >
            {t.icon}
          </button>
        ))}
      </div>

      {/* Lesson "preview line" — terminal-styled card */}
      <button
        type="button"
        className="topic-card"
        onClick={onOpenLessons}
        aria-label={`Lektion ${current.num} öffnen`}
      >
        <span className="topic-card__prompt">$</span>
        <span className="topic-card__num">{current.num}</span>
        <span className="topic-card__title">{current.title}</span>
        <span className="topic-card__topic">{current.topic}</span>
        <span className="topic-card__open" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </button>
    </>
  )
}

/* ==============================================================
   LandingPage
   --------------------------------------------------------------
   Port of the static homepage from /Webpage to React.
   Markup mirrors the original 1:1; the JS modules are reborn here
   as `useEffect` lifecycles. Lessons from the CCNA curriculum live
   inside the "Join the community" popup (#lessons-in-popup).
   ============================================================== */
export default function LandingPage() {
  const navigate = useNavigate()
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
  const [popupOpen, setPopupOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const [popupAtBottom, setPopupAtBottom] = useState(false)
  // Firebase auth (Google sign-in from the sign-up popup)
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authBusy, setAuthBusy] = useState(false)
  // Legal modal (Datenschutz / Nutzungsbedingungen)
  const [legalDoc, setLegalDoc] = useState<'privacy' | 'terms' | null>(null)
  const [legalClosing, setLegalClosing] = useState(false)
  // "Get notified" download waitlist popup
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [notifyClosing, setNotifyClosing] = useState(false)
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const notifyInputRef = useRef<HTMLInputElement | null>(null)
  // Profile menu + progress (signed-in users)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [progressMap, setProgressMap] = useState<ProgressMap>({})
  const [settingsOpen, setSettingsOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  // Refs for elements the JS effects need to grab.
  const navRef = useRef<HTMLElement | null>(null)
  const scrollProgressRef = useRef<HTMLDivElement | null>(null)
  const heroCtaRef = useRef<HTMLAnchorElement | null>(null)
  const heroCtaInnerRef = useRef<HTMLSpanElement | null>(null)
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const marqueeRef = useRef<HTMLDivElement | null>(null)
  const curtainRef = useRef<HTMLDivElement | null>(null)
  const curtainCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const signupRef = useRef<HTMLDivElement | null>(null)
  const portfolioRef = useRef<HTMLDivElement | null>(null)
  const contactFormRef = useRef<HTMLFormElement | null>(null)
  const burgerRef = useRef<HTMLButtonElement | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)

  /* --------------------------------------------------------------
     Popup body lock + bottom-of-scroll detection (for the hint)
  ----------------------------------------------------------------- */
  useEffect(() => {
    const popup = popupRef.current
    if (!popup) return

    if (popupOpen) {
      // Lock the page behind the popup so wheel events don't move it.
      // Save & restore overflow + scroll position to avoid layout jumps.
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'

      // Reset popup scroll to top each time it opens
      popup.scrollTop = 0
      setPopupAtBottom(false)

      const onScroll = () => {
        const remaining = popup.scrollHeight - popup.scrollTop - popup.clientHeight
        setPopupAtBottom(remaining < 24)
      }
      // Initial check (if content fits without scrolling, hide the hint)
      requestAnimationFrame(() => {
        if (popup.scrollHeight <= popup.clientHeight + 4) setPopupAtBottom(true)
      })
      popup.addEventListener('scroll', onScroll, { passive: true })

      return () => {
        popup.removeEventListener('scroll', onScroll)
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        // After closing the lesson popup, deliver the user to the top of
        // the homepage rather than wherever they happened to be — that's
        // where the lesson list and CTA live, the most useful landing spot.
        window.scrollTo(0, 0)
      }
    }
  }, [popupOpen])

  /* --------------------------------------------------------------
     Sign-up popup body lock
  ----------------------------------------------------------------- */
  useEffect(() => {
    if (!signupOpen) return
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      const restoreY = parseInt(document.body.style.top || '0', 10) * -1
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, restoreY)
    }
  }, [signupOpen])

  /* --------------------------------------------------------------
     Firebase auth: keep the current user in sync + Google sign-in
  ----------------------------------------------------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setAuthUser(u))
    return unsub
  }, [])

  // Load the signed-in user's lesson progress (for the progress bars in
  // the lessons popup). Re-fetched whenever the lessons popup opens so it
  // reflects progress made since last open.
  useEffect(() => {
    if (!authUser) {
      setProgressMap({})
      return
    }
    let active = true
    fetchAllProgress(authUser.uid)
      .then((m) => {
        if (active) setProgressMap(m)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [authUser, popupOpen])

  // Close the profile dropdown on outside click / ESC
  useEffect(() => {
    if (!profileMenuOpen) return
    const onDown = (e: MouseEvent) => {
      if (!profileMenuRef.current?.contains(e.target as Node)) setProfileMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [profileMenuOpen])

  const handleLogout = async () => {
    setProfileMenuOpen(false)
    setSettingsOpen(false)
    try {
      await signOut(auth)
    } catch {
      /* ignore */
    }
  }

  const handleResetProgress = async () => {
    if (!authUser) return
    try {
      await resetAllProgress(authUser.uid)
      setProgressMap({})
    } catch {
      /* ignore */
    }
  }

  const handleGoogleSignIn = async () => {
    if (authBusy) return
    setAuthError(null)
    setAuthBusy(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      setAuthUser(result.user)
      // Reuse the popup's success state to show the confirmation
      signupRef.current?.classList.add('is-success')
    } catch (err) {
      const code = (err as { code?: string }).code
      // User simply closed / cancelled the Google window — not an error
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return
      }
      setAuthError('Anmeldung mit Google fehlgeschlagen. Bitte versuch es nochmal.')
    } finally {
      setAuthBusy(false)
    }
  }

  /* --------------------------------------------------------------
     Legal modal (Datenschutz / Nutzungsbedingungen) — smooth open/close
  ----------------------------------------------------------------- */
  const openLegal = (doc: 'privacy' | 'terms') => {
    setLegalClosing(false)
    setLegalDoc(doc)
  }
  const closeLegal = () => {
    setLegalClosing(true)
    window.setTimeout(() => {
      setLegalDoc(null)
      setLegalClosing(false)
    }, 240)
  }

  useEffect(() => {
    if (!legalDoc) return
    // Lock the page behind the modal
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLegal()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [legalDoc])

  /* --------------------------------------------------------------
     "Get notified" download waitlist popup — open/close + submit
  ----------------------------------------------------------------- */
  const openNotify = () => {
    setNotifyClosing(false)
    setNotifyStatus('idle')
    setNotifyOpen(true)
  }
  const closeNotify = () => {
    setNotifyClosing(true)
    window.setTimeout(() => {
      setNotifyOpen(false)
      setNotifyClosing(false)
      setNotifyStatus('idle')
    }, 240)
  }

  const handleNotifySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = notifyInputRef.current?.value.trim()
    if (!email) return
    setNotifyStatus('loading')
    // 1) Best-effort: store the email in Firestore (so you have the list).
    try {
      await addDoc(collection(db, 'download-waitlist'), {
        email,
        createdAt: serverTimestamp(),
        source: 'download-notify',
      })
    } catch (err) {
      console.warn('[Networkly] Firestore write skipped:', err)
    }
    // 2) Email Artin via Web3Forms.
    try {
      await sendEmailNotification({
        subject: 'Networkly — Neue Download-Waitlist Anmeldung',
        from_name: 'Networkly Waitlist',
        email,
        message: `Neue Anmeldung für die Desktop-App Waitlist:\n\n${email}`,
      })
      setNotifyStatus('done')
    } catch {
      setNotifyStatus('error')
    }
  }

  useEffect(() => {
    if (!notifyOpen) return
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeNotify()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [notifyOpen])

  /* --------------------------------------------------------------
     Lesson totals (used in the popup header)
  ----------------------------------------------------------------- */
  const totalSteps = lessons.reduce(
    (acc, l) => acc + l.subtopics.reduce((a, st) => a + st.steps.length, 0),
    0
  )

  /* --------------------------------------------------------------
     Hardening: disable text selection, image drag and right-click on
     the homepage. Forms (inputs/textareas) still work normally.
     This is cosmetic protection — anyone with DevTools can bypass it,
     but it raises the bar for casual save-as / copy attempts.
  ----------------------------------------------------------------- */
  useEffect(() => {
    document.body.classList.add('is-homepage')

    const onContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      // Allow right-click in form fields so paste / browser autofill works
      if (target.closest('input, textarea, [contenteditable="true"]')) return
      e.preventDefault()
    }
    const onDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (target.tagName === 'IMG' || target.closest('img')) {
        e.preventDefault()
      }
    }
    const onSelectStart = (e: Event) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      // Always permit selection inside form controls
      if (target.closest('input, textarea, [contenteditable="true"]')) return
      e.preventDefault()
    }

    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('dragstart', onDragStart)
    document.addEventListener('selectstart', onSelectStart)

    return () => {
      document.body.classList.remove('is-homepage')
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('dragstart', onDragStart)
      document.removeEventListener('selectstart', onSelectStart)
    }
  }, [])

  /* --------------------------------------------------------------
     Sticky nav: toggles `.is-scrolled`
  ----------------------------------------------------------------- */
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const update = () => nav.classList.toggle('is-scrolled', window.scrollY > 20)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  /* --------------------------------------------------------------
     Mobile menu toggle / close on resize / ESC
  ----------------------------------------------------------------- */
  useEffect(() => {
    const burger = burgerRef.current
    const menu = mobileMenuRef.current
    if (!burger || !menu) return

    const open = () => {
      menu.classList.add('is-open')
      menu.setAttribute('aria-hidden', 'false')
      burger.classList.add('is-open')
      burger.setAttribute('aria-expanded', 'true')
      document.body.style.overflow = 'hidden'
    }
    const close = () => {
      menu.classList.remove('is-open')
      menu.setAttribute('aria-hidden', 'true')
      burger.classList.remove('is-open')
      burger.setAttribute('aria-expanded', 'false')
      document.body.style.overflow = ''
    }
    const toggle = () => (menu.classList.contains('is-open') ? close() : open())
    const onMenuClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('[data-mobile-close]')) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) close()
    }
    const onResize = () => {
      if (window.innerWidth > 720 && menu.classList.contains('is-open')) close()
    }

    burger.addEventListener('click', toggle)
    menu.addEventListener('click', onMenuClick)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      burger.removeEventListener('click', toggle)
      menu.removeEventListener('click', onMenuClick)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  /* --------------------------------------------------------------
     Native scrolling
     We deliberately do NOT install a custom wheel-eased scroll handler
     here. A previous version did, but `preventDefault()` on every wheel
     event blocks Chrome's passive-scroll optimization and competes with
     the native scroll, which felt laggy. The browser's smooth-scroll
     plus our `html { scroll-behavior: smooth }` covers anchor jumps.
  ----------------------------------------------------------------- */

  /* --------------------------------------------------------------
     Scroll progress capsule
  ----------------------------------------------------------------- */
  useEffect(() => {
    const el = scrollProgressRef.current
    if (!el) return
    const valueEl = el.querySelector('.scroll-progress__value') as HTMLElement | null
    if (!valueEl) return

    let hideTimer: number | undefined
    let raf: number | null = null

    const update = () => {
      raf = null
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) {
        el.classList.remove('is-visible')
        return
      }
      const ratio = Math.min(Math.max(window.scrollY / max, 0), 1)
      const percent = Math.round(ratio * 100)
      const viewportH = window.innerHeight
      const thumbH = Math.max((viewportH / document.documentElement.scrollHeight) * viewportH, 30)
      const thumbMid = ratio * (viewportH - thumbH) + thumbH / 2
      valueEl.textContent = `${percent}%`
      el.style.transform = `translateY(${thumbMid}px)`
      el.classList.add('is-visible')
      window.clearTimeout(hideTimer)
      hideTimer = window.setTimeout(() => el.classList.remove('is-visible'), 900)
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.clearTimeout(hideTimer)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  /* --------------------------------------------------------------
     Trusted-by marquee with smooth hover slowdown
  ----------------------------------------------------------------- */
  useEffect(() => {
    const marquee = marqueeRef.current
    const track = trackRef.current
    if (!marquee || !track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const NORMAL = 60
    const HOVER = 22
    let speed = NORMAL
    let targetSpeed = NORMAL
    let position = 0
    let lastTime = performance.now()
    let halfWidth = 0
    let raf = 0
    let stopped = false
    let visible = true

    const measure = () => {
      halfWidth = track.scrollWidth / 2
    }
    measure()
    const onResize = () => measure()
    window.addEventListener('resize', onResize)

    const onEnter = () => (targetSpeed = HOVER)
    const onLeave = () => (targetSpeed = NORMAL)
    marquee.addEventListener('mouseenter', onEnter)
    marquee.addEventListener('mouseleave', onLeave)

    // Pause the rAF loop when the marquee is scrolled off-screen.
    // Saves CPU/GPU and keeps the rest of the page scroll smooth.
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (!e) return
        const wasVisible = visible
        visible = e.isIntersecting
        if (visible && !wasVisible && !stopped) {
          // Resume — reset lastTime so dt doesn't jump
          lastTime = performance.now()
          raf = requestAnimationFrame(tick)
        }
      },
      { rootMargin: '120px' },
    )
    io.observe(marquee)

    const tick = (now: number) => {
      if (stopped || !visible) return
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      speed += (targetSpeed - speed) * Math.min(dt * 4, 1)
      position -= speed * dt
      if (halfWidth > 0 && -position >= halfWidth) position += halfWidth
      track.style.transform = `translate3d(${position}px, 0, 0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame((t) => {
      lastTime = t
      tick(t)
    })

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', onResize)
      marquee.removeEventListener('mouseenter', onEnter)
      marquee.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  /* --------------------------------------------------------------
     Portfolio view switcher (about ↔ contact ↔ sent)
  ----------------------------------------------------------------- */
  useEffect(() => {
    const root = portfolioRef.current
    if (!root) return
    const views: Record<string, HTMLElement | null> = {
      about: root.querySelector('[data-view="about"]'),
      contact: root.querySelector('[data-view="contact"]'),
      sent: root.querySelector('[data-view="sent"]'),
    }
    const form = contactFormRef.current

    const switchTo = (name: string) => {
      const next = views[name]
      if (!next) return
      const current = Object.values(views).find((el) => el && !el.hidden) as HTMLElement | undefined
      if (current === next) return

      // Cross-fade: leaving view fades out, after 280ms we hide it and
      // fade the entering view in. Both share the same grid cell so the
      // layout height never changes; pure opacity, no transform.
      if (current) {
        current.classList.add('is-leaving')
        window.setTimeout(() => {
          current.hidden = true
          current.classList.remove('is-leaving')
          next.hidden = false
          next.classList.add('is-entering')
          void next.offsetWidth
          next.classList.remove('is-entering')
        }, 280)
      } else {
        next.hidden = false
      }
    }

    const onClick = (e: Event) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>('[data-action]')
      if (!target) return
      const action = target.dataset.action
      if (action === 'open-contact') {
        e.preventDefault()
        // If the button itself is already visible (which it usually is —
        // user just clicked it), skip the scroll. Only scroll when the
        // trigger lives off-screen (e.g. the footer "Kontakt" link).
        const triggerRect = target.getBoundingClientRect()
        const triggerVisible =
          triggerRect.top < window.innerHeight && triggerRect.bottom > 0
        if (!triggerVisible) {
          const aboutEl = document.getElementById('about')
          if (aboutEl) {
            aboutEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
            // Wait for smooth scroll to settle before flipping the view
            window.setTimeout(() => switchTo('contact'), 480)
            return
          }
        }
        switchTo('contact')
      }
      if (action === 'cancel-contact') switchTo('about')
      if (action === 'back-about') {
        form?.reset()
        switchTo('about')
      }
    }
    const onSubmit = (e: Event) => {
      e.preventDefault()
      if (!form) return
      if (!validateFormCustom(form)) return
      // Fire the email off to Artin via Web3Forms. We don't block the
      // animation on the network — the send-btn focus animation plays
      // (~2.5s) and we switch to the "sent" view regardless, so the UX
      // stays smooth even on a slow connection.
      const data = new FormData(form)
      void sendEmailNotification({
        subject: 'Networkly — Neue Kontakt-Nachricht',
        from_name: String(data.get('name') || 'Website Kontakt'),
        email: String(data.get('email') || ''),
        message: String(data.get('message') || ''),
      }).catch(() => {
        /* swallow — the visual confirmation already played */
      })
      window.setTimeout(() => switchTo('sent'), 2600)
    }
    // Listen on the document so triggers outside the portfolio block (footer
    // links, hero buttons, etc.) also work.
    document.addEventListener('click', onClick)
    form?.addEventListener('submit', onSubmit)
    return () => {
      document.removeEventListener('click', onClick)
      form?.removeEventListener('submit', onSubmit)
    }
  }, [])

  /* --------------------------------------------------------------
     Curtain transition (binary rain) + popup open trigger
  ----------------------------------------------------------------- */
  useEffect(() => {
    const curtain = curtainRef.current
    const canvas = curtainCanvasRef.current
    if (!curtain || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let columns: number[] = []
    const FONT_SIZE = 16
    const COLUMN_GAP = 1.6
    let raf: number | null = null

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const colCount = Math.ceil(width / (FONT_SIZE * COLUMN_GAP))
      columns = new Array(colCount).fill(0).map(() => (Math.random() * height) / FONT_SIZE)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`
      ctx.textBaseline = 'top'
      for (let i = 0; i < columns.length; i++) {
        const x = i * FONT_SIZE * COLUMN_GAP
        const y = columns[i] * FONT_SIZE
        ctx.fillStyle = 'rgba(235, 235, 235, 0.85)'
        ctx.fillText(Math.random() > 0.5 ? '1' : '0', x, y)
        ctx.fillStyle = 'rgba(170, 170, 170, 0.32)'
        ctx.fillText(Math.random() > 0.5 ? '1' : '0', x, y - FONT_SIZE)
        if (y > height && Math.random() > 0.97) columns[i] = 0
        else columns[i] += 0.9 + Math.random() * 0.5
      }
      raf = requestAnimationFrame(draw)
    }

    const start = () => {
      resize()
      if (!raf) draw()
    }
    const stop = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = null
    }

    const onResize = () => {
      if (curtain.classList.contains('is-active')) resize()
    }
    window.addEventListener('resize', onResize)

    const triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-curtain]'))
    const handlers = new Map<HTMLElement, (e: Event) => void>()
    triggers.forEach((link) => {
      const h = (e: Event) => {
        e.preventDefault()
        start()
        curtain.classList.add('is-active')
        const popupName = link.dataset.popup
        window.setTimeout(() => {
          if (popupName === 'signup') {
            signupRef.current?.classList.add('is-open')
            setSignupOpen(true)
          } else if (popupName) {
            popupRef.current?.classList.add('is-open')
            setPopupOpen(true)
          }
          stop()
          const panel = curtain.querySelector<HTMLDivElement>('.curtain__panel')
          if (panel) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            panel.style.transition = 'opacity 0.35s ease'
            panel.style.opacity = '0'
          }
          window.setTimeout(() => {
            curtain.classList.remove('is-active')
            if (panel) {
              panel.style.transition = ''
              panel.style.transform = ''
              panel.style.opacity = ''
            }
          }, 380)
        }, 700)
      }
      handlers.set(link, h)
      link.addEventListener('click', h)
    })

    return () => {
      stop()
      window.removeEventListener('resize', onResize)
      triggers.forEach((link) => {
        const h = handlers.get(link)
        if (h) link.removeEventListener('click', h)
      })
    }
  }, [])

  /* --------------------------------------------------------------
     Lessons popup close handlers (no email form anymore)
  ----------------------------------------------------------------- */
  useEffect(() => {
    const popup = popupRef.current
    if (!popup) return

    const closePopup = () => {
      popup.classList.remove('is-open')
      setPopupOpen(false)
    }
    const onClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (
        target.matches('[data-popup-close]') ||
        target.closest('[data-popup-close]') ||
        target.classList.contains('popup__backdrop')
      ) {
        closePopup()
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && popup.classList.contains('is-open')) closePopup()
    }
    popup.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      popup.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  /* --------------------------------------------------------------
     Sign-up popup close handlers (Google-only, no email form)
  ----------------------------------------------------------------- */
  useEffect(() => {
    const popup = signupRef.current
    if (!popup) return

    const closePopup = () => {
      popup.classList.remove('is-open')
      setSignupOpen(false)
      setAuthError(null)
      window.setTimeout(() => popup.classList.remove('is-success'), 500)
    }
    const onClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (
        target.matches('[data-popup-close]') ||
        target.closest('[data-popup-close]') ||
        target.classList.contains('signup__backdrop')
      ) {
        closePopup()
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && popup.classList.contains('is-open')) closePopup()
    }
    popup.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      popup.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  /* --------------------------------------------------------------
     Hero magnetic CTA + per-letter glitch
  ----------------------------------------------------------------- */
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches

    const cta = heroCtaRef.current
    const ctaInner = heroCtaInnerRef.current
    const title = heroTitleRef.current

    // Magnetic CTA
    let mmove: ((e: MouseEvent) => void) | null = null
    let mleave: (() => void) | null = null
    if (!reduce && !isTouch && cta && ctaInner) {
      const STRENGTH = 14
      const INNER_PULL = 6
      mmove = (e: MouseEvent) => {
        const r = cta.getBoundingClientRect()
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
        cta.style.transform = `translate(${dx * STRENGTH}px, ${dy * STRENGTH}px)`
        ctaInner.style.transform = `translate(${dx * INNER_PULL}px, ${dy * INNER_PULL}px)`
      }
      mleave = () => {
        cta.style.transform = ''
        ctaInner.style.transform = ''
      }
      cta.addEventListener('mousemove', mmove)
      cta.addEventListener('mouseleave', mleave)
    }

    // Per-letter glitch
    let glitchTimers: number[] = []
    let stopped = false
    let originalTitleHTML: string | null = null
    if (title && !reduce) {
      // Save the un-transformed markup so StrictMode's double-invocation
      // (and our cleanup) can restore it before the next run rewraps it.
      originalTitleHTML = title.innerHTML

      const lines = title.innerHTML
        .split(/<br\s*\/?>/i)
        .map((l) => l.replace(/^\s+|\s+$/g, ''))
        .filter(Boolean)

      title.innerHTML = lines
        .map((line) =>
          line
            .split('')
            .map((ch) => {
              if (ch === ' ') return '<span class="ch sp">&nbsp;</span>'
              return (
                `<span class="ch" data-c="${ch}">` +
                `<span class="ch__o">${ch}</span>` +
                `<span class="ch__g" aria-hidden="true"></span>` +
                `</span>`
              )
            })
            .join('')
        )
        .join('<br>')

      const letters = title.querySelectorAll<HTMLElement>('.ch:not(.sp)')
      const GLITCH = '!@#$%^&*()_+=[]{}<>/?\\|~`01010110ΞΣΦΩЖҖҨΔΘΛΞΠΣΦΨΩ█▓▒░'
      const randomChar = () => GLITCH[Math.floor(Math.random() * GLITCH.length)]

      const glitchLetter = (letter: HTMLElement) => {
        if (letter.classList.contains('is-glitch')) return
        const fx = letter.querySelector<HTMLElement>('.ch__g')
        if (!fx) return
        letter.classList.add('is-glitch')
        const swaps = 4 + Math.floor(Math.random() * 4)
        let i = 0
        const step = () => {
          if (stopped) return
          if (i < swaps) {
            fx.textContent = randomChar()
            i++
            const t = window.setTimeout(step, 45 + Math.random() * 45)
            glitchTimers.push(t)
          } else {
            fx.textContent = ''
            letter.classList.remove('is-glitch')
          }
        }
        step()
      }

      // Pause the glitch tick while the hero is off-screen — saves DOM
      // mutations during scroll and keeps the rest of the page smooth.
      let heroVisible = true
      const heroIO = new IntersectionObserver(
        (entries) => {
          const e = entries[0]
          if (e) heroVisible = e.isIntersecting
        },
        { rootMargin: '0px' },
      )
      heroIO.observe(title)

      const tick = () => {
        if (stopped) return
        if (heroVisible) {
          const count = Math.random() < 0.25 ? 2 + Math.floor(Math.random() * 3) : 1
          for (let i = 0; i < count; i++) {
            const target = letters[Math.floor(Math.random() * letters.length)]
            if (target) {
              const t = window.setTimeout(() => glitchLetter(target), i * 60)
              glitchTimers.push(t)
            }
          }
        }
        const t = window.setTimeout(tick, 400 + Math.random() * 300)
        glitchTimers.push(t)
      }
      const initial = window.setTimeout(tick, 1500)
      glitchTimers.push(initial)

      // Stash IO so the cleanup can disconnect it
      ;(title as HTMLElement & { __heroIO?: IntersectionObserver }).__heroIO = heroIO
    }

    return () => {
      stopped = true
      glitchTimers.forEach((t) => window.clearTimeout(t))
      if (cta && mmove) cta.removeEventListener('mousemove', mmove)
      if (cta && mleave) cta.removeEventListener('mouseleave', mleave)
      // Disconnect the visibility observer
      const heroIO = (title as HTMLElement & { __heroIO?: IntersectionObserver } | null)?.__heroIO
      heroIO?.disconnect()
      // Restore the un-transformed title so StrictMode's second pass
      // (or any future remount) doesn't wrap already-wrapped letters.
      if (title && originalTitleHTML !== null) {
        title.innerHTML = originalTitleHTML
      }
    }
  }, [])

  /* --------------------------------------------------------------
     Render
  ----------------------------------------------------------------- */
  return (
    <>
      {/* Curtain overlay */}
      <div className="curtain" id="curtain" aria-hidden="true" ref={curtainRef}>
        <div className="curtain__panel">
          <canvas className="curtain__binary" ref={curtainCanvasRef} />
        </div>
      </div>

      {/* Scroll progress */}
      <div className="scroll-progress" ref={scrollProgressRef} aria-hidden="true">
        <span className="scroll-progress__value">0%</span>
        <span className="scroll-progress__line"></span>
      </div>

      {/* Popup with lessons */}
      <div className="popup" ref={popupRef} aria-hidden="true" role="dialog" aria-labelledby="popupTitle">
        <div className="popup__backdrop"></div>
        {/* Soft fade gradient at the bottom (fades out at scroll-end) */}
        <div
          className={`popup__fade${popupAtBottom ? ' is-hidden' : ''}`}
          aria-hidden="true"
        ></div>
        {/* Scroll hint pill — white glow on dark fade */}
        <div
          className={`popup__scroll-hint${popupAtBottom ? ' is-hidden' : ''}`}
          aria-hidden="true"
        >
          <span>Scroll für mehr</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        <div className="popup__panel" role="document">
          <button className="popup__close" type="button" aria-label="Close" data-popup-close>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <p className="popup__eyebrow">CURRICULUM · KAPITEL 1</p>
          <h2 className="popup__title" id="popupTitle">
            Network <em>Fundamentals</em>
          </h2>
          <p className="popup__text">
            Alle Lektionen visuell erklärt, Schritt für Schritt. Melde dich an, um deinen
            Fortschritt zu speichern — für die Nutzung ist das aber nicht nötig.
          </p>

          {/* === Lessons inside the popup === */}
          <section className="popup__lessons" id="lessons-in-popup">
            <div className="popup__lessons-head">
              <span className="popup__lessons-meta">
                {lessons.length} Lektionen · {totalSteps} Steps
              </span>
            </div>

            {authUser && (() => {
              const inProgress = lessons.find(
                (l) => progressMap[l.id] && !progressMap[l.id].completed,
              )
              if (!inProgress) return null
              const p = progressMap[inProgress.id]
              return (
                <button
                  type="button"
                  className="lesson-continue"
                  onClick={() =>
                    navigate(`/lesson/${inProgress.id}`, { state: { flatIndex: p.stepIndex } })
                  }
                >
                  <div className="lesson-continue__text">
                    <span className="lesson-continue__eyebrow">▸ Weitermachen wo du warst</span>
                    <span className="lesson-continue__title">
                      {inProgress.number} · {inProgress.title}
                    </span>
                  </div>
                  <span className="lesson-continue__arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </button>
              )
            })()}

            <div className="lesson-list">
              {lessons.map((lesson) => {
                const stepCount = lesson.subtopics.reduce((a, st) => a + st.steps.length, 0)
                const isOpen = expandedLesson === lesson.id
                const prog = progressMap[lesson.id]
                const pct = prog
                  ? Math.min(
                      100,
                      Math.round(
                        ((prog.completed ? prog.totalSteps : prog.furthest + 1) /
                          (prog.totalSteps || stepCount)) *
                          100,
                      ),
                    )
                  : 0
                return (
                  <div key={lesson.id} className={`lesson${isOpen ? ' is-open' : ''}`}>
                    <div
                      className="lesson__header"
                      onClick={() => setExpandedLesson(isOpen ? null : lesson.id)}
                    >
                      <div className="lesson__left">
                        <span className="lesson__num">{lesson.number}</span>
                        <div className="lesson__text">
                          <h4 className="lesson__title">{lesson.title}</h4>
                          <p className="lesson__subtitle">{lesson.subtitle}</p>
                          {authUser && prog && (
                            <div className="lesson__progress">
                              <div className="lesson__progress-track">
                                <span
                                  className={`lesson__progress-fill${prog.completed ? ' is-complete' : ''}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="lesson__progress-label">
                                {prog.completed ? '✓ Abgeschlossen' : `${pct}%`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="lesson__right">
                        <span className="lesson__count">{stepCount} Steps</span>
                        <button
                          type="button"
                          className="lesson__editor"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/editor/${lesson.id}`)
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 1 0 1.4L8 14.4 4 16l1.6-4 6.7-6.7a1 1 0 0 1 1.4 0l1 1zM13 7l4 4" />
                          </svg>
                          Editor
                        </button>
                        <button
                          type="button"
                          className="lesson__open"
                          aria-label={`Open lesson ${lesson.number}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/lesson/${lesson.id}`)
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </button>
                        <svg
                          className="lesson__chevron"
                          viewBox="0 0 24 24"
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="lesson__body">
                        {lesson.subtopics.map((sub, si) => (
                          <div key={sub.id}>
                            <div className="subtopic__head">
                              <span className="subtopic__id">{sub.id}</span>
                              <span className="subtopic__title">{sub.title}</span>
                              <span className="subtopic__count">
                                {sub.steps.length} {sub.steps.length === 1 ? 'Step' : 'Steps'}
                              </span>
                            </div>
                            <div className="subtopic__steps">
                              {sub.steps.map((step, sti) => (
                                <button
                                  key={sti}
                                  type="button"
                                  className="subtopic__step"
                                  onClick={() =>
                                    navigate(`/lesson/${lesson.id}`, {
                                      state: { subtopicIndex: si, stepIndex: sti },
                                    })
                                  }
                                >
                                  {step.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Sign-up popup — login-card style, clean monochrome */}
      <div className="signup" ref={signupRef} aria-hidden="true" role="dialog" aria-labelledby="signupTitle">
        <div className="signup__backdrop"></div>
        <div className="signup__panel" role="document">
          <button className="signup__close" type="button" aria-label="Close" data-popup-close>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>

          {/* Title bar — big heading with rule underneath */}
          <div className="signup__head">
            <h2 className="signup__title" id="signupTitle">Sign up</h2>
            <span className="signup__head-meta">EARLY · BETA</span>
          </div>
          <div className="signup__rule" aria-hidden="true"></div>

          <p className="signup__subtitle">
            Melde dich an, um deinen Lernfortschritt zu speichern. Für die Nutzung ist das nicht zwingend nötig.
          </p>

          <button
            type="button"
            className="signup__google"
            onClick={handleGoogleSignIn}
            disabled={authBusy}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="#4285F4" d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.27a12 12 0 0 0 0 10.76l4-3.09z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
            </svg>
            {authBusy ? 'Wird angemeldet…' : 'Mit Google anmelden'}
          </button>

          {authError && (
            <p className="signup__error" role="alert">{authError}</p>
          )}

          <p className="signup__hint">
            Kein Spam — nur eine Nachricht zum Launch.
          </p>

          <p className="signup__success" role="status">
            {authUser
              ? `✓ Eingeloggt als ${authUser.displayName ?? authUser.email}`
              : "✓ ACCESS REQUESTED · WE'LL BE IN TOUCH"}
          </p>
        </div>
      </div>

      {/* Sticky nav */}
      <header className="nav" id="nav" ref={navRef}>
        <div className="nav__inner">
          <a href="#top" className="nav__brand" aria-label="Netly Home">
            <img
              src="/Netly-Logo.png"
              alt=""
              aria-hidden="true"
              draggable={false}
              className="nav__logo"
            />
            <span className="nav__brand-name">Netly</span>
          </a>

          <nav className="nav__links" aria-label="Primary">
            <a href="#about">
              <span>Über</span>
            </a>
            <a href="#" data-curtain data-popup="join">
              <span>Lektionen</span>
            </a>
            <a href="#cta">
              <span>Vorschau</span>
            </a>
          </nav>

          <div className="nav__actions">
            <button
              type="button"
              className="nav__download"
              onClick={openNotify}
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                <path d="M0 3.5l9.9-1.4v9.5H0V3.5zm11.1-1.6L24 0v11.6H11.1V1.9zM24 12.4v11.5l-12.9-1.8V12.4H24zM9.9 22l-9.9-1.4v-8.2h9.9V22z"/>
              </svg>
              <span>Download</span>
            </button>

            {authUser ? (
              <div className="nav__profile" ref={profileMenuRef}>
                <button
                  type="button"
                  className="nav__avatar"
                  aria-label="Profilmenü"
                  aria-expanded={profileMenuOpen}
                  onClick={() => setProfileMenuOpen((o) => !o)}
                >
                  {authUser.photoURL ? (
                    <img src={authUser.photoURL} alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="nav__avatar-fallback">
                      {(authUser.displayName ?? authUser.email ?? '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>

                {profileMenuOpen && (
                  <div className="nav__menu" role="menu">
                    <div className="nav__menu-head">
                      {authUser.photoURL && (
                        <img src={authUser.photoURL} alt="" referrerPolicy="no-referrer" className="nav__menu-avatar" />
                      )}
                      <div className="nav__menu-id">
                        <span className="nav__menu-name">{authUser.displayName ?? 'Eingeloggt'}</span>
                        <span className="nav__menu-email">{authUser.email}</span>
                      </div>
                    </div>
                    <div className="nav__menu-sep" aria-hidden="true"></div>
                    <button
                      type="button"
                      className="nav__menu-item"
                      role="menuitem"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        const trigger = document.getElementById('lessons-cta')
                        ;(trigger as HTMLAnchorElement | null)?.click()
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      Mein Fortschritt
                    </button>
                    <button
                      type="button"
                      className="nav__menu-item"
                      role="menuitem"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        setSettingsOpen(true)
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      Einstellungen
                    </button>
                    <button
                      type="button"
                      className="nav__menu-item nav__menu-item--danger"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                      Abmelden
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a href="#" className="nav__signin" data-curtain data-popup="signup">
                <span>Sign up</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            )}
          </div>

          <button
            className="nav__burger"
            ref={burgerRef}
            type="button"
            aria-label="Open menu"
            aria-expanded="false"
            aria-controls="mobileMenu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className="mobile-menu" id="mobileMenu" aria-hidden="true" ref={mobileMenuRef}>
        <div className="mobile-menu__backdrop" data-mobile-close></div>
        <nav className="mobile-menu__panel" aria-label="Mobile">
          <a href="#about" data-mobile-close>Über</a>
          <a href="#" data-curtain data-popup="join" data-mobile-close>Lektionen</a>
          <a href="#cta" data-mobile-close>Vorschau</a>
          <a href="#" className="mobile-menu__cta" data-curtain data-popup="signup" data-mobile-close>
            Sign up
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </nav>
      </div>

      {/* Hero */}
      <section className="hero" id="top">
        <img src="/Hero-Image.jpeg" alt="Zwei Hände, die sich einander entgegenstrecken" className="hero__bg" draggable={false} />
        <div className="hero__overlay"></div>
        <div className="hero__noise" aria-hidden="true"></div>

        <div className="hero__content">
          <h1 className="hero__title" ref={heroTitleRef}>
            Networking<br />
            verstehen, indem<br />
            man es sieht
          </h1>
          <p className="hero__subtitle">
            Interaktive Netzwerk-Simulationen, Paket-Animationen und<br />
            Schritt-für-Schritt-Erklärungen — gebaut für Einsteiger.
          </p>
          <div className="hero__ctas">
            <a href="#" className="hero__cta" data-curtain data-popup="join" ref={heroCtaRef} role="button">
              <span className="hero__cta-inner" ref={heroCtaInnerRef}>
                Lektionen ansehen
                <span className="hero__cta-arrow">↗</span>
              </span>
            </a>
            <button
              type="button"
              className="hero__cta hero__cta--outline"
              onClick={openNotify}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M0 3.5l9.9-1.4v9.5H0V3.5zm11.1-1.6L24 0v11.6H11.1V1.9zM24 12.4v11.5l-12.9-1.8V12.4H24zM9.9 22l-9.9-1.4v-8.2h9.9V22z"/>
              </svg>
              <span>Download für Windows</span>
            </button>
          </div>
        </div>

        <a href="#cta" className="hero__scroll" aria-label="Scroll down">
          <span className="hero__scroll-mouse">
            <span className="hero__scroll-wheel"></span>
          </span>
          <span className="hero__scroll-label">SCROLL</span>
        </a>
      </section>

      {/* Topics strip */}
      <section className="trusted">
        <p className="trusted__label">WAS DU HIER LERNST</p>
        <div className="trusted__marquee" ref={marqueeRef}>
          <div className="trusted__track" ref={trackRef}>
            {/* Two duplicate sets for seamless loop */}
            {[0, 1].map((set) => (
              <div key={set} style={{ display: 'contents' }} aria-hidden={set === 1 ? true : undefined}>
                <div className="trusted__logo">
                  <span className="logo-text logo-text--serif">Routing</span>
                </div>
                <div className="trusted__logo">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="9" width="18" height="6" rx="1.5" />
                    <path d="M7 12h.01M11 12h.01M15 12h.01" />
                  </svg>
                  <span className="logo-text">Switching</span>
                </div>
                <div className="trusted__logo">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="logo-text">Firewalls</span>
                </div>
                <div className="trusted__logo">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 13a8 8 0 0 1 14 0" />
                    <path d="M8 16a4 4 0 0 1 8 0" />
                    <circle cx="12" cy="20" r="1" fill="currentColor" />
                  </svg>
                  <span className="logo-text">WLAN</span>
                </div>
                <div className="trusted__logo">
                  <span className="logo-text logo-text--lower">tcp/ip</span>
                </div>
                <div className="trusted__logo">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="6" width="18" height="3" rx="0.5" />
                    <rect x="3" y="11" width="18" height="3" rx="0.5" />
                    <rect x="3" y="16" width="18" height="3" rx="0.5" />
                  </svg>
                  <span className="logo-text">OSI Modell</span>
                </div>
                <div className="trusted__logo">
                  <span className="logo-text logo-text--serif">Subnetting</span>
                </div>
                <div className="trusted__logo">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                  </svg>
                  <span className="logo-text">DNS</span>
                </div>
                <div className="trusted__logo">
                  <span className="logo-text">VLANs</span>
                </div>
                <div className="trusted__logo">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="6" width="18" height="12" rx="2" />
                    <path d="M3 11h18" />
                    <circle cx="7" cy="14.5" r="1" fill="currentColor" />
                  </svg>
                  <span className="logo-text">DHCP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lesson preview section */}
      <section className="cta-section" id="cta">
        <h2 className="cta-section__title">
          Sieh selbst, wie es aussieht.<br />
          <em>Hier ein Vorgeschmack.</em>
        </h2>

        <div className="lesson-preview" id="lesson-preview">
          <img
            src="/Netzwerk-Beispiel.jpeg"
            alt="Beispielhaftes Netzwerk: PC schickt Datei über Switch an Server"
            className="lesson-preview__img"
            draggable={false}
          />
        </div>

        {/* Topic picker — pick a topic, see one of the lessons inside */}
        <TopicPicker onOpenLessons={() => {
          const trigger = document.getElementById('lessons-cta')
          ;(trigger as HTMLAnchorElement | null)?.click()
        }} />

        <a
          href="#"
          className="cta-section__link"
          id="lessons-cta"
          data-curtain
          data-popup="join"
        >
          <span className="cta-section__link-text">Mehr lernen · alle Lektionen ansehen</span>
          <span className="cta-section__link-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </a>
      </section>

      {/* Portfolio / About */}
      <section className="portfolio" id="about">
        <div className="portfolio__inner">
          <div className="portfolio__media">
            <div className="portfolio__frame">
              <div className="portfolio__image-wrap">
                <img src="/Bild-Normal.jpeg" alt="Portrait" className="portfolio__img portfolio__img--normal" draggable={false} />
                <img src="/Bild-Skiziert.jpeg" alt="Sketched portrait" className="portfolio__img portfolio__img--sketch" draggable={false} />
              </div>
            </div>
          </div>

          <div className="portfolio__content" ref={portfolioRef}>
            <div className="portfolio__view portfolio__view--about" data-view="about">
              <p className="portfolio__eyebrow">ÜBER</p>
              <h2 className="portfolio__title">
                Hi, ich bin <em>Artin.</em>
              </h2>
              <p className="portfolio__text">
                Ich lerne selbst gerade CCNA und baue Netly als das Tool, das ich
                gebraucht hätte — kein Wall-of-Text, sondern Netzwerke zum Beobachten.
              </p>

              <ul className="portfolio__list">
                <li><span>Rolle</span> Gründer &amp; Maker</li>
                <li><span>Standort</span> Österreich</li>
                <li><span>Fokus</span> Networking, Visual Learning</li>
              </ul>

              <div className="portfolio__cta-row">
                <button
                  type="button"
                  className="send-btn send-btn--simple"
                  data-action="open-contact"
                  aria-label="Schreib mir"
                >
                  <div className="send-btn__state send-btn__state--default">
                    <div className="send-btn__icon">
                      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <g style={{ filter: 'url(#schreib-shadow)' }}>
                          <path d="M14.2199 21.63C13.0399 21.63 11.3699 20.8 10.0499 16.83L9.32988 14.67L7.16988 13.95C3.20988 12.63 2.37988 10.96 2.37988 9.78001C2.37988 8.61001 3.20988 6.93001 7.16988 5.60001L15.6599 2.77001C17.7799 2.06001 19.5499 2.27001 20.6399 3.35001C21.7299 4.43001 21.9399 6.21001 21.2299 8.33001L18.3999 16.82C17.0699 20.8 15.3999 21.63 14.2199 21.63ZM7.63988 7.03001C4.85988 7.96001 3.86988 9.06001 3.86988 9.78001C3.86988 10.5 4.85988 11.6 7.63988 12.52L10.1599 13.36C10.3799 13.43 10.5599 13.61 10.6299 13.83L11.4699 16.35C12.3899 19.13 13.4999 20.12 14.2199 20.12C14.9399 20.12 16.0399 19.13 16.9699 16.35L19.7999 7.86001C20.3099 6.32001 20.2199 5.06001 19.5699 4.41001C18.9199 3.76001 17.6599 3.68001 16.1299 4.19001L7.63988 7.03001Z" fill="currentColor" />
                          <path d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z" fill="currentColor" />
                        </g>
                        <defs>
                          <filter id="schreib-shadow">
                            <feDropShadow dx="0" dy="1" stdDeviation="0.6" floodOpacity="0.5" />
                          </filter>
                        </defs>
                      </svg>
                    </div>
                    <p>
                      {['S', 'c', 'h', 'r', 'e', 'i', 'b', '\u00a0', 'm', 'i', 'r'].map((ch, i) => (
                        <span key={i} style={{ ['--i' as string]: i } as React.CSSProperties}>
                          {ch}
                        </span>
                      ))}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="portfolio__view portfolio__view--contact" data-view="contact" hidden>
              <p className="portfolio__eyebrow">KONTAKT</p>
              <h2 className="portfolio__title">
                Lass uns <em>reden.</em>
              </h2>

              <form className="contact-form" ref={contactFormRef} noValidate>
                <div className="contact-form__row">
                  <label className="contact-form__field">
                    <span>Name</span>
                    <input type="text" name="name" autoComplete="name" required />
                  </label>
                  <label className="contact-form__field">
                    <span>Email</span>
                    <input type="email" name="email" autoComplete="email" required />
                  </label>
                </div>
                <label className="contact-form__field">
                  <span>Nachricht</span>
                  <textarea name="message" rows={4} required></textarea>
                </label>

                <div className="portfolio__cta-row">
                  <button type="submit" className="send-btn" aria-label="Senden">
                    <div className="send-btn__outline" aria-hidden="true"></div>
                    <div className="send-btn__state send-btn__state--default">
                      <div className="send-btn__icon">
                        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <g style={{ filter: 'url(#send-btn-shadow)' }}>
                            <path d="M14.2199 21.63C13.0399 21.63 11.3699 20.8 10.0499 16.83L9.32988 14.67L7.16988 13.95C3.20988 12.63 2.37988 10.96 2.37988 9.78001C2.37988 8.61001 3.20988 6.93001 7.16988 5.60001L15.6599 2.77001C17.7799 2.06001 19.5499 2.27001 20.6399 3.35001C21.7299 4.43001 21.9399 6.21001 21.2299 8.33001L18.3999 16.82C17.0699 20.8 15.3999 21.63 14.2199 21.63ZM7.63988 7.03001C4.85988 7.96001 3.86988 9.06001 3.86988 9.78001C3.86988 10.5 4.85988 11.6 7.63988 12.52L10.1599 13.36C10.3799 13.43 10.5599 13.61 10.6299 13.83L11.4699 16.35C12.3899 19.13 13.4999 20.12 14.2199 20.12C14.9399 20.12 16.0399 19.13 16.9699 16.35L19.7999 7.86001C20.3099 6.32001 20.2199 5.06001 19.5699 4.41001C18.9199 3.76001 17.6599 3.68001 16.1299 4.19001L7.63988 7.03001Z" fill="currentColor" />
                            <path d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z" fill="currentColor" />
                          </g>
                          <defs>
                            <filter id="send-btn-shadow">
                              <feDropShadow dx="0" dy="1" stdDeviation="0.6" floodOpacity="0.5" />
                            </filter>
                          </defs>
                        </svg>
                      </div>
                      <p>
                        {['S', 'e', 'n', 'd', '\u00a0', 'M', 'e', 's', 's', 'a', 'g', 'e'].map((ch, i) => (
                          <span key={i} style={{ ['--i' as string]: i } as React.CSSProperties}>
                            {ch}
                          </span>
                        ))}
                      </p>
                    </div>
                    <div className="send-btn__state send-btn__state--sent">
                      <div className="send-btn__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="1em" width="1em" strokeWidth="0.5px" stroke="black" aria-hidden="true">
                          <g style={{ filter: 'url(#send-btn-shadow-2)' }}>
                            <path fill="currentColor" d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z" />
                            <path fill="currentColor" d="M10.5795 15.5801C10.3795 15.5801 10.1895 15.5001 10.0495 15.3601L7.21945 12.5301C6.92945 12.2401 6.92945 11.7601 7.21945 11.4701C7.50945 11.1801 7.98945 11.1801 8.27945 11.4701L10.5795 13.7701L15.7195 8.6301C16.0095 8.3401 16.4895 8.3401 16.7795 8.6301C17.0695 8.9201 17.0695 9.4001 16.7795 9.6901L11.1095 15.3601C10.9695 15.5001 10.7795 15.5801 10.5795 15.5801Z" />
                          </g>
                          <defs>
                            <filter id="send-btn-shadow-2">
                              <feDropShadow dx="0" dy="1" stdDeviation="0.6" floodOpacity="0.5" />
                            </filter>
                          </defs>
                        </svg>
                      </div>
                      <p>
                        {['S', 'e', 'n', 't'].map((ch, i) => (
                          <span key={i} style={{ ['--i' as string]: i + 5 } as React.CSSProperties}>
                            {ch}
                          </span>
                        ))}
                      </p>
                    </div>
                  </button>
                  <button type="button" className="portfolio__link portfolio__link--btn" data-action="cancel-contact">
                    ← Zurück
                  </button>
                </div>
              </form>
            </div>

            <div className="portfolio__view portfolio__view--sent" data-view="sent" hidden>
              <p className="portfolio__eyebrow">NACHRICHT GESENDET</p>
              <h2 className="portfolio__title">
                Danke, <em>ich melde mich.</em>
              </h2>
              <p className="portfolio__text">
                Deine Nachricht ist da. Antwort kommt meistens innerhalb von ein bis zwei Tagen.
              </p>
              <div className="portfolio__cta-row">
                <button type="button" className="portfolio__cta" data-action="back-about">
                  Zurück <span>↗</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__top">
            {/* Left — brand + legal */}
            <div className="footer__brand">
              <div className="footer__brand-mark">
                <span className="footer__brand-logo" aria-hidden="true">
                  <img
                    src="/Netly-Logo.png"
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="footer__brand-logo-img"
                  />
                </span>
                <span className="footer__brand-name">Netly</span>
              </div>
              <p className="footer__brand-tagline">
                Networking visuell lernen — Schritt für Schritt.
              </p>
              <div className="footer__legal">
                <button type="button" className="footer__legal-link" onClick={() => openLegal('privacy')}>
                  Datenschutz
                </button>
                <span className="footer__legal-sep" aria-hidden="true">·</span>
                <button type="button" className="footer__legal-link" onClick={() => openLegal('terms')}>
                  Nutzungsbedingungen
                </button>
              </div>
            </div>

            {/* Center — links + social */}
            <div className="footer__links">
              <h4 className="footer__heading">Links</h4>
              <a href="#" data-curtain data-popup="join">Lektionen</a>
              <a href="#about">Über mich</a>
              <a href="#about" data-action="open-contact">Kontakt</a>
              <a
                className="footer__social"
                href="https://www.linkedin.com/in/artin-s-94115a397/?skipRedirect=true"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M4 3h3v3H4V3zm.3 5H7v13H4.3V8zM10 8h2.6v1.8h.1c.4-.7 1.5-1.5 3-1.5 3.2 0 3.8 2.1 3.8 4.8V21h-2.7v-6.2c0-1.5 0-3.4-2-3.4s-2.4 1.6-2.4 3.3V21H10V8z" />
                </svg>
              </a>
            </div>

            {/* Right — CTA */}
            <div className="footer__cta">
              <p className="footer__cta-text">
                Sei von Anfang an dabei. Sichere dir frühen Zugang, sobald wir launchen.
              </p>
              <div className="footer__cta-btns">
                <a href="#" className="footer__cta-btn" data-curtain data-popup="signup">
                  Sign up
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
                <button
                  type="button"
                  className="footer__download-btn"
                  onClick={openNotify}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M0 3.5l9.9-1.4v9.5H0V3.5zm11.1-1.6L24 0v11.6H11.1V1.9zM24 12.4v11.5l-12.9-1.8V12.4H24zM9.9 22l-9.9-1.4v-8.2h9.9V22z"/>
                  </svg>
                  <span className="footer__download-label">Download für Windows</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom — copyright */}
          <div className="footer__bottom">
            © 2026 Netly · Alle Rechte vorbehalten
          </div>
        </div>
      </footer>

      {/* Legal modal — Datenschutz / Nutzungsbedingungen */}
      {legalDoc && (
        <div
          className={`legal${legalClosing ? ' is-closing' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="legalTitle"
        >
          <div className="legal__backdrop" onClick={closeLegal}></div>
          <div className="legal__panel" role="document">
            <button className="legal__close" type="button" aria-label="Schließen" onClick={closeLegal}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <p className="legal__eyebrow">{legalDoc === 'privacy' ? 'DATENSCHUTZ' : 'NUTZUNGSBEDINGUNGEN'}</p>
            <h2 className="legal__title" id="legalTitle">
              {legalDoc === 'privacy' ? 'Datenschutz' : 'Nutzungsbedingungen'}
            </h2>
            <div className="legal__rule" aria-hidden="true"></div>

            {legalDoc === 'privacy' ? (
              <div className="legal__body">
                <p>
                  Netly ist ein privates Lernprojekt in einer frühen Beta. Datenschutz wird hier
                  schlicht gehalten — so wenig Daten wie möglich.
                </p>
                <ul>
                  <li>Beim Login mit Google speichern wir nur Name und Email, um dir Beta-Zugang und Launch-Infos zu geben.</li>
                  <li>Deine Daten werden nicht verkauft und nicht an Dritte weitergegeben.</li>
                  <li>Anonyme Nutzungsstatistik (Firebase Analytics) hilft, die Seite zu verbessern.</li>
                  <li>Du kannst jederzeit die Löschung deiner Daten anfragen — per Email oder LinkedIn.</li>
                </ul>
                <p className="legal__meta">Stand: 2026 · Fragen? Schreib mir über den Kontakt-Bereich.</p>
              </div>
            ) : (
              <div className="legal__body">
                <p>
                  Netly stellt Lerninhalte rund um Networking und CCNA bereit. Die Nutzung ist
                  kostenlos und erfolgt auf eigene Verantwortung.
                </p>
                <ul>
                  <li>Die Inhalte dienen dem Lernen und erheben keinen Anspruch auf Vollständigkeit oder Fehlerfreiheit.</li>
                  <li>Netly ersetzt keine offizielle Cisco-Zertifizierung oder Prüfungsvorbereitung.</li>
                  <li>Beta-Software: Funktionen können sich ändern, pausieren oder ausfallen.</li>
                  <li>Inhalte und Design gehören dem Betreiber. Keine Vervielfältigung ohne Erlaubnis.</li>
                </ul>
                <p className="legal__meta">Stand: 2026 · Built solo in Austria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* "Get notified" download waitlist popup */}
      {notifyOpen && (
        <div
          className={`notify${notifyClosing ? ' is-closing' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="notifyTitle"
        >
          <div className="notify__backdrop" onClick={closeNotify}></div>
          <div className="notify__panel" role="document">
            <button className="notify__close" type="button" aria-label="Schließen" onClick={closeNotify}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="notify__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M0 3.5l9.9-1.4v9.5H0V3.5zm11.1-1.6L24 0v11.6H11.1V1.9zM24 12.4v11.5l-12.9-1.8V12.4H24zM9.9 22l-9.9-1.4v-8.2h9.9V22z"/>
              </svg>
            </div>

            {notifyStatus === 'done' ? (
              <>
                <h2 className="notify__title">Du stehst auf der Liste ✓</h2>
                <p className="notify__text">
                  Wir melden uns bei dir, sobald die Desktop-App zum Download bereit ist. Danke fürs Interesse!
                </p>
                <button type="button" className="notify__submit" onClick={closeNotify}>
                  Schließen
                </button>
              </>
            ) : (
              <>
                <p className="notify__eyebrow">DESKTOP-APP · COMING SOON</p>
                <h2 className="notify__title" id="notifyTitle">Werde benachrichtigt</h2>
                <p className="notify__text">
                  Die Networkly Desktop-App ist in Arbeit. Trag deine Email ein und du
                  erfährst als Erster, wenn sie zum Download bereit ist.
                </p>

                <form className="notify__form" onSubmit={handleNotifySubmit} noValidate>
                  <input
                    ref={notifyInputRef}
                    type="email"
                    name="email"
                    placeholder="du@domain.com"
                    required
                    autoComplete="email"
                    disabled={notifyStatus === 'loading'}
                  />
                  <button type="submit" className="notify__submit" disabled={notifyStatus === 'loading'}>
                    {notifyStatus === 'loading' ? 'Wird gesendet…' : 'Benachrichtige mich'}
                    {notifyStatus !== 'loading' && (
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    )}
                  </button>
                </form>

                {notifyStatus === 'error' && (
                  <p className="notify__error" role="alert">
                    Etwas ist schiefgelaufen. Bitte versuch es nochmal.
                  </p>
                )}
                <p className="notify__hint">Kein Spam. Eine Nachricht zum Launch, das war's.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Settings modal (signed-in users) */}
      {settingsOpen && authUser && (
        <div className="settings" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
          <div className="settings__backdrop" onClick={() => setSettingsOpen(false)}></div>
          <div className="settings__panel" role="document">
            <button className="settings__close" type="button" aria-label="Schließen" onClick={() => setSettingsOpen(false)}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <p className="settings__eyebrow">EINSTELLUNGEN</p>
            <h2 className="settings__title" id="settingsTitle">Dein Konto</h2>
            <div className="settings__rule" aria-hidden="true"></div>

            <div className="settings__account">
              {authUser.photoURL && (
                <img src={authUser.photoURL} alt="" referrerPolicy="no-referrer" className="settings__avatar" />
              )}
              <div>
                <div className="settings__name">{authUser.displayName ?? 'Eingeloggt'}</div>
                <div className="settings__email">{authUser.email}</div>
              </div>
            </div>

            <div className="settings__row">
              <div className="settings__row-text">
                <span className="settings__row-title">Fortschritt zurücksetzen</span>
                <span className="settings__row-desc">Löscht deinen gespeicherten Lernfortschritt in allen Lektionen.</span>
              </div>
              <button
                type="button"
                className="settings__danger-btn"
                onClick={() => {
                  if (window.confirm('Wirklich den gesamten Fortschritt löschen? Das kann nicht rückgängig gemacht werden.')) {
                    handleResetProgress()
                  }
                }}
              >
                Zurücksetzen
              </button>
            </div>

            <button type="button" className="settings__logout" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              Abmelden
            </button>
          </div>
        </div>
      )}
    </>
  )
}
