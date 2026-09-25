# P08 — Koledarski pregled rokov

Status: dokončana specifikacija za predajo implementerju, 2026-09-25. Izvirne zahteve `task/instructions.md` so obvezne. Prebrani so navodila, predloga, dizajn, relevantni tipi, izvorna koda in razvojni testi. Aplikacija in testi v tej fazi niso bili zagnani. Zgodovina: `specification-history.md`.

## Problem in kontekst

Obstoječi Folio dopolnimo s pregledom rokov trenutnega projekta. Ohranimo slovenska poimenovanja, obstoječe podatke, bralne podrobnosti, preglednico, tablo in prilagodljiv dizajn. Podatki prihajajo samo iz javnega `/api/`; pregled rokov jih ne zapisuje.

Izhodišče: `src/App.tsx:10` (`ProjectView`) bere opravila in izračuna tri števce stanj; preglednica prikazuje vsa opravila. `src/TaskBoard.tsx:13` jih deli v tri stolpce po stanju in znotraj stolpca ohranja vrstni red. Filtra rokov še ni. Obstoječi trije števci stanj ostanejo pregled celotnega projekta; pet novih števcev rokov je ločenih. Dizajn sledi `docs/dizajn.md` in obstoječim spremenljivkam v `src/styles.css`.

## Vhodi, dejanja in izidi

Vhodi so opravila projekta z `id`, `status` in veljavnim koledarskim `dueDate` v zapisu YYYY-MM-DD. Kontroli sta `input type=date` z oznako **Referenčni datum** in HTML `select` **Pogled rokov** z vrednostmi `all/overdue/today/week/later/done`. Začetno stanje vsakega projekta in osvežitve je `2026-09-21` ter `all`.

`shared/types.ts` določa `Project={id,name}` in `Task={id,projectId,title,description,status,assignee,dueDate}`. Odprti stanji sta `todo` in `in_progress`, končano je `done`. `id` in ostala besedilna polja so nizi. Javni GET viri so `/api/projects`, `/api/projects/:id/tasks` in `/api/tasks/:id`; obstoječe kodiranje ID-jev v URL ostane. `TaskUpdate` in pripravljeni `updateTask` nista potrebna za to nalogo.

Veljaven datum takoj preračuna skupine brez spremembe izbrane skupine. Prazno polje ohrani zadnji veljavni izračun in prikaže `role=alert` z besedilom **Vnesi veljaven referenčni datum.** Preklop med preglednico in tablo ohrani datum, besedilo polja in skupino. Menjava projekta vse to ponastavi. Stanje je samo v pomnilniku; URL in trajna shramba se ne uporabljata. Operacija nima potrjevanja ali zapisovanja, zato preklic ni posebna akcija.

Natančneje, stanje je S=(x,r,f), kjer je x trenutna vrednost polja, r zadnji veljavni datum in f filter. Začetno S₀=(2026-09-21,2026-09-21,all). Vnos veljavnega v daje S'=(v,v,f); prazno polje daje S'=('',r,f) in opozorilo. Izbira g daje S'=(x,r,g), tudi pri praznem polju; izračun še vedno uporablja r. Preklop prikaza ne spremeni S. Menjava ID-ja projekta ali ponovno nalaganje dokumenta da S₀ in odstrani opozorilo. Obstoječi URL lahko še naprej hrani projekt, podrobnosti in `view=board`, nikoli novega datuma ali skupine. Napake GET in ponovni poskus ohranijo obstoječe obnašanje `useResource`/`LoadError`; manjkajoč odgovor ni prazen projekt.

## Zahteve in pravila

Naj bo T urejen seznam opravil celotnega projekta, r zadnji veljavni referenčni datum in d(t) rok opravila. Primerjave in r+n so koledarske, ne lokalni časovni intervali. G(t,r) določa točno eno skupino: `done`, če `status=done`; sicer `overdue`, če d(t)<r; `today`, če d(t)=r; `week`, če r<d(t)≤r+7; sicer `later`. Vidni seznam V je T pri filtru all, sicer stabilno filtriranje T po G. Števec C(g)=|{t∈T:G(t,r)=g}| je neodvisen od filtra.

Invarianti: vsako t∈T pripada natanko eni skupini in ΣC(g)=|T|; če je t končano, ni v nobeni odprti skupini. V ohranja medsebojni vrstni red elementov iz T. Preglednica izriše V; tabla prejme isti V in ohrani obstoječe razvrščanje po stanju, z izvornim vrstnim redom **znotraj vsakega stolpca**. Množici ID-jev obeh prikazov sta enaki; njun globalni vrstni red v DOM zaradi stolpcev ni nujno enak. Izbira in datum nikoli ne spremenita T.

Za koledarsko aritmetiko je primerna čista funkcija nad deli datuma ali dosledna uporaba UTC. Lokalni čas, lokalni getterji in prištevanje 24 ur v lokalnem času niso ustrezna osnova za koledarski dan. Obstoječi `formatDate` že oblikuje datum v UTC in lahko ostane nespremenjen.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob vstopu v projekt r=2026-09-21, polje prikazuje ta datum in filter=all, ne glede na uro naprave. | Začetni prikaz in spremenjen čas naprave. |
| R02 | Status done ima prednost pred vsakim datumskim pogojem. | Končana opravila z različnimi roki. |
| R03 | Odprta opravila pred r so overdue, na r so today. | Mejni datumi r−1 in r. |
| R04 | Odprta opravila od r+1 do r+7 vključujoče so week, od r+8 so later; pet skupin je particija T. | r+1, r+7, r+8 in vsota števcev. |
| R05 | Koledarska aritmetika je neodvisna od časovnega pasu in DST ter pravilna čez mesec, leto in prestopni februar. | Primerjava enakih podatkov v več pasovih in na koledarskih mejah. |
| R06 | Pet števcev vedno šteje celoten projekt; elementi imajo aria-label `Število rokov <ključ>` in samo številsko vsebino. | Preklapljanje vseh filtrov brez spremembe števcev. |
| R07 | Vrednosti all/overdue/today/week/later/done izberejo V v izvornem vrstnem redu, brez mutacij opravil. | Primerjava ID-jev in podatkov pred/po filtriranju. |
| R08 | Veljaven datum preračuna V in C ter ohrani filter; prazno polje ohrani zadnji izračun, pokaže opozorilo, naslednji veljaven datum ga odstrani. | Veljaven → prazen → veljaven datum pri aktivnem filtru. |
| R09 | Preglednica in tabla kažeta iste filtrirane ID-je; preklop ohrani vse stanje kontrol. | Preklop ob veljavnem in praznem polju. |
| R10 | Menjava projekta in osvežitev ponastavita začetni datum in all; stanje ni v URL-ju ali trajni shrambi. | Menjava projekta, vrnitev, osvežitev in pregled kode. |
| R11 | Prazen projekt ima pet ničel; prazna skupina nepraznega projekta pokaže **Ni opravil v izbrani skupini.**, kontrole ostanejo uporabne. Prazen projekt ohrani obstoječe prazno stanje preglednice in vse tri prazne stolpce table. | Prazen projekt in prazen filter v obeh pogledih. |
| R12 | Bralni pregled ne zapisuje API-ja; podatkovna polja in podrobnosti ostanejo enaki, Folio ostane prilagodljiv. | Spremljanje zahtev, regresije podrobnosti in širina 390 px. |

Imena skupin so **Zapadlo**, **Danes**, **Naslednjih 7 dni**, **Pozneje**, **Končano**. Ohraniti je treba `data-task-id`, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Morebitna nova dejanja ob opravilu morajo biti zunaj povezave opravila. Pri širini 390 px stran nima vodoravnega raztezanja; notranje drsenje preglednice in table je dovoljeno.

## Izvedba in sledljivost

Predlagana mesta dopolnitve, ne trditev o že izvedeni kodi: stanje kontrol in izračuni v `ProjectView`, po potrebi čiste datumske funkcije v novem modulu pod `src/`; isti filtrirani seznam za preglednico in `TaskBoard`; dopolnitve stilov v `src/styles.css`. `ProjectView` ima že `key={project.id}` (`src/App.tsx:86`), zato lokalno stanje naravno preživi preklop pogleda in se ponastavi ob menjavi projekta. Ključa ne vezati na pogled ali datum. Ohraniti regijo **Tabla opravil**, stolpce **Pripravljeno**, **V delu**, **Končano**, dostopne povezave, podrobnosti in tipkovnično upravljanje.

Spodaj D01–D04 pomenijo obstoječe teste v `tests/development/P08.spec.ts`; S01–S07 so dodatni, še neizvedeni scenariji te specifikacije. Vsi izidi so **neizvedeno**; branje kode potrjuje le mesta integracije. Implementer zapiše dejanske datoteke implementacije, testna imena, ukaze in rezultate v svojo dokumentacijo pod `docs/agent/` ter te povezave preda reviewerju. Specifikacijo spreminja njen prvotni avtor.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | S₀ je fiksen, začetni filter all. | D01 delno; S01 preveri all in drugačno uro naprave. | `src/App.tsx`, `ProjectView`, inicializacija stanja. | Neizvedeno. |
| R02 | done ima prednost. | D04 delno; S01 z done na vseh mejnih datumih. | Predvidena čista klasifikacija v `src/`, klic iz `ProjectView`. | Neizvedeno. |
| R03 | Odprti d<r → overdue, d=r → today. | D01/D03 delno; S01 vsebuje tudi odprto opravilo na r. | Klasifikacija in izris v `src/App.tsx`. | Neizvedeno. |
| R04 | r+7 še week, r+8 later; particija. | D02 delno; S01 preveri vse skupine in vsoto. | Klasifikacija ter števci v `ProjectView`. | Neizvedeno. |
| R05 | Koledarske meje in časovni pas ne vplivajo. | S02: mesec, leto, prestopnost in DST. | Predvidena datumska funkcija v `src/`; obstoječi `src/formatDate.ts` uporablja UTC. | Neizvedeno. |
| R06 | Pet števcev C iz T, nespremenjenih pri filtriranju. | D02 samo week; S01 preklopi vseh šest možnosti in preveri vseh pet števcev. | `src/App.tsx`, števci rokov poleg obstoječega pregleda stanj. | Neizvedeno. |
| R07 | Stabilen filter po G brez mutacije T. | S03: drugačni ID-ji, podvojeni naslovi in premešan vrstni red. | `src/App.tsx`, tbody; `src/TaskBoard.tsx`, entries. | Neizvedeno. |
| R08 | Veljaven/prazen/veljaven vnos, isti f. | D03; S04 razširi na števce, ohranjen filter in preklop med praznim vnosom. | `ProjectView`, x in r ter alert. | Neizvedeno. |
| R09 | Isti ID-ji in nespremenjen S med prikazoma. | D04 delno; S03/S04 v obeh smereh preklopa. | `src/App.tsx`, view-switch in predaja V v `TaskBoard`. | Neizvedeno. |
| R10 | Projekt/osvežitev → S₀; brez shrambe in URL. | S05: menjava, vrnitev, osvežitev tudi ob praznem polju; pregled kode. | `src/App.tsx`, `key={project.id}`; `src/navigation.ts` ostane brez novih parametrov. | Neizvedeno. |
| R11 | Ničle pri T=[]; sporočilo pri T≠[] in V=[]. | S06; baseline `an empty project keeps the navigation and shows an empty state` in `an empty board keeps all columns and supports switching back to the table`. | `src/App.tsx`, prazni stanji; `src/TaskBoard.tsx`, prazni stolpci. | Neizvedeno. |
| R12 | Brez zapisov in regresij; prilagodljiv Folio. | D04 delno; S07 ter baseline podrobnosti/navigacija in skupni API testi. | `src/api.ts`, `src/TaskDetails.tsx`, `src/styles.css`, dostopne oznake v prikazih. | Neizvedeno. |

Konkretni dodatni scenariji (njihovi podatki so primeri, pravila veljajo splošno):

- **S01 — meje in števci:** pri r=2026-09-21 odprta opravila na 09-20, 09-21, 09-22, 09-28, 09-29 dajo C=(1,1,2,1,0). Dodaj done na vsakem od teh datumov: C=(1,1,2,1,5), vsota=10. Noben filter ne spremeni C; preizkusi tudi več kot deset opravil. Začetni datum ostane isti pri drugačnem datumu sistemske ure.
- **S02 — koledar:** r=2026-09-27 → r+7=2026-10-04; r=2026-12-28 → 2027-01-04; r=2028-02-22 → 2028-02-29; r=2028-02-23 → 2028-03-01; r=2027-02-22 → 2027-03-01. Na vsaki meji preveri r+7/week in r+8/later. Enaki ID-ji/števci v UTC, Europe/Ljubljana in America/Los_Angeles, tudi za r=2026-03-26 ter r=2026-10-22 čez DST. Veljavno odprto opravilo na prestopni dan je today, ko je r isti dan.
- **S03 — identiteta in zaporedje:** poljubni enkratni ID-ji, enaki naslovi, Unicode/ločila, premešana stanja in API zaporedje; pri vseh filtrih preveri stabilno zaporedje preglednice, stabilno zaporedje vsakega stolpca in enakost množic ID-jev med prikazoma. Podrobnosti odprejo pravi ID.
- **S04 — stanje vnosa:** izberi npr. overdue, vnesi veljaven drug datum, nato prazno polje; ohranijo se ID-ji in vseh pet števcev zadnjega izračuna, filter in prazna vrednost preživijo preklop tabla/preglednica. Ob praznem polju smeš izbrati drugo skupino z istim r. Nov veljaven datum odstrani opozorilo in takoj preračuna.
- **S05 — ponastavitev:** spremeni datum/filter, pojdi na drugi projekt in nazaj; vsakič S₀. Ponovi s praznim poljem in osvežitvijo v obeh pogledih. Preveri, da datum in filter ne dodata URL parametrov ali zapisov v localStorage/sessionStorage/drugo trajno shrambo.
- **S06 — praznine:** nič opravil v enem ali obeh projektih pomeni pet ničel in uporabne kontrole/navigacijo; tabla še kaže tri stolpce. Pri enem opravilu izberi prazno skupino: zahtevano sporočilo v obeh pogledih; all ponovno pokaže opravilo.
- **S07 — regresije:** spremljaj vse uporabniške interakcije in potrdi nič POST/PUT/PATCH/DELETE iz pregleda; podrobnosti ohranijo vsa polja in koledarski prikaz. Pri 390 px velja `document.documentElement.scrollWidth <= document.documentElement.clientWidth`; preveri oba pogleda, dolga besedila, kontrole, opozorilo, viden fokus in notranje drsenje. Primerjaj videz z `docs/dizajn.md` in obstoječimi predogledi.

Implementer naj izvede skupne baseline/API in razvojne P08 teste, dopolni smiselna preverjanja S01–S07 pod `tests/agent/` ter preveri lint/build (obstoječi `npm run check` združi lint, build in test). Pred daljšim preverjanjem naj preveri časovni proračun. Razvojni test D03 nima odprtega opravila na začetnem referenčnem dnevu, zato sam ne dokazuje R03/today; D01–D04 prav tako ne dokazujejo koledarskih prehodov ali ponastavitev.

## Odprta vprašanja in omejitve

Veljajo poljubno število opravil, prazni projekti, drugačni enkratni ID-ji, enaki naslovi, poljubno izvorno zaporedje ter besedilo z Unicode in ločili. Opravila izbiramo po ID, ne naslovu ali indeksu. Datumi podatkov so veljavni YYYY-MM-DD. Navigacija med nezaključenim nalaganjem in sočasne spremembe brez osvežitve ostanejo v obstoječem regresijskem obsegu. Strežnik, skupni tipi, infrastruktura, odvisnosti, navodila in skupni testi so samo za branje. Testne kontrole `/__test/` niso del aplikacije. Implementer izvede teste in dokazila zapiše v svojo dokumentacijo; nedostopni končni testi se ne štejejo za opravljene.

Blokirajočih vprašanj ni. Imena skupin so predpisana, oznaka možnosti all in postavitev novih kontrol sta prosta (npr. **Vsa opravila**). Za native date polje je obvezno navedeno obnašanje praznega vnosa; izmišljeni neveljavni datumi podatkov so zunaj domene. Razlaga vrstnega reda na tabli ohranja obstoječe stolpce, kot zahteva dizajn in regresijski testi. Vsi scenariji izvajanja in vizualni pregled ostajajo naloga implementerja; v tej fazi ni dokazila o uspešnosti izvedbe.
