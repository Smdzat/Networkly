import type { Lesson } from '../../types'

const lesson: Lesson = {
  id: '1.7',
  number: '1.7',
  title: 'Private IPv4-Adressen',
  subtitle: 'Describe private IPv4 addressing',
  subtopics: [
    {
      id: '1.7.1',
      title: 'Private vs. Öffentliche Adressen',
      steps: [
        {
          title: 'Öffentlich vs. Privat: Wie Telefonnummern',
          description:
            'Öffentliche IP-Adressen sind weltweit einzigartig — sie werden von ISPs vergeben und kosten Geld. Private Adressen existieren nur innerhalb deines Netzwerks und werden nicht im Internet geroutet. Dein Router übersetzt per NAT zwischen privat und öffentlich.',
          analogy: 'Öffentliche IP = Deine Handynummer (weltweit einzigartig). Private IP = Durchwahl im Büro (nur intern gültig).',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'PC\n192.168.1.10\n(privat)', position: { x: 80, y: 130 } },
              { id: 'pc2', type: 'laptop', label: 'Laptop\n192.168.1.11\n(privat)', position: { x: 80, y: 310 } },
              { id: 'phone', type: 'phone', label: 'Handy\n192.168.1.12\n(privat)', position: { x: 80, y: 470 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 280, y: 300 } },
              { id: 'router', type: 'router', label: 'Router + NAT\nInnen: 192.168.1.1\nAußen: 85.1.2.3', position: { x: 480, y: 300 } },
              { id: 'internet', type: 'cloud', label: 'Internet', position: { x: 660, y: 200 } },
              { id: 'webserver', type: 'server', label: 'Webserver\n142.250.185.14\n(öffentlich)', position: { x: 660, y: 420 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet' },
              { id: 'c2', from: 'pc2', to: 'sw', type: 'wireless' },
              { id: 'c3', from: 'phone', to: 'sw', type: 'wireless' },
              { id: 'c4', from: 'sw', to: 'router', type: 'ethernet' },
              { id: 'c5', from: 'router', to: 'internet', type: 'serial', label: 'NAT: 85.1.2.3' },
              { id: 'c6', from: 'internet', to: 'webserver', type: 'fiber-single' },
            ],
            packets: [
              {
                id: 'nat',
                label: 'NAT',
                color: '#fbbf24',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw', hint: 'PC schickt Anfrage mit Quell-IP 192.168.1.10 (privat). Funktioniert intern, aber im Internet kennt diese Adresse niemand.' },
                  { fromDevice: 'sw', toDevice: 'router', hint: 'Switch reicht den Frame an den Router — der ist Default-Gateway und gleichzeitig NAT-Gerät.' },
                  { fromDevice: 'router', toDevice: 'internet', hint: 'Router schreibt die Quell-IP um: aus 192.168.1.10 wird 85.1.2.3 (öffentliche IP des Routers). Merkt sich die Übersetzung in der NAT-Tabelle.' },
                  { fromDevice: 'internet', toDevice: 'webserver', hint: 'Webserver bekommt die Anfrage von 85.1.2.3 — er weiß nichts von 192.168.1.10. Die Antwort wird an 85.1.2.3 zurück gehen.' },
                ],
              },
              {
                id: 'nat-back',
                label: 'NAT Reply',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'webserver', toDevice: 'internet', hint: 'Server schickt die Antwort an 85.1.2.3 (öffentliche IP) zurück. Aus seiner Sicht: ganz normale öffentliche Kommunikation.' },
                  { fromDevice: 'internet', toDevice: 'router', hint: 'Antwort kommt am Router an. Er schaut in die NAT-Tabelle: "85.1.2.3:Port X gehört zu 192.168.1.10:Port Y".' },
                  { fromDevice: 'router', toDevice: 'sw', hint: 'Router schreibt die Ziel-IP zurück auf 192.168.1.10 — die private Adresse. Switch übernimmt den Frame.' },
                  { fromDevice: 'sw', toDevice: 'pc1', hint: 'PC bekommt die Antwort. Er hat die ganze Zeit gedacht, er redet direkt mit dem Internet — NAT ist für ihn unsichtbar.' },
                ],
              },
            ],
            highlightDevices: ['router'],
          },
          modal: {
            title: 'NAT — Network Address Translation',
            content: 'Ohne NAT könnte kein privates Gerät im Internet kommunizieren.\n\nSo funktioniert es:\n1. PC sendet: Src=192.168.1.10 → Dst=142.250.185.14\n2. Router übersetzt: Src=85.1.2.3:49152 → Dst=142.250.185.14\n3. Antwort kommt an 85.1.2.3:49152\n4. Router übersetzt zurück → 192.168.1.10\n\nNAT-Typen:\n• Static NAT: 1:1 Zuordnung (Server)\n• Dynamic NAT: Pool öffentlicher IPs\n• PAT (Overload): Viele private → 1 öffentliche (Standard)',
          },
        },
        {
          title: 'Die drei privaten Bereiche (RFC 1918)',
          description:
            'Es gibt genau drei private IP-Bereiche (RFC 1918), die jeder frei nutzen kann. Sie werden NIE im Internet geroutet. ISPs filtern diese Adressen — ein Paket mit Src 192.168.x.x wird vom ISP sofort verworfen.',
          analogy: 'Wie interne Hausnummern in drei verschiedenen Wohnanlagen — jede kann Hausnummer 1-100 haben, aber draußen auf der Straße gelten andere Nummern.',
          scene: {
            devices: [
              { id: 'home', type: 'router', label: 'Zuhause\n192.168.1.0/24\n256 Adressen', position: { x: 100, y: 120 } },
              { id: 'office', type: 'router', label: 'Großunternehmen\n10.0.0.0/8\n16 Mio Adressen', position: { x: 100, y: 350 } },
              { id: 'medium', type: 'router', label: 'Mittelstand\n172.16.0.0/12\n1 Mio Adressen', position: { x: 100, y: 500 } },
              { id: 'fw', type: 'firewall', label: 'Firewall\n+ NAT', position: { x: 370, y: 310 } },
              { id: 'isp', type: 'cloud', label: 'ISP\nfiltert RFC1918', position: { x: 560, y: 310 } },
              { id: 'internet', type: 'cloud', label: 'Internet\nnur öffentliche IPs', position: { x: 740, y: 310 } },
            ],
            cables: [
              { id: 'c1', from: 'home', to: 'fw', type: 'ethernet' },
              { id: 'c2', from: 'office', to: 'fw', type: 'ethernet' },
              { id: 'c3', from: 'medium', to: 'fw', type: 'ethernet' },
              { id: 'c4', from: 'fw', to: 'isp', type: 'serial' },
              { id: 'c5', from: 'isp', to: 'internet', type: 'fiber-single' },
            ],
            highlightDevices: ['home', 'office', 'medium'],
          },
          modal: {
            title: 'RFC 1918 — Private Bereiche',
            content: 'Klasse A: 10.0.0.0/8\n→ 10.0.0.0 – 10.255.255.255\n→ 16.777.214 Hosts\n→ Großunternehmen, Datacenter\n\nKlasse B: 172.16.0.0/12\n→ 172.16.0.0 – 172.31.255.255\n→ 1.048.574 Hosts\n→ Mittelständische Unternehmen\n\nKlasse C: 192.168.0.0/16\n→ 192.168.0.0 – 192.168.255.255\n→ 65.534 Hosts\n→ Heimnetzwerke, kleine Büros\n\nWeitere spezielle Bereiche:\n• 127.0.0.0/8 — Loopback\n• 169.254.0.0/16 — APIPA (kein DHCP)\n• 100.64.0.0/10 — Carrier-Grade NAT',
          },
        },
      ],
    },
  ],
}

export default lesson
