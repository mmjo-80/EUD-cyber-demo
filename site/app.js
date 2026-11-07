'use strict';
// Every command and result below is display-only text. Nothing is executed.
(() => {
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = values => values[random(0, values.length - 1)];
  const scenes = [
    { title: 'Mapping the surface', caption: 'Rekognoscering · Find sporene, før andre gør det.', posture: 'OBSERVING', technique: 'T1046', tactic: 'Discovery', signal: 'Network discovery pattern identified' },
    { title: 'Following the intrusion', caption: 'Angrebssimulering · Fra første spor til digitalt fodaftryk.', posture: 'CORRELATING', technique: 'T1110', tactic: 'Credential Access', signal: 'Credential access sequence correlated' },
    { title: 'Turning signals into defence', caption: 'Detektion & respons · Se truslen. Bryd kæden.', posture: 'CONTAINED', technique: 'T1059', tactic: 'Execution', signal: 'Endpoint isolated · incident contained' }
  ];
  const specs = [
    ['NETWORK RECON', 'NMAP', '#48e1dc', 'recon@cyberlab:~$', 'T1046 / DISCOVERY'],
    ['SECURE SHELL', 'SSH', '#a9e779', 'analyst@jumpbox:~$', 'T1021 / REMOTE SERVICES'],
    ['EXPLOIT FRAMEWORK', 'MSF', '#b59cff', 'msf6 >', 'T1059 / EXECUTION'],
    ['WEB ASSESSMENT', 'SQLMAP', '#f2bf71', 'web@cyberlab:~$', 'T1190 / INITIAL ACCESS'],
    ['CREDENTIAL LAB', 'HASHCAT', '#f2bf71', 'audit@gpu-node:~$', 'T1110 / CREDENTIAL ACCESS'],
    ['ENDPOINT RECON', 'LINUX', '#48e1dc', 'student@lab-node:~$', 'T1082 / SYSTEM DISCOVERY'],
    ['ENDPOINT DETECTION', 'WAZUH', '#ff7786', 'soc@wazuh:~$', 'EDR / EVENT CORRELATION'],
    ['NETWORK DEFENCE', 'SURICATA', '#a9e779', 'soc@sensor-01:~$', 'NDR / THREAT DETECTION']
  ];
  const row = (text, tone = '') => ({ text, tone });
  const stamp = () => new Date().toLocaleTimeString('da-DK', { hour12: false, timeZone: 'Europe/Copenhagen' });
  function sequence(index, phase, cycle) {
    const host = `192.0.2.${[12, 24, 37, 48][cycle % 4]}`;
    const node = `lab-node-${String(cycle % 8 + 1).padStart(2, '0')}`;
    const scene = scenes[phase];
    const command = text => row(`${specs[index][3]} ${text}`, 'command');
    switch (index) {
      case 0: return [command(`nmap -sV --open ${host}`), row('Starting Nmap 7.95 · synthetic scan', 'dim'), row(`Nmap scan report for ${node} (${host})`, 'info'), row(`Host is up (${(random(2, 18) / 1000).toFixed(3)}s latency).`), row('PORT     STATE SERVICE   VERSION', 'info'), row('22/tcp   open  ssh       OpenSSH 9.6'), row('80/tcp   open  http      nginx 1.28'), row('443/tcp  open  https     lab gateway'), row(`Service fingerprint: ${pick(['Ubuntu Linux', 'Debian Linux', 'Linux 6.x'])}`), row(`Nmap done: 1 host up · ${random(8, 16)}.42 seconds`, 'success'), row(phase === 2 ? '[SOC] Discovery signature contained' : '[SOC] T1046 / discovery event observed', phase === 2 ? 'success' : 'warning')];
      case 1: return [command(`ssh analyst@${host}`), row(`Connecting to ${node} port 22...`, 'dim'), row('Key exchange: curve25519-sha256'), row('Host fingerprint: SHA256:DEMO/f1c710nalLab'), row('Authentication accepted (synthetic key)', 'success'), row('Welcome to CyberLab · isolated training node', 'info'), command('whoami && hostname'), row(`analyst\n${node}`, 'success'), command('journalctl -u ssh -n 3 --no-pager'), row(`${stamp()} sshd: Accepted publickey for analyst`), row(`${stamp()} audit: session ${random(101, 999)} opened`), row('Session closed · audit trail preserved', 'dim')];
      case 2: return [command('use auxiliary/scanner/ssh/ssh_version'), row('[*] Loading synthetic module catalogue', 'dim'), command(`set RHOSTS ${host}`), row(`RHOSTS => ${host}`), command('run'), row(`[*] ${host}:22 · SSH service discovered`), row('[+] Banner: SSH-2.0-OpenSSH_9.6', 'success'), row('[*] Correlating lab service fingerprint'), row(`[*] ATT&CK context: ${scene.tactic}`, 'info'), row(phase === 2 ? '[-] Simulated execution blocked by policy' : '[+] Training evidence recorded · no payload sent', phase === 2 ? 'alert' : 'success'), row('[*] Auxiliary module execution complete', 'dim')];
      case 3: return [command(`sqlmap -u 'http://portal.test/item?id=${cycle % 9 + 1}' --batch`), row('[*] Synthetic assessment session started', 'dim'), row(`[${stamp()}] testing connection to training portal`), row('[INFO] checking application response stability'), row('[INFO] testing parameter: id'), row('[INFO] comparing synthetic response profiles'), row('[WARNING] simulated boolean response mismatch', 'warning'), row('Parameter: id (GET) · training finding', 'info'), row(`Backend DBMS: ${pick(['PostgreSQL', 'MariaDB', 'SQLite'])}`), row(phase === 2 ? '[DEFENCE] WAF policy matched · request blocked' : '[SOC] Web anomaly forwarded to correlation', phase === 2 ? 'success' : 'warning'), row('[*] Assessment complete · fictional data only', 'dim')];
      case 4: return [command(`hashcat -m 1400 demo-hashes.txt demo-words.txt`), row('hashcat · synthetic credential audit', 'dim'), row('Device #1: CyberLab virtual compute node'), row('Hashes: 4 digests; 4 unique salts'), row('Dictionary: demo-words.txt · 4096 candidates'), ...[16, 43, 78, 100].map(p => row(`Progress [${'█'.repeat(Math.round(p / 10)).padEnd(10, '░')}] ${p}%`, p === 100 ? 'success' : '')), row(`Speed: ${(random(120, 260) / 10).toFixed(1)} MH/s · simulated`), row(`Recovered: ${phase === 0 ? '1' : '3'}/4 demo digests`, 'warning'), row('Recommendation: long passphrases + MFA', 'success'), row('Session complete · no real passwords used', 'dim')];
      case 5: return [command(pick(['uname -a', 'cat /etc/os-release', 'hostnamectl'])), row(`Linux ${node} 6.8.0-generic x86_64`, 'info'), row('PRETTY_NAME="Ubuntu CyberLab Training"'), command('ip -brief address'), row('lo       UNKNOWN  127.0.0.1/8'), row(`eth0     UP       ${host}/24`, 'success'), command('ps -eo pid,comm,%cpu --sort=-%cpu | head -5'), row('  PID COMMAND         %CPU', 'info'), row(`  ${random(210, 490)} telemetry-agent  2.1`), row('  804 nginx            0.4'), command('find /opt/lab -maxdepth 1 -type f'), row('/opt/lab/corporate-secret-DEMO.txt', 'warning'), row('[audit] File access observed · T1083', 'dim')];
      case 6: return [command('tail -f /var/ossec/logs/alerts/alerts.json'), row(`${stamp()} agent=${node} status=active`, 'success'), row(`rule.id=${pick(['5710', '5712', '550', '100002'])} level=${random(5, 12)}`, 'warning'), row(`MITRE ${scene.technique} · ${scene.tactic}`, 'info'), row(`srcip=${host} user=demo-analyst`), row(`[ALERT] ${scene.signal}`, phase === 2 ? 'success' : 'alert'), row('Correlation: endpoint + network evidence'), row(`Incident: LAB-${String(cycle + 1042).padStart(5, '0')}`, 'info'), row(`Action: ${phase === 2 ? 'isolate training endpoint' : 'enrich & correlate event'}`, 'warning'), row(phase === 2 ? '[OK] Active response complete · contained' : '[OK] Evidence indexed · analyst notified', 'success'), row('Integrity: audit chain verified', 'dim')];
      default: return [command('tail -f /var/log/suricata/fast.log'), row(`${stamp()} [sensor-01] inspecting demo stream`, 'dim'), row(`[1:2001219:1] LAB ${scene.signal}`, phase === 2 ? 'success' : 'alert'), row(`[Classification: ${pick(['Network Scan', 'Suspicious Traffic', 'Policy Event'])}]`, 'warning'), row(`[Priority: ${phase === 2 ? 3 : 2}] {TCP}`), row(`${host}:${random(40000, 60000)} -> 198.51.100.10:443`), row(`flow_id: ${random(100000, 999999)} · app_proto: tls`), row('TLS fingerprint matched training profile'), row(`MITRE ATT&CK: ${scene.technique}`, 'info'), row(`Verdict: ${phase === 2 ? 'DROP / simulated containment' : 'ALERT / evidence retained'}`, phase === 2 ? 'success' : 'warning'), row('Packets: synthetic · live capture disabled', 'dim')];
    }
  }
  const grid = document.getElementById('terminals');
  let phase = 0;
  let eventCount = 12480;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const streams = specs.map((spec, index) => {
    const panel = document.createElement('article');
    panel.className = 'terminal';
    panel.style.setProperty('--accent', spec[2]);
    panel.innerHTML = `<div class="terminal-head"><span class="terminal-number">0${index + 1}</span><h3>${spec[0]}</h3><span class="terminal-tag">${spec[1]}</span><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span></div><div class="terminal-body" aria-label="${spec[0]} simulation"></div><div class="terminal-foot"><span>● STREAM ACTIVE</span><span>${spec[4]}</span></div><div class="activity" aria-hidden="true"></div>`;
    panel.querySelector('.activity').style.animationDelay = `${-index * .71}s`;
    grid.append(panel);
    const body = panel.querySelector('.terminal-body');
    const state = { body, index, cycle: random(0, 10), queue: [], next: 0, typing: null, position: 0, current: null };
    // Populate immediately so every screen starts with all eight streams visible.
    sequence(index, 0, state.cycle).slice(0, 7).forEach(item => append(state, item));
    state.next = performance.now() + random(200, 2400);
    return state;
  });
  function append(state, item) {
    const line = document.createElement('div');
    line.className = `line ${item.tone}`;
    line.textContent = item.text;
    state.body.append(line);
    // Bounded DOM and scrollback for unattended, multi-day kiosk sessions.
    while (state.body.children.length > 70) state.body.firstElementChild.remove();
    state.body.scrollTop = state.body.scrollHeight;
    return line;
  }
  const spark = document.getElementById('spark');
  for (let i = 0; i < 22; i++) {
    const bar = document.createElement('i');
    bar.style.height = `${random(15, 100)}%`;
    spark.append(bar);
  }
  const sceneDuration = 60000;
  const started = performance.now();
  let lastHud = -1000;
  function tick(now) {
    const elapsed = now - started;
    const nextPhase = Math.floor(elapsed / sceneDuration) % scenes.length;
    if (nextPhase !== phase) {
      phase = nextPhase;
      const scene = scenes[phase];
      document.body.dataset.phase = String(phase);
      document.getElementById('scene-number').textContent = `0${phase + 1} / 03`;
      document.getElementById('scene-title').textContent = scene.title;
      document.getElementById('scene-caption').textContent = scene.caption;
      document.getElementById('posture').textContent = scene.posture;
      document.getElementById('technique').textContent = `MITRE ATT&CK · ${scene.technique}`;
      document.getElementById('intel').textContent = `SURICATA + WAZUH · ${scene.signal} · ${scene.technique}`;
      streams.forEach(state => { state.queue = []; });
    }
    for (const state of streams) {
      if (now < state.next) continue;
      if (state.typing) {
        state.position = Math.min(state.current.text.length, state.position + random(1, 3));
        state.typing.textContent = state.current.text.slice(0, state.position);
        state.body.scrollTop = state.body.scrollHeight;
        if (state.position === state.current.text.length) {
          state.typing.classList.remove('typing');
          state.typing = null;
          state.next = now + random(350, 1300);
        } else state.next = now + random(24, 85);
        continue;
      }
      if (!state.queue.length) {
        state.queue = sequence(state.index, phase, state.cycle++);
        append(state, row(`── SESSION ${String(state.cycle).padStart(3, '0')} / ${stamp()} ──`, 'dim'));
      }
      const item = state.queue.shift();
      if (item.tone === 'command' && !reduced) {
        state.current = item;
        state.position = 0;
        state.typing = append(state, row('', 'command typing'));
        state.next = now + 50;
      } else {
        append(state, item);
        eventCount += random(1, 9);
        state.next = now + (reduced ? random(1400, 2600) : random(170, 950));
        if (!state.queue.length) state.next += random(1800, 5500);
      }
    }
    if (now - lastHud >= 1000) {
      document.getElementById('clock').textContent = stamp();
      document.getElementById('events').textContent = eventCount.toLocaleString('en-US');
      document.getElementById('scene-progress').style.width = `${(elapsed % sceneDuration) / sceneDuration * 100}%`;
      if (!reduced) [...spark.children].forEach(bar => { bar.style.height = `${random(15, 100)}%`; });
      lastHud = now;
    }
  }
  // One scheduler; no catch-up floods after tab suspension and no unbounded timers.
  tick(started);
  window.setInterval(() => tick(performance.now()), reduced ? 200 : 40);
})();
