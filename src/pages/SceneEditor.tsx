import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, Check, Magnet } from 'lucide-react'
import { getLessonById } from '../data/lessons'
import type { NetworkDevice, Cable } from '../types'
import DeviceIcon from '../components/DeviceIcon'

function getCableColor(type: string): string {
  switch (type) {
    case 'ethernet': return '#60a5fa'
    case 'fiber-single': return '#fbbf24'
    case 'fiber-multi': return '#f97316'
    case 'serial': return '#a78bfa'
    case 'wireless': return '#a09888'
    default: return '#6a6258'
  }
}

function getCableDash(type: string): string {
  return type === 'wireless' ? '6 4' : 'none'
}

// Snap value to nearest grid line if within threshold
const GRID = 25
const SNAP_THRESHOLD = 8
function snap(v: number, enabled: boolean): number {
  if (!enabled) return v
  const nearest = Math.round(v / GRID) * GRID
  return Math.abs(v - nearest) < SNAP_THRESHOLD ? nearest : v
}

type DragTarget =
  | { kind: 'device'; id: string }
  | { kind: 'label'; id: string }
  | { kind: 'cable-label'; id: string }
  | { kind: 'cable-start'; id: string }
  | { kind: 'cable-end'; id: string }
  | { kind: 'cable-whole'; id: string }
  | { kind: 'multi-move' }
  | { kind: 'overlay' }
  | null

interface Pt { x: number; y: number }
interface LabelOffset { x: number; y: number }

interface EditorCable extends Cable {
  labelPos?: Pt
  startPos?: Pt
  endPos?: Pt
}

// Selectable element identifier
type SelectableId =
  | { kind: 'device'; id: string }
  | { kind: 'label'; id: string }
  | { kind: 'cable-start'; cableId: string }
  | { kind: 'cable-end'; cableId: string }

function selKey(s: SelectableId): string {
  if (s.kind === 'device') return `d:${s.id}`
  if (s.kind === 'label') return `l:${s.id}`
  if (s.kind === 'cable-start') return `cs:${s.cableId}`
  return `ce:${s.cableId}`
}

export default function SceneEditor() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const lesson = getLessonById(lessonId || '')

  // Editor is desktop-only — touch UX (drag, multi-select, keyboard shortcuts)
  // doesn't translate to phones/tablets yet. Gate anything below 900px.
  const [isDesktop, setIsDesktop] = useState(
    typeof window === 'undefined' ? true : window.innerWidth >= 900
  )
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 900)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const flatSteps = lesson
    ? lesson.subtopics.flatMap((st, si) =>
        st.steps.map((step, stepIdx) => ({
          subtopicTitle: st.title,
          subtopicIndex: si,
          stepIndex: stepIdx,
          step,
        }))
      )
    : []

  const [stepIndex, setStepIndex] = useState(0)
  const [devices, setDevices] = useState<NetworkDevice[]>([])
  const [labelOffsets, setLabelOffsets] = useState<Record<string, LabelOffset>>({})
  const [cables, setCables] = useState<EditorCable[]>([])
  const [dragTarget, setDragTarget] = useState<DragTarget>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [editingLabel, setEditingLabel] = useState<string | null>(null)
  const [editingCableLabel, setEditingCableLabel] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [snapEnabled, setSnapEnabled] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Zoom & pan
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<Pt>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Pt>({ x: 0, y: 0 })
  const [panStartOffset, setPanStartOffset] = useState<Pt>({ x: 0, y: 0 })
  // Clipboard & context menu
  const [clipboard, setClipboard] = useState<{ kind: 'device'; data: NetworkDevice; labelOffset: LabelOffset } | { kind: 'cable'; data: EditorCable } | null>(null)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; items: { label: string; action: () => void }[] } | null>(null)

  // Multi-select
  const [selection, setSelection] = useState<Set<string>>(new Set())
  const [marquee, setMarquee] = useState<{ start: Pt; end: Pt } | null>(null)
  const [multiDragStart, setMultiDragStart] = useState<Pt | null>(null)
  // Snapshot positions at drag start for multi-move
  const [multiDragSnap, setMultiDragSnap] = useState<{
    devices: Record<string, Pt>
    labels: Record<string, Pt>
    cableStarts: Record<string, Pt>
    cableEnds: Record<string, Pt>
  } | null>(null)

  // Snapshot for cable-whole drag
  const [cableWholeSnap, setCableWholeSnap] = useState<{ start: Pt; end: Pt; label?: Pt } | null>(null)

  // Custom overlay (OSI/TCP-IP pyramid)
  const [overlayType, setOverlayType] = useState<'osi-model' | 'tcp-ip-model' | null>(null)
  const [overlayPos, setOverlayPos] = useState<Pt>({ x: 400, y: 260 })

  // Load from current step
  useEffect(() => {
    if (flatSteps[stepIndex]) {
      const scene = flatSteps[stepIndex].step.scene
      setDevices(scene.devices.map(d => ({ ...d, position: { ...d.position } })))
      const offsets: Record<string, LabelOffset> = {}
      scene.devices.forEach(d => { offsets[d.id] = { x: 0, y: 82 } })
      setLabelOffsets(offsets)
      setCables(scene.cables.map(c => {
        const from = scene.devices.find(d => d.id === c.from)
        const to = scene.devices.find(d => d.id === c.to)
        const fx = from?.position.x ?? 0, fy = from?.position.y ?? 0
        const tx = to?.position.x ?? 0, ty = to?.position.y ?? 0
        return { ...c, labelPos: { x: (fx + tx) / 2, y: (fy + ty) / 2 }, startPos: { x: fx, y: fy }, endPos: { x: tx, y: ty } }
      }))
    }
    // Load overlay
    if (flatSteps[stepIndex]) {
      const ov = flatSteps[stepIndex].step.scene.customOverlay
      if (ov) {
        setOverlayType(ov.type)
        setOverlayPos({ ...ov.position })
      } else {
        setOverlayType(null)
      }
    }
    setEditingLabel(null)
    setEditingCableLabel(null)
    setSelection(new Set())
    setMarquee(null)
  }, [stepIndex, lessonId])

  const getCanvasPos = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    }
  }, [zoom, pan])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!e.shiftKey) return // only zoom while Shift is held
    e.preventDefault()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
    const newZoom = Math.min(Math.max(zoom * factor, 0.15), 5)
    // Zoom toward mouse position
    const newPanX = mx - (mx - pan.x) * (newZoom / zoom)
    const newPanY = my - (my - pan.y) * (newZoom / zoom)
    setZoom(newZoom)
    setPan({ x: newPanX, y: newPanY })
  }, [zoom, pan])

  const s = (v: number) => snap(v, snapEnabled)

  // Check if element is selected
  const isSel = useCallback((key: string) => selection.has(key), [selection])

  // --- Single-element drags (clear selection unless element is in selection) ---
  const startDeviceDrag = useCallback((e: React.MouseEvent, id: string) => {
    if (editingLabel || editingCableLabel) return
    const key = `d:${id}`
    // If this device is in a multi-selection, start multi-move
    if (selection.has(key) && selection.size > 1) {
      const pos = getCanvasPos(e)
      setDragTarget({ kind: 'multi-move' })
      setMultiDragStart(pos)
      // Snapshot all selected positions
      const dSnap: Record<string, Pt> = {}
      const lSnap: Record<string, Pt> = {}
      const csSnap: Record<string, Pt> = {}
      const ceSnap: Record<string, Pt> = {}
      selection.forEach(k => {
        if (k.startsWith('d:')) {
          const did = k.slice(2)
          const dev = devices.find(dd => dd.id === did)
          if (dev) dSnap[did] = { ...dev.position }
        } else if (k.startsWith('l:')) {
          const did = k.slice(2)
          const dev = devices.find(dd => dd.id === did)
          const off = labelOffsets[did] || { x: 0, y: 82 }
          if (dev) lSnap[did] = { x: dev.position.x + off.x, y: dev.position.y + off.y }
        } else if (k.startsWith('cs:')) {
          const cid = k.slice(3)
          const cab = cables.find(cc => cc.id === cid)
          if (cab?.startPos) csSnap[cid] = { ...cab.startPos }
        } else if (k.startsWith('ce:')) {
          const cid = k.slice(3)
          const cab = cables.find(cc => cc.id === cid)
          if (cab?.endPos) ceSnap[cid] = { ...cab.endPos }
        }
      })
      setMultiDragSnap({ devices: dSnap, labels: lSnap, cableStarts: csSnap, cableEnds: ceSnap })
      e.preventDefault()
      e.stopPropagation()
      return
    }
    setSelection(new Set([key]))
    const device = devices.find(d => d.id === id)
    if (!device) return
    const pos = getCanvasPos(e)
    setDragTarget({ kind: 'device', id })
    setDragOffset({ x: pos.x - device.position.x, y: pos.y - device.position.y })
    e.preventDefault()
    e.stopPropagation()
  }, [devices, editingLabel, editingCableLabel, getCanvasPos, selection, labelOffsets, cables])

  const startLabelDrag = useCallback((e: React.MouseEvent, id: string) => {
    if (editingLabel || editingCableLabel) return
    const key = `l:${id}`
    if (selection.has(key) && selection.size > 1) {
      const pos = getCanvasPos(e)
      setDragTarget({ kind: 'multi-move' })
      setMultiDragStart(pos)
      const dSnap: Record<string, Pt> = {}
      const lSnap: Record<string, Pt> = {}
      const csSnap: Record<string, Pt> = {}
      const ceSnap: Record<string, Pt> = {}
      selection.forEach(k => {
        if (k.startsWith('d:')) {
          const did = k.slice(2)
          const dev = devices.find(dd => dd.id === did)
          if (dev) dSnap[did] = { ...dev.position }
        } else if (k.startsWith('l:')) {
          const did = k.slice(2)
          const dev = devices.find(dd => dd.id === did)
          const off = labelOffsets[did] || { x: 0, y: 82 }
          if (dev) lSnap[did] = { x: dev.position.x + off.x, y: dev.position.y + off.y }
        } else if (k.startsWith('cs:')) {
          const cid = k.slice(3)
          const cab = cables.find(cc => cc.id === cid)
          if (cab?.startPos) csSnap[cid] = { ...cab.startPos }
        } else if (k.startsWith('ce:')) {
          const cid = k.slice(3)
          const cab = cables.find(cc => cc.id === cid)
          if (cab?.endPos) ceSnap[cid] = { ...cab.endPos }
        }
      })
      setMultiDragSnap({ devices: dSnap, labels: lSnap, cableStarts: csSnap, cableEnds: ceSnap })
      e.preventDefault()
      e.stopPropagation()
      return
    }
    setSelection(new Set([key]))
    const device = devices.find(d => d.id === id)
    const offset = labelOffsets[id] || { x: 0, y: 82 }
    if (!device) return
    const pos = getCanvasPos(e)
    setDragTarget({ kind: 'label', id })
    setDragOffset({ x: pos.x - (device.position.x + offset.x), y: pos.y - (device.position.y + offset.y) })
    e.preventDefault()
    e.stopPropagation()
  }, [devices, labelOffsets, editingLabel, editingCableLabel, getCanvasPos, selection, cables])

  const startCableLabelDrag = useCallback((e: React.MouseEvent, id: string) => {
    if (editingCableLabel) return
    const cable = cables.find(c => c.id === id)
    if (!cable?.labelPos) return
    const pos = getCanvasPos(e)
    setDragTarget({ kind: 'cable-label', id })
    setDragOffset({ x: pos.x - cable.labelPos.x, y: pos.y - cable.labelPos.y })
    e.preventDefault()
    e.stopPropagation()
  }, [cables, editingCableLabel, getCanvasPos])

  const startCableEndpointDrag = useCallback((e: React.MouseEvent, id: string, end: 'start' | 'end') => {
    const key = end === 'start' ? `cs:${id}` : `ce:${id}`
    if (selection.has(key) && selection.size > 1) {
      const pos = getCanvasPos(e)
      setDragTarget({ kind: 'multi-move' })
      setMultiDragStart(pos)
      const dSnap: Record<string, Pt> = {}
      const lSnap: Record<string, Pt> = {}
      const csSnap: Record<string, Pt> = {}
      const ceSnap: Record<string, Pt> = {}
      selection.forEach(k => {
        if (k.startsWith('d:')) { const did = k.slice(2); const dev = devices.find(dd => dd.id === did); if (dev) dSnap[did] = { ...dev.position } }
        else if (k.startsWith('l:')) { const did = k.slice(2); const dev = devices.find(dd => dd.id === did); const off = labelOffsets[did] || { x: 0, y: 82 }; if (dev) lSnap[did] = { x: dev.position.x + off.x, y: dev.position.y + off.y } }
        else if (k.startsWith('cs:')) { const cid = k.slice(3); const cab = cables.find(cc => cc.id === cid); if (cab?.startPos) csSnap[cid] = { ...cab.startPos } }
        else if (k.startsWith('ce:')) { const cid = k.slice(3); const cab = cables.find(cc => cc.id === cid); if (cab?.endPos) ceSnap[cid] = { ...cab.endPos } }
      })
      setMultiDragSnap({ devices: dSnap, labels: lSnap, cableStarts: csSnap, cableEnds: ceSnap })
      e.preventDefault(); e.stopPropagation()
      return
    }
    setSelection(new Set([key]))
    const cable = cables.find(c => c.id === id)
    if (!cable) return
    const p = end === 'start' ? cable.startPos : cable.endPos
    if (!p) return
    const pos = getCanvasPos(e)
    setDragTarget({ kind: end === 'start' ? 'cable-start' : 'cable-end', id })
    setDragOffset({ x: pos.x - p.x, y: pos.y - p.y })
    e.preventDefault()
    e.stopPropagation()
  }, [cables, getCanvasPos, selection, devices, labelOffsets])

  const startCableWholeDrag = useCallback((e: React.MouseEvent, id: string) => {
    const cable = cables.find(c => c.id === id)
    if (!cable || !cable.startPos || !cable.endPos) return
    const pos = getCanvasPos(e)
    setDragTarget({ kind: 'cable-whole', id })
    setDragOffset({ x: pos.x, y: pos.y })
    setCableWholeSnap({ start: { ...cable.startPos }, end: { ...cable.endPos }, label: cable.labelPos ? { ...cable.labelPos } : undefined })
    setSelection(new Set())
    e.preventDefault()
    e.stopPropagation()
  }, [cables, getCanvasPos])

  // --- Pan with middle mouse click ---
  const startPan = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      setPanStartOffset({ ...pan })
      return true
    }
    return false
  }, [pan])

  // --- Marquee selection: start on empty canvas ---
  const startMarquee = useCallback((e: React.MouseEvent) => {
    setCtxMenu(null)
    // Pan instead if middle click or space held
    if (startPan(e)) return
    // Only start marquee if clicking on empty canvas (not on an element)
    if (editingLabel || editingCableLabel) return
    const pos = getCanvasPos(e)
    setMarquee({ start: pos, end: pos })
    setSelection(new Set())
    e.preventDefault()
  }, [editingLabel, editingCableLabel, getCanvasPos, startPan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Panning
    if (isPanning) {
      setPan({
        x: panStartOffset.x + (e.clientX - panStart.x),
        y: panStartOffset.y + (e.clientY - panStart.y),
      })
      return
    }

    // Marquee drag
    if (marquee) {
      const pos = getCanvasPos(e)
      setMarquee(prev => prev ? { ...prev, end: pos } : null)
      return
    }

    if (!dragTarget) return
    const pos = getCanvasPos(e)

    // Multi-move
    if (dragTarget.kind === 'multi-move' && multiDragStart && multiDragSnap) {
      const dx = pos.x - multiDragStart.x
      const dy = pos.y - multiDragStart.y
      // Move all selected elements
      setDevices(prev => prev.map(d => {
        const sp = multiDragSnap.devices[d.id]
        if (!sp) return d
        return { ...d, position: { x: s(Math.max(0, sp.x + dx)), y: s(Math.max(0, sp.y + dy)) } }
      }))
      // Labels
      Object.entries(multiDragSnap.labels).forEach(([did, sp]) => {
        const dev = devices.find(dd => dd.id === did)
        if (dev) {
          const nx = s(sp.x + dx)
          const ny = s(sp.y + dy)
          setLabelOffsets(prev => ({ ...prev, [did]: { x: nx - dev.position.x, y: ny - dev.position.y } }))
        }
      })
      // Cable endpoints
      setCables(prev => prev.map(c => {
        let upd = { ...c }
        const ss = multiDragSnap.cableStarts[c.id]
        if (ss) upd.startPos = { x: s(ss.x + dx), y: s(ss.y + dy) }
        const se = multiDragSnap.cableEnds[c.id]
        if (se) upd.endPos = { x: s(se.x + dx), y: s(se.y + dy) }
        return upd
      }))
      return
    }

    const rawX = Math.round(pos.x - dragOffset.x)
    const rawY = Math.round(pos.y - dragOffset.y)
    const x = s(Math.max(0, rawX))
    const y = s(Math.max(0, rawY))

    if (dragTarget.kind === 'device') {
      // Snap to align with other devices/cable endpoints
      let ax = x, ay = y
      const aThresh = 5
      for (const d of devices) {
        if (d.id === dragTarget.id) continue
        if (Math.abs(ax - d.position.x) < aThresh) ax = d.position.x
        if (Math.abs(ay - d.position.y) < aThresh) ay = d.position.y
      }
      for (const c of cables) {
        if (c.startPos) {
          if (Math.abs(ax - c.startPos.x) < aThresh) ax = c.startPos.x
          if (Math.abs(ay - c.startPos.y) < aThresh) ay = c.startPos.y
        }
        if (c.endPos) {
          if (Math.abs(ax - c.endPos.x) < aThresh) ax = c.endPos.x
          if (Math.abs(ay - c.endPos.y) < aThresh) ay = c.endPos.y
        }
      }
      setDevices(prev => prev.map(d =>
        d.id === dragTarget.id ? { ...d, position: { x: ax, y: ay } } : d
      ))
    } else if (dragTarget.kind === 'label') {
      const device = devices.find(d => d.id === dragTarget.id)
      if (device) {
        setLabelOffsets(prev => ({
          ...prev,
          [dragTarget.id]: { x: x - device.position.x, y: y - device.position.y },
        }))
      }
    } else if (dragTarget.kind === 'cable-label') {
      setCables(prev => prev.map(c =>
        c.id === dragTarget.id ? { ...c, labelPos: { x, y } } : c
      ))
    } else if (dragTarget.kind === 'cable-start') {
      setCables(prev => prev.map(c => {
        if (c.id !== dragTarget.id) return c
        const other = c.endPos
        let sx = x, sy = y
        if (other) {
          if (Math.abs(sy - other.y) < 15) sy = other.y // snap horizontal
          if (Math.abs(sx - other.x) < 15) sx = other.x // snap vertical
        }
        return { ...c, startPos: { x: sx, y: sy } }
      }))
    } else if (dragTarget.kind === 'cable-end') {
      setCables(prev => prev.map(c => {
        if (c.id !== dragTarget.id) return c
        const other = c.startPos
        let ex = x, ey = y
        if (other) {
          if (Math.abs(ey - other.y) < 15) ey = other.y // snap horizontal
          if (Math.abs(ex - other.x) < 15) ex = other.x // snap vertical
        }
        return { ...c, endPos: { x: ex, y: ey } }
      }))
    } else if (dragTarget.kind === 'cable-whole' && cableWholeSnap) {
      const dx = pos.x - dragOffset.x
      const dy = pos.y - dragOffset.y
      setCables(prev => prev.map(c => {
        if (c.id !== dragTarget.id) return c
        const newStart = { x: s(cableWholeSnap.start.x + dx), y: s(cableWholeSnap.start.y + dy) }
        const newEnd = { x: s(cableWholeSnap.end.x + dx), y: s(cableWholeSnap.end.y + dy) }
        const newLabel = cableWholeSnap.label ? { x: s(cableWholeSnap.label.x + dx), y: s(cableWholeSnap.label.y + dy) } : c.labelPos
        return { ...c, startPos: newStart, endPos: newEnd, labelPos: newLabel }
      }))
    } else if (dragTarget.kind === 'overlay') {
      setOverlayPos({ x, y })
    }
  }, [dragTarget, dragOffset, devices, getCanvasPos, marquee, multiDragStart, multiDragSnap, s, selection, cableWholeSnap])

  const handleMouseUp = useCallback(() => {
    // Finalize marquee selection
    if (marquee) {
      const x1 = Math.min(marquee.start.x, marquee.end.x)
      const y1 = Math.min(marquee.start.y, marquee.end.y)
      const x2 = Math.max(marquee.start.x, marquee.end.x)
      const y2 = Math.max(marquee.start.y, marquee.end.y)
      // Only select if marquee is big enough (not just a click)
      if (x2 - x1 > 5 || y2 - y1 > 5) {
        const sel = new Set<string>()
        devices.forEach(d => {
          if (d.position.x >= x1 && d.position.x <= x2 && d.position.y >= y1 && d.position.y <= y2) {
            sel.add(`d:${d.id}`)
          }
          const off = labelOffsets[d.id] || { x: 0, y: 82 }
          const lx = d.position.x + off.x
          const ly = d.position.y + off.y
          if (lx >= x1 && lx <= x2 && ly >= y1 && ly <= y2) {
            sel.add(`l:${d.id}`)
          }
        })
        cables.forEach(c => {
          if (c.startPos && c.startPos.x >= x1 && c.startPos.x <= x2 && c.startPos.y >= y1 && c.startPos.y <= y2) {
            sel.add(`cs:${c.id}`)
          }
          if (c.endPos && c.endPos.x >= x1 && c.endPos.x <= x2 && c.endPos.y >= y1 && c.endPos.y <= y2) {
            sel.add(`ce:${c.id}`)
          }
        })
        setSelection(sel)
      }
      setMarquee(null)
      return
    }
    setDragTarget(null)
    setMultiDragStart(null)
    setMultiDragSnap(null)
    setCableWholeSnap(null)
    setIsPanning(false)
  }, [marquee, devices, cables, labelOffsets])

  // Label editing
  const handleLabelDblClick = useCallback((id: string) => { setEditingLabel(id) }, [])
  const handleLabelChange = useCallback((id: string, val: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, label: val } : d))
  }, [])
  const handleLabelBlur = useCallback(() => { setEditingLabel(null) }, [])

  // Cable label editing
  const handleCableLabelDblClick = useCallback((id: string) => { setEditingCableLabel(id) }, [])
  const handleCableLabelChange = useCallback((id: string, val: string) => {
    setCables(prev => prev.map(c => c.id === id ? { ...c, label: val } : c))
  }, [])
  const handleCableLabelBlur = useCallback(() => { setEditingCableLabel(null) }, [])

  // Context menu: copy device
  const handleDeviceContextMenu = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.shiftKey) return // shift+right = pan, no menu
    const device = devices.find(d => d.id === id)
    if (!device) return
    const offset = labelOffsets[id] || { x: 0, y: 82 }
    const canvasPos = getCanvasPos(e)
    setCtxMenu({
      x: e.clientX, y: e.clientY,
      items: [
        { label: '📋 Kopieren', action: () => { setClipboard({ kind: 'device', data: { ...device }, labelOffset: { ...offset } }); setCtxMenu(null) } },
        { label: '🗑 Löschen', action: () => { setDevices(prev => prev.filter(d => d.id !== id)); setCtxMenu(null) } },
      ],
    })
  }, [devices, labelOffsets, getCanvasPos])

  // Context menu: copy cable
  const handleCableContextMenu = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.shiftKey) return // shift+right = pan, no menu
    const cable = cables.find(c => c.id === id)
    if (!cable) return
    setCtxMenu({
      x: e.clientX, y: e.clientY,
      items: [
        { label: '📋 Kopieren', action: () => { setClipboard({ kind: 'cable', data: { ...cable } }); setCtxMenu(null) } },
        { label: '🗑 Löschen', action: () => { setCables(prev => prev.filter(c => c.id !== id)); setCtxMenu(null) } },
      ],
    })
  }, [cables])

  // Context menu: paste on canvas
  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (!clipboard) return
    const pos = getCanvasPos(e)
    const items: { label: string; action: () => void }[] = []
    if (clipboard.kind === 'device') {
      items.push({
        label: '📌 Einfügen (Device)',
        action: () => {
          const newId = `${clipboard.data.type}-${Date.now()}`
          const newDev: NetworkDevice = { ...clipboard.data, id: newId, position: { x: s(pos.x), y: s(pos.y) } }
          setDevices(prev => [...prev, newDev])
          setLabelOffsets(prev => ({ ...prev, [newId]: { ...clipboard.labelOffset } }))
          setCtxMenu(null)
        },
      })
    } else if (clipboard.kind === 'cable') {
      const cd = clipboard.data
      const cableW = cd.endPos && cd.startPos ? cd.endPos.x - cd.startPos.x : 150
      const cableH = cd.endPos && cd.startPos ? cd.endPos.y - cd.startPos.y : 0
      items.push({
        label: '📌 Einfügen (Kabel)',
        action: () => {
          const newId = `cable-${Date.now()}`
          const sp = { x: s(pos.x), y: s(pos.y) }
          const ep = { x: s(pos.x + cableW), y: s(pos.y + cableH) }
          const lp = cd.labelPos && cd.startPos ? {
            x: s(pos.x + (cd.labelPos.x - cd.startPos.x)),
            y: s(pos.y + (cd.labelPos.y - cd.startPos.y)),
          } : undefined
          const newCable: EditorCable = { ...cd, id: newId, startPos: sp, endPos: ep, labelPos: lp }
          setCables(prev => [...prev, newCable])
          setCtxMenu(null)
        },
      })
    }
    if (items.length > 0) {
      setCtxMenu({ x: e.clientX, y: e.clientY, items })
    }
  }, [clipboard, getCanvasPos, s])

  // Generate config
  const generateConfig = useCallback(() => {
    const devConfig = devices.map(d => {
      const off = labelOffsets[d.id]
      return {
        id: d.id, type: d.type, label: d.label, position: d.position,
        labelOffset: off ? { x: off.x, y: off.y } : undefined,
      }
    })
    const cableConfig = cables.map(c => ({
      id: c.id, from: c.from, to: c.to, type: c.type,
      label: c.label || undefined,
      startPos: c.startPos, endPos: c.endPos,
    }))
    const overlay = overlayType ? { type: overlayType, position: overlayPos } : undefined
    return JSON.stringify({ devices: devConfig, cables: cableConfig, customOverlay: overlay }, null, 2)
  }, [devices, cables, labelOffsets, overlayType, overlayPos])

  const copyConfig = useCallback(() => {
    navigator.clipboard.writeText(generateConfig())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generateConfig])

  if (!lesson || flatSteps.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0806', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0ece6' }}>
        <p>Lektion nicht gefunden</p>
      </div>
    )
  }

  const mono = "'JetBrains Mono', monospace"
  const isDragging = dragTarget !== null

  // Cable length label while dragging
  const dragCableLength: { cable: EditorCable; len: number } | null = (() => {
    if (!dragTarget) return null
    if (dragTarget.kind === 'cable-start' || dragTarget.kind === 'cable-end' || dragTarget.kind === 'cable-whole') {
      const c = cables.find(cc => cc.id === dragTarget.id)
      if (c?.startPos && c?.endPos) {
        const dx = c.endPos.x - c.startPos.x
        const dy = c.endPos.y - c.startPos.y
        return { cable: c, len: Math.round(Math.sqrt(dx * dx + dy * dy)) }
      }
    }
    return null
  })()

  // Marquee rect
  const mRect = marquee ? {
    x: Math.min(marquee.start.x, marquee.end.x),
    y: Math.min(marquee.start.y, marquee.end.y),
    w: Math.abs(marquee.end.x - marquee.start.x),
    h: Math.abs(marquee.end.y - marquee.start.y),
  } : null

  return (
    <>
      {/* Desktop-only gate: editor needs a real keyboard + mouse */}
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
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#4a7fb8',
              marginBottom: 18,
            }}
          >
            EDITOR · DESKTOP ONLY
          </div>
          <h1
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: 'clamp(28px, 7vw, 44px)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              maxWidth: 14,
              marginBottom: 18,
              maxInlineSize: '14ch',
            }}
          >
            Bitte am <em style={{ fontStyle: 'italic', color: '#4a7fb8' }}>PC</em> öffnen.
          </h1>
          <p
            style={{
              fontSize: 14.5,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 360,
              lineHeight: 1.6,
              marginBottom: 28,
            }}
          >
            Der Editor zum Bauen eigener Topologien braucht Maus und Tastatur. Auf
            dem Handy klappt das Drag &amp; Drop nicht zuverlässig — Lektionen
            kannst du aber problemlos auch hier ansehen.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
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

    <div
      style={{ minHeight: '100vh', background: '#0a0806', color: '#f0ece6', display: 'flex', flexDirection: 'column' }}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: '1px solid #2a2520', flexShrink: 0,
      }}>
        <button
          onClick={() => navigate(`/lesson/${lessonId}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: '1px solid #2a2520', borderRadius: 8,
            padding: '6px 12px', color: '#a09888', cursor: 'pointer', fontFamily: mono, fontSize: 11,
          }}
        >
          <ArrowLeft size={14} /> Zurück
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: mono, fontSize: 12 }}>
          <span style={{ color: '#4a7fb8', fontWeight: 600 }}>Scene Editor</span>
          <span style={{ color: '#6a6258' }}>·</span>
          <span style={{ color: '#a09888' }}>{lesson.number} — Step {stepIndex + 1}/{flatSteps.length}</span>
          <span style={{ color: '#6a6258' }}>·</span>
          {/* Zoom indicator + reset */}
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
              color: '#a09888', fontSize: 10, fontFamily: mono,
            }}
          >
            {Math.round(zoom * 100)}%
          </button>
          <span style={{ color: '#6a6258' }}>·</span>
          {/* Snap toggle */}
          <button
            onClick={() => setSnapEnabled(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: snapEnabled ? 'rgba(74, 127, 184,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${snapEnabled ? 'rgba(74, 127, 184,0.3)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
              color: snapEnabled ? '#4a7fb8' : '#6a6258', fontSize: 10, fontFamily: mono,
            }}
          >
            <Magnet size={11} /> Snap {snapEnabled ? 'ON' : 'OFF'}
          </button>
          {selection.size > 0 && (
            <span style={{ color: '#4ade80', fontSize: 10 }}>{selection.size} selected</span>
          )}
        </div>

        <button
          onClick={copyConfig}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: copied ? 'rgba(74,222,128,0.12)' : 'rgba(74, 127, 184,0.12)',
            border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(74, 127, 184,0.3)'}`,
            borderRadius: 8, padding: '6px 14px',
            color: copied ? '#4ade80' : '#4a7fb8',
            cursor: 'pointer', fontFamily: mono, fontSize: 11, fontWeight: 600,
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Kopiert!' : 'Config kopieren'}
        </button>
      </div>

      {/* Step selector */}
      <div style={{
        display: 'flex', gap: 4, padding: '8px 20px', borderBottom: '1px solid #2a2520',
        overflowX: 'auto', flexShrink: 0,
      }}>
        {flatSteps.map((fs, i) => (
          <button
            key={i}
            onClick={() => setStepIndex(i)}
            style={{
              padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontFamily: mono, fontSize: 10, whiteSpace: 'nowrap',
              background: i === stepIndex ? 'rgba(74, 127, 184,0.2)' : 'rgba(255,255,255,0.04)',
              color: i === stepIndex ? '#4a7fb8' : '#6a6258',
            }}
          >
            {i + 1}. {fs.step.title.slice(0, 30)}
          </button>
        ))}
      </div>

      {/* Canvas + sidebar */}
      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        <div
          ref={canvasRef}
          onMouseDown={startMarquee}
          onWheel={handleWheel}
          onContextMenu={e => { e.preventDefault(); if (!e.shiftKey) handleCanvasContextMenu(e) }}
          style={{
            flex: 1, position: 'relative',
            cursor: isPanning ? 'grabbing' : isDragging ? 'grabbing' : marquee ? 'crosshair' : 'default',
            overflow: 'hidden', userSelect: 'none',
          }}
        >
          {/* Grid — fixed behind zoom layer */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08, pointerEvents: 'none' }}>
            <defs>
              <pattern id="editor-grid" width={GRID * zoom} height={GRID * zoom} patternUnits="userSpaceOnUse"
                patternTransform={`translate(${pan.x} ${pan.y})`}>
                <circle cx={GRID * zoom} cy={GRID * zoom} r={Math.max(0.4, 0.6 * zoom)} fill="#6a6258" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#editor-grid)" />
          </svg>

          {/* Zoom + pan transform wrapper */}
          <div style={{
            position: 'absolute', inset: 0,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            pointerEvents: 'none',
          }}>

          {/* Cables */}
          <svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 1 }}>
            {cables.map(cable => {
              const sx = cable.startPos?.x ?? 0
              const sy = cable.startPos?.y ?? 0
              const ex = cable.endPos?.x ?? 0
              const ey = cable.endPos?.y ?? 0
              const color = getCableColor(cable.type)
              const isStartDragging = dragTarget?.kind === 'cable-start' && dragTarget.id === cable.id
              const isEndDragging = dragTarget?.kind === 'cable-end' && dragTarget.id === cable.id
              return (
                <g key={cable.id}>
                  {/* Invisible wide hit area for whole-cable drag */}
                  <line
                    x1={sx} y1={sy} x2={ex} y2={ey}
                    stroke="transparent" strokeWidth={16}
                    style={{ pointerEvents: 'stroke', cursor: (dragTarget?.kind === 'cable-whole' && dragTarget.id === cable.id) ? 'grabbing' : 'grab' }}
                    onMouseDown={e => startCableWholeDrag(e, cable.id)}
                    onContextMenu={e => handleCableContextMenu(e as unknown as React.MouseEvent, cable.id)}
                  />
                  {/* Visible cable */}
                  <line
                    x1={sx} y1={sy} x2={ex} y2={ey}
                    stroke={color}
                    strokeWidth={1.5}
                    strokeDasharray={getCableDash(cable.type)}
                    opacity={0.5}
                    strokeLinecap="round"
                  />
                  {/* Endpoint drag areas — always present, invisible, move cursor */}
                  <circle
                    cx={sx} cy={sy} r={10}
                    fill="transparent"
                    style={{ cursor: isStartDragging ? 'grabbing' : 'move', pointerEvents: 'auto' }}
                    onMouseDown={e => startCableEndpointDrag(e, cable.id, 'start')}
                  />
                  <circle
                    cx={ex} cy={ey} r={10}
                    fill="transparent"
                    style={{ cursor: isEndDragging ? 'grabbing' : 'move', pointerEvents: 'auto' }}
                    onMouseDown={e => startCableEndpointDrag(e, cable.id, 'end')}
                  />
                </g>
              )
            })}
          </svg>

          {/* Custom Overlay (OSI / TCP-IP pyramid) — draggable */}
          {overlayType && (() => {
            const isOsi = overlayType === 'osi-model'
            const osiLayers = [
              { num: 7, name: 'APPLICATION', desc: 'User interface', color: '#2d7d9a' },
              { num: 6, name: 'PRESENTATION', desc: 'Data translation', color: '#3a9e6e' },
              { num: 5, name: 'SESSION', desc: 'Managing connections', color: '#6ab04c' },
              { num: 4, name: 'TRANSPORT', desc: 'Reliable data transfer', color: '#f6d55c' },
              { num: 3, name: 'NETWORK', desc: 'Path determination', color: '#f0a030' },
              { num: 2, name: 'DATA LINK', desc: 'Physical addressing', color: '#e87830' },
              { num: 1, name: 'PHYSICAL', desc: 'Bits in a wire', color: '#e04040' },
            ]
            const tcpLayers = [
              { num: 4, name: 'APPLICATION', desc: 'HTTP, DNS, SMTP, FTP, SSH', color: '#2d7d9a', osi: 'OSI 5–7' },
              { num: 3, name: 'TRANSPORT', desc: 'TCP (reliable), UDP (fast)', color: '#f6d55c', osi: 'OSI 4' },
              { num: 2, name: 'INTERNET', desc: 'IP, ICMP, ARP, OSPF', color: '#f0a030', osi: 'OSI 3' },
              { num: 1, name: 'NETWORK ACCESS', desc: 'Ethernet, Wi-Fi, PPP', color: '#e04040', osi: 'OSI 1–2' },
            ]
            const layers = isOsi ? osiLayers : tcpLayers
            const layerH = isOsi ? 52 : 64
            const totalH = layers.length * layerH
            const topW = isOsi ? 280 : 320
            const botW = isOsi ? 600 : 560
            const cx = overlayPos.x
            const startY = overlayPos.y - totalH / 2
            const isDraggingOverlay = dragTarget?.kind === 'overlay'
            return (
              <div
                style={{ position: 'absolute', left: 0, top: 0, width: 9999, height: 9999 }}
                onMouseDown={e => {
                  e.stopPropagation()
                  const pos = getCanvasPos(e)
                  setDragTarget({ kind: 'overlay' })
                  setDragOffset({ x: pos.x - overlayPos.x, y: pos.y - overlayPos.y })
                }}
              >
                {/* Title */}
                <div style={{
                  position: 'absolute',
                  top: startY - 40, left: cx - 200, width: 400,
                  textAlign: 'center',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 16, fontWeight: 800, letterSpacing: '0.2em',
                  color: '#f0ece6', textTransform: 'uppercase',
                  pointerEvents: 'none',
                }}>
                  {isOsi ? 'The OSI Model' : 'The TCP/IP Model'}
                </div>
                {/* Trapezoids */}
                <svg style={{ position: 'absolute', left: 0, top: 0, width: 9999, height: 9999, overflow: 'visible', pointerEvents: 'none' }}>
                  {layers.map((l, i) => {
                    const t = layers.length > 1 ? i / (layers.length - 1) : 0
                    const w = topW + (botW - topW) * t
                    const nextW = i < layers.length - 1 ? topW + (botW - topW) * ((i + 1) / (layers.length - 1)) : w + 30
                    const y = startY + i * layerH
                    const x1 = cx - w / 2, x2 = cx + w / 2
                    const x3 = cx + nextW / 2, x4 = cx - nextW / 2
                    return (
                      <polygon
                        key={l.num}
                        points={`${x1},${y} ${x2},${y} ${x3},${y + layerH} ${x4},${y + layerH}`}
                        fill={l.color} opacity={0.9}
                      />
                    )
                  })}
                </svg>
                {/* Text labels */}
                {layers.map((l, i) => {
                  const t = layers.length > 1 ? i / (layers.length - 1) : 0
                  const w = topW + (botW - topW) * t
                  const y = startY + i * layerH
                  return (
                    <div key={l.num}>
                      <div style={{
                        position: 'absolute',
                        top: y + (isOsi ? 8 : 10), left: cx - w / 2 + 20, width: w - 40,
                        display: 'flex', alignItems: 'center', gap: 14,
                        pointerEvents: 'none',
                      }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: isOsi ? 22 : 24, fontWeight: 800, color: '#fff',
                          textShadow: '0 2px 8px rgba(0,0,0,0.3)', minWidth: 28,
                        }}>
                          {l.num}
                        </span>
                        <div>
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: isOsi ? 15 : 16, fontWeight: 700, color: '#fff',
                            letterSpacing: '0.08em', textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          }}>
                            {l.name}
                          </span>
                          {!isOsi && 'osi' in l && (
                            <div style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2,
                            }}>
                              {(l as any).osi}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: y + (isOsi ? 14 : 18), left: cx + w / 2 + 16,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12, color: '#a09888', whiteSpace: 'nowrap', pointerEvents: 'none',
                      }}>
                        {l.desc}
                      </div>
                    </div>
                  )
                })}
                {/* Drag handle indicator — center crosshair */}
                <div style={{
                  position: 'absolute',
                  left: cx - 12, top: overlayPos.y - 12,
                  width: 24, height: 24, borderRadius: '50%',
                  border: `2px dashed ${isDraggingOverlay ? '#60a5fa' : 'rgba(255,255,255,0.3)'}`,
                  cursor: isDraggingOverlay ? 'grabbing' : 'grab',
                  pointerEvents: 'auto',
                }} />
                {/* Position label */}
                <div style={{
                  position: 'absolute',
                  left: cx + 18, top: overlayPos.y - 8,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9, color: '#6a6258', pointerEvents: 'none',
                }}>
                  {Math.round(overlayPos.x)}, {Math.round(overlayPos.y)}
                </div>
              </div>
            )
          })()}

          {/* Device icons */}
          {devices.map(device => {
            const isActive = (dragTarget?.kind === 'device' && dragTarget.id === device.id) || isSel(`d:${device.id}`)
            return (
              <div
                key={`icon-${device.id}`}
                onMouseDown={e => startDeviceDrag(e, device.id)}
                onContextMenu={e => handleDeviceContextMenu(e, device.id)}
                style={{
                  position: 'absolute',
                  left: device.position.x - 36,
                  top: device.position.y - 36,
                  cursor: isActive ? 'grabbing' : 'grab',
                  zIndex: isActive ? 20 : 10,
                  pointerEvents: 'auto',
                }}
              >
                <div style={{
                  border: isActive ? '2px solid #4a7fb8' : '2px solid transparent',
                  borderRadius: 12, padding: 2,
                  background: '#0a0806',
                }}>
                  <DeviceIcon type={device.type} size={72} highlighted={isActive} />
                </div>
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 8, fontFamily: mono, color: '#6a6258',
                  background: 'rgba(10,8,6,0.9)', padding: '1px 5px', borderRadius: 3,
                  whiteSpace: 'nowrap', pointerEvents: 'none',
                }}>
                  {device.position.x},{device.position.y}
                </div>
              </div>
            )
          })}

          {/* Labels */}
          {devices.map(device => {
            const offset = labelOffsets[device.id] || { x: 0, y: 82 }
            const lx = device.position.x + offset.x
            const ly = device.position.y + offset.y
            const isActive = (dragTarget?.kind === 'label' && dragTarget.id === device.id) || isSel(`l:${device.id}`)
            const isEditing = editingLabel === device.id
            return (
              <div
                key={`label-${device.id}`}
                onMouseDown={e => startLabelDrag(e, device.id)}
                onDoubleClick={() => handleLabelDblClick(device.id)}
                style={{
                  position: 'absolute', left: lx, top: ly, transform: 'translateX(-50%)',
                  cursor: isEditing ? 'text' : isActive ? 'grabbing' : 'grab',
                  zIndex: isActive ? 25 : 15,
                  pointerEvents: 'auto',
                }}
              >
                {isEditing ? (
                  <textarea
                    autoFocus
                    value={device.label}
                    onChange={e => handleLabelChange(device.id, e.target.value)}
                    onBlur={handleLabelBlur}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleLabelBlur() } }}
                    onMouseDown={e => e.stopPropagation()}
                    style={{
                      fontSize: 11, fontFamily: mono, fontWeight: 500,
                      padding: '3px 8px', borderRadius: 6, textAlign: 'center',
                      color: '#4a7fb8', background: 'rgba(74, 127, 184,0.15)',
                      border: '1px solid rgba(74, 127, 184,0.4)',
                      resize: 'none', width: 160, minHeight: 30, lineHeight: 1.3,
                    }}
                  />
                ) : (
                  <span style={{
                    display: 'inline-block', fontSize: 11, fontFamily: mono, fontWeight: 500,
                    whiteSpace: 'pre', padding: '3px 8px', borderRadius: 6,
                    color: isActive ? '#4a7fb8' : '#a09888',
                    background: isActive ? 'rgba(74, 127, 184,0.12)' : 'rgba(10,8,6,0.7)',
                    border: isActive ? '1px dashed rgba(74, 127, 184,0.4)' : '1px solid transparent',
                    textAlign: 'center', lineHeight: 1.3,
                  }}>
                    {device.label}
                  </span>
                )}
              </div>
            )
          })}

          {/* Cable labels */}
          {cables.map(cable => {
            if (!cable.label || !cable.labelPos) return null
            const isActive = dragTarget?.kind === 'cable-label' && dragTarget.id === cable.id
            const isEditing = editingCableLabel === cable.id
            return (
              <div
                key={`clabel-${cable.id}`}
                onMouseDown={e => startCableLabelDrag(e, cable.id)}
                onDoubleClick={() => handleCableLabelDblClick(cable.id)}
                style={{
                  position: 'absolute', left: cable.labelPos.x, top: cable.labelPos.y,
                  transform: 'translate(-50%, -50%)',
                  cursor: isEditing ? 'text' : isActive ? 'grabbing' : 'grab',
                  zIndex: isActive ? 25 : 12,
                  pointerEvents: 'auto',
                }}
              >
                {isEditing ? (
                  <input
                    autoFocus value={cable.label}
                    onChange={e => handleCableLabelChange(cable.id, e.target.value)}
                    onBlur={handleCableLabelBlur}
                    onKeyDown={e => { if (e.key === 'Enter') handleCableLabelBlur() }}
                    onMouseDown={e => e.stopPropagation()}
                    style={{
                      fontSize: 10, fontFamily: mono, fontWeight: 500,
                      padding: '2px 6px', borderRadius: 4, textAlign: 'center',
                      color: '#4a7fb8', background: 'rgba(74, 127, 184,0.15)',
                      border: '1px solid rgba(74, 127, 184,0.4)', width: 100,
                    }}
                  />
                ) : (
                  <span style={{
                    display: 'inline-block', fontSize: 10, fontFamily: mono, fontWeight: 500,
                    padding: '2px 6px', borderRadius: 4,
                    color: isActive ? '#4a7fb8' : '#8a8278',
                    background: isActive ? 'rgba(74, 127, 184,0.12)' : 'rgba(10,8,6,0.75)',
                    border: isActive ? '1px dashed rgba(74, 127, 184,0.4)' : '1px solid transparent',
                    whiteSpace: 'nowrap',
                  }}>
                    {cable.label}
                  </span>
                )}
              </div>
            )
          })}

          {/* Cable length label while dragging */}
          {dragCableLength && (
            <div style={{
              position: 'absolute',
              left: ((dragCableLength.cable.startPos!.x + dragCableLength.cable.endPos!.x) / 2),
              top: ((dragCableLength.cable.startPos!.y + dragCableLength.cable.endPos!.y) / 2) - 20,
              transform: 'translateX(-50%)',
              fontSize: 10, fontFamily: mono, fontWeight: 500,
              color: 'rgba(100,180,255,0.9)',
              background: 'rgba(10,8,6,0.85)', padding: '2px 8px', borderRadius: 4,
              pointerEvents: 'none', zIndex: 40, whiteSpace: 'nowrap',
            }}>
              {dragCableLength.len}px
            </div>
          )}

          {/* Marquee selection rectangle */}
          {mRect && mRect.w > 2 && mRect.h > 2 && (
            <div style={{
              position: 'absolute', left: mRect.x, top: mRect.y,
              width: mRect.w, height: mRect.h,
              border: '1px solid rgba(74, 127, 184,0.6)',
              background: 'rgba(74, 127, 184,0.08)',
              borderRadius: 2, pointerEvents: 'none', zIndex: 50,
            }} />
          )}

          </div>{/* end zoom wrapper */}
        </div>

        {/* Sidebar */}
        <div style={{
          width: 340, borderLeft: '1px solid #2a2520',
          background: '#141210', padding: 16, overflow: 'auto', flexShrink: 0,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: '#6a6258', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Live Config
          </div>
          <pre style={{
            fontFamily: mono, fontSize: 9, color: '#a09888',
            background: '#0a0806', borderRadius: 8, padding: 12,
            border: '1px solid #2a2520', overflow: 'auto', flex: 1,
            lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          }}>
            {generateConfig()}
          </pre>
          <div style={{ marginTop: 12, fontFamily: mono, fontSize: 10, color: '#6a6258', lineHeight: 1.8 }}>
            <p><span style={{ color: '#4a7fb8' }}>Drag</span> — Icon / Label / Kabelende</p>
            <p><span style={{ color: '#4a7fb8' }}>Kabel klicken</span> — Ganzes Kabel verschieben</p>
            <p><span style={{ color: '#4a7fb8' }}>Rechteck ziehen</span> — Multi-Select</p>
            <p><span style={{ color: '#4a7fb8' }}>Hover Kabel</span> — Endpunkte einzeln anpassen</p>
            <p><span style={{ color: '#4a7fb8' }}>Doppelklick</span> — Text bearbeiten</p>
            <p><span style={{ color: '#4a7fb8' }}>Shift + Scroll</span> — Zoom rein/raus</p>
            <p><span style={{ color: '#4a7fb8' }}>Mittelklick Drag</span> — Canvas verschieben</p>
            <p><span style={{ color: '#4a7fb8' }}>Rechtsklick Element</span> — Kopieren / Löschen</p>
            <p><span style={{ color: '#4a7fb8' }}>Rechtsklick Canvas</span> — Einfügen</p>
            <p><span style={{ color: '#4a7fb8' }}>Magnet</span> — Snap an Grid (25px)</p>
          </div>
        </div>
      </div>

      {/* Context menu */}
      {ctxMenu && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
            onClick={() => setCtxMenu(null)}
            onContextMenu={e => { e.preventDefault(); setCtxMenu(null) }}
          />
          <div style={{
            position: 'fixed', left: ctxMenu.x, top: ctxMenu.y, zIndex: 1000,
            background: '#1a1714', border: '1px solid #2a2520', borderRadius: 8,
            padding: '4px 0', minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}>
            {ctxMenu.items.map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 14px', border: 'none', background: 'none',
                  color: '#e0dcd6', fontSize: 12, fontFamily: mono,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74, 127, 184,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
    </>
  )
}
