# Preverjanje implementacije P04

## Načrt

- Pregled predane specifikacije, obstoječega vmesnika in razvojnih testov.
- Implementacija stabilnega razvrščanja z dvema ključema v obstoječem dizajnu.
- Lastni enotni testi za primerjalna pravila in UI-testi za stanje ter projekcijo.
- Zagon lastnih testov, razvojnih testov P04 in nato celotnega `npm run check`.

## Stanje

- Implementacija je zaključena in preverjena.
- Omejitve okolja: javni internet je blokiran; Chromium povezujem prek `task/browser.json`; testna strežnika uporabljata vratini 5174/3102.
- Po uspešnem preverjanju poskus pregleda razlike z `git status`/`git diff` ni uspel, ker sandbox ne dovoli dostopa do `/Users/zan/.gitconfig` in pomožnih sistemskih map za `xcrun`. Podatkovne datoteke v dovoljenih mapah so bile spremenjene le prek `apply_patch`.

## Spremembe

- `src/sorting.ts`: čista projekcija `sortTasks`, privzeto stanje, normalizacija NFD in odstranitev diakritičnih znakov, UTF-16 primerjava, statusni red, datumski red ter stabilnost po izvornem indeksu.
- `src/App.tsx`: stanje štirih kontrol, kontrole in gumb `Izvorni vrstni red`; razvrščeno polje se uporablja v preglednici in tabli; stanje je vezano na `ProjectView`, zato se ob menjavi projekta ponastavi in prek pogleda ali podrobnosti ohrani.
- `src/styles.css`: kontrole razvrščanja v obstoječem Folio dizajnu ter prilagodljiv prelom na širinah do 390 px.
- `tests/agent/sorting.spec.ts`: lastna preverjanja primerjalnih pravil, normalizacije, statusov, datumov, smeri, stabilnosti in nespremenjenega vhoda.
- `tests/agent/ui.spec.ts`: lastna odprta preverjanja privzetih vrednosti, obeh pogledov, stolpcev, podrobnosti, ponastavitve, menjave projekta, osvežitve, brez zapisovalnih zahtevkov, brez trajne shrambe/URL-ja ter praznega in enojnega projekta.

## Sledljivost

| Zahteva | Izid |
| --- | --- |
| R01 | Izpolnjeno; privzeto stanje in izvorni vrstni red sta preverjena. |
| R02 | Izpolnjeno; normalizacija in UTF-16 primerjava sta preverjeni brez jezikovnega ali številčnega razvrščanja. |
| R03 | Izpolnjeno; statusni red in koledarska datumska trojica sta preverjena. |
| R04 | Izpolnjeno; smeri obračajo samo rezultat primerjave, enaki vnosi ostanejo stabilni. |
| R05 | Izpolnjeno; sekundarni ključ deluje samo ob enakosti primarnega ključa z lastno smerjo. |
| R06 | Izpolnjeno; izvorni indeks je zadnji primerjalnik, enaka ključa ne dodata obrata, `original` ignorira ostale kontrole. |
| R07 | Izpolnjeno; tabela ohranja tri stalne stolpce in relativni vrstni red razvrščenega polja. |
| R08 | Izpolnjeno; preklop pogleda ter odpiranje in zapiranje podrobnosti ohranita vse štiri nastavitve. |
| R09 | Izpolnjeno; menjava projekta in osvežitev ponastavita kontrole; ni `localStorage`, `sessionStorage` ali URL parametra. |
| R10 | Izpolnjeno; gumb ponastavi vse kontrole; prazen in enojen projekt preverjena pri vseh kombinacijah. |
| R11 | Izpolnjeno; razvrščanje vrača novo polje, ne spreminja vhoda, ne pošilja zapisovalnih zahtevkov. |
| R12 | Izpolnjeno; ID-ji ostanejo enkratni, podrobnosti se odprejo po ID-ju, širina 390 px ne razširi strani. |

## Rezultati

- `npx playwright test --project=agent`: 8/8 uspešno.
- `npx playwright test --project=development-desktop --project=development-mobile`: 8/8 uspešno.
- `npm run check`: slog, tipi, gradnja in vsi testi uspešni; 54/54 uspešno.
- Predana specifikacija vsebuje enake zahteve kot izvirna navodila; napaka specifikacije ni bila ugotovljena.

## Dnevnik

- Zapisano ob začetku faze.
- Implementirana razvrščalna enota, kontrole in povezava obeh pogledov.
- Lastni testi najprej odkrili tri napake v pričakovanih testnih podatkih/vrstnih redih; popravljene so bile, implementacijska napaka ni bila ugotovljena.
- Zadnja zagona lastnih, razvojnih in celotnih preverjanj so uspešna.
