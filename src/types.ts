export interface Position {
  x: number
  y: number
}

export type DeviceType =
  | 'router'
  | 'switch'
  | 'l3switch'
  | 'firewall'
  | 'access-point'
  | 'server'
  | 'pc'
  | 'laptop'
  | 'phone'
  | 'cloud'
  | 'controller'
  | 'printer'

export interface NetworkDevice {
  id: string
  type: DeviceType
  label: string
  position: Position
  info?: string
  highlighted?: boolean
  labelOffset?: Position
}

export type CableType = 'ethernet' | 'fiber-single' | 'fiber-multi' | 'serial' | 'wireless'

export interface Cable {
  id: string
  from: string
  to: string
  type: CableType
  label?: string
  highlighted?: boolean
  startPos?: Position
  endPos?: Position
}

export interface PacketHop {
  fromDevice: string
  toDevice: string
  hint?: string
}

export interface PacketAnimation {
  id: string
  label: string
  color: string
  hops: PacketHop[]
  protocol?: string
}

export interface SceneState {
  devices: NetworkDevice[]
  cables: Cable[]
  packets?: PacketAnimation[]
  highlightDevices?: string[]
  highlightCables?: string[]
  customOverlay?: {
    type: 'osi-model' | 'tcp-ip-model'
    position: Position
    /** Walk through the layers one by one with a short explanation popup
     *  per layer, instead of rendering the pyramid statically. Each entry
     *  is the hint shown for that layer (top-down: layer 7 first for OSI,
     *  layer 4 first for TCP/IP). */
    layerWalk?: string[]
  }
}

export interface LessonStep {
  title: string
  description: string
  analogy?: string
  scene: SceneState
  modal?: {
    title: string
    content: string
  }
}

export interface SubTopic {
  id: string
  title: string
  steps: LessonStep[]
  youtube?: string
}

export interface Lesson {
  id: string
  number: string
  title: string
  subtitle: string
  subtopics: SubTopic[]
}
