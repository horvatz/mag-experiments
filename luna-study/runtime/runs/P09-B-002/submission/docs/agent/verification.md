# Izvedba in preverjanje — implementacija

Začetni načrt (2026-09-29): slediti R01–R12 iz predane `specification.md` ter
izvornim zahtevam iz `task/instructions.md`. Najprej pregledam obstoječi tok
usmerjanja, poglede in javni API; nato implementiram samo v `src/` ter po
potrebi dodam teste v `tests/agent/`.

Načrtovana preverjanja, še neizvedena:

- pregled sprememb in tipov/slogov prek `npm run check` (vključuje osnovne,
  razvojne in lastne dostopne teste);
- če ostane čas, namenski razvojni testi P09 z `npx playwright test
  --project=development-desktop --project=development-mobile`;
- poročilo bo natančno ločilo izvedene in neizvedene preverbe ter zabeležilo
  omejitve okolja.

## Dnevnik

- Začetni zapis: preverjanja so načrtovana, nobeno še ni izvedeno.
- Pregled izvora: glavno usmerjanje je v `src/navigation.ts`, seznam in filtri
  v `src/App.tsx`, kartice v `src/TaskBoard.tsx`, podrobnosti v
  `src/TaskDetails.tsx`; začetni API je samo-bralni prek `useResource`.
- Prva polna kontrola je našla regresijo za prazen projekt in prazno tablo.
  Prazna preglednica zdaj ohrani obstoječe sporočilo in pokaže `Ni zadetkov.`,
  tabla ohrani vse tri stolpce. Ponovni `npm run check` je uspel.
- Okoljska omejitev: `git status` ni deloval, ker `xcrun` javlja manjkajočo
  namestitev Command Line Tools. Orodje `npm` opozarja na konfiguracijo
  `http-proxy`; javni internet v nalogi ni potreben.

## Sledljivost in rezultat

Polni ukaz `npm run check` je opravil lint, typecheck, produkcijsko gradnjo in
46 Playwright testov: 14 API, 24 osnovnih (namizje/mobilno) ter 8 razvojnih
P09 (štiri na vsaki velikosti). Rezultat: **46 passed**.

| Zahteva | Koda in pogoj | Dejanski preizkus / izid |
| --- | --- | --- |
| R01 | `navigation.ts` razčleni query in uporabi privzete vrednosti; `App.tsx` filtrira ob prvem prikazu. | D01 namizje/mobilno: neposredni URL, uspešno. |
| R02 | `App.tsx` `normalize()` trim-a, uporabi NFD, odstrani U+0300–036F in male črke; podniz išče v štirih poljih. | D01 preveri neposredno frazo, uspešno; Unicode in ločila niso posebej izolirano preizkušeni. |
| R03 | `App.tsx` združi stanje in frazo z IN; relacijska primerjava naslovov ohrani izvorni indeks pri izenačenju. | D02 preveri status; lastni primeri za oba vrstna reda in izenačenje niso bili dodani. |
| R04 | `navigation.ts` uporabi prvo vrednost `URLSearchParams.get`, neveljavne vrednosti zamenja s privzetimi in ob branju ne piše URL-ja. | D01 neposredni URL uspe; podvojeni/neznani parametri niso bili posebej preizkušeni. |
| R05 | Kontrole v `App.tsx` hranijo osnutek; submit potrdi celoto prek ene spremembe fragmenta samo ob spremembi. | D02 potrdi, da osnutek ne filtrira pred klikom in da potrditev filtrira; uspešno. |
| R06 | `navigation.ts` sestavi parametre z `URLSearchParams`, izpusti privzete in ohrani samo `view=board`; `applyView()` zamenja URL brez nove zgodovine, če se stanje ne spremeni. | D02 preveri shranjen status, D04 reset; ponovljena potrditev in neznani parametri niso bili posebej preizkušeni. |
| R07 | Hash je vir potrjenega stanja; ob navigaciji `useEffect` obnovi osnutek, reload razčleni isti URL. | D03 preveri board/reload in kontrolnik; uspešno. Back/Forward ni namensko preverjen. |
| R08 | Preklop pogleda generira URL iz potrjenih filtrov; sprememba route ponastavi osnutek. | D03 preveri board in reload; osnovni preizkusi krijejo preklop pogledov; uspešno. |
| R09 | `taskUrl()` in zapiranje podrobnosti ohranita filtre/pogled; API podrobnosti izbere po ID. | Osnovni podvojeni naslovi, ID, Escape in navigacija table/board; uspešno. |
| R10 | Povezave projektov izpustijo filtre in ohranijo način; parser upošteva filtre v neposredni povezavi. | Osnovni preizkusi preklapljajo projekte; D01 neposreden URL; uspešno. |
| R11 | Reset uporabi skupno potrditev; števec pokaže N/M; brez zadetkov izpiše zahtevano besedilo. | D04 reset/no-write in osnovna prazna projekta/tabla; uspešno. |
| R12 | Spremembe ostanejo v UI/fragmentu; `useResource` še vedno kliče samo GET `/api/`; prilagodljiv CSS ohrani notranje drsenje. | D04 no-write in 390 px širina, neznana pot/nalaganje/podrobnosti v osnovnih testih; uspešno. |

Predaja: implementacija in zahtevani preverljivi zapisi so zaključeni.

## Odprta vprašanja in omejitve

Končni pilotni testi niso dostopni. Za nekatere podrobnosti R02–R07 (Unicode
robni primeri, ponovljeni/neznani parametri, Back/Forward in podvojena
potrditev) ni ločenega testa; implementacija je preverjena s tipizacijo,
lintom in navedenimi regresijskimi/razvojnimi testi. Predana specifikacija ni
vsebovala izvedbene napake, ki bi zahtevala odstopanje; prazen izvorni seznam
je ohranil regresijsko prazno stanje Folio in hkrati prikazal zahtevano
`Ni zadetkov.`.

## Nadaljevanje avtorja po pregledu

- Začetni zapis za to fazo (2026-09-29): prebrani `review.json`, trenutna
  specifikacija ter navodila/predloga. Pregled vsebuje eno ugotovitev za R02;
  `specification-history.md` v `docs/agent/` manjka, zato zgodovina ni bila
  dosegljiva. Pregleda in specifikacije nisem spreminjal.
- Ugotovitev R02 je utemeljena: `hash.split('?')` je zadržal samo prvi del
  query niza, zato se je vrednost `q=foo?bar` odrezala. `src/navigation.ts`
  zdaj loči pot samo pri prvem vprašaju.
- Dodan je `tests/agent/P09-review.spec.ts`, ki neposredno odpre URL z
  `q=foo?bar` in preveri celo frazo, rezultat ter nespremenjeni URL.
- Ponovni `npm run check`: lint, typecheck, gradnja in **47 passed** (14 API,
  24 osnovnih, 8 razvojnih P09 in 1 lasten regresijski test). Ugotovitev R02
  je odpravljena. Končni pilotni testi in drugače navedeni robni primeri iz
  prejšnjega zapisa ostajajo nepreverjeni.
