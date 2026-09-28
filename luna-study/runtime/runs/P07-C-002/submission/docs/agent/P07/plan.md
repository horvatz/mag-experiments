# Načrt izvedbe P07

## Tehnično izhodišče

- Aplikacija uporablja React 19, TypeScript 6, Vite 8 in Playwright; odvisnosti so nameščene. Datotek paketov, nastavitev, strežnika, skupnih tipov, izhodiščnih testov ali nastavitev zagona ne spreminjamo.
- Projekti in opravila se nalagajo prek obstoječega `/api/` in `useResource`; navigacija temelji na hash povezavah. Priljubljene so odjemalsko stanje ID-jev in ne sprožajo zapisov podatkov opravil na API.
- Ohranimo potrjeni videz Folio, obstoječe kontrole, slogovne spremenljivke, vidni fokus, slovenske oznake in prikaz na ozkih zaslonih. Spremembe ostanejo v `src/`, `tests/agent/` in `docs/agent/`.

## Odločitve za izvedbo

1. Dodamo `src/useFavorites.ts` kot enega lastnika globalne množice priljubljenih ID-jev. Ob zagonu varno prebere `folio:favorites:v1`, preveri `{version:1,ids:[...]}`, združi ponovitve, ohrani neznane ID-je in zapisuje enolične ID-je po vrstnem redu UTF-16. Neveljaven začetni zapis pomeni prazno množico in se ob nalaganju ne prepiše. Izjeme pri branju ali pisanju pustijo vmesnik uporaben ter sprožijo opozorilo z `role="alert"`. Dogodki `storage` za pravi ključ uskladijo stanje brez povratnega zapisa.
2. Hook živi v `App`, nad projektno označenim `ProjectView`, njegova množica in dejanja pa se posredujejo prikazom. Tako priljubljene preživijo menjavo projekta in pogleda. Filter ostane lokalni v `ProjectView`; obstoječi `key={project.id}` ga ponastavi ob menjavi projekta, med preklopom pogledov istega projekta pa se ohrani.
3. Iz celotnega seznama API-ja in množice priljubljenih izpeljemo en seznam vidnih opravil ter ga uporabimo v preglednici in na tabli v izvornem vrstnem redu. Števec priljubljenih računamo za vsa opravila projekta, števce stolpcev table pa iz vidnih opravil. Odstranitev priljubljenih projekta odšteje ID-je iz celotnega seznama projekta, ne zgolj iz trenutno prikazanih elementov.
4. Dejanja priljubljenih postavimo ob povezave, ne vanje: v ločeno celico preglednice in ob povezavo kartice v `TaskBoard.tsx`. Ohranimo povezave do podrobnosti, `data-task-id`, dostopna imena pogledov in stolpcev ter oznako pregleda stanj. Skupno prazno stanje za aktivni filter omogoča, da oba pogleda pokažeta `Ni priljubljenih opravil.` in pustita kontrolo za izklop filtra dosegljivo.
5. Checkbox, gumb za odstranitev priljubljenih projekta in statusni števec umestimo v obstoječi razdelek opravil. Opozorilo o shrambi prikažemo na ravni `App`, da ostane vidno tudi med nalaganjem ali napako API-ja. `src/styles.css` razširimo z obstoječimi barvami, razmiki in vedenjem pri fokusu; pri 390 px se stran ne razširi in potrjeni Folio ostane ohranjen.

## Datoteke

| Datoteka | Delo |
| --- | --- |
| `src/useFavorites.ts` (nova) | Validacija in zapis shrambe, globalno stanje v pomnilniku, preklop/odstranitev ID-jev, dogodki `storage` in opozorilo za nedostopno shrambo. |
| `src/App.tsx` | Lastništvo priljubljenih, projektni filter in kontrole, izpeljava vidnih opravil ter števcev, dejanja v preglednici in prazno stanje filtra. |
| `src/TaskBoard.tsx` | Prikaz istih vidnih opravil, gumbi zunaj povezav in števci stolpcev iz vidnih kartic. |
| `src/styles.css` | Slogi novih kontrol, opozorila in praznega stanja, prilagojeni Foliu in ozkemu prikazu. |
| `tests/agent/favorites.spec.ts` (nova) | Playwright scenariji za shrambo, oba pogleda, projekt/filter, dogodke in napake shrambe, spremembe samo ID-jev in odsotnost zapisov na API. Uporabi prestrezanje javnega API-ja in nastavitev shrambe v brskalniku; skupnih testov ali infrastrukture ne spreminjaj. |
| `docs/agent/P07/spec.md` | Po izvedbi dopolni sledljivost R01–R12 z dejanskimi testi, mesti kode in izidi. |

## Načrt preverjanja

V `tests/agent/` dodamo brskalniške scenarije za R01–R12: neveljavne in podvojene vrednosti shrambe, neznane ID-je, izjeme, dogodke med zavihki, prazne in večje poljubne podatke, enake naslove, oba pogleda, menjavo projekta ter širino 390 px. Nato zaženemo obstoječa preverjanja projekta in njihove dejanske rezultate zapišemo v specifikacijo. Aplikacija ne kliče `/__test/`; testni prestrezniki smejo podajati nadzorovane odgovore `/api/`. Neizvedenih scenarijev ne označimo kot uspešnih.
