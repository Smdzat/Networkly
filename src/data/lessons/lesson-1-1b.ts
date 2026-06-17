import type { Lesson } from '../../types'

const lesson: Lesson = {
  id: '1.1b',
  number: '1.1b',
  title: 'OSI- & TCP/IP-Modell',
  subtitle: 'Das Fundament aller Netzwerk-Kommunikation',
  subtopics: [
    {
      id: '1.1b.1',
      title: 'Das OSI-Modell — 7 Schichten',
      steps: [
        {
          title: 'Warum gibt es Schichten?',
          description:
            'Wenn du eine WhatsApp-Nachricht abschickst, passieren zwischen deinem Tippen und dem Empfang beim Freund Dutzende von Schritten. Wer kümmert sich um die Verschlüsselung? Wer findet den Weg durchs Internet? Wer schickt die Bits durchs Kabel? Damit nicht jeder Hersteller alles selbst lösen muss, hat man das Ganze in 7 klare Schichten geteilt — das OSI-Modell. Jede Schicht hat eine einzige Aufgabe und kann unabhängig weiterentwickelt werden. Ein neues WLAN-Protokoll auf Layer 1 ändert nichts daran, wie HTTP auf Layer 7 funktioniert.',
          analogy: 'Wie ein Postdienst mit klarer Arbeitsteilung: Du schreibst den Brief (Layer 7). Die Sekretärin kuvertiert (Layer 6). Adressieren übernimmt jemand anderes. Der LKW-Fahrer transportiert. Der Postbote stellt zu. Jeder weiß genau was zu tun ist — und kann durch jemand anderen ersetzt werden.',
          scene: {
            customOverlay: {
              type: 'osi-model',
              position: { x: 400, y: 260 },
              layerWalk: [
                'Layer 7 — Application: Hier sitzt alles, was du als User direkt nutzt. Browser, E-Mail, WhatsApp, Spotify. HTTP, DNS, SMTP leben hier.',
                'Layer 6 — Presentation: Übersetzt Datenformate. Verschlüsselung (TLS), Komprimierung, Kodierung (UTF-8, JPEG). Damit beide Seiten dieselbe Sprache sprechen.',
                'Layer 5 — Session: Verwaltet Sitzungen — wann eine Verbindung beginnt, wie lange sie offen bleibt, wann sie endet. In der Praxis selten direkt sichtbar.',
                'Layer 4 — Transport: Hier wird entschieden ob zuverlässig (TCP, mit Bestätigung jeder Bytes) oder schnell (UDP, ohne). Port-Nummern wie :443 leben hier.',
                'Layer 3 — Network: Die Welt der IP-Adressen. Routing-Entscheidungen werden hier getroffen — wie ein Paket vom Sender zum Empfänger findet, oft über viele Hops.',
                'Layer 2 — Data Link: MAC-Adressen, Switches, Frames. Kümmert sich um die Zustellung im lokalen Netzwerk — vom PC zum nächsten Switch oder Router.',
                'Layer 1 — Physical: Das physische Signal selbst. Bits als elektrische Spannung im Kupfer, als Lichtimpuls in der Glasfaser, als Funkwelle bei WLAN.',
              ],
            },
            devices: [],
            cables: [],
          },
          modal: {
            title: 'Die 7 OSI-Schichten',
            content: 'Merksatz: "All People Seem To Need Data Processing"\n\n7 — Application: HTTP, DNS, SMTP, FTP\n6 — Presentation: SSL/TLS, JPEG, ASCII\n5 — Session: NetBIOS, RPC, PPTP\n4 — Transport: TCP (Port), UDP (Port)\n3 — Network: IP-Adressen, Router, ICMP\n2 — Data Link: MAC-Adressen, Switches, ARP\n1 — Physical: Kabel, Stecker, Signale, Hubs\n\nJede Schicht kommuniziert nur mit der Schicht direkt darüber und darunter.',
          },
        },
        {
          title: 'Encapsulation — Einpacken der Daten',
          description:
            'Wenn deine Daten durch die Schichten nach unten wandern, hängt jede Schicht ihren eigenen Header davor — wie ein Brief, der in einen Umschlag kommt, der in ein Paket kommt, das in einen Container kommt. Das nennt man Encapsulation. Layer 4 packt die Daten in ein TCP-Segment (mit Port-Nummern), Layer 3 hängt einen IP-Header davor (mit Quell- und Ziel-IP), Layer 2 packt einen Frame drum (mit MAC-Adressen). Beim Empfänger wird Hülle für Hülle wieder geöffnet — De-Encapsulation. Jede Zwischenstation (Switch, Router) öffnet nur die Schichten, die sie braucht.',
          analogy: 'Wie russische Matroschka-Puppen: Jede Schicht packt die vorherige in eine weitere Hülle ein. Beim Auspacken kommen sie in der umgekehrten Reihenfolge wieder raus.',
          scene: {
            devices: [
              { id: 'sender', type: 'pc', label: 'Absender', position: { x: 80, y: 250 } },
              { id: 'sw', type: 'switch', label: 'Switch\nLayer 2', position: { x: 280, y: 250 } },
              { id: 'router', type: 'router', label: 'Router\nLayer 3', position: { x: 480, y: 250 } },
              { id: 'receiver', type: 'server', label: 'Empfänger', position: { x: 680, y: 250 } },
            ],
            cables: [
              { id: 'c1', from: 'sender', to: 'sw', type: 'ethernet', startPos: { x: 130, y: 250 }, endPos: { x: 240, y: 250 } },
              { id: 'c2', from: 'sw', to: 'router', type: 'ethernet', startPos: { x: 320, y: 250 }, endPos: { x: 440, y: 250 } },
              { id: 'c3', from: 'router', to: 'receiver', type: 'fiber-single', startPos: { x: 520, y: 250 }, endPos: { x: 640, y: 250 } },
            ],
            packets: [
              {
                id: 'encap',
                label: 'Segment',
                color: '#fbbf24',
                hops: [
                  { fromDevice: 'sender', toDevice: 'sw', hint: 'Der PC verpackt die Daten: Application-Daten → Segment (TCP-Header) → Paket (IP-Header) → Frame (MAC-Header). Das nennt man Encapsulation.' },
                  { fromDevice: 'sw', toDevice: 'router', hint: 'Der Switch arbeitet auf Layer 2 — er liest nur den MAC-Header (Frame), nicht den IP-Header. Er leitet den Frame zum Router.' },
                  { fromDevice: 'router', toDevice: 'receiver', hint: 'Der Router öffnet Layer 2 (Frame), liest Layer 3 (IP-Paket), erstellt einen neuen Frame und leitet weiter. Am Ziel wird alles ausgepackt.' },
                ],
              },
            ],
            highlightDevices: ['sw', 'router'],
          },
          modal: {
            title: 'Dateneinheiten pro Schicht (PDU)',
            content: 'Jede Schicht hat einen eigenen Namen für die Daten:\n\nLayer 7-5: Daten (Data)\nLayer 4: Segment (TCP) oder Datagram (UDP)\nLayer 3: Paket (Packet) — enthält IP-Header\nLayer 2: Frame — enthält MAC-Header + Trailer\nLayer 1: Bits — elektrische/optische Signale\n\nBeispiel HTTP-Anfrage:\n[Ethernet-Header | IP-Header | TCP-Header | HTTP GET /index.html | Ethernet-Trailer]\n\nJede Schicht fügt ihren Header VORNE an.',
          },
        },
      ],
    },
    {
      id: '1.1b.2',
      title: 'Das TCP/IP-Modell — 4 Schichten',
      steps: [
        {
          title: 'TCP/IP: Das Modell des Internets',
          description:
            'Das OSI-Modell ist die saubere Theorie aus dem Lehrbuch — das TCP/IP-Modell ist die echte Welt da draußen. Es fasst die 7 OSI-Schichten zu 4 zusammen, weil in der Praxis Layer 5 und 6 nicht klar trennbar sind. Das gesamte Internet, jede Webseite, jede E-Mail, jeder Stream läuft über TCP/IP — nicht über OSI. Trotzdem reden Netzwerker im Alltag in OSI-Begriffen ("Layer-3-Switch", "Layer-2-Problem"), weil OSI die feinere Struktur liefert.',
          analogy: 'OSI = der detaillierte Architekturplan im Schrank. TCP/IP = das Haus, das tatsächlich gebaut wurde. Beide passen zusammen, aber gewohnt wird in TCP/IP.',
          scene: {
            customOverlay: {
              type: 'tcp-ip-model',
              position: { x: 400, y: 260 },
              layerWalk: [
                'Layer 4 — Application: Was du als User tust. Browser ruft eine Webseite auf, E-Mail-Client schickt eine Mail, SSH öffnet eine Shell. HTTP, DNS, SMTP, FTP, SSH leben hier.',
                'Layer 3 — Transport: Liefert die Daten zuverlässig oder schnell. TCP macht alles mit Bestätigung und in richtiger Reihenfolge. UDP feuert los und hofft. Port-Nummern wie :80 oder :53 stehen hier drin.',
                'Layer 2 — Internet: Die Welt der IP-Adressen. Hier entscheidet sich der Weg deines Pakets durchs Netz — über welche Router es geht, welche Hops es nimmt. ICMP (Ping), ARP, OSPF leben hier.',
                'Layer 1 — Network Access: Die letzte Meile. Frames mit MAC-Adressen, das Kabel, das WLAN-Signal. Hier sitzt Ethernet, Wi-Fi, PPP — alles was Bits physisch transportiert.',
              ],
            },
            devices: [],
            cables: [],
          },
          modal: {
            title: 'OSI vs. TCP/IP Vergleich',
            content: 'TCP/IP-Modell → OSI-Äquivalent:\n\n4. Application → Layer 7+6+5\n   HTTP, DNS, SMTP, FTP, SSH\n\n3. Transport → Layer 4\n   TCP (zuverlässig), UDP (schnell)\n\n2. Internet → Layer 3\n   IP, ICMP, ARP, OSPF, BGP\n\n1. Network Access → Layer 2+1\n   Ethernet, Wi-Fi, PPP, Kabel\n\n⚠ In der Praxis sagt man trotzdem "Layer 3 Switch" — OSI-Begriffe sind Standard im Alltag.',
          },
        },
        {
          title: 'Ein Paket durchläuft alle Schichten',
          description:
            'Du tippst google.de in den Browser — und dein Paket macht eine erstaunliche Reise. Erst wandert es durch alle 4 TCP/IP-Schichten in deinem PC nach unten und wird dabei mit Headers eingepackt. Dann reist es durchs Netzwerk, wobei jede Zwischenstation nur die Schichten öffnet, die sie braucht (Switch nur Layer 2, Router auch Layer 3). Beim Webserver wird alles in umgekehrter Reihenfolge wieder ausgepackt, bis nur noch dein "GET /" übrig ist. Dieselbe Reise macht die Antwort zurück.',
          analogy: 'Wie ein Brief: Du schreibst (Application). Du klebst eine Briefmarke und Empfänger drauf (Transport). Du adressierst Stadt + Land (Internet). Du wirfst ihn in den Briefkasten (Network Access). Bei Ankunft wird genau in dieser Reihenfolge wieder ausgepackt.',
          scene: {
            devices: [
              { id: 'user', type: 'pc', label: 'Dein PC\n192.168.1.10', position: { x: 60, y: 250 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 220, y: 250 } },
              { id: 'r1', type: 'router', label: 'Router\nDefault GW', position: { x: 380, y: 250 } },
              { id: 'r2', type: 'router', label: 'ISP Router', position: { x: 540, y: 250 } },
              { id: 'google', type: 'server', label: 'google.de\n142.250.80.46', position: { x: 720, y: 250 } },
            ],
            cables: [
              { id: 'c1', from: 'user', to: 'sw', type: 'ethernet', startPos: { x: 110, y: 250 }, endPos: { x: 180, y: 250 } },
              { id: 'c2', from: 'sw', to: 'r1', type: 'ethernet', startPos: { x: 260, y: 250 }, endPos: { x: 340, y: 250 } },
              { id: 'c3', from: 'r1', to: 'r2', type: 'serial', startPos: { x: 420, y: 250 }, endPos: { x: 500, y: 250 } },
              { id: 'c4', from: 'r2', to: 'google', type: 'fiber-single', startPos: { x: 580, y: 250 }, endPos: { x: 680, y: 250 } },
            ],
            packets: [
              {
                id: 'full',
                label: 'HTTPS',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'user', toDevice: 'sw', hint: '① Application: Browser erstellt HTTPS-Request ② Transport: TCP-Verbindung (Port 443) ③ Internet: Ziel-IP 142.250.80.46 ④ Network Access: Frame mit MAC-Adresse des Switches' },
                  { fromDevice: 'sw', toDevice: 'r1', hint: 'Der Switch (Layer 2) liest den Frame-Header → MAC-Adresse des Routers → leitet auf den richtigen Port weiter' },
                  { fromDevice: 'r1', toDevice: 'r2', hint: 'Der Router (Layer 3) öffnet den Frame, liest das IP-Paket, schaut in die Routing-Tabelle → nächster Hop: ISP-Router' },
                  { fromDevice: 'r2', toDevice: 'google', hint: 'Der ISP-Router leitet über das Backbone zu Google. Der Server packt alle Schichten aus und verarbeitet die Anfrage.' },
                ],
              },
            ],
            highlightDevices: ['user', 'google'],
          },
          modal: {
            title: 'Was passiert an jedem Gerät?',
            content: 'Switch (Layer 2):\n→ Liest nur Frame-Header (MAC)\n→ Ändert nichts am IP-Paket\n\nRouter (Layer 3):\n→ Entfernt alten Frame-Header\n→ Liest IP-Paket (Ziel-IP)\n→ Erstellt neuen Frame-Header\n→ TTL wird um 1 reduziert\n\nServer (Layer 7):\n→ Packt alles aus: Frame → Paket → Segment → HTTP-Daten\n→ Verarbeitet die Anfrage\n→ Schickt Antwort den gleichen Weg zurück\n\nMerke: Ein Switch "denkt" in MAC-Adressen, ein Router "denkt" in IP-Adressen.',
          },
        },
      ],
    },
    {
      id: '1.1b.3',
      title: 'Protokolle pro Schicht',
      steps: [
        {
          title: 'Wichtige Protokolle im Überblick',
          description:
            'Jeder Layer hat seine eigenen Protokolle — wie Sprachen, die nur auf dieser Ebene gesprochen werden. Layer 7 (Application) ist die Welt der User: HTTP fürs Web, DNS für Namen, SMTP für E-Mail, SSH für Fernwartung. Layer 4 (Transport) entscheidet ob zuverlässig (TCP, mit Bestätigung) oder schnell (UDP, ohne). Layer 3 (Network) navigiert dein Paket per IP-Adresse durch die Welt. Layer 2 (Data Link) kümmert sich um die letzte Meile zum Nachbarn. Wer die wichtigsten Protokolle pro Layer kennt, kann jedes Netzwerkproblem grob einordnen — ist es ein DNS-Problem (Layer 7), ein Routing-Problem (Layer 3) oder ein Kabel-Problem (Layer 1)?',
          analogy: 'Wie Abteilungen in einer großen Firma: Marketing spricht Marketing-Sprache, Buchhaltung spricht Buchhaltung. Jede Abteilung hat ihre Fachsprache (Protokoll), aber alle arbeiten zusammen am gleichen Produkt.',
          scene: {
            devices: [
              { id: 'browser', type: 'laptop', label: 'Browser\nHTTP / HTTPS', position: { x: 80, y: 120 } },
              { id: 'dns', type: 'server', label: 'DNS\nPort 53', position: { x: 80, y: 350 } },
              { id: 'sw', type: 'switch', label: 'Switch\nEthernet / 802.1Q', position: { x: 350, y: 230 } },
              { id: 'router', type: 'router', label: 'Router\nIP / ICMP / OSPF', position: { x: 560, y: 120 } },
              { id: 'fw', type: 'firewall', label: 'Firewall\nTCP / UDP Filter', position: { x: 560, y: 350 } },
              { id: 'web', type: 'server', label: 'Webserver\nHTTPS :443', position: { x: 770, y: 230 } },
            ],
            cables: [
              { id: 'c1', from: 'browser', to: 'sw', type: 'ethernet', startPos: { x: 130, y: 150 }, endPos: { x: 310, y: 220 } },
              { id: 'c2', from: 'dns', to: 'sw', type: 'ethernet', startPos: { x: 130, y: 340 }, endPos: { x: 310, y: 250 } },
              { id: 'c3', from: 'sw', to: 'router', type: 'ethernet', startPos: { x: 390, y: 220 }, endPos: { x: 520, y: 140 } },
              { id: 'c4', from: 'sw', to: 'fw', type: 'ethernet', startPos: { x: 390, y: 250 }, endPos: { x: 520, y: 340 } },
              { id: 'c5', from: 'router', to: 'web', type: 'fiber-single', startPos: { x: 600, y: 150 }, endPos: { x: 730, y: 220 } },
              { id: 'c6', from: 'fw', to: 'web', type: 'fiber-single', startPos: { x: 600, y: 340 }, endPos: { x: 730, y: 250 } },
            ],
            packets: [
              {
                id: 'proto',
                label: 'DNS Query',
                color: '#a78bfa',
                hops: [
                  { fromDevice: 'browser', toDevice: 'sw', hint: 'Der Browser braucht die IP von google.de → Layer 7: DNS-Anfrage, Layer 4: UDP Port 53, Layer 3: IP des DNS-Servers' },
                  { fromDevice: 'sw', toDevice: 'dns', hint: 'Der Switch (Layer 2 — Ethernet) leitet den Frame anhand der MAC-Adresse an den DNS-Server' },
                ],
              },
            ],
            highlightDevices: ['browser', 'dns', 'router'],
          },
          modal: {
            title: 'Protokolle pro Layer',
            content: 'Layer 7 (Application):\n• HTTP/HTTPS — Webseiten\n• DNS — Namensauflösung\n• SMTP/POP3/IMAP — E-Mail\n• FTP/SFTP — Dateitransfer\n• SSH — sichere Fernsteuerung\n• DHCP — automatische IP-Vergabe\n\nLayer 4 (Transport):\n• TCP — zuverlässig, mit Bestätigung\n• UDP — schnell, ohne Bestätigung\n\nLayer 3 (Network):\n• IPv4 / IPv6 — Adressierung\n• ICMP — Ping, Traceroute\n• OSPF, EIGRP, BGP — Routing\n• ARP — IP → MAC auflösen\n\nLayer 2 (Data Link):\n• Ethernet (802.3)\n• Wi-Fi (802.11)\n• PPP — serielle Verbindungen\n\nLayer 1 (Physical):\n• Kupfer, Glasfaser, Funk',
          },
        },
      ],
    },
  ],
}

export default lesson
