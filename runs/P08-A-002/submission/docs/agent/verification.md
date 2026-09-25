# P08 – Zapis preverjanja

Izvedeno 2026-09-25 po postopku A, z enim agentom. Specifikacija je bila zapisana
pred implementacijo v [specification.md](specification.md). Vmesnik izpolnjuje
R01–R12 po spodnjih izvedenih preverjanjih; znanih neizpolnjenih zahtev ni.

## Implementacija

- [deadlines.ts](../../src/deadlines.ts): fiksni začetni datum, gregorijanska
  koledarska aritmetika, prednost skupine done, stabilni izbor in pet polnih števcev.
- [DeadlineFilters.tsx](../../src/DeadlineFilters.tsx): označen datumski vnos,
  šest možnosti filtra, pet številskih elementov in dostopno opozorilo.
- [App.tsx](../../src/App.tsx): lokalno stanje projekta z ločenim vnosom in zadnjim
  veljavnim datumom, skupni podatki za preglednico/tablo, prazna skupina.
- [styles.css](../../src/styles.css): prilagodljive kontrole in števci v slogu Folio.
  Obstoječi prikaz stanj, podrobnosti, stolpci table in bralni API so ohranjeni.

## Dejanski zagoni

| Preverjanje | Rezultat | Dokaz |
| --- | --- | --- |
| Prvi `npm run check` | Lint, TypeScript in produkcijska gradnja uspešni. 51 testov uspešnih, 3 lastni A02 neuspešni zaradi priprave novih testnih podatkov. | [check-first.log](check-first.log) |
| Končni `npm run check` po popravku testne priprave | Izhod 0; lint, TypeScript, Vite uspešni; **54/54 testov uspešnih**, testi 26,6 s. | [check.log](check.log) |
| Razčlenitev končnih testov | 38 izhodiščnih (14 API + 12 namiznih + 12 mobilnih), 8 razvojnih P08 (4 + 4), 8 lastnih. | Zaključni seznam v [check.log](check.log) |
| `WEB_PORT=5193 API_PORT=3123 npm run dev` ter `node tests/agent/visual.mjs` | Lokalni strežnik uspešno zagnan; končna skripta izhod 0, brez napak strani in brez zapisovalnih zahtevkov. | [visual.mjs](../../tests/agent/visual.mjs), [visual-check.json](visual-check.json) |
| Vizualni pregled posnetkov | Pregledana mobilna preglednica ter namizna in mobilna tabla z opozorilom. Kontrole, oznake in fokus vidni; brez prekrivanja. Tabla in preglednica se pomikata znotraj svojega območja. | [mobile-table.png](mobile-table.png), [desktop-board-invalid.png](desktop-board-invalid.png), [mobile-board-invalid.png](mobile-board-invalid.png); dodatno zajet [desktop-table.png](desktop-table.png) |

Pri prvem A02 je `mount` ob ponovnem obisku istega URL-ja z razpršilcem obdržal
prejšnjo stran in podatke iz februarja 2028. Naslednji scenarij je zato primerjal
te roke z marcem 2026. Posnetek in dnevnik sta pokazala šest rokov v skupini later.
Popravek je samo v lastnem testu: pred novim scenarijem odpre `about:blank`, odstrani
prejšnje testne poti ter pred preračunom preveri dejansko naloženi rok. Koda
klasifikacije ni zahtevala spremembe. Končni A02 opravi vseh sedem scenarijev v
vsakem od treh časovnih pasov.

Pri prvi vizualni skripti je manjkal pogoj, da je preklop pogleda že prikazan;
končna skripta pred zajemom počaka na `aria-pressed=true` in regijo table. Zajem
je bil ponovljen, zgornji posnetki in JSON so iz tega popravljenega zagona.

## Sledljivost zahtev in dokazov

Lastni testi so v [deadlines.spec.ts](../../tests/agent/deadlines.spec.ts).
Vsi spodnji testi so bili dejansko izvedeni in uspešni v končnem dnevniku.

| Zahteva | Preverjeni pogoj | Preverjanje in rezultat |
| --- | --- | --- |
| R01 | Datum 2026-09-21 in filter all ne glede na uro naprave. | A01 nastavi uro na 2040; začetno stanje pravilno. D01 uspešen na namizju in telefonu. |
| R02 | Done ostaja ločen ne glede na rok. | A01 vključuje štiri done z roki pred, na in po referenci; odprti števci jih ne vključujejo. D04 uspešen v obeh projektih testnega brskalnika. |
| R03 | Pred referenco overdue, na referenci today. | A01 pričakuje po dva in preveri konkretne ID-je; A02 preveri B−1 in B. D01 uspešen. |
| R04 | B+1 in B+7 sta week, B+8 later; skupine so popolne. | A01 preveri vse skupine, enkratnost in vseh 14 ID-jev. D02 in vsi A02 preverijo vključujočo zgornjo mejo. |
| R05 | Prehodi koledarja brez vpliva časovnega pasu. | A02 v America/Los_Angeles, Europe/Ljubljana in Pacific/Kiritimati: prestopni februar 2028, pomladni DST, jesenski DST/meja meseca, konec leta, neprestopno leto 2100, prestopno leto 2000 ter leto 0096. Skupaj 21 scenarijev. |
| R06 | Števci pripadajo vsem opravilom projekta. | A01 ohranja 2/2/3/3/4 ob vseh filtrih in obeh pogledih; A03 jih po novem datumu preračuna na 4/1/3/2/4; A04 preveri ničle in singleton. |
| R07 | ID-ji in izvorni vrstni red se ohranijo. | A01 uporablja 14 opravil z enakimi naslovi in drugačnimi Unicode ID-ji; vrstni red preveri v preglednici in posameznih stolpcih table. A05 preveri datum, stanje, odgovorno osebo ter literalno večvrstično besedilo v podrobnostih. |
| R08 | Prazen vnos ohrani zadnji veljavni preračun, ponoven datum odpravi opozorilo. | D03 in A03 preverita opozorilo, prazno vrednost, nespremenjene ID-je/števce, ohranjen filter in takojšnji nov rezultat. |
| R09 | Oba pogleda uporabljata iste filtrirane ID-je in isto stanje. | A01 primerja vseh pet skupin med pogledoma; A03 preveri prazen in veljaven datum ob preklopu. D04, A05 in vizualna skripta uspešni. |
| R10 | Projekt in reload ponastavita stanje, URL/shramba ga ne vsebujeta. | A03 preveri menjavo, vrnitev, refresh s praznim vnosom in izbranim filtrom; URL vsebuje le obstoječi view=board, localStorage/sessionStorage ostaneta prazna. Pregled kode potrdi izključno useState. |
| R11 | Prazni projekti imajo ničle, prazne skupine ostanejo uporabne. | Dva testa A04: oba projekta prazna, vseh šest filtrov, tri ohranjene kolone; singleton in štiri prazne skupine v obeh pogledih s predpisanim sporočilom ter vrnitvijo na today/all. |
| R12 | Javna bralna pot, nedotaknjena polja, odziven Folio. | A05: nič zapisov, nespremenjeno strežniško stanje, brez UI zahtevkov na /__test/, brez napak strani, pravilne podrobnosti in fokus ob zapiranju. Vseh 38 izhodiščnih in 8 razvojnih testov uspešnih. Širini dokumenta sta v obeh pogledih točno 390 in 1440 pik. |

Povezave posameznih zahtev na dele kode in formalne pogoje so še v tabeli
»Izvedba in sledljivost« v [specifikaciji](specification.md).

## Omejitve in nepreverjeni deli

- Končni skriti testi niso dostopni in niso bili izvedeni.
- Preverjeno v nameščenem Chromiumu prek `chromium.connect(wsEndpoint)`; Firefox,
  WebKit, fizične mobilne naprave in bralnik zaslona niso bili preverjeni.
- Datumi opravil se skladno s pogodbo API-ja štejejo za veljavne. Neveljavni
  strežniški podatki niso del obsega. Datumski vnos uporablja pozitivna
  štirimestna leta 0001–9999.
- Preverjene so zbirke velikosti 0, 1, 3, 6, 8 in 14 v posameznem projektu;
  obremenitveno preverjanje zelo velikih zbirk ni izvedeno. Izračun in filter
  sta linearna glede na število opravil in nimata vgrajene omejitve števila.
- Sočasno spreminjanje podatkov brez osvežitve ni razširjeno; obstoječe
  regresijsko preverjanje menjave projekta med nalaganjem ostaja uspešno.
- Ni bilo blokirajočih omejitev okolja. Uporabljene so bile samo lokalne storitve,
  dovoljene mape, obstoječe odvisnosti in en agent. Strežnik, infrastruktura,
  skupni tipi in skupni testi niso bili spreminjani.

## Zgodovina zapisa

- v1, 2026-09-25: zapis obeh zagonov, popravka lastnih testov, končnega rezultata,
  vizualnih dokazov ter sledljivosti R01–R12. Znane neizpolnjene zahteve: nobena.
