import type { Lesson } from '../../types'

const lesson: Lesson = {
  id: '1.13',
  number: '1.13',
  title: 'Switching-Konzepte',
  subtitle: 'Describe switching concepts',
  subtopics: [
    {
      id: '1.13.1',
      title: 'MAC Learning & Aging',
      steps: [
        {
          title: 'MAC Learning: Der Switch lernt dazu',
          description:
            'Wenn ein Frame am Switch ankommt, liest er die Quell-MAC und merkt sich: "Diese MAC-Adresse ist an diesem Port." So baut er dynamisch seine MAC-Adress-Tabelle (CAM-Tabelle) auf. Am Anfang ist die Tabelle leer — der Switch muss alles erst lernen.',
          analogy: 'Wie ein neuer Postbote: Am Anfang kennt er keinen. Aber jedes Mal, wenn jemand ihm einen Brief gibt, merkt er sich "Ah, Herr Müller wohnt an Tür 3".',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC A\nMAC: AA:AA:AA:11:11:11', position: { x: 80, y: 120 } },
              { id: 'pc2', type: 'pc', label: 'PC B\nMAC: BB:BB:BB:22:22:22', position: { x: 80, y: 310 } },
              { id: 'laptop', type: 'laptop', label: 'Laptop C\nMAC: CC:CC:CC:33:33:33', position: { x: 80, y: 480 } },
              { id: 'sw', type: 'switch', label: 'Switch\nlernt Quell-MAC\n→ CAM-Tabelle', position: { x: 400, y: 300 } },
              { id: 'server', type: 'server', label: 'Server\nMAC: DD:DD:DD:44:44:44', position: { x: 680, y: 190 } },
              { id: 'printer', type: 'printer', label: 'Drucker\nMAC: EE:EE:EE:55:55:55', position: { x: 680, y: 410 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet', label: 'Fa0/1' },
              { id: 'c2', from: 'pc2', to: 'sw', type: 'ethernet', label: 'Fa0/2' },
              { id: 'c3', from: 'laptop', to: 'sw', type: 'ethernet', label: 'Fa0/3' },
              { id: 'c4', from: 'sw', to: 'server', type: 'ethernet', label: 'Fa0/4' },
              { id: 'c5', from: 'sw', to: 'printer', type: 'ethernet', label: 'Fa0/5' },
            ],
            packets: [
              {
                id: 'learn',
                label: 'Frame',
                color: '#60a5fa',
                hops: [{ fromDevice: 'pc1', toDevice: 'sw', hint: 'PC A schickt seinen ersten Frame. Quell-MAC: AA:AA:AA:11:11:11. Switch liest die Quell-MAC und merkt sich: "Diese MAC hängt an Port Fa0/1." So baut sich die CAM-Tabelle Schritt für Schritt auf.' }],
              },
            ],
            highlightDevices: ['sw'],
          },
          modal: {
            title: 'MAC-Adress-Tabelle (CAM)',
            content: 'Switch lernt:\n1. Frame kommt an Fa0/1 → Quell-MAC: AA:AA:AA:11:11:11\n2. Eintrag: Fa0/1 = AA:AA:AA:11:11:11\n3. Nächster Frame an Fa0/2 → Quell-MAC: BB:BB:BB:22:22:22\n4. Eintrag: Fa0/2 = BB:BB:BB:22:22:22\n\nshow mac address-table:\nVLAN  MAC Address        Type     Port\n1     AA:AA:AA:11:11:11  DYNAMIC  Fa0/1\n1     BB:BB:BB:22:22:22  DYNAMIC  Fa0/2\n1     CC:CC:CC:33:33:33  DYNAMIC  Fa0/3\n\nAging Timer: 300 Sekunden (Standard)',
          },
        },
        {
          title: 'Aging: Vergessen nach Inaktivität',
          description:
            'MAC-Einträge haben eine Lebenszeit (Standard: 300 Sekunden). Wird ein Gerät lange nicht aktiv, wird sein Eintrag gelöscht. Das hält die Tabelle aktuell und verhindert, dass sie mit veralteten Einträgen voll wird. Man kann den Timer konfigurieren oder Einträge manuell löschen.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC A (aktiv)\nTimer: reset', position: { x: 80, y: 170 } },
              { id: 'pc2', type: 'pc', label: 'PC B (inaktiv)\nTimer: 280s...', position: { x: 80, y: 380 } },
              { id: 'sw', type: 'switch', label: 'Switch\nmac address-table\naging-time 300', position: { x: 400, y: 270 } },
              { id: 'sw2', type: 'switch', label: 'Uplink Switch\nlernt auch MACs', position: { x: 670, y: 270 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet', label: 'Fa0/1' },
              { id: 'c2', from: 'pc2', to: 'sw', type: 'ethernet', label: 'Fa0/2' },
              { id: 'c3', from: 'sw', to: 'sw2', type: 'ethernet', label: 'Gi0/1 Trunk' },
            ],
            highlightDevices: ['pc2'],
          },
          modal: {
            title: 'Aging & statische MACs',
            content: 'Dynamic (gelernt): Aging 300s Standard\n→ mac address-table aging-time 600\n\nStatic (manuell): Kein Aging, permanent\n→ mac address-table static AA:11:22:33:44:55 vlan 1 interface Fa0/1\n\nSticky (Port Security): Gelernt + gespeichert\n→ switchport port-security mac-address sticky\n\nclear mac address-table dynamic\n→ Alle dynamischen Einträge löschen\n\nshow mac address-table count\n→ Wie voll ist die Tabelle?',
          },
        },
      ],
    },
    {
      id: '1.13.2',
      title: 'Frame Switching',
      steps: [
        {
          title: 'Frame Switching: Gezielt weiterleiten',
          description:
            'Wenn der Switch die Ziel-MAC in seiner CAM-Tabelle findet, schickt er den Frame NUR an den richtigen Port ("known unicast forwarding"). Kein unnötiger Traffic auf anderen Ports — im Gegensatz zu einem Hub, der alles an alle schickt.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC A\nSrc: AA:11\nDst: DD:44', position: { x: 80, y: 150 } },
              { id: 'pc2', type: 'pc', label: 'PC B\nbekommt nichts!', position: { x: 80, y: 400 } },
              { id: 'sw', type: 'switch', label: 'Switch\nCAM: DD:44 → Fa0/4\n→ Forward!', position: { x: 380, y: 270 } },
              { id: 'server', type: 'server', label: 'Server\nMAC: DD:44\nempfängt!', position: { x: 680, y: 270 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet', label: 'Fa0/1' },
              { id: 'c2', from: 'pc2', to: 'sw', type: 'ethernet', label: 'Fa0/2' },
              { id: 'c3', from: 'sw', to: 'server', type: 'ethernet', label: 'Fa0/4' },
            ],
            packets: [
              {
                id: 'fwd',
                label: 'Unicast',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw', hint: 'PC A schickt einen Frame an den Server (Dst: DD:44). Frame kommt am Switch an Fa0/1 an.' },
                  { fromDevice: 'sw', toDevice: 'server', hint: 'Switch schaut in die CAM-Tabelle: DD:44 hängt an Fa0/4 → Frame geht NUR dort raus. PC B sieht nichts vom Traffic — das spart Bandbreite.' },
                ],
              },
            ],
            highlightCables: ['c1', 'c3'],
          },
          modal: {
            title: 'Switching-Methoden',
            content: 'Store-and-Forward:\n→ Ganzen Frame empfangen → CRC prüfen → Weiterleiten\n→ Fehlerhafte Frames werden verworfen\n→ Standard bei Cisco (höhere Latenz, aber sicher)\n\nCut-Through:\n→ Nur Dst-MAC lesen (erste 6 Byte) → sofort weiterleiten\n→ Niedrigste Latenz, aber keine Fehlerprüfung\n\nFragment-Free:\n→ Erste 64 Byte lesen → dann weiterleiten\n→ Kompromiss: Erkennt Runts, aber schneller als Store-and-Forward',
          },
        },
      ],
    },
    {
      id: '1.13.3',
      title: 'Frame Flooding',
      steps: [
        {
          title: 'Flooding: Wenn der Switch es nicht weiß',
          description:
            'Kennt der Switch die Ziel-MAC nicht? Dann "flutet" er — der Frame geht an ALLE Ports im gleichen VLAN (außer den Quell-Port). Das Ziel antwortet, und der Switch lernt dessen MAC. Broadcasts (ff:ff:ff:ff:ff:ff) werden IMMER geflutet.',
          analogy: 'Wie im Büro rufen: "Ist hier jemand namens Müller?" Alle hören es, aber nur Müller antwortet.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC A sendet\nDst: unbekannt', position: { x: 80, y: 130 } },
              { id: 'sw', type: 'switch', label: 'Switch\nMAC nicht in CAM!\n→ FLOOD an alle', position: { x: 370, y: 270 } },
              { id: 'pc2', type: 'pc', label: 'PC B\n"nicht ich"', position: { x: 680, y: 90 } },
              { id: 'pc3', type: 'pc', label: 'PC C\n"das bin ich!"', position: { x: 680, y: 260 } },
              { id: 'pc4', type: 'laptop', label: 'Laptop D\n"nicht ich"', position: { x: 680, y: 420 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet', label: 'Fa0/1' },
              { id: 'c2', from: 'sw', to: 'pc2', type: 'ethernet', label: 'Fa0/2' },
              { id: 'c3', from: 'sw', to: 'pc3', type: 'ethernet', label: 'Fa0/3' },
              { id: 'c4', from: 'sw', to: 'pc4', type: 'ethernet', label: 'Fa0/4' },
            ],
            packets: [
              {
                id: 'fl1',
                label: 'Unknown',
                color: '#fbbf24',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw', hint: 'PC A schickt Frame an eine MAC, die der Switch noch nicht kennt. Was tun? Der Switch entscheidet sich für Flooding.' },
                  { fromDevice: 'sw', toDevice: 'pc3', hint: 'Switch flutet den Frame an alle Ports im VLAN außer Fa0/1. Nur PC C ist das Ziel und antwortet — Switch lernt jetzt PC C\'s MAC und flutet das nächste Mal nicht mehr.' },
                ],
              },
            ],
            highlightDevices: ['sw'],
            highlightCables: ['c2', 'c3', 'c4'],
          },
          modal: {
            title: 'Wann wird geflutet?',
            content: 'Unknown Unicast:\n→ Dst-MAC nicht in CAM-Tabelle\n→ Flood an alle Ports im VLAN (außer Quell-Port)\n→ Ziel antwortet → Switch lernt\n\nBroadcast (ff:ff:ff:ff:ff:ff):\n→ IMMER geflutet (ARP, DHCP Discover...)\n→ Alle Ports im VLAN\n\nMulticast:\n→ Geflutet, es sei denn IGMP Snooping aktiv\n→ Mit IGMP: Nur an registrierte Ports\n\nFilter:\n→ Wenn Src-Port = Dst-Port → Drop (nicht zurückschicken)',
          },
        },
      ],
    },
    {
      id: '1.13.4',
      title: 'MAC-Adress-Tabelle',
      steps: [
        {
          title: 'Die CAM-Tabelle: Das Gedächtnis des Switch',
          description:
            'Die CAM-Tabelle (Content Addressable Memory) ist das Herzstück jedes Switches. Sie mappt MAC-Adressen auf Ports und VLANs. Ohne sie müsste jeder Frame geflutet werden. Der Befehl "show mac address-table" zeigt alle Einträge.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC A\nAA:11 → Fa0/1', position: { x: 80, y: 100 } },
              { id: 'pc2', type: 'pc', label: 'PC B\nBB:22 → Fa0/2', position: { x: 80, y: 270 } },
              { id: 'pc3', type: 'laptop', label: 'Laptop C\nCC:33 → Fa0/3', position: { x: 80, y: 430 } },
              { id: 'sw1', type: 'switch', label: 'Access Switch\nshow mac address-table', position: { x: 380, y: 270 } },
              { id: 'sw2', type: 'switch', label: 'Distribution Switch\nlernt via Trunk', position: { x: 620, y: 160 } },
              { id: 'server', type: 'server', label: 'Server\nDD:44 → Gi0/1', position: { x: 620, y: 380 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw1', type: 'ethernet', label: 'Fa0/1' },
              { id: 'c2', from: 'pc2', to: 'sw1', type: 'ethernet', label: 'Fa0/2' },
              { id: 'c3', from: 'pc3', to: 'sw1', type: 'ethernet', label: 'Fa0/3' },
              { id: 'c4', from: 'sw1', to: 'sw2', type: 'fiber-multi', label: 'Gi0/1 Trunk' },
              { id: 'c5', from: 'sw1', to: 'server', type: 'ethernet', label: 'Gi0/2' },
            ],
            packets: [
              {
                id: 'known',
                label: 'Unicast',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw1', hint: 'PC A schickt einen Frame an den Server. Quelle: AA:11, Ziel: DD:44.' },
                  { fromDevice: 'sw1', toDevice: 'server', hint: 'Switch schaut in seine CAM-Tabelle: DD:44 hängt an Gi0/2. Frame wird zielgenau dorthin geforwardet — keine anderen Ports werden belästigt.' },
                ],
              },
            ],
            highlightDevices: ['sw1'],
          },
          modal: {
            title: 'show mac address-table',
            content: 'Switch# show mac address-table\n\nVLAN  MAC Address        Type     Port\n1     AA:AA:AA:11:11:11  DYNAMIC  Fa0/1\n1     BB:BB:BB:22:22:22  DYNAMIC  Fa0/2\n1     CC:CC:CC:33:33:33  DYNAMIC  Fa0/3\n1     DD:DD:DD:44:44:44  DYNAMIC  Gi0/2\n1     EE:EE:EE:55:55:55  DYNAMIC  Gi0/1  ← via Trunk!\n\nTotal: 5 entries\n\nshow mac address-table dynamic\n→ Nur dynamisch gelernte\n\nshow mac address-table address AA:11\n→ Bestimmte MAC suchen\n\nshow mac address-table interface Fa0/1\n→ Alle MACs an einem Port',
          },
        },
      ],
    },
  ],
}

export default lesson
