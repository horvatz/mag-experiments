# Preverjanje P05

## Izvedba

Izveden je bil ukaz `npm run check`, ki zažene ESLint, TypeScript preverjanje, produkcijsko gradnjo Vite in celoten Playwright nabor. Končni zagon je uspel: **53/53 testov**.

- ESLint: uspešno.
- `tsc --noEmit`: uspešno.
- `vite build`: uspešno.
- Playwright: 14 API testov, 24 izhodiščnih primerov na namizju in mobilni širini, 8 razvojnih P05 primerov na namizju in mobilni širini ter 7 lastnih agentnih primerov; vsi uspešni.
- Razvojni D04 preveri tudi, da pri mobilni širini dokument nima vodoravnega prelivanja. Agentni A07 preveri še 11 opravil, stran velikosti 10 ter nespremenjen seznam ob navigaciji.

Prvi poskus gradnje je razkril napačni imeni ikon v uvozu; uporabljeni sta bili imeni, izvoženi v nameščeni različici knjižnice, nato pa je celoten končni zagon uspel. Prvi poskus testov je imel dve napačni pričakovanji v novih testih (velikost projekta in ponovna registracija testne poti); testa sta bila popravljena oziroma ločena in končni zagon je uspešen.

## Sledljivost zahtev

| Zahteva | Sprejemni pogoj | Koda | Dejanski test in rezultat |
| --- | --- | --- | --- |
| R01 | Privzeto `all/all/1`, vsi ID-ji v API vrstnem redu. | `src/App.tsx`:16–27, 64–95 | `tests/agent/P05.spec.ts` P05 A01: vseh 8 ID-jev in status; uspešno. |
| R02 | Velikosti 2, 5 in 10 tvorijo zaporedne odseke brez izpustov/podvojitev. | `src/App.tsx`:20–27, 34–38, 82–95 | Razvojna P05 D01/D04 in agentni A01/A03/A07: prehodi med stranmi, sprememba velikosti ter 11 opravil z zadnjo enojno stranjo; uspešno. |
| R03 | Prva/prejšnja/naslednja/zadnja stran delujejo; robni gumbi so onemogočeni. | `src/App.tsx`:36–38, 75–80 | Agentni A01: prva, naslednja, zadnja, robna onemogočenja; uspešno. |
| R04 | Menjava velikosti vedno ponastavi stran; `all` je ena stran pri rezultatih. | `src/App.tsx`:21, 34 | Razvojna D04 in agentni A03: s strani 4 na velikost 5 se prikaže prva stran; uspešno. |
| R05 | Filter deluje pred straničenjem in se ob spremembi vrne na prvo stran. | `src/App.tsx`:20, 35 | Razvojna D03 in agentna A02/A05: vrstni red filtriranih ID-jev, status ter prazen filter; uspešno. |
| R06 | Preglednica in tabla prikažeta iste ID-je trenutne strani; tabla razporedi ta odsek v stolpce. | `src/App.tsx`:23–25, 83, 87; `src/TaskBoard.tsx`:13–25 | Razvojna D03 in agentna A02/A07: ID-ji v obeh pogledih, stolpec ter druga stran; uspešno. |
| R07 | Preklop pogleda in dialoga ohranita stran, velikost in filter. | `src/App.tsx`:14–18, 60–62, 99 | Agentni A04: druga stran table, odpiranje/zapiranje dialoga in ohranjeni status/ID-ji; uspešno. |
| R08 | Menjava projekta in osvežitev ponastavita stanje; URL in trajna shramba ga ne vsebujeta. | `src/App.tsx`:16–18, 127 | Agentni A03/A04: po osvežitvi privzeti izbiri in vsi ID-ji; po menjavi projekta `all/all/1`; uspešno. Pregled kode potrjuje, da se stanje uporablja samo z React `useState`. |
| R09 | Natančen status s številko strani in 1-osnovanim razponom. | `src/App.tsx`:26–27, 82 | Razvojna D02 in agentna A01/A02: tudi zadnji krajši odsek izpiše pravilen razpon; uspešno. |
| R10 | Prazno stanje izpiše `Stran 0 od 0. Prikazano 0–0 od 0.` in onemogoči vse premike. | `src/App.tsx`:21–27, 75–82 | Agentna A05/A06: prazen filter, odstranitev filtra in prazen projekt; uspešno. |
| R11 | Povzetek in skupno število sta za cel projekt; števci table so za prikazani odsek. | `src/App.tsx`:28–32, 46–50, 58, 96; `src/TaskBoard.tsx`:16–23 | Agentni A07: vsote 4/4/3 pri 11 opravilih, skupno 11 ter števci strani z 10 in 1 opravilom; uspešno. |
| R12 | Straničenje ne zapisuje podatkov; povezave, ID-ji, podrobnosti, nalaganje in prilagodljiv videz ostanejo. | `src/App.tsx`:15, 83–99; `src/TaskBoard.tsx`:25–34; `src/styles.css`:66–72 | Izhodiščni API/UI testi: povezave po ID, podrobnosti, napake/nalaganje in odzivnost; razvojna D04: brez zapisov in brez vodoravnega preliva na mobilni širini; agentna A07: brez zapisovalnih API zahtev in brez preliva; vse uspešno. |

## Omejitve

Skriti končni testi niso bili dostopni. Preverjanje uporablja nameščeni Chromium in lokalni testni strežnik; javni internet ni bil potreben. Primeri neposredno pokrijejo prazen projekt in filter, običajen projekt ter 11 opravil; obnašanje pri sočasni spremembi podatkov brez osvežitve ostaja zunaj obsega navodil.
