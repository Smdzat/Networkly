import type { Lesson } from '../../types'

const lesson: Lesson = {
  id: '1.8',
  number: '1.8',
  title: 'IPv6-Adressierung',
  subtitle: 'Configure and verify IPv6 addressing and prefix',
  subtopics: [
    {
      id: '1.8.1',
      title: 'Warum IPv6?',
      steps: [
        {
          title: 'IPv4 gehen die Adressen aus!',
          description:
            'IPv4 hat nur ~4,3 Milliarden Adressen. Es gibt aber über 20 Milliarden vernetzte Geräte. NAT war die Notlösung — IPv6 ist die echte Lösung: 128 Bit = 340 Sextillionen Adressen. Genug für jeden Sandkorn auf der Erde eine eigene IP.',
          analogy: 'IPv4 = 5-stellige Postleitzahlen (begrenzt). IPv6 = 39-stellige Nummern (praktisch unendlich).',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'IPv4 only\n192.168.1.10', position: { x: 80, y: 140 } },
              { id: 'pc2', type: 'laptop', label: 'Dual-Stack\n192.168.1.11 +\n2001:db8::11', position: { x: 80, y: 340 } },
              { id: 'phone', type: 'phone', label: 'IPv6 only\n2001:db8::12', position: { x: 80, y: 500 } },
              { id: 'ap', type: 'access-point', label: 'AP', position: { x: 200, y: 500 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 300, y: 330 } },
              { id: 'router', type: 'router', label: 'Dual-Stack Router\nIPv4 + IPv6', position: { x: 520, y: 330 } },
              { id: 'internet', type: 'cloud', label: 'Internet\nIPv4 + IPv6', position: { x: 720, y: 330 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet', label: 'IPv4' },
              { id: 'c2', from: 'pc2', to: 'sw', type: 'ethernet', label: 'Dual' },
              { id: 'c3', from: 'phone', to: 'ap', type: 'wireless', label: 'IPv6' },
              { id: 'c3b', from: 'ap', to: 'sw', type: 'ethernet' },
              { id: 'c4', from: 'sw', to: 'router', type: 'ethernet' },
              { id: 'c5', from: 'router', to: 'internet', type: 'serial' },
            ],
            packets: [
              {
                id: 'v6',
                label: 'IPv6',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'pc2', toDevice: 'sw', hint: 'Dual-Stack-Laptop schickt ein IPv6-Paket. Hat sowohl IPv4 als auch IPv6 — wählt automatisch die bessere Variante.' },
                  { fromDevice: 'sw', toDevice: 'router', hint: 'Switch arbeitet auf Layer 2 — egal ob IPv4 oder IPv6 im Frame, er reicht ihn weiter.' },
                  { fromDevice: 'router', toDevice: 'internet', hint: 'Dual-Stack-Router routet nach IPv6 ins Internet. Kein NAT nötig — jedes IPv6-Gerät hat seine eigene öffentliche Adresse.' },
                ],
              },
              {
                id: 'v6-back',
                label: 'IPv6 Reply',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'internet', toDevice: 'router', hint: 'Antwort kommt direkt zurück an die globale IPv6-Adresse des Laptops — keine Übersetzung notwendig.' },
                  { fromDevice: 'router', toDevice: 'sw', hint: 'Router schickt das Paket weiter ins LAN. IPv6-Header ist schlanker als IPv4 — schnelleres Forwarding.' },
                  { fromDevice: 'sw', toDevice: 'pc2', hint: 'Laptop bekommt die Antwort. Echtes Ende-zu-Ende-Routing wie das Internet ursprünglich gedacht war.' },
                ],
              },
            ],
            highlightDevices: ['router'],
          },
          modal: {
            title: 'IPv4 vs. IPv6 Vergleich',
            content: 'IPv4:\n• 32 Bit → 4,3 Milliarden Adressen\n• NAT nötig\n• Broadcast vorhanden\n• Header: 20-60 Byte, variabel\n\nIPv6:\n• 128 Bit → 3,4 × 10^38 Adressen\n• Kein NAT nötig\n• Kein Broadcast (Multicast stattdessen)\n• Header: 40 Byte, fix (schnelleres Routing)\n\nMigration:\n• Dual-Stack: IPv4 + IPv6 gleichzeitig\n• Tunneling: IPv6 in IPv4 verpacken\n• Translation: NAT64/DNS64',
          },
        },
      ],
    },
    {
      id: '1.8.2',
      title: 'IPv6-Format & Prefix',
      steps: [
        {
          title: 'So sieht IPv6 aus',
          description:
            'Eine IPv6-Adresse hat 128 Bit, geschrieben als 8 Gruppen à 4 Hex-Zeichen. Führende Nullen darf man weglassen, aufeinanderfolgende Null-Gruppen durch :: ersetzen (aber nur einmal pro Adresse!). Der Prefix /64 teilt Netzwerk- und Host-Teil.',
          analogy: 'Wie eine IBAN: Lang und komplex, aber mit klaren Regeln zum Kürzen.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: '2001:db8:0:1::10/64\n(gekürzt)', position: { x: 80, y: 150 } },
              { id: 'pc2', type: 'laptop', label: '2001:db8:0:1::20/64', position: { x: 80, y: 350 } },
              { id: 'server', type: 'server', label: '2001:db8:0:1::2/64\nDNSv6', position: { x: 80, y: 500 } },
              { id: 'sw', type: 'switch', label: 'Switch\nVLAN 10', position: { x: 340, y: 330 } },
              { id: 'router', type: 'router', label: 'Router\n2001:db8:0:1::1/64', position: { x: 580, y: 220 } },
              { id: 'r2', type: 'router', label: 'WAN Router\n2001:db8:0:ffff::1/64', position: { x: 580, y: 440 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet' },
              { id: 'c2', from: 'pc2', to: 'sw', type: 'ethernet' },
              { id: 'c3', from: 'server', to: 'sw', type: 'ethernet' },
              { id: 'c4', from: 'sw', to: 'router', type: 'ethernet' },
              { id: 'c5', from: 'router', to: 'r2', type: 'fiber-single', label: '/126 P2P' },
            ],
            packets: [
              {
                id: 'icmpv6',
                label: 'ICMPv6',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw', hint: 'PC1 sendet einen ICMPv6 Echo Request — das IPv6-Pendant zum klassischen Ping. Quelle: 2001:db8:0:1::10' },
                  { fromDevice: 'sw', toDevice: 'router', hint: 'Switch reicht weiter. IPv6-Adressen sind länger, aber das Layer-2-Forwarding ändert sich nicht — es zählt nur die MAC.' },
                  { fromDevice: 'router', toDevice: 'r2', hint: 'Router prüft das /64-Prefix und routet via Point-to-Point /126 Link zum WAN-Router. /126 reicht: 4 Adressen, davon 2 nutzbar.' },
                ],
              },
            ],
            highlightDevices: ['pc1', 'pc2', 'router'],
          },
          modal: {
            title: 'IPv6 Kürzen — Regeln',
            content: 'Voll: 2001:0db8:0000:0001:0000:0000:0000:0001\n\nRegel 1 — Führende Nullen weglassen:\n2001:db8:0:1:0:0:0:1\n\nRegel 2 — Längste Null-Kette durch :: ersetzen:\n2001:db8:0:1::1\n\n⚠ :: darf nur EINMAL pro Adresse vorkommen!\n\nPrefix-Längen:\n• /64 — Standard Subnetz\n• /48 — Site-Zuweisung\n• /32 — ISP-Zuweisung\n• /128 — Einzelne Adresse (Loopback)\n• /126 — Point-to-Point Link (4 Adressen)',
          },
        },
      ],
    },
  ],
}

export default lesson
