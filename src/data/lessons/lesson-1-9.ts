import type { Lesson } from '../../types'

const lesson: Lesson = {
  id: '1.9',
  number: '1.9',
  title: 'IPv6-Adresstypen',
  subtitle: 'Describe IPv6 address types',
  subtopics: [
    {
      id: '1.9.1',
      title: 'Global Unicast',
      steps: [
        {
          title: 'Global Unicast: Die öffentliche Adresse',
          description:
            'Global Unicast Adressen (GUA) sind das IPv6-Äquivalent zu öffentlichen IPv4-Adressen. Sie sind weltweit routbar und einzigartig. Der Bereich 2000::/3 umfasst alle GUAs. Jedes Gerät kann direkt eine öffentliche IPv6 haben — NAT ist nicht mehr nötig.',
          analogy: 'Wie eine internationale Telefonnummer — weltweit erreichbar und einzigartig. Jedes Gerät bekommt seine eigene.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: '2001:db8:1::10/64\nGlobal Unicast', position: { x: 80, y: 140 } },
              { id: 'pc2', type: 'laptop', label: '2001:db8:1::20/64\nGlobal Unicast', position: { x: 80, y: 350 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 280, y: 250 } },
              { id: 'router', type: 'router', label: 'Router\n2001:db8:1::1/64', position: { x: 470, y: 250 } },
              { id: 'isp', type: 'cloud', label: 'ISP\n/32 Block', position: { x: 650, y: 150 } },
              { id: 'server', type: 'server', label: 'Webserver\n2001:db8:2::80/64', position: { x: 650, y: 370 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet' },
              { id: 'c2', from: 'pc2', to: 'sw', type: 'ethernet' },
              { id: 'c3', from: 'sw', to: 'router', type: 'ethernet' },
              { id: 'c4', from: 'router', to: 'isp', type: 'serial' },
              { id: 'c5', from: 'isp', to: 'server', type: 'fiber-single' },
            ],
            packets: [
              {
                id: 'gua',
                label: 'HTTPS v6',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw', hint: 'PC1 hat eine globale IPv6-Adresse aus dem ISP-Block — kein NAT, kein Übersetzen.' },
                  { fromDevice: 'sw', toDevice: 'router', hint: 'Frame zum Router. GUAs aus 2001:db8:1::/64 sind im LAN, alles andere geht raus zum ISP.' },
                  { fromDevice: 'router', toDevice: 'isp', hint: 'Router schickt das Paket über den ISP-Uplink ins globale IPv6-Routing. Quell-IP bleibt unverändert die globale Adresse.' },
                  { fromDevice: 'isp', toDevice: 'server', hint: 'Webserver bekommt die Anfrage und sieht die echte globale Quell-IP — Ende-zu-Ende, kein NAT dazwischen.' },
                ],
              },
              {
                id: 'gua-back',
                label: 'Reply',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'server', toDevice: 'isp', hint: 'Webserver antwortet direkt an die globale Adresse von PC1 — keine Umrechnung notwendig.' },
                  { fromDevice: 'isp', toDevice: 'router', hint: 'Antwort kommt über den ISP zurück zum Router des Kunden-Netzes.' },
                  { fromDevice: 'router', toDevice: 'sw', hint: 'Router weiß per Routing-Tabelle: 2001:db8:1::/64 → Switch-Interface.' },
                  { fromDevice: 'sw', toDevice: 'pc1', hint: 'Antwort am PC angekommen. Mit IPv6 funktioniert das Internet wie ursprünglich gedacht — direkt, ohne Adress-Übersetzung.' },
                ],
              },
            ],
            highlightDevices: ['pc1', 'pc2'],
          },
          modal: {
            title: 'GUA Struktur',
            content: 'Global Unicast: 2000::/3\n\nAufbau einer /64 GUA:\n• /23 – IANA → RIR (RIPE, ARIN...)\n• /32 – RIR → ISP\n• /48 – ISP → Kunde (Site)\n• /64 – Kunde → Subnetz\n• Interface-ID (64 Bit) → Host\n\nBeispiel: 2001:0db8:0001:000A::10/64\n• 2001:0db8 → ISP-Block\n• 0001 → Site\n• 000A → Subnetz 10\n• ::10 → Host',
          },
        },
      ],
    },
    {
      id: '1.9.2',
      title: 'Unique Local & Link-Local',
      steps: [
        {
          title: 'Unique Local: Privat wie bei IPv4',
          description:
            'Unique Local Adressen (ULA, fd00::/8) sind das IPv6-Pendant zu RFC 1918 (privaten IPv4-Adressen). Sie werden nicht im Internet geroutet, funktionieren aber in deinem internen Netzwerk — zwischen Standorten über VPN zum Beispiel.',
          analogy: 'Wie eine Durchwahl im Büro — intern erreichbar, aber nicht von außen anrufbar.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'fd00:1::10\nUnique Local', position: { x: 80, y: 140 } },
              { id: 'pc2', type: 'laptop', label: 'fd00:1::20\nUnique Local', position: { x: 80, y: 340 } },
              { id: 'printer', type: 'printer', label: 'fd00:1::50\nDrucker', position: { x: 80, y: 490 } },
              { id: 'sw', type: 'switch', label: 'Internes Netz', position: { x: 330, y: 310 } },
              { id: 'router', type: 'router', label: 'Router\nfd00:1::1', position: { x: 530, y: 310 } },
              { id: 'internet', type: 'cloud', label: 'Internet\nULA wird nicht\ngeroutet!', position: { x: 720, y: 310 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet' },
              { id: 'c2', from: 'pc2', to: 'sw', type: 'ethernet' },
              { id: 'c3', from: 'printer', to: 'sw', type: 'ethernet' },
              { id: 'c4', from: 'sw', to: 'router', type: 'ethernet' },
              { id: 'c5', from: 'router', to: 'internet', type: 'serial' },
            ],
            packets: [
              {
                id: 'ula',
                label: 'ULA intern',
                color: '#a78bfa',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw', hint: 'PC1 druckt was und schickt das Paket an die ULA-Adresse des Druckers (fd00:1::50). ULA = privater IPv6-Bereich, bleibt intern.' },
                  { fromDevice: 'sw', toDevice: 'printer', hint: 'Switch liefert direkt an den Drucker — gleiches Subnetz, kein Routing nötig. Würde das Paket ULA → Internet versuchen, würde der Router/ISP es verwerfen.' },
                ],
              },
            ],
            highlightDevices: ['pc1', 'pc2', 'printer'],
          },
        },
        {
          title: 'Link-Local: Nur im gleichen Segment',
          description:
            'Link-Local Adressen (fe80::/10) funktionieren NUR auf dem direkt verbundenen Link — sie verlassen nie den Router. Jedes IPv6-Interface hat automatisch eine Link-Local (auch ohne manuelle Konfiguration). Essenziell für NDP, Router Advertisements und OSPFv3.',
          analogy: 'Wie Flüstern: Nur dein direkter Nachbar hört es. Ein Router leitet Flüstern nicht weiter.',
          scene: {
            devices: [
              { id: 'pc1', type: 'pc', label: 'fe80::1\nLink-Local', position: { x: 80, y: 130 } },
              { id: 'pc2', type: 'laptop', label: 'fe80::2\nLink-Local', position: { x: 80, y: 320 } },
              { id: 'sw', type: 'switch', label: 'Switch\nLink A', position: { x: 300, y: 220 } },
              { id: 'router', type: 'router', label: 'Router\nfe80::1 (Gi0/0)\nfe80::1 (Gi0/1)', position: { x: 510, y: 220 } },
              { id: 'pc3', type: 'pc', label: 'fe80::1\nanderer Link!', position: { x: 710, y: 220 } },
            ],
            cables: [
              { id: 'c1', from: 'pc1', to: 'sw', type: 'ethernet', label: 'Link A' },
              { id: 'c2', from: 'pc2', to: 'sw', type: 'ethernet', label: 'Link A' },
              { id: 'c3', from: 'sw', to: 'router', type: 'ethernet', label: 'Gi0/0' },
              { id: 'c4', from: 'router', to: 'pc3', type: 'ethernet', label: 'Gi0/1 — Link B' },
            ],
            highlightCables: ['c1', 'c2', 'c3'],
          },
          modal: {
            title: 'Link-Local Verwendung',
            content: 'fe80::/10 — automatisch auf jedem Interface\n\nVerwendet für:\n• NDP (Neighbor Discovery Protocol)\n  → Ersetzt ARP aus IPv4\n• Router Advertisements (RA)\n  → Router teilt Prefix mit\n• OSPFv3 Nachbarschaften\n  → Routing-Protokoll\n• DHCPv6 Kommunikation\n• Default-Gateway\n  → Hosts nutzen oft fe80::1 als GW\n\n⚠ fe80::1 auf Link A ≠ fe80::1 auf Link B!\nLink-Local ist nur pro Interface eindeutig.',
          },
        },
      ],
    },
    {
      id: '1.9.3',
      title: 'Anycast & Multicast',
      steps: [
        {
          title: 'Anycast: Der nächste antwortet',
          description:
            'Bei Anycast teilen sich mehrere Server die gleiche IPv6-Adresse. Das Routing-Protokoll leitet das Paket automatisch zum nächsten/schnellsten Server. Wird z.B. für DNS-Root-Server und CDNs genutzt — der User merkt nichts davon.',
          analogy: 'Wie "112" anrufen — du erreichst immer die nächste Leitstelle, egal wo du bist.',
          scene: {
            devices: [
              { id: 'client', type: 'laptop', label: 'Client\nBerlin', position: { x: 80, y: 270 } },
              { id: 'r1', type: 'router', label: 'Router\nBerlin', position: { x: 260, y: 270 } },
              { id: 'isp', type: 'cloud', label: 'BGP Routing\nwählt nächsten', position: { x: 440, y: 270 } },
              { id: 'dns1', type: 'server', label: 'DNS Frankfurt\n2001:db8::53\n(näher!)', position: { x: 660, y: 140 } },
              { id: 'dns2', type: 'server', label: 'DNS New York\n2001:db8::53\n(gleiche IP!)', position: { x: 660, y: 400 } },
            ],
            cables: [
              { id: 'c1', from: 'client', to: 'r1', type: 'ethernet' },
              { id: 'c2', from: 'r1', to: 'isp', type: 'serial' },
              { id: 'c3', from: 'isp', to: 'dns1', type: 'fiber-single', label: '5ms' },
              { id: 'c4', from: 'isp', to: 'dns2', type: 'fiber-single', label: '80ms' },
            ],
            packets: [
              {
                id: 'any',
                label: 'DNS Query',
                color: '#fbbf24',
                hops: [
                  { fromDevice: 'client', toDevice: 'r1', hint: 'Berliner Client schickt DNS-Anfrage an die Anycast-Adresse. Aus seiner Sicht: ein einziger Server.' },
                  { fromDevice: 'r1', toDevice: 'isp', hint: 'Router gibt das Paket dem ISP. Hier kommt BGP ins Spiel: der ISP kennt mehrere Wege zur gleichen IP.' },
                  { fromDevice: 'isp', toDevice: 'dns1', hint: 'BGP wählt den nächsten DNS-Server (Frankfurt, 5ms). New York (80ms) gibt es zwar auch — aber Routing bevorzugt automatisch den näheren.' },
                ],
              },
            ],
            highlightDevices: ['dns1'],
          },
        },
        {
          title: 'Multicast: Einmal senden, viele empfangen',
          description:
            'Multicast (ff00::/8) schickt ein Paket an eine Gruppe von Empfängern. IPv6 hat KEINEN Broadcast — stattdessen Multicast-Gruppen. Wichtige Gruppen: ff02::1 (alle Nodes), ff02::2 (alle Router), ff02::1:ff (Solicited-Node für NDP).',
          analogy: 'Wie ein Gruppen-Chat: Nur die Mitglieder der Gruppe bekommen die Nachricht.',
          scene: {
            devices: [
              { id: 'router', type: 'router', label: 'Router\nsendet RA an\nff02::1', position: { x: 130, y: 270 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 340, y: 270 } },
              { id: 'pc1', type: 'pc', label: 'PC 1\nff02::1 Mitglied ✓', position: { x: 570, y: 100 } },
              { id: 'pc2', type: 'laptop', label: 'Laptop\nff02::1 Mitglied ✓', position: { x: 570, y: 270 } },
              { id: 'pc3', type: 'phone', label: 'Phone\nff02::1 Mitglied ✓', position: { x: 570, y: 430 } },
            ],
            cables: [
              { id: 'c1', from: 'router', to: 'sw', type: 'ethernet' },
              { id: 'c2', from: 'sw', to: 'pc1', type: 'ethernet' },
              { id: 'c3', from: 'sw', to: 'pc2', type: 'wireless' },
              { id: 'c4', from: 'sw', to: 'pc3', type: 'wireless' },
            ],
            packets: [
              {
                id: 'mcast',
                label: 'RA ff02::1',
                color: '#f97316',
                hops: [
                  { fromDevice: 'router', toDevice: 'sw', hint: 'Router schickt ein Router Advertisement an die Multicast-Gruppe ff02::1 (alle Geräte am Link). So lernen Hosts ihre Konfiguration.' },
                  { fromDevice: 'sw', toDevice: 'pc2', hint: 'Switch leitet das Multicast an alle Mitglieder von ff02::1 weiter — das sind alle IPv6-Geräte im LAN. Kein Broadcast wie bei IPv4: nur die Gruppe wird erreicht.' },
                ],
              },
            ],
            highlightDevices: ['pc1', 'pc2', 'pc3'],
          },
          modal: {
            title: 'Wichtige Multicast-Gruppen',
            content: 'ff02::1 — All Nodes (alle Geräte am Link)\nff02::2 — All Routers (nur Router)\nff02::5 — OSPF Routers\nff02::6 — OSPF Designated Routers\nff02::9 — RIPng Routers\nff02::a — EIGRP Routers\nff02::1:ff — Solicited-Node (für NDP/DAD)\n\nScope (2. Hex-Ziffer):\n• ff01:: — Interface-Local\n• ff02:: — Link-Local (häufigster)\n• ff05:: — Site-Local\n• ff0e:: — Global',
          },
        },
      ],
    },
    {
      id: '1.9.4',
      title: 'Modified EUI-64',
      steps: [
        {
          title: 'EUI-64: IP aus der MAC-Adresse basteln',
          description:
            'Modified EUI-64 erstellt den 64-Bit Host-Teil (Interface-ID) einer IPv6-Adresse automatisch aus der 48-Bit MAC-Adresse. Die MAC wird in der Mitte aufgeteilt, FF:FE eingefügt, und das 7. Bit (U/L-Bit) invertiert. Alternativ: SLAAC mit Privacy Extensions nutzt zufällige IDs.',
          analogy: 'Wie ein Namensgenerator: Aus deinem Spitznamen (MAC) wird ein voller Benutzername (Interface-ID) nach festen Regeln.',
          scene: {
            devices: [
              { id: 'pc', type: 'pc', label: 'MAC: 00:1A:2B:3C:4D:5E\n→ EUI-64: 021A:2BFF:FE3C:4D5E\n→ IPv6: 2001:db8::21a:2bff:fe3c:4d5e', position: { x: 130, y: 270 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 600, y: 270 } },
              { id: 'router', type: 'router', label: 'Router\nSLAAC + RA', position: { x: 820, y: 270 } },
            ],
            cables: [
              { id: 'c1', from: 'pc', to: 'sw', type: 'ethernet' },
              { id: 'c2', from: 'sw', to: 'router', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'ra',
                label: 'Router Adv',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'router', toDevice: 'sw', hint: 'Router sendet eine Router Advertisement: "Mein Prefix ist 2001:db8:0:1::/64, schnappt euch eure Adresse." Geht an Multicast ff02::1.' },
                  { fromDevice: 'sw', toDevice: 'pc', hint: 'PC empfängt das RA, basteln aus seiner MAC die Interface-ID per EUI-64 und hängt sie ans Prefix → fertige IPv6-Adresse, ohne DHCP.' },
                ],
              },
            ],
            highlightDevices: ['pc'],
          },
          modal: {
            title: 'EUI-64 Schritt für Schritt',
            content: 'MAC: 00:1A:2B:3C:4D:5E\n\n1. Aufteilen: 00:1A:2B | 3C:4D:5E\n2. FF:FE einfügen: 00:1A:2B:FF:FE:3C:4D:5E\n3. 7. Bit invertieren (U/L-Bit):\n   00 = 00000000 → 00000010 = 02\n4. Ergebnis: 02:1A:2B:FF:FE:3C:4D:5E\n5. IPv6-Format: 021A:2BFF:FE3C:4D5E\n\nVollständige Adresse:\nPrefix (vom Router RA) + Interface-ID\n2001:db8:0:1:: + 021A:2BFF:FE3C:4D5E\n= 2001:db8:0:1:21a:2bff:fe3c:4d5e\n\n⚠ Privacy Concern: MAC ist in der IP sichtbar!\n→ Privacy Extensions: Zufällige Interface-ID',
          },
        },
      ],
    },
  ],
}

export default lesson
