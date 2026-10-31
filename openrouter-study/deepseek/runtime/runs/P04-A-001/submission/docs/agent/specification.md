# P04 — specifikacija: Stabilno razvrščanje z dvema ključema

Različica 1.0. Predloga: `task/specification-template.md`. Zahteve: `task/instructions.md`.

## Problem in kontekst

Uporabnik želi na preglednici in tabli opravil nadzorovano razvrščanje po dveh
ključih (primarnem in sekundarnem) z neodvisnima smerema, pri čemer mora biti
razvrščanje stabilno in ne sme spreminjati podatkov. Izhodiščni Folio prikazuje
opravila v vrstnem redu, kot jih vrne `/api/projects/:id/tasks`, brez kontrol za
razvrščanje. Sprememba je projekcija seznama v `src/`; strežnik, skupni tipi in
skupni testi ostanejo nespremenjeni.

## Vhodi, dejanja in izidi

- Vhodna polja opravila: `id`, `projectId`, `title`, `assignee`, `status`
  (`todo`/`in_progress`/`done`), `dueDate` (veljaven `YYYY-MM-DD`).
- Dejanja: izbira primarnega ključa (`original`/`title`/`assignee`/`status`/
  `dueDate`) in smeri (`asc`/`desc`), izbira sekundarnega ključa (`none`/`title`/
  `assignee`/`status`/`dueDate`) in smeri, klik na `Izvorni vrstni red`, preklop
  pogleda Preglednica/Tabla, odpiranje/zapiranje podrobnosti, menjava projekta,
  osvežitev strani.
- Izid uspeha: preglednica in tabla prikažeta iste elemente v istem relativnem
  vrstnem redu; vrstni red se spremeni le kot projekcija; ni zahtev PATCH/POST.
- Preklic/napaka: privzete vrednosti ob neveljavnem vnosu niso potrebne, ker so
  kontrole zaprtega izbora; ob napaki branja se prikaže obstoječe stanje napake.

## Zahteve in pravila

Simboli: `T` = polje opravil iz API-ja, `i < j` pomeni izvorni indeks.
`norm(s)` = `s.normalize('NFD')`, odstranjeni znaki U+0300–U+036F, `toLowerCase()`.
`cmpK(a,b,k)` = primerjava po ključu `k` (besedilo: `norm` in nato `<`/`>` po
UTF-16; `status`: todo=0, in_progress=1, done=2; `dueDate`: kronološko).
`sort(T, p, dp, s, ds)` = urejanje s stabilnim comparatorjem:

```
cmp(a,b) = 0, če je p = original
         = dir(dp, cmpK(a,b,p)), če p ≠ original in cmpK(a,b,p) ≠ 0
         = dir(ds, cmpK(a,b,s)), če je primarni ključ enak, s ≠ none in cmpK(a,b,s) ≠ 0
         = 0 sicer (ohrani izvorni vrstni red)
dir(asc,x)=x, dir(desc,x)=-x; rezultat 0 ostane 0.
```

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno stanje: `p=original, dp=asc, s=none, ds=asc`; prikaz je natanko `T` v izvornem vrstnem redu. | Privzeti prikaz; kontrola vrednosti selectov. |
| R02 | Za `title`/`assignee` velja `cmpK` z `norm`; brez locale/številskega urejanja. | Test z Unicode/velikimi črkami/diakritiki. |
| R03 | `status` po rangu todo < in_progress < done; `dueDate` kronološko. | Test statusa in datumov, tudi neurejenih. |
| R04 | `desc` obrne le predznak neničelne primerjave ključa; izenačeni ostanejo v izvornem vrstnem redu. | Test stabilnosti pri enakih ključih in `desc`. |
| R05 | Sekundarni ključ se uporabi le, ko je `cmpK` primarnega 0; njegova smer je neodvisna. | Test z enakimi primarnimi in različnimi sekundarnimi vrednostmi. |
| R06 | Ob enakosti obeh ključev izvorni vrstni red; enak primarni in sekundarni ključ ne obrne ničesar; `p=original` vrne izvorni vrstni red ne glede na ostale kontrole. | Testi stabilnosti in `original`+sekundar. |
| R07 | Tabla ima stalne stolpce Pripravljeno/V delu/Končano; znotraj vsakega je relativni vrstni red istega `sort(T,…)`. | Test `columnIds` po razvrščanju. |
| R08 | Preklop pogleda ohrani vse štiri nastavitve; odpiranje/zapiranje podrobnosti ne ponastavi vrstnega reda. | Test preklopa in odpiranja podrobnosti. |
| R09 | Menjava projekta in osvežitev ponastavita nastavitve na privzete; stanje ni v `localStorage` niti v URL-ju. | Test menjave projekta, `reload`, pregled URL-ja in shrambe. |
| R10 | Gumb `Izvorni vrstni red` ponastavi vse štiri kontrole; prazen projekt in projekt z enim opravilom delujeta pri vseh ključih/smereh. | Test gumba ter praznega/enejskega projekta v vseh kombinacijah. |
| R11 | Razvrščanje ne spreminja polj, pripadnosti, skupnih števil ali izvornega polja; ne pošilja zapisov na API. | `readonly` (ni zahtev in `saveRequests=0`) ob razvrščanju. |
| R12 | Vsak ID prikazan natanko enkrat; enaki naslovi odpirajo prave podrobnosti po ID-ju; ohranjene bralne funkcije in videz. | Test enkratnosti, podrobnosti dveh enakih naslovov, skupni regresijski testi. |

Predpostavke: `dueDate` je veljaven koledarski datum `YYYY-MM-DD` (leksikografska
primerjava je takrat kronološka); `original` ni dovoljen kot sekundarni ključ
(zanj je `none`); kontrole so lokalno stanje komponente in se ne shranjujejo.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzeti `T` | `agent/R01…`, D01 | `src/sorting.ts` (`defaultSortSettings`, `sortTasks`) | glej `verification.md` |
| R02 | `norm` + UTF-16 | `agent/R02…` | `src/sorting.ts` (`normalizeText`, `compareKey`) | glej `verification.md` |
| R03 | rangi in datumi | `agent/R03…`, D02 | `src/sorting.ts` (`statusRank`, `compareKey`) | glej `verification.md` |
| R04 | predznak + stabilnost | `agent/R04…`, D04 | `src/sorting.ts` (`sortTasks`) | glej `verification.md` |
| R05 | sekundar le ob enakosti | `agent/R05…`, D02 | `src/sorting.ts` (`sortTasks`) | glej `verification.md` |
| R06 | izvorni vrstni red | `agent/R06…` | `src/sorting.ts` (indeks v `sortTasks`) | glej `verification.md` |
| R07 | stolpci in relativni vrstni red | `agent/R07…`, D03 | `src/App.tsx` (`sortedTasks` → `TaskBoard`) | glej `verification.md` |
| R08 | preklop in podrobnosti | `agent/R08…` | `src/App.tsx` (stanje v `ProjectView`) | glej `verification.md` |
| R09 | ponastavitev ob projektu/osvežitvi | `agent/R09…` | `src/App.tsx` (`key={project.id}`) | glej `verification.md` |
| R10 | gumb in robni primeri | `agent/R10…`, D04 | `src/SortControls.tsx`, `src/sorting.ts` | glej `verification.md` |
| R11 | brez zapisov | `agent/R11…`, D04 | `src/sorting.ts` (čista funkcija) | glej `verification.md` |
| R12 | enkratni ID-ji in podrobnosti | `agent/R12…` + baseline | `src/App.tsx`, `src/TaskBoard.tsx` | glej `verification.md` |

## Odprta vprašanja in omejitve

- Besedilo in postavitev novih kontrol nista predpisana; izbrane so slovenske
  oznake in obstoječi gradniki (`select`, `.button`).
- Končnih testov naloge ni mogoče zagnati; preverjanje je izvedeno z razvojnimi
  testi P04, lastnimi agentnimi testi in izhodiščnimi regresijskimi testi.
- Sočasne spremembe podatkov med nalaganjem niso del obsega (po navodilih).

## Zgodovina sprememb specifikacije

- 1.0: prva različica pred implementacijo.
