import { useEffect, useRef, useState, useCallback } from 'react'
import type { SceneState, NetworkDevice, Cable, PacketAnimation, PacketHop } from '../types'
import DeviceIcon from './DeviceIcon'

interface NetworkCanvasProps {
  scene: SceneState
  /** Width reserved on the left for an explanation card. Defaults to 440px
   *  for the lesson page; pass 0 for centered home-page previews. */
  sidebarWidth?: number
}

function getCableColor(type: Cable['type']): string {
  switch (type) {
    case 'ethernet': return '#60a5fa'
    case 'fiber-single': return '#fbbf24'
    case 'fiber-multi': return '#f97316'
    case 'serial': return '#a78bfa'
    case 'wireless': return '#a09888'
    default: return '#6a6258'
  }
}

function getCableDash(type: Cable['type']): string {
  return type === 'wireless' ? '6 4' : 'none'
}

interface AnimatedPacket {
  animation: PacketAnimation
  currentHop: number
  progress: number
  active: boolean
  done: boolean
  paused: boolean
  pauseTimer: number
  showHint: string | null
}

export default function NetworkCanvas({ scene, sidebarWidth = 440 }: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [packets, setPackets] = useState<AnimatedPacket[]>([])
  const animRef = useRef<number>(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })

  // Layer-walk state for OSI / TCP-IP pyramid steps. When a customOverlay
  // ships a `layerWalk` array, we step through those hints one at a time —
  // basically the packet-hint experience but for the layered diagram.
  const [activeLayerIdx, setActiveLayerIdx] = useState<number>(-1)

  const deviceMap = new Map<string, NetworkDevice>()
  scene.devices.forEach(d => deviceMap.set(d.id, d))

  // Measure container to center the scene
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const measure = () => setContainerSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Compute bounding box of all devices and derive offset to center them.
  // Card sits on the LEFT (440px wide) → push the scene to the right.
  const SIDEBAR_W = sidebarWidth
  const PADDING = 60
  let offsetX = 0
  let offsetY = 0
  let scale = 1

  if (scene.devices.length > 0 && containerSize.w > 0) {
    const xs = scene.devices.map(d => d.position.x)
    const ys = scene.devices.map(d => d.position.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const sceneW = (maxX - minX) || 200
    const sceneH = (maxY - minY) || 200
    const sceneCX = (minX + maxX) / 2
    const sceneCY = (minY + maxY) / 2

    // Available area (account for sidebar overlap)
    const availW = containerSize.w - SIDEBAR_W
    const availH = containerSize.h
    // Center point of the available area (right side of sidebar)
    const targetCX = SIDEBAR_W + availW / 2
    const targetCY = availH / 2

    // Scale to fit with padding
    const fitW = (availW - PADDING * 2) / sceneW
    const fitH = (availH - PADDING * 2) / sceneH
    scale = Math.min(fitW, fitH, 1.0) // cap max zoom — match editor 1:1
    scale = Math.max(scale, 0.6) // cap min zoom

    offsetX = targetCX - sceneCX * scale
    offsetY = targetCY - sceneCY * scale
  } else if (scene.customOverlay && containerSize.w > 0) {
    // No devices but a customOverlay (e.g. OSI / TCP-IP pyramid pages):
    // place the overlay in the centre of the available area instead of
    // rendering it at its raw (often top-left) coordinates.
    const ov = scene.customOverlay
    const availW = containerSize.w - SIDEBAR_W
    const availH = containerSize.h
    const targetCX = SIDEBAR_W + availW / 2
    const targetCY = availH / 2
    offsetX = targetCX - ov.position.x
    offsetY = targetCY - ov.position.y
    scale = 1
  }

  const startAnimation = useCallback(() => {
    if (!scene.packets || scene.packets.length === 0) return
    const initial = scene.packets.map((p, i) => ({
      animation: p,
      currentHop: 0,
      progress: 0,
      active: i === 0,
      done: false,
      paused: false,
      pauseTimer: 0,
      showHint: null,
    }))
    setPackets(initial)
    setIsAnimating(true)
  }, [scene.packets])

  useEffect(() => {
    if (!isAnimating || packets.length === 0) return

    let lastTime = performance.now()
    const speed = 0.6

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time

      setPackets(prev => {
        const next = prev.map(p => {
          if (p.done || !p.active) return p

          // If paused at a checkpoint, count down (unless waiting for user)
          if (p.paused) {
            if (p.pauseTimer === Infinity) return p // waiting for user click
            const newTimer = p.pauseTimer - dt
            if (newTimer <= 0) {
              // Resume: advance to next hop
              const nextHop = p.currentHop + 1
              if (nextHop >= p.animation.hops.length) {
                return { ...p, done: true, active: false, progress: 1, paused: false, showHint: null }
              }
              return { ...p, currentHop: nextHop, progress: 0, paused: false, pauseTimer: 0, showHint: null }
            }
            return { ...p, pauseTimer: newTimer }
          }

          // Move the packet
          let newProgress = p.progress + dt * speed
          if (newProgress >= 1) {
            // Arrived at destination of this hop — pause and show hint
            const hop = p.animation.hops[p.currentHop]
            const hint = hop?.hint || null
            return { ...p, progress: 1, paused: true, pauseTimer: hint ? Infinity : 0.15, showHint: hint }
          }
          return { ...p, progress: newProgress }
        })
        // Activate the next packet when the current one finishes
        const activeIdx = next.findIndex(p => p.active && !p.done)
        if (activeIdx === -1) {
          const nextIdx = next.findIndex(p => !p.active && !p.done)
          if (nextIdx !== -1) {
            next[nextIdx] = { ...next[nextIdx], active: true }
          } else {
            setIsAnimating(false)
          }
        }
        return next
      })

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [isAnimating, packets.length])

  useEffect(() => {
    setPackets([])
    setIsAnimating(false)
    if (scene.packets && scene.packets.length > 0) {
      const timer = setTimeout(startAnimation, 800)
      return () => clearTimeout(timer)
    }
  }, [scene, startAnimation])

  /* --------------------------------------------------------------
     Layer walk for OSI / TCP-IP pyramid steps
     If customOverlay has a layerWalk[], step through it on a timer.
     User can also click "Weiter" in the popup to advance manually.
  ----------------------------------------------------------------- */
  const layerWalk = scene.customOverlay?.layerWalk
  useEffect(() => {
    if (!layerWalk || layerWalk.length === 0) {
      setActiveLayerIdx(-1)
      return
    }
    // Start after a small delay so the user sees the static pyramid first
    const startT = window.setTimeout(() => setActiveLayerIdx(0), 600)
    return () => window.clearTimeout(startT)
  }, [layerWalk, scene])

  const advanceLayer = useCallback(() => {
    if (!layerWalk) return
    setActiveLayerIdx(idx => (idx + 1 >= layerWalk.length ? -1 : idx + 1))
  }, [layerWalk])

  const replayLayerWalk = useCallback(() => {
    if (!layerWalk || layerWalk.length === 0) return
    setActiveLayerIdx(0)
  }, [layerWalk])

  const resumePacket = useCallback((packetId: string) => {
    setPackets(prev => prev.map(p => {
      if (p.animation.id !== packetId || !p.paused) return p
      const nextHop = p.currentHop + 1
      if (nextHop >= p.animation.hops.length) {
        return { ...p, done: true, active: false, progress: 1, paused: false, showHint: null }
      }
      return { ...p, currentHop: nextHop, progress: 0, paused: false, pauseTimer: 0, showHint: null }
    }))
  }, [])

  function getPacketPosition(hop: PacketHop, progress: number) {
    const from = deviceMap.get(hop.fromDevice)
    const to = deviceMap.get(hop.toDevice)
    if (!from || !to) return { x: 0, y: 0 }
    return {
      x: from.position.x + (to.position.x - from.position.x) * progress,
      y: from.position.y + (to.position.y - from.position.y) * progress,
    }
  }

  return (
    <div
      ref={canvasRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      {/* Subtle dot grid background */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}>
        <defs>
          <pattern id="dotgrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="16" r="0.8" fill="#8a8278" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />
      </svg>

      {/* Transformed scene layer — cables + devices + packets centered */}
      {containerSize.w > 0 && containerSize.h > 0 && <div style={{
        position: 'absolute', inset: 0,
        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
        transformOrigin: '0 0',
      }}>
        {/* Custom Overlay: OSI / TCP-IP Pyramid */}
        {scene.customOverlay && (() => {
          const ov = scene.customOverlay
          const isOsi = ov.type === 'osi-model'
          const osiLayers = [
            { num: 7, name: 'APPLICATION', desc: 'HTTP, DNS, E-Mail · was du nutzt', color: '#2d7d9a' },
            { num: 6, name: 'PRESENTATION', desc: 'Verschlüsselung & Format', color: '#3a9e6e' },
            { num: 5, name: 'SESSION', desc: 'Sitzungen verwalten', color: '#6ab04c' },
            { num: 4, name: 'TRANSPORT', desc: 'TCP / UDP · zuverlässig vs. schnell', color: '#f6d55c' },
            { num: 3, name: 'NETWORK', desc: 'IP-Adressen · Routing', color: '#f0a030' },
            { num: 2, name: 'DATA LINK', desc: 'MAC-Adressen · Switching', color: '#e87830' },
            { num: 1, name: 'PHYSICAL', desc: 'Kabel, Funk, Bits', color: '#e04040' },
          ]
          const tcpLayers = [
            { num: 4, name: 'APPLICATION', desc: 'HTTP · DNS · SMTP · FTP · SSH', color: '#2d7d9a', osi: 'OSI 5–7' },
            { num: 3, name: 'TRANSPORT', desc: 'TCP (zuverlässig) · UDP (schnell)', color: '#f6d55c', osi: 'OSI 4' },
            { num: 2, name: 'INTERNET', desc: 'IP · ICMP · ARP · OSPF', color: '#f0a030', osi: 'OSI 3' },
            { num: 1, name: 'NETWORK ACCESS', desc: 'Ethernet · Wi-Fi · PPP · Kabel', color: '#e04040', osi: 'OSI 1–2' },
          ]
          const layers = isOsi ? osiLayers : tcpLayers
          const layerH = isOsi ? 52 : 64
          const totalH = layers.length * layerH
          const topW = isOsi ? 280 : 320
          const botW = isOsi ? 600 : 560
          const cx = ov.position.x
          const startY = ov.position.y - totalH / 2
          return (
            <div data-overlay-type={ov.type} style={{ position: 'absolute', left: 0, top: 0, width: 9999, height: 9999, pointerEvents: 'none' }}>
              <div style={{
                position: 'absolute',
                top: startY - 56, left: cx - 200, width: 400,
                textAlign: 'center',
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 22,
                fontWeight: 400,
                letterSpacing: '-0.01em',
                color: 'rgba(255, 255, 255, 0.92)',
              }}>
                {isOsi ? 'OSI · 7 Layers' : 'TCP/IP · 4 Layers'}
              </div>
              <svg style={{ position: 'absolute', left: 0, top: 0, width: 9999, height: 9999, overflow: 'visible' }}>
                {layers.map((l, i) => {
                  const t = layers.length > 1 ? i / (layers.length - 1) : 0
                  const w = topW + (botW - topW) * t
                  const nextW = i < layers.length - 1 ? topW + (botW - topW) * ((i + 1) / (layers.length - 1)) : w + 30
                  const y = startY + i * layerH
                  const x1 = cx - w / 2
                  const x2 = cx + w / 2
                  const x3 = cx + nextW / 2
                  const x4 = cx - nextW / 2
                  // Active during a layer walk: this layer pops, others dim
                  const walking = activeLayerIdx >= 0 && layerWalk
                  const isActive = walking && activeLayerIdx === i
                  const opacity = walking ? (isActive ? 1 : 0.32) : 0.9
                  return (
                    <polygon
                      key={l.num}
                      points={`${x1},${y} ${x2},${y} ${x3},${y + layerH} ${x4},${y + layerH}`}
                      fill={l.color}
                      opacity={opacity}
                      style={{ transition: 'opacity 0.45s ease' }}
                    />
                  )
                })}
              </svg>
              {layers.map((l, i) => {
                const t = layers.length > 1 ? i / (layers.length - 1) : 0
                const w = topW + (botW - topW) * t
                const y = startY + i * layerH
                return (
                  <div key={l.num}>
                    <div style={{
                      position: 'absolute',
                      top: y,
                      left: cx - w / 2 + 24,
                      width: w - 48,
                      height: layerH,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      pointerEvents: 'none',
                    }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: isOsi ? 22 : 26,
                        fontWeight: 800,
                        color: '#fff',
                        textShadow: '0 2px 8px rgba(0,0,0,0.35)',
                        minWidth: 28,
                        flexShrink: 0,
                      }}>
                        {l.num}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: isOsi ? 14 : 15,
                          fontWeight: 700,
                          color: '#fff',
                          letterSpacing: '0.1em',
                          textShadow: '0 2px 8px rgba(0,0,0,0.35)',
                          whiteSpace: 'nowrap',
                        }}>
                          {l.name}
                        </span>
                        {!isOsi && 'osi' in l && (
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            color: 'rgba(255,255,255,0.65)',
                            letterSpacing: '0.12em',
                            whiteSpace: 'nowrap',
                          }}>
                            {(l as { osi?: string }).osi}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: y + layerH / 2 - 8,
                      left: cx + w / 2 + 28,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.7)',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      letterSpacing: '0.02em',
                    }}>
                      {l.desc}
                    </div>
                  </div>
                )
              })}

              {/* Layer-walk hint popup — floats next to the active layer */}
              {layerWalk && activeLayerIdx >= 0 && activeLayerIdx < layers.length && (() => {
                const i = activeLayerIdx
                const t = layers.length > 1 ? i / (layers.length - 1) : 0
                const w = topW + (botW - topW) * t
                const y = startY + i * layerH + layerH / 2
                const popupX = cx - w / 2 - 360
                return (
                  <div
                    style={{
                      position: 'absolute',
                      left: popupX,
                      top: y - 60,
                      width: 320,
                      padding: '14px 16px 12px',
                      background: '#0c0c0e',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 10,
                      pointerEvents: 'auto',
                      animation: 'fadeIn 0.3s ease',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        letterSpacing: '0.18em',
                        color: layers[i].color,
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      LAYER {layers[i].num} · {layers[i].name}
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', 'Menlo', monospace",
                        fontSize: 11.5,
                        lineHeight: 1.55,
                        color: 'rgba(255, 255, 255, 0.85)',
                        marginBottom: 10,
                      }}
                    >
                      {layerWalk[i]}
                    </div>
                    <button
                      type="button"
                      onClick={advanceLayer}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 6,
                        color: 'rgba(255, 255, 255, 0.75)',
                        fontSize: 9.5,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                        padding: '4px 10px',
                        cursor: 'pointer',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {i + 1 < layerWalk.length ? 'Weiter →' : 'Fertig ✓'}
                    </button>
                  </div>
                )
              })()}
            </div>
          )
        })()}

        {/* Cables */}
        <svg style={{ position: 'absolute', left: 0, top: 0, width: 9999, height: 9999, overflow: 'visible' }}>
          {scene.cables.map(cable => {
            const from = deviceMap.get(cable.from)
            const to = deviceMap.get(cable.to)
            if (!from || !to) return null
            // Skip self-loops (would render as a single dot)
            if (cable.from === cable.to) return null
            const isHighlighted = scene.highlightCables?.includes(cable.id)
            // Highlighted cables glow soft white instead of copper, matching the
            // homepage's monochrome accent. Cable-type colors stay for context
            // (blue=ethernet, yellow=fiber, etc.) because they teach meaning.
            const color = isHighlighted ? '#ffffff' : getCableColor(cable.type)
            // Use explicit positions from editor, or compute from device centers
            let x1: number, y1: number, x2: number, y2: number
            if (cable.startPos && cable.endPos) {
              x1 = cable.startPos.x; y1 = cable.startPos.y
              x2 = cable.endPos.x; y2 = cable.endPos.y
            } else {
              const dx = to.position.x - from.position.x
              const dy = to.position.y - from.position.y
              const len = Math.sqrt(dx * dx + dy * dy)
              const inset = 46
              const ratio1 = len > 0 ? inset / len : 0
              const ratio2 = len > 0 ? (len - inset) / len : 1
              x1 = from.position.x + dx * ratio1
              y1 = from.position.y + dy * ratio1
              x2 = from.position.x + dx * ratio2
              y2 = from.position.y + dy * ratio2
            }
            // Bail out on degenerate / NaN segments (prevents stray dots)
            if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) return null
            const segLen = Math.hypot(x2 - x1, y2 - y1)
            if (segLen < 4) return null
            // Label position — midpoint, offset perpendicular to cable
            const mx = (x1 + x2) / 2
            const my = (y1 + y2) / 2
            const cdx = x2 - x1
            const cdy = y2 - y1
            const clen = Math.sqrt(cdx * cdx + cdy * cdy)
            const nx = clen > 0 ? -cdy / clen : 0
            const ny = clen > 0 ? cdx / clen : -1
            const labelOffset = 14
            const lx = mx + nx * labelOffset
            const ly = my + ny * labelOffset
            return (
              <g key={cable.id}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={color}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={getCableDash(cable.type)}
                  opacity={isHighlighted ? 0.9 : 0.45}
                  strokeLinecap="butt"
                />
                {cable.label && (
                  <>
                    <rect
                      x={lx - cable.label.length * 3.4 - 6}
                      y={ly - 8}
                      width={cable.label.length * 6.8 + 12}
                      height={16}
                      rx="4"
                      fill="rgba(6,6,6,0.85)"
                    />
                    <text
                      x={lx} y={ly + 4}
                      fill="rgba(255,255,255,0.6)"
                      fontSize="10"
                      fontFamily="'JetBrains Mono', monospace"
                      textAnchor="middle"
                    >
                      {cable.label}
                    </text>
                  </>
                )}
              </g>
            )
          })}
        </svg>

        {/* Devices */}
        {scene.devices.map(device => {
          const isHighlighted = scene.highlightDevices?.includes(device.id)
          const lo = device.labelOffset
          return (
            <div key={device.id}>
              {/* Device icon */}
              <div
                style={{
                  position: 'absolute',
                  left: device.position.x - 36,
                  top: device.position.y - 36,
                  background: '#060606',
                  borderRadius: 14,
                  padding: 2,
                  boxShadow: isHighlighted
                    ? '0 0 0 1px rgba(255,255,255,0.18), 0 0 32px rgba(255,255,255,0.08)'
                    : 'none',
                  transition: 'box-shadow 0.4s ease',
                }}
              >
                <DeviceIcon type={device.type} size={72} highlighted={isHighlighted} />
              </div>
              {/* Label */}
              <div
                style={{
                  position: 'absolute',
                  left: device.position.x + (lo ? lo.x : 0),
                  top: device.position.y + (lo ? lo.y : 42),
                  transform: 'translateX(-50%)',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 500,
                    whiteSpace: 'pre',
                    padding: '3px 8px',
                    borderRadius: 6,
                    color: isHighlighted ? '#ffffff' : 'rgba(255, 255, 255, 0.62)',
                    background: 'rgba(6, 6, 6, 0.78)',
                    border: isHighlighted
                      ? '1px solid rgba(255, 255, 255, 0.18)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(4px)',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    letterSpacing: '0.02em',
                    transition: 'color 0.4s ease, border-color 0.4s ease',
                  }}
                >
                  {device.label}
                </span>
              </div>
            </div>
          )
        })}

        {/* Animated packets */}
        {packets.map(p => {
          if (p.done || p.currentHop >= p.animation.hops.length) return null
          const hop = p.animation.hops[p.currentHop]
          const pos = getPacketPosition(hop, p.progress)
          const label = p.animation.label
          const pktW = Math.max(label.length * 7 + 28, 48)
          return (
            <div
              key={p.animation.id}
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                left: pos.x - pktW / 2,
                top: pos.y - 16,
                zIndex: 50,
              }}
            >
              {/* Envelope / letter packet — simple, monochrome */}
              <div
                style={{
                  width: pktW, height: 28, borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  fontSize: 9, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: '#1a1612',
                  background: 'linear-gradient(145deg, #ffffff, #ececec)',
                  boxShadow: '0 0 14px rgba(255, 255, 255, 0.25), 0 2px 8px rgba(0, 0, 0, 0.55)',
                  border: '1.5px solid rgba(255, 255, 255, 0.85)',
                }}
              >
                <svg width="12" height="10" viewBox="0 0 12 10" style={{ flexShrink: 0 }}>
                  <path d="M1 1 L6 5 L11 1 M1 1 L1 9 L11 9 L11 1" fill="none" stroke="#3a3a3a" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
                <span>{label}</span>
              </div>

              {/* Explanation popup with continue button */}
              {p.paused && p.showHint && (
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: '100%',
                  /* transform handled by the keyframe so the entrance has a
                     real scale/translate; we still center via translateX(-50%) */
                  marginBottom: 14,
                  width: 360,
                  maxWidth: 'min(420px, 86vw)',
                  whiteSpace: 'normal',
                  padding: '12px 14px 10px',
                  borderRadius: 10,
                  background: '#0c0c0e',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  zIndex: 60,
                  /* 0.7s total: bubble stays hidden for the first ~35% so the
                     packet lands visibly first, then fades + scales in. */
                  animation: 'hintArrive 0.7s cubic-bezier(.2,.8,.2,1) both',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  pointerEvents: 'auto',
                }}>
                  {/* Hint text */}
                  <div style={{
                    fontFamily: "'JetBrains Mono', 'Menlo', 'Consolas', monospace",
                    fontSize: 11.5,
                    lineHeight: 1.55,
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontWeight: 400,
                    letterSpacing: '0.01em',
                  }}>
                    {p.showHint}
                  </div>

                  {/* Continue button */}
                  <button
                    onClick={() => resumePacket(p.animation.id)}
                    style={{
                      alignSelf: 'flex-end',
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 6,
                      color: 'rgba(255, 255, 255, 0.75)',
                      fontSize: 9.5,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      padding: '4px 10px',
                      cursor: 'pointer',
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                      e.currentTarget.style.color = '#ffffff'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                    }}
                  >
                    Weiter →
                  </button>

                  {/* Speech bubble tail — points down to the packet */}
                  {/* Border triangle (slightly larger, sits behind) */}
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0, height: 0,
                    borderLeft: '7px solid transparent',
                    borderRight: '7px solid transparent',
                    borderTop: '7px solid rgba(255, 255, 255, 0.1)',
                  }} />
                  {/* Fill triangle (matches box bg, sits 1px above border) */}
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% - 1px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0, height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid #0c0c0e',
                  }} />
                </div>
              )}
            </div>
          )
        })}
      </div>}

      {/* Replay button */}
      {scene.packets && scene.packets.length > 0 && !isAnimating && (
        <button
          onClick={startAnimation}
          style={{
            position: 'absolute', bottom: 24, right: 24,
            padding: '8px 16px',
            background: 'rgba(10,8,6,0.6)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            color: '#4a7fb8', cursor: 'pointer',
          }}
        >
          ▶ Replay
        </button>
      )}

      {/* Layer-walk replay (when the layer walk has finished) */}
      {layerWalk && layerWalk.length > 0 && activeLayerIdx === -1 && (
        <button
          onClick={replayLayerWalk}
          style={{
            position: 'absolute', bottom: 24, right: 24,
            padding: '8px 16px',
            background: 'rgba(10,8,6,0.6)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            color: '#4a7fb8', cursor: 'pointer',
          }}
        >
          ▶ Replay Layer-Walk
        </button>
      )}
    </div>
  )
}
