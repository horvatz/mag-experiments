# Implementacija in preverjanje

## Začetni zapis

Vloga: implementer. Predana specifikacija je `docs/agent/specification.md`;
izvorne zahteve R01–R12 ostajajo merodajne. Dovoljene spremembe so `src/`,
`tests/agent/` in ta implementacijski zapis v `docs/agent/`.

### Načrtovana preverjanja (še neizvedena)

- Pregledati obstoječo UI strukturo, potrjeni Folio dizajn in P03 razvojne teste.
- Dodati iskanje, sestavljene filtre, štetje ter prazno stanje brez spremembe
  podatkov ali API infrastrukture; ohraniti navigacijo, oba pogleda in odzivnost.
- Dodati ciljne lastne teste v `tests/agent/` za robne primere, ki jih ne
  pokrivajo razvojni testi.
- Zagnati `npm run check` in ločeno P03 razvojne teste; zapisati dejanske
  rezultate in morebitne omejitve okolja.
- Pregledati končni diff in povezati zahteve z implementacijo ter dokazili.

## Izvedba

V `src/App.tsx` so filtri lokalno stanje projektnega pogleda. Seznam rezultatov
nastane z ne-mutirajočim `.filter()` nad API podatki in ohrani njihov vrstni red.
Iskalni izraz se razdeli na besede; za iskalno besedilo in opravilo se uporabi
NFD, odstranitev U+0300–U+036F in male črke. Rezultat, števci in status so
skupni vhod za preglednico ter tablo. Možnosti oseb se sestavijo iz vseh
opravil projekta. Projektni `key` ponastavi stanje ob navigaciji, osvežitev pa
začne z začetnimi vrednostmi React stanja. Podatki ostanejo samo za branje.

V `src/TaskBoard.tsx` je ohranjen prikaz po stolpcih in dodano sporočilo za
neujemanje; `src/styles.css` doda kontrole v Folio slogu in pri 390 px razporedi
polja brez preliva zunanje strani.

## Zahteve in dokazila

| Zahteva | Implementacija | Dejanski test oziroma dokaz |
| --- | --- | --- |
| R01 | `src/App.tsx:19-29,24` — privzeti kontrolniki in filtriranje brez razvrščanja. | Lastni test `filtering uses normalized literal terms across all searchable fields` preveri začetni vrstni red; osvežitev vrne vse rezultate. |
| R02 | `src/App.tsx:13-15,27-28` — NFD, odstranjevanje kombinacijskih znamenj in male črke v ID, naslovu, opisu in osebi. | Lastni iskalni test preveri `Črka`/`crka`, veliko začetnico, ID, opis in osebo. |
| R03 | `src/App.tsx:22,28` — neprazne besede se ujemajo z dobesednim podnizom, vse z AND. | Lastni iskalni test preveri obrnjeni vrstni red besed in dobesedni `.*`. |
| R04 | `src/App.tsx:24-28,65-76` — stanje, natančno ime osebe in iskanje se sestavijo z AND. | Razvojna D02 ter lastni test kombinacije `todo` + oseba brez zadetkov. |
| R05 | `src/App.tsx:23,74-79` — različna neprazna imena iz celotnega projekta. | Lastni test preveri enkratno podvojeno ime, skrito osebo in menjavo projekta. |
| R06 | `src/App.tsx:84,88`, `src/TaskBoard.tsx:13-28` — isti filtrirani seznam za oba prikaza; tabla razdeli samo rezultate po stanju. | Razvojna D02 preveri ID-je ob preklopu; lastni test preveri oba pogleda ob nič zadetkih in čiščenje. |
| R07 | `src/App.tsx:128` — `ProjectView` ima projektni ključ, ki ob menjavi ponastavi tri filtre. | Lastni test `project changes reset local filters and people options` preveri vrednosti, možnosti in ID-je novega projekta. |
| R08 | `src/App.tsx:19-21` — filtri niso v URL-ju ali trajni shrambi. | Lastni iskalni test preveri URL projekta in privzete vrednosti po ponovnem nalaganju. |
| R09 | `src/App.tsx:30-34,83,97`, `src/TaskBoard.tsx:18-23` — status in vsi povzetki štejejo prikazane rezultate. | Razvojna D04 preveri števec `4 od 8`; lastna testa preverita `0 od 3` ter prazno `0 od 0`. |
| R10 | `src/App.tsx:84`, `src/TaskBoard.tsx:14-15` — ločena prazno-projektno in brez-zadetkov stanje. | Lastni testi preverijo `Ni zadetkov.` v tabeli in tabli ter običajno prazno stanje projekta. |
| R11 | `src/App.tsx:81` — en klik nastavi prazno iskanje in oba filtra na `all`. | Lastni sestavljeni test preveri kontrole ter vse ID-je po čiščenju; API ostane nespremenjen. |
| R12 | `src/App.tsx:55-57,88-100,128`; obstoječi detajli/navigacija ostanejo uporabljeni. | `npm run check`: izhodiščni testi navigacije, detajlov in samo-bralnega vedenja so uspešni; lastni test preveri zunanji preliv pri širinah 800 in 390 px za preglednico in tablo. |

## Izvedena preverjanja

- `npm run typecheck` — uspešno.
- `npm run lint` — uspešno.
- `npx playwright test --project=development-desktop --project=development-mobile` — 8/8 uspešno.
- Končni `npm run check` — lint, typecheck, produkcijska gradnja in 50/50 testov uspešno: 14 API, 12 namiznih osnovnih, 12 mobilnih osnovnih, 8 razvojnih in 4 lastni testi.
- Vmesni `npm run check` je imel 1 neuspeh od 49: lastni test je napačno zahteval vrstni red preglednice na tabli, ki prikazuje stolpce po stanju. Trditev testa je bila popravljena, da na tabli primerja ID-je brez predpostavke vrstnega reda; končni zagon je uspešen.

## Odprta vprašanja in omejitve

Napake ali manjkajoče zahteve v predani specifikaciji med implementacijo nisem
našel. Dostopni lokalni testi so bili izvedeni; ločenih končnih testov zunaj
projekta nisem imel. Javni internet je v okolju blokiran po navodilu. Opozorili
okolja, ki testov nista preprečili: npm poroča o neznanem `http-proxy` configu,
Node pa o `NO_COLOR`, ki ga preglasi `FORCE_COLOR`. Poskus `git status --short`
ni uspel, ker okoljski `xcrun` kaže na manjkajoča orodja
`/Library/Developer/CommandLineTools`; zato git pregled stanja ni bil dostopen.

Začetni časovni odčitek iz `node task/time-budget.mjs` je bil 643 sekund faze
in 1002 sekundi skupnega časa. Časovni odčitki med preverjanjem so ostali znotraj
roka implementerske faze.
