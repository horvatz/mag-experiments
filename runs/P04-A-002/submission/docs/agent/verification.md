# P04 — izvedena preverjanja, postopek A

Naloga je izvedena z enim agentom. Specifikacija je bila zapisana pred spremembami
kode; dopolnitev rezultatov je zabeležena kot v1.1 v
[specification.md](specification.md). Preverjanje je potekalo 2026-09-25.

## Rezultat in spremembe

Izvedeno je stabilno razvrščanje z dvema ključema in neodvisnima smerema,
štirimi označenimi HTML selecti ter gumbom Izvorni vrstni red. Stanje je lokalno
komponenti projekta. Preglednica in tabla uporabljata isto projekcijo; izvorni
podatki ostanejo nespremenjeni. Spremenjeni deli aplikacije:

- [taskSort.ts](../../src/taskSort.ts): normalizacija, primerjanje ključev,
  neodvisni smeri, kopija polja, izvorni indeks kot zadnji pogoj.
- [TaskSortControls.tsx](../../src/TaskSortControls.tsx): štiri kontrole in popolna ponastavitev.
- [App.tsx](../../src/App.tsx): lokalni useState, memoizirana projekcija za oba pogleda.
- [styles.css](../../src/styles.css): skupina kontrol v slogu Folio, dve koloni na telefonu.

Lastni testi so samo v [tests/agent](../../tests/agent/), dokumenti in posnetki
v `docs/agent/`. Strežnik, skupni tipi, testi, nastavitve in odvisnosti niso spremenjeni.

## Dejanski zagoni

| Zagon | Izvedeni ukaz | Rezultat | Dokaz |
| --- | --- | --- | --- |
| Po implementaciji, pred dodajanjem lastnih testov | `npm run check` | ESLint, TypeScript in Vite uspešni; 46/46 testov, 16,8 s za testni del; izhod 0. | [check-initial.log](check-initial.log) |
| Končna koda in lastni testi | `npm run check` | ESLint, TypeScript in Vite uspešni; 61/61 testov, 26,1 s za testni del; izhod 0. | [check-final.log](check-final.log) |

Končnih 61 preverjanj sestavlja 38 izhodiščnih (14 API in po 12 za namizni ter
mobilni vmesnik), 8 razvojnih P04 (D01–D04 na obeh velikostih) ter 15 lastnih
(10 preverjanj funkcije in 5 v brskalniku). Po končnem zagonu so bili dopolnjeni
samo dokumenti; koda in testi niso več spreminjani.

Uporabljena je obstoječa konfiguracija Playwright, ki se poveže na nameščeni
Chromium prek `task/browser.json`; testni strežnik je tekel na 5174/3102.
Ni bilo zagona `chromium.launch()`, zunanjih storitev ali sprememb infrastrukture.
Okolje je izpisalo opozorili o nastavitvah `http-proxy` in `NO_COLOR`/`FORCE_COLOR`;
nobeno preverjanje ni bilo blokirano ali preskočeno.

Po dopolnitvi dokumentov je skripta Node preverila obstoj vseh 31 lokalnih
povezav v specifikaciji in 14 v tem poročilu ter prisotnost R01–R12 v obeh
dokumentih; vsi pogoji so bili izpolnjeni, izhod skripte 0.

## Sledljivost zahtev in dodatnih testov

Imena A01–A06 so v [sorting.spec.ts](../../tests/agent/sorting.spec.ts),
A07–A09 v [interface.spec.ts](../../tests/agent/interface.spec.ts). Predpone so
enake imenovanjem v končnem dnevniku, kjer je vsak izvedeni primer označen uspešno.
Povezave zahtev s pogoji in deli kode so tudi v specifikaciji.

| Zahteva | Dejansko preverjanje | Izid |
| --- | --- | --- |
| R01 | D01; A01 preveri točen S0, A07 obe širini in prejeto zaporedje ID-jev. | Uspešno. |
| R02 | A02 posebej za title in assignee: NFD sestavljeni/razstavljeni znaki, male črke, stabilna normalizirana izenačenja, presledek, prazni niz, ločila, 10 pred 2, ohranitev U+1AB0, ß/ø, İ, emoji pred U+E000 po UTF-16. | Uspešno v obeh smereh. |
| R03 | D02/D03; A03 oba vrstna reda stanj; A04 veljavni datumi med 0001 in 9999, prestopni dnevi, meje mesecev/let ter izenačenja. | Uspešno. |
| R04 | A02–A04 izrecni pričakovani padajoči seznami ohranijo prvotno zaporedje izenačenih elementov; A05 vse štiri kombinacije smeri. | Uspešno. |
| R05 | D02; A05 posebej za vsak sekundarni ključ preveri štiri kombinacije smeri, omejitev na primarna izenačenja, ter none z obema primarnima smerema. | Uspešno. |
| R06 | A01 original pri vseh 20 nastavitvah drugih kontrol; A02–A04 enaka ključa z nasprotnima smerema; A05 izenačenja obeh ključev; A08 original pri ohranjenih neprvotnih kontrolah. | Uspešno. |
| R07 | D03; A07/A08 preverita stalni vrstni red vseh treh stolpcev in vsak stolpec kot filtrirano zaporedje pričakovanega vrstnega reda preglednice. | Uspešno. |
| R08 | A07 na 1440 in 390 px: vse štiri neprvotne nastavitve ostanejo po preklopu pogleda in po odpiranju vsakega od 13 opravil v obeh pogledih; Escape/gumb ter vrnjen fokus. | Uspešno. |
| R09 | A08: menjava v obe smeri, vrnitev prek zgodovine, osvežitev table in preglednice, vse štiri privzete vrednosti. URL ob spremembi kontrol ostane enak (A07); localStorage/sessionStorage ostaneta prazna. | Uspešno. |
| R10 | D04; A08 reset vseh kontrol na tabli; A06 prazno/enojno polje v vseh 100 kombinacijah. A09 za prazni in enojni projekt preveri vsak ključ z obema smerema v obeh pogledih ter reset na 390 px. | Uspešno. |
| R11 | A01 vseh 100 nastavitev na zamrznjenem polju 17 zamrznjenih objektov, nespremenjena vsebina, identitete in množica ID-jev. A07 besedila vseh vrstic, povzetki 5/4/4, skupno 13 in 4/13 končanih. D04 ter A07–A09 brez zapisovalnih zahtev API in saveRequests=0. | Uspešno. |
| R12 | A07 vseh 13 različnih ID-jev natanko enkrat, enaki naslovi, poseben ID `opravilo/č?x=12`, pravilni opisi/ID/datumi podrobnosti, besedilo `<b>` brez HTML elementa, dostopne kontrole in fokus. D04/A07–A09 preverijo širino dokumenta. Vseh 38 izhodiščnih preverjanj za branje, napake, navigacijo in API. | Uspešno. |

## Vizualni pregled

Test A07 je shranil štiri posnetke. Vsi štirje so bili dejansko odprti in
vizualno pregledani po končnem zagonu:

- [Preglednica 1440 px](table-1440.png) in [tabla 1440 px](board-1440.png).
- [Preglednica 390 px](table-390.png) in [tabla 390 px](board-390.png).

Kontrole so berljive in urejene v dveh kolonah na telefonu; gumb reset zasede
širino skupine. Viden je fokus, navigacija in povzetki sledijo izhodišču Folio.
Preglednica in tabla se na telefonu pomikata znotraj svojega prikaza, stran pa
ostaja široka 390 px; to je dodatno potrjeno z meritvijo scrollWidth v testih.
Posnetki vsebujejo testne podatke, ne dodatnega podatkovnega vira aplikacije.

## Omejitve in nepreverjeni deli

- Nedostopni končni testi niso bili izvedeni in niso vključeni v 61 uspešnih testov.
- Preverjeno v nameščenem Chromiumu; drugih brskalnikov ali fizičnih telefonov
  nismo preverjali. Dostopnost je preverjena prek oznak, vlog, fokusa in tipkovnice,
  brez ločenega pregleda z bralnikom zaslona.
- Neveljavni/manjkajoči datumi so zunaj dogovorjene domene. Primerjava datumov
  predpostavlja veljaven fiksni format YYYY-MM-DD. Obremenitveni testi velikih
  količin podatkov niso bili izvedeni.
- Vseh 100 kombinacij je preverjenih na ravni funkcije za nespremenljivost in
  prazno/enojno polje. Vmesniški testi niso izčrpna matrika vseh kombinacij vseh
  možnih podatkov; preverijo vsak ključ/smer ter ključne sestavljene scenarije.
- Navigacija med nalaganjem in zunanje spremembe podatkov so preverjene v okviru
  obstoječih regresij; razširjeni sočasni scenariji niso del naloge.

Znane neizpolnjene zahteve R01–R12: nobena. Okoljske omejitve niso preprečile
implementacije ali izvedenih preverjanj.
