# P09 — specifikacija

## Problem in kontekst

Folio že bere projekte in opravila iz javnega API-ja ter podpira preglednico,
tablo in podrobnosti po ID-ju. Uporabnik želi deljivo povezavo do filtriranega
in urejenega pregleda, ki jo obnovijo osvežitev, Nazaj in Naprej. Dodamo
osnutek treh kontrol in izrecno potrditev, ob ohranitvi slovenskega videza Folio.

## Vhodi, dejanja in izidi

Vhodi so fragment poti projekta ali opravila, parametri `view`, `q`, `status`,
`order` in zaporedje opravil API-ja (`id`, `projectId`, `title`, `description`,
`assignee`, `status`, `dueDate`). `q` je poljubno navadno besedilo. ID je
identiteta opravila; naslov to ni. Podatkov ne spreminjamo.

Urejanje kontrol spremeni le osnutek. Uporabi pogled hkrati potrdi vse tri
vrednosti; Ponastavi pogled potrdi privzete vrednosti. Navigacija zavrže osnutek.
Preklop prikaza in podrobnosti ohranita potrjeno stanje, klik drugega projekta
pa uporabi privzete filtre. Neposredna povezava vedno uporabi svoje parametre.
Ob napaki API-ja ostaneta obstoječe sporočilo in ponovni poskus; pri napačni
poti ostane obnovljiva napaka. Escape zapre podrobnosti in ohrani pogled.

## Zahteve in pravila

Naj bo `C=(q,s,o)` potrjeno stanje, `D` osnutek in `T` izvorno zaporedje opravil.
`C₀=('',all,original)`. `norm(x)=lower(remove[U+0300–U+036F](NFD(trim(x))))`.
`match(t,C) := (s=all ∨ t.status=s) ∧ ∃f∈{title,description,assignee,id}:
norm(f(t)).includes(norm(q))`. Prazna fraza ustreza vsem opravilom.
`V=sort_o(filter_match(T))`. Pri urejanju primerjamo normalizirana naslova po
UTF-16; enaka ključa ohranita vrstni red iz `T`. Tabla razdeli `V` v obstoječe
stolpce, znotraj vsakega ohrani vrstni red `V`.

Potrditev: `C'= (trim(D.q), D.s, D.o)`, `D'=C'`.
`Δhistory=1 ⇔ C'≠C`, sicer `Δhistory=0`. Primerjava `q` je po obrezanem besedilu,
ne po iskalni normalizaciji. Pri enakem stanju lahko kanonizacija zamenja trenutni
URL, vendar ne doda zgodovine. Samo razčlenjevanje URL-ja nikoli ne spreminja.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Fragment poti projekta/opravila neposredno določi C; odsotni parametri dajo C₀. | Razvojni D01, dodatne neposredne povezave. |
| R02 | Velja match; fraza je dobesedna, brez delitve besed ali regex. | Dodatni primeri Unicode, ločil, ID, opisa, osebe in večbesedne fraze. |
| R03 | Status in fraza delujeta po IN; trije vrstni redi, stabilne izenačitve. | Dodatni primeri različnih statusov in UTF-16 vrstnega reda. |
| R04 | Prva pojavitev parametra zmaga; neznan status/order je privzet, ostali parametri nimajo učinka; URL ostane. | Dodatne nekanonične povezave. |
| R05 | Sprememba D ne spremeni V ali URL; ena potrditev ustvari največ eno stanje. | D02, dodatno hkratna sprememba vseh kontrol in zgodovina. |
| R06 | Potrditev obreže q, izpusti privzete vrednosti, kodira parametre, obdrži view=board in odstrani neznane parametre; enak C ne doda zgodovine. | Dodatna kanonizacija in ponovitev potrditve. |
| R07 | Nazaj/Naprej in osvežitev obnovijo C, D in V. | D03 in dodatni prehodi zgodovine. |
| R08 | Oba prikaza vsebujeta iste ID-je; navigacija zavrže D. | D03 in dodatni osnutki pri preklapljanju. |
| R09 | Podrobnosti po ID-ju in oba načina zapiranja ohranijo C in view. | Izhodiščni testi ter dodatni filtrirani podvojeni naslovi in neposredne podrobnosti. |
| R10 | Klik drugega projekta ponastavi C, ohrani view; neposredni URL uporabi svoje C. | Dodatni projektni prehodi in neposredne povezave. |
| R11 | Reset uporabi isto zgodovinsko pravilo; Ni zadetkov. pri praznem V; status Rezultati povezave vsebuje Prikazano: N od M. | D04, dodatni prazni projekti/rezultati in števec. |
| R12 | Samo GET /api; brez localStorage; obstoječe nalaganje, napake, podrobnosti in mobilni videz ostanejo. | Celotni npm run check, spremljanje zahtev/shrambe in širina 390 pik. |

## Izvedba in sledljivost

Izvedena rešitev in preverjanja; podrobni dokazi so v [verification.md](verification.md).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | C iz fragmenta projekta ali opravila | D01, A03, A07, A08 | src/navigation.ts: readRoute; src/viewState.ts: readViewState | Uspešno, check-final.log |
| R02 | Dobesedna normalizirana fraza v kateremkoli od štirih polj | A01, A05 | src/viewState.ts: normalizeSearch, visibleTasks | Uspešno, check-final.log |
| R03 | IN, UTF-16 in stabilne izenačitve | A02, A10 | src/viewState.ts: visibleTasks | Uspešno, check-final.log |
| R04 | Prva pojavitev, neznane vrednosti, brez samodejnega prepisovanja | A03 | src/navigation.ts: readRoute; src/viewState.ts: readViewState | Uspešno, check-final.log |
| R05 | Ločen D, hkratna potrditev in natanko en vnos | D02, A04 | src/ViewControls.tsx; src/App.tsx: apply; src/navigation.ts: navigate | Uspešno, check-final.log |
| R06 | Kanonizacija, kodiranje, enak C ne doda zgodovine | A03, A04, A05 | src/navigation.ts: viewQuery, navigate; src/viewState.ts: sameViewState | Uspešno, check-final.log |
| R07 | Obnovitev C, D in prikaza | D03, A04, A05, A08 | src/navigation.ts: subscribeNavigation, useRoute; src/ViewControls.tsx | Uspešno, check-final.log |
| R08 | Enaki ID-ji, navigacija zavrže D | D03, A02, A06 | src/App.tsx; src/TaskBoard.tsx; src/ViewControls.tsx | Uspešno, check-final.log |
| R09 | Podrobnosti po ID, ohranitev C/view | A05, A06, A07; izhodiščni testi podrobnosti | src/navigation.ts: taskUrl; src/TaskBoard.tsx; src/TaskDetails.tsx | Uspešno, check-final.log |
| R10 | Klik projekta ponastavi, neposredni URL velja | A08 | src/App.tsx: projektne povezave; src/navigation.ts: readRoute | Uspešno, check-final.log |
| R11 | Reset, Ni zadetkov., N od M | D04, A01, A04, A07, A09 | src/App.tsx: view-results, no-results; src/ViewControls.tsx | Uspešno, check-final.log |
| R12 | Regresije, brez zapisov/shrambe, širina 390 | Vseh 57 testov, posebej A11; ogled posnetkov | src/styles.css; obstoječa src/api.ts in src/useResource.ts | Uspešno, check-final.log, visual-check.json |

Imena A01–A11 so identifikatorji testov v `tests/agent/P09.spec.ts`; D01–D04
so skupni razvojni testi, izvedeni na namizju in telefonu. Dnevnik vsebuje polna
imena, projekte in rezultate vseh testov.

## Odprta vprašanja in omejitve

- Povzetek stanj in obstoječi skupni števec ostaneta povzetek celotnega projekta;
  novi zahtevani števec prikazuje N filtriranih od M vseh opravil.
- Prazni projekt ohrani obstoječe pojasnilo in prazne stolpce table ter dobi tudi
  zahtevano sporočilo Ni zadetkov.
- Navigacij med nedokončanim nalaganjem ne širimo prek obstoječih regresij.
- Nedostopni končni testi niso del preverjanja. Časovna omejitev je 20 minut.

## Zgodovina specifikacije

- 2026-09-26: začetna specifikacija pred spremembami kode; izrecno pojasnjena
  kanonizacija brez nove zgodovine pri enakem potrjenem stanju.
- 2026-09-26: po implementaciji posodobljena sledljivost z dejansko izvedenimi
  A01–A11 in uspešnim celotnim preverjanjem; vsebinska pravila ostajajo enaka.
