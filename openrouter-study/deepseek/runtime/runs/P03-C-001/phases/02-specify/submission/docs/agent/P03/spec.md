# P03 — Iskanje in sestavljeni filtri

Specifikacija funkcionalnosti za `docs/agent/P03`. Izvirne zahteve so v
`task/instructions.md` (R01–R12) in ostajajo merilo tudi, če jih ta dokument
izpusti. Pravila: `PROJECT_RULES.md`; ustava: `.specify/memory/constitution.md`;
potrjeni dizajn: `docs/dizajn.md`; skupna predloga: `task/specification-template.md`.
Datum: 2026-10-13.

## Problem in kontekst

Uporabnik želi v trenutnem projektu hitro najti opravila in jih zožiti po
stanju ter odgovorni osebi, ne da bi zapustil Folio. Zdaj sta na voljo
preglednica in tabla vseh opravil projekta, brez iskanja in filtrov.

Predvidena sprememba: iskalni vnos, izbirnik stanja in izbirnik odgovorne
osebe ter gumb za počistitev. Oba pogleda prikazujeta samo ustrezna opravila
v izvornem vrstnem redu; števci in pregled stanj štejejo prikazane rezultate.

## Vhodi, dejanja in izidi

Podatkovna polja ostanejo nespremenjena (`shared/types.ts`): `Task` (`id`,
`projectId`, `title`, `description`, `status`, `assignee`, `dueDate`) in
`Project` (`id`, `name`). Opravila se berejo prek
`GET /api/projects/{projectId}/tasks`. Stanje iskanja in filtrov je lokalno
stanju pogleda trenutnega projekta; podatki se ne spreminjajo.

Dogovor o vmesniku (iz navodil):
- iskalni input `type=search` z imenom Išči opravila,
- `select` Filter stanja z možnostmi all/todo/in_progress/done,
- `select` Filter odgovorne osebe z možnostjo all ali točnim imenom,
- gumb Počisti filtre,
- element `role=status` z `aria-label="Rezultati filtriranja"` in besedilom
  Prikazano: N od M.

Scenariji:
- P1: uporabnik vpiše besedo in izbere stanje; prikaz se zoži po logičnem IN.
- P2: uporabnik preklopi pogled; filtri in prikazani ID-ji se ohranijo.
- P3: uporabnik preklopi projekt; iskanje in oba filtra se ponastavijo.
- P4: brez zadetkov v nepraznem projektu; prikaže se Ni zadetkov., pogleda
  ostaneta uporabna. Napaka branja uporabi obstoječe sporočilo o napaki.

## Zahteve in pravila

Simbole in predpostavke:
- T = vsa opravila trenutnega projekta v izvornem vrstnem redu; M = |T|.
- F = (q, s, a): q iskalni niz, s stanje iz {all, todo, in_progress, done},
  a oseba iz {all} ∪ imen; privzeto q = "", s = all, a = all.
- norm(x) = x pretvorjen v Unicode NFD, brez znakov U+0300–U+036F, male črke.
- joined(t) = norm(id + " " + title + " " + description + " " + assignee).
- words(q) = neprazne besede q, ločene po belinah.
- match(t, q) = vsaka w ∈ words(q) je dobesedni podniz joined(t); pri praznem
  words(q) je match resničen. Ločila so navadno besedilo, ne regularni izrazi.
- visible(t) = match(t, q) ∧ (s = all ∨ t.status = s) ∧ (a = all ∨ t.assignee = a);
  oseba se primerja natančno, brez norm.

Splošno pravilo: prikazani niz je [t ∈ T : visible(t)] v izvornem vrstnem redu.
Preglednica in tabla prikazujeta iste ID-je; števci štejejo prikazana
opravila; filtriranje ne spremeni izvornega vrstnega reda ali polj podatkov.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju je F privzet in prikazani so vsi t ∈ T v izvornem vrstnem redu. | Test začetnega stanja: vnos prazen, izbirnika all, vsa opravila. |
| R02 | Iskanje pregleda joined(t); norm odstrani kombinacijska znamenja, zato se č in c ter velikost črk ne razlikujeta. | Testi s č/Č, velikimi in malimi črkami v vseh štirih poljih. |
| R03 | Vse besede iz words(q) so dobesedni podnizi; vrstni red besed ni pomemben; prazen vnos ne omejuje. | Testi za večbesedni vnos, obrnjen vrstni red, ločila in prazen vnos. |
| R04 | s in a delujeta z match po logičnem IN; a se primerja natančno, brez norm. | Testi kombinacij stanje × oseba × iskanje. |
| R05 | Izbirnik oseb = { all } ∪ različna neprazna imena iz T, tudi če so trenutno skrita; preklop projekta stare osebe ne ohrani. | Testi možnosti ob skritih opravilih in po preklopu projekta. |
| R06 | IDs(preglednica) = IDs(tabla) = [t : visible(t)]; preklop pogleda ohrani F; stolpec stanja c prikaže [t : visible(t) ∧ t.status = c]. | Testi primerjave pogledov in stolpcev ob filtrih. |
| R07 | Preklop projekta p → q nastavi F := privzeto; filtri se nikoli ne uporabijo na podatkih drugega projekta. | Test: nastavi filtre, preklopi projekt, preveri prazne kontrole in vsa opravila. |
| R08 | Osvežitev strani nastavi F := privzeto; F se ne shranjuje v URL ali trajno shrambo brskalnika. | Test osvežitve in pregled, da URL ter shramba ne vsebujeta F. |
| R09 | `role=status` kaže Prikazano: N od M., kjer je N število opravil z visible(t) in M velikost T; pregled stanj in števci stolpcev štejejo prikazana opravila. | Testi števcev ob filtrih, brez zadetkov in v praznem projektu. |
| R10 | T ≠ ∅ ∧ N = 0 ⇒ sporočilo Ni zadetkov. in oba pogleda ostaneta uporabna; T = ∅ ⇒ običajno prazno stanje in števec 0 od 0. | Testi brez zadetkov in praznega projekta. |
| R11 | Počisti filtre nastavi F := privzeto in prikaže vsa opravila; uporaba filtrov ne spremeni vrstnega reda ali polj. | Test gumba ter primerjava podatkov pred in po filtriranju. |
| R12 | Obstoječa navigacija in bralne podrobnosti delujeta; filtriranje ne pošlje POST/PATCH/PUT/DELETE na /api/; Folio in prikaz pri ozki širini ostaneta. | Regresijski testi, nadzor omrežnih klicev, pregled pri širini 390 px. |

## Izvedba in sledljivost

Tabela se dopolni med izvedbo; izid se vpiše šele po dejansko izvedenem
preverjanju. Načrtovana lastna preverjanja: `tests/agent/` (ločeni testi te
naloge), poleg skupnih testov izhodišča. Podrobnosti kode in testov se tu ne
podvajajo; povezave se dodajo ob izvedbi.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | F je privzet, prikazani vsi t ∈ T | načrtovan: privzeto stanje ob nalaganju | src/App.tsx (ProjectView) | ni še izvedeno |
| R02 | norm in joined po R02 | načrtovan: č/Č in velikost črk | se določi ob izvedbi | ni še izvedeno |
| R03 | dobesedni podnizi vseh besed | načrtovan: večbesedni vnos in ločila | se določi ob izvedbi | ni še izvedeno |
| R04 | logični IN s, a; natančna oseba | načrtovan: kombinacije filtrov | se določi ob izvedbi | ni še izvedeno |
| R05 | možnosti oseb iz celotnega T | načrtovan: skrita opravila in preklop projekta | se določi ob izvedbi | ni še izvedeno |
| R06 | enaki ID-ji in ohranjeni F ob preklopu pogleda | načrtovan: preglednica proti tabli | src/TaskBoard.tsx, src/App.tsx | ni še izvedeno |
| R07 | preklop projekta ponastavi F | načrtovan: preklop projekta s filtri | src/App.tsx | ni še izvedeno |
| R08 | F ni v URL-ju ali trajni shrambi | načrtovan: osvežitev strani | se določi ob izvedbi | ni še izvedeno |
| R09 | Prikazano: N od M. in števci | načrtovan: števci ob filtrih | src/App.tsx, src/TaskBoard.tsx | ni še izvedeno |
| R10 | Ni zadetkov. / prazno stanje 0 od 0 | načrtovan: brez zadetkov in prazno | se določi ob izvedbi | ni še izvedeno |
| R11 | počistitev vrne privzeto stanje | načrtovan: gumb Počisti filtre | se določi ob izvedbi | ni še izvedeno |
| R12 | navigacija, podrobnosti, brez pisanja, Folio | načrtovan: regresija in nadzor omrežja | src/App.tsx, src/TaskDetails.tsx, src/styles.css | ni še izvedeno |

## Odprta vprašanja in omejitve

- Končnih ocenjevalnih testov ni na voljo; preverjanje temelji na skupnih
  testih izhodišča in lastnih testih v `tests/agent/`.
- Razporeditev novih kontrol in besedilo zunaj dogovora o vmesniku nista
  predpisana; ohranijo se Folio, dostopna imena in oznake iz izhodišča.
- Med nezaključenim nalaganjem in sočasnimi spremembami podatkov brez
  osvežitve obsega ne širimo prek obstoječih regresijskih zahtev.
- Oseba se primerja natančno (brez norm), zato se različni zapisi istega
  imena ne združujejo; v nalogah z izbiro so imena neprazna in različna od all.
- Stanje funkcionalnosti je lokalno trenutnemu projektu; brez URL-ja in
  trajne shrambe, razen kjer zahteva določa drugače. Brez novih odvisnosti,
  zapisovalnih API-jev in posegov v infrastrukturo.
