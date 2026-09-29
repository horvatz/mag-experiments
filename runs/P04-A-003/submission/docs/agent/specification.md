# P04 — razvojna specifikacija, postopek A

## Problem in kontekst

Folio trenutno prikazuje opravila v zaporedju odgovora javnega API-ja. Uporabnik
potrebuje stabilno razvrščanje po dveh ključih z neodvisnima smerema v preglednici
in tabli. Dopolnitev ohrani slovenski vmesnik, potrjeni videz iz `docs/dizajn.md`,
bralne funkcije in povezave do podrobnosti po ID-ju. Izvedbo opravi en agent.

## Vhodi, dejanja in izidi

- Vhod je polje `Task[]` iz `/api/projects/:id/tasks`; uporabljena polja so
  `id`, `projectId`, `title`, `assignee`, `status`, `dueDate`. Opis ostane besedilo.
- ID-ji so enkratni, naslovi se lahko ponavljajo, število opravil je poljubno.
  Naslovi in imena so nizi; datumi so veljavni koledarski datumi `YYYY-MM-DD`.
- Štirje HTML selecti imajo dostopna imena `Primarni ključ`, `Primarna smer`,
  `Sekundarni ključ`, `Sekundarna smer`. Ključi so original/title/assignee/status/
  dueDate oziroma none/title/assignee/status/dueDate; smeri asc/desc.
- Sprememba kontrol takoj spremeni projekcijo prikaza. Gumb `Izvorni vrstni red`
  povrne četverico (original, asc, none, asc). Obe smeri ostaneta dostopni tudi,
  kadar original oziroma none njun učinek izključita.
- Preklop pogleda in odprtje/zaprtje podrobnosti ohranita četverico. Menjava
  projekta in osvežitev jo ponastavita. Stanja ni v URL-ju ali trajni shrambi.
- Razvrščanje ne potrebuje potrditve, nima zapisovalnega koraka ali preklica.
  Zaprtje podrobnosti ne vpliva na razvrščanje. Ob napaki GET ostaneta obstoječi
  prikaz napake in ponovni poskus; brez podatkov ni projekcije za razvrščanje.

## Zahteve in pravila

Naj bo `A = [a₀, …, aₙ₋₁]` izvorno polje, `S = (p, dp, s, ds)` nastavitve,
`P(A,S)` prikazano polje in `S₀ = (original, asc, none, asc)`.
`N(x) = lower(remove[U+0300–U+036F](NFD(x)))`. `cmp(x,y)` vrne -1, 0 ali 1
glede na operatorja `<` in `>` (UTF-16 za nize). `dir(asc)=1`, `dir(desc)=-1`.
Vrednost statusa je todo→0, in_progress→1, done→2; datumske nize fiksne oblike
primerjamo leksikografsko, kar za dovoljeno domeno ustreza kronologiji brez
pretvorb časovnega pasu. Za title/assignee primerjamo `N`.

Za `p ≠ original` je primerjava elementov najprej `dir(dp) × cmpₚ(aᵢ,aⱼ)`,
nato samo ob ničli `dir(ds) × cmpₛ(aᵢ,aⱼ)` (none pomeni ničlo), nazadnje `i-j`.
Smer nikoli ne množi zadnje primerjave izvornih indeksov.

Predikati in prehodi:

- `p = original ⇒ ids(P(A,S)) = ids(A)` za poljubne preostale kontrole.
- `cmpₚ(aᵢ,aⱼ)=cmpₛ(aᵢ,aⱼ)=0 ∧ i<j ⇒ posP(aᵢ)<posP(aⱼ)`.
- `multiset(ids(P(A,S))) = multiset(ids(A))` in `A_po = A_pred`, vključno s polji.
- Za vsak status `t`: `board(t) = filter(P(A,S), status=t)`; vrstni red
  stolpcev je vedno todo, in_progress, done.
- `viewChange/detailOpen/detailClose: S′=S`; `projectChange/reload/reset: S′=S₀`.
- `sortChange ⇒ število zapisovalnih zahtev API = 0`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeta četverica S₀ in izvorni vrstni red. | D01 in A05; A04 za original. |
| R02 | NFD, samo U+0300–U+036F, male črke, primerjava UTF-16 brez locale/numeric. | D01, A01 z Unicode, ločili in številkami za oba besedilna ključa. |
| R03 | Status todo < in_progress < done; veljavni datumi kronološko. | D02/D03 in A03 z mejami mesecev, let ter prestopnim datumom. |
| R04 | Smer spremeni samo primerjavo posameznega ključa; vezi ostanejo stabilne. | A01–A03 z obema smerema in vezmi. |
| R05 | Sekundarni ključ deluje samo ob vezi primarnega, smer je neodvisna. | D02 in A02 za vse sekundarne ključe/smeri. |
| R06 | Ob popolni vezi ohrani indeks; isti ključ je dovoljen; original prevlada. | A02 in A04; reset po sortiranju tudi preveri izvorno polje. |
| R07 | Stalni stolpci in relativni vrstni red skupne projekcije. | D03 in A06 za vse tri stolpce. |
| R08 | Preklop in podrobnosti ohranijo vse štiri nastavitve. | A05 in A06. |
| R09 | Projekt in osvežitev vrneta S₀; brez shrambe/URL-ja. | A05 ter pregled kode. |
| R10 | Reset vseh kontrol, prazno/enojno polje pri vseh nastavitvah. | D04, A04 in A07 v vmesniku. |
| R11 | Brez mutacij, sprememb polj/pripadnosti/števcev ali zapisov. | A01–A04 z zamrznjenimi vhodi; A06 z nadzorom zahtev/števil. |
| R12 | Vsi ID-ji natanko enkrat, pravilne podrobnosti, ohranjen odziven Folio. | Izhodiščni testi, A06 s podvojenimi naslovi, A07 pri 390 px. |

## Izvedba in sledljivost

Izvedene lokacije: čista projekcija [src/taskSorting.ts](../../src/taskSorting.ts),
dostopne kontrole [src/TaskSortControls.tsx](../../src/TaskSortControls.tsx), lokalno
stanje in uporaba projekcije [src/App.tsx](../../src/App.tsx), prilagodljivi slogi
[src/styles.css](../../src/styles.css). Nespremenjeni `src/TaskBoard.tsx` ohranja
relativni vrstni red prejetega polja s filtriranjem. Lastni testi so v
[sorting.spec.ts](../../tests/agent/sorting.spec.ts) (A01–A04) in
[sorting-ui.spec.ts](../../tests/agent/sorting-ui.spec.ts) (A05–A07; A07 ima dve izvedbi).

Vsi izidi v naslednji tabeli izhajajo iz uspešnega `npm run check`, 2026-09-23;
celoten določljiv dnevnik z imeni testov je [check.log](check.log).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | S₀, izvorni vrstni red | D01, A04, A05 | taskSorting: DEFAULT_SORT; App: useState | Uspešno; check.log, D01/A04/A05. |
| R02 | N(x), UTF-16 | D01, A01 | taskSorting: normalize/valueFor/compare | Uspešno; check.log, D01/A01. |
| R03 | Statusi, datumi | D02/D03, A03 | taskSorting: statusOrder/valueFor | Uspešno; check.log, D02/D03/A03. |
| R04 | Stabilnost smeri | A01–A03 | taskSorting: compare, končni izvorni indeks | Uspešno; check.log, A01–A03. |
| R05 | Sekundarni ključ/smer | D02, A02 | taskSorting: drugi compare za ničelni prvi izid | Uspešno; check.log, D02/A02. |
| R06 | Vezi, isti ključ, original | A02/A04 | taskSorting: original in left.index-right.index | Uspešno; check.log, A02/A04. |
| R07 | Relativni red/stolpci | D03, A06 | App: sortedTasks; TaskBoard: columns/filter | Uspešno; check.log, D03/A06. |
| R08 | Ohranitev stanja | A05/A06 | App: ProjectView, lokalni sortSettings | Uspešno; check.log, A05/A06. |
| R09 | Ponastavitev projekta/osvežitve | A05 | App: key=project.id, useState(DEFAULT_SORT) | Uspešno; check.log, A05. |
| R10 | Reset, nič/eno | D04, A04/A07 | TaskSortControls: reset; App: prazen prikaz | Uspešno; check.log, D04/A04/A07. |
| R11 | Čista projekcija | D04, A01–A04/A06 | taskSorting: nova polja; App: števci iz tasks | Uspešno; check.log, D04/A01–A04/A06. |
| R12 | Identiteta, branje, 390 px | Izhodišče, A06/A07, vizualni pregled | App/TaskBoard: key, data-task-id, povezave; styles: sort-controls | Uspešno; check.log in preview.log ter slike v verification.md. |

Končni dejanski rezultati, obseg posameznih testov in omejitve so v
[verification.md](verification.md).

## Odprta vprašanja in omejitve

Ni odprtih vprašanj v dogovorjeni domeni. Manjkajoči/neveljavni datumi niso
zahtevani. Ne širimo navigacije med nezaključenim nalaganjem ali sočasnega
posodabljanja. Končni skriti testi niso dostopni. Časovna omejitev je 20 minut;
spreminjajo se samo src/, tests/agent/ in docs/agent/.

## Zgodovina sprememb specifikacije

- 2026-09-23, različica 1: specifikacija in načrt preverjanja pripravljena pred implementacijo.
- 2026-09-23, različica 2: po izvedbi posodobljene lokacije kode, testov in dejanski
  izidi; dodani dokazi vizualnega pregleda. Sprejemni pogoji in obseg zahtev se
  niso spremenili. A07 je izveden ločeno za prazno in enojno polje; vseh 100
  kombinacij za oba vhoda preveri A04, A07 pa 10 kombinacij v obeh pogledih.
