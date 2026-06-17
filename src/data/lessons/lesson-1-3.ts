import type { Lesson } from '../../types'

const lesson: Lesson = {
  id: '1.3',
  number: '1.3',
  title: 'Kabel & Schnittstellen',
  subtitle: 'Compare physical interface and cabling types',
  subtopics: [
    {
      id: '1.3.1',
      title: 'Kupferkabel (Copper / Ethernet)',
      steps: [
        {
          title: 'Kupferkabel: Der Klassiker',
          description:
            'Das bekannteste Netzwerkkabel ist das Ethernet-Kupferkabel mit RJ45-Stecker. Es überträgt Daten als elektrische Signale über 4 verdrillte Aderpaare (Twisted Pair). Günstig und einfach, aber auf max. 100m begrenzt.',
          analogy: 'Wie ein Gartenschlauch: Einfach und günstig, aber ab einer gewissen Länge kommt weniger Wasser an.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC\nFa0/0', position: { x: 80, y: 150 } },
              { id: 'phone', type: 'phone', label: 'IP Telefon', position: { x: 80, y: 350 } },
              { id: 'sw', type: 'switch', label: 'Cisco Switch\n48x RJ45', position: { x: 380, y: 250 } },
              { id: 'server', type: 'server', label: 'Server\nGi0/0', position: { x: 650, y: 150 } },
              { id: 'router', type: 'router', label: 'Router\nGi0/1', position: { x: 650, y: 350 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet', label: 'Cat6 100m' },
              { id: 'c2', from: 'phone', to: 'sw', type: 'ethernet', label: 'Cat5e' },
              { id: 'c3', from: 'sw', to: 'server', type: 'ethernet', label: 'Cat6a 10G' },
              { id: 'c4', from: 'sw', to: 'router', type: 'ethernet', label: 'Cat6' },
            ],
            packets: [
              {
                id: 'data',
                label: 'Ethernet',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw', hint: 'Der PC schickt einen elektrischen Impuls über das Cat6-Kabel zum Switch — verdrillte Kupferadern, max. 100m Strecke.' },
                  { fromDevice: 'sw', toDevice: 'server', hint: 'Der Switch reicht den Frame an den Server weiter. Hier läuft 10G über Cat6a — gleiches Kabel-Prinzip, nur höhere Frequenz.' },
                ],
              },
            ],
            highlightCables: ['c1', 'c2', 'c3', 'c4'],
          },
          modal: {
            title: 'Kupferkabel-Kategorien',
            content: 'Cat5e: Bis 1 Gbit/s, 100m — Standard\nCat6: Bis 1 Gbit/s (10G auf 55m), bessere Abschirmung\nCat6a: Bis 10 Gbit/s, 100m — Server/Uplinks\nCat7: Bis 10 Gbit/s, vollgeschirmt (S/FTP)\nCat8: Bis 40 Gbit/s, 30m — Datacenter\n\nAlle nutzen RJ45-Stecker mit 8 Pins (4 Paare).',
          },
        },
        {
          title: 'Straight-Through vs. Crossover',
          description:
            'Bei Straight-Through-Kabeln sind die Pins 1:1 verdrahtet — für Verbindungen zwischen verschiedenen Gerätetypen (PC↔Switch). Crossover-Kabel vertauschen TX/RX — für gleiche Geräte (Switch↔Switch). Moderne Switches mit Auto-MDIX erkennen das automatisch.',
          analogy: 'Straight = normaler Briefumschlag (Absender oben, Empfänger unten). Crossover = vertauschte Adressen.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC\n(TX auf Pin 1,2)', position: { x: 100, y: 150 } },
              { id: 'sw1', type: 'switch', label: 'Switch A\n(Auto-MDIX)', position: { x: 380, y: 150 } },
              { id: 'sw2', type: 'switch', label: 'Switch B\n(Auto-MDIX)', position: { x: 380, y: 380 } },
              { id: 'router', type: 'router', label: 'Router', position: { x: 650, y: 150 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw1', type: 'ethernet', label: 'Straight-Through' },
              { id: 'c2', from: 'sw1', to: 'sw2', type: 'ethernet', label: 'Crossover' },
              { id: 'c3', from: 'sw1', to: 'router', type: 'ethernet', label: 'Straight-Through' },
            ],
            highlightCables: ['c1', 'c2', 'c3'],
          },
          modal: {
            title: 'Pinbelegung (T568A vs T568B)',
            content: 'T568B (Standard in DE/USA):\n• Pin 1: weiß-orange\n• Pin 2: orange\n• Pin 3: weiß-grün\n• Pin 6: grün\n\nStraight-Through: Beide Enden gleich (T568B)\nCrossover: Ein Ende T568A, anderes T568B\n\nAuto-MDIX: Switch erkennt automatisch und passt sich an — Crossover-Kabel sind heute quasi überflüssig.',
          },
        },
      ],
    },
    {
      id: '1.3.2',
      title: 'Singlemode-Glasfaser',
      steps: [
        {
          title: 'Singlemode: Ein Lichtstrahl, weite Strecken',
          description:
            'Singlemode-Glasfaser nutzt einen einzigen, geraden Lichtstrahl durch einen ultradünnen Kern (9µm). Das Signal kann bis zu 100 km weit reisen. Wird für WAN-Verbindungen zwischen Standorten, Rechenzentren und ISP-Backbone-Netze genutzt.',
          analogy: 'Wie ein Laserpointer: Ein fokussierter Strahl, der sehr weit reicht.',
          scene: {
            devices: [
              { id: 'sw1', type: 'l3switch', label: 'Core Switch\nStandort A', position: { x: 80, y: 200 } },
              { id: 'r1', type: 'router', label: 'WAN Router A', position: { x: 250, y: 200 } },
              { id: 'cloud', type: 'cloud', label: 'ISP DWDM\nBackbone', position: { x: 420, y: 200 } },
              { id: 'r2', type: 'router', label: 'WAN Router B', position: { x: 590, y: 200 } },
              { id: 'sw2', type: 'l3switch', label: 'Core Switch\nStandort B', position: { x: 760, y: 200 } },
            ],
            cables: [
              { id: 'c1', from: 'sw1', to: 'r1', type: 'fiber-single', label: 'SMF' },
              { id: 'c2', from: 'r1', to: 'cloud', type: 'fiber-single', label: '80km SMF' },
              { id: 'c3', from: 'cloud', to: 'r2', type: 'fiber-single', label: '120km SMF' },
              { id: 'c4', from: 'r2', to: 'sw2', type: 'fiber-single', label: 'SMF' },
            ],
            packets: [
              {
                id: 'wan',
                label: 'WAN Data',
                color: '#fbbf24',
                hops: [
                  { fromDevice: 'sw1', toDevice: 'r1', hint: 'Der Core-Switch leitet den Traffic per kurzer Singlemode-Faser zum WAN-Router von Standort A.' },
                  { fromDevice: 'r1', toDevice: 'cloud', hint: 'Der Router schickt das Signal als Lichtimpuls über die Long-Reach-Faser ins ISP-Backbone — 80 km Strecke ohne Verstärker.' },
                  { fromDevice: 'cloud', toDevice: 'r2', hint: 'Der ISP routet weiter zu Standort B. Singlemode kann hier 120 km am Stück, weil der Lichtstrahl nicht streut.' },
                  { fromDevice: 'r2', toDevice: 'sw2', hint: 'Letzter Hop: vom WAN-Router in den Core-Switch von Standort B. Daten sind angekommen.' },
                ],
              },
            ],
            highlightCables: ['c2', 'c3'],
          },
          modal: {
            title: 'Singlemode Details',
            content: 'Kern: 8-10 µm (ultradünn)\nStecker-Farbe: Gelb\nWellenlänge: 1310nm oder 1550nm\nReichweite: bis 100km+ (mit Verstärkern mehr)\n\nSFP-Module:\n• SFP+ LR (Long Reach): 10G, 10km\n• SFP+ ER (Extended): 10G, 40km\n• SFP+ ZR: 10G, 80km\n\nTeurer als Multimode, aber unverzichtbar für WAN.',
          },
        },
      ],
    },
    {
      id: '1.3.3',
      title: 'Multimode-Glasfaser',
      steps: [
        {
          title: 'Multimode: Mehrere Lichtstrahlen, kürzere Strecken',
          description:
            'Multimode-Glasfaser schickt mehrere Lichtstrahlen gleichzeitig durch einen dickeren Kern (50µm). Günstiger als Singlemode, aber auf ~550m begrenzt. Standard für Verbindungen innerhalb eines Gebäudes — z.B. zwischen Access- und Distribution-Switches.',
          analogy: 'Wie eine breite Taschenlampe: Mehr Licht auf einmal, aber der Strahl streut schneller.',
          scene: {
            devices: [
              { id: 'acc1', type: 'switch', label: 'Access Switch\nEtage 1', position: { x: 100, y: 120 } },
              { id: 'acc2', type: 'switch', label: 'Access Switch\nEtage 3', position: { x: 100, y: 300 } },
              { id: 'acc3', type: 'switch', label: 'Access Switch\nEtage 5', position: { x: 100, y: 460 } },
              { id: 'dist', type: 'l3switch', label: 'Distribution Switch\nServerraum', position: { x: 450, y: 290 } },
              { id: 'core', type: 'l3switch', label: 'Core', position: { x: 700, y: 290 } },
            ],
            cables: [
              { id: 'c1', from: 'acc1', to: 'dist', type: 'fiber-multi', label: 'MMF 1G' },
              { id: 'c2', from: 'acc2', to: 'dist', type: 'fiber-multi', label: 'MMF 10G' },
              { id: 'c3', from: 'acc3', to: 'dist', type: 'fiber-multi', label: 'MMF 10G' },
              { id: 'c4', from: 'dist', to: 'core', type: 'fiber-single', label: 'SMF 40G' },
            ],
            packets: [
              {
                id: 'uplink',
                label: 'Trunk',
                color: '#f97316',
                hops: [
                  { fromDevice: 'acc2', toDevice: 'dist', hint: 'Der Access-Switch von Etage 3 sendet seinen Uplink-Traffic per Multimode-Faser zum Distribution-Switch im Serverraum — 10G, ein paar Hundert Meter.' },
                  { fromDevice: 'dist', toDevice: 'core', hint: 'Vom Distribution-Switch geht es weiter über Singlemode 40G zum Core. Hier zwischen Räumen reicht Multimode, fürs Backbone nimmt man Singlemode.' },
                ],
              },
            ],
            highlightCables: ['c1', 'c2', 'c3'],
          },
          modal: {
            title: 'Multimode Details',
            content: 'Kern: 50µm (OM3/OM4) oder 62.5µm (OM1/OM2)\nStecker-Farbe: Orange (OM1/2) oder Aqua (OM3/4)\n\nOM1: 33m bei 10G — veraltet\nOM2: 82m bei 10G — veraltet\nOM3: 300m bei 10G — Standard\nOM4: 400m bei 10G — Premium\nOM5: bis 150m bei 100G (SWDM) — Breitband-MMF\n\nSFP: SFP+ SR (Short Reach) = 10G Multimode',
          },
        },
      ],
    },
    {
      id: '1.3.4',
      title: 'Shared Media vs. Point-to-Point',
      steps: [
        {
          title: 'Shared Media: Alle teilen eine Leitung',
          description:
            'Früher teilten sich alle Geräte ein Kabel (Shared Media / Bus-Topologie) über einen Hub. Wenn zwei gleichzeitig sendeten, gab es eine Kollision — beide mussten warten und erneut senden. Das war langsam und unzuverlässig.',
          analogy: 'Wie ein Walkie-Talkie: Nur einer kann gleichzeitig reden. Sprechen zwei, versteht keiner was.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC 1\nsends...', position: { x: 100, y: 130 } },
              { id: 'pc2', type: 'pc', label: 'PC 2\nsends...', position: { x: 400, y: 130 } },
              { id: 'pc3', type: 'pc', label: 'PC 3\nwartet', position: { x: 650, y: 130 } },
              { id: 'hub', type: 'switch', label: 'Hub (Layer 1)\nShared Bandwidth', position: { x: 380, y: 330 } },
              { id: 'server', type: 'server', label: 'Server', position: { x: 650, y: 330 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'hub', type: 'ethernet', label: '10 Mbit shared' },
              { id: 'c2', from: 'pc2', to: 'hub', type: 'ethernet' },
              { id: 'c3', from: 'pc3', to: 'hub', type: 'ethernet' },
              { id: 'c4', from: 'hub', to: 'server', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'collision',
                label: 'COLLISION!',
                color: '#f87171',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'hub', hint: 'PC 1 sendet — gleichzeitig sendet PC 2. Beide Signale kollidieren am Hub. Resultat: Daten zerstört, beide PCs müssen warten und neu senden.' },
                ],
              },
            ],
            highlightDevices: ['hub'],
          },
          modal: {
            title: 'CSMA/CD — Kollisionserkennung',
            content: 'Bei Shared Media (Hub) nutzt Ethernet CSMA/CD:\n\n1. Carrier Sense: Horche ob die Leitung frei ist\n2. Multiple Access: Alle dürfen senden\n3. Collision Detection: Kollision erkannt?\n   → Stopp, zufällig warten, erneut versuchen\n\nKollisionsdomäne: Alle Geräte an einem Hub = eine Kollisionsdomäne.\nJeder Switch-Port = eigene Kollisionsdomäne.',
          },
        },
        {
          title: 'Point-to-Point: Dedizierte Verbindung',
          description:
            'Moderne Switches geben jedem Gerät seine eigene, dedizierte Verbindung. Keine Kollisionen, Full-Duplex (gleichzeitig senden UND empfangen), volle Bandbreite pro Port. Jeder Port ist eine eigene Kollisionsdomäne.',
          analogy: 'Wie ein Telefonanruf statt Walkie-Talkie: Beide können gleichzeitig reden ohne sich zu stören.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC 1\n1 Gbit Full', position: { x: 100, y: 100 } },
              { id: 'pc2', type: 'laptop', label: 'Laptop\n1 Gbit Full', position: { x: 100, y: 270 } },
              { id: 'phone', type: 'phone', label: 'IP Phone\n100 Mbit', position: { x: 100, y: 430 } },
              { id: 'sw', type: 'switch', label: 'Managed Switch\n48 Ports\nFull-Duplex', position: { x: 400, y: 270 } },
              { id: 'server', type: 'server', label: 'Server\n10 Gbit Full', position: { x: 680, y: 180 } },
              { id: 'router', type: 'router', label: 'Router', position: { x: 680, y: 370 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet', label: '1G Full-Duplex' },
              { id: 'c2', from: 'pc2', to: 'sw', type: 'ethernet', label: '1G Full-Duplex' },
              { id: 'c3', from: 'phone', to: 'sw', type: 'ethernet', label: '100M Full' },
              { id: 'c4', from: 'sw', to: 'server', type: 'fiber-multi', label: '10G Full' },
              { id: 'c5', from: 'sw', to: 'router', type: 'ethernet', label: '1G Full' },
            ],
            packets: [
              {
                id: 'fullduplex',
                label: 'Request',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw', hint: 'PC 1 sendet einen Request an den Server. Eigener Port = eigene Kollisionsdomäne, kein CSMA/CD nötig.' },
                  { fromDevice: 'sw', toDevice: 'server', hint: 'Switch leitet zielgenau an den Server-Port. Beide Geräte senden Full-Duplex — gleichzeitig in beide Richtungen ohne Konflikt.' },
                ],
              },
              {
                id: 'fullduplex-reply',
                label: 'Reply',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'server', toDevice: 'sw', hint: 'Während PC 1 noch sendet, kann der Server schon zurückantworten — das ist der Vorteil von Full-Duplex.' },
                  { fromDevice: 'sw', toDevice: 'pc1', hint: 'Antwort am PC angekommen. Effektive Bandbreite: 1 Gbit hin + 1 Gbit zurück = 2 Gbit pro Verbindung.' },
                ],
              },
            ],
            highlightDevices: ['sw'],
            highlightCables: ['c1', 'c2', 'c3', 'c4', 'c5'],
          },
          modal: {
            title: 'Full-Duplex vs. Half-Duplex',
            content: 'Half-Duplex (Hub/Shared):\n→ Nur senden ODER empfangen\n→ Kollisionen möglich\n→ CSMA/CD aktiv\n\nFull-Duplex (Switch/P2P):\n→ Gleichzeitig senden UND empfangen\n→ Keine Kollisionen\n→ Doppelte effektive Bandbreite\n\nBeispiel: 1 Gbit Full-Duplex = 1G senden + 1G empfangen = 2G effektiv.',
          },
        },
      ],
    },
  ],
}

export default lesson
