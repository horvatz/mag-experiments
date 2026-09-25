# P08: specifikacija koledarskega pregleda rokov

Različica 1.1, 2026-09-25. Postopek A, en agent. Začetna specifikacija pripravljena pred spremembami kode; po izvedbi dopolnjena sledljivost.

## Problem in kontekst

Folio že bere projekte in opravila prek javnega API-ja ter ponuja preglednico,
tablo po stanjih in bralne podrobnosti. Dodamo pregled rokov glede na izrecno
izbran koledarski datum. Ohranimo slovenski vmesnik, obstoječa stanja, ID-je,
podrobnosti in prilagodljivo postavitev iz `docs/dizajn.md`.

## Vhodi, dejanja in izidi

- Vhod je urejeno zaporedje opravil trenutnega projekta iz
  `/api/projects/:id/tasks`: `id`, `projectId`, `status`, `dueDate` ter
  nespremenjena besedilna polja. ID-ji so enkratni; naslovi niso ključi.
- Podatkovni datumi so veljavni `YYYY-MM-DD`. Za referenčni datum uporabimo
  označen `input type=date`; prazen oziroma neveljaven vnos ohrani zadnji
  veljavni izračun in pokaže določeno opozorilo.
- Uporabnik spremeni datum, izbere skupino, preklopi pogled ali projekt,
  odpre in zapre podrobnosti ali osveži stran. Izbira in datum ne zapisujeta
  podatkov. Posebnega potrjevanja ali preklica filtra ni.
- Ob veljavnem datumu se števci in vrstice takoj preračunajo; izbrana skupina
  ostane. Vnosno besedilo in zadnji veljavni datum sta ločeni stanji.
- Ob napaki API-ja ostane obstoječi prikaz napake in ponovitve nalaganja.

## Zahteve in pravila

Naj bo `T` zaporedje opravil projekta, `r` zadnji veljavni referenčni datum,
`d` besedilo datumskega polja, `f` izbrana skupina in `D(x)` zaporedna številka
koledarskega dne, izračunana v UTC brez lokalnega časovnega pasu. Za odprto
opravilo velja `delta(t) = D(t.dueDate) - D(r)`.

Predikati za razvrstitev:

- `done(t) ⇔ t.status = done`.
- `overdue(t) ⇔ t.status ≠ done ∧ delta(t) < 0`.
- `today(t) ⇔ t.status ≠ done ∧ delta(t) = 0`.
- `week(t) ⇔ t.status ≠ done ∧ 1 ≤ delta(t) ≤ 7`.
- `later(t) ⇔ t.status ≠ done ∧ delta(t) > 7`.

Za vsako opravilo velja natanko en predikat. `C[g] = |{t ∈ T : g(t)}|`,
zato `Σ C[g] = |T|`, neodvisno od `f`. Vidno zaporedje je `T`, če `f=all`,
sicer stabilno filtrirano zaporedje `T` po `f(t)`. Tabla ta ista opravila
razporedi v obstoječe stolpce stanj; vrstni red znotraj stolpca ostane izvoren.
Interval `1..7` koledarskih dni je enakovreden roku od `r+1` do `r+7`.

Prehodi stanja:

- Začetek projekta ali osvežitev: `(d,r,f) := (2026-09-21,2026-09-21,all)`.
- Veljavni novi `x`: `(d,r,f) := (x,x,f)`; opozorilo se odstrani.
- Neveljavni novi `x`: `(d,r,f) := (x,r,f)`; opozorilo se prikaže.
- Menjava preglednica/tabla ali odpiranje/zapiranje podrobnosti: `(d,r,f)` ostane.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Stalni začetni datum 2026-09-21 in `all`, brez branja trenutne ure. | D01; A01; pregled kode. |
| R02 | `done` ima prednost pred vsemi datumi. | D04; A01 z zaključenimi opravili v vseh časovnih intervalih. |
| R03 | Odprta opravila pred referenco so overdue, na referenci today. | D01, D03; A01. |
| R04 | Dneva +1 in +7 vključena v week, +8 v later; disjunktna popolna delitev. | D02; A01; A02. |
| R05 | Izračun UTC koledarskih dni, brez lokalnih ur; meje meseca, leta in prestopnih let. | A02; A03 v različnih časovnih pasovih. |
| R06 | Pet številskih elementov `aria-label="Število rokov <ključ>"` šteje celoten projekt. | A01, A04, A05; števci preverjeni pri vseh filtrih. |
| R07 | HTML select Pogled rokov z all/overdue/today/week/later/done; izvoren vrstni red in nespremenjeni podatki. | A01; A06; D01–D04. |
| R08 | Takojšen preračun, ohranjen filter; prazen datum opozori in ohrani zadnji preračun. | D03; A04; A03. |
| R09 | Enaka množica ID-jev v obeh pogledih; ohranjeni veljavni datum, vnos in filter. | D04; A01; A04. |
| R10 | Menjava projekta in osvežitev ponastavita vse stanje rokov; brez URL-ja ali trajne shrambe. | A04; pregled kode. |
| R11 | Prazni projekti: pet ničel. Prazna skupina: Ni opravil v izbrani skupini.; kontrole ostanejo. | A05 za nič in eno opravilo ter oba pogleda. |
| R12 | Samo javni bralni API, nespremenjena polja in podrobnosti; brez širjenja strani pri 390 px. | A06; A03; skupni regresijski in razvojni testi; ogled obeh pogledov. |

## Izvedba in sledljivost

Spodaj so dejanske lokacije in preverjeni izidi. Podrobnosti zagona in omejitve
so v [verification.md](verification.md). Oznake A01–A06 pomenijo teste v
[`tests/agent/deadlines.spec.ts`](../../tests/agent/deadlines.spec.ts);
D01–D04 so skupni razvojni testi, izvedeni na namizju in mobilnem profilu.
Dokaz za vse spodnje uspešne teste je [dnevnik končnega zagona](check-final.log).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetno stanje | D01, A01 | `src/deadlines.ts`: INITIAL_REFERENCE_DATE; `src/App.tsx`: ProjectView | Uspešno, tudi z uro brskalnika v letu 2034. |
| R02 | Prednost done | D04, A01 | `src/deadlines.ts`: groupTasksByDeadline, prva veja | Uspešno; zaključena opravila pred, na in po referenci samo v done. |
| R03 | delta ≤ 0 | D01, D03, A01 | `src/deadlines.ts`: groupTasksByDeadline | Uspešno; ločeni overdue in today. |
| R04 | Meja +7 in popolnost | D02, A01, A02 | `src/deadlines.ts`: groupTasksByDeadline | Uspešno; +1/+7 vključena, +8 izključen, 14 ID-jev brez podvajanja. |
| R05 | Koledarski dnevi | A02, A03 | `src/deadlines.ts`: calendarDay | Uspešno; 6 mejnih koledarjev in 3 časovni pasovi. |
| R06 | Neodvisni števci | A01, A04, A05 | `src/DeadlineOverview.tsx`: deadline-counts; `src/App.tsx`: deadlineGroups | Uspešno; enaki števci pri vseh filtrih in obeh pogledih. |
| R07 | Stabilni filter | D01–D04, A01, A06 | `src/App.tsx`: visibleTasks; `src/deadlines.ts`: skupine | Uspešno; izvorni vrstni red in nespremenjena polja. |
| R08 | Ločen vnos in referenca | D03, A04 | `src/App.tsx`: changeReferenceDate; `src/DeadlineOverview.tsx`: opozorilo | Uspešno; prazni vnos ohrani tudi predhodno spremenjeni veljavni datum. |
| R09 | Skupen vir obeh pogledov | A01, A04 | `src/App.tsx`: visibleTasks za preglednico in TaskBoard | Uspešno; enaki ID-ji pri vseh šestih filtrih. |
| R10 | Življenjski cikel projekta | A04 | `src/App.tsx`: ProjectView s ključem project.id | Uspešno; prehod tja/nazaj in reload, prazen vnos ponastavljen, brez nove shrambe ali URL parametrov. |
| R11 | Prazna stanja | A05 | `src/App.tsx`: prazna skupina; `src/DeadlineOverview.tsx`: kontrole | Uspešno; nič in eno opravilo, vsi filtri, oba pogleda. |
| R12 | Branje in prilagodljivost | A06, regresijski testi, ogled | `src/styles.css`: deadline-*; obstoječi API in podrobnosti | Uspešno; brez zapisov, ohranjene podrobnosti, širina strani 390/1440 px. |

## Odprta vprašanja in omejitve

- Izvorni globalni vrstni red je v preglednici; tabla po obstoječi zasnovi
  grupira po statusu, zato zahteva enake ID-je in vrstni red znotraj stolpcev.
- Ne širimo obsega novih sočasnih sprememb ali navigacije med nalaganjem;
  ohranimo obstoječe regresijske zahteve.
- Končni skriti testi niso dostopni. Razvojni testi sami ne dokazujejo vseh zahtev.
- Dovoljene spremembe so omejene na `src/`, `tests/agent/`, `docs/agent/`.
- Preverjanje je izvedeno v nameščenem Chromiumu; drugih pogonov in vseh
  možnih datumov nismo izčrpno preizkusili. Znane neizpolnjene zahteve ni.

## Zgodovina specifikacije

- v1: začetna specifikacija pred implementacijo; pravila in načrt preverjanja R01–R12.
- v1.1: po implementaciji dopolnjene dejanske lokacije, rezultati in povezave
  na dokaze; sprejemna pravila ostanejo enaka. Zapisane omejitve preverjanja.
