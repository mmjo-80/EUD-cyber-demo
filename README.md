# EUD-cyber-demo

**CyberLab / Mercantec — automatisk cyberdemonstration til åbent hus.**

En statisk SOC-væg til storskærme med otte uafhængigt animerede terminaler: Nmap, SSH, Metasploit, SQLMap, Hashcat, Linux, Wazuh og Suricata. Der er ingen knapper, login, inputs eller scenariovalg. Visningen starter automatisk og roterer mellem rekognoscering, angrebssimulering og detektion/inddæmning hvert minut i en endeløs tre-minutters cyklus.

Alt er **SIMULATION**: kommandoer er tekststrenge, output er syntetisk, og ingen scannere eller shellkommandoer bliver kørt. Ingen backend, credentials, analytics, CDN, eksterne skrifttyper eller netværkskald fra siden. nginx blokerer browserens forbindelses-API'er med `connect-src 'none'`. Eksempeladresser bruger dokumentationsnettene 192.0.2.0/24 og 198.51.100.0/24 samt `.test`.

## Ubuntu Server — installation

Kræver Git, Docker Engine og Docker Compose-plugin. På en ny Ubuntu-server kan distributionens pakker bruges:

```bash
sudo apt update
sudo apt install -y git docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo git clone https://github.com/mmjo-80/EUD-cyber-demo.git /opt/EUD-cyber-demo
cd /opt/EUD-cyber-demo
sudo docker compose config --quiet
sudo docker compose up -d --build --wait
```

Hvis `docker-compose-v2` ikke findes i din Ubuntu-version, installér Docker Engine og Compose-plugin efter Dockers officielle Ubuntu-vejledning. Tjek med `sudo docker compose version`. Brug enten `sudo` eller en bruger med allerede konfigureret Docker-adgang.

Åbn `http://SERVERENS-IP:8080` på skærmcomputeren. Serveren behøver ingen desktop. Port 8080 skal være tilgængelig fra skærmcomputeren; tilpas eventuel eksisterende firewall til dit lokale netværk. Installation og første Docker-build kræver internet for GitHub, Ubuntu-pakker og nginx-imaget. Efter build kører demoen uden internet. Browseren henter kun de lokale statiske filer fra serveren.

## Fuldskærm / kiosk

Brug 1920×1080 eller 3840×2160 ved 100 % browserzoom for fire terminaler på tværs og to i højden. Tryk **F11** i Chrome/Chromium eller Firefox. På en Linux-skærmcomputer med grafisk session kan Chromium startes direkte:

```bash
chromium --kiosk --no-first-run http://SERVERENS-IP:8080
```

Slå skærmlås, dvale, screensaver og automatisk slukning fra på skærmcomputeren via dens systemindstillinger. Browseren skal tillade JavaScript. Ingen klik er nødvendige på websiden. Under 1100 px skifter layoutet til to kolonner, under 600 px til én. Reduceret bevægelse i operativsystemet giver langsommere output og fjerner dekorative animationer. Ingen lyd.

## Opdatering

Efter PR'en er flettet til `main`:

```bash
cd /opt/EUD-cyber-demo
sudo sh scripts/update.sh
```

Scriptet bruger `git pull --ff-only`, validerer Compose og genbygger/genstarter containeren. Lokale ændringer skal håndteres før opdatering, hvis Git melder konflikt. Genindlæs siden med Ctrl+Shift+R på skærmcomputeren efter opdatering. nginx sender `Cache-Control: no-cache`.

Manuelt svarer scriptet til:

```bash
sudo git pull --ff-only
sudo docker compose config --quiet
sudo docker compose up -d --build --wait
```

## Drift og fejlsøgning

```bash
sudo docker compose ps
sudo docker compose logs --tail=100 -f
sudo docker compose exec cyberlab nginx -t
curl --fail http://localhost:8080/healthz
sudo docker compose restart
# Stop:
sudo docker compose down
```

`restart: unless-stopped` starter containeren igen efter servergenstart, når Docker er aktiveret. Healthcheck viser, om nginx svarer; Docker genstarter ikke automatisk en container alene på grund af status `unhealthy`. Logs roteres, og terminalernes DOM begrænses til 70 linjer pr. vindue, så kioskvisningen kan køre vedvarende. Containeren kører som nginx-brugeren, med skrivebeskyttet filsystem og `/tmp` i RAM. Porten kan ændres i Compose, fx `8090:8080`.

## Lokal forhåndsvisning og kontrol

Ingen npm-pakker eller buildtrin kræves til websiden:

```bash
python3 -m http.server 8080 --directory site
# Åbn http://localhost:8080
```

Kør kontroller fra repoets rod med Node.js 22 eller nyere og Docker:

```bash
node --check site/app.js
node tests/check.mjs
sh -n scripts/update.sh
docker compose config --quiet
docker compose build
docker compose run --rm cyberlab nginx -t
docker compose up -d --wait
curl --fail http://localhost:8080/healthz
```

GitHub Actions kører disse kontroller samt HTTP- og sikkerhedsheaderkontrol. Den afhængighedsfrie JS-test simulerer 12 minutters drift, alle tre scener, otte streams, begrænset scrollback, reduceret bevægelse og genoptagelse efter suspendering. Det erstatter ikke visuel browserkontrol.

## Filer og tilpasning

- `site/index.html`: branding, oversigt og skærmstruktur.
- `site/style.css`: farver, 4×2-layout, 4K og responsive visninger.
- `site/app.js`: syntetiske scenarier, terminalsekvenser og animationer.
- `Dockerfile`, `nginx.conf`, `compose.yaml`: statisk nginx-hosting på port 8080.
- `scripts/update.sh`: opdatering af en eksisterende installation.

Mercantec-navnet er tekst; der medfølger ikke et officielt logo. MITRE ATT&CK-referencer og værktøjsnavne giver undervisningskontekst. Terminaloutput og hændelsesregler er illustrative og er ikke egentlige værktøjsresultater eller validerede sikkerhedsdetektioner.
