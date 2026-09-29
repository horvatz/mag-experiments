# Neodvisni pregled P03

Pregled specifikacije, implementacije, testov in verification.md je zaključen za vseh R01–R12. Konkretnih neskladij ni; popravki specifikacije ali implementacije niso zahtevani. Spodnja dokazila testov so iz predanega check.log, ne iz lastnega zagona pregledovalca.

| Zahteva | Neodvisni pregled kode in pokritosti |
| --- | --- |
| R01 | Privzeti useState(defaultTaskFilters), celoten odgovor API in stabilen Array.filter; A01/A05/A06 ter D01 ustrezno pokrivajo 0, 1 in 13 opravil. |
| R02 | normalizeSearch natančno uporablja NFD, U+0300–U+036F in male črke na obeh straneh; združena so vsa štiri zahtevana polja. A01/A07 preverjata Unicode in posamezna polja. |
| R03 | Razdelitev po /\s+/, filter(Boolean), every in includes zagotavljajo vse dobesedne besede, neodvisen vrstni red in prazen vnos. A01/A07 preverjata ločila in beline. |
| R04 | filterTasks poveže iskanje, stanje in osebo z &&; osebo primerja s === brez normalizacije. A02 preverja vsa stanja in Črt/Crt/črt. |
| R05 | Set imen izvira iz vseh tasks, izloči samo prazen niz in ohrani natančne vrednosti; key projekta ponastavi izbiro. A02/A03/A04/A05 pokrivajo možnosti in menjavo. |
| R06 | Isti visibleTasks napaja oba pogleda; TaskBoard filtrira po statusu, stanje filtrov ostane v ProjectView. A02 preverja ID-je, kontrole in stolpce. |
| R07 | ProjectView ima key={project.id}; menjava ga znova ustvari, useResource loči podatke s ključem poti in prekliče stare zahteve. A03 ter predani osnovni regresiji pokrivajo menjavo. |
| R08 | Filtri so samo lokalno stanje React; navigation zapisuje samo projekt/opravilo/pogled. A03 preverja reload obeh pogledov, URL in odsotnost shrambe. |
| R09 | Status N/M uporablja visibleTasks.length/tasks.length; pregled stanj in TaskBoard štejeta vidne rezultate, tudi nič. A02/A04/A05/A06 ter D04 ustrezajo. |
| R10 | Pogoj tasks.length > 0 && visibleTasks.length === 0 loči nič zadetkov od praznega projekta; kontrole in preklop ostajajo. A04/A05 in osnovni prazni stanji pokrivajo oba pogleda. |
| R11 | En setFilters(defaultTaskFilters) ponastavi tri kontrole; Array.filter ne sortira in ne spreminja zapisov. A02 preverja vrstni red/besedila, A07 zamrznjene podatke. |
| R12 | Kontrole so označene, data-task-id in dostopna imena ohranjeni; dogodki filtrov spreminjajo samo lokalno stanje. CSS uporablja Folio in notranje drsenje; A03/A06, razvojni in osnovni testi pokrivajo navigacijo, širino in odsotnost pisanja. Vizualni pregled predanih posnetkov je zaključen brez ugotovljenih odstopanj. |

## Lastno ciljno preverjanje

Po pregledu vseh R01–R12 je pregledovalec izvedel inline skripto Node/Playwright prek chromium.connect(wsEndpoint) iz task/browser.json, z lokalnim strežnikom WEB_PORT=5193 API_PORT=3123 npm run dev. GET prestrezanje je vrnilo 15 novih opravil v nesortiranem vrstnem redu z enakimi naslovi in veljavnim prestopnim datumom. Preverjeni so bili stabilni ID-ji treh zadetkov v vsakem stolpcu, natančna razlika sestavljenega/razstavljenega imena Črt, isti rezultati in kontrole ob preklopu v preglednico, števci, čiščenje, širina 390 px ter odsotnost pisalnih zahtev. Vse trditve so uspele (exit 0).

```json
{
  "scenario": "Reviewer: stable order of multiple cards per column, exact composed/decomposed names, 390px, read-only",
  "result": "PASS",
  "records": 15,
  "filtered": 9,
  "exactName": 5,
  "boardWidth": {
    "scroll": 390,
    "viewport": 390
  },
  "tableWidth": {
    "scroll": 390,
    "viewport": 390
  },
  "mutations": []
}
```

## Dokazila in omejitve

Pregledovalec je prebral celoten docs/agent/check.log: lint, TypeScript, Vite in 53/53 testov so v predanem zagonu uspešni. Testne datoteke A01–A07 in D01–D04 ter pripomočki so bili pregledani glede dejanskih trditev in sledljivosti v verification.md. Celotnega že uspešnega zagona nisem ponavljal; zgornje ciljno preverjanje dopolnjuje prej samo statično preverjen vrstni red več kartic v istem stolpcu.

Samostojno sem pregledal predane desktop-table.png, desktop-board.png, mobile-table.png in mobile-board.png ter primerjal mobilno preglednico in namizno tablo z docs/predogled/telefon.png in tabla.png ter docs/dizajn.md. Folio, navigacija, barve, tipografija in kartice so ohranjeni; nove kontrole sledijo obstoječim gradnikom. Avtomatske primerjave slik ni bilo.

Nedostopni končni testi niso bili izvedeni. Okolje dovoljuje lokalne storitve te naloge; javni internet ni bil uporabljen. Lastna skripta je uporabila predpisani chromium.connect, brez chromium.launch; drugi brskalniki niso bili preverjeni. Git ni bil potreben in ga nisem zaganjal; omejitev xcrun je navedena le v implementerjevi predaji. Lokalni strežnik pregledovalca je ustavljen.

Spremenjena sta samo dokumenta pregledovalca review.json in review.md; koda, specifikacija, infrastruktura in testi niso bili spreminjani. Končna predaja je zaključena več kot 60 sekund pred rokom faze.
