import type { Lesson } from '../../types'

const lesson: Lesson = {
  id: '1.2',
  number: '1.2',
  title: 'Netzwerk-Topologien',
  subtitle: 'Describe characteristics of network topology architectures',
  subtopics: [
    {
      id: '1.2.1',
      title: 'Two-Tier (Collapsed Core)',
      steps: [
        {
          title: 'Zwei Etagen: Access + Distribution',
          description:
            'Die einfachste Firmen-Architektur hat zwei Schichten. Unten die Access-Schicht — dort hängen PCs, Drucker und IP-Telefone an Switches. Oben die Distribution-Schicht (die gleichzeitig Core ist) — sie verbindet alle Access-Switches, routet zwischen VLANs und bietet Redundanz.',
          analogy: 'Wie ein Bürogebäude: Erdgeschoss (Access) hat die Arbeitsplätze, die Etage darüber (Distribution) verbindet alle Abteilungen.',
          scene: {
            devices: [
              { id: 'dist1', type: 'l3switch', label: 'Distribution 1\n(Collapsed Core)', position: { x: 280, y: 70 } },
              { id: 'dist2', type: 'l3switch', label: 'Distribution 2\n(Redundanz)', position: { x: 530, y: 70 } },
              { id: 'acc1', type: 'switch', label: 'Access SW 1\nVLAN 10', position: { x: 130, y: 250 } },
              { id: 'acc2', type: 'switch', label: 'Access SW 2\nVLAN 20', position: { x: 400, y: 250 } },
              { id: 'acc3', type: 'switch', label: 'Access SW 3\nVLAN 30', position: { x: 670, y: 250 } },
              { id: 'pc1', type: 'pc', label: 'Buchhaltung', position: { x: 80, y: 420 } },
              { id: 'pc2', type: 'pc', label: 'Buchhaltung', position: { x: 200, y: 420 } },
              { id: 'pc3', type: 'laptop', label: 'Marketing', position: { x: 350, y: 420 } },
              { id: 'printer', type: 'printer', label: 'Drucker', position: { x: 470, y: 420 } },
              { id: 'phone', type: 'phone', label: 'IP-Telefon', position: { x: 620, y: 420 } },
              { id: 'pc4', type: 'pc', label: 'IT-Admin', position: { x: 740, y: 420 } },
            ],
            cables: [
              { id: 'c1', from: 'dist1', to: 'acc1', type: 'fiber-single', label: 'Trunk' },
              { id: 'c2', from: 'dist1', to: 'acc2', type: 'fiber-single' },
              { id: 'c3', from: 'dist1', to: 'acc3', type: 'fiber-single' },
              { id: 'c4', from: 'dist2', to: 'acc1', type: 'fiber-single' },
              { id: 'c5', from: 'dist2', to: 'acc2', type: 'fiber-single' },
              { id: 'c6', from: 'dist2', to: 'acc3', type: 'fiber-single' },
              { id: 'c7', from: 'dist1', to: 'dist2', type: 'fiber-single', label: 'Inter-Switch' },
              { id: 'c8', from: 'acc1', to: 'pc1', type: 'ethernet' },
              { id: 'c9', from: 'acc1', to: 'pc2', type: 'ethernet' },
              { id: 'c10', from: 'acc2', to: 'pc3', type: 'ethernet' },
              { id: 'c11', from: 'acc2', to: 'printer', type: 'ethernet' },
              { id: 'c12', from: 'acc3', to: 'phone', type: 'ethernet' },
              { id: 'c13', from: 'acc3', to: 'pc4', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'vlan',
                label: 'Inter-VLAN',
                color: '#fbbf24',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'acc1', hint: 'Buchhaltungs-PC schickt Daten an einen Marketing-Drucker. Frame geht zuerst zum Access-Switch — der ist ihr direkter Anschlusspunkt im VLAN 10.' },
                  { fromDevice: 'acc1', toDevice: 'dist1', hint: 'Access-Switch erkennt: Ziel liegt in einem anderen VLAN. Er reicht den Frame über den Trunk zum Distribution-Switch — der hat Layer-3-Funktion und kann routen.' },
                  { fromDevice: 'dist1', toDevice: 'acc2', hint: 'Distribution-Switch routet zwischen VLAN 10 (Buchhaltung) und VLAN 20 (Marketing). Er ist der Collapsed Core — Distribution und Core in einem Gerät.' },
                  { fromDevice: 'acc2', toDevice: 'printer', hint: 'Marketing-Access-Switch liefert den Frame an den Drucker im VLAN 20 aus. Two-Tier-Design: nur 2 Hops zwischen beliebigen Geräten.' },
                ],
              },
            ],
            highlightDevices: ['dist1', 'dist2'],
          },
          modal: {
            title: 'Collapsed Core',
            content: 'Bei Two-Tier übernimmt die Distribution-Schicht gleichzeitig die Core-Funktion (daher "Collapsed Core").\n\nVorteile:\n• Weniger Hardware, günstigere Kosten\n• Einfacher zu verwalten\n• Perfekt für kleine/mittlere Standorte (< 200 User)\n\nNachteile:\n• Skaliert nicht gut für große Netzwerke\n• Distribution-Switches können zum Bottleneck werden',
          },
        },
      ],
    },
    {
      id: '1.2.2',
      title: 'Three-Tier Architecture',
      steps: [
        {
          title: 'Drei Etagen: Access + Distribution + Core',
          description:
            'Für größere Netzwerke braucht man eine dritte Schicht: den Core. Der Core ist das Hochgeschwindigkeits-Rückgrat — er verbindet mehrere Distribution-Blöcke mit 40G/100G Links. Hier zählt nur eins: Speed! Kein Filtering, keine ACLs, nur Forwarding.',
          analogy: 'Core = Autobahn zwischen Städten (Distribution). Die Städte selbst haben Straßen (Access) zu den Häusern.',
          scene: {
            devices: [
              { id: 'core1', type: 'l3switch', label: 'Core 1\n40G Backbone', position: { x: 300, y: 50 } },
              { id: 'core2', type: 'l3switch', label: 'Core 2\n(Redundanz)', position: { x: 530, y: 50 } },
              { id: 'dist1', type: 'l3switch', label: 'Distribution\nGebäude A', position: { x: 150, y: 200 } },
              { id: 'dist2', type: 'l3switch', label: 'Distribution\nGebäude B', position: { x: 420, y: 200 } },
              { id: 'dist3', type: 'l3switch', label: 'Distribution\nGebäude C', position: { x: 680, y: 200 } },
              { id: 'acc1', type: 'switch', label: 'Access\nEtage 1', position: { x: 80, y: 360 } },
              { id: 'acc2', type: 'switch', label: 'Access\nEtage 2', position: { x: 230, y: 360 } },
              { id: 'acc3', type: 'switch', label: 'Access\nEtage 1', position: { x: 370, y: 360 } },
              { id: 'acc4', type: 'switch', label: 'Access\nEtage 2', position: { x: 500, y: 360 } },
              { id: 'acc5', type: 'switch', label: 'Access', position: { x: 680, y: 360 } },
            ],
            cables: [
              { id: 'c1', from: 'core1', to: 'dist1', type: 'fiber-single', label: '40G' },
              { id: 'c2', from: 'core1', to: 'dist2', type: 'fiber-single', label: '40G' },
              { id: 'c3', from: 'core1', to: 'dist3', type: 'fiber-single' },
              { id: 'c4', from: 'core2', to: 'dist1', type: 'fiber-single' },
              { id: 'c5', from: 'core2', to: 'dist2', type: 'fiber-single' },
              { id: 'c6', from: 'core2', to: 'dist3', type: 'fiber-single' },
              { id: 'c7', from: 'core1', to: 'core2', type: 'fiber-single', label: '100G' },
              { id: 'c8', from: 'dist1', to: 'acc1', type: 'ethernet' },
              { id: 'c9', from: 'dist1', to: 'acc2', type: 'ethernet' },
              { id: 'c10', from: 'dist2', to: 'acc3', type: 'ethernet' },
              { id: 'c11', from: 'dist2', to: 'acc4', type: 'ethernet' },
              { id: 'c12', from: 'dist3', to: 'acc5', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'cross',
                label: 'OSPF Route',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'acc1', toDevice: 'dist1', hint: 'PC in Etage 1 von Gebäude A sendet Daten zu einem Server in Gebäude C. Frame steigt erst zum Distribution-Switch von Gebäude A.' },
                  { fromDevice: 'dist1', toDevice: 'core1', hint: 'Distribution-Switch hat keine direkte Verbindung zu Gebäude C — er gibt das Paket dem Core. OSPF kennt den Weg, das Routing-Protokoll wählt den schnellsten Pfad.' },
                  { fromDevice: 'core1', toDevice: 'dist3', hint: 'Core-Switch routet mit 40 Gbit/s zwischen den Gebäuden. Im Three-Tier-Design ist der Core das pure Backbone — keine ACLs, keine Filter, nur Speed.' },
                  { fromDevice: 'dist3', toDevice: 'acc5', hint: 'Distribution in Gebäude C liefert weiter an den richtigen Access-Switch. Drei Schichten: Access → Distribution → Core → Distribution → Access. Skalierbar für Campus-Netze.' },
                ],
              },
            ],
            highlightDevices: ['core1', 'core2'],
          },
          modal: {
            title: 'Core Layer Design-Regeln',
            content: 'Der Core Layer hat strikte Regeln:\n\n✓ Nur Hochgeschwindigkeits-Forwarding\n✓ Redundanz (mindestens 2 Core-Switches)\n✓ Keine Access-Ports, keine User direkt\n✓ Keine ACLs oder Policy-Filtering\n\n✗ Kein Spanning Tree (nutzt L3 Routing)\n✗ Keine langsamen Links\n\nTypische Geschwindigkeiten: 40G oder 100G',
          },
        },
      ],
    },
    {
      id: '1.2.3',
      title: 'Spine-Leaf',
      steps: [
        {
          title: 'Spine-Leaf: jeder Leaf an jeden Spine',
          description:
            'Die Verkabelungs-Regel ist simpel: jeder Leaf-Switch (unten, einer pro Rack) wird mit JEDEM Spine-Switch (oben) verbunden — Spines untereinander gar nicht, Leafs untereinander auch nicht. Warum dieser Aufwand? Drei Gründe: (1) Redundanz — fällt ein Spine aus, läuft der Verkehr einfach über den anderen weiter. (2) Mehr Bandbreite — beide Uplinks eines Leafs sind gleichzeitig aktiv (ECMP). (3) Gleiche Distanz — jeder Server erreicht jeden anderen über genau einen Spine, egal in welchem Rack. So ist die Latenz für alle gleich und vorhersehbar.',
          analogy: 'Wie ein Flughafen mit zwei großen Verteiler-Hallen: von jedem Gate (Leaf) führt ein Weg in jede Halle (Spine). Egal welche du nimmst — du erreichst jedes andere Gate gleich schnell. Ist eine Halle gesperrt, nimmst du die andere.',
          scene: {
            devices: [
              { id: 'spine1', type: 'l3switch', label: 'Spine 1\n100G', position: { x: 340, y: 70 } },
              { id: 'spine2', type: 'l3switch', label: 'Spine 2\n100G', position: { x: 540, y: 70 } },
              { id: 'leaf1', type: 'switch', label: 'Leaf 1\nRack A', position: { x: 140, y: 290 } },
              { id: 'leaf2', type: 'switch', label: 'Leaf 2\nRack B', position: { x: 340, y: 290 } },
              { id: 'leaf3', type: 'switch', label: 'Leaf 3\nRack C', position: { x: 540, y: 290 } },
              { id: 'leaf4', type: 'switch', label: 'Leaf 4\nRack D', position: { x: 740, y: 290 } },
              { id: 'srv1', type: 'server', label: 'Web Cluster', position: { x: 140, y: 470 } },
              { id: 'srv2', type: 'server', label: 'App Server', position: { x: 340, y: 470 } },
              { id: 'srv3', type: 'server', label: 'Database', position: { x: 540, y: 470 } },
              { id: 'srv4', type: 'server', label: 'Storage', position: { x: 740, y: 470 } },
            ],
            cables: [
              { id: 'c1', from: 'spine1', to: 'leaf1', type: 'fiber-single' },
              { id: 'c2', from: 'spine1', to: 'leaf2', type: 'fiber-single' },
              { id: 'c3', from: 'spine1', to: 'leaf3', type: 'fiber-single' },
              { id: 'c4', from: 'spine1', to: 'leaf4', type: 'fiber-single' },
              { id: 'c5', from: 'spine2', to: 'leaf1', type: 'fiber-single' },
              { id: 'c6', from: 'spine2', to: 'leaf2', type: 'fiber-single' },
              { id: 'c7', from: 'spine2', to: 'leaf3', type: 'fiber-single' },
              { id: 'c8', from: 'spine2', to: 'leaf4', type: 'fiber-single' },
              { id: 'c9', from: 'leaf1', to: 'srv1', type: 'ethernet', label: '25G' },
              { id: 'c10', from: 'leaf2', to: 'srv2', type: 'ethernet', label: '25G' },
              { id: 'c11', from: 'leaf3', to: 'srv3', type: 'ethernet', label: '25G' },
              { id: 'c12', from: 'leaf4', to: 'srv4', type: 'ethernet', label: '25G' },
            ],
            packets: [
              {
                id: 'ecmp',
                label: 'Flow',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'srv1', toDevice: 'leaf1', hint: 'Der Web-Server (Rack A) will Daten von der Database (Rack C). Erst geht der Frame an seinen eigenen Top-of-Rack-Switch, Leaf 1 — direkt mit 25G angebunden.' },
                  { fromDevice: 'leaf1', toDevice: 'spine1', hint: 'Schau auf die Verkabelung: Leaf 1 hat ZWEI Uplinks — einen zu Spine 1 und einen zu Spine 2 (hervorgehoben). Beide sind aktiv; ECMP verteilt die Last. Dieser Flow nimmt Spine 1.' },
                  { fromDevice: 'spine1', toDevice: 'leaf3', hint: 'Spine 1 reicht das Paket runter zu Leaf 3 (Rack C). Spines verbinden NUR Leafs — nie einen Spine mit einem anderen. Darum liegt zwischen zwei Racks immer genau EIN Spine.' },
                  { fromDevice: 'leaf3', toDevice: 'srv3', hint: 'Angekommen bei der Database. Würde Spine 1 jetzt ausfallen, liefe exakt derselbe Verkehr über Spine 2 weiter — ohne Unterbrechung. Das ist der Sinn der vollen Vermaschung.' },
                ],
              },
            ],
            highlightCables: ['c1', 'c5'],
          },
          modal: {
            title: 'Warum ist jeder Leaf mit jedem Spine verbunden?',
            content: 'Die Verkabelungs-Regel:\n• Jeder Leaf → zu JEDEM Spine\n• Spines untereinander → NICHT verbunden\n• Leafs untereinander → NICHT verbunden\n• Server hängen nur an Leafs (Top-of-Rack)\n\nWarum dieser Full-Mesh?\n1. Redundanz: Fällt ein Spine aus, übernehmen die anderen sofort.\n2. Bandbreite: Alle Uplinks sind gleichzeitig aktiv (ECMP-Load-Balancing).\n3. Gleiche Distanz: Jeder Server erreicht jeden anderen über genau einen Spine → vorhersehbare Latenz.\n\nECMP = Equal Cost Multi-Path: alle Wege zum Ziel sind gleich gut, der Traffic wird gleichmäßig verteilt.\nUnderlay oft BGP, Overlay oft VXLAN/EVPN.',
          },
        },
      ],
    },
    {
      id: '1.2.4',
      title: 'WAN',
      steps: [
        {
          title: 'WAN: Das Weitverkehrsnetz',
          description:
            'Ein WAN (Wide Area Network) verbindet weit entfernte Standorte — z.B. Büros in verschiedenen Städten. Dafür gibt es verschiedene Techniken: MPLS ist ein privates, vom Provider verwaltetes Netz (nicht über das offene Internet). VPN-Tunnel (z.B. IPsec) verschlüsseln die Daten und laufen über das normale Internet. SD-WAN bündelt mehrere Leitungen intelligent. So werden entfernte LANs zu einem zusammenhängenden Netzwerk.',
          analogy: 'LAN = dein Büro in einem Gebäude. WAN = die Autobahn zwischen Büros in verschiedenen Städten.',
          scene: {
            devices: [
              { id: 'fw1', type: 'firewall', label: 'FW Berlin', position: { x: 80, y: 160 } },
              { id: 'r1', type: 'router', label: 'Berlin Router\nHQ', position: { x: 80, y: 330 } },
              { id: 'mpls', type: 'cloud', label: 'MPLS / Internet\nWAN', position: { x: 380, y: 250 } },
              { id: 'r2', type: 'router', label: 'München Router\nBranch', position: { x: 660, y: 160 } },
              { id: 'r3', type: 'router', label: 'Hamburg Router\nBranch', position: { x: 660, y: 350 } },
              { id: 'sw2', type: 'switch', label: 'LAN München', position: { x: 800, y: 160 } },
              { id: 'sw3', type: 'switch', label: 'LAN Hamburg', position: { x: 800, y: 350 } },
            ],
            cables: [
              { id: 'c1', from: 'fw1', to: 'r1', type: 'ethernet' },
              { id: 'c2', from: 'r1', to: 'mpls', type: 'serial', label: 'MPLS VPN' },
              { id: 'c3', from: 'mpls', to: 'r2', type: 'serial', label: 'IPsec Tunnel' },
              { id: 'c4', from: 'mpls', to: 'r3', type: 'serial', label: 'IPsec Tunnel' },
              { id: 'c5', from: 'r2', to: 'sw2', type: 'ethernet' },
              { id: 'c6', from: 'r3', to: 'sw3', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'vpn',
                label: 'IPsec VPN',
                color: '#a78bfa',
                hops: [
                  { fromDevice: 'r1', toDevice: 'mpls', hint: 'Berliner HQ-Router schickt Daten in Richtung München. Per IPsec wird das Paket vor dem Versand verschlüsselt — niemand zwischen den Standorten kann mitlesen.' },
                  { fromDevice: 'mpls', toDevice: 'r2', hint: 'MPLS-Backbone leitet das verschlüsselte Paket zum Münchner Branch-Router. Der Provider sieht nur die Hülle, nicht den Inhalt.' },
                  { fromDevice: 'r2', toDevice: 'sw2', hint: 'Branch-Router entschlüsselt das Paket und gibt es ins LAN München weiter. Aus Sicht der LANs sind beide Standorte ein einziges Netzwerk.' },
                ],
              },
            ],
            highlightCables: ['c2', 'c3', 'c4'],
          },
          modal: {
            title: 'WAN-Technologien',
            content: 'Gängige WAN-Technologien:\n\n• MPLS: Provider-managed, QoS-garantiert, teuer\n• Internet VPN (IPsec): Günstig, aber best-effort\n• SD-WAN: Intelligent, nutzt mehrere Links, zentral gesteuert\n• Metro Ethernet: Ethernet-Dienst vom Provider\n• Leased Line: Dedizierte Punkt-zu-Punkt Verbindung\n\nModern: SD-WAN ersetzt zunehmend klassisches MPLS.',
          },
        },
      ],
    },
    {
      id: '1.2.5',
      title: 'SOHO',
      steps: [
        {
          title: 'SOHO: Dein Heimnetzwerk',
          description:
            'SOHO steht für Small Office / Home Office. Das typische Netzwerk bei dir zuhause: Eine Fritz!Box oder ein ISP-Router, der alles in einem ist — Router, Switch, Access Point, Firewall und DHCP-Server. Einfach, aber effektiv.',
          analogy: 'SOHO-Router = Schweizer Taschenmesser: Ein Gerät, viele Funktionen.',
          scene: {
            devices: [
              { id: 'isp', type: 'cloud', label: 'Internet\n(ISP)', position: { x: 80, y: 270 } },
              { id: 'ont', type: 'router', label: 'ONT/Modem\nGlasfaser', position: { x: 240, y: 270 } },
              { id: 'router', type: 'router', label: 'SOHO Router\nRouter+SW+AP+FW+DHCP', position: { x: 440, y: 270 } },
              { id: 'laptop', type: 'laptop', label: 'Laptop\nWi-Fi', position: { x: 640, y: 100 } },
              { id: 'phone', type: 'phone', label: 'Handy\nWi-Fi', position: { x: 700, y: 240 } },
              { id: 'pc', type: 'pc', label: 'Desktop PC\nEthernet', position: { x: 640, y: 380 } },
              { id: 'printer', type: 'printer', label: 'Drucker\nWi-Fi', position: { x: 700, y: 450 } },
            ],
            cables: [
              { id: 'c1', from: 'isp', to: 'ont', type: 'fiber-single', label: 'Glasfaser' },
              { id: 'c2', from: 'ont', to: 'router', type: 'ethernet', label: 'WAN Port' },
              { id: 'c3', from: 'router', to: 'laptop', type: 'wireless', label: '5 GHz' },
              { id: 'c4', from: 'router', to: 'phone', type: 'wireless', label: '5 GHz' },
              { id: 'c5', from: 'router', to: 'pc', type: 'ethernet', label: 'LAN Port' },
              { id: 'c6', from: 'router', to: 'printer', type: 'wireless', label: '2.4 GHz' },
            ],
            packets: [
              {
                id: 'web',
                label: 'Netflix',
                color: '#f87171',
                hops: [
                  { fromDevice: 'laptop', toDevice: 'router', hint: 'Du startest Netflix auf dem Laptop. Wi-Fi-Frame geht zur Fritz!Box — die ist gleichzeitig Switch, Access Point und Router.' },
                  { fromDevice: 'router', toDevice: 'ont', hint: 'SOHO-Router macht NAT (private 192.168.x → öffentliche IP des ISP), Firewall lässt das Paket raus, dann ab zum Glasfaser-Modem.' },
                  { fromDevice: 'ont', toDevice: 'isp', hint: 'Modem schickt das Paket per Glasfaser zum ISP — der reicht es ans Internet weiter. Ein Gerät zuhause, ein Modem, fertig.' },
                ],
              },
            ],
            highlightDevices: ['router'],
          },
        },
      ],
    },
    {
      id: '1.2.6',
      title: 'On-Premise vs. Cloud',
      steps: [
        {
          title: 'On-Premise: Alles bei dir im Haus',
          description:
            'On-Premise bedeutet: Deine Server stehen physisch bei dir im Büro oder Serverraum. Du kontrollierst alles — Hardware, Sicherheit, Updates. Hohe Anfangskosten, aber volle Kontrolle. Typisch für Banken, Behörden und Unternehmen mit strengen Compliance-Anforderungen.',
          analogy: 'On-Premise = eigenes Haus bauen und selbst warten.',
          scene: {
            devices: [
              { id: 'internet', type: 'cloud', label: 'Internet', position: { x: 80, y: 250 } },
              { id: 'fw', type: 'firewall', label: 'Firewall', position: { x: 230, y: 250 } },
              { id: 'core', type: 'l3switch', label: 'Core Switch', position: { x: 400, y: 250 } },
              { id: 's1', type: 'server', label: 'Web Server\n(physisch)', position: { x: 580, y: 120 } },
              { id: 's2', type: 'server', label: 'DB Server\n(physisch)', position: { x: 580, y: 250 } },
              { id: 's3', type: 'server', label: 'Backup\n(physisch)', position: { x: 580, y: 380 } },
            ],
            cables: [
              { id: 'c1', from: 'internet', to: 'fw', type: 'serial' },
              { id: 'c2', from: 'fw', to: 'core', type: 'ethernet' },
              { id: 'c3', from: 'core', to: 's1', type: 'fiber-single', label: '10G' },
              { id: 'c4', from: 'core', to: 's2', type: 'fiber-single', label: '10G' },
              { id: 'c5', from: 'core', to: 's3', type: 'fiber-single' },
            ],
            packets: [
              {
                id: 'req',
                label: 'SQL Query',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 's1', toDevice: 'core', hint: 'Web-Server fragt eine Bestellung aus der Datenbank ab. Frame geht über das Core-Backbone — alles passiert im eigenen Serverraum.' },
                  { fromDevice: 'core', toDevice: 's2', hint: 'Core-Switch reicht direkt an den DB-Server weiter. Latenz: unter einer Millisekunde. Volle Kontrolle, eigene Hardware, eigene Updates.' },
                ],
              },
            ],
            highlightDevices: ['s1', 's2', 's3'],
          },
        },
        {
          title: 'Cloud: Jemand anderes kümmert sich',
          description:
            'In der Cloud laufen deine Dienste auf Servern von AWS, Azure oder Google. Du mietest Ressourcen nach Bedarf — kein eigener Serverraum, keine Hardware-Wartung. Skaliert automatisch und du zahlst nur, was du nutzt.',
          analogy: 'Cloud = Wohnung mieten. Du ziehst ein und nutzt alles, der Vermieter kümmert sich um Reparaturen.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'Mitarbeiter A', position: { x: 80, y: 150 } },
              { id: 'pc2', type: 'laptop', label: 'Homeoffice', position: { x: 80, y: 350 } },
              { id: 'router', type: 'router', label: 'Router', position: { x: 250, y: 250 } },
              { id: 'internet', type: 'cloud', label: 'Internet', position: { x: 420, y: 250 } },
              { id: 'aws', type: 'cloud', label: 'AWS\nEC2 + RDS', position: { x: 620, y: 120 } },
              { id: 'azure', type: 'cloud', label: 'Azure\nAD + 365', position: { x: 620, y: 250 } },
              { id: 'gcp', type: 'cloud', label: 'Google\nGKE', position: { x: 620, y: 380 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'router', type: 'ethernet' },
              { id: 'c2', from: 'pc2', to: 'router', type: 'wireless' },
              { id: 'c3', from: 'router', to: 'internet', type: 'serial' },
              { id: 'c4', from: 'internet', to: 'aws', type: 'ethernet', label: 'HTTPS' },
              { id: 'c5', from: 'internet', to: 'azure', type: 'ethernet', label: 'HTTPS' },
              { id: 'c6', from: 'internet', to: 'gcp', type: 'ethernet', label: 'HTTPS' },
            ],
            packets: [
              {
                id: 'saas',
                label: 'Office 365',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'router', hint: 'Mitarbeiter öffnet Outlook im Browser. Frame geht erst zum Office-Router — kein eigener Mailserver mehr nötig, alles läuft als SaaS.' },
                  { fromDevice: 'router', toDevice: 'internet', hint: 'Router schickt das HTTPS-Paket übers Internet zu Microsoft. Im Cloud-Modell ist die Anbindung ans Internet das Wichtigste — fällt sie aus, geht nichts.' },
                  { fromDevice: 'internet', toDevice: 'azure', hint: 'Azure verarbeitet die Anfrage in einem Microsoft-Datacenter. Du zahlst Miete, Microsoft kümmert sich um Server, Updates, Backups, Skalierung.' },
                ],
              },
            ],
            highlightDevices: ['aws', 'azure', 'gcp'],
          },
          modal: {
            title: 'Cloud Service-Modelle',
            content: 'IaaS (Infrastructure as a Service):\n→ Du mietest VMs, Storage, Netzwerk (z.B. AWS EC2)\n\nPaaS (Platform as a Service):\n→ Du bekommst eine Plattform zum Entwickeln (z.B. Azure App Service)\n\nSaaS (Software as a Service):\n→ Du nutzt fertige Software (z.B. Office 365, Salesforce)\n\nJe höher das Modell, desto weniger musst du selbst verwalten.',
          },
        },
      ],
    },
  ],
}

export default lesson
