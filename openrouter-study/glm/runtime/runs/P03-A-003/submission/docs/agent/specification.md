# Specifikacija P03: Iskanje in sestavljeni filtri

## Problem in kontekst

Folio trenutno prikaže vsa opravila izbranega projekta v izvornem vrstnem redu. Uporabnik potrebuje hitro iskanje po identifikatorju, naslovu, opisu in odgovorni osebi ter kombinacijo tega iskanja s filtrom stanja in odgovorne osebe. Rezultat mora biti enak v preglednici in tabli, stanje filtrov pa lokalno za trenutni projekt in ne sme biti shranjeno v URL ali trajni shrambi.

## Vhodi, dejanja in izidi

- Podatki: `Task` s polji `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`; projekti s poljema `id`, `name`. Vsi podatki se berejo iz obstoječega javnega API-ja.
- Vnos: `input type=search` z dostopnim imenom `Išči opravila`; več besed pomeni logično IN neodvisno od vrstnega reda.
- Filtra: `select` `Filter stanja` z vrednostmi `all`, `todo`, `in_progress`, `done` ter `Filter odgovorne osebe` z `all` in unikatnimi imeni celotnega trenutnega projekta.
- Izbira: preklop pogleda ohrani vse tri kontrole; preklop projekta in osvežitev strani ju ponastavita.
- Izid: enaki filtrirani ID-ji v preglednici in tabli, števci prikazanih rezultatov ter sporočilo `Ni zadetkov.` samo ob nepraznem projektu brez zadetkov.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob prikazu projekta velja `query = "" ∧ status = "all" ∧ assignee = "all"`; prikazani ID-ji so enaki ID-jem API-odgovora v njegovem vrstnem redu. | Razvojne in lastne Playwright preizkuse |
| R02 | Normalizacija `NFD → odstrani U+0300–U+036F → lowercase`; primerja se z istim postopkom na obeh straneh. | Lasten Playwright preizkus z diakritiko in velikimi črkami |
| R03 | `∀ beseda v query.trim().split(/\s+/): normaliziran(beseda) ⊑ normaliziran(haystack)`; prazen niz ne filtrira. | Lastni Playwright preizkusi večbesednega iskanja |
| R04 | `matches = searchMatches ∧ (status = "all" ∨ task.status = status) ∧ (assignee = "all" ∨ task.assignee = assignee)`; odgovorne osebe se primerjajo natančno. | Razvojne in lastne Playwright preizkuse |
| R05 | Seznam oseb je `["all"] ∪ unique(nonEmpty(assignees(project)))`; skrite osebe ostanejo v izbirniku, preklop projekta izbere le njegove osebe. | Lastni Playwright preizkus preklopa projekta |
| R06 | ID-ji preglednice in table so isti, preklop pogleda ne spremeni filtrov; vsak stolpec vsebuje samo prikazana opravila svojega stanja. | Razvojne in lastne Playwright preizkuse |
| R07 | Menjava projekta ponastavi vse tri kontrole pred uporabo filtrov; filtri nikoli ne prečkajo projektov. | Lastni Playwright preizkus |
| R08 | Začetno stanje ob vsakem nalaganju projekta je privzeto; iz `URL`, lokalne ali trajne shrambe se ne restavira. | Lastni Playwright preizkus osvežitve |
| R09 | `aria-label="Rezultati filtriranja"` vsebuje natanko `Prikazano: N od M.`, kjer je `N = |filtered|` in `M = |tasks(project)|`; števci stanj štejejo samo filtrirane rezultate. | Razvojne in lastne Playwright preizkuse |
| R10 | `0 < M ∧ N = 0 → "Ni zadetkov."`; `M = 0` ohrani obstoječe prazno stanje in `Prikazano: 0 od 0.` | Razvojne in lastne Playwright preizkuse |
| R11 | Gumb `Počisti filtre` nastavi privzete vrednosti vseh treh kontrol in prikaže vse opravila; filtriranje ohrani vrstni red in vsebino podatkov. | Razvojni in lastni Playwright preizkus |
| R12 | Obstala navigacija in podrobnosti ostanejo delujoči; med filtriranjem ni zahtev `POST`, `PATCH`, `PUT` ali `DELETE` na `/api/`; ohranita se Folio in ozka postavitev. | Razvojni, lastni in skupni izhodni preizkusi |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R11 | Privzeti prikaz, iskanje, filtri, preklopi, števci, prazna stanja in čiščenje | Lastni testi A01–A04 | `src/App.tsx:13`, `src/App.tsx:22`, `src/App.tsx:68`, `tests/agent/P03-agent.spec.ts:13` | Uspešno; A01–A05 so opravljeni |
| R02–R04, R09 | Normalizacija, večbesedno iskanje, sestavljeni filtri in števci | Razvojna testa D01, D02 in D04 | `src/App.tsx:23`, `src/App.tsx:33` | Uspešno v namizni in mobilni izvedbi |
| R03, R06, R10, R11 | Prazni rezultat, preklop pogleda in čiščenje | Razvojni test D03 ter lastni test A04 | `src/App.tsx:68`, `src/TaskBoard.tsx:5` | Uspešno v namizni in mobilni izvedbi |
| R07, R08 | Ponastavitve ob preklopu projekta in osvežitvi | Lastna testa A02 in A03 | `src/App.tsx:17`, `tests/agent/P03-agent.spec.ts:40` | Uspešno |
| R12 | Ohranjena navigacija, podrobnosti, samo-bralnost in ozka postavitev | Izhodni testi, razvojni test D04 in lastni test A05 | `src/App.tsx:60`, `tests/agent/P03-agent.spec.ts:85` | Uspešno |

## Zgodovina popravkov

- 2026-11-01: Prva različica specifikacije po predlogi in zahtevah P03.
- 2026-11-01: Po implementaciji dopolnjena sledljivost z dejanskimi izidi; tabela je bila prvotno izrisovala nefiltrirane naloge, kar je bilo popravljeno in preverjeno.

## Odprta vprašanja in omejitve

- Izvedba ne vključuje novega pisalnega API-ja, testnih kontrol ali sprememb skupne infrastrukture.
- Končno preverjanje je opravljeno; podrobnosti so v `docs/agent/verification.md`.
