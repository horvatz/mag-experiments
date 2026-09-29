# P04 — dejansko preverjanje in predaja

Izvedba: postopek A, en agent, 2026-09-23. Specifikacija je bila zapisana pred
implementacijo; njen končni popravek beleži rezultate brez spremembe zahtev.
Vseh R01–R12 je implementiranih; znanih neizpolnjenih zahtev ni.

## Spremembe

- [taskSorting.ts](../../src/taskSorting.ts): čista stabilna projekcija z izrecno
  normalizacijo NFD, primerjavo UTF-16, fiksnim vrstnim redom statusov, datumi
  brez pretvorb časovnega pasu ter izvirnim indeksom za končne vezi.
- [TaskSortControls.tsx](../../src/TaskSortControls.tsx): štirje označeni HTML
  selecti in gumb za ponastavitev vseh nastavitev.
- [App.tsx](../../src/App.tsx): lokalno stanje v komponenti projekta ter skupno
  razvrščeno polje za oba pogleda. Števci še vedno izvirajo iz prejetih podatkov.
  Ponovna uporaba komponente ohrani nastavitve pri pogledih in podrobnostih;
  obstoječi ključ projekta jih ponastavi pri menjavi projekta.
- [styles.css](../../src/styles.css): prilagodljivo prelamljanje kontrol s
  slovenskimi oznakami in obstoječimi barvami, robovi ter vidnim fokusom Folio.
- Lastni testi: [sorting.spec.ts](../../tests/agent/sorting.spec.ts) in
  [sorting-ui.spec.ts](../../tests/agent/sorting-ui.spec.ts).

Strežnik, skupni tipi, odvisnosti, infrastruktura in skupni testi niso bili
spreminjani. Aplikacija za razvrščanje ne uvaža testnih pripomočkov, ne uporablja
`/__test/`, shrambe ali zapisovalnega API-ja. Lastni brskalniški testi uporabljajo
javni testni pripomoček za nadzorovane odgovore GET; to ni del kode aplikacije.

## Izvedeni ukazi in rezultati

| Preverjanje | Dejanski rezultat | Dokaz |
| --- | --- | --- |
| `npx playwright test --project=development-desktop --project=development-mobile` | 8/8 uspešnih, 3,7 s; začetno preverjanje implementacije. | Isti razvojni testi so pozneje ponovno uspešni tudi v celotnem dnevniku spodaj. |
| `npm run check > docs/agent/check.log 2>&1` | Izhodna koda 0. ESLint uspešen, TypeScript uspešen, produkcijska gradnja uspešna; 54/54 testov, 23,4 s. | [Celoten dnevnik](check.log). |
| `WEB_PORT=5193 API_PORT=3123 npm run dev` in lokalna skripta prek `chromium.connect(wsEndpoint)` iz `task/browser.json` | Namizni in mobilni prikaz uspešno odprta, posnetki zajeti; brez dogodkov `pageerror`. | [Meritve](preview.log) in spodnji posnetki. |
| Vizualni pregled treh zajetih slik | Ohranjen Folio; kontrole čitljive, na mobilniku v dveh stolpcih, reset v svoji vrstici; tabla in preglednica ostaneta v svojem drsnem območju. | [Namizna preglednica](desktop-table.png), [mobilna preglednica](mobile-table.png), [mobilna tabla](mobile-board.png). |

Celotni testni zagon vsebuje 38 preverjanj izhodišča (14 API + 12 namiznih +
12 mobilnih), 8 razvojnih P04 (4 namizna + 4 mobilna) in 8 lastnih (A01–A06
ter dve izvedbi A07). Ni neuspešnih ali preskočenih testov. Opozorili okolja
o konfiguraciji npm `http-proxy` in prednosti `FORCE_COLOR` ne preprečita nobenega
preverjanja. Nobenega preverjanja ni bilo treba opustiti zaradi omejitev okolja.
Pri pospravljanju je okolje zavrnilo neposredni `kill -TERM` ročnega strežnika
(`operation not permitted`); strežnik je bil nato uspešno ustavljen s Ctrl+C
prek njegove izvorne izvajalne seje (izhodna koda 0).

## Zahteve, scenariji in dokazi

Vsa imena A/D v spodnji tabeli so neposredno določljiva v [check.log](check.log).
Pogoji in povezave na dele kode so dodatno v [specification.md](specification.md).

| Zahteve | Dejanski scenarij | Rezultat |
| --- | --- | --- |
| R01 | D01 in A05 preverita privzeti vrstni red ter vse štiri vrednosti. | Uspešno v brskalniku; A04 dodatno preveri original pri vseh 20 kombinacijah drugih nastavitev. |
| R02 | A01 primerja title in assignee: čAS, razstavljeni c + U+030C, CAS, U+036F, ohranitev U+1AB0, ločila, »Alfa 10«/»alfa 2«, emoji in U+E000. D01 preveri dejanski vmesnik. | Uspešno v obeh smereh; UTF-16 vrstni red, brez številčnega/jezikovnega razvrščanja in s stabilnimi vezmi. |
| R03 | A03: vsi statusi, prestopni 2028-02-29, meje meseca in leta, 0099/0100 ter 1900/2000. D02/D03: status/datum skozi vmesnik. | Uspešno v obeh smereh, tudi pri enakih datumih/statusih. |
| R04 | A01–A03 vsebujejo enake normalizirane vrednosti ter enake datume/statuse. | Padajoča smer ohrani izvorni vrstni red znotraj vezi. |
| R05 | A02: 5 sekundarnih ključev × 2 primarni smeri × 2 sekundarni smeri; dve opravili zunaj primarne vezi preprečita lažen uspeh globalnega sekundarnega razvrščanja. D02: neodvisna smer v vmesniku. | Vseh 20 pričakovanih zaporedij uspešnih. |
| R06 | A02 preveri enak primarni/sekundarni ključ za vse 4 ključe in obe smeri; A04 preveri prevlado original. | Uspešno; nobenega dodatnega obrata pri istem ključu. |
| R07 | A06: 12 opravil v trenutnem projektu, stalni trije stolpci in izrecno pričakovano zaporedje v vsakem. D03 tudi mobilno. | Vsak stolpec je ustrezna podmnožica vrstnega reda preglednice. |
| R08 | A05: oba pogleda, odpiranje/zapiranje podrobnosti z Escape in gumbom; A06: pet različnih ID-jev z enakim naslovom. | Četverica nastavitev in vrstni red ostaneta ohranjena. |
| R09 | A05: menjava v drugi projekt in nazaj, osvežitev table, kontrola URL-ja ter localStorage/sessionStorage. | Nastavitve so lokalne, ob menjavi/osvežitvi se vse ponastavijo; razvrščanje ne spreminja URL-ja/shrambe. |
| R10 | A04: vseh 100 kombinacij za prazno in enojno polje. A07: oba vhoda pri 390 px, po 10 kombinacij v preglednici in tabli. A05/D04: reset; A07: reset s tipkovnico. | Vsi scenariji uspešni; reset povrne vse štiri vrednosti. |
| R11 | A01–A04: zamrznjena vhodna polja/objekti; A01 tudi iste reference opravil in primerjava posnetka. A06: primerjava vsebine vseh vrstic po ID, števci 5/4/3, brez novih zahtev ob razvrščanju, nič zapisovalnih zahtev, reset na izvorni red. | Brez mutacij polj, pripadnosti, podatkov ali števcev in brez zapisov na API. |
| R12 | A06: vsak od 12 ID-jev natanko enkrat, 5 enakih naslovov odpre pravilen opis, osebo, datum in ID. A07: fokus in meje kontrol pri 390 px. 38 preverjanj izhodišča ohrani ostale funkcije. | Uspešno; dodatni vizualni pregled potrdi odziven videz. |

Meritve ročnega pregleda: pri 1440 px je širina dokumenta 1440 px. Pri 390 px
je v obeh pogledih širina dokumenta 390 px; notranja preglednica je široka
720 px, tabla 864 px. Notranje vodoravno drsenje je dovoljeno z zahtevami.

## Omejitve in nepreverjeni deli

- Skriti končni testi niso dostopni in niso bili izvedeni.
- Vsa brskalniška preverjanja uporabljajo nameščeni Chromium, mobilna preverjanja
  emulacijo/širino 390 px; fizične naprave, Firefox, WebKit in bralnik zaslona
  niso bili preverjeni. Dostopne oznake in fokus so preverjeni s Playwrightom.
- Dovoljena domena vsebuje veljavne datume YYYY-MM-DD in nizovne naslove/imena;
  manjkajoči ali neveljavni datumi so zunaj obsega. Prav tako niso dodane nove
  obljube o sočasnih spremembah podatkov; obstoječi regresijski test menjave
  projekta med nalaganjem je uspešen.
- Lastni testi preverijo konkretne Unicode primere in več kot deset opravil,
  ne vseh možnih nizov ali velikostnih obremenitev. Stabilnost in odsotnost
  mutacij dodatno zagotavlja izrecen izvorni indeks ter razvrščanje novega polja.
