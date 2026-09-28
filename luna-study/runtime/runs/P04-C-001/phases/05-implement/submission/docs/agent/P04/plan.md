# Izvedbeni načrt P04: Stabilno razvrščanje z dvema ključema

Specifikacija in pogoji R01–R12: [spec.md](./spec.md). Ta načrt določa minimalno izvedbo v obstoječi aplikaciji Folio.

## Tehnični kontekst

- React 19, TypeScript 6, Vite 8 in Playwright so že nameščeni; novih odvisnosti, nastavitev ali API-jev ne potrebujemo.
- `src/App.tsx` naloži opravila prek `useResource` in sestavi `ProjectView`; komponenta je ključena z `project.id`. Pogled je določen z obstoječo navigacijo v `src/navigation.ts`, podrobnosti pa so modalni otrok `src/TaskDetails.tsx`.
- `src/TaskBoard.tsx` že ohranja vhodni vrstni red pri filtriranju treh fiksnih stolpcev. Preglednica in tabla že imata notranje pomikanje; oblikovanje uporablja skupne spremenljivke v `src/styles.css`.
- `Task` in `TaskStatus` sta v skupnih tipih. Ti ostanejo nespremenjeni; aplikacija še naprej uporablja samo bralne poti `/api/`.

## Odločitve

1. Dodati majhen, čist pripomoček `src/taskSorting.ts`, ki sprejme `readonly Task[]` in štiri nastavitve ter vrne novo urejeno polje. V njem so tipi nastavitev, normalizacija besedila, primerjava statusa/datuma in stabilno razreševanje izenačenj z izvornim indeksom. Za besedilo uporabiti zahtevano relacijsko primerjavo, ne lokalno ali številčno razvrščenega primerjalnika.
2. Štiri lokalne nastavitve in HTML `select` kontrole ter gumb **Izvorni vrstni red** namestiti v `ProjectView` v `src/App.tsx`. Privzeto stanje je iz specifikacije. Ker se komponenta ob menjavi `project.id` zamenja, se nastavitve ponastavijo; sprememba pogleda in odpiranje/zapiranje podrobnosti ohranita isto stanje. V URL ali trajno shrambo se ne zapisuje.
3. Iz `tasks` izračunati `sortedTasks` in ga podati preglednici oziroma `TaskBoard`. Štetja in projektni podatki ostanejo vezani na izvirni seznam. Ohranjajo se ključi povezav po ID-ju, `data-task-id`, imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`.
4. Dodati le sloge kontrol v `src/styles.css`, skladne z obstoječimi nevtralnimi površinami in modrimi poudarki. Kontrole naj se pri ozkem zaslonu prelomijo; širinsko omejena preglednica in tabla se še naprej pomikata znotraj svojih vsebnikov.

## Koraki izvedbe

1. V agentni Playwright specifikaciji dodati pokritost pripomočka: privzeti/izvorni red, NFD in UTF-16 primerjavo, status in datume, neodvisni smeri, enaka ključa ter stabilne vezi.
2. Povezati stanje in kontrole v `ProjectView`; pred izračunom projekcije ohraniti API-polje nespremenjeno. Uporabiti projekcijo v tabeli in tabli, ne spreminjati vrstnega reda stolpcev ali skupnih števil.
3. Dodelati odzivno postavitev in ohraniti obstoječe navigacijske, podrobnostne, bralne in dostopnostne tokove.
4. V `tests/agent/P04.spec.ts` dodati ciljane brskalniške scenarije za manjkajoče primere iz D01–D04: obe smeri in stabilne vezi, enak ključ, preklop pogleda/podrobnosti, menjava projekta in osvežitev, prazen/enoelementni projekt, ID/podrobnosti ter 390 px. Razvojnih, izhodiščnih in skupnih testov ne spreminjati.

## Sledljivost in preverjanje

| Skupina zahtev | Izvedbena mesta | Preverjanje |
| --- | --- | --- |
| R01–R06 | `src/taskSorting.ts`, kontrole in stanje v `src/App.tsx` | Ciljani testi comparatorja in robnih izenačenj; brskalniški pregled kontrol in vrstnega reda. |
| R07, R11 | Projekcija v `src/App.tsx`, obstoječe filtriranje v `src/TaskBoard.tsx` | Primerjava vrstnega reda preglednice/table, štetij in odsotnosti zapisnih API klicev. |
| R08–R10 | Stanje v `src/App.tsx`, obstoječi `src/navigation.ts` in `src/TaskDetails.tsx` | Preklop pogleda, podrobnosti, projekta, osvežitev in ponastavitev. |
| R12 | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/styles.css` | Enoličnost ID-jev, cilji povezav, obstoječa dostopna imena in širina 390 px. |

Po implementaciji izvesti `npm run check` (lint, tipiziranje/build in Playwright). Playwright konfiguracija že izvaja API in izhodiščne teste ter razvojne teste P04 na namizju in mobilni širini; dodani agentni testi so dodatni. Rezultate in dejanske datoteke/teste nato zabeležiti v sledljivosti `spec.md`. V tem koraku noben test ni bil zagnan.

## Meje

Spremembe kode ostanejo v `src/`, lastni testi v `tests/agent/`, dokumentacija v `docs/agent/`. Ne spreminjati strežnika, začetnih podatkov, skupnih tipov/testov, odvisnosti ali nastavitev. `/__test/` je samo pripomoček testnega programa in ga aplikacija ne uvaža ali kliče. Končni testi niso dostopni; razvojni primeri jih ne nadomeščajo.
