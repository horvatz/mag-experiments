# P03 — Iskanje in sestavljeni filtri

Različica 1.0; pripravljeno za predajo implementerju. Avtor specifikacije je pregledal navodila, tipe, kodo in vsebino testov; aplikacije in testov ni zaganjal.

## Problem in kontekst

Uporabnik želi v trenutnem projektu iskati opravila in hkrati omejiti stanje ter odgovorno osebo. Izhodiščni `ProjectView` prikazuje celoten seznam, `TaskBoard` ga razdeli v tri stolpce; filtrov še ni. Sprememba doda lokalno filtriranje ob ohranitvi Folio iz `docs/dizajn.md`, navigacije in bralnih podrobnosti. Obvezni vir so vse zahteve R01–R12 iz `task/instructions.md` in `PROJECT_RULES.md`; ta dokument jih ne nadomešča ali oži.

## Vhodi, dejanja in izidi

`shared/types.ts` določa `Project { id, name }` in `Task { id, projectId, title, description, status, assignee, dueDate }`. Vsa navedena polja so nizi; `status` je `todo | in_progress | done`. Opravila se izbirajo po enkratnem `id`, naslovi se lahko ponavljajo. Število je poljubno (0, 1, več kot 10), zaporedje določa odgovor API, besedila lahko vsebujejo Unicode in ločila, datumi so veljavni. Imena oseb so v domeni naloge neprazna in niso rezervirani `all`.

Vir ostanejo GET `/api/projects`, GET `/api/projects/:projectId/tasks` in GET `/api/tasks/:id`, z obstoječim kodiranjem ID-jev. Filtri se računajo nad celotnim naloženim seznamom trenutnega projekta; ne nad začetnimi podatki, naslovi ali že filtriranim seznamom.

| Kontrola oziroma izhod | Pogodba |
| --- | --- |
| Iskanje | `input type="search"`, dostopno ime `Išči opravila`, privzeto `""`. |
| Stanje | HTML `select`, dostopno ime `Filter stanja`, vrednosti `all`, `todo`, `in_progress`, `done`; privzeto `all`. Slovenske oznake stanj ostanejo Pripravljeno, V delu, Končano. |
| Oseba | HTML `select`, dostopno ime `Filter odgovorne osebe`, vrednosti `all` in točna izvorna imena; privzeto `all`. |
| Ponastavitev | Gumb `Počisti filtre` z enim dejanjem ponastavi vse tri kontrole. |
| Rezultati | Element `role="status"`, `aria-label="Rezultati filtriranja"`, natančno besedilo `Prikazano: N od M.` z eno končno piko. |

Spremembe kontrol posodobijo prikaz, ne polj opravil. Preklop pogleda in odpiranje/zapiranje podrobnosti znotraj istega projekta ohranita filtre; menjava projekta (tudi vrnitev v prejšnjega) in osvežitev jih ponastavita. Filtriranje nima potrjevanja ali posebnega preklica. Escape oziroma zapiranje podrobnosti ohrani obstoječo navigacijo in vračanje fokusa. Napaka GET ostane obstoječi `LoadError` s `Poskusi znova`; nalaganje ostane `Loading`, brez prikaza podatkov drugega projekta ali lažnega sporočila o nič zadetkih pred uspešnim nalaganjem.

## Zahteve in pravila

Naj bo `T_p` urejeno zaporedje vseh opravil projekta `p`, `q` iskalni niz, `s` stanje in `a` izbrana oseba. Privzeto stanje je `F0 = ("", all, all)`. Pravila so splošna in neodvisna od spodnjih testnih primerov.

```text
norm(x) = x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
H(t) = norm([t.id, t.title, t.description, t.assignee].join(' '))
W(q) = norm(q).split(/\s+/).filter(w => w.length > 0)
ustreza(t,q,s,a) = W(q).every(w => H(t).includes(w))
                   AND (s = all OR t.status = s)
                   AND (a = all OR t.assignee = a)
V = T_p.filter(t => ustreza(t,q,s,a))
A_p = { all } ∪ distinct({ t.assignee : t ∈ T_p AND t.assignee ≠ "" })
M = |T_p|; N = |V|; C_k = |{ t ∈ V : t.status = k }|
```

`includes` pomeni dobesedni podniz, ne regularnega izraza. Prazna množica besed ustreza vsakemu opravilu. Normalizacija velja samo pri iskanju; vrednosti in deduplikacija imen v izbirniku uporabljajo natančno primerjavo brez odstranjevanja diakritike, spreminjanja velikosti črk ali obrezovanja imen. Vrstni red oseb ni predpisan. `V` je stabilno podzaporedje `T_p`: brez sortiranja ali mutacije. Preglednica ohrani ta vrstni red, tabla pa vrstni red znotraj posameznega stanja; celoten vrstni red DOM na tabli zaradi združevanja po stanjih ni nujno enak preglednici.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Po nalaganju `F=F0`, `V=T_p`, vse kontrole privzete; brez omejitve števila opravil. | D01 in S1: kontrolne vrednosti ter urejeni ID-ji proti GET. |
| R02 | `norm` se uporabi na iskanju in združenih štirih poljih; datumi in stanje niso iskalna polja. | D01 delno; S2 preveri vsako polje, č/Č/c in razstavljeni Unicode. |
| R03 | Vse besede iz `W(q)` morajo ustrezati, tudi če so v različnih poljih; vrstni red in dodatne beline ne vplivajo. Ločila ostanejo dobesedna, prazen/belinski vnos ne omeji. | S2: več besed, obrnjen vrstni red, tabulator/nova vrstica, `.*`, `[`, `=SUM(A1)`. |
| R04 | `ustreza` sestavi tri pogoje z IN; `all` izključi samo svoj filter, ime se ujema natančno. | D02 delno; S3 s hkratnim iskanjem/stanje/oseba in razlikami v imenih. |
| R05 | Možnosti so natanko `A_p` iz celotnega projekta tudi ob nič zadetkih; brez duplikatov in stare izbrane osebe po menjavi. | S3/S4: skrita opravila, podvojena ter podobna imena, različni osebi v projektih. |
| R06 | Množici ID-jev obeh pogledov sta `ids(V)`; vsak stolpec vsebuje natanko `V.filter(status=k)`. Preklop ne spremeni `(q,s,a)`. | D02 in S5: oba pogleda, vsak stolpec, vrednosti kontrol. |
| R07 | Ob `p' ≠ p` se filtri ponastavijo na `F0`; prikaz uporablja izključno `T_p'`. Ponastavitev velja tudi ob vrnitvi v prejšnji projekt. | S4 ter obstoječa regresija menjave projekta med nalaganjem. |
| R08 | Ob osvežitvi `F=F0`, tudi na neposrednem URL-ju table/podrobnosti. Filtrov ni v URL-ju, localStorage, sessionStorage ali drugi trajni shrambi. Obstoječi `view=board` ostane dovoljen. | S4: osvežitev in branje kode/shrambe/URL-ja. |
| R09 | Rezultatski status kaže `N` in `M`; pregled stanj z `aria-label="Pregled stanj opravil"` in vsi števci stolpcev kažejo `C_k`, tudi nič. | D04 delno; S5 primerja rezultate, pregled stanj in vse stolpce. |
| R10 | Če `M>0 ∧ N=0`, je vidno `Ni zadetkov.` v obeh pogledih; filtri, čiščenje in preklop ostanejo uporabni. Če `M=0`, status kaže `Prikazano: 0 od 0.` in ostane običajno prazno stanje. | D03 delno; S6. Prazna preglednica: `V tem projektu še ni opravil`, brez tabele; prazna tabla: vsi trije stolpci z `Ni opravil v tem stanju.`. |
| R11 | `clear(q,s,a)=F0` v enem dejanju in `V=T_p`. Filtriranje ter čiščenje ne spreminjata vrstnega reda ali kateregakoli polja izvornih opravil. | D03 delno; S1/S3: očisti vse tri nastavljene kontrole, primerjaj celoten vrstni red in izvorne vrednosti. |
| R12 | Ohranjeni navigacija, podrobnosti po ID, Folio, tipkovnica, `data-task-id` vrstic/kartic ter dostopna imena pogledov/stolpcev. Nobeno filtriranje ne pošlje POST/PATCH/PUT/DELETE na `/api/`. Pri 390 px ni vodoravne razširitve cele strani; notranje drsenje je dovoljeno. Nova dejanja ob opravilu morajo biti zunaj povezave. | D04 delno, S7 in skupne regresije; mrežni nadzor vseh filtrskih dejanj, pregled videza in širine. |

## Izvedba in sledljivost

Predlagana mesta temeljijo na prebrani kodi, niso dokaz že izvedene spremembe. `ProjectView` je že vpet s `key={project.id}`: lokalno stanje v njem omogoča ponastavitev projekta brez ponastavljanja ob menjavi `view`. Isti izračun `V` naj napaja preglednico, `TaskBoard` in pregled stanj; `T_p` ostane vir oseb in imenovalca `M`. `TaskBoard` že izračuna stolpčne števce iz prejetih opravil. Obstoječi `useResource` loči rezultate po poti/poskusu in prekliče zastarele zahteve; to vedenje se ohrani. Pripravljene funkcije `updateTask` v `src/api.ts` filtriranje ne uporablja.

`D01–D04` pomenijo obstoječe teste z istimi oznakami v `tests/development/P03.spec.ts`. Scenariji S1–S7 so načrt dodatnega preverjanja, ne že napisani ali izvedeni testi:

- **S1 — splošni podatki:** 0, 1 in več kot 10 opravil, drugačni ID-ji, enaki naslovi, nesortirano zaporedje; privzeti prikaz, filtriranje in čiščenje ohranijo ustrezno podzaporedje ter polja.
- **S2 — iskanje:** zadetek iz vsakega posameznega polja; sestavljene besede čez polja; Unicode NFD, velikost črk, diakritika, beline, dobesedna ločila in primer, kjer ena od več besed manjka.
- **S3 — kombinacije/osebe:** vsi trije filtri hkrati, vsako stanje, `all`, natančna različna imena (npr. `Črt`, `Crt`, `črt`), duplikati, nespremenjene možnosti pri skritih opravilih, čiščenje vseh treh kontrol.
- **S4 — življenjska doba:** filtriraj A, preklopi v B in nazaj; preveri privzete vrednosti in osebe. Osveži filtrirano preglednico/tablo; URL/shramba ne vsebujeta filtrov.
- **S5 — pogledi/števci:** z istim sestavljenim filtrom izmenjuj pogleda; preveri množico ID-jev, urejene ID-je vsakega stolpca, stanje kontrol, `N/M` in vse tri `C_k`.
- **S6 — praznina:** v nepraznem projektu nič zadetkov v obeh pogledih, nato čiščenje; ločeno res prazen projekt in oba prazna projekta, običajni prazni prikazi, navigacija in 0 od 0.
- **S7 — regresija/videz:** filtrirani zadetki z enakim naslovom odprejo prave podrobnosti po ID; zapiranje, Escape, fokus, napake GET in ponovitev. Mrežni nadzor vseh filtrskih dejanj; Folio ter oba pogleda in kontrole pri 390 px, tudi z dolgimi besedili.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | F0 in urejeni vsi ID-ji | D01, S1 | `src/App.tsx`: ProjectView, začetno stanje in prikaz | Ni izvedeno; prebran začetni prikaz brez filtrov. |
| R02 | norm/H | D01 (delno), S2 | `src/App.tsx`: predlagani izračun V ali nov pripomoček v src/ | Ni izvedeno; iskalne logike v izhodišču ni. |
| R03 | W in every/includes | S2 | Enak predlagani izračun V | Ni izvedeno. |
| R04 | IN in točna oseba | D02 (delno), S3 | `src/App.tsx`: kontrole in izračun V | Ni izvedeno. |
| R05 | A_p | S3, S4 | `src/App.tsx`: izbirnik iz celotnega tasks | Ni izvedeno. |
| R06 | ids(V), V po stanju | D02, S5 | `src/App.tsx`: preklop/render; `src/TaskBoard.tsx`: entries | Ni izvedeno; prebran obstoječi preklop in stolpci. |
| R07 | sprememba p → F0 | S4; baseline: switching project during loading… | `src/App.tsx`: key projekta; `src/useResource.ts`: current/abort | Ni izvedeno; ključ in zaščita zahtev potrjena z branjem. |
| R08 | refresh → F0 | S4 | `src/App.tsx`: lokalno stanje; `src/navigation.ts`: URL | Ni izvedeno. |
| R09 | N/M in C_k | D04 (delno), S5 | `src/App.tsx`: status/counts; `src/TaskBoard.tsx`: column-count | Ni izvedeno; začetni counts šteje vse tasks. |
| R10 | M=0 ločeno od N=0 | D03 (delno), S6; baseline: empty project/empty board | `src/App.tsx`: prazno stanje; `src/TaskBoard.tsx`: board-empty | Ni izvedeno; obstoječi prazni prikazi prebrani. |
| R11 | clear → F0, nespremenjeni T_p | D03 (delno), S1, S3 | `src/App.tsx`: ponastavitev in stabilno filtriranje | Ni izvedeno. |
| R12 | regresija, samo branje, 390 px | D04 (delno), S7; `tests/baseline.spec.ts`, `tests/api.spec.ts` | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/navigation.ts`, `src/styles.css` | Ni izvedeno; opravljeno samo branje kode in pravil dizajna. |

Implementer izvede skupne preglede (`npm run lint`, `npm run build`, `npm test`) in smiselna dodatna preverjanja v `tests/agent/`; pred daljšim zagonom preveri časovni proračun. V svojih dokumentih v `docs/agent/` poveže R01–R12 s končnimi datotekami, dejanskimi imeni testov, ukazi, izidi in dokazili ter navede neizvedene scenarije. Specifikacija ostaja v lasti avtorja; popravki se vrnejo avtorju v nadaljevano sejo.

## Odprta vprašanja in omejitve

Ni blokirajočih nejasnosti. Združevanje iskalnih polj z enim presledkom je sprejeta razlaga »združenih polj«; ne ustvarja umetnih besed prek mej polj. Besedilo in razporeditev novih kontrol zunaj izrecne pogodbe nista predpisana. Dodatni obstoječi znački/napisi ne smejo zavajati glede prikazanih rezultatov; obvezni števci so določeni v R09.

Navigacije med nezaključenim nalaganjem ter sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresij. Strežnik, skupni tipi, začetni podatki, odvisnosti, nastavitve, navodila in skupni testi ostanejo samo berljivi. UI bere samo javni `/api/`, ne uporablja `/__test/`, razvojnih pripomočkov ali trajne lokalne kopije podatkov; testne kontrole sme uporabljati le testni program. Nobenih novih zapisovalnih API-jev, drugih projektov, povezovalnikov ali oddaljenih repozitorijev.

V tej fazi niso bili izvedeni testi, zagon aplikacije ali vizualni pregled. Razvojni D01–D04 pokrivajo le del zahtev; končni nedostopni testi niso dokazani. Sprememb implementacije ni. Zgodovina je v `docs/agent/specification-history.md`.
