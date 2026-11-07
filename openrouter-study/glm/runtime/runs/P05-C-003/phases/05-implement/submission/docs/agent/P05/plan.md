# Načrt implementacije P05

## Tehnični kontekst

Aplikacija je React 19 + TypeScript + Vite. Opravila pridobiva z obstojejim `useResource` prek `/api/projects/:id/tasks`, pogled pa sta preglednica in tabla. Projekti so lahko prazni, vsi obstoječi ID-ji, povezave, dostopna imena in Folio stile ostanejo nespremenjeni.

## Odločitve

- Stanje `filter`, `pageSize` in `page` hranimo z `useState` v obstoječi `ProjectView`. Podatkov ne kopiramo v lokalno shrambo ali URL.
- `ProjectView` je že ključena po `project.id`, zato menjava projekta ponastavi lokalno stanje; enako velja za osvežitev.
- Filtriran in nato straničen seznam izračunamo iz odgovora API-ja. Pregled stanj ostane izračunan nad celotnim nefiltriranim seznamom.
- `TaskBoard` dobi trenutno stran in razdeli le ta odsek v obstoječe tri stolpce. Tako ne straniči posameznega stolpca posebej.
- Nove kontrole umestimo v obstoječi glavni del z uporabo trenutnih Folio razdalj, radijev, pisav, oblačkov in odzivnih prelomov. Notranje drsenje ostane dovoljeno, stran na 390 pikah pa se ne razširi.
- Ne dodajamo odvisnosti, API-jev, strežniških sprememb ali shrambe.

## Implementacijski koraki

1. V `src/App.tsx` dodaj tipa za filter in velikost strani, dovoljeni vrednosti, privzete vrednosti ter izpeljavo `filteredTasks`, `effectivePageSize`, `totalPages`, `from`, `to` in `currentTasks`.
2. Dodaj dostopna izbiralnika `Velikost strani` in `Filter strani` ter gumbe `Prva stran`, `Prejšnja stran`, `Naslednja stran` in `Zadnja stran`. Sprememba velikosti ali filtra vedno nastavi prvo stran; neveljavna premika na robu so onemogočena.
3. Preglednici podaj le `currentTasks`. Tabalo podaj istim odsekom in ohrani njene trenutne števce stolpcev.
4. Dodaj status `role="status"` in `aria-label="Stanje straničenja"` z besedilom `Stran X od Y. Prikazano A–B od N.` ter enojnim pomišljajem. Za prazen rezultat uporabi `Stran 0 od 0. Prikazano 0–0 od 0.`
5. V `src/styles.css` dodaj kompaktne sloge za nove kontrole in po potrebi odzivni prelom, ki ohranja obstoječi Folio videz in širino 390 pik.
6. V `tests/agent/` dodaj Playwright preverjanja za R01–R12: privzete vrednosti, vse velikosti in filtre, premike in robove, obe pogleda, podrobnosti, ponastavitev, status, števce ter odsotnost zapisov na API.

## Datoteke

| Datoteka | Sprememba |
| --- | --- |
| `src/App.tsx` | Stanje, izpeljava, kontrole in podajanje trenutne strani obema pogledoma. |
| `src/TaskBoard.tsx` | Le morebitne prilagoditve za sprejem trenutne strani; logika stolpcev ostane. |
| `src/styles.css` | Folio slogi novih kontrol in odzivni prelom. |
| `tests/agent/p05.spec.ts` | Agentni testi za zahteve R01–R12. |

## Preverjanje

Po implementaciji izvedemo `npm run lint`, `npm run build` in ciljne Playwright teste za P05, nato po potrebi skupne teste izhodišča. Vsi navedeni rezultati morajo biti dejanski; neizvedenih testov ne navajamo kot uspešnih.

## Omejitve

Ni zunanjih meritev ali referenčne rešitve. Testni strežnik lahko vrne poljubno število opravil, zato preverimo vsaj nič, eno, več kot deset in meje strani. Navigacija med nezaključenim nalaganjem ali sočasnimi strežniškimi spremembami ni del P05 in se ne razširja.
