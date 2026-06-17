import type { ReactNode } from 'react'
import type { DeviceType } from '../types'

interface DeviceIconProps {
  type: DeviceType
  size?: number
  highlighted?: boolean
}

export default function DeviceIcon({ type, size = 48, highlighted = false }: DeviceIconProps) {
  // Match the homepage palette: monochrome white-on-dark.
  // Default = soft white (low opacity), highlighted = full white emphasis.
  // Packet animations keep their orange envelope — those live in NetworkCanvas.
  const s = highlighted ? '#ffffff' : 'rgba(255, 255, 255, 0.55)'
  const f = 'none'

  const icons: Record<DeviceType, ReactNode> = {
    router: (
      <g>
        {/* Cisco-style router: cylinder */}
        <ellipse cx="24" cy="14" rx="16" ry="6" fill={f} stroke={s} strokeWidth="1.5" />
        <path d="M8 14v18" stroke={s} strokeWidth="1.5" />
        <path d="M40 14v18" stroke={s} strokeWidth="1.5" />
        <ellipse cx="24" cy="32" rx="16" ry="6" fill={f} stroke={s} strokeWidth="1.5" />
        {/* Arrows inside */}
        <path d="M18 21l6-4 6 4" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M30 27l-6 4-6-4" fill="none" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
    switch: (
      <g>
        {/* Flat rectangle with port indicators */}
        <rect x="4" y="16" width="40" height="16" rx="2" fill={f} stroke={s} strokeWidth="1.5" />
        {/* Port indicators */}
        <rect x="8" y="19" width="4" height="4" rx="0.5" fill={s} opacity="0.7" />
        <rect x="14" y="19" width="4" height="4" rx="0.5" fill={s} opacity="0.7" />
        <rect x="20" y="19" width="4" height="4" rx="0.5" fill={s} opacity="0.5" />
        <rect x="26" y="19" width="4" height="4" rx="0.5" fill={s} opacity="0.5" />
        <rect x="32" y="19" width="4" height="4" rx="0.5" fill={s} opacity="0.4" />
        <rect x="38" y="19" width="4" height="4" rx="0.5" fill={s} opacity="0.4" />
        {/* LED row */}
        <circle cx="10" cy="28" r="1" fill="#4ade80" opacity="0.8" />
        <circle cx="16" cy="28" r="1" fill="#4ade80" opacity="0.8" />
        <circle cx="22" cy="28" r="1" fill="#fbbf24" opacity="0.6" />
        <circle cx="28" cy="28" r="1" fill={s} opacity="0.3" />
        <circle cx="34" cy="28" r="1" fill={s} opacity="0.3" />
        <circle cx="40" cy="28" r="1" fill={s} opacity="0.3" />
        {/* Arrows on sides — switching */}
        <path d="M2 22l-0 4" stroke={s} strokeWidth="1" opacity="0.4" />
        <path d="M46 22l0 4" stroke={s} strokeWidth="1" opacity="0.4" />
      </g>
    ),
    l3switch: (
      <g>
        {/* Like switch but with L3 badge */}
        <rect x="4" y="16" width="40" height="16" rx="2" fill={f} stroke={s} strokeWidth="1.5" />
        <rect x="8" y="19" width="4" height="4" rx="0.5" fill={s} opacity="0.7" />
        <rect x="14" y="19" width="4" height="4" rx="0.5" fill={s} opacity="0.7" />
        <rect x="20" y="19" width="4" height="4" rx="0.5" fill={s} opacity="0.5" />
        <rect x="26" y="19" width="4" height="4" rx="0.5" fill={s} opacity="0.5" />
        <rect x="32" y="19" width="4" height="4" rx="0.5" fill={s} opacity="0.4" />
        <rect x="38" y="19" width="4" height="4" rx="0.5" fill={s} opacity="0.4" />
        <circle cx="10" cy="28" r="1" fill="#4ade80" opacity="0.8" />
        <circle cx="16" cy="28" r="1" fill="#4ade80" opacity="0.8" />
        {/* L3 badge */}
        <rect x="28" y="26" width="14" height="7" rx="2" fill={s} opacity="0.2" />
        <text x="35" y="31.5" textAnchor="middle" fill={s} fontSize="6" fontFamily="monospace" fontWeight="bold">L3</text>
      </g>
    ),
    firewall: (
      <g>
        {/* Shield shape */}
        <path d="M24 6 L40 14 L40 28 Q40 40 24 44 Q8 40 8 28 L8 14 Z" fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round" />
        {/* Brick pattern inside */}
        <line x1="12" y1="18" x2="36" y2="18" stroke={s} strokeWidth="1" opacity="0.4" />
        <line x1="12" y1="24" x2="36" y2="24" stroke={s} strokeWidth="1" opacity="0.4" />
        <line x1="12" y1="30" x2="36" y2="30" stroke={s} strokeWidth="1" opacity="0.4" />
        <line x1="24" y1="14" x2="24" y2="18" stroke={s} strokeWidth="1" opacity="0.4" />
        <line x1="18" y1="18" x2="18" y2="24" stroke={s} strokeWidth="1" opacity="0.4" />
        <line x1="30" y1="18" x2="30" y2="24" stroke={s} strokeWidth="1" opacity="0.4" />
        <line x1="24" y1="24" x2="24" y2="30" stroke={s} strokeWidth="1" opacity="0.4" />
        {/* Flame/lock icon */}
        <path d="M22 34 Q24 38 26 34" fill="none" stroke={s} strokeWidth="1" opacity="0.6" />
      </g>
    ),
    'access-point': (
      <g>
        {/* Base unit */}
        <ellipse cx="24" cy="34" rx="8" ry="3" fill={f} stroke={s} strokeWidth="1.5" />
        <line x1="24" y1="31" x2="24" y2="24" stroke={s} strokeWidth="1.5" />
        {/* Antenna body */}
        <circle cx="24" cy="22" r="4" fill={f} stroke={s} strokeWidth="1.5" />
        {/* Signal waves */}
        <path d="M16 16 Q20 10 24 16" fill="none" stroke={s} strokeWidth="1.2" opacity="0.5" />
        <path d="M24 16 Q28 10 32 16" fill="none" stroke={s} strokeWidth="1.2" opacity="0.5" />
        <path d="M12 12 Q18 4 24 12" fill="none" stroke={s} strokeWidth="1" opacity="0.3" />
        <path d="M24 12 Q30 4 36 12" fill="none" stroke={s} strokeWidth="1" opacity="0.3" />
      </g>
    ),
    server: (
      <g>
        {/* Server rack — 3 units stacked */}
        <rect x="10" y="6" width="28" height="10" rx="2" fill={f} stroke={s} strokeWidth="1.5" />
        <rect x="10" y="18" width="28" height="10" rx="2" fill={f} stroke={s} strokeWidth="1.5" />
        <rect x="10" y="30" width="28" height="10" rx="2" fill={f} stroke={s} strokeWidth="1.5" />
        {/* Drive bays */}
        <rect x="14" y="9" width="8" height="4" rx="0.5" fill={s} opacity="0.2" />
        <rect x="14" y="21" width="8" height="4" rx="0.5" fill={s} opacity="0.2" />
        <rect x="14" y="33" width="8" height="4" rx="0.5" fill={s} opacity="0.2" />
        {/* Status LEDs */}
        <circle cx="33" cy="11" r="1.5" fill="#4ade80" opacity="0.8" />
        <circle cx="33" cy="23" r="1.5" fill="#4ade80" opacity="0.8" />
        <circle cx="33" cy="35" r="1.5" fill="#fbbf24" opacity="0.6" />
        {/* Vent lines */}
        <line x1="26" y1="9" x2="26" y2="13" stroke={s} strokeWidth="0.5" opacity="0.3" />
        <line x1="28" y1="9" x2="28" y2="13" stroke={s} strokeWidth="0.5" opacity="0.3" />
        <line x1="26" y1="21" x2="26" y2="25" stroke={s} strokeWidth="0.5" opacity="0.3" />
        <line x1="28" y1="21" x2="28" y2="25" stroke={s} strokeWidth="0.5" opacity="0.3" />
      </g>
    ),
    pc: (
      <g>
        {/* Monitor */}
        <rect x="10" y="6" width="28" height="20" rx="2" fill={f} stroke={s} strokeWidth="1.5" />
        {/* Screen inner */}
        <rect x="13" y="9" width="22" height="14" rx="1" fill={s} opacity="0.08" />
        {/* Stand */}
        <path d="M20 26v4h8v-4" stroke={s} strokeWidth="1.5" />
        {/* Base */}
        <path d="M14 30h20" stroke={s} strokeWidth="2" strokeLinecap="round" />
        {/* Keyboard */}
        <rect x="8" y="34" width="32" height="6" rx="1.5" fill={f} stroke={s} strokeWidth="1" />
        <line x1="12" y1="37" x2="36" y2="37" stroke={s} strokeWidth="0.5" opacity="0.4" />
      </g>
    ),
    laptop: (
      <g>
        {/* Screen */}
        <rect x="8" y="8" width="32" height="22" rx="2" fill={f} stroke={s} strokeWidth="1.5" />
        <rect x="11" y="11" width="26" height="16" rx="1" fill={s} opacity="0.06" />
        {/* Hinge */}
        <line x1="8" y1="30" x2="40" y2="30" stroke={s} strokeWidth="1" />
        {/* Keyboard base — perspective */}
        <path d="M6 30 L4 40 L44 40 L42 30 Z" fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round" />
        {/* Trackpad */}
        <rect x="19" y="34" width="10" height="4" rx="1" fill="none" stroke={s} strokeWidth="0.8" opacity="0.4" />
      </g>
    ),
    phone: (
      <g>
        {/* Phone body */}
        <rect x="14" y="4" width="20" height="40" rx="4" fill={f} stroke={s} strokeWidth="1.5" />
        {/* Screen */}
        <rect x="16" y="10" width="16" height="24" rx="1" fill={s} opacity="0.06" />
        {/* Speaker */}
        <rect x="20" y="6" width="8" height="2" rx="1" fill={s} opacity="0.3" />
        {/* Camera */}
        <circle cx="24" cy="7" r="1" fill={s} opacity="0.3" />
        {/* Home button / bar */}
        <rect x="20" y="38" width="8" height="2" rx="1" fill={s} opacity="0.3" />
      </g>
    ),
    cloud: (
      <g>
        {/* Cloud shape — puffy */}
        <path d="M16 34 Q8 34 8 28 Q8 22 14 20 Q14 12 24 12 Q34 12 34 20 Q40 22 40 28 Q40 34 32 34 Z" fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round" />
        {/* Inner detail */}
        <path d="M18 28 Q16 24 20 22" stroke={s} strokeWidth="0.8" opacity="0.3" fill="none" />
        <path d="M28 28 Q32 24 28 22" stroke={s} strokeWidth="0.8" opacity="0.3" fill="none" />
        {/* Upload/download arrows */}
        <path d="M21 26v-4l-2 2M21 22l2 2" stroke={s} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
        <path d="M27 24v4l-2-2M27 28l2-2" stroke={s} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
      </g>
    ),
    controller: (
      <g>
        {/* WLC body */}
        <rect x="6" y="12" width="36" height="24" rx="3" fill={f} stroke={s} strokeWidth="1.5" />
        {/* Screen */}
        <rect x="10" y="15" width="16" height="10" rx="1" fill={s} opacity="0.08" />
        {/* Status panel */}
        <circle cx="32" cy="18" r="2" fill="#4ade80" opacity="0.6" />
        <circle cx="32" cy="24" r="2" fill="#fbbf24" opacity="0.4" />
        <circle cx="32" cy="30" r="2" fill={s} opacity="0.2" />
        {/* Bottom vents */}
        <line x1="10" y1="30" x2="24" y2="30" stroke={s} strokeWidth="0.5" opacity="0.3" />
        <line x1="10" y1="32" x2="24" y2="32" stroke={s} strokeWidth="0.5" opacity="0.3" />
      </g>
    ),
    printer: (
      <g>
        {/* Paper tray top */}
        <path d="M12 14 L12 8 L36 8 L36 14" fill={f} stroke={s} strokeWidth="1.2" />
        {/* Main body */}
        <rect x="8" y="14" width="32" height="16" rx="2" fill={f} stroke={s} strokeWidth="1.5" />
        {/* Paper slot */}
        <rect x="14" y="14" width="20" height="2" rx="0.5" fill={s} opacity="0.15" />
        {/* Output tray */}
        <path d="M12 30 L8 38 L40 38 L36 30" fill={f} stroke={s} strokeWidth="1.2" strokeLinejoin="round" />
        {/* Output paper */}
        <rect x="16" y="32" width="16" height="4" rx="0.5" fill={s} opacity="0.1" stroke={s} strokeWidth="0.5" />
        {/* Control buttons */}
        <circle cx="32" cy="22" r="1.5" fill={s} opacity="0.4" />
        <circle cx="36" cy="22" r="1.5" fill="#4ade80" opacity="0.5" />
      </g>
    ),
  }

  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      {icons[type]}
    </svg>
  )
}
