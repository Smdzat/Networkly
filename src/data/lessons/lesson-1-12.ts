import type { Lesson } from '../../types'

const lesson: Lesson = {
  id: '1.12',
  number: '1.12',
  title: 'Virtualisierung',
  subtitle: 'Explain virtualization fundamentals',
  subtopics: [
    {
      id: '1.12.1',
      title: 'Server-Virtualisierung',
      steps: [
        {
          title: 'Ein physischer Server, viele virtuelle',
          description:
            'Mit Virtualisierung laufen auf einem physischen Server mehrere virtuelle Maschinen (VMs) — jede mit eigenem OS. Ein Hypervisor verwaltet die Hardware-Ressourcen. Type 1 (Bare-Metal): ESXi, Hyper-V. Type 2 (Hosted): VirtualBox, VMware Workstation.',
          analogy: 'Wie ein Mehrfamilienhaus: Ein Gebäude (physischer Server), viele Wohnungen (VMs), jede komplett unabhängig.',
          scene: {
            devices: [
              { id: 'physical', type: 'server', label: 'Physischer Server\nESXi Hypervisor\n128 GB RAM, 64 Cores', position: { x: 80, y: 270 } },
              { id: 'vm1', type: 'server', label: 'VM 1 — Webserver\nUbuntu 22.04\n4 vCPU, 8 GB', position: { x: 380, y: 100 } },
              { id: 'vm2', type: 'server', label: 'VM 2 — Datenbank\nWindows Server\n8 vCPU, 32 GB', position: { x: 380, y: 270 } },
              { id: 'vm3', type: 'server', label: 'VM 3 — Mail\nCentOS\n2 vCPU, 4 GB', position: { x: 380, y: 430 } },
              { id: 'vsw', type: 'switch', label: 'vSwitch\n(virtuell)', position: { x: 600, y: 270 } },
              { id: 'sw', type: 'switch', label: 'Physischer\nSwitch', position: { x: 760, y: 270 } },
            ],
            cables: [
              { id: 'c1', from: 'physical', to: 'vm1', type: 'ethernet', label: 'vNIC' },
              { id: 'c2', from: 'physical', to: 'vm2', type: 'ethernet', label: 'vNIC' },
              { id: 'c3', from: 'physical', to: 'vm3', type: 'ethernet', label: 'vNIC' },
              { id: 'c4', from: 'vm1', to: 'vsw', type: 'ethernet' },
              { id: 'c5', from: 'vm2', to: 'vsw', type: 'ethernet' },
              { id: 'c6', from: 'vm3', to: 'vsw', type: 'ethernet' },
              { id: 'c7', from: 'vsw', to: 'sw', type: 'ethernet', label: 'pNIC Trunk' },
            ],
            packets: [
              {
                id: 'inter-vm',
                label: 'Inter-VM',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'vm1', toDevice: 'vsw', hint: 'Webserver-VM braucht Daten von der Datenbank-VM. Frame geht zum vSwitch — der existiert nur als Software im Hypervisor.' },
                  { fromDevice: 'vsw', toDevice: 'vm2', hint: 'vSwitch leitet direkt an VM 2. Der Traffic verlässt nie die physische Hardware — schnell und ohne Kabel.' },
                ],
              },
            ],
            highlightDevices: ['physical'],
          },
          modal: {
            title: 'Hypervisor-Typen',
            content: 'Type 1 (Bare-Metal):\n→ Direkt auf Hardware installiert\n→ VMware ESXi, Microsoft Hyper-V, KVM\n→ Für Datacenter, Production\n\nType 2 (Hosted):\n→ Läuft auf einem normalen OS\n→ VirtualBox, VMware Workstation\n→ Für Test/Lab\n\nVorteile Virtualisierung:\n• Server-Konsolidierung (weniger Hardware)\n• Snapshots & Backups\n• Live-Migration (vMotion)\n• Schnelles Provisioning\n• Isolation zwischen VMs',
          },
        },
      ],
    },
    {
      id: '1.12.2',
      title: 'Container',
      steps: [
        {
          title: 'Container: Leichtgewichtige Isolation',
          description:
            'Container (Docker, Podman) sind leichter als VMs: Sie teilen sich den Kernel des Hosts und packen nur die App + Abhängigkeiten ein. Starten in Sekunden statt Minuten. Kubernetes orchestriert viele Container im Cluster.',
          analogy: 'VMs = eigene Wohnungen mit eigener Heizung. Container = Zimmer im selben Haus, geteilte Infrastruktur aber eigene Schlösser.',
          scene: {
            devices: [
              { id: 'host', type: 'server', label: 'Host OS\nDocker Engine\nLinux Kernel', position: { x: 80, y: 270 } },
              { id: 'ct1', type: 'server', label: 'Container 1\nNginx :80', position: { x: 350, y: 100 } },
              { id: 'ct2', type: 'server', label: 'Container 2\nNode.js :3000', position: { x: 350, y: 270 } },
              { id: 'ct3', type: 'server', label: 'Container 3\nPostgres :5432', position: { x: 350, y: 430 } },
              { id: 'net', type: 'switch', label: 'Docker Bridge\n172.17.0.0/16', position: { x: 580, y: 270 } },
              { id: 'ext', type: 'cloud', label: 'Extern\nPort-Mapping\nHost:8080→Nginx:80', position: { x: 750, y: 270 } },
            ],
            cables: [
              { id: 'c1', from: 'host', to: 'ct1', type: 'ethernet' },
              { id: 'c2', from: 'host', to: 'ct2', type: 'ethernet' },
              { id: 'c3', from: 'host', to: 'ct3', type: 'ethernet' },
              { id: 'c4', from: 'ct1', to: 'net', type: 'ethernet' },
              { id: 'c5', from: 'ct2', to: 'net', type: 'ethernet' },
              { id: 'c6', from: 'ct3', to: 'net', type: 'ethernet' },
              { id: 'c7', from: 'net', to: 'ext', type: 'ethernet' },
            ],
            packets: [
              {
                id: 'request',
                label: 'HTTP :8080',
                color: '#4ade80',
                hops: [
                  { fromDevice: 'ext', toDevice: 'net', hint: 'User aus dem Internet öffnet http://host:8080. Docker hat Port 8080 des Hosts auf Port 80 des Nginx-Containers gemappt.' },
                  { fromDevice: 'net', toDevice: 'ct1', hint: 'Docker Bridge leitet die Anfrage an den Nginx-Container weiter. Container sieht das wie ganz normalen Traffic auf Port 80.' },
                ],
              },
            ],
            highlightDevices: ['host', 'ct1', 'ct2', 'ct3'],
          },
          modal: {
            title: 'VM vs. Container',
            content: 'VM:\n• Eigenes OS (GB groß)\n• Startet in Minuten\n• Starke Isolation\n• Hypervisor nötig\n\nContainer:\n• Teilt Host-Kernel (MB groß)\n• Startet in Sekunden\n• Prozess-Isolation\n• Container-Runtime nötig\n\nDocker Networking:\n• Bridge: Default, internes Netz\n• Host: Teilt Host-Network-Stack\n• Overlay: Multi-Host (Swarm/K8s)\n• macvlan: Container bekommt eigene MAC',
          },
        },
      ],
    },
    {
      id: '1.12.3',
      title: 'VRFs — Virtual Routing & Forwarding',
      steps: [
        {
          title: 'VRF: Mehrere Router in einem',
          description:
            'VRF erstellt isolierte Routing-Tabellen auf einem Router. Jede VRF-Instanz verhält sich wie ein eigener Router — die Netzwerke können sich nicht sehen, selbst wenn sie die gleichen IP-Bereiche nutzen. ISPs nutzen VRFs (MPLS VPN) um Kunden zu trennen.',
          analogy: 'Wie getrennte Briefkästen in einem Gebäude: Jeder Mieter (VRF) hat seinen eigenen, der Postbote verwechselt nichts.',
          scene: {
            devices: [
              { id: 'pe', type: 'router', label: 'PE Router\nVRF Kunde-A\nVRF Kunde-B', position: { x: 400, y: 120 } },
              { id: 'sw1', type: 'switch', label: 'Kunde A\nSwitch', position: { x: 130, y: 300 } },
              { id: 'sw2', type: 'switch', label: 'Kunde B\nSwitch', position: { x: 670, y: 300 } },
              { id: 'pc1', type: 'pc', label: 'Kunde A\n10.0.0.10', position: { x: 130, y: 450 } },
              { id: 'pc2', type: 'pc', label: 'Kunde B\n10.0.0.10\n(gleiche IP!)', position: { x: 670, y: 450 } },
              { id: 'mpls', type: 'cloud', label: 'MPLS WAN\nISP Backbone', position: { x: 400, y: 300 } },
            ],
            cables: [
              { id: 'c1', from: 'pe', to: 'sw1', type: 'ethernet', label: 'VRF A' },
              { id: 'c2', from: 'pe', to: 'sw2', type: 'ethernet', label: 'VRF B' },
              { id: 'c3', from: 'sw1', to: 'pc1', type: 'ethernet' },
              { id: 'c4', from: 'sw2', to: 'pc2', type: 'ethernet' },
              { id: 'c5', from: 'pe', to: 'mpls', type: 'fiber-single', label: 'MPLS Label' },
            ],
            packets: [
              {
                id: 'vrfa',
                label: 'VRF-A Data',
                color: '#60a5fa',
                hops: [
                  { fromDevice: 'pc1', toDevice: 'sw1', hint: 'Kunde A schickt Traffic — IP 10.0.0.10. Sieht aus wie eine private Adresse, aber dank VRF einzigartig im Universum von Kunde A.' },
                  { fromDevice: 'sw1', toDevice: 'pe', hint: 'PE-Router empfängt das Paket auf einem Interface, das zu VRF "Kunde-A" gehört. Er schaut nicht in die globale Routing-Tabelle, sondern in die VRF-A-Tabelle.' },
                  { fromDevice: 'pe', toDevice: 'mpls', hint: 'PE-Router klebt ein MPLS-Label aufs Paket — Kunde-B hätte die gleiche IP, aber das Label sagt klar: "Das ist VRF A". Im Backbone werden nur Labels geswitcht.' },
                ],
              },
            ],
            highlightDevices: ['pe'],
          },
          modal: {
            title: 'VRF Konfiguration',
            content: 'ip vrf Kunde-A\n rd 65000:1\n route-target export 65000:1\n route-target import 65000:1\n\ninterface Gi0/1\n ip vrf forwarding Kunde-A\n ip address 10.0.0.1 255.255.255.0\n\nshow ip vrf → Alle VRFs anzeigen\nshow ip route vrf Kunde-A → Routing-Tabelle\n\nGleiche IP (10.0.0.10) in beiden VRFs:\n→ Kein Konflikt, komplett isoliert\n→ Wie zwei parallele Universen',
          },
        },
      ],
    },
  ],
}

export default lesson
