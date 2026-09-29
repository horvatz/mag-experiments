# Naloge P05

2026-09-23 · [specifikacija](spec.md) · [načrt](plan.md). Izvajaj zaporedno kot isti agent; vsaka naloga je odvisna od prejšnje. Vseh deset nalog je izvedenih; rezultati in omejitve so v [poročilu](../verification.md). Oznako spremeni v `[x]` šele po opravljenem delu; rezultate preverjanj beleži sproti. Izvirni R01–R12 ostajajo merilo.

## 1. Priprava

- [x] T001 Preveri aktualni čas z `node task/time-budget.mjs`, preberi `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` in obstoječo konfiguracijo testov; v `docs/agent/verification.md` odpri kratek zapis izvedbe z dovoljenimi potmi, načrtovanimi ukazi ter oznako, da testi še niso izvedeni. Brez namestitev ali sprememb infrastrukture.

## 2. Osnova

- [x] T002 V `src/App.tsx` dodaj lokalno stanje velikosti, filtra in strani v `ProjectView` ter izpeljavo `filteredTasks`, `visibleTasks`, števila strani in indeksov po predikatih v `docs/agent/P05/spec.md`. Uporabi obstoječi ključ projekta za reset, ne spreminjaj izvornih podatkov in ne zapisuj novih nastavitev v URL ali shrambo (R01, R02, R04, R05, R08, R09, R10, R12).

## 3. Uporabniška zgodba: filtriranje in premikanje strani

- [x] T003 V `src/App.tsx` dodaj označena HTML selektorja `Velikost strani` in `Filter strani`, štiri zahtevane gumbe z robnimi omejitvami ter natančen imenovani status. Spremembi selektorjev vrneta stran na 1; praznina pokaže ničelni status in onemogoči vse premike. Preglednica prikazuje `visibleTasks`, kontrole ostanejo uporabne pri praznini (R01–R05, R09, R10).
- [x] T004 V `tests/agent/P05.spec.ts` dodaj preverjanja S01–S03: privzeto stanje, 1 in več kot 10 opravil, preurejene ID-je in podvojene naslove, velikosti 2/5/10/all, obhod brez izgub/podvojitev, vse premike, robove, natančen status ter vse filtre. Preveri reset z višje strani tudi, ko bi bila prejšnja stran po spremembi še veljavna (R01–R05, R09). Testni vhodi in prestrezanje GET ostanejo samo v testih.

## 4. Uporabniška zgodba: usklajeni pogledi in življenjska doba

- [x] T005 V `src/App.tsx` podaj `visibleTasks` tudi obstoječemu `TaskBoard` iz `src/TaskBoard.tsx`; skupne števce in število vseh opravil ohrani vezane na celotni `tasks`. Ohrani ključ projekta, povezave po ID-ju, `data-task-id`, dostopna imena in obstoječe podrobnosti. Loči prazen projekt od praznega filtra v preglednici; tabla ob praznini ohrani tri stolpce (R06–R08, R10–R12).
- [x] T006 V `tests/agent/P05.spec.ts` dodaj S04–S06: ista množica ID-jev v obeh pogledih, vrstni red znotraj stolpcev, pravilni globalni in stolpčni števci, ohranitev nastavitev ob preklopu in podrobnostih ter zapiranje z gumbom/Escape. Preveri reset ob menjavi in vrnitvi projekta ter reloadu, odsotnost nastavitev v URL in shrambi, prazna projekta in prazen filter v obeh pogledih ter odstranitev filtra (R06–R11).

## 5. Dodelava, preverjanje in predaja

- [x] T007 V `src/styles.css` oblikuj nove kontrole po obstoječem Folio: barvne spremenljivke, nevtralne površine, vidni fokus in prelamljanje. Ohranita se notranje drsenje preglednice/table in uporabnost pri širini 390 pik brez razširitve dokumenta (R12 in dogovor o vmesniku).
- [x] T008 V `tests/agent/P05.spec.ts` dodaj S07–S08 oziroma dopolni predhodne scenarije: nič zapisovalnih API zahtev in nespremenjeni podatki po novih dejanjih, pravilne podrobnosti ob drugačnih ID-jih in Unicode/ločilih, kontrole zunaj povezav, tipkovnična uporaba ter širina dokumenta pri 390 pik v obeh pogledih. Smiselni vizualni pregled Folio in njegovo dokazilo zabeleži v `docs/agent/verification.md` (R12).
- [x] T009 Izvedi `npm test -- --project=agent` in nato `npm run check` z obstoječo konfiguracijo; shrani dejanska dnevnika v `docs/agent/P05/agent-tests.log` in `docs/agent/P05/check.log` ter ukaze, izhodne kode in rezultate v `docs/agent/verification.md`. Celotno preverjanje vključuje lint, tipe, gradnjo, skupne teste API/namizje/mobilno, razvojne D01–D04 na obeh napravah in lastne teste. Morebitne napake odpravi samo znotraj dovoljenih poti in smiselno ponovi neuspešna preverjanja (R01–R12).
- [x] T010 V `docs/agent/P05/spec.md` posodobi vseh 12 vrstic sledljivosti na dejanske teste, datoteke/dele kode in izide s povezavami na `docs/agent/verification.md` ter dnevnike; dopolni zgodovino sprememb in omejitve. V `docs/agent/P05/tasks.md` označi dejansko opravljene naloge. Predaj spremembe, izvedena preverjanja in neizpolnjene zahteve; ne označi skritih ali neizvedenih testov kot uspešnih. Zadnjo minuto skupnega časa nameni tej predaji.

## Pokritost zahtev

R01–R05: T002–T004; R06–R08: T002, T005–T006; R09–R10: T002–T004, T005–T006; R11: T005–T006; R12 in dogovor o vmesniku: T002, T005, T007–T008. T009 preveri celoto, T010 zaključi dokazila po skupni predlogi. Pogoji in podrobni scenariji ostanejo v specifikaciji, brez podvajanja.
