# P03 — izvedbeni načrt

## Tehnični kontekst

Aplikacija uporablja React 19, TypeScript in Vite; odvisnosti in infrastruktura so že nameščene. `ProjectView` v `src/App.tsx` prek `useResource` bere opravila trenutnega projekta iz `/api/projects/:id/tasks`, `TaskBoard` pa dobi opravila kot seznam. Navigacija med preglednico in tablo je že v URL-ju; `ProjectView` je že ključan z ID-jem projekta. Testni okvir je Playwright. Zahteve in merila sprejema so v [specifikaciji](spec.md); R01–R12 ostajajo merilo izvedbe.

## Odločitve

- **Stanje filtrov:** `ProjectView` hrani samo poizvedbo, stanje in osebo v lokalnem React stanju. Začetne vrednosti in ponastavitev projekta so zato lokalne trenutnemu projektu; preklop pogleda obdrži komponente, osvežitev jih ponastavi. Filtri ne bodo v URL-ju ali trajni shrambi.
- **Skupna izpeljava rezultatov:** iz izvornega urejenega seznama `tasks` se enkrat izpelje filtrirani seznam. Dodati majhen čist modul `src/taskFilters.ts` za normalizacijo, besedilno ujemanje in pridobivanje unikatnih oseb; ne dodajati odvisnosti. Primerjava oseb ostane natančna. Izpeljava ne spreminja opravil in ne kliče zapisovalnih API-jev.
- **En vir za poglede in števce:** isti filtrirani seznam uporabita preglednica in `TaskBoard`; obstoječa navigacija in povezave do podrobnosti ostanejo. Povzetek stanj in števci table izhajajo iz filtriranega seznama. Možnosti oseb izhajajo iz vseh opravil projekta. Ločeno obravnavati neprazen projekt brez zadetkov in prazen projekt.
- **Videz in dostopnost:** uporabiti obstoječe Folio gradnike, barvne spremenljivke, slovenska poimenovanja in točke odzivnega preloma. Kontrole naj se vključijo ob opravilih brez preurejanja navigacije; pri 390 pikah ohraniti širino strani, drsenje pa omejiti na tabelo ali tablo. Ohraniti dogovorjene oznake, vloge, `data-task-id` in obstoječa dostopna imena.
- **Preverjanje:** dodati lastne Playwright scenarije samo v `tests/agent/`. Obstoječe teste P03, izhodiščne teste in konfiguracijo uporabljati nespremenjene. Testne GET odgovore uporablja testni okvir; uporabniški vmesnik še naprej dostopa samo do `/api/`.

## Datoteke in razpored dela

| Datoteka | Načrtovana odgovornost |
| --- | --- |
| `src/taskFilters.ts` | Čiste funkcije za NFD-normalizacijo, ujemanje vseh iskalnih besed z združenimi polji, sestavljeno predikacijo ter unikatne neprazne osebe. |
| `src/App.tsx` | Kontrole s točnimi oznakami, lokalno stanje filtrov, izpeljan seznam, ponastavitve, rezultatni status in števci; rezultatni seznam podati obema pogledoma. Branje in bralne podrobnosti ostanejo na obstoječi poti. |
| `src/TaskBoard.tsx` | Stolpce in njihove števce izrisati iz prejetega filtriranega seznama; ohraniti oznake, vrstni red znotraj stanj in `data-task-id`. |
| `src/styles.css` | Minimalni slogi kontrol in praznega zadetkovnega stanja po Folio spremenljivkah; ohraniti notranje drsenje ter preprečiti širjenje strani pri 390 pikah. |
| `tests/agent/P03.spec.ts` | Lastni sprejemni scenariji R01–R12, vključno z Unicode iskanjem, kombinacijami, menjavo projekta/pogleda, praznimi stanji, števci, neobstojem zapisov in ozkim zaslonom. |
| `docs/agent/P03/spec.md` | Merilo sprejema in sledljivost; po izvedbi dopolniti z dejanskimi datotekami ter rezultati preverjanj, brez navajanja neizvedenih testov kot uspešnih. |

## Zaporedje izvedbe

1. Implementirati in po potrebi izolirano preveriti čisto logiko filtra.
2. Dodati lokalne kontrole ter uporabiti isti seznam rezultatov v preglednici, tabli, povzetkih, števcih in praznih stanjih.
3. Dopolniti sloge in dostopna stanja, ne da bi posegli v potrjeni Folio.
4. Dodati sprejemne scenarije v `tests/agent/`; pognati lastne scenarije, razvojne teste P03 ter skupno preverjanje.
5. Povezati vsak R01–R12 z implementacijo in dejanskim izidom; zabeležiti nepreverjene primere ali omejitve.

## Omejitve in tveganja

Ne spreminjati `server/`, `shared/`, začetnih podatkov, `tests/development/`, skupnih testov, nastavitev ali odvisnosti. Ne uporabljati `/__test/` iz aplikacije in ne shranjevati filtrov lokalno ali v URL. Pri iskanju dosledno uporabiti samo zahtevano normalizacijo in območje kombinacijskih znakov; podrobnosti so določene v specifikaciji. Plan ne dodaja funkcionalnih zahtev.
