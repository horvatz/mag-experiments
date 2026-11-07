# Specifikacija razvoja: Stabilno razvrščanje z dvema ključema (P04)

Različica 1.1 (faza specifikacije zaključena; implementacije in preverjanja še ni izvedel nihče).
Predloga: `task/specification-template.md`. Zahteve iz `task/instructions.md` ostajajo obvezne.

## Problem in kontekst

Uporabnikov namen: v projektu s seznamom opravil želi uporabnik v preglednici in na tabli
naročiti vrstni red opravil po dveh ključih. Primarni ključ določa glavni vrstni red,
sekundarni razreši izenačenja, vsak ima svojo neodvisno smer. Izvorni vrstni red mora biti
vedno dosegljiv, izbira `original` na primarnem ključu pa mora vrniti natanko vrstni red,
kot ga je vrnil API.

Začetno delovanje: `src/App.tsx` prebere `/api/projects/{id}/tasks` prek `useResource` in
opravila izriše v prejetem vrstnem redu; `src/TaskBoard.tsx` jih razdeli v tri stolpce po
stanju, znotraj stolpca v prejetem vrstnem redu. Kontrol za razvrščanje ni. Podrobnosti
opravila so v `src/TaskDetails.tsx` in se odpirajo prek usmeritve v URL-ju.

Predvidena sprememba: dodati štiri kontrole in gumb za ponastavitev ter razvrščeno polje
uporabiti kot projekcijo pri izrisu preglednice in table. Razvrščanje ne sme pisati
podatkov, spreminjati objektov opravil ali uvajati trajne shrambe.

## Vhodi, dejanja in izidi

Podatkovna polja (nespremenjen `shared/types.ts`): `Task { id, projectId, title,
description, status: todo | in_progress | done, assignee, dueDate }`, `Project { id, name }`.
Datumi so veljavni `YYYY-MM-DD`; `title`, `assignee` in `description` so navadno besedilo,
tudi z Unicode znaki in ločili; ID-ji so enkratni v projektu; naslovi so lahko enaki.
Vsako opravilo pripada svojemu projektu. Projekta sta lahko prazna.

Vhodno polje opravil projekta je T = (t0, t1, ..., t(n-1)) v vrstnem redu, kot ga vrne
`GET /api/projects/{id}/tasks`. Izvorni vrstni red pomeni natanko T.

Kontrole (dogovor o vmesniku):
- `select` z dostopnim imenom `Primarni ključ`, vrednosti možnosti: `original`, `title`, `assignee`, `status`, `dueDate`.
- `select` z dostopnim imenom `Primarna smer`, vrednosti: `asc`, `desc`.
- `select` z dostopnim imenom `Sekundarni ključ`, vrednosti: `none`, `title`, `assignee`, `status`, `dueDate`.
- `select` z dostopnim imenom `Sekundarna smer`, vrednosti: `asc`, `desc`.
- gumb z dostopnim imenom `Izvorni vrstni red`.
Vidna besedila možnosti niso predpisana; vrednosti, ki jih izbirajo skupni testi, so zgornje.

Dejanja in pričakovano stanje:
- Izbira ključa ali smeri: takojšnja sprememba projekcije; stanje ostalih kontrol nespremenjeno.
- Klik na `Izvorni vrstni red`: vse štiri kontrole na privzete vrednosti, prikaz T.
- Preklop pogleda (`Preglednica`/`Tabla`): ohrani vse štiri nastavitve.
- Odpiranje podrobnosti in zapiranje z `Escape`: ne spremeni nastavitev ne vrstnega reda.
- Menjava projekta: ponastavi vse štiri nastavitve in prikaže T novega projekta.
- Osvežitev strani: privzete nastavitve in T.
- Napaka branja: obstoječi `LoadError` z možnostjo ponovnega poskusa; razvrstitev se ne spremeni.
- Preklic/klik brez izbire: stanje ostane nespremenjeno (select ima vedno veljavno vrednost).

## Pojmi in predikati

Simboli:
- T = izvorno polje opravil projekta; idx(t) = indeks t v T (0-based).
- S = razvrščeno polje (projekcija), ki se izriše v preglednici; S znotraj stanja st = elementi S s stanjem st v relativnem vrstnem redu iz S.
- norm(x) = NFD normalizacija, odstranitev združevalnih znakov v obsegu U+0300 do U+036F, male črke (toLowerCase).
- lex(a, b) = -1, če norm(a) < norm(b); 1, če norm(a) > norm(b); sicer 0. Primerjava je leksikografska po UTF-16 kodnih enotah (operatorja < in >), brez `Intl.Collator`, brez jezikovnih pravil in brez številskega razvrščanja (npr. "Alfa 10" pred "alfa 2").
- rank(todo) = 0, rank(in_progress) = 1, rank(done) = 2.
- cmpDate(a, b) = -1, če a < b; 1, če a > b; sicer 0 (za veljavne YYYY-MM-DD je to kronološko).
- Za izbrana ključa: P(t, u) primerjava po primarnem ključu, S(t, u) po sekundarnem ključu; P in S sta enaki funkciji glede na izbrani ključ.
- Smeri: dP, dS v {+1, -1}; asc = +1, desc = -1.
- E(t, u) = 0, če je primarni ključ `original` (izjema je del formule); sicer P(t, u), če P(t, u) != 0; sicer dS * S(t, u), če je sekundarni ključ izbran; sicer 0.
- Celotna primerjava: cmp(t, u) = idx(t) - idx(u), če je primarni ključ `original`; sicer dP * E(t, u), pri cmp(t, u) == 0 pa idx(t) - idx(u). S je permutacija T, urejena z cmp.
- Pri primarnem ključu `original` velja S = T ne glede na sekundarni ključ in obe smeri; izjema je zajeta že v formulah za E in cmp.

Predpostavke: `Array.prototype.sort` je stabilen, vendar stabilnost ne sme biti odvisna od
tega: cmp ob izenačenju vrne idx razliko. `desc` se uporabi samo kot predznak primerjave
izbranega ključa; polja se nikoli ne obrača po razvrščanju.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto: primarni = original (dP = +1), sekundarni = none (dS = +1); S = T; kontrole ob izrisu kažejo te vrednosti. | D01 (prvi del, `expectIds(webIds())`); pregled vrednosti select v DOM. |
| R02 | Za primarni ali sekundarni ključ title/assignee velja P(t, u) = lex(t.polje, u.polje). | D01 (title); lastni test z velikostjo črk, šumniki in "Alfa 10" pred "alfa 2". |
| R03 | status: P = rank(t.status) - rank(u.status); dueDate: P = cmpDate(t.dueDate, u.dueDate). | D02 (status); D03 (dueDate). |
| R04 | dP se uporabi le kot predznak primerjave izbranega ključa; izenačeni ohranijo idx vrstni red (brez reverse celotnega polja). | D02 (enaka naslova web-02/web-03); lastni test desc z enakimi ključi. |
| R05 | Sekundarni ključ se upošteva le ob P(t, u) = 0; dS je neodvisen od dP. | D02 (status + dueDate desc); lastni test asc/desc kombinacij. |
| R06 | Ob P = 0 in S = 0 velja idx(t) - idx(u); sekundarni ključ sme biti enak primarnemu brez dodatnega obrata; primarni original vedno vrne T. | D01, D04; lastni test title+title desc in original+dueDate desc. |
| R07 | Stolpci table so vedno [Pripravljeno, V delu, Končano]; znotraj stolpca je vrstni red S znotraj stanja st. | D03 (`columnIds` za Pripravljeno: web-07, web-02, web-04, web-08); lastni test z desc. |
| R08 | Preklop pogleda ohrani vse štiri nastavitve; odpiranje/zapiranje podrobnosti ne ponastavi vrstnega reda. | Lastni test: nastavi ključe, preklopi tabla/preglednica, odpri/zapri podrobnosti, primerjaj S in kontrole. |
| R09 | Menjava projekta in osvežitev vrneta privzete vrednosti; nastavitve niso v localStorage, sessionStorage, piškotkih ali URL-ju (URL nosi le pogled). | Lastni test: `project("launch")`, ponovno nalaganje strani, pregled shrambe in URL-ja. |
| R10 | Gumb `Izvorni vrstni red` nastavi vse štiri kontrole na privzete vrednosti in S = T; n = 0 in n = 1 delujeta pri vseh ključih in smereh. | D04; lastni test s praznim projektom in projektom z enim opravilom za vse kombinacije. |
| R11 | Razvrščanje ne spremeni T, objektov, polj, članstva, povzetka in skupnih števil; med razvrščanjem ni zahtev, ki niso GET, in `saveRequests` ostane 0. | D04 (`readonly`); lastni test s primerjavo stanja pred/po in spremljanjem omrežja. |
| R12 | Vsak ID natanko enkrat v aktivnem pogledu; povezava odpre prave podrobnosti tudi pri enakih naslovih; ohranjeni `aria-label="Pregled stanj opravil"`, imena pogledov in stolpcev, `data-task-id`, bralne funkcije in videz Folio; nova dejanja zunaj povezave; pri 390 px ni vodoravnega prelivanja strani. | Skupni testi baseline in API, D01 do D04, lastni test z dvema enakima naslovoma in merjenje širine. |

## Izvedba in sledljivost

Vsi izidi so v fazi specifikacije neizvedeni; spodnja tabela je načrt, dokaze vnese
implementer po dejanskem zagonu.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | S = T in privzete vrednosti kontrol | D01, pregled DOM | `src/App.tsx` (`ProjectView`), nova pomožna datoteka za razvrščanje | Ni izvedeno. |
| R02 | lex po NFD in UTF-16 | D01, lastni test | pomožna funkcija `norm`/`cmpText` | Ni izvedeno. |
| R03 | rank in cmpDate | D02, D03 | pomožna funkcija primerjav | Ni izvedeno. |
| R04 | dP le v primerjavi, stabilnost | D02, lastni test | `cmp` s predznakom in idx izenačitvijo | Ni izvedeno. |
| R05 | sekundarni ključ ob izenačenju, dS | D02 | `cmp` | Ni izvedeno. |
| R06 | idx izenačitev, original = T | D01, D04, lastni test | `cmp`, veja `original` | Ni izvedeno. |
| R07 | fiksni stolpci, S znotraj stanja st | D03, lastni test | `src/TaskBoard.tsx` (`columns`, filter) | Ni izvedeno. |
| R08 | ohranitev nastavitev ob preklopu in podrobnostih | Lastni test | stanje kontrol v `ProjectView`, `src/navigation.ts` | Ni izvedeno. |
| R09 | ponastavitev ob projektu in osvežitvi | Lastni test | lokalno stanje brez trajne shrambe | Ni izvedeno. |
| R10 | gumb ponastavi vse štiri; n = 0, 1 | D04, lastni test | gumb in privzete vrednosti | Ni izvedeno. |
| R11 | samo projekcija, brez pisanja | D04 (`readonly`) | izračun S nad `tasks` brez mutacij | Ni izvedeno. |
| R12 | enkratni ID-ji, prave podrobnosti, Folio | baseline, API, D01 do D04, lastni test | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/styles.css` | Ni izvedeno. |

Predvideni ukazi za dokaze (izvede implementer): `npm run typecheck`, `npm run lint`,
`npm test -- tests/development/P04.spec.ts` in `npm test` za skupne teste izhodišča.

## Odprta vprašanja in omejitve

- Faza specifikacije ne izvaja aplikacije, testov ali pregleda videza; vsi izidi so zato "ni izvedeno" in jih mora vnesti implementer po dejanskem zagonu.
- Končni testi niso dostopni; preverjanje temelji na R01 do R12, skupnih testih D01 do D04 in lastnih testih implementerja.
- Predpostavka: vrednosti možnosti select so natanko angleški ključi (`original`, `title`, `assignee`, `status`, `dueDate`, `none`, `asc`, `desc`), ker jih skupni testi izbirajo po vrednosti.
- Predpostavka: stanje kontrol je lokalno stanje komponente; URL nosi le `view=board`.
- Predpostavka: `assignee` je vedno neprazno ime, različno od `all`; manjkajočih datumov ni treba podpirati.
- Nejasnost: točna postavitev in besedila novih kontrol niso predpisana; implementer jih umesti poleg `view-switch` in ohrani gradnike Folio.
- Omejitev: sočasne spremembe podatkov med nalaganjem in navigacije med nezaključenim nalaganjem niso del obsega.
