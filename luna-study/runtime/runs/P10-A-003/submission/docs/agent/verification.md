# Preverjanje P10

## Izvedeni ukazi in rezultati

- `npx playwright test --project=agent` — uspešno, 9 agentnih testov.
- `npm run check` — uspešno: ESLint, `tsc --noEmit`, Vite produkcijska gradnja ter 55/55 Playwright testov.
  - API: 14/14.
  - Izhodišče: namizje 12/12 in mobilni Chromium 12/12.
  - Razvojni P10: namizje 4/4 in mobilni Chromium 4/4.
  - Agentni testi: 9/9.
- Prvi celotni zagon med razvojem je pravilno ustavil preverjanje zaradi napačnih pričakovanj v štirih novih testih (fixture statusi, redo pričakovanje, strog locator in ponovno uporabljena API route). Popravil sem teste; ciljni zagon agentnega projekta je uspel 9/9, končni celotni zagon pa 55/55. Kode aplikacije zaradi teh napak ni bilo treba spreminjati.

## Zahteve in dokazi

| Zahteva | Izvedeni scenarij in dokaz | Omejitev dokaza |
| --- | --- | --- |
| R01 | `P10: global places follow IDs and moves keep task data and counts` preveri začetna mesta po ID-ju in enake naslove v podatkih. | Uporabljen je razvojni nabor z osmimi opravili. |
| R02 | Isti test opravi premik in preveri nov vrstni red, naslov, rok ter povzetke stanj. `D01` preveri premik gor. | Drugačne poljubne vrednosti `Task` niso bile izčrpno enumerirane. |
| R03 | Isti test preveri onemogočena prva/gornja in zadnja/spodnja dejanja; testa za prazno in eno opravilo potrdita, da ni dovoljene poteze. | Onemogočeni gumb uporabniško ni mogoče sprožiti; guard reducerja je dodatno pokrit z R06. |
| R04 | `P10: multiple undo and redo, reset is one action, and a new branch clears redo` opravi dve razveljavitvi. | Preverjeni sta dve zaporedni potezi; globino 20 preveri test R07. |
| R05 | Isti test izvede redo; test R07 razveljavi in ponovi vseh 20 ohranjenih korakov ter preveri končni vrstni red. | Ne pokriva poljubno dolge zgodovine nad kapaciteto. |
| R06 | `P10: a rejected edge action preserves both undo and redo history` uporabi reducer z aktivnim skladom redo in potrdi, da sta robni premik ter noop reset ista nespremenjena vrednost stanja. | Gre za neposredno testiranje čiste funkcije, ne za programsko klikanje onemogočenega gumba. |
| R07 | `P10: undo history keeps only 20 states and all retained steps can be redone` izvede 21 veljavnih potez, preveri 20 undo korakov in 20 redo korakov. | Meja je preizkušena z dvema ID-jema, ki izmenjujeta mesti. |
| R08 | Test resetov preveri obnovitev začetne permutacije, razveljavitev reset dejanja, praznjenje redo in onemogočen reset pri izvirnem vrstnem redu. | Obnovitev je preverjena z UI mesti/ID-ji, ne z internim stanjem Reacta. |
| R09 | `P10: board keeps status columns and global adjacency across columns` premakne opravili različnih statusov čez globalni sosednji mesti in preveri fiksne stolpce ter mesta; `D04` preveri globalno številko. | Različni vrstni redi statusov so pokriti z vzorčnim naborom, ne z vsemi kombinacijami. |
| R10 | `P10: view, details, project navigation and refresh have the required lifetime` preveri ohranitev po preklopu pogleda in podrobnostih ter ponastavitev po projektu in osvežitvi. | Podatkovna osvežitev brez navigacije je zunaj dogovorjenega obsega. |
| R11 | Testi praznega in enoopravljenega projekta preverijo uporabnost, števce in onemogočene akcije; glavni UI test preveri usklajen števec po premiku. | Natančneje preverjen je začetni števec ter eno dejanje, večkratno stanje pa pokrivata undo/redo testa. |
| R12 | `readonly` v agentnem in `D04` preverjanju potrdi brez zapisov API; statusi in podrobnosti so dodatno pokriti z izhodiščnimi testi; agentni test preveri širino 390 px, širino strani in notranje drsenje tabele. | Testi ne pregledujejo vseh možnih imen, Unicode nizov in datumov, ki jih API lahko vrne. |

## Omejitve

- Nedostopnih končnih testov ni bilo mogoče izvesti; poročilo navaja samo dejansko zagnane lokalne teste.
- Razvojni in lastni testi ne izčrpajo vseh kombinacij dolžin, ID-jev, statusov in besedil iz specifikacije. Splošno ravnanje izhaja iz permutacije ID-jev in uporabe izvirnih `Task` objektov.
- `npm` je izpisal opozorilo o konfiguraciji `http-proxy`, Node pa opozorila `NO_COLOR`/`FORCE_COLOR`; ukazi so se kljub temu uspešno zaključili.
