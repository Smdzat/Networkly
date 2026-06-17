import type { Lesson } from '../../types'

const lesson: Lesson = {
  id: '1.7b',
  number: '1.7b',
  title: 'DNS & DHCP',
  subtitle: 'Namensauflösung und automatische IP-Vergabe',
  subtopics: [
    {
      id: '1.7b.1',
      title: 'DNS — Das Telefonbuch des Internets',
      steps: [
        {
          title: 'Warum brauchen wir DNS?',
          description:
            'Menschen merken sich Namen (google.de), Computer arbeiten mit Zahlen (142.250.80.46). DNS (Domain Name System) übersetzt Namen in IP-Adressen — wie ein Telefonbuch. Ohne DNS müsstest du dir für jede Webseite eine Zahlenkombination merken.',
          analogy: 'DNS = Telefonbuch: Du suchst "Pizza-Service" und bekommst die Nummer. Ohne Telefonbuch müsstest du alle Nummern auswendig kennen.',
          scene: {
            devices: [
              { id: 'pc', type: 'pc', label: 'Dein PC\n192.168.1.10', position: { x: 60, y: 250 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 220, y: 250 } },
              { id: 'router', type: 'router', label: 'Router\n192.168.1.1', position: { x: 380, y: 250 } },
              { id: 'dns', type: 'server', label: 'DNS Server\n8.8.8.8\n(Google DNS)', position: { x: 560, y: 120 } },
              { id: 'web', type: 'server', label: 'google.de\n142.250.80.46', position: { x: 700, y: 380 } },
            ],
            cables: [
              { id: 'c1', from: 'pc', to: 'sw', type: 'ethernet', startPos: { x: 110, y: 250 }, endPos: { x: 180, y: 250 } },
              { id: 'c2', from: 'sw', to: 'router', type: 'ethernet', startPos: { x: 260, y: 250 }, endPos: { x: 340, y: 250 } },
              { id: 'c3', from: 'router', to: 'dns', type: 'serial', startPos: { x: 410, y: 230 }, endPos: { x: 530, y: 145 } },
              { id: 'c4', from: 'router', to: 'web', type: 'fiber-single', startPos: { x: 420, y: 270 }, endPos: { x: 660, y: 375 } },
            ],
            packets: [
              {
                id: 'dnsq',
                label: 'DNS Query',
                color: '#a78bfa',
                hops: [
                  { fromDevice: 'pc', toDevice: 'sw', hint: 'Du tippst "google.de" ein. Dein PC weiß nicht, welche IP das ist → er schickt eine DNS-Anfrage (UDP Port 53).' },
                  { fromDevice: 'sw', toDevice: 'router', hint: 'Der Switch leitet den Frame weiter an den Router — der kennt den Weg ins Internet.' },
                  { fromDevice: 'router', toDevice: 'dns', hint: 'Der Router leitet die DNS-Anfrage an den DNS-Server (8.8.8.8). Frage: "Welche IP hat google.de?"' },
                ],
              },
              {
                id: 'dnsr',
                label: 'DNS Reply',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'dns', toDevice: 'router', hint: 'Der DNS-Server antwortet: "google.de = 142.250.80.46" — dein PC speichert das im DNS-Cache.' },
                  { fromDevice: 'router', toDevice: 'sw', hint: 'Die Antwort wird zurückgeleitet. Jetzt kennt dein PC die IP-Adresse!' },
                  { fromDevice: 'sw', toDevice: 'pc', hint: 'Dein PC kann jetzt eine HTTPS-Verbindung zu 142.250.80.46 aufbauen. DNS hat seinen Job erledigt!' },
                ],
              },
            ],
            highlightDevices: ['dns'],
          },
          modal: {
            title: 'DNS-Ablauf im Detail',
            content: '1. Du tippst google.de ein\n2. PC prüft lokalen DNS-Cache → nicht gefunden\n3. PC fragt den konfigurierten DNS-Server\n4. DNS-Server antwortet mit der IP\n5. PC speichert die Antwort im Cache (TTL)\n6. PC verbindet sich zur IP\n\nDNS-Hierarchie:\n• Root-Server (.) → kennt TLD-Server\n• TLD-Server (.de) → kennt Domain-Server\n• Autoritativer Server (google.de) → kennt die IP\n\nWichtige DNS-Record-Typen:\n• A → IPv4-Adresse\n• AAAA → IPv6-Adresse\n• MX → Mailserver\n• CNAME → Alias (Weiterleitung)\n• NS → Nameserver\n• PTR → Reverse (IP → Name)',
          },
        },
        {
          title: 'DNS-Hierarchie: Vom Root bis zur Antwort',
          description:
            'DNS ist hierarchisch aufgebaut — wie ein Verzeichnisbaum. Ganz oben stehen 13 Root-Server (a.root-servers.net bis m.root-servers.net). Darunter kommen TLD-Server (.de, .com, .org), dann die autoritativen Server der Domains. Dein DNS-Server fragt sich von oben nach unten durch.',
          analogy: 'Wie nach einer Adresse fragen: Erst das Land (Root) → dann die Stadt (TLD) → dann die Straße (Domain).',
          scene: {
            devices: [
              { id: 'pc', type: 'pc', label: 'Dein PC', position: { x: 80, y: 400 } },
              { id: 'resolver', type: 'server', label: 'DNS Resolver\n(dein ISP / 8.8.8.8)', position: { x: 280, y: 400 } },
              { id: 'root', type: 'server', label: 'Root Server\n(13 weltweit)', position: { x: 450, y: 80 } },
              { id: 'tld', type: 'server', label: 'TLD Server\n(.de)', position: { x: 650, y: 200 } },
              { id: 'auth', type: 'server', label: 'Autoritativer NS\ngoogle.de', position: { x: 650, y: 400 } },
            ],
            cables: [
              { id: 'c1', from: 'pc', to: 'resolver', type: 'ethernet', startPos: { x: 130, y: 400 }, endPos: { x: 230, y: 400 } },
              { id: 'c2', from: 'resolver', to: 'root', type: 'serial', startPos: { x: 320, y: 370 }, endPos: { x: 420, y: 110 } },
              { id: 'c3', from: 'resolver', to: 'tld', type: 'serial', startPos: { x: 340, y: 380 }, endPos: { x: 610, y: 220 } },
              { id: 'c4', from: 'resolver', to: 'auth', type: 'serial', startPos: { x: 340, y: 400 }, endPos: { x: 610, y: 400 } },
            ],
            packets: [
              {
                id: 'recursive',
                label: 'DNS',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'pc', toDevice: 'resolver', hint: 'Dein PC fragt den DNS-Resolver: "Wo ist google.de?" Der Resolver ist wie ein Bibliothekar — er sucht die Antwort für dich.' },
                  { fromDevice: 'resolver', toDevice: 'root', hint: 'Resolver fragt den Root-Server: "Wer ist zuständig für .de?" Root antwortet: "Frag den .de TLD-Server!"' },
                  { fromDevice: 'resolver', toDevice: 'tld', hint: 'Resolver fragt den .de TLD-Server: "Wer ist zuständig für google.de?" Antwort: "Frag ns1.google.com!"' },
                  { fromDevice: 'resolver', toDevice: 'auth', hint: 'Resolver fragt Googles Nameserver: "Welche IP hat google.de?" → Antwort: "142.250.80.46" — fertig!' },
                ],
              },
            ],
            highlightDevices: ['root', 'tld', 'auth'],
          },
          modal: {
            title: 'Rekursiv vs. Iterativ',
            content: 'Rekursive Anfrage:\nDein PC fragt den Resolver → der erledigt alles\nDer PC wartet nur auf die finale Antwort.\n\nIterative Anfrage:\nDer Resolver fragt nacheinander:\n→ Root: "Frag den TLD"\n→ TLD: "Frag den Auth-NS"\n→ Auth-NS: "Hier ist die IP"\n\nCaching beschleunigt alles:\n• Wenn die Antwort im Cache ist → sofortige Antwort\n• TTL (Time To Live) bestimmt Cache-Dauer\n• Typisch: 300 Sek. bis 24 Stunden\n\nnslookup google.de\n→ Zeigt dir die aufgelöste IP\n\nipconfig /displaydns (Windows)\n→ Zeigt deinen lokalen DNS-Cache',
          },
        },
      ],
    },
    {
      id: '1.7b.2',
      title: 'DHCP — Automatische IP-Vergabe',
      steps: [
        {
          title: 'DHCP: Plug & Play für IP-Adressen',
          description:
            'DHCP (Dynamic Host Configuration Protocol) vergibt automatisch IP-Adressen an Geräte. Ohne DHCP müsstest du an jedem PC, Laptop und Handy die IP-Adresse, Subnetzmaske, Gateway und DNS-Server manuell eingeben. DHCP macht das in Sekunden — bei tausenden Geräten.',
          analogy: 'DHCP = Hotel-Rezeption: Du kommst an, bekommst automatisch eine Zimmernummer (IP), weißt wo der Ausgang ist (Gateway) und wo die Info-Tafel steht (DNS).',
          scene: {
            devices: [
              { id: 'pc', type: 'pc', label: 'Neuer PC\n(noch keine IP)', position: { x: 60, y: 250 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 250, y: 250 } },
              { id: 'dhcp', type: 'server', label: 'DHCP Server\n192.168.1.2\nPool: .100-.200', position: { x: 500, y: 120 } },
              { id: 'router', type: 'router', label: 'Gateway\n192.168.1.1', position: { x: 500, y: 380 } },
            ],
            cables: [
              { id: 'c1', from: 'pc', to: 'sw', type: 'ethernet', startPos: { x: 110, y: 250 }, endPos: { x: 210, y: 250 } },
              { id: 'c2', from: 'sw', to: 'dhcp', type: 'ethernet', startPos: { x: 280, y: 230 }, endPos: { x: 460, y: 145 } },
              { id: 'c3', from: 'sw', to: 'router', type: 'ethernet', startPos: { x: 280, y: 270 }, endPos: { x: 460, y: 370 } },
            ],
            packets: [
              {
                id: 'discover',
                label: 'DISCOVER',
                color: '#fbbf24',
                hops: [
                  { fromDevice: 'pc', toDevice: 'sw', hint: '① DHCP Discover: Der PC ruft ins Netzwerk: "Gibt es hier einen DHCP-Server?" (Broadcast an 255.255.255.255)' },
                  { fromDevice: 'sw', toDevice: 'dhcp', hint: '② DHCP Offer: Der Server antwortet: "Ja! Ich biete dir 192.168.1.100, Gateway .1, DNS 8.8.8.8, Lease: 24h"' },
                ],
              },
              {
                id: 'request',
                label: 'REQUEST',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'pc', toDevice: 'sw', hint: '③ DHCP Request: Der PC sagt: "Danke, ich nehme 192.168.1.100!" (Falls mehrere Server geantwortet haben, wählt er einen)' },
                  { fromDevice: 'sw', toDevice: 'dhcp', hint: '④ DHCP ACK: Der Server bestätigt: "Ok, 192.168.1.100 gehört jetzt dir für 24 Stunden (Lease Time)!"' },
                ],
              },
            ],
            highlightDevices: ['dhcp'],
          },
          modal: {
            title: 'DORA-Prozess',
            content: 'DHCP nutzt 4 Schritte (DORA):\n\n① Discover (Client → Broadcast)\n  "Gibt es einen DHCP-Server?"\n  Src: 0.0.0.0, Dst: 255.255.255.255\n\n② Offer (Server → Client)\n  "Hier ist mein Angebot: IP + Optionen"\n\n③ Request (Client → Broadcast)\n  "Ich nehme dieses Angebot an!"\n\n④ ACK (Server → Client)\n  "Bestätigt! Die IP gehört dir."\n\nWichtige DHCP-Optionen:\n• IP-Adresse\n• Subnetzmaske\n• Default Gateway\n• DNS-Server\n• Lease Time (Mietdauer)\n• Domain Name',
          },
        },
        {
          title: 'DHCP Relay: Über Router hinweg',
          description:
            'Was passiert, wenn der DHCP-Server in einem anderen Netzwerk steht? Ein Broadcast (Discover) wird vom Router normalerweise gestoppt! Die Lösung: DHCP Relay (ip helper-address). Der Router verwandelt den Broadcast in ein Unicast-Paket und leitet es an den DHCP-Server weiter.',
          analogy: 'Wie ein Dolmetscher: Der Router übersetzt den "Hilfe-Ruf" (Broadcast) in eine gezielte Nachricht an den DHCP-Server in einem anderen Gebäude.',
          scene: {
            devices: [
              { id: 'pc', type: 'pc', label: 'Neuer PC\nVLAN 10', position: { x: 60, y: 250 } },
              { id: 'sw', type: 'switch', label: 'Access Switch', position: { x: 230, y: 250 } },
              { id: 'router', type: 'router', label: 'Router\nip helper-address\n10.0.0.50', position: { x: 430, y: 250 } },
              { id: 'core', type: 'l3switch', label: 'Core Switch', position: { x: 610, y: 250 } },
              { id: 'dhcp', type: 'server', label: 'DHCP Server\n10.0.0.50\n(anderes Subnetz)', position: { x: 780, y: 250 } },
            ],
            cables: [
              { id: 'c1', from: 'pc', to: 'sw', type: 'ethernet', startPos: { x: 110, y: 250 }, endPos: { x: 190, y: 250 } },
              { id: 'c2', from: 'sw', to: 'router', type: 'ethernet', startPos: { x: 270, y: 250 }, endPos: { x: 390, y: 250 } },
              { id: 'c3', from: 'router', to: 'core', type: 'fiber-single', startPos: { x: 470, y: 250 }, endPos: { x: 570, y: 250 } },
              { id: 'c4', from: 'core', to: 'dhcp', type: 'fiber-single', startPos: { x: 650, y: 250 }, endPos: { x: 740, y: 250 } },
            ],
            packets: [
              {
                id: 'relay',
                label: 'DHCP Relay',
                color: '#f97316',
                hops: [
                  { fromDevice: 'pc', toDevice: 'sw', hint: 'Der PC schickt einen DHCP Discover (Broadcast). Der Switch flutet ihn im VLAN.' },
                  { fromDevice: 'sw', toDevice: 'router', hint: 'Der Router empfängt den Broadcast — normalerweise stoppt er hier! Aber: "ip helper-address 10.0.0.50" ist konfiguriert.' },
                  { fromDevice: 'router', toDevice: 'core', hint: 'Der Router wandelt den Broadcast in ein Unicast um und schickt es gezielt an 10.0.0.50 (den DHCP-Server).' },
                  { fromDevice: 'core', toDevice: 'dhcp', hint: 'Der DHCP-Server empfängt die Anfrage, sieht woher die Anfrage kommt (Gateway-IP im Relay-Feld) und vergibt eine passende IP.' },
                ],
              },
            ],
            highlightDevices: ['router', 'dhcp'],
          },
          modal: {
            title: 'DHCP Relay Konfiguration',
            content: 'Problem: DHCP Discover ist ein Broadcast.\nRouter leiten keine Broadcasts weiter!\n\nLösung: ip helper-address\n\nRouter(config)# interface gi0/0\nRouter(config-if)# ip helper-address 10.0.0.50\n\nWas passiert:\n1. Router empfängt DHCP Broadcast\n2. Setzt seine eigene IP als "giaddr" (Gateway-Address)\n3. Leitet als Unicast an 10.0.0.50 weiter\n4. Server sieht giaddr und weiß: "Der PC ist im Netz 192.168.10.0/24"\n5. Server vergibt IP aus dem passenden Pool\n\n⚠ ip helper-address leitet auch andere UDP-Dienste weiter:\n• TFTP (69), DNS (53), TACACS (49), NetBIOS (137/138)',
          },
        },
        {
          title: 'Lease, Renew & Release',
          description:
            'Eine DHCP-Adresse ist nur geliehen (Lease). Nach der halben Lease-Zeit versucht der PC, seine IP zu verlängern (Renew). Wenn der Server nicht antwortet, versucht er nach 87,5% einen anderen Server (Rebind). Wird das Gerät ausgeschaltet, gibt es die IP zurück (Release).',
          analogy: 'Wie ein Hotelzimmer: Du hast es für 24h gebucht. Nach 12h fragst du: "Kann ich verlängern?" Wenn nicht, musst du beim Checkout das Zimmer freigeben.',
          scene: {
            devices: [
              { id: 'pc', type: 'pc', label: 'PC\n192.168.1.100\nLease: 24h', position: { x: 120, y: 250 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 350, y: 250 } },
              { id: 'dhcp', type: 'server', label: 'DHCP Server\nPool: .100-.200\n150 frei', position: { x: 600, y: 250 } },
            ],
            cables: [
              { id: 'c1', from: 'pc', to: 'sw', type: 'ethernet', startPos: { x: 170, y: 250 }, endPos: { x: 310, y: 250 } },
              { id: 'c2', from: 'sw', to: 'dhcp', type: 'ethernet', startPos: { x: 390, y: 250 }, endPos: { x: 560, y: 250 } },
            ],
            packets: [
              {
                id: 'renew',
                label: 'RENEW',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'pc', toDevice: 'sw', hint: 'Nach 12 Stunden (50% der Lease): Der PC schickt ein DHCP Request direkt an den Server — "Kann ich meine IP behalten?"' },
                  { fromDevice: 'sw', toDevice: 'dhcp', hint: 'Der Server antwortet mit ACK: "Ja, du darfst .100 für weitere 24h behalten!" Die Lease-Uhr wird zurückgesetzt.' },
                ],
              },
            ],
            highlightDevices: ['pc', 'dhcp'],
          },
          modal: {
            title: 'DHCP Lease-Zyklus',
            content: 'T1 = 50% der Lease (12h bei 24h Lease):\n→ Client schickt DHCP Request (Unicast) an seinen Server\n→ Bei Erfolg: Lease verlängert\n\nT2 = 87,5% der Lease (21h bei 24h Lease):\n→ Client schickt DHCP Request (Broadcast)\n→ Jeder DHCP-Server darf antworten\n→ Notfall-Versuch, falls der Original-Server weg ist\n\n100% = Lease abgelaufen:\n→ Client MUSS die IP aufgeben\n→ Neuer DORA-Prozess startet\n\nRelease:\n→ ipconfig /release (Windows)\n→ Client gibt IP sofort zurück\n→ Server markiert sie als frei\n\nRenew erzwingen:\n→ ipconfig /renew (Windows)\n→ Client versucht sofort T1-Renewal',
          },
        },
      ],
    },
    {
      id: '1.7b.3',
      title: 'DNS & DHCP zusammen',
      steps: [
        {
          title: 'Das Zusammenspiel: PC geht online',
          description:
            'Wenn du ein Ethernet-Kabel einsteckst, passiert alles automatisch: DHCP gibt dir eine IP, Gateway und DNS-Server. Dann nutzt dein Browser DNS, um Webseiten-Namen in IPs aufzulösen. Beides zusammen macht "Plug & Play" Netzwerke möglich — du musst nichts konfigurieren.',
          analogy: 'DHCP gibt dir die Eintrittskarte (IP). DNS ist der Reiseführer (Namen → Adressen). Zusammen: Du steckst das Kabel ein und surfst los.',
          scene: {
            devices: [
              { id: 'pc', type: 'pc', label: 'Neuer PC\n→ 192.168.1.100', position: { x: 60, y: 250 } },
              { id: 'sw', type: 'switch', label: 'Switch', position: { x: 200, y: 250 } },
              { id: 'router', type: 'router', label: 'Gateway\n192.168.1.1', position: { x: 350, y: 250 } },
              { id: 'dhcp', type: 'server', label: 'DHCP Server', position: { x: 350, y: 90 } },
              { id: 'dns', type: 'server', label: 'DNS Server\n8.8.8.8', position: { x: 550, y: 90 } },
              { id: 'web', type: 'server', label: 'google.de\n142.250.80.46', position: { x: 700, y: 250 } },
            ],
            cables: [
              { id: 'c1', from: 'pc', to: 'sw', type: 'ethernet', startPos: { x: 110, y: 250 }, endPos: { x: 160, y: 250 } },
              { id: 'c2', from: 'sw', to: 'router', type: 'ethernet', startPos: { x: 240, y: 250 }, endPos: { x: 310, y: 250 } },
              { id: 'c3', from: 'sw', to: 'dhcp', type: 'ethernet', startPos: { x: 220, y: 230 }, endPos: { x: 330, y: 120 } },
              { id: 'c4', from: 'router', to: 'dns', type: 'serial', startPos: { x: 380, y: 230 }, endPos: { x: 530, y: 115 } },
              { id: 'c5', from: 'router', to: 'web', type: 'fiber-single', startPos: { x: 390, y: 250 }, endPos: { x: 660, y: 250 } },
            ],
            packets: [
              {
                id: 'dhcpfirst',
                label: 'DHCP',
                color: '#fbbf24',
                hops: [
                  { fromDevice: 'pc', toDevice: 'sw', hint: 'Schritt 1: Kabel eingesteckt → PC schickt DHCP Discover: "Ich brauche eine IP!"' },
                  { fromDevice: 'sw', toDevice: 'dhcp', hint: 'Schritt 2: Der DHCP-Server vergibt: IP=192.168.1.100, Gateway=.1, DNS=8.8.8.8, Lease=24h' },
                ],
              },
              {
                id: 'dnsreq',
                label: 'DNS',
                color: '#a78bfa',
                hops: [
                  { fromDevice: 'pc', toDevice: 'sw', hint: 'Schritt 3: Du öffnest google.de → PC schickt eine DNS-Anfrage los.' },
                  { fromDevice: 'sw', toDevice: 'router', hint: 'Schritt 3a: Der Switch leitet den Frame an den Router (Default-Gateway) weiter.' },
                  { fromDevice: 'router', toDevice: 'dns', hint: 'Schritt 4: Router fragt den DNS-Server (8.8.8.8): "Welche IP hat google.de?" Antwort: "142.250.80.46"' },
                ],
              },
              {
                id: 'web',
                label: 'HTTPS',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'pc', toDevice: 'sw', hint: 'Schritt 5: Jetzt baut der PC eine HTTPS-Verbindung zu 142.250.80.46 auf — Frame geht zum Switch.' },
                  { fromDevice: 'sw', toDevice: 'router', hint: 'Schritt 6: Switch reicht weiter an den Router (Gateway).' },
                  { fromDevice: 'router', toDevice: 'web', hint: 'Schritt 7: Router leitet das Paket ins Internet zu google.de — Webseite lädt!' },
                ],
              },
            ],
            highlightDevices: ['dhcp', 'dns'],
          },
          modal: {
            title: 'Zusammenfassung: PC geht online',
            content: 'Was passiert beim Einstecken:\n\n1. DHCP Discover → "Ich brauche eine IP"\n2. DHCP Offer → "Nimm 192.168.1.100"\n3. DHCP Request → "Ok, ich nehme sie"\n4. DHCP ACK → "Bestätigt!"\n5. DNS Query → "Wo ist google.de?"\n6. DNS Reply → "142.250.80.46"\n7. TCP Handshake → Verbindung aufbauen\n8. HTTPS Request → Webseite laden\n\nOhne DHCP: Manuell IP eingeben\nOhne DNS: IP-Adresse manuell eintippen\nOhne beides: Kein Internetzugang möglich!\n\nTroubleshooting:\n• ipconfig /all → IP, Gateway, DNS prüfen\n• nslookup google.de → DNS testen\n• ping 8.8.8.8 → Verbindung testen',
          },
        },
      ],
    },
  ],
}

export default lesson
