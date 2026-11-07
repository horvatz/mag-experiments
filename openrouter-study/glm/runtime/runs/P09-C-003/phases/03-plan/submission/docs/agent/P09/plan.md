# P09 izvedbeni načrt

**Tehniški kontekst:** React 19, TypeScript, Vite in Playwright. Aplikacija že uporablja hash navigacijo prek `src/navigation.ts`, javni API pa ostaja nespremenjen in samo za branje prek `/api/`.

## Odločitve

- Parametre `q`, `status` in `order` obravnavamo kot del obstoječe hash poti, ne kot novo stanje v `localStorage` ali globalnem vmesniku.
- Razširimo obstoječi `useRoute`, `projectUrl` in `taskUrl`; ne uvajamo novo odvisnosti, filozofije ali API-ja.
- Potrjeno stanje pride iz URL. Osnutek treh kontrol hranimo lokalno v `ProjectView`; ob vsaki navigaciji, Nazaj/Naprej, osvežitvi, menjavi pogleda ali projekta osnutek nadomestimo s stanjem URL.
- Filtriranje in urejanje izračunamo iz podatkov trenutnega projekta. Povzetek stanj ostane nad celotnim naborom, prikaz opravil pa dobi filtriran in urejen seznam.
- Naslove primerjamo po normalizaciji in UTF-16, pri izenačenju pa ohranimo zaporedje iz API.
- Gumba `Uporabi pogled` in `Ponastavi pogled` generirata kanonični URL ter spremenita `window.location.hash`; ponovna enaka potrditev tako ne ustvari novega zgodovinskega stanja.
- Novi kontroli vključimo v obstoječe območje `Opravila` z uporabo trenutnih barv, višin, zaobljenosti in odmikov Folio; na širini 390 pik stran ne sme pasti širja.

## Spremembe po datotekah

| Datoteka | Načrt |
| --- | --- |
| `src/navigation.ts` | Dodaj tipe in privzete vrednosti za `q`, `status` in `order`; razčleni query s prvo pojavitvijo in neznanimi vrednostmi; generiraj kanonične URL-je brez privzetih parametrov in z ohranjenim `view=board`. |
| `src/App.tsx` | Dodaj dostopna kontrola z natančnimi slovenskimi oznakami, ločen osnutek, potrditev in ponastavitev, izračun filtriranega in urejenega seznama, števec `Prikazano: N od M.`, prazno stanje `Ni zadetkov.` ter prenos parametrov v povezave projekta, opravil in podrobnosti. |
| `src/TaskBoard.tsx` | Prikaži filtrirane in urejene ID-je, ohrani `data-task-id`, povezave do opravil in obstoječa dostopna imena stolpcev. |
| `src/TaskDetails.tsx` | Ob zaprtju generiraj projektno povezavo s trenutnim `view` in potrjenimi parametri. |
| `src/styles.css` | Doda kompaktno postavitev kontrol v Folio slogu, brez spreminjanja odvisnosti ali infrastrukture. |
| `tests/agent/p09.spec.ts` | Doda Playwright teste za R01–R12, vključno z neposrednimi URL-ji, osnutkom, zgodovino, preklopom pogleda, podrobnostmi, ponastavitvijo, praznim rezultatom, omrežjem in `localStorage`. |

## Zaporedje izvedbe

1. V `src/navigation.ts` definiraj stanje filtrov, normalizacijo, kanonične povezave in razčlenjevanje URL-ja.
2. V `src/App.tsx` poveži razčlenjeno stanje z obstoječim `ProjectView`, dodaj kontrola, osnutek, izpeljan prikaz, števec in dejanji potrditve/ponastavitve.
3. Posodovi preklope pogleda, navigacijo projektov, povezave opravil in zaprtje podrobnosti, da ohranjajo veljavne parametre in zavračajo osnutek.
4. Doda minimalne stile v Folio vizualnem jeziku in preveri ozko postavitev.
5. Doda `tests/agent/p09.spec.ts` s ponovljivimi API odgovori prek javnega `GET /api/` vmesnika, brez uporabe `/__test/` iz aplikacije.
6. Po implementaciji posodobi sledljivost v `docs/agent/P09/spec.md` z dejanskimi testi, izidi in dokazi.

## Preverjanje

- Namenjsko: `npx playwright test tests/agent/p09.spec.ts --project=agent`.
- Struktura: `npm run typecheck`.
- Celota: `npm run lint`, obstoječi skupni testi in build po potrebi pred končno predajo.
- Rezultate zapišemo šele po dejanskem zagonu; v tej fazi načrta ni še uspešnih rezultatov.

## Omejitve in tveganja

- Ne spreminjamo strežnika, skupnih tipov, odvisnosti, nastavitev ali skupnih testov.
- Aplikacija ne sme uporabljati testnih kontrol `/__test/`, `localStorage` ali zapisovalnih API-jev.
- Posebno pozornost namenimo zgodovini: ena potrditev spremembe pomeni en nov vnos, enaka potrditev pa brez novega vnosa.

**Stanje:** načrt; implementacija in testiranje še sledita.
