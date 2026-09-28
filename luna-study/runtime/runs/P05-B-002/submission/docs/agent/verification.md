# Zapis implementacije in preverjanja

## Začetni načrt (pred spremembami)

Implementirati R01–R12 iz `docs/agent/specification.md` ob ohranitvi Folio videza, slovenskih oznak, obstoječega API-ja in navigacije. Predvidene spremembe: lokalno stanje velikosti/filtra in izračun strani v `src/App.tsx`, prikazovanje istega odseka v tabeli in tabli, kontrolni elementi/status ter po potrebi prilagoditev `src/TaskBoard.tsx` in `src/styles.css`. Ne posegati v skupne teste, infrastrukturo, odvisnosti, specifikacijo ali datoteke drugih vlog.

Predvidena preverjanja (še neizvedena): pregled obstoječih P05 razvojnih testov; lastni testi za velikosti strani, stabilen filter, navigacijo, prazen rezultat in ohranitev stanja; `npx playwright test --project=development-desktop --project=development-mobile`; `npm run check`; pregled odzivnega prikaza pri 390 px, če je izvedljiv z nameščenim Chromiumom. Pred zagonom daljših preverjanj ponovno preveriti časovni proračun.

## Omejitve okolja

- Naloga prepoveduje spreminjanje strežnika, skupnih tipov/testov, nastavitev in odvisnosti; dovoljeni so `src/`, `tests/agent/` in ta zapis.
- Javnega interneta ni; uporabniški vmesnik mora uporabljati le obstoječi javni `/api/`, brez `/__test/`.
- Lastni Playwright skripti morajo prebrati `wsEndpoint` iz `task/browser.json` in uporabiti `chromium.connect(wsEndpoint)`; `chromium.launch()` v tem okolju ne deluje.
- Začetni zapis: preverjanja še niso bila izvedena; rezultati bodo dopolnjeni po spremembah.

## Implementacija in preverjanje

- `src/App.tsx`: lokalna velikost/stran/filter; filter pred izračunom strani; odsek podaja tako preglednici kot tabli. Status natančno izpiše 1-indeksirani obseg ali `0–0`; navigacija je na robovih onemogočena. Menjava velikosti/filtra ponastavi stran; `ProjectView` je ključen po ID-ju projekta, zato projektna menjava ponastavi vse tri nastavitve. Stanje ostane zunaj URL-ja in trajne shrambe.
- `src/TaskBoard.tsx` ostane nespremenjen: obstoječe združevanje stolpcev prejme samo vidni odsek. Pregled stanj, skupni števec in spodnji povzetek še vedno uporabljajo celoten seznam projekta.
- `src/styles.css`: kontrolniki sledijo obstoječim Folio robovom/barvam in se pri ozkih zaslonih zložijo.
- `tests/agent/pagination.spec.ts`: dodani scenariji za začetno stanje, straničenje, filter, tablo/povzetke, ohranitev in ponastavitev stanja, prazne rezultate, kratko zadnjo stran in enostranski rezultat.
- `npm run check` je bil po popravku izveden do konca z izhodno kodo 0: ESLint, `tsc --noEmit`, Vite produkcijska gradnja in 51/51 Playwright testov. Zagon je obsegal 14 API, 24 izhodiščnih namiznih/mobilnih, 8 P05 razvojnih namiznih/mobilnih ter 5 lastnih testov. Testni strežnik je uporabljal konfigurirana vrata 5174/3102.
- Po dodatni okrepitvi scenarija ponovnega nalaganja (preveri ponastavitev s strani 2) je bil `npx playwright test --project=agent` ponovno izveden: 5/5 lastnih testov je uspešnih.
- Prvi zagon celotnega preverjanja je pravilno odkril pretvorbeno napako velikosti strani (`<select>` vrne niz; `pageStart + pageSize` je zato združil niz). Vrednost je zdaj pretvorjena v število v `onChange`; napačno pričakovanje lastnega enostranskega scenarija je bilo prav tako popravljeno. Drugi celoten zagon je potrdil popravek.
- `development-mobile` je v D04 preveril, da širina dokumenta ne preseže širine pogleda po uvedbi kontrol (390 CSS px) in da ni zapisov; oba razvojna profila ter lastna testna serija so prestali.
- Omejitev pregleda: `git diff --check` se ni zagnal, ker `/usr/bin/git` v tem okolju javi `xcrun: error: invalid active developer path (/Library/Developer/CommandLineTools), missing xcrun`. Ročno preverjanje vsebine in `npm run check` sta uspela. `npm` je izpisal opozorilo o okoljski nastavitvi `http-proxy`; zagon se je kljub temu zaključil uspešno.

## Sledljivost zahtev in dejanski izidi

| Zahteva | Pogoj in mesto izvedbe | Preverjanje in izid |
| --- | --- | --- |
| R01 | `src/App.tsx::ProjectView`: privzeti `all/all`; `filteredTasks` ohrani API-vrstni red. | Lastni `R01-R05` preveri vseh 8 ID-jev in začetni status `1 od 1`; uspešno. |
| R02 | `src/App.tsx`: velikost 2/5/10 odreže zaporedni podseznam; zadnja stran lahko je kratka. | Lastni `R01-R05` preveri 2, naslednjo/zadnjo in ponastavitev pri 5; lastni `R02/R10` preveri obseg 3–3 pri treh zapisih in en zapis; uspešno. |
| R03 | Štirje gumbi v `src/App.tsx` so onemogočeni zunaj veljavnega obsega strani. | Lastni `R01-R05` preveri onemogočena Prva/Prejšnja na prvi ter Naslednja na zadnji; D02 preveri Naslednja na zadnji; prazni scenarij preveri vse štiri. Uspešno. |
| R04 | Sprememba velikosti nastavi zahtevano stran na 1; `all` ima eno stran. | D04 in lastni `R01-R05`, `R02/R10` spremenijo velikost po straničenju; uspešno. |
| R05 | Filter statusa se izračuna pred straničenjem in ponastavi stran. | D03 ter lastni `R01-R05` preverita todo ID-je v izvornem vrstnem redu; lastni R07/R08 zamenja pogled na drugi filtrirani strani; uspešno. |
| R06 | `visibleTasks` se preda `TaskBoard` ali tabeli. | D03 in lastni `R06 and R11` primerjata ID-je obeh pogledov; lastni scenarij preveri tudi vrstni red stolpca. Uspešno. |
| R07 | Stanje je v `ProjectView`, ki se ne remounta ob spremembi pogleda/podrobnosti; ključ je samo ID projekta. | Lastni `R07-R08` preveri velikost, filter, stran 2 in ID-je po tabla/preglednica ter odpiranju/zapiranju podrobnosti; uspešno. |
| R08 | Menjava projekta ustvari nov `ProjectView`; osvežitev ustvari nov React koren; brez URL-ja/shrambe. | Lastni `R07-R08` preveri ponastavitev projekta in reload ter odsotnost ključev v hash poti; uspešno. |
| R09 | Status v `src/App.tsx` sestavi zahtevano besedilo in 1-indeksirani interval. | D02 preveri točno zadnji interval 6–8 od 8; lastni testi preverijo `all`, 7–8 od 8, 3–4 od 4 in kratek zadnji interval; uspešno. |
| R10 | Pri `n=0` status uporabi 0/0 in vse navigacijske kontrole onemogoči. | Lastni `R10` preveri prazen projekt, prazen filter in vrnitev na prvo stran po odstranitvi filtra; lastni `R02/R10` preveri eno opravilo. Uspešno. |
| R11 | `counts` in skupni števec še vedno berejo `tasks`; števec table šteje prejete kartice/vrstice. | Izhodiščni testi ohranijo povzetke; lastni `R06 and R11` preveri celotne števce `[4,2,2]`, projektni skupni števec 8 ter stolpčni števec prikazanih dveh; uspešno. |
| R12 | API ostaja nespremenjen in samo bran; ID-ji, podrobnosti ter notranje drsenje obstoječih gradnikov ostanejo. | D04 in lastni `R10` preverita brez zapisov ter širino dokumenta; izhodiščnih 38 testov preveri API, ID-je in podrobnosti; celoten check uspešen. |

Napaka specifikacije ni bila opažena; zahteve R01–R12 so skladne z obstoječim API-jem in navigacijo. Omejitev: `git diff --check` ostaja neizveden zaradi manjkajočega `xcrun`, kot je navedeno zgoraj.
