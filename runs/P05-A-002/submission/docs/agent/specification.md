# P05 — Specifikacija (postopek A, en agent)

## Problem in kontekst

Folio trenutno iz javnega API-ja prebere vsa opravila projekta in jih prikaže
v preglednici ali tabli. Uporabnik potrebuje filter po stanju in straničenje,
ki v obeh pogledih obravnavata isto zaporedje. Ohranimo slovenske oznake,
potrjeni videz, povezave po ID-jih, nalaganje, napake in podrobnosti.

## Vhodi, dejanja in izidi

Vhod je urejeno polje `Task[]` iz `/api/projects/:id/tasks`; `id` je enkraten,
`projectId` določa projekt, `status` je `todo`, `in_progress` ali `done`.
Naslov, opis in oseba so navadno besedilo; naslov ni identifikator.
Velikost strani je `all`, `2`, `5` ali `10`; filter je `all` ali eno od stanj.

Lokalno stanje projekta je `(s, f, p)`, začetno `(all, all, 1)`.
Sprememba velikosti ali filtra atomarno pri naslednjem izrisu ponastavi `p=1`.
Štirje gumbi spremenijo le `p`; onemogočeno dejanje ne učinkuje.
Preklop pogleda in odpiranje/zapiranje podrobnosti stanja ne spremenita.
Menjava projekta in ponovni zagon strani ustvarita začetno stanje.
Zapiranje podrobnosti s križcem, Escape ali zgodovino ohrani izbiro.
Straničenje ne shranjuje podatkov, ne zahteva potrditve in nima zapisovalnega
API-ja. Napake GET in ponovni poskus ostanejo v obstoječem `useResource`.
Kontrole so na voljo po uspešnem nalaganju, tudi ob praznem polju.

## Zahteve in pravila

Naj bo `T` izvorno polje trenutnega projekta, `F = [t ∈ T | f=all ∨ t.status=f]`
(stabilno filtriranje), `N=|F|`. Za `N>0` je `k=N`, če `s=all`, sicer `k=Number(s)`;
`Y=ceil(N/k)`, `1≤p≤Y`, `V=F[(p−1)k : min(pk,N)]`,
`A=(p−1)k+1`, `B=min(pk,N)`. Za `N=0` je `Y=X=A=B=0`, `V=[]`;
sicer je prikazana stran `X=p`. Notranja začetna stran ostane 1 tudi ob praznini.

Splošni predikati:

- `concat(V₁,…,Vᵧ)=F` in za `i≠j` je `IDs(Vᵢ)∩IDs(Vⱼ)=∅`.
- `IDs(preglednica)=IDs(tabla)=IDs(V)`; tabla ohranja vrstni red znotraj stanja.
- `summary(q)=|{t∈T:t.status=q}|`, `column(q)=|{t∈V:t.status=q}|`.
- `changeSize(s′):(s,f,p)→(s′,f,1)`; `changeFilter(f′):(s,f,p)→(s,f′,1)`.
- Prva/prejšnja sta onemogočeni, kadar `N=0 ∨ p=1`;
  naslednja/zadnja, kadar `N=0 ∨ p=Y`.
- Vsako dejanje straničenja ohrani `T` in ne povzroči zapisovalne zahteve API.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno all/all, izvorni vrstni red in vsi ID-ji. | Dodatni test A01 z neurejenimi ID-ji in enakimi naslovi. |
| R02 | Velikosti 2/5/10 razdelijo F po zgornjih predikatih. | A01: prehod čez vse strani 23 opravil za vse velikosti. |
| R03 | Prva/prejšnja/naslednja/zadnja upoštevajo robove. | A01, A02: premiki in onemogočeni gumbi. |
| R04 | Vsaka sprememba velikosti vrne p=1; all ima eno neprazno stran. | D04, A02: tudi prejšnja veljavna stran. |
| R05 | Stabilen filter pred odsekom in ponastavitev p. | D03, A03: vsa tri stanja in odstranitev filtra. |
| R06 | Tabla združi le V v stolpce. | D03, A03: ID-ji in vrstni red po stolpcih. |
| R07 | Pogled in podrobnosti ohranijo s/f/p. | A04: oba pogleda, Escape, gumb in zgodovina. |
| R08 | Nov projekt in reload ponastavita stanje, brez shrambe/URL-ja. | A05: oba projekta, povratek in reload. |
| R09 | Točno `Stran X od Y. Prikazano A–B od N.` v statusu z dogovorjenim imenom. | D02, A01–A05. |
| R10 | Praznina ima 0/0 in 0–0, štirje onemogočeni gumbi. | A06: prazna projekta in prazen filter; odstranitev filtra. |
| R11 | Povzetek in skupno število sta iz T, števci table iz V. | A03, A06. |
| R12 | Brez zapisov; ID-ji, povezave, nalaganje in videz ostanejo uporabni. | Celotni npm run check, A04, A07; pregled pri 390 pikah. |

## Izvedba in sledljivost

Spodaj so dejanska mesta izvedbe in rezultati končnega zagona.
Celotna dokazila, vmesni popravek testa in omejitve so v
[verification.md](verification.md). A01–A07 so v
[pagination.spec.ts](../../tests/agent/pagination.spec.ts), D01–D04 pa v
nespremenjenih [razvojnih testih](../../tests/development/P05.spec.ts).
Vsi navedeni uspehi izhajajo iz [check-final.log](check-final.log): 53 uspešnih testov.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | all/all/1 | A01 | [App.tsx](../../src/App.tsx), ProjectView: začetno stanje, vrstice 14–16 | Uspešno: A01, vsi izvorni ID-ji v pravilnem vrstnem redu. |
| R02 | Stabilni odseki | A01, D01/D02 | [App.tsx](../../src/App.tsx), filteredTasks/visibleTasks, vrstice 17–22 | Uspešno: vseh 23 ID-jev pri 2/5/10, brez podvojitev ali izgub. |
| R03 | Robovi in premiki | A01/A02 | [TaskPagination.tsx](../../src/TaskPagination.tsx), atStart/atEnd in štirje gumbi | Uspešno: vsi premiki; native click onemogočenega gumba ne spremeni stanja. |
| R04 | Ponastavitev velikosti | A02, D04 | [App.tsx](../../src/App.tsx), onPageSizeChange | Uspešno: 5→10 s še veljavne druge strani in prehod na all. |
| R05 | Filter pred odsekom | A03, D03 | [App.tsx](../../src/App.tsx), filter/onFilterChange | Uspešno: vsa stanja, stabilni vrstni red in prva stran po spremembi. |
| R06 | Skupni odsek | A03 | [App.tsx](../../src/App.tsx), TaskBoard tasks in tbody; [TaskBoard.tsx](../../src/TaskBoard.tsx), entries | Uspešno: mešana druga stran ima iste ID-je v obeh pogledih; pravilen vrstni red znotraj stolpcev. |
| R07 | Ohranjeno stanje | A04 | [App.tsx](../../src/App.tsx), ProjectView in TaskDetails; obstoječa navigacija | Uspešno: tabela/tabla, Escape, križec in nazaj, vrnjen fokus. |
| R08 | Ponastavitev projekta | A05 | [App.tsx](../../src/App.tsx), ključ project.id in lokalni useState | Uspešno: oba projekta, povratek, osvežitev v pogledu Tabla; brez novih vrednosti v URL-ju ali shrambi. |
| R09 | Točen status | A01–A05, D02 | [TaskPagination.tsx](../../src/TaskPagination.tsx), role=status | Uspešno: točno besedilo s pomišljajem, vmesne in zadnje strani. |
| R10 | Praznina | A06 | [App.tsx](../../src/App.tsx), total/prazni prikaz; [TaskPagination.tsx](../../src/TaskPagination.tsx), status/gumbi | Uspešno: oba prazna projekta, prazen filter, all/2/5/10, vrnitev na prvo stran. |
| R11 | Pravilni števci | A03/A06 | [App.tsx](../../src/App.tsx), counts/tasks.length; [TaskBoard.tsx](../../src/TaskBoard.tsx), entries.length | Uspešno: povzetek 7/8/8 ostane enak; stolpci štejejo samo odsek, tudi ničle. |
| R12 | Regresije, brez zapisov, širina | A04/A07, skupni testi | [App.tsx](../../src/App.tsx), [styles.css](../../src/styles.css), obstoječi API/podrobnosti | Uspešno: 38 izhodiščnih + 8 razvojnih + 7 lastnih testov; 4 vizualni prikazi brez širjenja strani. |

## Odprta vprašanja in omejitve

- »Osvežitev« pomeni ponovno nalaganje dokumenta v brskalniku. Novega gumba ne dodajamo.
- Navigacija med nedokončanim nalaganjem in sočasne spremembe podatkov ostanejo
  znotraj izhodiščnega obsega; dodatnega usklajevanja podatkov ne uvajamo.
- Končni skriti testi niso dostopni in jih ni mogoče navesti kot opravljene.
- Podpora je preverljiva v nameščenem Chromiumu; drugi brskalniki niso na voljo.
- Znanih neizpolnjenih zahtev R01–R12 po opravljenih preverjanjih ni.
  To ne pomeni izčrpnega preverjanja vseh možnih vhodov ali skritih testov.

## Zgodovina sprememb

- 2026-09-23 (UTC), v1: začetna specifikacija pred spremembami kode; načrt A01–A07
  dopolnjuje štiri skupne razvojne scenarije, izvedene na dveh širinah.
- 2026-09-23 (UTC), v2: načrtovano sledljivost nadomeščajo dejanska mesta kode in
  uspehi končnega zagona. Funkcionalna pravila niso bila spremenjena.
  Vmesni popravek nezdružljive testne trditve je opisan v verification.md.
