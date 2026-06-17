import type { Lesson } from '../../types'

const lesson: Lesson = {
  id: '1.11',
  number: '1.11',
  title: 'Wireless-Grundlagen',
  subtitle: 'Describe wireless principles',
  subtopics: [
    {
      id: '1.11.1',
      title: 'Wi-Fi Kanäle & Überlappung',
      steps: [
        {
          title: 'Wi-Fi Kanäle: Wie Radio-Frequenzen',
          description:
            'WLAN nutzt Funkfrequenzen — wie verschiedene Radiosender. Im 2.4-GHz-Band gibt es je nach Land bis zu 13 nutzbare Kanäle (Kanal 14 nur in Japan), aber nur 3 überlappen sich nicht: 1, 6 und 11. Im 5-GHz-Band gibt es über 20 nicht-überlappende Kanäle. Bei Enterprise-Deployments plant man die Kanalverteilung sorgfältig.',
          analogy: 'Wie Radiosender: Wenn zwei auf fast der gleichen Frequenz senden, hörst du ein Durcheinander.',
          scene: {
            devices: [
              { id: 'ap1', type: 'access-point', label: 'AP 1\nKanal 1\nBüro West', position: { x: 100, y: 160 } },
              { id: 'ap2', type: 'access-point', label: 'AP 2\nKanal 6\nBüro Mitte', position: { x: 400, y: 160 } },
              { id: 'ap3', type: 'access-point', label: 'AP 3\nKanal 11\nBüro Ost', position: { x: 700, y: 160 } },
              { id: 'wlc', type: 'controller', label: 'WLC\n(Wireless LAN Controller)', position: { x: 400, y: 380 } },
              { id: 'sw', type: 'switch', label: 'PoE Switch', position: { x: 400, y: 500 } },
            ],
            cables: [
              { id: 'c1', from: 'ap1', to: 'sw', type: 'ethernet', label: 'PoE' },
              { id: 'c2', from: 'ap2', to: 'sw', type: 'ethernet', label: 'PoE' },
              { id: 'c3', from: 'ap3', to: 'sw', type: 'ethernet', label: 'PoE' },
              { id: 'c4', from: 'sw', to: 'wlc', type: 'ethernet', label: 'CAPWAP' },
            ],
            packets: [
              {
                id: 'capwap',
                label: 'CAPWAP',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'ap2', toDevice: 'sw', hint: 'AP 2 sendet seinen Status (Clients, Kanal-Auslastung) per CAPWAP an den Switch — Tunnel zum Controller.' },
                  { fromDevice: 'sw', toDevice: 'wlc', hint: 'Switch reicht das CAPWAP-Paket an den WLC weiter. Der Controller koordiniert alle APs zentral und kann Kanäle dynamisch anpassen.' },
                ],
              },
            ],
            highlightDevices: ['ap1', 'ap2', 'ap3'],
          },
          modal: {
            title: 'Kanalplanung',
            content: '2.4 GHz (802.11b/g/n):\n• Kanäle 1-13 (14 nur Japan/802.11b) — regionsabhängig\n• 20 MHz breit (nur 802.11b: 22 MHz)\n• Nur 1, 6, 11 nicht überlappend\n• Max ~300 Mbit/s (n, 2 Streams)\n\n5 GHz (802.11a/n/ac/ax):\n• 23+ nicht-überlappende Kanäle\n• Je 20/40/80/160 MHz breit\n• Max ~9,6 Gbit/s (ax)\n\n6 GHz (802.11ax / Wi-Fi 6E):\n• 59 neue Kanäle!\n• Weniger Interferenz\n\nRegel: Benachbarte APs → unterschiedliche Kanäle',
          },
        },
      ],
    },
    {
      id: '1.11.2',
      title: 'SSID & BSS',
      steps: [
        {
          title: 'SSID, BSS und ESS',
          description:
            'Die SSID ist der Name deines WLANs. Ein einzelner AP bildet ein BSS (Basic Service Set) mit einer BSSID (= MAC des AP). Mehrere APs mit gleicher SSID bilden ein ESS (Extended Service Set) — du kannst dich nahtlos zwischen APs bewegen (Roaming).',
          analogy: 'BSS = einzelnes Zimmer mit einem Lautsprecher. ESS = ganzes Gebäude mit mehreren Lautsprechern, gleiche Musik.',
          scene: {
            devices: [
              { id: 'ap1', type: 'access-point', label: 'AP 1\nSSID: "Firma"\nBSSID: aa:bb:..', position: { x: 130, y: 160 } },
              { id: 'ap2', type: 'access-point', label: 'AP 2\nSSID: "Firma"\nBSSID: cc:dd:..', position: { x: 450, y: 160 } },
              { id: 'ap3', type: 'access-point', label: 'AP 3\nSSID: "Gast"\nBSSID: ee:ff:..', position: { x: 700, y: 160 } },
              { id: 'laptop', type: 'laptop', label: 'Laptop\nroamt zwischen\nAP 1 ↔ AP 2', position: { x: 290, y: 370 } },
              { id: 'phone', type: 'phone', label: 'Gast-Handy\nSSID: "Gast"', position: { x: 700, y: 370 } },
              { id: 'sw', type: 'switch', label: 'Switch\nTrunk', position: { x: 450, y: 500 } },
            ],
            cables: [
              { id: 'c1', from: 'ap1', to: 'laptop', type: 'wireless', label: 'Roaming' },
              { id: 'c2', from: 'ap2', to: 'laptop', type: 'wireless' },
              { id: 'c3', from: 'ap3', to: 'phone', type: 'wireless', label: 'Gast-VLAN' },
              { id: 'c4', from: 'ap1', to: 'sw', type: 'ethernet' },
              { id: 'c5', from: 'ap2', to: 'sw', type: 'ethernet' },
              { id: 'c6', from: 'ap3', to: 'sw', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'roam',
                label: 'Re-Associate',
                color: '#a78bfa',
                hops: [
                  { fromDevice: 'laptop', toDevice: 'ap2', hint: 'Laptop bewegt sich Richtung AP 2 — Signal zu AP 1 wird schwach. Er schickt Re-Association an AP 2: "Ich wechsle zu dir."' },
                  { fromDevice: 'ap2', toDevice: 'sw', hint: 'AP 2 leitet die Anmeldung über den Trunk weiter. Da SSID und Sicherheit gleich sind, läuft das Roaming nahtlos — keine Unterbrechung der Verbindung.' },
                ],
              },
            ],
            highlightDevices: ['ap1', 'ap2'],
          },
          modal: {
            title: 'Wireless Begriffe',
            content: 'SSID: Netzwerkname (max. 32 Zeichen)\nBSSID: MAC-Adresse des AP-Radios\nBSS: Ein AP + seine Clients\nESS: Mehrere APs, gleiche SSID\n\nRoaming: Client wechselt AP automatisch\n→ Voraussetzung: Gleiche SSID + gleiche Sicherheit\n→ 802.11r (Fast Transition) für schnelles Roaming\n\nBeacon Frame: AP sendet alle ~100ms\n→ Enthält: SSID, Kanal, Verschlüsselung, Datenraten\n→ Beacon wird weiter gesendet, nur das SSID-Feld bleibt leer (Hidden SSID — kein echter Schutz)',
          },
        },
      ],
    },
    {
      id: '1.11.3',
      title: 'RF — Funkfrequenz',
      steps: [
        {
          title: 'RF: 2.4 GHz vs. 5 GHz vs. 6 GHz',
          description:
            'WLAN nutzt Radiofrequenzen (RF). 2.4 GHz reicht weiter und durchdringt Wände besser, ist aber langsam und überfüllt. 5 GHz bietet mehr Bandbreite und Kanäle, aber kürzere Reichweite. 6 GHz (Wi-Fi 6E) ist das neueste Band mit noch mehr Platz.',
          analogy: '2.4 GHz = Autobahn mit 3 Spuren (voll). 5 GHz = Autobahn mit 23 Spuren. 6 GHz = nagelneue Autobahn mit 59 Spuren.',
          scene: {
            devices: [
              { id: 'ap', type: 'access-point', label: 'Tri-Band AP\n2.4 + 5 + 6 GHz', position: { x: 130, y: 270 } },
              { id: 'far', type: 'laptop', label: 'Lager (weit)\n2.4 GHz\n50 Mbit/s', position: { x: 500, y: 100 } },
              { id: 'near', type: 'laptop', label: 'Büro (nah)\n5 GHz\n800 Mbit/s', position: { x: 500, y: 270 } },
              { id: 'phone', type: 'phone', label: 'Konferenz\n6 GHz\n2.4 Gbit/s', position: { x: 500, y: 430 } },
              { id: 'sw', type: 'switch', label: 'PoE+ Switch', position: { x: 730, y: 270 } },
            ],
            cables: [
              { id: 'c1', from: 'ap', to: 'far', type: 'wireless', label: '2.4 GHz' },
              { id: 'c2', from: 'ap', to: 'near', type: 'wireless', label: '5 GHz' },
              { id: 'c3', from: 'ap', to: 'phone', type: 'wireless', label: '6 GHz' },
              { id: 'c4', from: 'ap', to: 'sw', type: 'ethernet', label: 'Uplink 2.5G' },
            ],
            highlightCables: ['c1', 'c2', 'c3'],
          },
          modal: {
            title: 'Wi-Fi Standards',
            content: 'Wi-Fi 4 (802.11n): 2.4+5 GHz, bis 600 Mbit/s\nWi-Fi 5 (802.11ac): 5 GHz, bis ~6,9 Gbit/s (theoretisch)\nWi-Fi 6 (802.11ax): 2.4+5 GHz, bis 9.6 Gbit/s\nWi-Fi 6E: + 6 GHz Band\nWi-Fi 7 (802.11be): Alle 3 Bänder, bis 46 Gbit/s\n\nRF-Probleme:\n• Absorption: Wände, Glas, Wasser schwächen Signal\n• Reflexion: Metall reflektiert Signale\n• Interferenz: Mikrowellen, Bluetooth, andere APs\n• RSSI: Signalstärke (gut: > -65 dBm)',
          },
        },
      ],
    },
    {
      id: '1.11.4',
      title: 'Verschlüsselung',
      steps: [
        {
          title: 'WLAN-Sicherheit: WPA2 & WPA3',
          description:
            'Ohne Verschlüsselung kann jeder in Funkreichweite mitlesen! WEP ist veraltet und in Sekunden knackbar. WPA2 mit AES ist der aktuelle Standard. WPA3 bringt zusätzliche Sicherheit: SAE (ein sicherer Handshake, der den WPA2-Schlüsselaustausch ersetzt — das WLAN-Passwort bleibt, ist aber gegen Offline-Angriffe geschützt), Forward Secrecy und Schutz gegen Offline-Wörterbuch-Angriffe.',
          scene: {
            devices: [
              { id: 'ap', type: 'access-point', label: 'Corporate AP\nWPA2-Enterprise\n802.1X', position: { x: 350, y: 130 } },
              { id: 'laptop', type: 'laptop', label: 'Mitarbeiter\nUser+Passwort ✓', position: { x: 130, y: 330 } },
              { id: 'phone', type: 'phone', label: 'Gast\nWPA2-PSK ✓', position: { x: 350, y: 420 } },
              { id: 'hacker', type: 'laptop', label: 'Angreifer\nkein Zugang ✗', position: { x: 600, y: 330 } },
              { id: 'radius', type: 'server', label: 'RADIUS Server\nAuthentifizierung', position: { x: 700, y: 130 } },
            ],
            cables: [
              { id: 'c1', from: 'ap', to: 'laptop', type: 'wireless', label: 'WPA2-Enterprise' },
              { id: 'c2', from: 'ap', to: 'phone', type: 'wireless', label: 'WPA2-PSK' },
              { id: 'c3', from: 'ap', to: 'hacker', type: 'wireless', label: 'blockiert!' },
              { id: 'c4', from: 'ap', to: 'radius', type: 'ethernet', label: 'RADIUS' },
            ],
            packets: [
              {
                id: 'auth',
                label: 'Auth',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'laptop', toDevice: 'ap', hint: 'Mitarbeiter-Laptop verbindet sich. Statt einem festen WLAN-Passwort authentifiziert es sich per 802.1X/EAP mit eigenen Zugangsdaten (User+Passwort oder Zertifikat) — geschützt, nicht im Klartext.' },
                  { fromDevice: 'ap', toDevice: 'radius', hint: 'AP leitet die Anmeldung an den RADIUS-Server weiter — der prüft im Active Directory ob die Credentials stimmen.' },
                ],
              },
              {
                id: 'auth-back',
                label: 'Granted',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'radius', toDevice: 'ap', hint: 'RADIUS antwortet "Access-Accept" — der User ist OK. Der AP erfährt, in welches VLAN er den Client setzen soll.' },
                  { fromDevice: 'ap', toDevice: 'laptop', hint: 'Laptop bekommt grünes Licht und einen Schlüssel für die Sitzung. Jeder User hat seinen eigenen Schlüssel — viel sicherer als PSK.' },
                ],
              },
            ],
            highlightDevices: ['ap', 'radius'],
          },
          modal: {
            title: 'Sicherheitsstandards',
            content: 'WEP: ✗ Veraltet, in Sekunden knackbar\n\nWPA2-Personal (PSK):\n• Gemeinsames Passwort für alle\n• AES-CCMP Verschlüsselung\n• Gut für zuhause\n\nWPA2-Enterprise (802.1X):\n• Individuelle Logins (User/Pass oder Zertifikat)\n• RADIUS-Server authentifiziert\n• Standard in Unternehmen\n\nWPA3-Personal (SAE):\n• Schutz gegen Brute-Force\n• Forward Secrecy\n• Kein Offline-Angriff möglich\n\nWPA3-Enterprise:\n• stärkere Authentifizierung als WPA2\n• optionaler 192-Bit-Modus (CNSA) für Hochsicherheit',
          },
        },
      ],
    },
  ],
}

export default lesson
