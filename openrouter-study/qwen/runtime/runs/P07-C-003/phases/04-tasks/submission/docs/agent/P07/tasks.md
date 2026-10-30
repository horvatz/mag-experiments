# Naloge: Folio — Priljubljena opravila in trajna shramba

Priredba: P07.1.0. Naloge so odvisnosti-urejene; izvadijo se po vrstnem redu.

## Setup (S)

- [ ] S001 Ustvari mapo `src/hooks/` za custom hooks
- [ ] S002 Preveriti obstoječo navigacijo v `src/navigation.ts` za uporabo v komponentah priljubljenih

## Infrastruktura – hook (I)

- [ ] I001 Ustvari `src/hooks/useFavorites.ts` z `localStorage` za branje/zapis
  - Funkcija `getFavorites(): string[]` → branje ključa `folio:favorites:v1`, validacija JSON
  - Funkcija `setFavorites(ids: string[]): void` → zapis JSON s ključem
  - Funkcija `toggleFavorite(currentId: string): string[]` → vklop/izklop z UTF-16 sortirano množico
  - Funkcija `removeFavoritesForProject(projectId: string): string[]` → čiščenje ID-jev le tega projekta
  - `useEffect` za `storage` dogodk
- [ ] I002 Preverite tipologije v `shared/types.ts` za `Task.id` in `Project.id`

## Kompletne funkcije (F)

- [ ] F001 Ustvari `FavoriteButton` v `src/components.tsx` z `aria-pressed` in `onClick` toggle
- [ ] F002 Ustvari `FavoritesCount` v `src/components.tsx` z `role="status"` in `aria-label="Priljubljeno: X od M."`
- [ ] F003 Ustvari `RemoveProjectFavorites` v `src/components.tsx` z `disabled` brez priljubljenih in `onClick` za čiščenje
- [ ] F004 Ustvari `ShowFavoritesOnly` checkbox v `src/components.tsx` z privzeto vrednost `false` in filter štete opravilih

## Integracija (IN)

- [ ] IN001 Integrirajte `FavoritesCount` v `src/App.tsx` znotraj `project-overview`
- [ ] IN002 Integrirajte `FavoriteButton` v `src/TaskBoard.tsx` vsakem opravilu
- [ ] IN003 Integrirajte `ShowFavoritesOnly` in `RemoveProjectFavorites` v `src/TaskBoard.tsx`:
  - Checkbox filter priljubljenih
  - Gumb čiščenja priljubljenih
  - Sporočilo `Ni priljubljenih opravil.` ko filter prazno
- [ ] IN004 Preverite `src/App.tsx` da navigacija in `project-overview` ostane deluje
- [ ] IN005 Preverite `src/TaskBoard.tsx` da prekrivna pogleda (preglednica/tabla) uporabljata isto množico in filter

## Testiranje (T)

- [ ] T001 Ustvari `tests/agent/P07.spec.ts` z Playwright
  - T001-01 R01: Preveri `aria-pressed` gumb na vsakem opravilu v preglednici in tabli
  - T001-02 R02: Preveri `localStorage.getItem("folio:favorites:v1")` vrne JSON oblike `{version:1,ids:[...]}`
  - T001-03 R03: Osvežitev obnavlja shranjene ID-je; podvojeni ID-ji obravnave kot enega, neznani ID-ji ohranjeno za druge projekte
  - T001-04 R04: Neveljaven JSON, napačna verzija, manj `ids`, nizer `ids` → prazna množica, aplikacija ne odpove
- [ ] T002 `tests/agent/P07.spec.ts`:
  - T002-01 R05: Checkbox `Prikaži le priljubljena` privzeta vrednost `false`, filter izvorna vrstnoreda upošteva
  - T002-02 R06: Odstranitev priljubljenega med filtrom takoj odstrani iz prikaza; Ko ni rezultatov, prikaže "Ni priljubljenih opravil." in kontrole omogočajo izklop filtra
  - T002-03 R07: Preglednica in tabla uporabljata isto množico in filter; preklop pogleda ne izgubi sprememb; podrobnosti ostanejo dostopne po pravilnem ID-ju
  - T002-04 R08: Menjava projekta ohrani globalno množico priljubljenih, filter resetira na `false`; osvežitev obnovi množico, filter je `false`
- [ ] T003 `tests/agent/P07.spec.ts`:
  - T003-01 R09: Gumb `Odstrani priljubljene tega projekta` odstrani samo ID-je opravil celotnega trenutnega projekta; ID-ji drugih projektov in neznani ID-ji ostanejo; brez priljubljenih tega projekta je gumb `disabled`
  - T003-02 R10: Element števca `Priljubljeno: X od M.` prikazuje pravilno število priljubljenih za celoten projekt, tudi ko je filter aktiven; števec stolpcev table šteje vidna opravila
  - T003-03 R11: `storage` dogodk za pravi ključ `folio:favorites:v1` takoj uskladi množico z novo vrednostjo po istih pravilih validacije; `null` izprazni; drug ključ se ignorira; dogodek ne sproži povratnega zapisa; če branje ali zapis shrambe vrže izjemo, aplikacija ostane uporabna v pomnilniku in prikaže opozorilo o nedostopni shrambi
- [ ] T004 `tests/agent/P07.spec.ts`:
  - T004-01 R12: Vse spremembe priljubljenih so lokalne: ni zapisov na API, nobeno polje opravila se ne spremeni; ohranjen Folio, nalaganje, navigacija in ozki prikaz

## Poliranje (P)

- [ ] P001 Preveri `src/styles.css` da ohranjajo Folio dizajn (barve `#2f6dcc`, `#1d1d1f`, sistemsko pisavo)
- [ ] P002 Preveri `src/components.tsx` da novo kode ustrezajo stilom in dostopnosti (ARIA, fokus)
- [ ] P003 Preveri `src/hooks/useFavorites.ts` da `storage` dogodk deluje pravilno brez povratnega zapisa
- [ ] P004 Preveri `docs/agent/P07/spec.md`, `docs/agent/P07/plan.md` da vse zahteve R01–R12 povzet, povezane in preverjene

---

*Ta seznam temelji na specifikaciji P07 in načrtu. Testi iz R01–R12 so razdeljeni v T001–T004 glede na funkcionalne skupine.*

