# Načrt izvedbe P06: Nastavljiv izvoz CSV

Specifikacija: `docs/agent/P06/spec.md`. Ustava: `.specify/memory/constitution.md`.
Zahteve: R01–R12 iz `task/instructions.md`. Datum: 2026-10-09.

## Tehnični kontekst

- React 19.3 + TypeScript 6 + Vite 8; obstoječe odvisnosti zadoščajo, novih ni.
- Podatki samo prek javnega API-ja `/api/` (beri po `id`); brez novih zapisovalnih klicev.
- Testi: Playwright 1.63; projekt `agent` pokriva `tests/agent/**/*.spec.ts`; skupni testi ostanejo nedotaknjeni.
- Spremembe samo v `src/`, `tests/agent/`, `docs/agent/`; `server/`, `shared/`, `tests/*.spec.ts`, `tests/development/`, odvisnosti in nastavitve ostanejo enaki.
- Potrjeni videz Folio (`docs/dizajn.md`) in obstoječe dostopno označevanje se ohranita.

## Zasnova in odločitve

1. **Čista logika v `src/csv.ts`.** Vrstni red kolon je konstanta
   K = [id, projectId, title, status, assignee, dueDate, description]; funkcije:
   `quoteField(v)` (vedno dvojni narekovaji, notranji podvojeni), `neutralize(v)`
   (apostrof pred izvirni niz, če po začetnih presledkih/tabulatorjih/CR/LF sledi
   `=`, `+`, `-` ali `@`), `buildCsv(rows, settings)` (BOM U+FEFF + glava + vrstice,
   ločene s CRLF, tudi zadnja), `filterRows(rows, filter)`. Brez Reacta, zato
   preizkušljivo neposredno v testih.
2. **Kontrole v `src/ExportControls.tsx`.** Checkbox `Stolpec <ime>`, select
   `Ločilo CSV` (`;`/`,`), select `Filter izvoza` (`all`/`todo`/`in_progress`/`done`),
   gumb `Izvozi CSV` z `disabled`, ko S = ∅ ali je filtrirani seznam prazen.
   Komponenta je predstavitvena; stanje vodi `ProjectView`.
3. **Stanje v `src/App.tsx` (`ProjectView`).** Izbrane kolone, ločilo in filter so
   lokalno stanje projekta. `App` uporablja `key={project.id}`, zato menjava projekta
   ponastavi na privzete vrednosti (vse kolone, `;`, `all`); osvežitev strani ponastavi
   enako. Preklop Preglednica/Tabla ne remontira `ProjectView`, zato se nastavitve
   ohranijo in izvoz v obeh pogledih da iste bajte (R10).
4. **Prenos brez strežnika.** `Blob([bom + csv], { type: "text/csv;charset=utf-8" })`,
   `URL.createObjectURL`, začasen `<a download="folio-<projectId>.csv">`, klik in
   `URL.revokeObjectURL`. Brez `fetch` in brez novih strani.
5. **Slogi v `src/styles.css`.** Vrstica za izvoz se obnaša po Folio smernicah
   (nežni modri poudarki, sistemska pisava), pri ozki širini (390 pik) se prelomi;
   notranje drsenje obstoječe preglednice/table ostane.

## Datoteke

- `src/csv.ts` (nov): konstante, `quoteField`, `neutralize`, `filterRows`, `buildCsv`.
- `src/ExportControls.tsx` (nov): kontrole in dostopna imena iz specifikacije.
- `src/App.tsx`: stanje izvoza, izračun dovoljenja in sprožitev prenosa.
- `src/styles.css`: slogi izvozne vrstice.
- `tests/agent/helpers.ts` (nov): `mount` z nadzorovanimi GET odgovori in števcem
  zapisov, zajem prenosa (`download`), bralniki bajtov.
- `tests/agent/P06.spec.ts` (nov): preverjanja R01–R12.
- `docs/agent/P06/plan.md` (ta datoteka); dokazila se vpišejo v `spec.md`.

## Zaporedje izvedbe

1. `src/csv.ts` s čisto logiko; takojšnje preverjanje ročnih primerov.
2. `src/ExportControls.tsx` in vključitev v `ProjectView`; privzete vrednosti.
3. Prenos datoteke in povezava stanja (dovoljenje, ponastavitve, ohranitev pri preklopu).
4. Slogi in preverjanje 390 pik.
5. Lastni testi `tests/agent/` za R01–R12; nato `npm run typecheck`, `npm run lint`,
   `npx playwright test --project=agent`, skupni testi; dokazila v `spec.md`.

## Preverjanje zahtev

- R01–R04: zajem prenosa in primerjava vrstic/filtrov; prazni projekti in filtri prek
  nadzorovanih GET odgovorov; stanje gumba.
- R05: začetni bajti (BOM), ime datoteke, odsotnost novih strani in zapisov.
- R06–R09: neposredni klici čistih funkcij za narekovanje, ločili, CRLF, nevtralizacijo
  formul in ohranitev Unicode; dodatno skozi prenos.
- R10–R11: preklop pogleda in ponovni izvoz; menjava projekta ter ponovno nalaganje strani.
- R12: števec zapisov in primerjava stanja pred/po izvozu; skupni regresijski testi.

## Tveganja in robni primeri

- BOM mora biti prvi znak datoteke; preverjanje po bajtih, ne po prikazu.
- Nevtralizacija se nanaša na izvirni niz (apostrof pred morebitnimi vodilnimi presledki)
  in ne na glavo; drugi nizi ostanejo nespremenjeni.
- Vrednosti z vejico, podpičjem, narekovajem ali prelomom ostanejo znotraj narekovane
  vrednosti; zadnja vrstica se konča s CRLF.
- Gumb mora biti onemogočen tudi med nalaganjem in ob praznem rezultatu; klik ne sme
  ustvariti prenosa.
- UI ne sme uvažati ali klicati `/__test/`; to uporabljajo le testi.
