# Implementacija in preverjanje

## Začetni zapis

Vloga: implementer. Zahteve iz izvirnih navodil `task/instructions.md` R01–R12
ostajajo merodajne; predana specifikacija je v `docs/agent/specification.md`.
Spreminjam lahko `src/`, `tests/agent/` in ta zapis. Specifikacije, njihove
zgodovine, pregledovalčevih datotek, skupnih testov, infrastrukture in
odvisnosti ne spreminjam.

### Načrtovana preverjanja

- Pregled obstoječega UI/API toka, Folio dizajna in razvojnih testov.
- Dodati lastne ciljne teste za sortiranje in stanje projekta.
- Zagnati `npm run check` in lastne teste, zabeležiti izide ter predati
  pregledovalcu vsaj 60 sekund pred rokom faze.

### Neizvedeno ob začetku

Vsi pregledi kode in testi so bili še neizvedeni. Začetni klic `git status` ni
uspel: sistemski `xcrun` poroča o manjkajoči poti
`/Library/Developer/CommandLineTools`. Časovni pripomoček je ob začetku
poročal 544 sekund v fazi in 903 sekunde skupaj.

## Spremembe

- `src/taskSorting.ts` vsebuje čiste primerjalnike in sortirno projekcijo.
  Naslov in odgovorno osebo normalizira v zahtevanem vrstnem redu ter primerja
  z JavaScriptovim `<`/`>`; status ima fiksen rang, veljavne datume pa primerja
  leksikografsko. Projekcija razvršča kopijo z izvornim indeksom kot stabilnim
  zadnjim razvezovalcem. Primarni `original` vrne prejeti seznam brez posega.
- `src/App.tsx` doda štiri selecte in gumb »Izvorni vrstni red«. Nastavitve so
  lokalne za `ProjectView`: menjava pogleda in podrobnosti jih ohrani, obstoječi
  `key={project.id}` jih ob menjavi projekta ponastavi, osvežitev pa ustvari
  privzeto stanje. Tabela in tabla prejmeta isto sortirano projekcijo; seštevki
  se še naprej računajo iz izvirnih podatkov.
- `src/styles.css` oblikuje kontrole z obstoječimi barvami in omogoča prelom v
  ozkem pogledu. `tests/agent/P04.spec.ts` vsebuje štiri ciljne scenarije.

## Sledljivost zahtev in izidi

| Zahteva | Izvedba | Preverjanje in dejanski izid |
| --- | --- | --- |
| R01 | Privzete vrednosti in izvorni red: `src/taskSorting.ts:14-19,46-48`; selecti v `src/App.tsx:46-68`. | `tests/agent/P04.spec.ts:53-59,75-77` preveri vse privzete vrednosti in odziv v izvornem vrstnem redu. Uspešno. |
| R02 | `src/taskSorting.ts:23-30,33-36` izvede NFD, odstrani U+0300–U+036F, pretvori v male črke in uporablja UTF-16 leksikografski operator. | `tests/agent/P04.spec.ts:61-69` preveri naglašene znake, izenačene normalizirane nize, številčne nize brez numeričnega razvrščanja ter naslov in odgovorno osebo v obeh smereh. Uspešno. |
| R03 | Rang statusa in primerjava ISO datumov: `src/taskSorting.ts:21,33-39`. | `tests/agent/P04.spec.ts:66-70` preveri vse tri statuse in datume po mesecih; razvojna D03 preveri datum kot primarni ključ. Uspešno v obeh projektih razvojnih testov. |
| R04 | Smer obrne samo rezultat posameznega primerjalnika: `src/taskSorting.ts:42-44,53-60`; stabilne vezi so ločene. | `tests/agent/P04.spec.ts:61-73` preveri primarno asc/desc in sekundarno desc ob primarnem izenačenju; razvojna D02 preveri neodvisno sekundarno smer. Uspešno. |
| R05 | Sekundarni primerjalnik se izvede samo po primarnem rezultatu `0`: `src/taskSorting.ts:54-60`. | `tests/agent/P04.spec.ts:66-73` in razvojna D02 preverita sekundarno razvrščanje znotraj primarnih skupin. Uspešno. |
| R06 | Izvorni indeks razreši preostalo vez; `original` prezre druge kontrole: `src/taskSorting.ts:46-48,57-64`. | `tests/agent/P04.spec.ts:70-77` preveri ponovljen ključ, stabilne vezi in `original` z nasprotnimi nastavitvami. Uspešno. |
| R07 | Tabla dobi isto razvrščeno polje kot tabela (`src/App.tsx:69`); obstoječi stolpci filtrirajo brez preurejanja (`src/TaskBoard.tsx:4-11,14-18`). | Razvojna D03 preveri relativni vrstni red v stolpcu; lastni test preveri tablo. Uspešno v desktop in mobile razvojnih projektih. |
| R08 | Stanje je v `ProjectView`, ki se pri menjavi pogleda/podrobnosti ne zamenja (`src/App.tsx:12-15,42-43,85`). | `tests/agent/P04.spec.ts:80-99` spremeni pogled, odpre/zapre podrobnost in preveri ohranitev. Uspešno. |
| R09 | `ProjectView` je ključen po ID projekta (`src/App.tsx:113`); ni trajne shrambe ali URL parametra za sortiranje. | `tests/agent/P04.spec.ts:93-99` preveri ponastavitev projekta in osvežitve. Uspešno. |
| R10 | Reset nastavi vse štiri privzete vrednosti (`src/App.tsx:67`); primerjalnik podpira nič ali en zapis. | `tests/agent/P04.spec.ts:108-129` preizkusi vse možnosti kontrol na praznem in enoelementnem seznamu ter vse vrednosti po resetu. Uspešno. |
| R11 | Sorter izdeluje projekcijo; `counts` ostane vezan na `tasks` (`src/App.tsx:15-20,69,73`); ne kliče zapisovalnega API-ja. | Razvojna D04 preveri nič zapisov po spremembi/resetu, vključno z mobile projektom. Uspešno. |
| R12 | ID-ji ostanejo ključi in `data-task-id` v tabeli/kartici; povezava podrobnosti uporablja ID. Obstoječa aria poimenovanja so ohranjena. | Lastni test (`tests/agent/P04.spec.ts:86-98`) preveri ime pregleda, enaka naslova, enkraten prikaz ID-jev in prave podrobnosti; izhodiščni testi podrobnosti uspejo na desktopu in mobile. Razvojna mobilna D04 preveri, da stran ne preseže širine zaslona. Uspešno. |

## Preverjanja

- Končni `npm run check`: uspešno. Lint, TypeScript preverjanje in produkcijska
  gradnja so uspeli; Playwright je zaključil **50/50** testov: 14 API, 24
  izhodiščnih UI, 8 razvojnih P04 (desktop/mobile) in 4 agentnih.
- Po tem preverjanju sem dodal še preverbo ohranjenega aria imena v agentnem
  testu; končni `npx playwright test --project=agent` je zaključil **4/4**
  uspešno. Sprememba je bila samo v testu.
- Prvi celotni zagon je imel 48 uspešnih in en neuspešen agentni test, ker je
  test poskusil zamenjati fixture na isti strani brez ponovnega nalaganja.
  Test je bil razdeljen na ločena prazna/enoelementna primera; končni zagon je
  uspešen.

## Omejitve in odprta vprašanja

- Vedenjske napake predane specifikacije nisem našel. Razvojni/izhodiščni testi
  ne pokrijejo vseh kombinacij in ne preverjajo posebnega ne-BMP primera UTF-16;
  primerjalnik vseeno neposredno uporablja zahtevana operatorja JavaScript.
- `git status` ni dostopen v tem okolju: `xcrun` vrne neveljavno aktivno pot
  `CommandLineTools` in manjkajoči `xcrun`. Zaradi tega končnega stanja Git ni
  bilo mogoče preveriti s tem ukazom.
- NPM izpiše opozorilo za neznano nastavitev `http-proxy`; Node izpiše
  opozorilo o `NO_COLOR`/`FORCE_COLOR`. Opozorili nista preprečili preverjanj.
  Javnega interneta nisem uporabil. Preverjanje je zaključeno za predajo.
