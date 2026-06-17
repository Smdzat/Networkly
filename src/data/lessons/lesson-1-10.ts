import type { Lesson } from '../../types'

const lesson: Lesson = {
  id: '1.10',
  number: '1.10',
  title: 'IP-Parameter prüfen (OS)',
  subtitle: 'Verify IP parameters for Client OS',
  subtopics: [
    {
      id: '1.10.1',
      title: 'Windows: ipconfig',
      steps: [
        {
          title: 'Windows: ipconfig & Troubleshooting',
          description:
            'Auf Windows öffnest du CMD und tippst "ipconfig" für die Basics oder "ipconfig /all" für alles. Wichtige Werte: IP-Adresse, Subnetzmaske, Default Gateway, DNS-Server, DHCP-Status. Mit "ping" und "tracert" prüfst du die Erreichbarkeit.',
          scene: {
            devices: [
              { id: 'pc', type: 'pc', label: 'Windows PC\n192.168.1.10/24\nipconfig /all', position: { x: 80, y: 270 } },
              { id: 'sw', type: 'switch', label: 'Switch\nVLAN 1', position: { x: 280, y: 270 } },
              { id: 'router', type: 'router', label: 'Default Gateway\n192.168.1.1', position: { x: 470, y: 270 } },
              { id: 'dns', type: 'server', label: 'DNS Server\n8.8.8.8', position: { x: 670, y: 160 } },
              { id: 'dhcp', type: 'server', label: 'DHCP Server\n192.168.1.2', position: { x: 670, y: 380 } },
            ],
            cables: [
              { id: 'c1', from: 'pc', to: 'sw', type: 'ethernet' },
              { id: 'c2', from: 'sw', to: 'router', type: 'ethernet' },
              { id: 'c3', from: 'router', to: 'dns', type: 'ethernet' },
              { id: 'c4', from: 'sw', to: 'dhcp', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'ping',
                label: 'ping 8.8.8.8',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'pc', toDevice: 'sw', hint: 'PC schickt einen ICMP Echo Request an 8.8.8.8 — der Befehl "ping" testet ob das Ziel erreichbar ist.' },
                  { fromDevice: 'sw', toDevice: 'router', hint: 'Switch leitet weiter. Da 8.8.8.8 nicht im eigenen Subnetz ist, geht das Paket an den Default-Gateway.' },
                  { fromDevice: 'router', toDevice: 'dns', hint: 'Router schickt das Paket Richtung DNS-Server. Antwortet er, kennt der PC: Internet ist erreichbar, DNS ist erreichbar, Routing klappt.' },
                ],
              },
              {
                id: 'pong',
                label: 'Echo Reply',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'dns', toDevice: 'router', hint: 'Server antwortet mit Echo Reply. Wenn das ankommt, weißt du: alle Layers funktionieren — Kabel, Switch, Routing, DNS-Server.' },
                  { fromDevice: 'router', toDevice: 'sw', hint: 'Antwort kommt zurück über das Default-Gateway. ipconfig hat dem PC vorher gesagt, wer dieser Gateway ist.' },
                  { fromDevice: 'sw', toDevice: 'pc', hint: 'PC sieht: "Reply from 8.8.8.8: time=12ms" — alles grün. Kein Reply? ipconfig prüfen, Gateway-Ping versuchen, DNS testen.' },
                ],
              },
            ],
            highlightDevices: ['pc'],
          },
          modal: {
            title: 'Windows Netzwerk-Befehle',
            content: 'ipconfig → IP, Maske, Gateway\nipconfig /all → + DNS, DHCP, MAC\nipconfig /release → DHCP-Lease freigeben\nipconfig /renew → Neue IP vom DHCP holen\nipconfig /flushdns → DNS-Cache leeren\n\nping 192.168.1.1 → Gateway erreichbar?\nping 8.8.8.8 → Internet erreichbar?\nnslookup google.com → DNS funktioniert?\ntracert 8.8.8.8 → Welchen Weg nimmt das Paket?\n\n⚠ 169.254.x.x = APIPA → Kein DHCP!',
          },
        },
      ],
    },
    {
      id: '1.10.2',
      title: 'macOS & Linux',
      steps: [
        {
          title: 'macOS & Linux: Terminal-Befehle',
          description:
            'Auf macOS nutzt du "ifconfig" oder "networksetup", auf Linux "ip addr" (oder kurz "ip a"). Beide Systeme unterstützen ping, traceroute und nslookup. Die Befehle sind ähnlich, aber mit kleinen Unterschieden.',
          scene: {
            devices: [
              { id: 'mac', type: 'laptop', label: 'MacBook\nifconfig en0\n192.168.1.20', position: { x: 80, y: 170 } },
              { id: 'linux', type: 'pc', label: 'Linux Server\nip addr show\n10.0.0.50', position: { x: 80, y: 400 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 330, y: 280 } },
              { id: 'router', type: 'router', label: 'Router\nGateway', position: { x: 530, y: 280 } },
              { id: 'internet', type: 'cloud', label: 'Internet', position: { x: 720, y: 280 } },
            ],
            cables: [
              { id: 'c1', from: 'mac', to: 'sw', type: 'wireless', label: 'Wi-Fi' },
              { id: 'c2', from: 'linux', to: 'sw', type: 'ethernet', label: 'eth0' },
              { id: 'c3', from: 'sw', to: 'router', type: 'ethernet' },
              { id: 'c4', from: 'router', to: 'internet', type: 'serial' },
            ],
            packets: [
              {
                id: 'trace',
                label: 'traceroute',
                color: '#a78bfa',
                hops: [
                  { fromDevice: 'linux', toDevice: 'sw', hint: 'traceroute schickt Pakete mit künstlich kleiner TTL los. Hop 1: das Paket erreicht den Switch — Switch ist Layer 2, taucht aber nicht in der Trace-Liste auf.' },
                  { fromDevice: 'sw', toDevice: 'router', hint: 'Hop 2: Router. Antwortet mit "TTL exceeded" — traceroute zeigt seine IP an. Erste Zeile in der Ausgabe.' },
                  { fromDevice: 'router', toDevice: 'internet', hint: 'Hop 3: nächster Router im Internet. So Hop für Hop bis zum Ziel — siehst du genau wo es haken könnte.' },
                ],
              },
            ],
            highlightDevices: ['mac', 'linux'],
          },
          modal: {
            title: 'Befehle pro OS',
            content: 'macOS:\n• ifconfig → alle Interfaces (en0, en1 ...)\n• networksetup -listallhardwareports → welches en ist WLAN/Ethernet?\n  (variiert je nach Mac — auf modernen MacBooks ist en0 oft WLAN)\n• scutil --dns → DNS Konfiguration\n• route get default → Default Gateway\n\nLinux:\n• ip addr show (ip a) → Interfaces & IPs\n• ip route → Routing-Tabelle\n• ip link show → Interface Status\n• cat /etc/resolv.conf → DNS\n• ss -tulnp → Offene Ports\n• nmcli device show → NetworkManager\n\nBeide: ping, traceroute, nslookup, dig',
          },
        },
      ],
    },
  ],
}

export default lesson
