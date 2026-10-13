# P04 — Izvedbeni načrt

**Status**: Načrt | **Različica**: 1.0

## Tehnični kontekst

- Aplikacija je React 19 + TypeScript + Vite; runtime odvisnosti so `react`, `react-dom` in `lucide-react`. Ne dodajamo odvisnosti.
- Podatki ostanejo v obstoječem javnem API-ju `/api/`; razvrščanje je čista projekcija prejetega polja `Task[]`.
- Ne spreminjamo strežnika, skupnih tipov, nastavitev, javnega API-ja ali skupnih testov.

## Odločitve

1. **Razvrščanje v samostojnem modulu.** V `src/sorting.ts` dodamo tipe kontrol, privzeto stanje, normalizacijo, primerjalna pravila in `sortTasks(tasks, state)`. Funkcija ne mutira vhodnega polja; pred razvrščanjem si izvorni indeks shranimo v interno začasno strukturo.
2. **Primerjalna semantika.** `title` in `assignee` normaliziramo z NFD, odstranimo U+0300–U+036F, pretvorimo v male črke in primerjamo po UTF-16 z `<`/`>`. `status` ima red `todo`, `in_progress`, `done`; `dueDate` primerjamo po letu, mesecu in dnevu veljavnega `YYYY-MM-DD`. `none` vrne `0`.
3. **Stabilnost in dvoključna logika.** Smeri samo pomnožita izid primerjave izbranega ključa. Sekundarni ključ se uporabi le pri primarni enakosti. Ob končni enakosti odloča izvorni indeks v naraščajočem redu. `original` kot primarni ključ vedno povrne izvorno polje.
4. **Stanje v projektnem pogledu.** Stanje štirih kontrol hranimo v `ProjectView`, ki se z `key={project.id}` ponovno ustvari ob menjavi projekta. Preklop preglednica/tabla in odpiranje podrobnosti tako ne ponastavita stanja, menjava projekta in osvežitev pa ga ponastavita. Ne uporabljamo `localStorage`, URL-a ali trajne shrambe.
5. **Kontrole in Folio.** V `src/App.tsx` dodamo označena HTML select nadzornika in gumb `Izvorni vrstni red` v obstoječo glavo oddelka. V `src/styles.css` uporabimo obstoječe Folio spremenljivke in oblikovne vzorce; na 390 px ne sme priti do širjenja celotne strani.
6. **Tabla kot projekcija.** `src/TaskBoard.tsx` ohrani tri stalne stolpce in samo filtrira razvrščeno polje po stanju, tako relativni red znotraj stolpcev ostane enak preglednici.
7. **Sledljivost ID-jev.** Razvrščanje ne spreminja `id`, `projectId` ali drugih polj. Obstoj `data-task-id`, uporaba `id` kot React ključa in navigacija po ID-ju ostanejo nespremenjeni.

## Načrtovane spremembe

| Datoteka | Sprememba |
| --- | --- |
| `src/sorting.ts` | Nov modul za tipe stanja, privzeto stanje, normalizacijo, primerjalna pravila in stabilno `sortTasks`. |
| `src/App.tsx` | Dodaj stanje štirih kontrol, uporabi `sortTasks`, izriši kontrole v Folio glavi in posreduj razvrščeno polje tabeli ter tabli. |
| `src/TaskBoard.tsx` | Ohrani tri stalne stolpce in filtriraj razvrščeno polje brez ponovnega razvrščanja. |
| `src/styles.css` | Zaledje obstoječih Folio gradnikov z odzivnim postavitvijo novih kontrol. |
| `tests/agent/p04.spec.ts` | Playwright preverjanja za R01–R12, vključno z normalizacijo, dvoključnimi smere, stabilnostjo, projekcijskimi in življenjskimi dogodki stanja. |

## Izvedbeno zaporedje

1. Dodaj `src/sorting.ts` in ga preveri s tipovno izgradnjo.
2. Poveži stanje in kontrole v `src/App.tsx`; ne spreminjaj obstoječih dostopnih imen.
3. Potrdi projekcijo v `src/TaskBoard.tsx` in dopolni Folio slogove.
4. Dodaj `tests/agent/p04.spec.ts` po specifikacijskih sprejemnih pogojih.
5. Pozeni `npm run typecheck`, `npm run lint` in ciljne Playwright teste; nato po potrebi še skupne teste, ki so že v bazi.
6. Posodobi sledljivost in izide v `docs/agent/P04/spec.md` samo za dejansko izvedena preverjanja.

## Omejitve

- Ni novih API-jev, odvisnosti, strežniških sprememb ali sprememb skupne infrastrukture.
- Manjkajoči ali neveljavni `dueDate` niso zahtevani; testni podatki ostanejo v domeni veljavnih `YYYY-MM-DD`.
- Končni testi niso na voljo v tej fazi; rezultatov ne smatramo za uspešne, dokler niso dejansko izvedeni.
