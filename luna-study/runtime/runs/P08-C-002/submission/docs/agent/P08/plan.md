# P08: Koledarski pregled rokov — načrt

## Povzetek

Razširi obstoječi pogled projekta z lokalnim datumskim filtrom in petimi
števci rokov. Filtriran seznam je skupen preglednici in tabli; podrobnosti
ostanejo bralne. Zahteve in sprejemni pogoji so v [spec.md](spec.md).

## Tehnični kontekst

- Aplikacija uporablja React, TypeScript in Vite. Opravila se že nalagajo z
  `useResource` prek `GET /api/projects/:id/tasks`; vrstice in kartice
  uporabljajo enolični `task.id`.
- `src/App.tsx` vsebuje pogled projekta, števce, preglednico in preklop
  pogleda. `src/TaskBoard.tsx` izriše tablo v obstoječih statusnih stolpcih.
  `src/navigation.ts` hrani projekt, opravilo in izbrani način prikaza v
  obstoječi navigaciji.
- Uporabijo se nameščene odvisnosti in obstoječi slogovni gradniki. Ne
  spreminjajo se strežnik, `shared/`, skupni testi, nastavitve ali odvisnosti.

## Odločitve

1. Koledarsko razvrščanje je majhen čist pripomoček v `src/deadlines.ts`.
   Status `done` se preveri pred rokom; veljavni nizi `YYYY-MM-DD` se
   primerjajo kot koledarski datumi, sedemdnevni odmik pa se izračuna v UTC,
   brez lokalnega časovnega pasu in poletnega časa.
2. Stanje referenčnega datuma, besedila datumske kontrole in skupine ostane
   lokalno pogledu projekta v `src/App.tsx`. Ločita se zadnji veljavni datum
   in trenutno besedilo kontrole, da prazno polje lahko pokaže opozorilo brez
   spremembe zadnjega izračuna. Obstoječi `key={project.id}` ponastavi stanje
   ob menjavi projekta; osvežitev ga začne z začetnimi vrednostmi.
3. Števci se izračunajo iz vseh opravil projekta. Ena izvorno urejena
   filtrirana množica se poda preglednici in tabli; tabla ohrani obstoječe
   statusne stolpce, vrstni red opravil pa znotraj stolpcev sledi izvoru.
   Odsotnost rezultatov izbrane skupine se prikaže v skupnem praznem stanju.
4. Filter se ne dodaja v URL, `localStorage` ali drug trajni zapis. Obstoječi
   URL za pogled `table`/`board` ostane nespremenjen. Aplikacija samo bere
   obstoječe `/api/` poti in ne pošilja zapisov ali zahtev na `/__test/`.
5. Nove kontrole in prazno opozorilo uporabijo zahtevane slovenske oznake,
   dostopna imena in obstoječe Folio barve, gradnike ter odzivno postavitev iz
   [potrjenega dizajna](../../dizajn.md). Vrstice/kartice ohranijo
   `data-task-id`; podrobnosti in navigacija ostanejo nespremenjene.

## Predvidene datoteke

| Datoteka | Vloga |
| --- | --- |
| `src/deadlines.ts` | Novi čisti koledarski izračun skupine in števcev. |
| `src/App.tsx` | Projektno stanje filtra, kontrole, števci, skupna filtrirana množica in prazno stanje preglednice. |
| `src/TaskBoard.tsx` | Izris iste filtrirane množice v obstoječih stolpcih in prazno stanje table. |
| `src/styles.css` | Slog kontrol in števcev z obstoječimi spremenljivkami; brez razširitve strani pri 390 px. |
| `tests/agent/P08.spec.ts` | Lastni scenariji R01–R12 z nadzorovanimi GET odzivi in poljubnimi ID-ji. |
| `docs/agent/P08/spec.md` | Zahteve in sledljivost; po izvedbi dopolniti z dejanskimi datotekami in rezultati. |

`src/api.ts`, navigacija, skupni tipi in podatkovni vmesnik ostanejo brez
sprememb: obstoječa `GET` vmesnika zadoščata, pregled pa ne zapisuje opravil.

## Preverjanje po izvedbi

Lastni scenariji preverijo koledarske meje, status `done`, prazne podatke,
števce, izbire in napako praznega datuma, ponastavitve, enake ID-je v obeh
pogledih, nespremenjen API zapisov ter širino 390 px. Nato se izvedejo skupni
preverjevalni ukazi izhodišča. V tem načrtovalnem koraku implementacija in
testi niso bili izvedeni.
