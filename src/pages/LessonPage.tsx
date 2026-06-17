import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, X, Info, ChevronDown, ChevronUp, Lightbulb, CirclePlay } from 'lucide-react'
import { getLessonById, lessons } from '../data/lessons'
import type { LessonStep } from '../types'
import NetworkCanvas from '../components/NetworkCanvas'
import { useAuth } from '../lib/useAuth'
import { saveLessonProgress, fetchLessonProgress } from '../lib/progress'

interface FlatStep {
  subtopicTitle: string
  subtopicIndex: number
  stepIndex: number
  step: LessonStep
  youtube?: string
}

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const lesson = getLessonById(lessonId || '')
  const { user } = useAuth()
  const furthestRef = useRef(0)
  const progressReadyRef = useRef(false)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [showAnalogy, setShowAnalogy] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [focusMode, setFocusMode] = useState(true)
  // Lesson view is desktop-only. The visual layout (wide topology + side card)
  // doesn't survive a 360px viewport without losing the labels & animations
  // that make the lesson useful. Below 900px we show a friendly gate.
  const [isDesktop, setIsDesktop] = useState(
    typeof window === 'undefined' ? true : window.innerWidth >= 900
  )
  const explanationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 900)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    // Deep-link support: the lessons popup can navigate here with a
    // { subtopicIndex, stepIndex } location state to jump straight to a
    // specific step. Map that pair onto the flat step index. Without a
    // state we start at the beginning.
    const navState = location.state as
      | { subtopicIndex?: number; stepIndex?: number; flatIndex?: number }
      | null
    if (lesson && navState && typeof navState.flatIndex === 'number') {
      // Resume directly at a saved flat step index ("continue where you left off")
      setCurrentIndex(Math.max(0, navState.flatIndex))
    } else if (lesson && navState && typeof navState.subtopicIndex === 'number') {
      const si = Math.max(0, Math.min(navState.subtopicIndex, lesson.subtopics.length - 1))
      let flatIdx = 0
      for (let i = 0; i < si; i++) flatIdx += lesson.subtopics[i].steps.length
      flatIdx += Math.max(0, navState.stepIndex ?? 0)
      setCurrentIndex(flatIdx)
    } else {
      setCurrentIndex(0)
    }
    setShowModal(false)
    setShowAnalogy(false)
    setFocusMode(true)
  }, [lessonId, location.key])

  useEffect(() => {
    setShowAnalogy(false)
    setShowVideo(false)
    setFocusMode(true)
    const timer = setTimeout(() => setFocusMode(false), 3500)
    return () => clearTimeout(timer)
  }, [currentIndex])

  /* --------------------------------------------------------------
     Progress persistence (only for signed-in users)
     - Seed the "furthest reached" from Firestore on lesson change so
       the progress bar never regresses.
     - Save current + furthest step on each navigation.
  ----------------------------------------------------------------- */
  useEffect(() => {
    progressReadyRef.current = false
    furthestRef.current = 0
    if (!user || !lesson) {
      progressReadyRef.current = true
      return
    }
    let active = true
    fetchLessonProgress(user.uid, lesson.id)
      .then((p) => {
        if (active && p) furthestRef.current = p.furthest ?? 0
      })
      .catch(() => {})
      .finally(() => {
        // Only allow saving once the stored "furthest" is loaded, so a
        // fresh mount at step 0 can't overwrite a higher saved value.
        if (active) progressReadyRef.current = true
      })
    return () => {
      active = false
    }
  }, [user, lessonId])

  useEffect(() => {
    if (!user || !lesson) return
    if (!progressReadyRef.current) return
    const totalSteps = lesson.subtopics.reduce((a, st) => a + st.steps.length, 0)
    if (totalSteps === 0) return
    const idx = Math.min(currentIndex, totalSteps - 1)
    furthestRef.current = Math.max(furthestRef.current, idx)
    saveLessonProgress(user.uid, lesson.id, idx, furthestRef.current, totalSteps).catch(() => {})
  }, [user, lessonId, currentIndex])

  if (!lesson) {
    return (
      <div style={{ minHeight: '100vh', background: '#060606', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 32, fontWeight: 400, marginBottom: 16 }}>Lektion nicht gefunden</h1>
          <button onClick={() => navigate('/')} style={{ color: '#4a7fb8', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Zurück zur Übersicht
          </button>
        </div>
      </div>
    )
  }

  const flatSteps: FlatStep[] = lesson.subtopics.flatMap((st, si) =>
    st.steps.map((step, stepIdx) => ({
      subtopicTitle: st.title,
      subtopicIndex: si,
      stepIndex: stepIdx,
      step,
      youtube: st.youtube,
    }))
  )

  const total = flatSteps.length
  // Guard: clamp index to valid range (prevents crash when switching lessons)
  const safeIndex = Math.min(currentIndex, total - 1)
  const current = flatSteps[safeIndex]
  const progress = total > 0 ? ((safeIndex + 1) / total) * 100 : 0

  // If flatSteps is empty (shouldn't happen but safety net)
  if (!current) {
    return (
      <div style={{ minHeight: '100vh', background: '#060606', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 28, fontWeight: 400, marginBottom: 16 }}>Keine Inhalte verfügbar</h1>
          <button onClick={() => navigate('/')} style={{ color: '#4a7fb8', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Zurück zur Übersicht
          </button>
        </div>
      </div>
    )
  }

  const currentLessonIndex = lessons.findIndex(l => l.id === lesson.id)
  const nextLesson = lessons[currentLessonIndex + 1]
  const prevLesson = lessons[currentLessonIndex - 1]

  function goNext() {
    setShowModal(false)
    if (safeIndex < total - 1) {
      setCurrentIndex(safeIndex + 1)
    }
  }

  function goPrev() {
    setShowModal(false)
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1)
    }
  }

  function goNextLesson() {
    if (nextLesson) navigate(`/lesson/${nextLesson.id}`)
  }

  function goPrevLesson() {
    if (prevLesson) navigate(`/lesson/${prevLesson.id}`)
  }

  const mono = "'JetBrains Mono', monospace"
  const serif = "'Source Serif 4', Georgia, serif"
  const c = {
    bg: '#060606',
    bg2: 'rgba(20, 20, 22, 0.92)',
    card: 'rgba(15, 15, 18, 0.82)',
    cardH: 'rgba(20, 20, 22, 0.92)',
    accent: '#4a7fb8',
    accentLight: '#7da3df',
    text: '#ffffff',
    textSec: 'rgba(255, 255, 255, 0.65)',
    textMut: 'rgba(255, 255, 255, 0.42)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderL: 'rgba(255, 255, 255, 0.1)',
    info: '#60a5fa',
    success: '#4ade80',
  }

  const btnBase: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '11px 20px', borderRadius: 999,
    fontFamily: mono, fontSize: 11,
    letterSpacing: '0.16em', textTransform: 'uppercase',
    fontWeight: 600,
    cursor: 'pointer', border: 'none',
    transition: 'all 0.2s ease',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: c.bg,
        color: c.text,
        position: 'relative',
        overflow: 'hidden',
        animation: 'lessonEnter 0.55s cubic-bezier(.2,.8,.2,1) both',
      }}
    >

      {/* Desktop-only gate — lesson view (wide topology + side card) doesn't
          translate to phone-sized viewports without breaking the layout. */}
      {!isDesktop && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#060606',
            color: '#f0ece6',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 24px',
            textAlign: 'center',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: c.accent,
              marginBottom: 18,
            }}
          >
            LEKTION · DESKTOP ONLY
          </div>
          <h1
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: 'clamp(28px, 7vw, 44px)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              maxInlineSize: '14ch',
              marginBottom: 18,
            }}
          >
            Bitte am <em style={{ fontStyle: 'italic', color: c.accent }}>PC</em> öffnen.
          </h1>
          <p
            style={{
              fontSize: 14.5,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 380,
              lineHeight: 1.6,
              marginBottom: 28,
            }}
          >
            Die Lektionen sind animierte Topologien mit detaillierten Labels —
            auf einem schmalen Display gehen die Details verloren. Am Desktop
            bekommst du das volle Bild. Versprochen, es lohnt sich.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '12px 22px',
              borderRadius: 999,
              background: '#ffffff',
              color: '#0a0a0a',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ← Zur Startseite
          </button>
        </div>
      )}

      {/* Full-screen Canvas behind everything */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <NetworkCanvas
          key={`${lessonId}-${safeIndex}`}
          scene={current.step.scene}
        />
      </div>

      {/* Top bar — floating */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 22px',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: c.bg2,
            backdropFilter: 'blur(14px) saturate(160%)',
            WebkitBackdropFilter: 'blur(14px) saturate(160%)',
            border: `1px solid ${c.border}`,
            borderRadius: 999,
            padding: '8px 16px 8px 14px',
            color: c.textSec, cursor: 'pointer',
            fontFamily: mono, fontSize: 11,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            transition: 'color 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = c.text; e.currentTarget.style.borderColor = c.borderL }}
          onMouseLeave={e => { e.currentTarget.style.color = c.textSec; e.currentTarget.style.borderColor = c.border }}
        >
          <ArrowLeft size={13} /> Übersicht
        </button>

        {/* Center: lesson info pill */}
        <div style={{
          background: c.bg2,
          backdropFilter: 'blur(14px) saturate(160%)',
          WebkitBackdropFilter: 'blur(14px) saturate(160%)',
          border: `1px solid ${c.border}`,
          borderRadius: 999,
          padding: '8px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: c.accent, fontWeight: 600, letterSpacing: '0.05em' }}>{lesson.number}</span>
          <span style={{ color: c.textMut }}>·</span>
          <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 14, color: c.text, letterSpacing: '-0.005em' }}>{lesson.title}</span>
          <span style={{ fontFamily: mono, fontSize: 11, color: c.textMut, marginLeft: 6 }}>{safeIndex + 1}/{total}</span>
        </div>

        {/* Progress bar inside top area */}
        <div style={{
          width: 120, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden',
        }}>
          <div style={{ height: '100%', width: `${progress}%`, background: c.accent, borderRadius: 999, transition: 'width 0.5s ease-out' }} />
        </div>
      </div>

      {/* Floating Explanation Card */}
      <div
        ref={explanationRef}
        style={{
          position: 'absolute',
          top: 64, left: 22, bottom: 22,
          width: 420,
          zIndex: 20,
          display: 'flex', flexDirection: 'column',
          background: c.card,
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          border: `1px solid ${c.border}`,
          borderRadius: 24,
          boxShadow: '0 16px 48px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset',
          overflow: 'hidden',
          animation: 'lessonCardEnter 0.55s cubic-bezier(.2,.8,.2,1) 0.15s both',
        }}
      >
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '26px 26px 0' }}>
          {/* Spotlight hint — lightbulb + subtopic */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: mono, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: focusMode ? c.accent : c.textMut,
            marginBottom: 16, transition: 'color 0.5s',
          }}>
            <Lightbulb size={12} style={{
              opacity: focusMode ? 1 : 0.35,
              transition: 'opacity 0.5s',
              color: focusMode ? c.accentLight : c.textMut,
            }} />
            {current.subtopicTitle}
          </div>

          {/* Text spotlight wrapper */}
          <div
            key={safeIndex}
            style={{
              position: 'relative',
              padding: '14px 16px',
              marginLeft: -16, marginRight: -16,
              borderRadius: 16,
              background: focusMode ? 'rgba(74, 127, 184,0.04)' : 'transparent',
              boxShadow: focusMode
                ? '0 0 40px 8px rgba(74, 127, 184,0.1), inset 0 0 30px rgba(74, 127, 184,0.03)'
                : 'none',
              border: focusMode ? '1px solid rgba(74, 127, 184,0.12)' : '1px solid transparent',
              transition: 'all 0.8s ease',
              marginBottom: 6,
              animation: 'stepFade 0.4s ease-out both',
            }}
          >
            <h2 style={{
              fontFamily: serif,
              fontSize: 26,
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              marginBottom: 12,
              color: c.text,
            }}>
              {current.step.title}
            </h2>
            <p style={{ fontSize: 14.5, color: c.textSec, lineHeight: 1.7, margin: 0 }}>
              {current.step.description}
            </p>
          </div>

          {/* Analogy */}
          {current.step.analogy && (
            <button
              onClick={() => setShowAnalogy(!showAnalogy)}
              style={{ width: '100%', textAlign: 'left', marginBottom: 14, cursor: 'pointer', background: 'none', border: 'none', color: c.text, padding: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: c.accent, fontSize: 10, fontFamily: mono, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>
                {showAnalogy ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                Alltagsvergleich
              </div>
              {showAnalogy && (
                <div className="animate-fade-in-up" style={{
                  fontFamily: serif,
                  fontStyle: 'italic',
                  fontSize: 14.5,
                  color: c.accentLight,
                  lineHeight: 1.65,
                  background: 'rgba(74, 127, 184,0.05)',
                  border: '1px solid rgba(74, 127, 184,0.12)',
                  borderRadius: 14,
                  padding: '14px 16px',
                  marginTop: 4,
                }}>
                  {current.step.analogy}
                </div>
              )}
            </button>
          )}

          {/* Modal Trigger */}
          {current.step.modal && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 11, fontFamily: mono, color: c.text,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${c.borderL}`,
                borderRadius: 999,
                padding: '9px 16px',
                cursor: 'pointer',
                marginBottom: 10,
                letterSpacing: '0.1em',
                transition: 'background 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = c.borderL }}
            >
              <Info size={13} style={{ color: c.accent }} />
              <span>{current.step.modal.title} · Mehr erfahren</span>
            </button>
          )}

          {/* YouTube Thumbnail */}
          {current.youtube && (() => {
            const match = current.youtube!.match(/[?&]v=([^&]+)/)
            const videoId = match ? match[1] : ''
            if (!videoId) return null
            return (
              <div
                onClick={() => setShowVideo(true)}
                style={{
                  position: 'relative', marginBottom: 10, borderRadius: 10, overflow: 'hidden',
                  cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <img
                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                  alt="Video"
                  style={{ width: '100%', display: 'block', opacity: 0.7, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
                />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.15)',
                }}>
                  <CirclePlay size={36} style={{ color: 'rgba(255,255,255,0.85)' }} />
                </div>
                <div style={{
                  position: 'absolute', bottom: 6, left: 8,
                  fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em',
                  background: 'rgba(0,0,0,0.5)', padding: '2px 7px', borderRadius: 4,
                }}>
                  Video zum Thema
                </div>
              </div>
            )
          })()}
        </div>

        {/* Bottom nav — always visible */}
        <div style={{
          padding: '16px 24px 20px',
          borderTop: `1px solid ${c.border}`,
          background: 'rgba(0,0,0,0.35)',
        }}>
          {/* Step Dots */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
            {flatSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentIndex(i); setShowModal(false); setShowAnalogy(false) }}
                style={{
                  width: i === safeIndex ? 22 : 6, height: 6,
                  borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: i === safeIndex ? c.accent : i < safeIndex ? 'rgba(74, 127, 184,0.4)' : 'rgba(255,255,255,0.08)',
                  transition: 'all 0.25s ease',
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={goPrev}
              disabled={safeIndex === 0}
              style={{
                ...btnBase,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${c.borderL}`,
                color: c.text,
                opacity: safeIndex === 0 ? 0.25 : 1,
              }}
              onMouseEnter={e => { if (safeIndex !== 0) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            >
              <ArrowLeft size={13} /> Zurück
            </button>
            {safeIndex < total - 1 ? (
              <button
                onClick={goNext}
                style={{
                  ...btnBase, flex: 1, justifyContent: 'center',
                  background: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.6)',
                  color: '#0a0a0a',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Weiter <ArrowRight size={13} />
              </button>
            ) : (
              <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                {prevLesson && (
                  <button onClick={goPrevLesson} style={{ ...btnBase, flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: `1px solid ${c.borderL}`, color: c.text }}>
                    ← {prevLesson.number}
                  </button>
                )}
                {nextLesson ? (
                  <button onClick={goNextLesson} style={{ ...btnBase, flex: 1, justifyContent: 'center', background: '#ffffff', border: '1px solid rgba(255,255,255,0.6)', color: '#0a0a0a' }}>
                    Nächste · {nextLesson.number} →
                  </button>
                ) : (
                  <button onClick={() => navigate('/')} style={{ ...btnBase, flex: 1, justifyContent: 'center', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: c.success }}>
                    ✓ Kapitel fertig
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* YouTube Video Popup */}
      {showVideo && current.youtube && (() => {
        const match = current.youtube!.match(/[?&]v=([^&]+)/)
        const videoId = match ? match[1] : ''
        if (!videoId) return null
        return (
          <div
            onClick={() => setShowVideo(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
          >
            <div
              className="animate-fade-in-up"
              onClick={e => e.stopPropagation()}
              style={{
                width: '80vw', maxWidth: 900, borderRadius: 16, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowVideo(false)}
                style={{
                  position: 'absolute', top: 10, right: 10, zIndex: 10,
                  background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}
              >
                <X size={16} />
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
              />
            </div>
          </div>
        )
      })()}

      {/* Modal Overlay */}
      {showModal && current.step.modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px) saturate(140%)' }}>
          <div className="animate-fade-in-up" style={{
            background: 'rgba(12,12,14,0.94)',
            backdropFilter: 'blur(24px)',
            border: `1px solid ${c.border}`,
            borderRadius: 24,
            padding: 36,
            maxWidth: 520,
            margin: '0 16px',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: c.accent, marginBottom: 10 }}>
                  Theorie
                </div>
                <h3 style={{ fontFamily: serif, fontSize: 28, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.015em', color: c.text }}>
                  {current.step.modal.title}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Schließen"
                style={{
                  background: 'transparent',
                  border: `1px solid ${c.border}`,
                  borderRadius: '50%',
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: c.textSec, cursor: 'pointer',
                  transition: 'color 0.2s ease, border-color 0.2s ease, transform 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = c.text; e.currentTarget.style.borderColor = c.borderL; e.currentTarget.style.transform = 'rotate(90deg)' }}
                onMouseLeave={e => { e.currentTarget.style.color = c.textSec; e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = 'rotate(0)' }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ fontSize: 14.5, color: c.textSec, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {current.step.modal.content}
            </div>
            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: 28,
                width: '100%',
                padding: '12px 0',
                background: '#ffffff',
                border: '1px solid rgba(255,255,255,0.6)',
                color: '#0a0a0a',
                borderRadius: 999,
                fontFamily: mono,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Verstanden
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
