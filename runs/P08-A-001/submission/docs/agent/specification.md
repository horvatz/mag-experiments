# Specifikacija P08 — koledarski pregled rokov

Različica 1.1, 2026-09-23. Postopek A, en agent. Začetna specifikacija 1.0 je bila pripravljena pred spremembami kode; 1.1 dopolnjuje izvedene dokaze.

## Problem in kontekst

Folio že bere projekte in opravila iz javnega API-ja ter prikazuje preglednico, tablo po stanjih in bralne podrobnosti. Uporabnik potrebuje pregled rokov glede na izrecno izbrani koledarski datum. Dodamo pet števcev in filter rokov; obstoječi povzetek stanj, povezave po ID-jih, vsebina podatkov in prilagodljivi videz Folio ostanejo ohranjeni.

## Vhodi, dejanja in izidi

- Vhod je zaporedje opravil trenutnega projekta iz `/api/projects/:id/tasks`. Za razvrstitev uporabimo `status` in `dueDate`, za identiteto `id`; ostala polja ostanejo navadno besedilo. Veljajo poljubni enkratni ID-ji, podvojeni naslovi, poljubno zaporedje in število zapisov, tudi nič.
- Ob vstopu v projekt sta datum polja in zadnji veljavni referenčni datum `2026-09-21`, filter pa `all`, ne glede na uro naprave.
- Kontroli sta označeni `Referenčni datum` (`input type=date`) in `Pogled rokov` (`select`). Možnosti so `all`, `overdue`, `today`, `week`, `later`, `done`; oznake skupin so Zapadlo, Danes, Naslednjih 7 dni, Pozneje, Končano.
- Sprememba veljavnega datuma takoj spremeni preračun. Prazna/neveljavna vrednost ostane v polju, sproži `role=alert` z besedilom `Vnesi veljaven referenčni datum.` in ne spremeni zadnjega veljavnega preračuna. Naslednji veljavni vnos odstrani opozorilo.
- Izbira filtra spremeni samo vidna opravila. Preklop prikaza in odpiranje/zapiranje podrobnosti ohranita stanje kontrol. Menjava projekta ali osvežitev ga ponastavi. Nove funkcionalnosti ne shranjujemo v URL ali trajno shrambo.
- Ni zapisovanja, potrjevanja ali preklica sprememb podatkov. Ob napaki API ostaneta obstoječe obvestilo in ponovni poskus. Prazen projekt ohrani izhodiščne prazne prikaze; prazna izbrana skupina v nepraznem projektu dobi zahtevano sporočilo in ohrani kontrole.

## Zahteve in pravila

Naj bo `T` urejeno zaporedje opravil projekta, `r` zadnji veljavni referenčni datum, `x` trenutna vrednost polja, `f` filter. `d(s)` je celoštevilski koledarski dan datuma `s`, izračunan izključno v UTC (brez lokalnega časovnega pasu). `Δ(t) = d(t.dueDate) − d(r)`. Podatkovni datumi so veljavni v obliki `YYYY-MM-DD`.

Predikati razvrstitve:

- `Gdone(t) ⇔ t.status = done`.
- `Goverdue(t) ⇔ t.status ≠ done ∧ Δ(t) < 0`.
- `Gtoday(t) ⇔ t.status ≠ done ∧ Δ(t) = 0`.
- `Gweek(t) ⇔ t.status ≠ done ∧ 1 ≤ Δ(t) ≤ 7`.
- `Glater(t) ⇔ t.status ≠ done ∧ Δ(t) > 7`.
- Za vsak `t ∈ T` velja natanko en predikat; `Σ count(g) = |T|`. `count(g) = |{t ∈ T : Gg(t)}|` je neodvisen od `f`.
- `visible(T, all) = T`; sicer `visible(T, f) = filter(T, Gf)`, brez razvrščanja. Tabla dodatno razporedi to isto množico ID-jev po izhodiščnih stolpcih stanj in ohrani izvorni vrstni red znotraj vsakega stolpca.
- Veljaven vnos `v`: `(x, r, f) → (v, v, f)`. Neveljaven vnos `v`: `(x, r, f) → (v, r, f)`. Preklop prikaza ohrani trojico. Nov projekt/osvežitev: `(x, r, f) → (2026-09-21, 2026-09-21, all)`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izrecna začetna vrednost datuma in `all`; brez sistemske ure. | D01; A02, A05 z drugačno uro naprave. |
| R02 | `done` ima prednost pred vsemi roki. | D04; A01 in A02 z različnimi roki končanih opravil. |
| R03 | Odprta opravila pred `r` so zapadla, na `r` današnja. | D01, D03; A01, A02. |
| R04 | Meji tedna sta `r+1` in `r+7`, `r+8` je pozneje; skupine tvorijo particijo. | D02; A01, A02 z vsemi mejami. |
| R05 | Koledarsko računanje v UTC, tudi mesec/leto/prestopni februar in DST. | A01; A06 v različnih časovnih pasovih. |
| R06 | Pet števcev celotnega projekta s točnimi aria-label in samo številko. | A02 skozi vse filtre in spremembo datuma; A04. |
| R07 | HTML select filtrira po skupini, ohrani vrstni red in podatke. | D01–D04; A02 z več kot desetimi opravili, podvojenimi naslovi in drugačnimi ID-ji. |
| R08 | Veljaven vnos preračuna ob ohranjenem filtru; prazen ohrani preračun in opozori. | D03; A03 tudi po že spremenjenem veljavnem datumu. |
| R09 | Preglednica in tabla imata iste ID-je in ohranita veljavni datum, besedilo polja ter filter. | D04; A02, A03. |
| R10 | Projekt/osvežitev ponastavita stanje; brez trajne shrambe ali URL-parametrov filtra. | A05; pregled kode. |
| R11 | Prazen projekt: pet ničel; prazna skupina: točno zahtevano besedilo in delujoča izbira. | A04 na obeh pogledih, oba projekta prazna. |
| R12 | Bralni API, nespremenjena polja/podrobnosti, dostopnost in širina 390 px. | Izhodiščni testi, D04; A02, A03, A04, A06; ročni lokalni ogled. |

## Izvedba in sledljivost

Imena A01–A06 označujejo izvedene lastne scenarije v [deadlines.spec.ts](../../tests/agent/deadlines.spec.ts); A06 se izvede v treh časovnih pasovih. Natančni izvedeni rezultati so v [verification.md](verification.md), celotni dnevnik pa v [check.log](check.log). Vseh 54 testov je uspelo, vključno z osmimi lastnimi.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetna konstanta in `all` | D01, A02, A05 | [deadlines.ts](../../src/deadlines.ts): `INITIAL_REFERENCE_DATE`; [App.tsx](../../src/App.tsx): lokalno stanje projekta | Uspešno: `check.log`, D01 (oba prikaza naprav), A02 z uro leta 2042, A05. |
| R02 | Prednost `done` | D04, A01, A02 | [deadlines.ts](../../src/deadlines.ts): prva veja `groupDeadlines` | Uspešno: `check.log`, končana opravila z roki iz vseh časovnih skupin. |
| R03 | Δ < 0 in Δ = 0 | D01, D03, A01, A02 | [deadlines.ts](../../src/deadlines.ts): razvrstitev po razliki dni | Uspešno: `check.log`, preverjeni točni ID-ji. |
| R04 | 1 ≤ Δ ≤ 7, Δ > 7; particija | D02, A01, A02 | [deadlines.ts](../../src/deadlines.ts): `groupDeadlines` | Uspešno: `check.log`, obe meji tedna, naslednji dan in particija. |
| R05 | UTC koledarski dnevi | A01, A06 | [deadlines.ts](../../src/deadlines.ts): `calendarDay` | Uspešno: `check.log`, prestopni februar, mesec/leto, stoletja in 3 časovni pasovi. |
| R06 | Števci celotnega `T` | A02, A03, A04 | [App.tsx](../../src/App.tsx): `deadlineCounts`; [DeadlineControls.tsx](../../src/DeadlineControls.tsx): števci | Uspešno: `check.log`, nespremenjeni števci skozi vse filtre; preračun datuma in ničle. |
| R07 | Stabilno filtriranje | D01–D04, A02 | [App.tsx](../../src/App.tsx): `visibleTasks` | Uspešno: `check.log`, 15 opravil z enakimi naslovi, poljubnim vrstnim redom in Unicode ID-jem. |
| R08 | Ločena `x` in `r` | D03, A03 | [App.tsx](../../src/App.tsx): `changeReferenceDate`; [DeadlineControls.tsx](../../src/DeadlineControls.tsx): opozorilo | Uspešno: `check.log`, prazno polje po spremenjenem datumu, vrnitev veljavnega vnosa. |
| R09 | Stanje vezano na projekt, oba prikaza dobita iste podatke | D04, A02, A03, A05 | [App.tsx](../../src/App.tsx): `ProjectView` in oba prikaza | Uspešno: `check.log`, množice ID-jev, vrstni red stolpcev, veljavno in prazno polje. |
| R10 | Ponovna inicializacija | A05 | [App.tsx](../../src/App.tsx): `key={project.id}` in lokalno React stanje | Uspešno: `check.log`, menjava v obe smeri, osvežitev, URL ter local/sessionStorage. |
| R11 | Prazni prikazi in števci | A04 | [App.tsx](../../src/App.tsx): prazna skupina; [DeadlineControls.tsx](../../src/DeadlineControls.tsx) | Uspešno: `check.log`, oba prazna projekta, projekt z enim opravilom, vrnitev iz prazne skupine. |
| R12 | Brez zapisov/regresij/prelivanja | Izhodišče, D04, A02–A06; lokalni ogled | [App.tsx](../../src/App.tsx), [DeadlineControls.tsx](../../src/DeadlineControls.tsx), [styles.css](../../src/styles.css); obstoječe podrobnosti/API | Uspešno: `check.log`, [manual-review.json](manual-review.json) in posnetki; brez zapisov ali napak JS, širina 390 px. |

## Odprta vprašanja in omejitve

- Ni blokirajočih vprašanj. Interpretacija izvornega vrstnega reda na tabli sledi obstoječim stolpcem stanj; vrstni red je ohranjen znotraj stolpca, množica ID-jev pa je enaka preglednici.
- HTML datumsko polje brskalnika lahko nepopoln/neveljaven vnos izpostavi kot prazno vrednost. Preračun vselej temelji na zadnji veljavni vrednosti.
- Nove sočasne spremembe podatkov brez osvežitve niso del obsega. Ne spreminjamo strežnika, skupnih tipov, testov ali infrastrukture.
- Končni nedostopni testi niso izvedeni. Preverjanje je bilo opravljeno v nameščenem Chromiumu; drugih brskalnikov in fizičnih mobilnih naprav nismo preverili. Podrobnosti so v [poročilu](verification.md).

## Zgodovina sprememb specifikacije

- 1.0: začetna specifikacija pred implementacijo; rezultati preverjanj še niso znani.
- 1.1: po izvedbi nadomeščeni načrtovani izidi z dejanskimi rezultati, povezavami na kodo, testi in dnevniki; dodane dejanske omejitve. Sprejemni pogoji in predikati so ostali enaki.
