import type { Lesson } from '../../types'

const lesson: Lesson = {
  id: '1.6',
  number: '1.6',
  title: 'IPv4-Adressierung & Subnetting',
  subtitle: 'Configure and verify IPv4 addressing and subnetting',
  subtopics: [
    {
      id: '1.6.1',
      title: 'Was ist eine IP-Adresse?',
      steps: [
        {
          title: 'IP-Adresse: Deine Hausnummer im Netzwerk',
          description:
            'Jedes Gerät im Netzwerk braucht eine eindeutige Adresse, damit Pakete den richtigen Empfänger finden. Eine IPv4-Adresse besteht aus 4 Oktetten (je 0–255), getrennt durch Punkte — insgesamt 32 Bit. Zusammen mit der Subnetzmaske und dem Default-Gateway bildet sie die IP-Konfiguration.',
          analogy: 'IP = Hausnummer + Straße + Stadt. Subnetzmaske = Stadtgrenze. Default-Gateway = Autobahn-Auffahrt.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC\n192.168.1.10/24\nGW: .1', position: { x: 80, y: 150 } },
              { id: 'pc2', type: 'laptop', label: 'Laptop\n192.168.1.11/24\nGW: .1', position: { x: 80, y: 350 } },
              { id: 'printer', type: 'printer', label: 'Drucker\n192.168.1.50/24', position: { x: 80, y: 500 } },
              { id: 'sw', type: 'switch', label: 'Switch\nVLAN 1', position: { x: 330, y: 320 } },
              { id: 'router', type: 'router', label: 'Router (GW)\n192.168.1.1/24', position: { x: 560, y: 200 } },
              { id: 'cloud', type: 'cloud', label: 'Internet', position: { x: 740, y: 200 } },
              { id: 'server', type: 'server', label: 'DNS Server\n192.168.1.2/24', position: { x: 560, y: 430 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet' },
              { id: 'c2', from: 'pc2', to: 'sw', type: 'ethernet' },
              { id: 'c3', from: 'printer', to: 'sw', type: 'ethernet' },
              { id: 'c4', from: 'sw', to: 'router', type: 'ethernet' },
              { id: 'c5', from: 'sw', to: 'server', type: 'ethernet' },
              { id: 'c6', from: 'router', to: 'cloud', type: 'serial' },
            ],
            packets: [
              {
                id: 'ping',
                label: 'ICMP Ping',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw', hint: 'PC schickt einen Ping an eine Internet-IP. Da die Ziel-IP nicht im eigenen Subnetz liegt, geht das Paket zum Default-Gateway.' },
                  { fromDevice: 'sw', toDevice: 'router', hint: 'Switch reicht den Frame an Router .1 — den Default-Gateway. Ohne IP-Konfiguration (oder ohne Gateway) käme das Paket nie weg.' },
                  { fromDevice: 'router', toDevice: 'cloud', hint: 'Router kennt den Weg ins Internet und schickt das Paket weiter. IP-Adresse + Subnetzmaske + Gateway zusammen machen das möglich.' },
                ],
              },
              {
                id: 'pong',
                label: 'Echo Reply',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'cloud', toDevice: 'router', hint: 'Antwort kommt aus dem Internet zurück. Router hat sich gemerkt, dass die Anfrage von .10 kam.' },
                  { fromDevice: 'router', toDevice: 'sw', hint: 'Router gibt das Paket dem Switch zurück — der weiß aus seiner MAC-Tabelle, an welchem Port .10 hängt.' },
                  { fromDevice: 'sw', toDevice: 'pc1', hint: 'Echo Reply am PC angekommen — "Reply from x.x.x.x: time=12ms". Ping erfolgreich.' },
                ],
              },
            ],
            highlightDevices: ['pc1', 'pc2', 'router'],
          },
          modal: {
            title: 'IP-Konfiguration (3 Werte)',
            content: 'Jedes Gerät braucht mindestens:\n\n1. IP-Adresse: 192.168.1.10\n   → Eindeutige Identifikation\n\n2. Subnetzmaske: 255.255.255.0 (/24)\n   → Definiert Netzwerkgröße\n\n3. Default-Gateway: 192.168.1.1\n   → Router für alles außerhalb des Subnetzes\n\nOptional: DNS-Server (z.B. 8.8.8.8)\n\nWindows: ipconfig\nLinux/Mac: ip addr / ifconfig',
          },
        },
        {
          title: 'Netzwerk-Teil & Host-Teil',
          description:
            'Jede IP-Adresse besteht aus zwei Teilen: Der Netzwerk-Teil identifiziert das Subnetz (wie die Straße), der Host-Teil identifiziert das einzelne Gerät (wie die Hausnummer). Die Subnetzmaske bestimmt die Grenze — bei /24 sind die ersten 24 Bit das Netzwerk.',
          analogy: 'IP 192.168.1.10/24: "192.168.1" = Straßenname, ".10" = Hausnummer. Alle mit gleichem Straßennamen sind Nachbarn.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: '192.168.1.10/24\nHost: .10', position: { x: 80, y: 150 } },
              { id: 'pc2', type: 'pc', label: '192.168.1.20/24\nHost: .20', position: { x: 80, y: 320 } },
              { id: 'pc3', type: 'laptop', label: '192.168.1.30/24\nHost: .30', position: { x: 80, y: 480 } },
              { id: 'sw', type: 'switch', label: 'Subnetz\n192.168.1.0/24\n254 Hosts', position: { x: 380, y: 310 } },
              { id: 'router', type: 'router', label: 'Gateway\n192.168.1.1', position: { x: 620, y: 200 } },
              { id: 'sw2', type: 'switch', label: 'Anderes Subnetz\n10.0.0.0/24', position: { x: 620, y: 430 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet' },
              { id: 'c2', from: 'pc2', to: 'sw', type: 'ethernet' },
              { id: 'c3', from: 'pc3', to: 'sw', type: 'ethernet' },
              { id: 'c4', from: 'sw', to: 'router', type: 'ethernet' },
              { id: 'c5', from: 'router', to: 'sw2', type: 'ethernet' },
            ],
            highlightDevices: ['sw'],
          },
          modal: {
            title: 'Subnetzmaske in Binär',
            content: '/24 = 255.255.255.0\nBinär: 11111111.11111111.11111111.00000000\n         ←— Netzwerk (24 Bit) —→ ←Host→\n\n/16 = 255.255.0.0\nBinär: 11111111.11111111.00000000.00000000\n\n/8 = 255.0.0.0\nBinär: 11111111.00000000.00000000.00000000\n\nRegel: 1-Bits = Netzwerk, 0-Bits = Host\nAnzahl Hosts = 2^(Host-Bits) - 2',
          },
        },
      ],
    },
    {
      id: '1.6.2',
      title: 'Subnetting — Netzwerke aufteilen',
      steps: [
        {
          title: 'Warum Subnetting?',
          description:
            'Stell dir vor, 1000 Mitarbeiter in einem Netzwerk — jeder Broadcast erreicht alle 1000. Das Netzwerk wird langsam. Mit Subnetting teilst du das große Netzwerk in kleinere, effizientere Teile. Jede Abteilung bekommt ihr eigenes Subnetz mit eigener Broadcast-Domäne.',
          analogy: 'Wie ein Hochhaus mit Stockwerken: Statt alle in eine Halle zu packen, bekommt jede Abteilung ihr eigenes Stockwerk.',
          scene: {
            devices: [
              { id: 'router', type: 'router', label: 'Core Router\nInter-VLAN Routing', position: { x: 400, y: 60 } },
              { id: 'sw1', type: 'switch', label: 'IT\n192.168.1.0/26\n62 Hosts', position: { x: 130, y: 230 } },
              { id: 'sw2', type: 'switch', label: 'Marketing\n192.168.1.64/26\n62 Hosts', position: { x: 400, y: 230 } },
              { id: 'sw3', type: 'switch', label: 'Vertrieb\n192.168.1.128/26\n62 Hosts', position: { x: 670, y: 230 } },
              { id: 'pc1', type: 'pc', label: '.10', position: { x: 80, y: 400 } },
              { id: 'pc2', type: 'pc', label: '.11', position: { x: 200, y: 400 } },
              { id: 'pc3', type: 'laptop', label: '.74', position: { x: 350, y: 400 } },
              { id: 'pc4', type: 'laptop', label: '.75', position: { x: 460, y: 400 } },
              { id: 'pc5', type: 'pc', label: '.138', position: { x: 620, y: 400 } },
              { id: 'pc6', type: 'pc', label: '.139', position: { x: 740, y: 400 } },
            ],
            cables: [
              { id: 'c1', from: 'router', to: 'sw1', type: 'ethernet', label: 'VLAN 10' },
              { id: 'c2', from: 'router', to: 'sw2', type: 'ethernet', label: 'VLAN 20' },
              { id: 'c3', from: 'router', to: 'sw3', type: 'ethernet', label: 'VLAN 30' },
              { id: 'c4', from: 'sw1', to: 'pc1', type: 'ethernet' },
              { id: 'c5', from: 'sw1', to: 'pc2', type: 'ethernet' },
              { id: 'c6', from: 'sw2', to: 'pc3', type: 'ethernet' },
              { id: 'c7', from: 'sw2', to: 'pc4', type: 'ethernet' },
              { id: 'c8', from: 'sw3', to: 'pc5', type: 'ethernet' },
              { id: 'c9', from: 'sw3', to: 'pc6', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'cross',
                label: 'Inter-VLAN',
                color: '#4a7fb8',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw1', hint: 'IT-PC (192.168.1.10) will an einen Vertriebs-PC (192.168.1.138). Andere Subnetze → Paket muss zum Gateway.' },
                  { fromDevice: 'sw1', toDevice: 'router', hint: 'Access-Switch reicht den Frame an den Core-Router weiter — der ist das Gateway für VLAN 10 (IT).' },
                  { fromDevice: 'router', toDevice: 'sw3', hint: 'Router prüft die Routing-Tabelle: "/26 Vertrieb" → Interface auf VLAN 30. Inter-VLAN-Routing — kein VLAN sieht den anderen ohne den Router.' },
                  { fromDevice: 'sw3', toDevice: 'pc5', hint: 'Frame im Vertriebs-VLAN angekommen. Switch liefert an den richtigen Port. Subnetting + VLANs zusammen: saubere Trennung mit kontrolliertem Übergang.' },
                ],
              },
            ],
            highlightDevices: ['router'],
          },
          modal: {
            title: 'Subnetting Cheat-Sheet',
            content: '/30 = 4 Adressen, 2 Hosts → Point-to-Point Links\n/28 = 16 Adressen, 14 Hosts → Kleine Netze\n/26 = 64 Adressen, 62 Hosts → Abteilungen\n/24 = 256 Adressen, 254 Hosts → Standard\n/22 = 1024 Adressen, 1022 Hosts → Große Netze\n/16 = 65536 Adressen → Campus\n\nMerke: Hosts = 2^(32-prefix) - 2\n(Netzwerk-Adresse + Broadcast abziehen)\n\n192.168.1.0/26 Subnetze:\n.0-.63 | .64-.127 | .128-.191 | .192-.255',
          },
        },
      ],
    },
  ],
}

export default lesson
