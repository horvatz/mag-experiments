# Specifikacija P06 – nastavljiv izvoz CSV

## Problem in kontekst

Uporabnik želi izvoziti opravila trenutnega projekta v CSV, izbrati kolone,
stanje opravil in ločilo. Izhodišče Folio bere projekte in opravila prek javnega
API-ja ter prikazuje preglednico, tablo in podrobnosti. Dodatek mora ohraniti
te bralne funkcije, slovenska poimenovanja in potrjeni videz iz `docs/dizajn.md`.
Postopek A: en agent, največ 20 minut, spremembe samo v `src/`, `tests/agent/`
in `docs/agent/`.

## Vhodi, dejanja in izidi

- Vhod je izvorno urejeno polje opravil trenutnega projekta iz
  `GET /api/projects/<id>/tasks`. Vsa izvozna polja so nizi iz skupnega tipa
  `Task`: id, projectId, title, status, assignee, dueDate, description.
- Checkboxi `Stolpec <ime>` določajo izbor; select `Ločilo CSV` ima vrednosti
  `;` in `,`; select `Filter izvoza` ima all/todo/in_progress/done.
- Privzeto so izbrane vse kolone, ločilo je `;`, filter pa `all`.
- Klik `Izvozi CSV` ob veljavnem izboru prenese `folio-<projectId>.csv`.
  Uspeh ne spremeni URL-ja, strani, podatkov ali nastavitev. Preklic shranjevanja
  v brskalniku prav tako ne spremeni aplikacije.
- Brez izbranih kolon ali ustreznih vrstic je gumb onemogočen; tudi notranji
  obdelovalnik mora zavrniti prazen izvoz. Med nalaganjem ali napako podatkov
  izvoz ni na voljo, obstoječi prikaz napake in ponovni poskus ostaneta.
- Preklop pogleda ohrani nastavitve, menjava projekta in osvežitev jih
  ponastavita. Ni trajne shrambe ali novega zapisovalnega API-ja.

## Zahteve in pravila

Simboli: `T` je izvorno polje trenutnega projekta; `C` je nespremenljivo
zaporedje dovoljenih kolon; `S ⊆ C` je izbor; `f` je filter; `d` je ločilo.
`K = [c ∈ C | c ∈ S]`, `E = [t ∈ T | f = all ∨ t.status = f]`.
Izbori ohranijo vrstni red svojih izvornih zaporedij. Veljavnost izvoza je
`enabled ⇔ |K| > 0 ∧ |E| > 0`.

Za niz `v` definiramo `danger(v) ⇔ v` ustreza `/^[ \t\r\n]*[=+\-@]/`.
`neutral(v) = "'" + v`, kadar velja `danger(v)`, sicer `v`.
`quote(v)` obda niz z dvojnima narekovajema in podvoji vsak notranji `"`.
Glava je `join(d, map(quote, K))`; podatkovna vrstica je
`join(d, [quote(neutral(t[c])) | c ∈ K])`. Datoteka je UTF-8 kodiranje
`U+FEFF + glava + CRLF + join('', [vrstica(t) + CRLF | t ∈ E])`.
Notranji prelomi ostanejo del vrednosti; ne pretvarjamo jih v ločila vrstic.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto `(S,d,f)=(C,;,all)`; vse vrstice trenutnega projekta v vrstnem redu API-ja. | D01; A01 in A04 s premešanimi ID-ji, podvojenimi naslovi in več kot deset vrsticami. |
| R02 | Dovoljene so samo kolone `C`; glava in vrednosti sledijo `K`, ne klikom. | D02; A01 in A04 z obratnim vrstnim redom izbire. |
| R03 | `|K|=0 ⇒ ¬enabled`; ni prenosa. Izbira ene kolone omogoči neprazen izvoz. | A05. |
| R04 | `E` omeji le izvoz; prikaz in števci še uporabljajo `T`. `|E|=0 ⇒ ¬enabled`. | D02/D04; A04, A05, A06 za prazne projekte in vse filtre. |
| R05 | Prenos ima predpisano ime, začetne bajte EF BB BF in ostane na isti strani brez pošiljanja vsebine. | D01; A04 in A07, spremljanje omrežja ter strani. |
| R06 | `d ∈ {;, ,}`; vsaka glava in vrednost je vedno navedena, notranji narekovaji so podvojeni. | D02/D03; A01 in A02 z obema ločiloma. |
| R07 | Ločila vrstic in konec datoteke so CRLF; notranji CR/LF/CRLF in ločila se ohranijo. | D01/D03; A01, A02 in A07 s primerjavo celotnih pričakovanih nizov in bajtov. |
| R08 | `danger(v)` doda en apostrof na začetek izvirne vrednosti vseh podatkovnih kolon; glava ostane nespremenjena. | D03; A02/A03 za štiri znake, kombinacije začetnih znakov, varne nize in vse kolone. |
| R09 | Ohranjeni so Unicode, presledki, opisi, interna stanja in izvirni datumi. | D03; A01/A02/A07. |
| R10 | Prehod table ↔ board je identiteta na `(S,d,f)`; enake nastavitve dajo enake bajte. | D04; A06/A07 za vse nastavitve in obe smeri. |
| R11 | Prehod na drug projekt ali reload vrne `(C,;,all)`; vsak klik uporabi trenutno stanje. | A04 in A06, vključno z vrnitvijo v prejšnji projekt. |
| R12 | `T_po = T_pred`; nobenih zapisov API, testnih kontrol ali lokalne kopije podatkov v UI. Pri 390 px velja `scrollWidth ≤ innerWidth`. | D04; A01 (zamrznjeni vhodi), A04/A07/A08, regresijski testi in pregled kode. |

## Izvedba in sledljivost

Izvedena razdelitev: `src/csv.ts` vsebuje čisto serializacijo;
`src/CsvExport.tsx` kontrole, lokalno stanje in prenos; `src/App.tsx` vključitev
pod ključem projekta; `src/styles.css` odzivno postavitev. Lastni testi so v
`tests/agent/csv.spec.ts` in `tests/agent/export.spec.ts`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzete vrednosti, vrstni red | D01, A01, A04 | csv.ts: CSV_COLUMNS/createCsv; CsvExport.tsx: useState | Uspešno, [končni dnevnik](check-final.log). |
| R02 | Kanonični vrstni red kolon | D02, A01, A04 | csv.ts: CSV_COLUMNS.filter | Uspešno, [končni dnevnik](check-final.log). |
| R03 | Onemogočen prazen izbor | A05 | CsvExport.tsx: enabled/download | Uspešno, [končni dnevnik](check-final.log). |
| R04 | Filter samo za izvoz, prazne vrstice | D02/D04, A04–A06 | CsvExport.tsx: rows; App.tsx: izvorni tasks | Uspešno, [končni dnevnik](check-final.log). |
| R05 | BOM, ime, lokalni prenos | D01, A04, A07 | csv.ts: U+FEFF; CsvExport.tsx: Blob/download | Uspešno, [končni dnevnik](check-final.log). |
| R06 | Ločilo in narekovaji | D02/D03, A01/A02 | csv.ts: quote/join | Uspešno, [končni dnevnik](check-final.log). |
| R07 | CRLF in notranji prelomi | D01/D03, A01/A02/A07 | csv.ts: sestava vrstic | Uspešno, [končni dnevnik](check-final.log). |
| R08 | Nevtralizacija formul | D03, A02/A03/A07 | csv.ts: neutralize za task[column] | Uspešno, [končni dnevnik](check-final.log). |
| R09 | Ohranitev nizov | D03, A01/A02/A07 | csv.ts: vrednosti brez normalizacije | Uspešno, [končni dnevnik](check-final.log). |
| R10 | Ohranjeno stanje v pogledih | D04, A06/A07 | App.tsx: stalno mesto CsvExport | Uspešno, [končni dnevnik](check-final.log). |
| R11 | Ponastavitev in sveže nastavitve | A04/A06 | App.tsx: key projekta; CsvExport.tsx: useState | Uspešno, [končni dnevnik](check-final.log). |
| R12 | Samo branje, prilagodljivost | D04, A01/A04/A07/A08, baseline/API | csv.ts, CsvExport.tsx, styles.css | Uspešno, [končni dnevnik](check-final.log) in [vizualni pregled](verification.md). |

Dokazila dejanskih zagonov, povezave na kodo, končna sledljivost in omejitve so
v [verification.md](verification.md).

## Odprta vprašanja in omejitve

- Podatki sledijo skupnim tipom in domeni naloge; ne širimo preverjanja na
  napačne podatkovne tipe ali nedovoljena stanja strežnika.
- Navigacija med nedokončanim nalaganjem in sočasno spreminjanje podatkov sta
  izven razširjenega obsega; obstoječe regresije morajo ostati uspešne.
- Končni skriti testi niso dostopni. Brskalnik za preverjanje je nameščeni
  Chromium prek `chromium.connect`; drugih brskalnikov ne moremo potrditi.
- Vsa dostopna avtomatizirana preverjanja so uspešna; to ni dokaz izvajanja
  nedostopnih končnih testov ali vseh mogočih vhodov.

## Zgodovina sprememb

- v1, 2026-09-22: specifikacija pripravljena pred implementacijo; pogoji,
  predikati, načrt izvedbe in preverjanja R01–R12.
- v2, 2026-09-22: po implementaciji dodani dejanski rezultati 54 preverjanj
  in povezave na dokazila. Pri R07 je način preverjanja natančneje opisan kot
  primerjava celotnih nizov in bajtov; ločen razčlenjevalnik ni bil potreben.
  Sprejemni pogoji in obseg zahtev ostajajo enaki.
