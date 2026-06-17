import type { Lesson } from '../../types'

const lesson: Lesson = {
  id: '1.5',
  number: '1.5',
  title: 'TCP vs. UDP',
  subtitle: 'Compare TCP to UDP',
  subtopics: [
    {
      id: '1.5.1',
      title: 'TCP — Zuverlässig & geordnet',
      steps: [
        {
          title: 'TCP: Der 3-Way-Handshake',
          description:
            'TCP (Transmission Control Protocol) stellt sicher, dass alle Daten vollständig und in der richtigen Reihenfolge ankommen. Bevor Daten fließen, wird ein 3-Way-Handshake durchgeführt — wie ein formelles Begrüßungsritual bevor ein Gespräch beginnt.',
          analogy: 'TCP = Einschreiben mit Rückschein: Du bekommst eine Bestätigung, dass alles angekommen ist.',
          scene: {
            devices: [
              { id: 'client', type: 'pc', label: 'Client\n192.168.1.10:49152', position: { x: 60, y: 275 }, labelOffset: { x: 0, y: 82 } },
              { id: 'sw1', type: 'switch', label: 'Access Switch', position: { x: 232, y: 270 }, labelOffset: { x: 0, y: 82 } },
              { id: 'fw', type: 'firewall', label: 'Firewall\nStateful', position: { x: 419, y: 270 }, labelOffset: { x: 0, y: 82 } },
              { id: 'router', type: 'router', label: 'Router', position: { x: 580, y: 270 }, labelOffset: { x: 0, y: 82 } },
              { id: 'server', type: 'server', label: 'Webserver\n93.184.216.34:443', position: { x: 792, y: 275 }, labelOffset: { x: 0, y: 82 } },
            ],
            cables: [
              { id: 'c1', from: 'client', to: 'sw1', type: 'ethernet', startPos: { x: 50, y: 275 }, endPos: { x: 190, y: 275 } },
              { id: 'c2', from: 'sw1', to: 'fw', type: 'ethernet', startPos: { x: 281, y: 275 }, endPos: { x: 400, y: 275 } },
              { id: 'c3', from: 'fw', to: 'router', type: 'ethernet', startPos: { x: 425, y: 275 }, endPos: { x: 575, y: 275 } },
              { id: 'c4', from: 'router', to: 'server', type: 'fiber-single', startPos: { x: 589, y: 275 }, endPos: { x: 759, y: 275 } },
            ],
            packets: [
              {
                id: 'syn',
                label: 'SYN',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'client', toDevice: 'sw1', hint: 'Schritt 1 — der Client startet eine TCP-Verbindung. Er schickt ein SYN: "Ich will reden, meine Sequenznummer ist X."' },
                  { fromDevice: 'sw1', toDevice: 'fw', hint: 'Frame läuft durch den Access-Switch zur Firewall. Die merkt sich diese neue Verbindung in ihrer State-Table.' },
                  { fromDevice: 'fw', toDevice: 'router', hint: 'Firewall lässt das SYN durch und reicht weiter an den Router — der kennt den Weg ins Internet.' },
                  { fromDevice: 'router', toDevice: 'server', hint: 'SYN am Webserver angekommen. Server merkt: "Aha, neue Verbindung — ich antworte gleich."' },
                ],
              },
              {
                id: 'synack',
                label: 'SYN-ACK',
                color: '#fbbf24',
                hops: [
                  { fromDevice: 'server', toDevice: 'router', hint: 'Schritt 2 — der Server schickt SYN-ACK zurück: "Klar, ich bin da! Bestätige dein SYN, hier ist meine Sequenznummer Y."' },
                  { fromDevice: 'router', toDevice: 'fw', hint: 'Antwort kommt über denselben Weg zurück. Stateful Firewall erkennt: das passt zur ausgehenden Verbindung — durchlassen.' },
                  { fromDevice: 'fw', toDevice: 'sw1', hint: 'Switch leitet das SYN-ACK an den richtigen Port — er weiß aus seiner MAC-Tabelle wo der Client sitzt.' },
                  { fromDevice: 'sw1', toDevice: 'client', hint: 'Client hat das SYN-ACK. Jetzt nur noch eine Bestätigung schicken, dann ist die Verbindung offen.' },
                ],
              },
              {
                id: 'ack',
                label: 'ACK',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'client', toDevice: 'sw1', hint: 'Schritt 3 — Client schickt das finale ACK: "Alles klar, los geht\'s!"' },
                  { fromDevice: 'sw1', toDevice: 'fw', hint: 'Letzter Hop des Handshakes. Verbindung wird auf beiden Seiten als "established" markiert.' },
                  { fromDevice: 'fw', toDevice: 'router', hint: 'Firewall: Verbindung ist jetzt "ESTABLISHED" — alle weiteren Pakete dieser Session laufen ohne Re-Check durch.' },
                  { fromDevice: 'router', toDevice: 'server', hint: 'Handshake komplett. Ab jetzt können HTTPS-Daten in beide Richtungen fließen — gesichert und in Reihenfolge.' },
                ],
              },
            ],
            highlightDevices: ['client', 'server'],
          },
          modal: {
            title: '3-Way-Handshake im Detail',
            content: '1. Client → Server: SYN (Seq=100)\n   "Ich will eine Verbindung, meine Sequenz startet bei 100"\n\n2. Server → Client: SYN-ACK (Seq=300, Ack=101)\n   "OK! Meine Sequenz startet bei 300, ich erwarte dein Byte 101"\n\n3. Client → Server: ACK (Seq=101, Ack=301)\n   "Alles klar, los geht\'s!"\n\nDanach fließen Daten. Zum Beenden: 4-Way-Teardown (FIN/ACK).',
          },
        },
        {
          title: 'TCP garantiert die Reihenfolge',
          description:
            'TCP nummeriert jedes Segment mit einer Sequenznummer. Kommt ein Segment in falscher Reihenfolge, wird es richtig einsortiert. Geht eins verloren, fordert der Empfänger es erneut an (Retransmission). Flow Control mit Window Size verhindert Überflutung.',
          analogy: 'Wie ein Puzzle: Jedes Teil ist nummeriert. Fehlt eines, weißt du genau welches und forderst es nach.',
          scene: {
            devices: [
              { id: 'client', type: 'laptop', label: 'Client\nschickt Datei', position: { x: 80, y: 270 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 240, y: 270 } },
              { id: 'r1', type: 'router', label: 'Router 1', position: { x: 400, y: 160 } },
              { id: 'r2', type: 'router', label: 'Router 2', position: { x: 400, y: 380 } },
              { id: 'server', type: 'server', label: 'Server\nsortiert & bestätigt', position: { x: 600, y: 270 } },
            ],
            cables: [
              { id: 'c1', from: 'client', to: 'sw', type: 'ethernet' },
              { id: 'c2', from: 'sw', to: 'r1', type: 'ethernet', label: 'Pfad A' },
              { id: 'c3', from: 'sw', to: 'r2', type: 'ethernet', label: 'Pfad B' },
              { id: 'c4', from: 'r1', to: 'server', type: 'ethernet' },
              { id: 'c5', from: 'r2', to: 'server', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'seg1',
                label: 'Seq #1',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'client', toDevice: 'sw', hint: 'TCP zerlegt die Datei in nummerierte Segmente. Hier startet Seq #1 — Switch reicht weiter, Empfänger weiß später woran er ist.' },
                  { fromDevice: 'sw', toDevice: 'r1', hint: 'Pfad A wird gewählt. Bei TCP ist das egal — Reihenfolge wird auf der anderen Seite anhand der Seq-Nummer wiederhergestellt.' },
                  { fromDevice: 'r1', toDevice: 'server', hint: 'Server empfängt Seq #1, prüft die Reihenfolge, sortiert ein. Fehlt etwas, fordert er es per ACK gezielt nach.' },
                ],
              },
              {
                id: 'ack1',
                label: 'ACK',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'server', toDevice: 'r1', hint: 'Server bestätigt: "ACK für Seq #1 — alles bis Byte X erhalten." Damit weiß der Client: kein Nachsenden nötig.' },
                  { fromDevice: 'r1', toDevice: 'sw', hint: 'ACK läuft zurück. Bleibt eine ACK aus, sendet TCP das Segment automatisch nochmal (Retransmission).' },
                  { fromDevice: 'sw', toDevice: 'client', hint: 'Client hat die Bestätigung — er kann den Speicher für Seq #1 freigeben und das nächste Segment hinterherschicken.' },
                ],
              },
            ],
            highlightDevices: ['server'],
          },
          modal: {
            title: 'TCP Mechanismen',
            content: 'Sequenznummern:\n→ Jedes Byte hat eine Nummer → Reihenfolge garantiert\n\nACK (Acknowledgment):\n→ Empfänger bestätigt empfangene Bytes\n→ "ACK 1001" = "Ich habe alles bis Byte 1000"\n\nRetransmission:\n→ Keine ACK erhalten? → Segment erneut senden\n\nWindow Size (Flow Control):\n→ Empfänger sagt: "Schick mir max. 64KB auf einmal"\n→ Verhindert Überlastung\n\nCongestion Control:\n→ Slow Start → Exponentielles Wachstum → Steady State',
          },
        },
      ],
    },
    {
      id: '1.5.2',
      title: 'UDP — Schnell & leichtgewichtig',
      steps: [
        {
          title: 'UDP: Einfach losschicken',
          description:
            'UDP (User Datagram Protocol) schickt Daten ohne Handshake, ohne Bestätigung, ohne Reihenfolge. Der Header ist nur 8 Byte klein (TCP: 20+ Byte). Perfekt für Anwendungen, wo Geschwindigkeit wichtiger ist als Perfektion — ein verlorenes Video-Frame stört weniger als eine Sekunde Verzögerung.',
          analogy: 'UDP = Postkarte: Einfach einwerfen und hoffen, dass sie ankommt. Schnell und billig, aber kein Tracking.',
          scene: {
            devices: [
              { id: 'client', type: 'laptop', label: 'Client\nDNS Query', position: { x: 80, y: 200 } },
              { id: 'phone', type: 'phone', label: 'IP-Telefon\nVoIP (RTP)', position: { x: 80, y: 400 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 280, y: 300 } },
              { id: 'router', type: 'router', label: 'Router', position: { x: 460, y: 300 } },
              { id: 'dns', type: 'server', label: 'DNS Server\nUDP :53', position: { x: 660, y: 170 } },
              { id: 'voip', type: 'server', label: 'VoIP Server\nUDP :5060', position: { x: 660, y: 430 } },
            ],
            cables: [
              { id: 'c1', from: 'client', to: 'sw', type: 'ethernet' },
              { id: 'c2', from: 'phone', to: 'sw', type: 'ethernet' },
              { id: 'c3', from: 'sw', to: 'router', type: 'ethernet' },
              { id: 'c4', from: 'router', to: 'dns', type: 'ethernet', label: 'UDP' },
              { id: 'c5', from: 'router', to: 'voip', type: 'ethernet', label: 'UDP' },
            ],
            packets: [
              {
                id: 'dns',
                label: 'DNS Query',
                color: '#fbbf24',
                hops: [
                  { fromDevice: 'client', toDevice: 'sw', hint: 'Client schickt eine DNS-Anfrage als UDP-Paket an Port 53 — kein Handshake, kein Warten, einfach raus.' },
                  { fromDevice: 'sw', toDevice: 'router', hint: 'Switch leitet weiter. UDP-Paket ist winzig: nur 8 Byte Header plus Frage.' },
                  { fromDevice: 'router', toDevice: 'dns', hint: 'DNS-Server bekommt die Frage und antwortet mit einem einzelnen UDP-Paket zurück. Geht etwas verloren? Pech — Client fragt einfach nochmal.' },
                ],
              },
              {
                id: 'dns-reply',
                label: 'DNS Reply',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'dns', toDevice: 'router', hint: 'DNS-Server antwortet mit der IP — auch wieder ein einzelnes UDP-Paket. Kein ACK nötig.' },
                  { fromDevice: 'router', toDevice: 'sw', hint: 'Bei UDP gibt es keine "Verbindung" — Antwort ist einfach ein neues Paket, das zufällig zur Frage passt.' },
                  { fromDevice: 'sw', toDevice: 'client', hint: 'Client hat die IP. Komplette Anfrage und Antwort: 2 Pakete, ~100 Byte. TCP würde das mit Handshake auf 5+ Pakete bringen.' },
                ],
              },
            ],
            highlightDevices: ['dns', 'voip'],
          },
          modal: {
            title: 'UDP Header — nur 8 Byte',
            content: 'UDP Header:\n• Source Port (2 Byte)\n• Destination Port (2 Byte)\n• Length (2 Byte)\n• Checksum (2 Byte)\n= 8 Byte total\n\nTCP Header: 20+ Byte (Seq, Ack, Flags, Window...)\n\nUDP ist "fire and forget":\n→ Kein Handshake\n→ Kein ACK\n→ Kein Retransmit\n→ Kein Flow Control\n→ Kein Congestion Control',
          },
        },
        {
          title: 'TCP vs. UDP: Wann was?',
          description:
            'TCP wird genutzt, wenn jedes Byte ankommen muss: Webseiten, E-Mails, Datei-Downloads, SSH. UDP wird genutzt, wenn Echtzeit wichtiger ist als Perfektion: Streaming, Gaming, VoIP, DNS. Manche Protokolle wie DNS nutzen beides — UDP für kleine Anfragen, TCP für große Zone-Transfers.',
          analogy: 'TCP = Einschreiben (sicher, aber langsam). UDP = Postkarte (schnell, aber unsicher). Beide haben ihren Platz.',
          scene: {
            devices: [
              { id: 'user', type: 'laptop', label: 'Benutzer', position: { x: 80, y: 270 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 240, y: 270 } },
              { id: 'fw', type: 'firewall', label: 'Firewall', position: { x: 400, y: 270 } },
              { id: 'web', type: 'server', label: 'Webserver\nTCP :443\nHTTPS', position: { x: 600, y: 100 } },
              { id: 'mail', type: 'server', label: 'Mailserver\nTCP :25\nSMTP', position: { x: 730, y: 230 } },
              { id: 'stream', type: 'cloud', label: 'Streaming\nUDP :443\nQUIC', position: { x: 600, y: 380 } },
              { id: 'dns', type: 'server', label: 'DNS\nUDP/TCP :53', position: { x: 730, y: 430 } },
            ],
            cables: [
              { id: 'c1', from: 'user', to: 'sw', type: 'ethernet' },
              { id: 'c2', from: 'sw', to: 'fw', type: 'ethernet' },
              { id: 'c3', from: 'fw', to: 'web', type: 'ethernet', label: 'TCP' },
              { id: 'c4', from: 'fw', to: 'mail', type: 'ethernet', label: 'TCP' },
              { id: 'c5', from: 'fw', to: 'stream', type: 'ethernet', label: 'UDP' },
              { id: 'c6', from: 'fw', to: 'dns', type: 'ethernet', label: 'UDP/TCP' },
            ],
            packets: [
              {
                id: 'https',
                label: 'HTTPS',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'user', toDevice: 'sw', hint: 'Browser öffnet google.de — TCP-Verbindung zu Port 443 (HTTPS). TCP, weil der ganze HTML-Inhalt vollständig ankommen muss.' },
                  { fromDevice: 'sw', toDevice: 'fw', hint: 'Firewall prüft: ist HTTPS für diesen User erlaubt? Ja → Verbindung wird in der State-Table notiert.' },
                  { fromDevice: 'fw', toDevice: 'web', hint: 'Webserver schickt die Seite zurück. Bei jeder Antwort kommt ein TCP-ACK dazu — kein Byte geht verloren.' },
                ],
              },
            ],
            highlightCables: ['c3', 'c4', 'c5', 'c6'],
          },
          modal: {
            title: 'TCP vs. UDP — Vollständige Übersicht',
            content: 'TCP-Protokolle:\n• HTTP/HTTPS :80/:443 — Web\n• FTP :20/:21 — Dateien\n• SSH :22 — Sicherer Zugang\n• Telnet :23 — Unsicherer Zugang\n• SMTP :25 — E-Mail senden\n• POP3 :110 — E-Mail empfangen\n• LDAP :389 — Verzeichnisdienst\n\nUDP-Protokolle:\n• DHCP :67/:68 — IP vergeben\n• TFTP :69 — Einfacher Dateitransfer\n• SNMP :161 — Monitoring\n• RTP — Voice/Video\n• QUIC :443 — Modernes HTTP/3\n\nBeide (TCP & UDP): DNS (:53)\n→ Abfragen meist per UDP, Zone-Transfer & große Antworten per TCP',
          },
        },
      ],
    },
  ],
}

export default lesson
