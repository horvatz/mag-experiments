# P03 — implementacija in preverjanje

Začetni zapis implementerja. Prebrani so PROJECT_RULES.md, task/instructions.md,
task/specification-template.md in predana specification.md. Izvirne zahteve
R01–R12 ostajajo obvezne. Specifikacija za zdaj nima ugotovljenih napak.

## Začetni načrt (stanje ob začetku, pred izvedbo)

- Pregled obstoječega Folio, lokalnega stanja projekta in testnih pripomočkov.
- R01–R05, R11: lokalne kontrole, normalizirano dobesedno iskanje vseh besed,
  natančen filter oseb, stabilno filtriranje in ponastavitev.
- R06–R10: skupen seznam rezultatov za oba pogleda/števce, reset ob menjavi
  projekta in osvežitvi, ločitev praznega projekta od nič zadetkov.
- R12: ohranitev navigacije, podrobnosti, videza in širine 390 px, brez pisalnih API klicev.
- Dodatni testi v tests/agent/ za Unicode, ločila, kombinacije, življenjsko dobo,
  praznino, vrstni red, števce in omrežne zahteve.
- Pred daljšim preverjanjem preveriti čas; izvesti npm run check in po potrebi
  ciljno preverjanje. Rezultati še niso znani; noben test še ni bil izveden.

## Omejitve

Spreminjam samo src/, tests/agent/ in lastne zapise docs/agent/. Specifikacija,
zgodovina in pregled so v lasti drugih vlog. Brez drugih agentov, povezovalnikov,
oddaljenih repozitorijev ali javnega interneta. Chromium je na voljo prek
chromium.connect(wsEndpoint) iz task/browser.json; chromium.launch ni podprt.
Nedostopnih končnih testov ne bom navajal kot opravljenih. Predajo zaključim
najpozneje minuto pred rokom faze 2026-09-23T22:37:44.476Z.

## Izvedene spremembe

- `src/taskFilters.ts`: normalizacija NFD/U+0300–U+036F, vse besede kot
  dobesedni podnizi štirih polj, IN s stanjem in točno osebo, stabilen filter.
- `src/App.tsx`: lokalno stanje treh kontrol v obstoječem ključu projekta;
  osebe iz celotnega seznama; en seznam za preglednico, tablo, pregled stanj,
  značko in footer; rezultat N/M, ponastavitev ter ločeni prazni stanji.
- `src/styles.css`: odzivne kontrole z obstoječimi barvami, robovi in tipografijo.
- `tests/agent/filters.spec.ts`: A01–A07 pokrivajo splošne podatke (0/1/13),
  iskanje, kombinacije, poglede/števce, življenjsko dobo, podrobnosti, praznino,
  dolga imena pri 390 px, prepoved pisanja in nespremenjene zamrznjene podatke.

Začet prvi `npm run check`, dnevnik `docs/agent/check.log`. Ob tem vmesnem
zapisu rezultat še ni bil znan; končni rezultat je spodaj.

## Končni rezultati in predaja pregledovalcu

Implementacija je zaključena. `npm run check` je vrnil **exit 0**:

- ESLint uspešen.
- TypeScript (`tsc --noEmit`) uspešen.
- Produkcijska gradnja Vite uspešna.
- **53/53 testov uspešnih v 20,7 s**: 38 osnovnih (API in oba pogleda naprav),
  8 razvojnih P03 (D01–D04 namizno/mobilno), 7 lastnih A01–A07.
- Celoten dnevnik: [check.log](check.log). Poročilo Playwright:
  `playwright-report/html/index.html`.

Vsi spodaj navedeni testi so bili dejansko izvedeni v tem uspešnem zagonu.
Oznake A01–A07 so začetki imen testov v `tests/agent/filters.spec.ts`;
D01–D04 so začetki imen v `tests/development/P03.spec.ts`.

| Zahteva | Pogoj in izvedba | Izveden test / dokaz in rezultat |
| --- | --- | --- |
| R01 | `F0=("",all,all)`, stabilno zaporedje vseh opravil; `src/taskFilters.ts:5`, `src/App.tsx:14` in `:63` | A01: vseh 13 ID-jev v podanem nesortiranem zaporedju in privzete kontrole; A05: 0; A06: 1; D01. Uspešno. |
| R02 | NFD, odstranitev U+0300–U+036F, male črke na obeh straneh; združeni id/title/description/assignee; `src/taskFilters.ts:7` in `:14` | A01: posamezna polja, Č/č/c, Ž, razstavljeno besedilo; A07: razstavljen iskalni niz; D01. Uspešno. |
| R03 | `every(includes)` po nepraznih besedah; `src/taskFilters.ts:12` in `:15` | A01: obrnjen vrstni red, beline, manjkajoča beseda, dobesedni `.*`, `[` in `=SUM(A1)`; A07: LF/CR/tab. Uspešno. |
| R04 | Iskanje IN stanje IN natančna oseba; `src/taskFilters.ts:15` | A02: vsi trije filtri, vse tri vrednosti stanja, različna Črt/Crt/črt in ponastavitev; D02. Uspešno. |
| R05 | Set nepraznih izvornih imen iz celotnega projekta; `src/App.tsx:16` in `:52` | A02: brez podvojenih možnosti in tri podobna imena; A04: iste možnosti pri nič zadetkih; A03: druga oseba projekta; A05: samo all pri praznini. Uspešno. |
| R06 | En `visibleTasks` za oba pogleda; `src/App.tsx:15`, `:59`, `:63`; obstoječi `TaskBoard` filtrira stolpce po stanju | A02: isti ID-ji, stolpci in ohranitev vseh kontrol pri preklopu; A04: preklop pri nič zadetkih; D02. Uspešno. |
| R07 | Lokalno stanje pod `key={project.id}`; `src/App.tsx:14` in `:103`; obstoječi useResource ohranja ločitev podatkov | A03: A→B→A reset vseh kontrol in pravih oseb/ID-jev; osnovni `switching project during loading never shows the previous project tasks` na obeh napravah. Uspešno. |
| R08 | Samo React stanje, brez zapisovanja filtrov; `src/App.tsx:14` | A03: osvežitev table in preglednice vrne F0, URL vsebuje samo projekt/pogled, localStorage in sessionStorage prazna; pregled kode potrjuje odsotnost trajnega zapisa. Uspešno. |
| R09 | N=visibleTasks.length, M=tasks.length, counts iz vidnih; `src/App.tsx:17`, `:29`, `:57`; TaskBoard prejme vidne | A01/A02/A04/A05/A06: N/M; A02: pregled stanj in vsak stolpec, tudi nič; D04. Uspešno. |
| R10 | `M>0 && N=0` → Ni zadetkov.; M=0 obdrži prvotna prazna prikaza; `src/App.tsx:58` in `:59` | A04: oba pogleda uporabna brez zadetkov; A05: oba projekta prazna, 0/0, tri prazne kolone, brez lažnega Ni zadetkov.; D03 in osnovni prazni stanji. Uspešno. |
| R11 | En setFilters(F0), stabilen Array.filter brez mutacij; `src/App.tsx:55`, `src/taskFilters.ts:13` | A02: čiščenje vseh treh kontrol, natančen vrstni red in besedila vrstic pred/po; A07: zamrznjena opravila in seznam ostanejo nespremenjeni; D03. Uspešno. |
| R12 | Ohranjena navigacija, ID-ji, podrobnosti in Folio; nove kontrole zunaj povezav; CSS `.task-filters` | A03: pravi podrobnosti enakega naslova, datum, Escape/fokus; A01/A02/A03/A06: mrežni nadzor brez pisalnih zahtev; A06 in razvojni mobilni testi: brez razširitve pri 390 px; vseh 38 osnovnih regresij. Uspešno. |

### Vizualni pregled

Ročni lokalni strežnik je bil zagnan z
`WEB_PORT=5193 API_PORT=3123 npm run dev`; brskalnik povezan prek
`chromium.connect(wsEndpoint)` iz `task/browser.json`.
Pregledani so bili vsi štirje posnetki:

- [Namizna preglednica](desktop-table.png), 1440 × 960.
- [Namizna tabla](desktop-board.png), 1440 × 960.
- [Mobilna preglednica](mobile-table.png), viewport 390 × 844.
- [Mobilna tabla](mobile-board.png), viewport 390 × 844.

Ohranjeni so Folio, sistemska pisava, svetle površine, navigacija, modri poudarki,
vrstice in kartice. Kontrole se prelomijo na ozki širini. Ročna meritev:
`document.documentElement.scrollWidth = 390`, `viewport.width = 390`,
status `Prikazano: 3 od 3.`. Notranje vodoravno drsenje obeh pogledov ostaja.
Lastni A06 dodatno shrani `test-results/agent-mobile-table.png` in
`test-results/agent-mobile-board.png` z zelo dolgim naslovom/imenom.

### Omejitve in odprti deli

- Napake ali opustitve obveznih zahtev v predani specifikaciji niso bile ugotovljene.
- Nedostopni končni testi niso bili izvedeni. Posebna avtomatska primerjava
  slik s prvotnimi posnetki ni bila izvedena; opravljen je vizualni pregled.
- Vrstni red več kartic znotraj enega stolpca je preverjen z branjem obstoječe
  stabilne implementacije TaskBoard; A02 preverja točno eno kartico vsakega
  stanja, večje množice na tabli preverja kot množico ID-jev.
- `git diff --check && git diff --stat` ni bil izvedljiv: `xcrun: error:
  invalid active developer path (/Library/Developer/CommandLineTools), missing
  xcrun at: /Library/Developer/CommandLineTools/usr/bin/xcrun`. Infrastruktura
  ni bila popravljana. Vej, oddaljenega repozitorija in PR nisem spreminjal.
- Opozorili npm o `http-proxy` in Node o `NO_COLOR`/`FORCE_COLOR` sta okoljski;
  preverjanje je kljub njima vrnilo exit 0. Javni internet ni bil uporabljen.
- Spremenjene aplikacijske datoteke: samo `src/App.tsx`, `src/styles.css` in
  nova `src/taskFilters.ts`; lastni testi: nova `tests/agent/filters.spec.ts`.
  Specifikacija, njena zgodovina, skupni testi, strežnik, tipi in nastavitve
  niso bili spreminjani. Dokumenti pregledovalca niso bili spreminjani.

Zapis predaje je zaključen več kot 60 sekund pred rokom faze. Pregledovalec
lahko prevzame delo; znanih neizpolnjenih funkcionalnih zahtev ni.
Ročni lokalni strežnik je po pregledu ustavljen. Ob zaključevanju predaje je
časovni pripomoček pokazal 192 sekund do roka faze in 552 sekund skupnega časa.
