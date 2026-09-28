# P05: preverjanje izvedbe

## Izvedeni ukazi in rezultati

Končni zagon `npm run check` je zaključen z izhodno kodo 0. Ukaz je izvedel:

- `npm run lint` (`eslint .`): uspešno.
- `npm run build` (`tsc --noEmit` in `vite build`): uspešno; produkcijski paket
  je bil zgrajen.
- `npm test`: **53/53 testov uspešnih** v 19,8 s; en Chromium worker.

Razčlenitev 53 testov: 14 API, 24 začetnih UI regresijskih testov (namizje in
telefon), 8 razvojnih P05 testov (namizje in telefon) ter 7 lastnih P05 testov
v `tests/agent/P05.spec.ts`. Končni zagon je vključeval zadnjo spremembo
lastnih testov, ki preveri tudi števce stolpcev table. Npm in Node sta izpisala
opozorili za okoljski `http-proxy` ter `NO_COLOR`/`FORCE_COLOR`; nista
preprečili preverjanja.

Prvi zagon po začetnem osnutku dodatnih testov je odkril napako v testni
pripravi: isti test je dvakrat registriral omrežno prestrezanje na isti strani.
Prazni projekt in prazen filter sta bila razdeljena v ločena scenarija. V
končnem zagonu je vseh 53 testov uspešnih.

## Sledljivost zahtev

Vsaka vrstica spodaj je bila preverjena v uspešnem končnem zagonu `npm run
check`; podrobna pravila in predikati so v
[`specification.md`](./specification.md).

| Zahteva | Izvedeno preverjanje | Rezultat |
| --- | --- | --- |
| R01 | Agentni test `R01–R04: default order…`; začetna vrednost kontrol in celoten izvorni vrstni red. | Uspešno. |
| R02 | Razvojni test D01; agentna preverjanja strani 2, 5 in 10, 11 opravil, zadnje krajše strani ter enkratnosti ID-jev. | Uspešno. |
| R03 | Agentni test `R01–R04…`; preverjene prve/prejšnje/naslednje/zadnje in onemogočanje na robovih. | Uspešno. |
| R04 | D04 in agentni test velikosti; sprememba s strani 2 na velikost 5 pokaže prvo stran, čeprav bi bila stran 2 še veljavna. | Uspešno. |
| R05 | D03; agentni test filtrov `todo`, `in_progress`, prazen `done` ter povratek na prvo stran. | Uspešno. |
| R06 | D03; agentni preklop table/preglednice z istimi ID-ji trenutne strani. | Uspešno. |
| R07 | Agentni test `R07–R08…`; podrobnosti odprte na drugi strani, zapiranje in menjava pogleda ohranita stran, velikost ter filter. | Uspešno. |
| R08 | Agentni test `R07–R08…`; menjava projekta ponastavi obe kontroli in prikaz, URL nima stanja straničenja. | Uspešno. |
| R09 | D02; preverjeno točno besedilo statusa za krajšo zadnjo stran; dodatno status za 11. opravilo. | Uspešno. |
| R10 | Dva agentna testa: prazen projekt ter prazen filter; besedilo 0–0, onemogočeni gumbi in obnovitev rezultatov po odstranitvi filtra. | Uspešno. |
| R11 | Agentni test; pregled stanj ostane 4/2/2, čeprav stran vsebuje dve opravili; števci stolpcev table so 2/0/0. | Uspešno. |
| R12 | D04 in agentni testi; pomočnik `readonly` ne zazna API zapisov, ohranjeni so ID-ji in odzivno drsenje pri 390 px; začetni regresijski testi pokrivajo podrobnosti. | Uspešno. |

## Omejitve

- Končni zasebni testi iz naloge niso bili na voljo za neposreden zagon.
  Preverjeni so opisani robni primeri z lastnimi podatki, med njimi 0, 2, 8 in
  11 opravil.
- Vizualni pregled v ločenem ročnem brskalniku ni bil izveden; mobilna širina
  390 px, preklop pogledov in odsotnost vodoravnega razširitve strani so bili
  preverjeni v Playwrightu.
- `git status` ni deloval: lokalni `git` je javil neveljavno aktivno pot do
  Xcode Command Line Tools (`xcrun: invalid active developer path`). Zato
  stanje izvoza z Gitom ni bilo mogoče potrditi. Urejene datoteke so
  `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`,
  `tests/agent/P05.spec.ts`, `docs/agent/specification.md` in
  `docs/agent/verification.md`.
