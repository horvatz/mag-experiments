# P04 izvedbene naloge

## Priprava

- [x] [T001] V `tests/agent/p04-support.ts` pripravi testno lokalno prestrezanje javnih GET odgovorov za prilagodljive sezname opravil in beleženje zapisovalnih klicev; aplikacija pri tem ne uporablja `/__test/`.

## Temelj

- [x] [T002] V `src/taskSorting.ts` implementiraj čisto projekcijo z besedilno normalizacijo, statusnim in datumskim vrstnim redom, neodvisnimi smermi ter stabilnim izenačenjem po izvornem indeksu; `original` vedno ohrani vhodni vrstni red (R01–R06, R11).

## Funkcionalnost

- [x] [T003] V `src/App.tsx` dodaj štiri dostopna HTML `select` kontrolna polja in gumb »Izvorni vrstni red«; nastavitve naj bodo lokalne izbranemu projektu, ob preklopu pogleda/podrobnosti naj ostanejo, ob menjavi projekta in osvežitvi pa naj se ponastavijo (R01, R08–R10).
- [x] [T004] V `src/App.tsx` izpelji eno urejeno zaporedje za preglednico in tablo ter ohrani vhodna opravila za povzetke; v `src/TaskBoard.tsx` ohrani stalni vrstni red stolpcev in relativni vrstni red kartic, če je potrebna prilagoditev (R07, R11, R12).
- [x] [T005] V `src/styles.css` dodaj minimalne sloge za nove kontrole, skladne s Folio, vidnim fokusom in prikazom pri 390 px brez razširitve strani (R12).

## Preverjanje

- [x] [T006] V `tests/agent/P04.spec.ts` preveri privzete vrednosti, vse primarne in sekundarne ključe/smeri, Unicode besedila, statusne razrede, koledarske datume, stabilne izenačitve, `original` in projiciranje brez mutiranja; vključi prazne in enoopravilne projekte (R01–R06, R10–R11).
- [x] [T007] V `tests/agent/P04.spec.ts` preveri skupni vrstni red preglednice in table, ohranitev/ponastavitev nastavitev pri navigaciji, ID-povezave pri enakih naslovih, povzetke brez zapisov ter dostopnost in širino 390 px (R07–R12).
- [ ] [T008] Zaženi agentne scenarije in `npm run check` za razvojne P04, skupne API/brskalniške teste, tipizacijo, gradnjo in lint; dejanske rezultate ter povezave R01–R12 dopolni v `docs/agent/P04/spec.md` in zapiši morebitne nepreverjene zahteve.
