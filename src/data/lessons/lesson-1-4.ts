import type { Lesson } from '../../types'

const lesson: Lesson = {
  id: '1.4',
  number: '1.4',
  title: 'Kabel- & Interface-Probleme',
  subtitle: 'Identify interface and cable issues',
  subtopics: [
    {
      id: '1.4.1',
      title: 'Kollisionen',
      steps: [
        {
          title: 'Kollision: Zwei reden gleichzeitig',
          description:
            'Eine Kollision passiert, wenn zwei Geräte gleichzeitig Daten auf das gleiche Kabel schicken. Die Signale überlappen sich und werden unbrauchbar. Kollisionen treten nur bei Half-Duplex (Hubs) auf — bei modernen Switches mit Full-Duplex gibt es keine Kollisionen mehr.',
          analogy: 'Wie zwei Leute, die gleichzeitig in ein Walkie-Talkie sprechen — keiner versteht was.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC 1\nsendet!', position: { x: 80, y: 120 } },
              { id: 'pc2', type: 'pc', label: 'PC 2\nsendet!', position: { x: 80, y: 300 } },
              { id: 'pc3', type: 'laptop', label: 'PC 3\nwartet...', position: { x: 80, y: 450 } },
              { id: 'hub', type: 'switch', label: 'Hub (Layer 1)\nShared Medium', position: { x: 380, y: 290 } },
              { id: 'server', type: 'server', label: 'Server\nempfängt Müll', position: { x: 650, y: 190 } },
              { id: 'printer', type: 'printer', label: 'Drucker', position: { x: 650, y: 400 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'hub', type: 'ethernet' },
              { id: 'c2', from: 'pc2', to: 'hub', type: 'ethernet' },
              { id: 'c3', from: 'pc3', to: 'hub', type: 'ethernet' },
              { id: 'c4', from: 'hub', to: 'server', type: 'ethernet' },
              { id: 'c5', from: 'hub', to: 'printer', type: 'ethernet' },
            ],
            packets: [
              { id: 'p1', label: 'COLLISION!', color: '#f87171', hops: [{ fromDevice: 'pc1', toDevice: 'hub', hint: 'PC 1 sendet auf das Shared Medium. Gleichzeitig sendet PC 2 — beide Signale überlagern sich am Hub. Resultat: Frames sind Müll, beide PCs müssen warten und neu senden.' }] },
              { id: 'p2', label: 'COLLISION!', color: '#f87171', hops: [{ fromDevice: 'pc2', toDevice: 'hub', hint: 'PC 2 schickt zur gleichen Zeit. Bei einem Hub gibt es keine Trennung — alle hören mit, alle stören sich gegenseitig.' }] },
            ],
            highlightDevices: ['hub'],
          },
          modal: {
            title: 'CSMA/CD im Detail',
            content: 'Carrier Sense Multiple Access / Collision Detection:\n\n1. CS: Ist die Leitung frei? → Ja: Sende!\n2. MA: Mehrere Geräte dürfen senden\n3. CD: Kollision erkannt?\n   → Jam-Signal senden (alle stoppen)\n   → Zufällig warten (Backoff-Timer)\n   → Erneut versuchen (max. 16x)\n\nshow interface Fa0/1:\n• collisions: 0 (gut)\n• late collisions: 0 (schlecht wenn > 0, deutet auf Kabelproblem)',
          },
        },
        {
          title: 'Kollisionsdomäne vs. Broadcast-Domäne',
          description:
            'Jeder Port an einem Hub teilt sich eine Kollisionsdomäne — alle kollidieren miteinander. Ein Switch trennt die Kollisionsdomänen: Jeder Port ist eine eigene. Broadcasts hingegen gehen an alle Ports im gleichen VLAN — das ist die Broadcast-Domäne. Nur ein Router oder L3-Switch trennt Broadcast-Domänen.',
          analogy: 'Hub = ein großer Raum (alle reden durcheinander). Switch = separate Büros. Router = separate Gebäude.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC 1', position: { x: 80, y: 120 } },
              { id: 'pc2', type: 'pc', label: 'PC 2', position: { x: 80, y: 280 } },
              { id: 'pc3', type: 'laptop', label: 'PC 3', position: { x: 80, y: 430 } },
              { id: 'sw', type: 'switch', label: 'Switch\n3 Kollisionsdomänen\n1 Broadcast-Domäne', position: { x: 350, y: 270 } },
              { id: 'router', type: 'router', label: 'Router\ntrennt Broadcasts', position: { x: 580, y: 270 } },
              { id: 'pc4', type: 'pc', label: 'PC 4\nandere Broadcast-\nDomäne', position: { x: 760, y: 270 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet', label: 'Koll.Dom. 1' },
              { id: 'c2', from: 'pc2', to: 'sw', type: 'ethernet', label: 'Koll.Dom. 2' },
              { id: 'c3', from: 'pc3', to: 'sw', type: 'ethernet', label: 'Koll.Dom. 3' },
              { id: 'c4', from: 'sw', to: 'router', type: 'ethernet' },
              { id: 'c5', from: 'router', to: 'pc4', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'bcast',
                label: 'Broadcast',
                color: '#fbbf24',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw', hint: 'PC 1 schickt einen Broadcast (Ziel: ff:ff:ff:ff:ff:ff). Geht z.B. bei ARP-Anfragen los: "Wer hat IP x.x.x.x?"' },
                  { fromDevice: 'sw', toDevice: 'pc2', hint: 'Der Switch flutet den Broadcast an alle Ports im VLAN — auch PC 2 bekommt ihn. Aber: am Router stoppt er, dort beginnt die nächste Broadcast-Domäne.' },
                ],
              },
            ],
            highlightDevices: ['sw', 'router'],
          },
          modal: {
            title: 'Zusammenfassung',
            content: 'Hub: 1 Kollisionsdomäne, 1 Broadcast-Domäne\n→ Alle Ports teilen alles\n\nSwitch: Jeder Port = eigene Kollisionsdomäne\n→ Aber alle Ports im selben VLAN = 1 Broadcast-Domäne\n\nRouter/L3-Switch: Trennt auch Broadcast-Domänen\n→ Broadcast bleibt im eigenen Subnetz\n\nBeispiel: Switch mit 24 Ports = 24 Kollisionsdomänen, 1 Broadcast-Domäne (ohne VLANs).',
          },
        },
      ],
    },
    {
      id: '1.4.2',
      title: 'Errors (CRC, Runts, Giants)',
      steps: [
        {
          title: 'Frame-Fehler erkennen und verstehen',
          description:
            'Manchmal kommen Frames beschädigt an. Die häufigsten Fehler: CRC-Errors (Prüfsumme falsch → Daten beschädigt), Runts (< 64 Byte → zu kurz, meist durch Kollision), Giants (> 1518 Byte → zu lang, falsche MTU). Ursachen: defekte Kabel, schlechte Stecker, EMI-Störungen.',
          analogy: 'CRC = Brief mit unleserlicher Schrift. Runts = halber Brief. Giants = Brief der nicht in den Briefkasten passt.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'Sender\n192.168.1.10', position: { x: 80, y: 160 } },
              { id: 'pc2', type: 'laptop', label: 'Sender 2', position: { x: 80, y: 380 } },
              { id: 'sw1', type: 'switch', label: 'Access Switch\nshow interfaces', position: { x: 350, y: 270 } },
              { id: 'sw2', type: 'switch', label: 'Distribution\nSwitch', position: { x: 580, y: 160 } },
              { id: 'server', type: 'server', label: 'Server\nEmpfänger', position: { x: 580, y: 380 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw1', type: 'ethernet', label: 'defektes Kabel' },
              { id: 'c2', from: 'pc2', to: 'sw1', type: 'ethernet' },
              { id: 'c3', from: 'sw1', to: 'sw2', type: 'fiber-multi', label: 'Uplink OK' },
              { id: 'c4', from: 'sw1', to: 'server', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'crc',
                label: 'CRC Error!',
                color: '#f87171',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw1', hint: 'Frame kommt am Switch an, aber die Prüfsumme passt nicht — beschädigtes Kabel verzerrt das Signal. Switch verwirft den Frame und zählt einen CRC-Error hoch.' },
                ],
              },
            ],
            highlightCables: ['c1'],
          },
          modal: {
            title: 'show interfaces Fa0/1 — Error-Counter',
            content: 'Switch# show interfaces Fa0/1\n\n5 input errors\n3 CRC errors → Daten beschädigt (Kabel prüfen!)\n1 runts → Frame zu kurz (< 64 Byte)\n1 giants → Frame zu lang (> 1518 Byte)\n0 throttles\n0 output errors\n\nLösung:\n• Kabel tauschen (häufigste Ursache)\n• Stecker prüfen (richtig eingerastet?)\n• EMI-Quellen entfernen (Neonröhren, Motoren)\n• Kabellänge prüfen (max. 100m)',
          },
        },
        {
          title: 'Interface-Status verstehen',
          description:
            'Der Befehl "show interfaces" zeigt den Zustand jeder Schnittstelle. Die wichtigsten Status-Kombinationen: "up/up" (alles OK), "down/down" (kein Kabel oder Port aus), "up/down" (Layer 1 OK, Layer 2 Problem), "administratively down" (Port wurde absichtlich deaktiviert).',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC 1\nup/up ✓', position: { x: 80, y: 100 } },
              { id: 'pc2', type: 'pc', label: 'PC 2\nkein Kabel!', position: { x: 80, y: 270 } },
              { id: 'pc3', type: 'laptop', label: 'PC 3\nPort disabled', position: { x: 80, y: 430 } },
              { id: 'sw', type: 'switch', label: 'Switch\nshow ip interface brief', position: { x: 420, y: 270 } },
              { id: 'router', type: 'router', label: 'Router\nGi0/0 up/up', position: { x: 700, y: 270 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet', label: 'up/up' },
              { id: 'c3', from: 'sw', to: 'router', type: 'ethernet', label: 'up/up' },
            ],
            highlightDevices: ['sw'],
            highlightCables: ['c1'],
          },
          modal: {
            title: 'show ip interface brief',
            content: 'Interface     IP-Address    Status       Protocol\nFa0/1         unassigned    up           up        ← OK\nFa0/2         unassigned    down         down      ← Kein Kabel\nFa0/3         unassigned    admin down   down      ← shutdown\nGi0/1         10.0.0.1      up           up        ← OK\n\nTroubleshooting:\n• down/down → Kabel prüfen, Port prüfen\n• up/down → Encapsulation/Protokoll-Problem\n• admin down → "no shutdown" eingeben\n• err-disabled → Port-Security Violation',
          },
        },
      ],
    },
    {
      id: '1.4.3',
      title: 'Duplex/Speed Mismatch',
      steps: [
        {
          title: 'Duplex-Mismatch: Chaos vorprogrammiert',
          description:
            'Duplex-Mismatch ist eines der häufigsten Netzwerkprobleme: Ein Gerät ist auf Full-Duplex konfiguriert, das andere auf Half-Duplex. Das Ergebnis: Late Collisions, FCS-Errors, extrem langsame Verbindung und Paketverlust. Oft passiert es, wenn Auto-Negotiation auf einer Seite deaktiviert ist.',
          analogy: 'Wie ein Telefonat, bei dem einer denkt, es ist ein Walkie-Talkie — beide unterbrechen sich ständig.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC\nauto → Half-Duplex\nauto → 100 Mbit', position: { x: 80, y: 270 } },
              { id: 'sw', type: 'switch', label: 'Switch Port Fa0/1\nfest: Full-Duplex\nfest: 1 Gbit', position: { x: 380, y: 270 } },
              { id: 'sw2', type: 'switch', label: 'Core Switch\nauto/auto ✓', position: { x: 650, y: 170 } },
              { id: 'server', type: 'server', label: 'Server\nauto/auto ✓', position: { x: 650, y: 380 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet', label: 'MISMATCH!' },
              { id: 'c2', from: 'sw', to: 'sw2', type: 'fiber-multi', label: 'auto OK' },
              { id: 'c3', from: 'sw', to: 'server', type: 'ethernet', label: 'auto OK' },
            ],
            packets: [
              {
                id: 'slow',
                label: 'Late Coll!',
                color: '#f87171',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw', hint: 'PC sendet im Half-Duplex-Modus, der Switch erwartet aber Full-Duplex. Beide reden gleichzeitig → Late Collision. Verbindung läuft, aber miserabel langsam.' },
                ],
              },
            ],
            highlightCables: ['c1'],
          },
          modal: {
            title: 'Auto-Negotiation Regeln',
            content: 'Beide Seiten auf "auto" → Funktioniert immer ✓\nBeide fest gleich konfiguriert → Funktioniert ✓\nEine Seite fest, andere "auto" → PROBLEM!\n\nWas passiert bei Mismatch:\n• Fest: Full-Duplex 1G\n• Auto: Erkennt Speed (1G), aber Duplex fällt auf Half zurück\n→ Late Collisions, CRC Errors, Paketverlust\n\nLösung: Beide Seiten auf "auto" oder beide gleich fest konfigurieren.\n\nshow interfaces Fa0/1:\n  Full-duplex, 1000Mb/s ← Ist das korrekt?',
          },
        },
        {
          title: 'Troubleshooting: show interfaces',
          description:
            'Der wichtigste Befehl zur Diagnose von Interface-Problemen ist "show interfaces". Er zeigt Speed, Duplex, Error-Counter, Input/Output Rates und den Port-Status. Zusammen mit "show ip interface brief" hast du den vollen Überblick.',
          analogy: 'show interfaces = der Arztbericht für einen Netzwerk-Port. Alle Symptome auf einen Blick.',
          scene: {
            devices: [
              { id: 'admin', type: 'laptop', label: 'Admin-PC\nSSH zum Switch', position: { x: 80, y: 270 } },
              { id: 'sw', type: 'switch', label: 'Cisco Switch\nshow interfaces\nshow ip int brief', position: { x: 350, y: 270 } },
              { id: 'pc1', type: 'pc', label: 'Fa0/1\nup/up ✓', position: { x: 620, y: 100 } },
              { id: 'pc2', type: 'pc', label: 'Fa0/2\ndown/down ✗', position: { x: 620, y: 270 } },
              { id: 'pc3', type: 'laptop', label: 'Fa0/3\nerr-disabled ✗', position: { x: 620, y: 430 } },
            ],
            cables: [
              { id: 'c1', from: 'admin', to: 'sw', type: 'ethernet', label: 'Console/SSH' },
              { id: 'c2', from: 'sw', to: 'pc1', type: 'ethernet' },
              { id: 'c3', from: 'sw', to: 'pc3', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'ssh',
                label: 'SSH',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'admin', toDevice: 'sw', hint: 'Admin verbindet sich per SSH zum Switch und tippt "show interfaces" — bekommt Speed, Duplex und alle Error-Counter aller Ports angezeigt.' },
                ],
              },
            ],
            highlightDevices: ['sw'],
          },
          modal: {
            title: 'Wichtige show-Befehle',
            content: 'show interfaces Fa0/1:\n→ Duplex, Speed, Errors, Input/Output Rate\n\nshow ip interface brief:\n→ Schnelle Übersicht aller Ports\n\nshow interfaces status:\n→ VLAN, Speed, Duplex aller Ports\n\nshow interfaces counters errors:\n→ Nur die Fehler-Zähler\n\nshow logging:\n→ Letzte Log-Meldungen (z.B. link up/down)\n\nclear counters:\n→ Zähler zurücksetzen für frische Messung',
          },
        },
      ],
    },
  ],
}

export default lesson
