# P01 — Urejanje opravila

Različica 0.2, 2026-09-20. Stanje: implementirano in preverjeno; rezultati in omejitve so v [zapisu preverjanj](../verification.md).

## Problem in kontekst

Uporabnik želi popraviti naslov in stanje obstoječega opravila v aplikaciji Folio. Izhodiščni vmesnik prikazuje projekte, preglednico, tablo, števce in podrobnosti; v `src/TaskDetails.tsx` še nima urejanja. `src/api.ts` že vsebuje `updateTask(id, values)` za javni `PATCH /api/tasks/:id`.

Dopolnitev omogoči pot »Uredi« → sprememba naslova in stanja → »Shrani« ali »Prekliči« v podrobnostih izbranega opravila. Obstoječi gradniki, slovenska poimenovanja in [potrjeni dizajn Folio](../../dizajn.md) se ohranijo.

Merodajni so [izvirne zahteve R01–R10](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md) in [projektna načela](../../../.specify/memory/constitution.md). Ta dokument pokriva razdelke [skupne predloge](../../../task/specification-template.md); izpuščanje zahteve v razvojnem dokumentu je ne razveljavi.

## Vhodi, dejanja in izidi

- Identiteta: `Task.id`, ne naslov. Projekt določa `projectId`.
- Uredljivi polji: `title` (niz) in `status` ∈ {`todo`, `in_progress`, `done`}, prikazani kot Pripravljeno, V delu in Končano.
- Nespremenljiva polja v tej nalogi: `id`, `projectId`, `description`, `assignee`, `dueDate`; drugih opravil ne spreminjamo.
- »Uredi« je dejanje za trenutno izbrano, naloženo opravilo v podrobnostih. Odpre nov osnutek s shranjenima vrednostma, brez prejšnjih napak.
- Sprememba polj ureja le osnutek. »Shrani« preveri naslov in veljaven osnutek pošlje prek pripravljenega javnega API-ja.
- Uspeh: obe vrednosti sta shranjeni skupaj; obrazec se zapre in vsi prikazi odražajo shranjeni rezultat, tudi po osvežitvi strani.
- »Prekliči«: obrazec se zapre, osnutek in napake se zavržejo, zahteve za shranjevanje ni.
- Neveljaven naslov: napaka ob polju, brez zahteve za shranjevanje; veljaven popravek umakne napako.
- Zavrnitev strežnika: obrazec ostane odprt z vnosom in sporočilom o neuspehu; shranjeni podatki se ne spremenijo in ponovni poskus je omogočen.
- Čakanje: vidno stanje shranjevanja, obe polji ter gumba »Shrani« in »Prekliči« so onemogočeni; ni sočasnih zahtev za shranjevanje obrazca.

### Dogovor o uporabniškem vmesniku

Besedilno polje ima oznako »Naslov«, HTML `select` oznako »Stanje«, gumbi pa »Uredi«, »Shrani« in »Prekliči«. Napaka vnosa je povezana s poljem z `aria-describedby`; ob napaki ima polje `aria-invalid="true"`. Sporočila napak imajo `role="alert"`; prikaz čakanja ima `role="status"`. Besedilo sporočil jasno izraža razlog napake, dobesedna vsebina ni predpisana.

Ohranijo se `data-task-id` na vrsticah in karticah, poimenovani stolpci table, `aria-label="Pregled stanj opravil"`, vidni fokus ter obstoječa odzivna postavitev Folio.

## Zahteve in pravila

### Model sprememb stanja

Naj bo `P` preslikava identifikatorjev v strežniško shranjena opravila, `S` zadnje potrjene vrednosti, prikazane v aplikaciji, `i` identifikator urejanega opravila, `D=(title,status)` osnutek ter `m` način `ogled`, `urejanje` ali `shranjevanje`. `E` je napaka vnosa oziroma shranjevanja; `∅` pomeni odsotnost osnutka ali napake. Pred urejanjem sta `S` in `P` usklajena. Drugih sočasnih uporabniških sprememb ni.

`W={U+0020,U+0009,U+000A,U+000D}`. Funkcija `N(x)` odstrani samo najdaljši začetni in končni niz znakov iz `W`. Notranjih znakov ter vseh drugih robnih znakov, tudi U+00A0 (nedeljivi presledek), ne spremeni. `valid(x) ⇔ length(N(x)) > 0`. Navaden splošni Unicode trim zato ni ustrezno pravilo.

1. **Odprtje:** `(m=ogled, i) → (m'=urejanje, D'=(S[i].title,S[i].status), E'=∅)`; `P'=P` in `S'=S`.
2. **Vnos:** v načinu urejanja se spremeni samo `D`; `P'=P` in `S'=S`. Če je prikazana napaka obveznega naslova in `valid(D'.title)`, se ta napaka umakne.
3. **Neveljavno shranjevanje:** `¬valid(D.title) → m'=urejanje`, vidna napaka naslova, nič zahtev; `P'=P`, `S'=S`.
4. **Začetek shranjevanja:** veljaven osnutek sproži eno zahtevo za `i` z `{title:N(D.title),status:D.status}` in `m'=shranjevanje`. Dokler ni uspešnega odgovora, `S'=S`; uporabnik ne more spreminjati polj ali potrditi oziroma preklicati obrazca. Število sočasnih zahtev tega obrazca je največ ena.
5. **Uspeh:** strežnik potrdi obe vrednosti skupaj. `P'[i].title=N(D.title)` in `P'[i].status=D.status`; vsa druga polja `P[i]` in vsa opravila `P[j]` za `j≠i` ostanejo enaka. `S'` odraža potrjeni rezultat, `m'=ogled`, `D'=∅`, `E'=∅`. Ponovno branje po osvežitvi vrne isti rezultat.
6. **Zavrnitev:** strežnik ne zapiše podatkov: `P'=P`, `S'=S`, `D'=D`, `m'=urejanje`; `E'` jasno sporoči neuspeh. Ponovni veljaven poskus gre po pravilu 4, uspeh po pravilu 5.
7. **Preklic:** iz urejanja v ogled, `D'=∅`, `E'=∅`, `P'=P`, `S'=S`, nič zahtev. Naslednje odprtje vedno uporabi pravilo 1, tudi za drugo opravilo.

Za izbrani projekt `p` in stanje `s` je števec `C(p,s)=|{t ∈ S : t.projectId=p ∧ t.status=s}|`. Vrstica, kartica in podrobnosti uporabljajo iste potrjene vrednosti `S[i]`; kartica je v stolpcu `S[i].status`. Osnutek zato ne spremeni števcev ali pripadnosti stolpcu, uspeh pa jih uskladi.

### Sprejemni pogoji

Pravila veljajo za vse veljavne podatke in zaporedja znotraj obsega; spodnji scenariji so primeri preverjanja, ne nadomestilo pravil.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Pravilo 1: obrazec vsebuje shranjeni naslov in stanje opravila, izbranega po `id`, tudi ob enakih naslovih. | S1, S5: odpiranje po `data-task-id`, primerjava z API-jem. |
| R02 | Pravili 2 in 4: osnutek ne spremeni shranjenih podatkov, preglednice, table ali števcev pred uspehom. | S2, S6: primerjava DOM in API-ja med urejanjem ter zakasnjenim odgovorom. |
| R03 | `valid` in `N` sta natančno določena zgoraj; prazno/neveljavno ne pošlje zahteve; napaka ob veljavnem popravku izgine. | S3: mejni beli znaki, notranji presledki, U+00A0, dostopnost in štetje zahtev. |
| R04 | HTML `select` vsebuje vsa tri stanja; dovoljen je vsak prehod med njimi. | S4: vseh šest usmerjenih prehodov med različnimi stanji. |
| R05 | Pravilo 5 in formula `C`: atomarna sprememba obeh polj, zaprt obrazec, usklajeni prikazi ter trajnost po osvežitvi. | S4: API, podrobnosti, preglednica, tabla, števci in ponovno nalaganje. |
| R06 | Pravilo 7: preklic ne pošlje zahteve; ponovno odprtje ima shranjene vrednosti brez prejšnjih napak. | S2, S3: preklic po vnosu oziroma napaki in ponovno odprtje. |
| R07 | Pravilo 5 o ohranitvi: neurejena polja in druga opravila, tudi v drugem projektu ali z enakim naslovom, ostanejo enaka. | S5: primerjava celotnih API-posnetkov pred in po uspehu. |
| R08 | Pravilo 6: zavrnitev ohrani podatke in osnutek, prikaže neuspeh ter omogoči ponovitev; uspeh odstrani napako. | S6: nadzorovana zavrnitev in uspešen ponovni poskus. |
| R09 | Pravilo 4: med čakanjem status in onemogočene štiri kontrole, največ ena sočasna zahteva; po zavrnitvi so kontrole spet omogočene. | S6: zakasnitev, hitri pritiski, število zahtev in stanje kontrol. |
| R10 | Po shranjevanju ali preklicu delujejo izbira projekta, oba prikaza in podrobnosti; naslednji obrazec je svež. | S7: zaporedje sprememb, navigacije in odpiranja različnih opravil. |

### Uporabniški scenariji in merila uspeha

- **S1 — Začetek urejanja:** v podrobnostih izbranega opravila izberi »Uredi« in preveri predizpolnjeni polji glede na shranjene vrednosti.
- **S2 — Osnutek in preklic:** spremeni obe polji; API, vrstica oziroma kartica in števci ostanejo nespremenjeni. Prekliči brez PATCH in ponovno odpri s prvotnima vrednostma. Izvedi iz preglednice in table.
- **S3 — Validacija:** prazen niz in niz iz presledkov/tabulatorjev/CR/LF povzročita povezano napako brez PATCH. Veljaven popravek jo umakne. Preveri npr. `" \tNov  naslov\r\n" → "Nov  naslov"`; notranji dvojni presledek ostane. Robni U+00A0 ostane, sam U+00A0 je po pravilu `valid` veljaven. Preklic po napaki in ponovno odprtje ne preneseta napake.
- **S4 — Uspeh in stanja:** spremeni naslov in izberi vsako ciljno stanje iz vsakega drugega stanja; preveri obe poslani vrednosti, rezultat v podrobnostih in obeh prikazih, stolpec, števce ter osvežitev strani. Veljavna je tudi sprememba naslova ob nespremenjenem stanju.
- **S5 — Izolacija:** uporabi opravili z enakim naslovom ter opravila različnih projektov. Spremeni izbrani `id`; primerjaj vsa druga opravila in neurejena polja z začetnim posnetkom.
- **S6 — Čakanje in ponovitev:** testni program zakasni ter zavrne shranjevanje. Preveri prikaz čakanja, onemogočene kontrole, odsotnost sočasnih zahtev in nespremenjene prikaze pred uspehom; po zavrnitvi preveri ohranjen vnos, napako ter omogočene kontrole. Ponovi uspešno in preveri izid S4 brez stare napake.
- **S7 — Nadaljnje delo:** po uspehu in po preklicu preklopi prikaz ter projekt, odpri drugo opravilo in nov obrazec; ni prenesenega vnosa ali napak. Preveri tudi po predhodni napaki shranjevanja in njenem preklicu.

Funkcionalni uspeh pomeni izpolnitev vseh R01–R10 in dogovora o vmesniku. Skupni testi preverijo ohranitev izhodišča; scenariji P01 preverijo dopolnitev. Noben sam testni uspeh ne nadomesti pregleda vseh zahtev.

## Izvedba in sledljivost

Končna tabela Zahteva → Pogoj → Test/scenarij → Datoteka/del kode → Izid/dokaz je v [zapisu preverjanj](../verification.md#sledljivost). Vključuje vseh R01–R10, konkretne funkcije, teste A01–A07/D01–D04 ter povezave na dnevnik. [Načrt](plan.md) opisuje tehnične odločitve, [naloge](tasks.md) pa dejansko dokončano delo.

## Odprta vprašanja in omejitve

Bistvenih odprtih vprašanj ni. Izvirna navodila določajo, da med urejanjem ni sočasnih sprememb drugih uporabnikov in da zavrnjena zahteva ne zapiše podatkov. Obrazec ureja samo naslov in stanje; opis, oseba, rok in projekt se ne urejajo.

Zapiranje z Escape, klik izven obrazca, navigacija med odprtim urejanjem, opozorilo ob zapustitvi strani in prijava so izven obsega. Za konec urejanja sta zahtevana »Shrani« in »Prekliči«.

Scenariji S1–S7 so pokriti z izvedenimi preverjanji iz povezane matrike; nedostopni končni testi niso izvedeni. Testne kontrole `/__test/` so dovoljene samo v testnem programu; aplikacija uporablja javni `/api/`. Strežnik, skupni tipi in testi, začetni podatki, odvisnosti ter nastavitve ostanejo nespremenjeni. Dokument ne predpisuje nove infrastrukture ali zunanjih meritev.

## Zgodovina sprememb

- 2026-09-20, 0.1: začetna specifikacija po navodilih P01 0.2, pregled izhodiščne kode, pravila vseh R01–R10 in načrtovani scenariji S1–S7. Brez implementacije ali izvedenih testov.

- 2026-09-20, 0.2: zaključena implementacija in 60 uspešnih testov; predvideno sledljivost nadomesti povezava na končno matriko v `docs/agent/verification.md`. Zahteve in pravila ostajajo nespremenjeni.
