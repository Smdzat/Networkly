import type { Lesson } from '../../types'

const lesson: Lesson = {
  id: '1.1',
  number: '1.1',
  title: 'Netzwerk-Komponenten',
  subtitle: 'Explain the role and function of network components',
  subtopics: [
    {
      id: '1.1.0',
      title: 'Was ist ein Netzwerk?',
      steps: [
        {
          title: 'Warum Geräte verbunden werden',
          description:
            'Ein Netzwerk entsteht, sobald zwei oder mehr Geräte miteinander verbunden sind und Daten austauschen können. Das passiert überall: zu Hause (PC, Handy, Smart-TV), in der Firma (hunderte PCs, Server, Drucker) und weltweit (das Internet). Ohne Netzwerke gäbe es kein Internet, keine E-Mails, kein Streaming.',
          analogy: 'Ein Netzwerk ist wie ein Straßennetz: Häuser (Geräte) sind durch Straßen (Kabel/WLAN) verbunden, und Autos (Datenpakete) transportieren Waren (Daten) von A nach B.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'Dein PC', position: { x: 100, y: 120 } },
              { id: 'laptop', type: 'laptop', label: 'Laptop', position: { x: 100, y: 300 } },
              { id: 'phone', type: 'phone', label: 'Handy', position: { x: 100, y: 460 } },
              { id: 'sw', type: 'switch', label: 'Switch\n(Verteiler)', position: { x: 370, y: 280 } },
              { id: 'printer', type: 'printer', label: 'Drucker', position: { x: 620, y: 140 } },
              { id: 'server', type: 'server', label: 'Fileserver\n(Datenspeicher)', position: { x: 620, y: 420 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet' },
              { id: 'c2', from: 'laptop', to: 'sw', type: 'ethernet' },
              { id: 'c3', from: 'phone', to: 'sw', type: 'wireless' },
              { id: 'c4', from: 'sw', to: 'printer', type: 'ethernet' },
              { id: 'c5', from: 'sw', to: 'server', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'share',
                label: 'Datei',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw', hint: 'Dein PC möchte eine Datei auf dem Server speichern. Er schickt die Daten als Paket los.' },
                  { fromDevice: 'sw', toDevice: 'server', hint: 'Der Switch verbindet alle Geräte und leitet das Paket an den richtigen Empfänger — den Fileserver.' },
                ],
              },
            ],
            highlightDevices: ['pc1', 'laptop', 'phone', 'printer', 'server'],
          },
          modal: {
            title: 'Was ist ein Netzwerk?',
            content: 'Ein Netzwerk = Geräte + Verbindungen + Regeln\n\nGeräte (Endpunkte):\n• PCs, Laptops, Handys, Drucker, Server\n\nVerbindungen (Medien):\n• Kupferkabel (Ethernet)\n• Glasfaser\n• Funk (WLAN, Bluetooth)\n\nRegeln (Protokolle):\n• TCP/IP — wie Daten verpackt und adressiert werden\n• Ethernet — wie Daten im lokalen Netz übertragen werden\n\nVorteile eines Netzwerks:\n• Dateien teilen (Fileserver)\n• Drucker gemeinsam nutzen\n• Internet-Zugang für alle\n• Kommunikation (E-Mail, Chat)',
          },
        },
      ],
    },
    {
      id: '1.1.0.1',
      title: 'LAN vs. WAN',
      steps: [
        {
          title: 'Heimnetzwerk vs. Internet',
          description:
            'Es gibt zwei grundlegende Netzwerktypen: LAN (Local Area Network) ist dein Netzwerk zu Hause oder im Büro — alle Geräte in einem Gebäude. WAN (Wide Area Network) verbindet LANs über große Entfernungen miteinander. Das größte WAN der Welt ist das Internet.',
          analogy: 'LAN = dein Haus mit allen Zimmern. WAN = die Straßen zwischen Häusern in verschiedenen Städten. Das Internet = das gesamte Straßennetz der Welt.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC (Zuhause)', position: { x: 60, y: 200 } },
              { id: 'laptop', type: 'laptop', label: 'Laptop', position: { x: 60, y: 370 } },
              { id: 'sw1', type: 'switch', label: 'Home Switch', position: { x: 220, y: 280 } },
              { id: 'r1', type: 'router', label: 'Dein Router', position: { x: 380, y: 280 } },
              { id: 'cloud', type: 'cloud', label: 'Internet\n(WAN)', position: { x: 540, y: 200 } },
              { id: 'r2', type: 'router', label: 'Firmen-Router', position: { x: 540, y: 380 } },
              { id: 'sw2', type: 'switch', label: 'Office Switch', position: { x: 700, y: 380 } },
              { id: 'server', type: 'server', label: 'Firmen-Server', position: { x: 700, y: 200 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw1', type: 'ethernet' },
              { id: 'c2', from: 'laptop', to: 'sw1', type: 'wireless' },
              { id: 'c3', from: 'sw1', to: 'r1', type: 'ethernet' },
              { id: 'c4', from: 'r1', to: 'cloud', type: 'serial', label: 'WAN-Leitung' },
              { id: 'c5', from: 'cloud', to: 'r2', type: 'serial' },
              { id: 'c6', from: 'r2', to: 'sw2', type: 'ethernet' },
              { id: 'c7', from: 'sw2', to: 'server', type: 'fiber-single' },
            ],
            packets: [
              {
                id: 'wan',
                label: 'E-Mail',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw1', hint: 'Dein PC schickt eine E-Mail. Zuerst geht sie durch dein LAN (Heimnetzwerk) zum Router.' },
                  { fromDevice: 'sw1', toDevice: 'r1', hint: 'Der Switch leitet das Paket zum Router — er ist die Brücke zwischen deinem LAN und dem WAN (Internet).' },
                  { fromDevice: 'r1', toDevice: 'cloud', hint: 'Dein Router schickt das Paket über die WAN-Leitung ins Internet. Ab hier verlässt es dein Heimnetzwerk!' },
                  { fromDevice: 'cloud', toDevice: 'r2', hint: 'Das Paket reist durchs Internet (WAN) und erreicht den Router der Zielfirma.' },
                  { fromDevice: 'r2', toDevice: 'sw2', hint: 'Der Firmen-Router leitet das Paket in das Firmen-LAN weiter.' },
                  { fromDevice: 'sw2', toDevice: 'server', hint: 'Der Office Switch liefert die E-Mail an den Firmen-Server. Ziel erreicht — LAN → WAN → LAN!' },
                ],
              },
            ],
            highlightDevices: ['r1', 'r2'],
          },
          modal: {
            title: 'LAN vs. WAN vs. weitere',
            content: 'LAN (Local Area Network):\n• Kleiner Bereich: Haus, Büro, Etage\n• Hohe Geschwindigkeit: 1-10 Gbit/s\n• Du verwaltest es selbst\n• Technologie: Ethernet, WLAN\n\nWAN (Wide Area Network):\n• Große Entfernungen: Städte, Länder\n• Langsamere Geschwindigkeit (oft)\n• Betrieben von ISPs (Internet-Anbietern)\n• Technologie: MPLS, Glasfaser, DSL\n\nWeitere Typen:\n• MAN (Metropolitan AN): Stadtweit\n• WLAN: Wireless LAN (Funknetz)\n• PAN: Personal AN (Bluetooth)\n• SAN: Storage AN (Speichernetzwerk)\n\nDas Internet = das größte WAN der Welt\n(Millionen LANs miteinander verbunden)',
          },
        },
      ],
    },
    {
      id: '1.1.0.2',
      title: 'Wie kommunizieren Geräte?',
      steps: [
        {
          title: 'Datenpakete — die Sprache des Netzwerks',
          description:
            'Geräte kommunizieren, indem sie Daten in kleine Pakete aufteilen und über Kabel oder WLAN an andere Geräte senden. Jedes Paket hat eine Absender- und Ziel-Adresse — wie ein Brief. Der Empfänger setzt die Pakete wieder zusammen. Das passiert in Millisekunden, tausende Male pro Sekunde.',
          analogy: 'Wie ein großes Buch versenden: Du reißt die Seiten raus, nummerierst sie, steckst jede in einen eigenen Umschlag mit Adresse, und schickst sie ab. Der Empfänger sortiert und bindet das Buch wieder zusammen.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'Absender\n192.168.1.10', position: { x: 80, y: 230 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 330, y: 230 } },
              { id: 'pc2', type: 'pc', label: 'Empfänger\n192.168.1.20', position: { x: 580, y: 230 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet' },
              { id: 'c2', from: 'sw', to: 'pc2', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'pkt1',
                label: 'Paket 1/3',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw', hint: 'Paket 1 von 3: Die Datei wird in kleine Pakete aufgeteilt. Jedes Paket hat: Absender-IP, Ziel-IP und eine Nummer.' },
                  { fromDevice: 'sw', toDevice: 'pc2', hint: 'Der Switch leitet Paket 1 an den Empfänger. Er kennt den richtigen Port anhand der MAC-Adresse.' },
                ],
              },
              {
                id: 'pkt2',
                label: 'Paket 2/3',
                color: '#fbbf24',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw', hint: 'Paket 2 folgt direkt. Die Pakete können sogar unterschiedliche Wege nehmen — das Netzwerk ist flexibel!' },
                  { fromDevice: 'sw', toDevice: 'pc2', hint: 'Paket 2 kommt an. Der Empfänger sammelt alle Pakete und setzt sie in der richtigen Reihenfolge zusammen.' },
                ],
              },
              {
                id: 'pkt3',
                label: 'Paket 3/3',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw', hint: 'Letztes Paket! Jedes Paket enthält eine Prüfsumme — damit erkennt der Empfänger, ob etwas beschädigt wurde.' },
                  { fromDevice: 'sw', toDevice: 'pc2', hint: 'Alle 3 Pakete angekommen! Der Empfänger bestätigt den Erhalt (ACK). Die Datei ist vollständig übertragen.' },
                ],
              },
            ],
            highlightDevices: ['pc1', 'pc2'],
          },
          modal: {
            title: 'Wie funktioniert Paketvermittlung?',
            content: 'Warum Pakete statt alles auf einmal?\n\n1. Effizienz: Mehrere Geräte teilen sich die Leitung\n2. Fehlerkorrektur: Nur beschädigte Pakete wiederholen\n3. Flexibilität: Pakete können verschiedene Wege nehmen\n\nJedes Paket enthält:\n• Absender-IP (wer schickt?)\n• Ziel-IP (wohin?)\n• Sequenznummer (welche Reihenfolge?)\n• Daten (ein Stück der Datei)\n• Prüfsumme (ist alles korrekt?)\n\nBeispiel: 1 MB Datei\n→ wird in ~700 Pakete à 1.500 Byte aufgeteilt\n→ jedes Paket wird einzeln adressiert und gesendet\n→ Empfänger setzt alles zusammen\n→ dauert wenige Millisekunden bei 1 Gbit/s',
          },
        },
      ],
    },
    {
      id: '1.1.1',
      title: 'Was ist ein Router?',
      steps: [
        {
          title: 'Ein Router ist wie ein Postamt',
          description:
            'Stell dir vor, du schickst einen Brief. Das Postamt schaut auf die Adresse und entscheidet, welchen Weg der Brief nehmen soll. Genau das macht ein Router — er leitet Datenpakete zwischen verschiedenen Netzwerken weiter.',
          analogy: 'Router = Postamt: Schaut auf die Ziel-Adresse und leitet das Paket in die richtige Richtung.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'Dein PC\n192.168.1.10', position: { x: 80, y: 100 } },
              { id: 'laptop1', type: 'laptop', label: 'Laptop\n192.168.1.11', position: { x: 80, y: 270 } },
              { id: 'phone1', type: 'phone', label: 'Handy\n192.168.1.12', position: { x: 80, y: 430 } },
              { id: 'sw1', type: 'switch', label: 'Home Switch', position: { x: 310, y: 270 } },
              { id: 'router1', type: 'router', label: 'Router\n192.168.1.1', position: { x: 530, y: 270 } },
              { id: 'internet', type: 'cloud', label: 'Internet', position: { x: 730, y: 120 } },
              { id: 'server1', type: 'server', label: 'Webserver\n142.250.80.46', position: { x: 730, y: 420 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw1', type: 'ethernet' },
              { id: 'c2', from: 'laptop1', to: 'sw1', type: 'ethernet' },
              { id: 'c3', from: 'phone1', to: 'sw1', type: 'wireless' },
              { id: 'c4', from: 'sw1', to: 'router1', type: 'ethernet' },
              { id: 'c5', from: 'router1', to: 'internet', type: 'ethernet' },
              { id: 'c6', from: 'router1', to: 'server1', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'req',
                label: 'HTTP GET',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw1', hint: 'Dein PC packt die Anfrage in einen "Frame" — ein digitales Paket mit Absender- und Ziel-Adresse' },
                  { fromDevice: 'sw1', toDevice: 'router1', hint: 'Der Switch leitet den Frame weiter an den Router — er kennt den Weg anhand der MAC-Adresse' },
                  { fromDevice: 'router1', toDevice: 'server1', hint: 'Der Router prüft die Ziel-IP (142.250.80.46) und leitet das Paket zum Webserver weiter' },
                ],
              },
            ],
            highlightDevices: ['router1'],
          },
          modal: {
            title: 'Was macht ein Router?',
            content: 'Ein Router arbeitet auf Layer 3 (Netzwerkschicht) und trifft Routing-Entscheidungen basierend auf IP-Adressen.\n\n• Verbindet verschiedene Netzwerke (z.B. Heimnetz ↔ Internet)\n• Hat in jedem Netzwerk eine eigene IP-Adresse\n• Nutzt eine Routing-Tabelle um den besten Weg zu finden\n• Kann NAT (Network Address Translation) durchführen',
          },
        },
        {
          title: 'Routing in Aktion: Das Paket reist',
          description:
            'Wenn du google.com öffnest, schickt dein PC ein Paket an den Router. Der Router schaut in seine Routing-Tabelle und leitet es zum nächsten Router weiter — bis es den Zielserver erreicht. Die Antwort nimmt den gleichen Weg zurück.',
          analogy: 'Wie ein Staffellauf: Jeder Router gibt das Paket an den nächsten weiter, bis es am Ziel ist.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'Dein PC\n192.168.1.10', position: { x: 80, y: 270 } },
              { id: 'r1', type: 'router', label: 'Dein Router\n192.168.1.1', position: { x: 250, y: 270 } },
              { id: 'r2', type: 'router', label: 'ISP Router\n85.1.0.1', position: { x: 420, y: 170 } },
              { id: 'r3', type: 'router', label: 'Backbone\n72.14.0.1', position: { x: 420, y: 380 } },
              { id: 'r4', type: 'router', label: 'Google Router\n142.250.0.1', position: { x: 590, y: 270 } },
              { id: 'server', type: 'server', label: 'google.com\n142.250.80.46', position: { x: 760, y: 270 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'r1', type: 'ethernet' },
              { id: 'c2', from: 'r1', to: 'r2', type: 'serial' },
              { id: 'c3', from: 'r2', to: 'r4', type: 'fiber-single' },
              { id: 'c4', from: 'r1', to: 'r3', type: 'serial' },
              { id: 'c5', from: 'r3', to: 'r4', type: 'fiber-single' },
              { id: 'c6', from: 'r4', to: 'server', type: 'fiber-single', label: '10 Gbit' },
            ],
            packets: [
              {
                id: 'route1',
                label: 'HTTPS',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'r1', hint: 'Dein PC schickt das Paket an den Heimrouter — das ist dein "Default Gateway"' },
                  { fromDevice: 'r1', toDevice: 'r2', hint: 'Dein Router leitet es an den ISP-Router (Internet-Anbieter) weiter' },
                  { fromDevice: 'r2', toDevice: 'r4', hint: 'Der ISP schickt es über das Backbone — das sind die Hochgeschwindigkeits-Leitungen des Internets' },
                  { fromDevice: 'r4', toDevice: 'server', hint: 'Googles Router empfängt das Paket und leitet es an den Webserver — Ziel erreicht!' },
                ],
              },
            ],
            highlightCables: ['c2', 'c3'],
          },
          modal: {
            title: 'Routing-Tabelle',
            content: 'Jeder Router hat eine Routing-Tabelle:\n\nZiel-Netzwerk → Nächster Hop\n192.168.1.0/24 → direkt verbunden\n0.0.0.0/0 → 85.1.0.1 (Default Route)\n\nDer Router wählt immer den spezifischsten Eintrag (Longest Prefix Match).',
          },
        },
      ],
    },
    {
      id: '1.1.2',
      title: 'Layer-2 Switch',
      steps: [
        {
          title: 'Ein Switch ist wie eine Telefonzentrale',
          description:
            'Früher gab es Telefonzentralen, wo eine Person Kabel manuell verbunden hat. Ein Switch macht das automatisch — er verbindet Geräte innerhalb eines Netzwerks und leitet Daten nur an das richtige Ziel, nicht an alle.',
          analogy: 'Switch = Telefonzentrale: Verbindet das richtige Gerät direkt, statt alles an alle zu schicken.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC 1\nFa0/1', position: { x: 100, y: 80 } },
              { id: 'pc2', type: 'pc', label: 'PC 2\nFa0/2', position: { x: 100, y: 220 } },
              { id: 'pc3', type: 'laptop', label: 'PC 3\nFa0/3', position: { x: 100, y: 360 } },
              { id: 'printer1', type: 'printer', label: 'Drucker\nFa0/4', position: { x: 100, y: 480 } },
              { id: 'switch1', type: 'switch', label: 'Cisco Switch\n24 Ports', position: { x: 380, y: 270 } },
              { id: 'server1', type: 'server', label: 'Fileserver', position: { x: 640, y: 170 } },
              { id: 'router1', type: 'router', label: 'Router', position: { x: 640, y: 370 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'switch1', type: 'ethernet' },
              { id: 'c2', from: 'pc2', to: 'switch1', type: 'ethernet' },
              { id: 'c3', from: 'pc3', to: 'switch1', type: 'ethernet' },
              { id: 'c4', from: 'printer1', to: 'switch1', type: 'ethernet' },
              { id: 'c5', from: 'switch1', to: 'server1', type: 'ethernet', label: 'Gi0/1' },
              { id: 'c6', from: 'switch1', to: 'router1', type: 'ethernet', label: 'Gi0/2' },
            ],
            packets: [
              {
                id: 'print',
                label: 'PRINT',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'switch1', hint: 'PC 1 will drucken — der Switch empfängt den Frame auf Port Fa0/1' },
                  { fromDevice: 'switch1', toDevice: 'server1', hint: 'Der Switch kennt die MAC-Adresse des Servers und schickt den Frame NUR an Port Gi0/1 — nicht an alle!' },
                ],
              },
            ],
            highlightDevices: ['switch1'],
          },
          modal: {
            title: 'Switch vs. Hub',
            content: 'Ein Hub schickt Daten an ALLE Ports (dumm). Ein Switch schickt Daten NUR an den richtigen Port (intelligent).\n\n• Hub = Layer 1 (nur elektrische Signale)\n• Switch = Layer 2 (versteht MAC-Adressen)\n\nHubs sind heute komplett veraltet.',
          },
        },
        {
          title: 'Switch arbeitet mit MAC-Adressen',
          description:
            'Der Switch merkt sich, welches Gerät an welchem Port hängt. Dafür nutzt er MAC-Adressen — das sind eindeutige Hardware-Adressen, wie eine Seriennummer für jede Netzwerkkarte. Diese Tabelle wird automatisch aufgebaut.',
          analogy: 'Wie ein Rezeptionist der sich merkt: "Herr Müller sitzt an Platz 3, Frau Schmidt an Platz 7".',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC 1\nMAC: AA:BB:CC:00:00:01', position: { x: 100, y: 100 } },
              { id: 'pc2', type: 'pc', label: 'PC 2\nMAC: AA:BB:CC:00:00:02', position: { x: 100, y: 280 } },
              { id: 'pc3', type: 'laptop', label: 'PC 3\nMAC: AA:BB:CC:00:00:03', position: { x: 100, y: 440 } },
              { id: 'switch1', type: 'switch', label: 'Switch\nMAC-Tabelle', position: { x: 400, y: 270 } },
              { id: 'server1', type: 'server', label: 'Server\nMAC: DD:EE:FF:00:00:04', position: { x: 700, y: 270 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'switch1', type: 'ethernet', label: 'Port Fa0/1' },
              { id: 'c2', from: 'pc2', to: 'switch1', type: 'ethernet', label: 'Port Fa0/2' },
              { id: 'c3', from: 'pc3', to: 'switch1', type: 'ethernet', label: 'Port Fa0/3' },
              { id: 'c4', from: 'switch1', to: 'server1', type: 'ethernet', label: 'Port Gi0/1' },
            ],
            packets: [
              {
                id: 'frame',
                label: 'Frame',
                color: '#fbbf24',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'switch1', hint: 'PC 1 (MAC: AA:BB:CC:00:00:01) schickt einen Frame — der Switch merkt sich: "Port Fa0/1 = AA:BB:CC:00:00:01"' },
                  { fromDevice: 'switch1', toDevice: 'server1', hint: 'Der Switch schaut in seine MAC-Tabelle: "DD:EE:FF:00:00:04 → Port Gi0/1" und leitet gezielt weiter' },
                ],
              },
            ],
            highlightDevices: ['switch1'],
          },
          modal: {
            title: 'MAC-Adress-Tabelle',
            content: 'show mac address-table:\n\nPort Fa0/1 → AA:BB:CC:00:00:01\nPort Fa0/2 → AA:BB:CC:00:00:02\nPort Fa0/3 → AA:BB:CC:00:00:03\nPort Gi0/1 → DD:EE:FF:00:00:04\n\nEinträge werden nach 300 Sek. (Aging Time) gelöscht, wenn kein Traffic kommt.',
          },
        },
      ],
    },
    {
      id: '1.1.3',
      title: 'Layer-3 Switch',
      youtube: 'https://www.youtube.com/watch?v=OkPB028l2eE',
      steps: [
        {
          title: 'L3-Switch: Switch + Router in einem',
          description:
            'Ein Layer-3 Switch kann beides: Geräte wie ein Switch verbinden UND wie ein Router zwischen Netzwerken weiterleiten. In modernen Campus-Netzwerken ersetzen L3-Switches oft die Router — sie sind schneller, weil sie Routing in Hardware machen.',
          analogy: 'L3-Switch = Telefonzentrale, die auch zwischen verschiedenen Firmen-Standorten verbinden kann.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'Buchhaltung\nVLAN 10\n192.168.10.5', position: { x: 80, y: 100 } },
              { id: 'pc2', type: 'pc', label: 'Buchhaltung\nVLAN 10\n192.168.10.6', position: { x: 80, y: 260 } },
              { id: 'pc3', type: 'laptop', label: 'Marketing\nVLAN 20\n192.168.20.5', position: { x: 80, y: 420 } },
              { id: 'l3sw', type: 'l3switch', label: 'L3 Switch\nInter-VLAN Routing', position: { x: 380, y: 270 } },
              { id: 'server1', type: 'server', label: 'ERP Server\n192.168.10.100', position: { x: 660, y: 140 } },
              { id: 'router', type: 'router', label: 'WAN Router', position: { x: 660, y: 400 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'l3sw', type: 'ethernet', label: 'VLAN 10' },
              { id: 'c2', from: 'pc2', to: 'l3sw', type: 'ethernet', label: 'VLAN 10' },
              { id: 'c3', from: 'pc3', to: 'l3sw', type: 'ethernet', label: 'VLAN 20' },
              { id: 'c4', from: 'l3sw', to: 'server1', type: 'fiber-single', label: '10G Trunk' },
              { id: 'c5', from: 'l3sw', to: 'router', type: 'fiber-single', label: 'Uplink' },
            ],
            packets: [
              {
                id: 'intervlan',
                label: 'VLAN→VLAN',
                color: '#fbbf24',
                hops: [
                  { fromDevice: 'pc3', toDevice: 'l3sw', hint: 'Marketing-PC (VLAN 20) will auf den ERP-Server (VLAN 10) — unterschiedliche Netzwerke!' },
                  { fromDevice: 'l3sw', toDevice: 'server1', hint: 'Der L3-Switch routet zwischen den VLANs: er prüft die Ziel-IP, schreibt die Quell-/Ziel-MAC neu, verringert die TTL und legt das Paket ins Ziel-VLAN (VLAN 10).' },
                ],
              },
            ],
            highlightDevices: ['l3sw'],
          },
          modal: {
            title: 'L2 Switch vs. L3 Switch',
            content: 'L2 Switch:\n• Arbeitet mit MAC-Adressen\n• Kann nur innerhalb eines VLANs weiterleiten\n• Kein Routing möglich\n\nL3 Switch:\n• Kann zusätzlich IP-Routing (Inter-VLAN)\n• Hardware-basiertes Routing (ASIC) = ultra schnell\n• Ersetzt Router im Campus-Netzwerk\n• Hat SVI (Switch Virtual Interfaces) für Routing',
          },
        },
        {
          title: 'Inter-VLAN Routing in der Praxis',
          description:
            'In einem Firmennetzwerk sind Abteilungen in VLANs getrennt. Der L3-Switch routet zwischen ihnen — die Buchhaltung (VLAN 10) kann so auf den ERP-Server zugreifen, obwohl der in einem anderen Subnetz liegt. Ohne L3-Switch bräuchte man einen externen Router.',
          scene: {
            devices: [
              { id: 'acc1', type: 'switch', label: 'Access Switch\nEtage 1', position: { x: 100, y: 130 } },
              { id: 'acc2', type: 'switch', label: 'Access Switch\nEtage 2', position: { x: 100, y: 380 } },
              { id: 'l3sw', type: 'l3switch', label: 'Distribution\nL3 Switch', position: { x: 380, y: 260 } },
              { id: 'core', type: 'l3switch', label: 'Core Switch', position: { x: 620, y: 160 } },
              { id: 'server', type: 'server', label: 'Datacenter', position: { x: 620, y: 380 } },
            ],
            cables: [
              { id: 'c1', from: 'acc1', to: 'l3sw', type: 'ethernet', label: 'Trunk' },
              { id: 'c2', from: 'acc2', to: 'l3sw', type: 'ethernet', label: 'Trunk' },
              { id: 'c3', from: 'l3sw', to: 'core', type: 'fiber-single', label: '10G' },
              { id: 'c4', from: 'l3sw', to: 'server', type: 'fiber-single' },
            ],
            packets: [
              {
                id: 'trunk',
                label: '802.1Q',
                color: '#a78bfa',
                hops: [
                  { fromDevice: 'acc1', toDevice: 'l3sw', hint: 'Der Access Switch schickt einen getaggten Frame (802.1Q) über den Trunk zum Distribution Switch' },
                  { fromDevice: 'l3sw', toDevice: 'core', hint: 'Der L3-Switch entscheidet: Routing oder Switching? Hier wird zum Core weitergeleitet' },
                ],
              },
            ],
            highlightDevices: ['l3sw', 'core'],
          },
        },
      ],
    },
    {
      id: '1.1.4',
      title: 'Next-Generation Firewall & IPS',
      steps: [
        {
          title: 'Firewall: Der Türsteher deines Netzwerks',
          description:
            'Eine Firewall entscheidet, wer rein und raus darf. Sie prüft jedes Paket anhand von Regeln (ACLs). In einer Firma steht sie typischerweise zwischen dem internen Netzwerk und dem Internet — der sogenannten DMZ-Architektur.',
          analogy: 'Firewall = Türsteher: Prüft jedes Paket und entscheidet — rein oder abgewiesen.',
          scene: {
            devices: [
              { id: 'internet', type: 'cloud', label: 'Internet', position: { x: 80, y: 270 } },
              { id: 'edge', type: 'router', label: 'Edge Router', position: { x: 240, y: 270 } },
              { id: 'fw', type: 'firewall', label: 'Cisco ASA\nFirewall', position: { x: 420, y: 270 } },
              { id: 'dmz', type: 'server', label: 'DMZ\nWebserver', position: { x: 600, y: 130 } },
              { id: 'sw', type: 'switch', label: 'Core Switch', position: { x: 600, y: 270 } },
              { id: 'server', type: 'server', label: 'Interner\nDB Server', position: { x: 600, y: 420 } },
            ],
            cables: [
              { id: 'c1', from: 'internet', to: 'edge', type: 'serial' },
              { id: 'c2', from: 'edge', to: 'fw', type: 'ethernet' },
              { id: 'c3', from: 'fw', to: 'dmz', type: 'ethernet', label: 'DMZ Zone' },
              { id: 'c4', from: 'fw', to: 'sw', type: 'ethernet', label: 'Inside' },
              { id: 'c5', from: 'sw', to: 'server', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'allowed',
                label: '✓ HTTPS',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'internet', toDevice: 'edge', hint: 'Ein HTTPS-Paket aus dem Internet erreicht den Edge Router — die Grenze deines Netzwerks' },
                  { fromDevice: 'edge', toDevice: 'fw', hint: 'Der Router leitet es an die Firewall — jetzt wird geprüft ob das Paket rein darf' },
                  { fromDevice: 'fw', toDevice: 'dmz', hint: 'Die Firewall erlaubt HTTPS (Port 443) → das Paket darf in die DMZ zum Webserver' },
                ],
              },
            ],
            highlightDevices: ['fw'],
          },
          modal: {
            title: 'DMZ — Demilitarisierte Zone',
            content: 'Die DMZ ist ein separates Netzwerk-Segment zwischen Internet und internem Netz.\n\n• Webserver, Mailserver stehen in der DMZ\n• Von außen erreichbar, aber isoliert vom internen Netz\n• Falls ein DMZ-Server gehackt wird, ist das interne Netz geschützt\n\nSecurity Levels (ASA): Outside (0) → DMZ (50) → Inside (100)',
          },
        },
        {
          title: 'Next-Gen: Deep Packet Inspection',
          description:
            'Eine Next-Gen Firewall (NGFW) schaut nicht nur auf Absender und Ziel, sondern auch IN das Paket hinein. Sie erkennt Viren, Angriffe und verdächtiges Verhalten — wie ein Sicherheitsscanner am Flughafen. Ein integriertes IPS blockiert Angriffe in Echtzeit.',
          analogy: 'Klassische Firewall = Ausweiskontrolle. NGFW = Röntgenscanner der den Inhalt prüft.',
          scene: {
            devices: [
              { id: 'attacker', type: 'laptop', label: 'Angreifer\nSQLi Attack', position: { x: 80, y: 130 } },
              { id: 'user', type: 'pc', label: 'Normaler User\nHTTPS', position: { x: 80, y: 400 } },
              { id: 'internet', type: 'cloud', label: 'Internet', position: { x: 250, y: 270 } },
              { id: 'ngfw', type: 'firewall', label: 'Cisco Firepower\nNGFW + IPS', position: { x: 450, y: 270 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 620, y: 270 } },
              { id: 'server1', type: 'server', label: 'App Server', position: { x: 760, y: 170 } },
              { id: 'server2', type: 'server', label: 'DB Server', position: { x: 760, y: 370 } },
            ],
            cables: [
              { id: 'c1', from: 'attacker', to: 'internet', type: 'ethernet' },
              { id: 'c2', from: 'user', to: 'internet', type: 'ethernet' },
              { id: 'c3', from: 'internet', to: 'ngfw', type: 'serial' },
              { id: 'c4', from: 'ngfw', to: 'sw', type: 'ethernet' },
              { id: 'c5', from: 'sw', to: 'server1', type: 'ethernet' },
              { id: 'c6', from: 'sw', to: 'server2', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'legit',
                label: 'HTTPS ✓',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'user', toDevice: 'internet', hint: 'Ein normaler User öffnet eine Webseite — das Paket geht ins Internet' },
                  { fromDevice: 'internet', toDevice: 'ngfw', hint: 'Das Paket kommt bei der NGFW an — sie prüft nicht nur Absender, sondern auch den Inhalt (Deep Packet Inspection)' },
                  { fromDevice: 'ngfw', toDevice: 'sw', hint: 'Kein Virus, kein Angriff erkannt → die Firewall lässt das Paket durch' },
                  { fromDevice: 'sw', toDevice: 'server1', hint: 'Der Switch leitet das Paket an den App Server — die Anfrage wird verarbeitet' },
                ],
              },
            ],
            highlightDevices: ['ngfw'],
          },
          modal: {
            title: 'IPS — Intrusion Prevention System',
            content: 'IPS-Features einer NGFW:\n\n• Signatur-basiert: Erkennt bekannte Angriffsmuster\n• Anomalie-basiert: Erkennt ungewöhnliches Verhalten\n• Application Awareness: Versteht L7-Protokolle (HTTP, DNS, ...)\n• URL Filtering: Blockiert bösartige Webseiten\n• Malware Protection: Prüft Dateien in Echtzeit\n\nCisco Lösung: Firepower Threat Defense (FTD)',
          },
        },
      ],
    },
    {
      id: '1.1.5',
      title: 'Access Points',
      youtube: 'https://www.youtube.com/watch?v=POd9c5JI25o',
      steps: [
        {
          title: 'Der Access Point: WLAN für alle',
          description:
            'Ein Access Point (AP) ist wie eine Funkstation — er wandelt kabelgebundene Netzwerkdaten in WLAN-Signale um. In einem Büro hängen APs typischerweise an der Decke und werden per PoE-Kabel mit Strom und Daten versorgt.',
          analogy: 'Access Point = Mobilfunkmast im Kleinen: Verteilt das Netzwerk per Funk an alle Geräte.',
          scene: {
            devices: [
              { id: 'core', type: 'l3switch', label: 'Core Switch', position: { x: 100, y: 270 } },
              { id: 'sw1', type: 'switch', label: 'PoE Switch\nEtage 1', position: { x: 320, y: 150 } },
              { id: 'sw2', type: 'switch', label: 'PoE Switch\nEtage 2', position: { x: 320, y: 400 } },
              { id: 'ap1', type: 'access-point', label: 'AP 1\nKanal 1', position: { x: 540, y: 80 } },
              { id: 'ap2', type: 'access-point', label: 'AP 2\nKanal 6', position: { x: 540, y: 230 } },
              { id: 'ap3', type: 'access-point', label: 'AP 3\nKanal 11', position: { x: 540, y: 400 } },
              { id: 'laptop1', type: 'laptop', label: 'Laptop', position: { x: 720, y: 150 } },
              { id: 'phone1', type: 'phone', label: 'Handy', position: { x: 720, y: 330 } },
            ],
            cables: [
              { id: 'c1', from: 'core', to: 'sw1', type: 'fiber-single', label: 'Trunk' },
              { id: 'c2', from: 'core', to: 'sw2', type: 'fiber-single', label: 'Trunk' },
              { id: 'c3', from: 'sw1', to: 'ap1', type: 'ethernet', label: 'PoE' },
              { id: 'c4', from: 'sw1', to: 'ap2', type: 'ethernet', label: 'PoE' },
              { id: 'c5', from: 'sw2', to: 'ap3', type: 'ethernet', label: 'PoE' },
              { id: 'c6', from: 'ap1', to: 'laptop1', type: 'wireless' },
              { id: 'c7', from: 'ap2', to: 'phone1', type: 'wireless' },
            ],
            packets: [
              {
                id: 'wifi',
                label: 'Wi-Fi',
                color: '#a78bfa',
                hops: [
                  { fromDevice: 'laptop1', toDevice: 'ap1', hint: 'Das Laptop sendet per WLAN (Wi-Fi) — Funkwellen übertragen die Daten zum Access Point' },
                  { fromDevice: 'ap1', toDevice: 'sw1', hint: 'Der AP wandelt das Funksignal in ein Ethernet-Signal um und schickt es über das PoE-Kabel zum Switch' },
                  { fromDevice: 'sw1', toDevice: 'core', hint: 'Der Switch leitet den Frame über den Trunk-Uplink zum Core Switch — ab hier gehts per Kabel weiter' },
                ],
              },
            ],
            highlightDevices: ['ap1', 'ap2', 'ap3'],
          },
        },
        {
          title: 'Autonome vs. Lightweight APs',
          description:
            'Autonome APs arbeiten eigenständig — jeder wird einzeln konfiguriert. Lightweight APs (LAPs) werden zentral von einem WLC gesteuert. In Firmen mit vielen APs ist Lightweight Standard, weil man sonst 200 Geräte einzeln pflegen müsste.',
          analogy: 'Autonom = Jeder Mitarbeiter entscheidet selbst. Lightweight = Ein Chef gibt die Regeln vor.',
          scene: {
            devices: [
              { id: 'wlc', type: 'controller', label: 'WLC\n(Wireless Controller)', position: { x: 380, y: 120 } },
              { id: 'sw', type: 'switch', label: 'Distribution\nSwitch', position: { x: 380, y: 300 } },
              { id: 'lap1', type: 'access-point', label: 'LAP 1', position: { x: 160, y: 440 } },
              { id: 'lap2', type: 'access-point', label: 'LAP 2', position: { x: 380, y: 440 } },
              { id: 'lap3', type: 'access-point', label: 'LAP 3', position: { x: 600, y: 440 } },
            ],
            cables: [
              { id: 'c1', from: 'wlc', to: 'sw', type: 'ethernet', label: 'CAPWAP Mgmt' },
              { id: 'c2', from: 'sw', to: 'lap1', type: 'ethernet' },
              { id: 'c3', from: 'sw', to: 'lap2', type: 'ethernet' },
              { id: 'c4', from: 'sw', to: 'lap3', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'capwap',
                label: 'CAPWAP',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'wlc', toDevice: 'sw', hint: 'Der WLC (Wireless Controller) sendet eine CAPWAP-Nachricht — damit steuert er alle APs zentral' },
                  { fromDevice: 'sw', toDevice: 'lap2', hint: 'Der Switch leitet die Nachricht an LAP 2 — z.B. ein Firmware-Update oder neue WLAN-Einstellungen' },
                ],
              },
            ],
            highlightDevices: ['wlc'],
          },
          modal: {
            title: 'CAPWAP-Tunnel',
            content: 'CAPWAP (Control And Provisioning of Wireless Access Points) ist das Protokoll zwischen WLC und LAPs.\n\n• Control Channel: Konfiguration, Firmware-Updates\n• Data Channel: Client-Traffic wird durch den WLC getunnelt\n\nVorteile: Zentrale Policies, Roaming, automatische Kanalwahl, einheitliche SSIDs.',
          },
        },
      ],
    },
    {
      id: '1.1.6',
      title: 'Controller (DNA Center & WLC)',
      youtube: 'https://www.youtube.com/watch?v=SjHm-HXg2xY',
      steps: [
        {
          title: 'Cisco DNA Center: Das Gehirn des Netzwerks',
          description:
            'Cisco DNA Center ist eine Management-Plattform für das gesamte Netzwerk. Es bietet Automatisierung, Monitoring und Troubleshooting aus einer einzigen Oberfläche. Statt hunderte Geräte per CLI zu konfigurieren, nutzt man Intent-Based Networking — du sagst WAS du willst, DNA Center macht den Rest.',
          analogy: 'Controller = Dirigent eines Orchesters: Du sagst "Spiel eine Symphonie", er koordiniert jedes Instrument.',
          scene: {
            devices: [
              { id: 'dnac', type: 'controller', label: 'Cisco DNA Center\nManagement Plane', position: { x: 400, y: 60 } },
              { id: 'wlc', type: 'controller', label: 'WLC 9800', position: { x: 200, y: 200 } },
              { id: 'ise', type: 'server', label: 'Cisco ISE\nAuthentication', position: { x: 600, y: 200 } },
              { id: 'core', type: 'l3switch', label: 'Core Switch', position: { x: 400, y: 330 } },
              { id: 'ap1', type: 'access-point', label: 'AP', position: { x: 150, y: 460 } },
              { id: 'ap2', type: 'access-point', label: 'AP', position: { x: 350, y: 460 } },
              { id: 'sw1', type: 'switch', label: 'Access SW', position: { x: 550, y: 460 } },
            ],
            cables: [
              { id: 'c1', from: 'dnac', to: 'wlc', type: 'ethernet', label: 'API' },
              { id: 'c2', from: 'dnac', to: 'ise', type: 'ethernet', label: 'pxGrid' },
              { id: 'c3', from: 'dnac', to: 'core', type: 'ethernet', label: 'NETCONF' },
              { id: 'c4', from: 'wlc', to: 'core', type: 'ethernet' },
              { id: 'c5', from: 'core', to: 'ap1', type: 'ethernet' },
              { id: 'c6', from: 'core', to: 'ap2', type: 'ethernet' },
              { id: 'c7', from: 'core', to: 'sw1', type: 'ethernet' },
            ],
            highlightDevices: ['dnac', 'wlc'],
          },
          modal: {
            title: 'Intent-Based Networking (IBN)',
            content: 'Traditionell: Admin konfiguriert jedes Gerät einzeln via CLI.\nIBN: Admin definiert Business-Intent, DNA Center setzt es automatisch um.\n\nBeispiel:\n"Marketing-VLAN darf nur auf Internet zugreifen, nicht auf Finanzdaten."\n→ DNA Center konfiguriert automatisch ACLs, SGTs und VLAN-Policies auf allen Switches.',
          },
        },
      ],
    },
    {
      id: '1.1.7',
      title: 'Endpoints & Server',
      steps: [
        {
          title: 'Endpoints: Die Endgeräte',
          description:
            'Endpoints sind die Geräte, die Menschen direkt nutzen — PCs, Laptops, Handys, Drucker, IP-Telefone. Sie sind der Anfang und das Ende jeder Netzwerk-Kommunikation. In einer typischen Firma hängen sie an Access-Switches.',
          analogy: 'Endpoints = die Bewohner eines Hauses. Das Netzwerk ist die Infrastruktur (Straßen, Rohre, Kabel).',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'Desktop PC', position: { x: 80, y: 80 } },
              { id: 'laptop1', type: 'laptop', label: 'Laptop', position: { x: 240, y: 80 } },
              { id: 'phone1', type: 'phone', label: 'IP-Telefon', position: { x: 400, y: 80 } },
              { id: 'printer1', type: 'printer', label: 'Drucker', position: { x: 560, y: 80 } },
              { id: 'sw1', type: 'switch', label: 'Access Switch\nEtage 3', position: { x: 200, y: 270 } },
              { id: 'sw2', type: 'switch', label: 'Access Switch\nEtage 4', position: { x: 460, y: 270 } },
              { id: 'dist', type: 'l3switch', label: 'Distribution\nSwitch', position: { x: 340, y: 430 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw1', type: 'ethernet' },
              { id: 'c2', from: 'laptop1', to: 'sw1', type: 'ethernet' },
              { id: 'c3', from: 'phone1', to: 'sw2', type: 'ethernet' },
              { id: 'c4', from: 'printer1', to: 'sw2', type: 'ethernet' },
              { id: 'c5', from: 'sw1', to: 'dist', type: 'fiber-single', label: 'Uplink' },
              { id: 'c6', from: 'sw2', to: 'dist', type: 'fiber-single', label: 'Uplink' },
            ],
            packets: [
              {
                id: 'dhcp',
                label: 'DHCP',
                color: '#fbbf24',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw1', hint: 'Der PC hat noch keine IP-Adresse — er schickt eine DHCP-Anfrage: "Kann mir jemand eine IP geben?"' },
                  { fromDevice: 'sw1', toDevice: 'dist', hint: 'Der Access Switch leitet die Anfrage an den Distribution Switch weiter — dort läuft der DHCP-Server' },
                ],
              },
            ],
            highlightDevices: ['pc1', 'laptop1', 'phone1', 'printer1'],
          },
        },
        {
          title: 'Server: Dienstleister im Netzwerk',
          description:
            'Server sind spezialisierte Computer, die rund um die Uhr Dienste bereitstellen. In einer Firma stehen sie im Serverraum oder Rechenzentrum, angebunden über schnelle Uplinks (10G/40G). Typische Server-Rollen: Web, Mail, DNS, DHCP, File, Database.',
          analogy: 'Server = Kellner im Restaurant: Du bestellst (Request), er bringt dir das Essen (Response).',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'Client PC', position: { x: 80, y: 270 } },
              { id: 'sw1', type: 'switch', label: 'Access SW', position: { x: 240, y: 270 } },
              { id: 'core', type: 'l3switch', label: 'Core Switch', position: { x: 420, y: 270 } },
              { id: 'web', type: 'server', label: 'Webserver\nHTTPS :443', position: { x: 640, y: 100 } },
              { id: 'dns', type: 'server', label: 'DNS Server\nUDP :53', position: { x: 640, y: 260 } },
              { id: 'mail', type: 'server', label: 'Mailserver\nSMTP :25', position: { x: 640, y: 420 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw1', type: 'ethernet' },
              { id: 'c2', from: 'sw1', to: 'core', type: 'fiber-single' },
              { id: 'c3', from: 'core', to: 'web', type: 'fiber-single', label: '10G' },
              { id: 'c4', from: 'core', to: 'dns', type: 'fiber-single', label: '10G' },
              { id: 'c5', from: 'core', to: 'mail', type: 'fiber-single', label: '10G' },
            ],
            packets: [
              {
                id: 'dnsq',
                label: 'DNS Query',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw1', hint: 'Der PC will wissen: Welche IP hat "mail.firma.de"? Er schickt eine DNS-Anfrage (Port 53)' },
                  { fromDevice: 'sw1', toDevice: 'core', hint: 'Der Access Switch leitet den Frame über den 10G-Uplink zum Core Switch' },
                  { fromDevice: 'core', toDevice: 'dns', hint: 'Der Core Switch routet die Anfrage an den DNS-Server — Antwort: "mail.firma.de = 10.0.50.25"' },
                ],
              },
            ],
            highlightDevices: ['web', 'dns', 'mail'],
          },
          modal: {
            title: 'Client-Server Modell',
            content: 'Das Client-Server Modell:\n\n1. Client schickt Request (z.B. DNS-Anfrage)\n2. Server verarbeitet die Anfrage\n3. Server schickt Response (z.B. IP-Adresse)\n\nWichtige Server-Ports:\n• HTTP: 80 | HTTPS: 443\n• DNS: 53 | DHCP: 67/68\n• SMTP: 25 | SSH: 22\n• FTP: 20/21 | Telnet: 23',
          },
        },
      ],
    },
    {
      id: '1.1.8',
      title: 'PoE — Power over Ethernet',
      steps: [
        {
          title: 'PoE: Strom über das Netzwerkkabel',
          description:
            'Mit PoE liefert ein einziges Ethernet-Kabel Daten und Strom gleichzeitig. Der PoE-Switch erkennt automatisch, ob ein Gerät PoE braucht und wie viel Watt es benötigt. Perfekt für APs, IP-Kameras und Telefone an schwer erreichbaren Orten.',
          analogy: 'PoE = USB-C: Ein Kabel für alles — Daten, Strom und mehr.',
          scene: {
            devices: [
              { id: 'poe-sw', type: 'switch', label: 'PoE+ Switch\n(30W pro Port)', position: { x: 120, y: 270 } },
              { id: 'ap1', type: 'access-point', label: 'AP\n15.4W (PoE)', position: { x: 400, y: 80 } },
              { id: 'camera', type: 'pc', label: 'IP Kamera\n12.9W (PoE)', position: { x: 400, y: 230 } },
              { id: 'phone1', type: 'phone', label: 'IP Telefon\n7W (PoE)', position: { x: 400, y: 380 } },
              { id: 'laptop', type: 'laptop', label: 'Laptop\n(kein PoE)', position: { x: 400, y: 500 } },
            ],
            cables: [
              { id: 'c1', from: 'poe-sw', to: 'ap1', type: 'ethernet', label: 'Daten + 15W' },
              { id: 'c2', from: 'poe-sw', to: 'camera', type: 'ethernet', label: 'Daten + 13W' },
              { id: 'c3', from: 'poe-sw', to: 'phone1', type: 'ethernet', label: 'Daten + 7W' },
              { id: 'c4', from: 'poe-sw', to: 'laptop', type: 'ethernet', label: 'nur Daten' },
            ],
            highlightDevices: ['poe-sw'],
            highlightCables: ['c1', 'c2', 'c3'],
          },
          modal: {
            title: 'PoE Standards',
            content: 'IEEE Standards:\n\n• 802.3af (PoE): max 15.4W pro Port\n  → IP-Telefone, einfache APs\n\n• 802.3at (PoE+): max 30W pro Port\n  → Kameras, leistungsstarke APs\n\n• 802.3bt (PoE++): max 60-100W pro Port\n  → Displays, Laptops, PTZ-Kameras\n\nDer Switch prüft automatisch den Bedarf (LLDP/CDP).',
          },
        },
      ],
    },
  ],
}

export default lesson
