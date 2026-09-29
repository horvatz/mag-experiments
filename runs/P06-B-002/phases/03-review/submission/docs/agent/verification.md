# P06 — Implementacija in preverjanje

## Začetni zapis

Vloga: implementer. Prebrani so PROJECT_RULES.md, task/instructions.md, task/specification-template.md in predana docs/agent/specification.md. Izvirne zahteve R01–R12 ostajajo merilo. Specifikacije, zgodovine in datotek pregledovalca ne spreminjam.

Načrt izvedbe: čist pretvornik CSV s fiksnim vrstnim redom kolon, navedbo vseh celic, nevtralizacijo formul, BOM in CRLF; lokalne nastavitve ter skupne kontrole v projektnem pogledu; lokalni prenos brez zapisovalnih zahtev API. Ohraniti obstoječi Folio in celoten prikaz opravil.

## Začetni načrt preverjanja (ob nastanku še neizveden; končni izidi spodaj)

- R01–R09: razvojni testi ter lastni testi točnih bajtov, vrstnega reda, Unicode, formul in praznih rezultatov.
- R03–R04, R10–R11: lastni testi izbora, filtriranja, zaporednih izvozov, preklopa pogledov/projektov in osvežitve.
- R12: osnovne regresije, nespremenjeni vhodni podatki, odsotnost zapisov API, prilagodljivost pri 390 px in vizualni pregled.
- Celoten `npm run check` (slog, tipi, gradnja in dostopni testi), po preverbi časovnega proračuna.

## Omejitve

Infrastruktura, odvisnosti, skupni testi in navodila so samo berljivi. Dovoljene spremembe: src/, tests/agent/ in lastni zapisi v docs/agent/. Javni internet je blokiran. Chromium je že nameščen; ročne skripte se povežejo prek wsEndpoint iz task/browser.json. Končni skriti testi niso dostopni. Ob začetku še ni izveden noben test in še ni ugotovljene napake specifikacije.

## Izvedene spremembe in rezultati

- `src/csv.ts`: R01–R09; čist pretvornik `createCsv`, fiksna projekcija kolon, filter brez mutacij, `csvValue` za nevtralizacijo in navedbo, BOM ter CRLF. Prazen rezultat ali izbor vrne `null`.
- `src/CsvExport.tsx`: R01–R05, R10–R12; privzete lokalne nastavitve, dostopne kontrole, pogoj omogočenosti in zaščita ob dejanju, Blob/prenos ter sprostitev object URL.
- `src/App.tsx`: skupna vključitev kontrol nad obema pogledoma; ključ projekta ponastavi lokalno stanje. Izvoz ne spreminja vira za povzetke, preglednico ali tablo.
- `src/styles.css`: dodatni prilagodljivi slogi v obstoječih barvah, razmikih in zaobljenosti Folio.
- `tests/agent/csv.spec.ts`: A01–A07 za razširjene robne primere in regresije; celoten `npm run check` je zaključen uspešno. Dnevnik: `docs/agent/check.log`.

Okoljska omejitev: `git status --short` ni uspel, ker sistemski Git zahteva manjkajoči `xcrun`/CommandLineTools. Git ni potreben za implementacijo in ni bilo poskusa spreminjanja infrastrukture. Ročni lokalni strežnik uporablja predpisani vrati 5193/3123.

## Dejanski rezultati

`npm run check > docs/agent/check.log 2>&1` se je zaključil z izhodno kodo **0**. ESLint, TypeScript in produkcijska gradnja Vite so uspešni. Playwright: **53 passed (22.0s)** — 38 osnovnih (API + desktop + mobile), 8 razvojnih P06 (D01–D04 na namizju in mobilniku) in 7 lastnih (A01–A07). Brez preskočenih testov ali ponovitev. Dnevnik vključuje le nenevarna okoljska opozorila npm o http-proxy ter NO_COLOR/FORCE_COLOR.

Ročni vizualni pregled: lokalni `WEB_PORT=5193 API_PORT=3123 npm run dev`, Chromium prek `chromium.connect(wsEndpoint)` iz `task/browser.json`. Pregledani so posnetki preglednice in table na 1440 × 960 ter 390 × 844; pred zajemom preverjen dejansko izbran pogled. Ohranjeni so navigacija, sistemska pisava, barve, povzetki, tabela in kartice Folio. Kontrole se na mobilniku prelomijo v razpoložljivo širino. V vseh štirih primerih `scrollWidth === innerWidth` (1440 oziroma 390). Posnetki: `docs/agent/screenshots/{1440,390}-{table,board}.png`; meritve: `docs/agent/visual-check.json`. A07 dodatno preverja uporabo preslednice na checkboxu, viden fokus in celoten prikaz opravil pri izvoznem filtru.

## Končna sledljivost

Vsi spodaj navedeni testi so dejansko izvedeni v uspešnem skupnem zagonu; dokaz je `docs/agent/check.log`. Datoteka lastnih testov je `tests/agent/csv.spec.ts`, razvojnih pa nespremenjena `tests/development/P06.spec.ts`.

| Zahteva | Izvedbeni pogoj in koda | Izvedeno preverjanje in izid |
| --- | --- | --- |
| R01 | `CsvExport.tsx:7` privzete nastavitve; `csv.ts:19` ohrani vrstni red projektnega vira. | D01, A03 (13 premešanih ID-jev, enaki naslovi, drugi projekt izključen), A05 (0/1 vrstica): uspešno. |
| R02 | `csv.ts:3,18,23` fiksne dovoljene kolone in projekcija vsakega zapisa. | D02, A01 (obrnjena izbira), A04 (klik description/title/id, glava id/title/description): uspešno. |
| R03 | `CsvExport.tsx:11,15,52` onemogočen gumb in zaščita; `csv.ts:20` vrne null. | A01, A04 (vseh sedem odznačenih, brez prenosa, ponovni izbor), A05 (ponovni izbor ob praznem filtru): uspešno. |
| R04 | `csv.ts:19` filtrira samo kopijo; App in TaskBoard dobita celoten izvor. | D02, A04 (vsi statusni filtri, isti ID-ji in povzetki), A05 (prazen filter/projekt/oba projekta), A07: uspešno. |
| R05 | `csv.ts:24` BOM; `CsvExport.tsx:17` Blob in lokalni download s projektnim imenom. | D01, A03 (dejanski EF BB BF, natančni bajti, ime, brez nove strani, URL spremembe ali zahtev), A06 (ime drugega projekta): uspešno. |
| R06 | `csv.ts:8,22,23` navedba vsake celice, podvojeni narekovaji, izbrano ločilo. | D02/D03, A01 (točna vsebina z obema ločiloma), A04/A06 (dejanski prenosi): uspešno. |
| R07 | `csv.ts:24` CRLF po vsakem zapisu; navedba ohrani notranje CR/LF. | D01/D03, A01 (LF, CR, CRLF v isti vrednosti), A03 (primerjava celotnega Buffer): uspešno. |
| R08 | `csv.ts:12` točna predpona `[ \t\r\n]*` in sprožilci; `csv.ts:23` uporabi na vsakem podatkovnem polju. | D03, A02 (24 kombinacij sprožilca/predpone in negativni NBSP, VT, FF, apostrof, prazni/beli nizi), A01: uspešno. |
| R09 | `csv.ts:23` bere izvirne nize, brez formatiranja statusa/datuma. | D03, A01 (emoji, šumniki, presledki, veljavni prestopni datum, interni status), A03/A06: uspešno. |
| R10 | `App.tsx:43` ista komponenta pred razvejitvijo pogledov. | D04, A03, A06 (isti bajti preglednica → tabla → preglednica z neprivzetimi nastavitvami): uspešno. |
| R11 | `App.tsx:88` projektni key; `CsvExport.tsx:7` privzeto stanje; dejanje uporabi aktualne nastavitve. | A06 (zaporedni različni izvozi, drugi projekt in vrnitev, reload v obeh pogledih), A05: uspešno. |
| R12 | Čist `csv.ts`, brez API zapisov v `CsvExport.tsx`, nespremenjeni bralni prikazi; `styles.css:66,181` prilagodljivost. | A01 (zamrznjen izvor in vsebinska primerjava), D04/A03/A04/A07 (brez zapisov), 38 regresij, A04 (podrobnosti po ID), A07 (390 px/fokus), štirje vizualni posnetki: uspešno. |

## Predaja pregledovalcu

Implementacija in obvezno preverjanje sta zaključena. Spremenjeni implementacijski datoteki sta `src/App.tsx` in `src/styles.css`; dodani `src/csv.ts`, `src/CsvExport.tsx` ter `tests/agent/csv.spec.ts`. Lastni dokumenti in dokazila so v `docs/agent/`. Specifikacija, njena zgodovina, datoteki pregledovalca, skupni testi, strežnik, skupni tipi, odvisnosti in konfiguracije niso bili spremenjeni. Drugih agentov nisem zaganjal.

Napake predane specifikacije niso bile ugotovljene. Ni znane neizpolnjene zahteve R01–R12. Omejitve dokazov: skriti končni testi niso dostopni in niso bili izvedeni; preverjen je Chromium, ne drugi brskalniki ali dejansko odpiranje datoteke v zunanjem pregledničnem programu. Preklica v sistemskem dialogu za shranjevanje nisem ročno preverjal. A02 uporablja tudi sintetične vrednosti identifikatorjev samo za izolirano preverjanje zaščite vseh besedilnih kolon; veljavni statusi in datumi ostanejo izvirni. Vsi produkcijski podatki še vedno prihajajo iz javnega `/api/`.

Lokalni strežnik za ročni ogled je po pregledu ustavljen. Tudi sistemski `python3` se sklicuje na manjkajoči `xcrun`; zadnja ureditev dokumenta je zato opravljena z urejevalnim orodjem. Zapis je dokončan več kot 60 sekund pred rokom faze (ob zadnji časovni kontroli je do roka faze ostalo 198 sekund, skupaj 558 sekund). Preostali čas je namenjen pregledovalcu in morebitnim popravkom v nadaljevani seji prvotnega avtorja.
