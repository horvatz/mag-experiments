# P08 – Specifikacija koledarskega pregleda rokov

## Problem in kontekst

Folio trenutno prikazuje vsa opravila projekta v preglednici ali tabli in omogoča
bralne podrobnosti. Uporabnik potrebuje pregled rokov glede na izbrani koledarski
datum. Dodatek ohranja slovenski vmesnik, obstoječo navigacijo, prikaz stanj,
podrobnosti ter prilagodljiv videz iz `docs/dizajn.md`.

## Vhodi, dejanja in izidi

- Vhod so opravila trenutnega projekta iz javnega GET `/api/projects/:id/tasks`:
  `id`, `projectId`, `status`, `dueDate` ter nespremenjena prikazna polja.
  ID-ji so enkratni; naslovi niso ključi. Datumi podatkov so veljavni YYYY-MM-DD.
- Začetno lokalno stanje vsakega projekta: vnos in veljavni referenčni datum
  `2026-09-21`, pogled rokov `all`. Ura naprave na to ne vpliva.
- Uporabnik spreminja `input type=date` z oznako **Referenčni datum** in HTML
  `select` **Pogled rokov** z vrednostmi all/overdue/today/week/later/done.
- Veljaven datum takoj spremeni preračun; neveljaven oziroma prazen vnos se
  prikaže, vendar ohrani zadnji veljavni preračun. Opozorilo z `role=alert`:
  **Vnesi veljaven referenčni datum.** Naslednji veljavni vnos ga odstrani.
- Izbor skupine, sprememba datuma in preklop prikaza ne spreminjajo opravil in
  ne pošiljajo zapisov. Ni potrjevanja ali preklica; spremembe so lokalne.
- Napake in nalaganje javnega API-ja ohranijo obstoječi prikaz ter ponovni poskus.
  Menjava projekta oziroma osvežitev strani začne novo lokalno stanje.

## Zahteve in pravila

Naj bo T urejeno zaporedje opravil projekta, B zadnji veljavni referenčni dan,
D(t) koledarski dan roka in G(t,B) skupina. Koledarske dneve pretvorimo v cela
števila po gregorijanskem koledarju, brez lokalnih ur ali časovnih pasov.

Predikati (prednostno pravilo done):

- G(t,B)=done ⇔ t.status=done.
- G(t,B)=overdue ⇔ t.status≠done ∧ D(t)<B.
- G(t,B)=today ⇔ t.status≠done ∧ D(t)=B.
- G(t,B)=week ⇔ t.status≠done ∧ B<D(t)≤B+7.
- G(t,B)=later ⇔ t.status≠done ∧ D(t)>B+7.
- C[g]=|{t∈T : G(t,B)=g}|; vsota petih števcev je |T|.
- V(T,B,f) je T pri f=all, sicer stabilni izbor t z G(t,B)=f.
- Veljaven vnos x: (vnos,B,f)→(x,dan(x),f). Neveljaven vnos x:
  (vnos,B,f)→(x,B,f) z opozorilom. Preklop table/preglednice stanja ne spremeni.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetni datum je izrecno 2026-09-21, filter all. | D01 in lastni test začetnega stanja z drugačno uro naprave. |
| R02 | Done ima prednost pred vsemi datumi; odprti števci ga ne vsebujejo. | Lastni podatki z done v vseh časovnih skupinah; D04. |
| R03 | Odprta roka pred B in na B sta overdue in today. | D01, lastni test vseh skupin in mej. |
| R04 | Week je od B+1 do B+7 vključujoče; later od B+8. Razdelitev je popolna in disjunktna. | D02, lastni test mej in vsote števcev. |
| R05 | Razlike koledarskih dni pravilno prečkajo mesec, leto, prestopni februar in DST. | Lastni primeri koledarskih mej v različnih časovnih pasovih. |
| R06 | Pet označenih številskih elementov šteje ves projekt ne glede na filter. | Lastni test vseh filtrov in števcev. |
| R07 | Filter ohrani izvorni vrstni red (na tabli znotraj stolpca) in polja opravil. | Lastni podatki z več kot deset opravili, ponovljenimi naslovi in drugačnimi ID-ji. |
| R08 | Veljaven datum takoj preračuna; prazen ohrani B in f ter pokaže opozorilo. | D03, lastni test spremembe datuma in obeh pogledov. |
| R09 | Oba pogleda vsebujeta isti nabor ID-jev; datum, surov vnos in filter se ohranijo. | D04, lastni test preklopa pri praznem in veljavnem vnosu. |
| R10 | Menjava projekta in reload ponastavita datum/filter; brez trajne shrambe ali URL-ja. | Lastni test menjave, vrnitve in reload; pregled kode. |
| R11 | Prazen projekt ima pet ničel; prazna skupina nepraznega projekta izpiše predpisano sporočilo in ohrani kontrole. | Lastni test praznih projektov in skupin v obeh pogledih. |
| R12 | Samo javni bralni API, nespremenjene podrobnosti, brez razširitve strani pri 390 px. | Skupna regresija, lastni test zahtevkov, podatkov in mobilne širine, vizualni ogled. |

Imena skupin: Zapadlo, Danes, Naslednjih 7 dni, Pozneje, Končano. Števci imajo
`aria-label="Število rokov <ključ>"` in zgolj številsko vsebino. Obstoječa
oznaka `Pregled stanj opravil`, imena pogledov/stolpcev in `data-task-id` ostanejo.
Tabla še naprej razporeja opravila po stanjih; znotraj stolpca ohrani izvorni
vrstni red. Za prazen projekt ohranimo obstoječe prazno stanje; za prazno izbrano
skupino dodamo **Ni opravil v izbrani skupini.** in dostopne kontrole.

## Izvedba in sledljivost

Specifikacija je nastala pred implementacijo. Spodnja sledljivost je posodobljena
po izvedbi; podrobni rezultati in omejitve so v [verification.md](verification.md).
Oznake A01–A05 označujejo lastne teste v
[deadlines.spec.ts](../../tests/agent/deadlines.spec.ts), D01–D04 pa skupne razvojne
teste. Vsi navedeni testi so vključeni v končni uspešni zagon `npm run check`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Inicializacija projekta | D01; A01 | [App.tsx](../../src/App.tsx) – ProjectView/useState; [deadlines.ts](../../src/deadlines.ts) – INITIAL_REFERENCE_DATE | Uspešno, [check.log](check.log), D01 in A01. |
| R02 | Done ima prednost | D04; A01 | [deadlines.ts](../../src/deadlines.ts) – prvi pogoj deadlineGroup | Uspešno, [check.log](check.log), D04 in A01. |
| R03 | Pretekli in današnji rok | D01; A01 | [deadlines.ts](../../src/deadlines.ts) – daysUntilDue < 0 oziroma = 0 | Uspešno, [check.log](check.log), D01 in A01. |
| R04 | Vključujoča tedenska meja | D02; A01, A02 | [deadlines.ts](../../src/deadlines.ts) – daysUntilDue ≤ 7 | Uspešno, [check.log](check.log), D02, A01 in A02. |
| R05 | Koledarske meje | A02 v treh pasovih, vsak s sedmimi scenariji | [deadlines.ts](../../src/deadlines.ts) – calendarDay | Uspešno, [check.log](check.log), vsi trije A02. |
| R06 | Števci celotnega projekta | A01, A03, A04 | [deadlines.ts](../../src/deadlines.ts) – counts pred filtriranjem; [DeadlineFilters.tsx](../../src/DeadlineFilters.tsx) – deadline-counts | Uspešno, [check.log](check.log), A01, A03, oba A04. |
| R07 | Stabilen filter, nespremenjeni podatki | A01, A05 | [deadlines.ts](../../src/deadlines.ts) – stabilen prehod; [App.tsx](../../src/App.tsx) – visibleTasks | Uspešno, [check.log](check.log), A01 in A05. |
| R08 | Vnos in zadnji veljavni datum | D03; A03 | [App.tsx](../../src/App.tsx) – changeReferenceDate; [DeadlineFilters.tsx](../../src/DeadlineFilters.tsx) – opozorilo | Uspešno, [check.log](check.log), D03 in A03. |
| R09 | Ohranitev stanja in ID-jev | D04; A01, A03, A05 | [App.tsx](../../src/App.tsx) – lokalno stanje ProjectView, skupni visibleTasks | Uspešno, [check.log](check.log), D04, A01, A03 in A05. |
| R10 | Ponastavitev ob projektu/reload | A03 | [App.tsx](../../src/App.tsx) – key={project.id}, useState | Uspešno, [check.log](check.log), A03; pregled kode brez nove shrambe/URL parametrov. |
| R11 | Prazni podatki in izbor | Oba A04 | [App.tsx](../../src/App.tsx) – prazna stanja; [deadlines.ts](../../src/deadlines.ts) – začetne ničle | Uspešno, [check.log](check.log), oba A04. |
| R12 | Bralni API in odziven Folio | A05; 38 izhodiščnih testov; vizualni ogled | [App.tsx](../../src/App.tsx), [DeadlineFilters.tsx](../../src/DeadlineFilters.tsx), [styles.css](../../src/styles.css) – deadline slogi | Uspešno, [check.log](check.log), [visual-check.json](visual-check.json), [verification.md](verification.md). |

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj, ki bi blokirala izvedbo. Obseg je izključno lokalni UI;
  spremembe strežnika, infrastrukture, skupnih tipov in skupnih testov niso del naloge.
- Naveza koledarskih števil na B+7 je enakovredna prištevanju sedmih koledarskih
  dni in se izogne spremembam ure pri poletnem času.
- Vnos sledi pozitivnim štirimestnim letom HTML datuma (0001–9999).
- Ne širimo navigacije med nezaključenim nalaganjem ali sočasnih sprememb podatkov.
- Končni skriti testi niso dostopni in jih ne bomo navajali kot izvedene.
- Časovna omejitev je 20 minut; uporabljamo enega agenta, samo lokalne storitve.

## Zgodovina sprememb

- 2026-09-25, v1: specifikacija pripravljena pred implementacijo; rezultati še niso preverjeni.
- 2026-09-25, v2: dodane dejanske povezave s kodo in uspešnim zagonom 54 testov,
  razpon HTML datumskega vnosa ter dokazi vizualnega pregleda. Sprejemna pravila
  R01–R12 ostajajo enaka. Lastni A02 je popravljen, da vsak nabor res znova naloži
  podatke (isti hash URL prej ni povzročil novega nalaganja); zgodovina prvega
  neuspešnega zagona je ohranjena v `check-first.log`.
