# Razvojna specifikacija P04 — Stabilno razvrščanje z dvema ključema

Različica 1.0 (2026-10-11). Postopek A, en agent. Povezava na dejanska
preverjanja: `docs/agent/verification.md`.

## Problem in kontekst

Folio prikazuje opravila enega projekta v preglednici in na tabli. Pred
spremembo je vrstni red vedno enak vrstnemu redu odgovora API-ja. Uporabnik
želi opravila razvrstiti po primarnem in neobveznem sekundarnem ključu ter
smeri, pri tem pa mora ostati izvorni vrstni red dosegljiv in nespremenjen.
Sprememba doda štiri izbirnike in gumb za ponastavitev; razvrščanje je čista
projekcija prikaza, brez zapisovanja.

## Vhodi, dejanja in izidi

Vhodi: opravila `Task { id, projectId, title, description, status, assignee,
dueDate }`, prebrana z `GET /api/projects/:id/tasks` v vrstnem redu odgovora
(v nadaljevanju izvorno polje `T`). Projekti z 0, 1 ali več opravili; enaki
naslovi in poljubne enkratne oznake ID so dovoljeni.

Dovoljena dejanja: izbira primarnega ključa (`original/title/assignee/status/
dueDate`), primarne smeri (`asc/desc`), sekundarnega ključa (`none/title/
assignee/status/dueDate`), sekundarne smeri (`asc/desc`), gumb `Izvorni
vrstni red`, preklop pogleda preglednica/tabla, odpiranje in zapiranje
podrobnosti, menjava projekta, osvežitev strani.

Pričakovano stanje po uspehu: ista množica opravil je prikazana v vrstnem
redu, ki ga določi pravilo razvrščanja; polja opravil, pripadnost projektu,
števci in izvorno polje ostanejo nespremenjeni; noben zahtevek za zapis ni
poslan. Preklic (ponastavitev) vrne vse štiri kontrole na privzete vrednosti
in prikaz v izvorni vrstni red. Napaka nalaganja ohrani obstoječa stanja
(`LoadError`, ponovni poskus) in na razvrščanje ne vpliva.

## Zahteve in pravila

Splošni simboli in predpostavke:

- `T` — izvorno polje opravil; `T[i]` je i-to opravilo odgovora API-ja.
- `norm(s) = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()`.
- `cmp_text(a,b)` — znak primerjave `norm(a)` in `norm(b)` z operatorjema `<`
  in `>` po UTF-16 (brez `Intl.Collator`, brez številskega urejanja).
- `rank(todo)=0, rank(in_progress)=1, rank(done)=2`.
- `dir(c,d) = c`, če je `d=asc`; `dir(c,d) = -c`, če je `d=desc`.
- `cmp_p(a,b)` — primerjava po izbranem primarnem ključu; `cmp_s(a,b)` — po
  sekundarnem; `cmp_text` za `title`/`assignee`, `rank` za `status`, znakovna
  primerjava veljavnih `YYYY-MM-DD` za `dueDate`.
- Razvrščanje: `sort(T,p,pd,s,sd)`: če je `p=original`, je izid `T` (druge
  kontrole se ne upoštevajo); sicer stabilno urejanje s primerjalnikom
  `C(a,b) = dir(cmp_p(a,b),pd)`, če ni 0; sicer 0, če je `s=none`; sicer
  `dir(cmp_s(a,b),sd)`. Stabilnost ohrani izvorni vrstni red izenačenih.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno stanje kontrol je `p=original, pd=asc, s=none, sd=asc`; prikaz je natanko `T` (isti vrstni red in vsebina). | razvojni D01 (prvi del), agent A04/A06, osnovni testi |
| R02 | Za `p∈{title,assignee}` velja `C = cmp_text`; velja `norm('Alfa 10') < norm('alfa 2')` (ne številsko), `norm('Čas')='cas'`, `norm('č')='c'`; primerjava je leksikografska po UTF-16. | agent A01, razvojni D01 |
| R03 | `status`: naraščajoče `todo < in_progress < done` po `rank`; `dueDate`: veljavni koledarski datumi `YYYY-MM-DD` se primerjajo kronološko (znakovna primerjava ISO oblike). | agent A02, razvojni D02/D03 |
| R04 | Smer obrne samo predznak primerjave izbranega ključa (`dir`); ne obrne končnega polja in ne obrne vrstnega reda izenačenih (stabilnost). | agent A03, razvojni D02 |
| R05 | Sekundarni ključ se uporabi natanko takrat, ko je `cmp_p(a,b)=0`; njegova smer je neodvisna od primarne. | agent A02, razvojni D02 |
| R06 | Ob `cmp_p=0` in `cmp_s=0` (ali `s=none`) ostane relativni vrstni red iz `T`; enak primarni in sekundarni ključ je dovoljen in ne obrne dodatno; `p=original` vrne `T` ne glede na `pd, s, sd`. | agent A03/A04 |
| R07 | Tabla ohrani stalni vrstni red stolpcev `todo, in_progress, done`; znotraj stolpca je relativni vrstni red enak filtriranemu razvrščenemu polju preglednice. | agent A05, razvojni D03 |
| R08 | Preklop pogleda in odpiranje/zapiranje podrobnosti ohranita vse štiri nastavitve (stanje ni vezano na pogled). | agent A06 |
| R09 | Menjava projekta in osvežitev začneta s privzetimi vrednostmi; nastavitve niso v `localStorage`, `sessionStorage` ali URL-ju. | agent A06 |
| R10 | Gumb `Izvorni vrstni red` ponastavi vse štiri kontrole; prazen projekt in projekt z enim opravilom delujeta pri vseh ključih in smereh. | agent A07/A11/A12, razvojni D04 |
| R11 | Razvrščanje ne spremeni polj, pripadnosti, skupnih števcev ali `T`; ob spremembi vrstnega reda ni zahtevkov `POST/PATCH/PUT/DELETE` na `/api/`. | agent A08, razvojni D04 |
| R12 | Vsak ID je prikazan natanko enkrat in odpre prave podrobnosti tudi ob enakih naslovih; ohranjeni so `data-task-id`, dostopna imena pogledov in stolpcev, `aria-label="Pregled stanj opravil"`; pri širini 390 pik se stran ne preliva vodoravno. | agent A09/A10, osnovni testi |

Ločnica med splošnim pravilom in posameznim primerom: pravila zgoraj veljajo
za poljubne podatke opisane domene; razvojni in agentni primeri so le
vzorčenje. Končni testi lahko uporabijo drugačne podatke.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R06, R10–R11 | čistost in pravilnost razvrščanja | A01–A04, A07, A08, A11, A12; D01, D02, D04 | `src/sorting.ts` (`sortTasks`, `compareByKey`, `normalizeText`) | glej `verification.md` |
| R07–R08 | tabla in ohranjanje stanja | A05, A06; D03 | `src/App.tsx` (`ProjectView`), `src/TaskBoard.tsx` | glej `verification.md` |
| R09 | ponastavitev ob projektu/osvežitvi | A06 | `src/App.tsx` (`key={project.id}`, `useState`) | glej `verification.md` |
| R10 | kontrole in robni primeri | A07, A11, A12; D04 | `src/SortControls.tsx` | glej `verification.md` |
| R12 | regresija in odzivnost | A09, A10; osnovni testi | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | glej `verification.md` |

Dejanski izidi, imena testov in omejitve so zapisani v
`docs/agent/verification.md`; tam so tudi povezave na zahteve. Noben izid ni
označen kot uspešen brez izvedbe.

## Odprta vprašanja in omejitve

- R06 je razumljen dobesedno: kadar je primarni ključ `original`, sekundarni
  ključ in smeri nimajo učinka (vedno izvorni vrstni red).
- Manjkajoči ali neveljavni datumi niso del obsega (naloga jih izključuje).
- Stanje razvrščanja je lokalno trenutnemu projektu in življenjski dobi
  strani; trajna shramba in URL nista dovoljena in ju ne uvajamo.
- Končnih (skritih) testov ni mogoče zagnati; preverjeni so le razvojni,
  osnovni in lastni agentni testi.
- Okolje dovoljuje samo lokalne storitve in priloženi Chromium; omrežje je
  blokirano, zato so vsi testi izvedeni lokalno.

## Zgodovina sprememb specifikacije

- 2026-10-11, v1.0: prva različica pred implementacijo; opredeljeni R01–R12,
  predikati in načrt preverjanja.
- 2026-10-11, v1.1: po izvedbi dopolnjene povezave na agentne teste A11 in A12
  (prazen oziroma enojni projekt); vsebinske zahteve in predikati nespremenjeni.
