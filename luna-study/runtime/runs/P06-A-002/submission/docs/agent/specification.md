# P06 — specifikacija nastavljivega izvoza CSV

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v preglednici ali tabli. Dodati je
treba izvoz teh podatkov v CSV, pri katerem lahko uporabnik izbere stolpce,
ločilo in filter stanja. Izvoz mora ohraniti izvorni vrstni red, Unicode in
vsebino opisov, obenem pa pravilno ubežati CSV ter nevtralizirati besedila,
ki bi jih preglednica lahko razumela kot formule.

Projekt in opravila se preberejo z obstoječima GET zahtevama `/api/projects`
in `/api/projects/:id/tasks`. Izvoz nima zapisovalnih učinkov. Kontrole bodo
del skupnega pogleda projekta, zunaj posameznih povezav opravil.

## Vhodi, dejanja in izidi

- Vhodi so `project.id` in `Task[]` s polji `id`, `projectId`, `title`,
  `status`, `assignee`, `dueDate` in `description`.
- Uporabnik preklaplja sedem kontrol `Stolpec <ime>`, izbere `;` ali `,` v
  `Ločilo CSV` ter `all`, `todo`, `in_progress` ali `done` v `Filter izvoza`.
- Privzeto so vključeni vsi stolpci, ločilo je `;`, filter pa `all`.
- Klik na omogočen gumb `Izvozi CSV` ustvari prenos `folio-<projectId>.csv`.
  Neuspešen pogoj izvoza pomeni onemogočen gumb in brez prenosa. Napaka pri
  branju API-ja ostane obravnavana z obstoječim stanjem napake in ponovnim
  poskusom.
- Nastavitve so začasno lokalno stanje trenutnega projekta; preklop pogleda
  jih ohrani, menjava projekta in ponovni zagon strani pa uporabita privzete
  vrednosti. Izbori ne spreminjajo prikaza opravil.

## Zahteve in pravila

Simboli: `T` so v izvornem vrstnem redu prejeta opravila trenutnega projekta;
`C` je množica izbranih polj; `F` je filter; `D` je ločilo; `R` so vrstice,
ki ustrezajo `F`; `Q` je urejeno zaporedje stolpcev iz kanoničnega seznama
`[id, projectId, title, status, assignee, dueDate, description]`, omejeno na
`C`. `quote(x)` obdaja niz z `"` in vsak notranji `"` podvoji. `safe(x)` na
začetek prvotnega niza doda apostrof natanko, kadar začetni niz po nič ali več
znakih presledka, tabulatorja, CR ali LF vsebuje `=`, `+`, `-` ali `@` kot
prvi znak; sicer niz vrne nespremenjen. Vrednosti so pretvorjene v nize brez
lokalizacije datuma ali stanja.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno `C` vsebuje vsa polja, `D = ;`, `F = all`; izvožene vrstice so `T` v izvornem vrstnem redu. | Privzeti izvoz in vrstni red ID-jev. |
| R02 | Glava in podatki uporabljajo `Q`; vrstni red klikov ne spremeni `Q`. | Izbor polj v obrnjenem vrstnem redu, pregled glave/vrednosti. |
| R03 | `enabled ⇔ |C| > 0 ∧ |R| > 0`; brez stolpcev ali vrstic ni prenosa. | Stanje gumba in odsotnost dogodka prenosa; ponovni izbor. |
| R04 | `R = T` za `all`, sicer `R = [t ∈ T : t.status = F]`; prikaz še vedno prejme `T`. | Filtriran CSV in ID-ji v tabeli/tabli. |
| R05 | Bajti prenosa se začnejo z UTF-8 BOM U+FEFF; ime je `folio-${project.id}.csv`; prenos je na strani in brez omrežnega zapisa. | Ime/vsebina prenosa, brez nove strani, spremljanje zahtev. |
| R06 | Vsako polje glave in podatkov je `quote(...)`; vsaka vrednostna celica najprej uporabi `safe(...)`; `D ∈ {;,}`. | Ločila, narekovaji in posebni znaki. |
| R07 | Vrstice so združene z `\r\n` in tudi zadnja se konča z `\r\n`; vsebina celice obdrži ločila in prelome vrstic. | Bajtni niz z opisom z vejico, narekovajem, podpičjem in LF. |
| R08 | Za vse podatkovne vrednosti se uporabi `safe`; glava se ne nevtralizira. | Formula z `=`, ter dodatni primeri začetnih presledkov/krmilnih znakov in `+ - @`. |
| R09 | Nizi in izvorni `YYYY-MM-DD`/status se ohranijo, razen formule po R08. | Primeri šumnikov, presledkov, statusa in datuma. |
| R10 | Nastavitve so shranjene nad pogojnim prikazom pogleda in ne spreminjajo izvozne funkcije; isti vhod ustvari enako vsebino. | Nastavi filter, izvozi, preklopi pogled, izvozi in primerjaj. |
| R11 | Začetno stanje velja ob novi projektni instanci ali osvežitvi dokumenta. | Menjava projekta, povratek, osvežitev in preverjanje privzetih vrednosti. |
| R12 | Izvoz je čista pretvorba `Task[] → CSV`; ni klicev zapisovalnega API-ja in ne mutira opravil. Obstoječi pogledi in odziven prikaz ostanejo. | Primerjava prikazanih ID-jev/podatkov, spremljanje API zahtev in mobilna širina. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `C` privzeto vsebuje vsa polja, `D = ;`, `F = all`; `R` ohrani vhodni vrstni red. | D01: privzeti okvir; agentni test »selected columns follow the fixed field order…« preveri vrstni red vrstic. | `src/CsvExport.tsx`: stolpci in začetno stanje (5, 50–52), sestava CSV (27–33). | Uspešno; `npm run check`, D01 in agentni test. |
| R02 | Glava in vrednosti sledijo `columns`, ne klikom uporabnika. | Agentni test »selected columns follow the fixed field order, not the click order«. | `src/CsvExport.tsx`: seznam stolpcev in izbirna polja (5, 76–89), kanonični izbor pri izvozu (72). | Uspešno; agentni test je del uspešnega zagona `npm run check`. |
| R03 | `enabled ⇔ selected.length > 0 ∧ matchingTasks.length > 0`. | Agentna testa »empty selection and empty result…« ter »an empty project…«. | `src/CsvExport.tsx`: pogoj gumba (53–54, 72). | Uspešno; oba testa sta prestala v `npm run check`. |
| R04 | Filter omeji `R`, prikaz pa še vedno uporablja `tasks`. | D02 in agentni test »status filter changes exported rows but leaves the table intact«. | `src/CsvExport.tsx` (27–32, 53), `src/App.tsx` (43–57). | Uspešno; CSV vsebuje le izbrani status, tabela ohrani vse vrstice. |
| R05 | Prenos ima BOM in ime `folio-<projectId>.csv`, sproži ga skrita povezava. | D01 ter agentni test formule, ki po prenosu preveri eno samo stran. | `src/CsvExport.tsx`: Blob in lokalna povezava za prenos (36–46). | Uspešno; ime/BOM preverjena z D01, brez nove strani z agentnim testom. |
| R06 | Glave in vrednosti so vedno navedene; narekovaji se podvojijo; ločilo je `;` ali `,`. | D02, D03 in agentni test kanoničnega vrstnega reda. | `src/CsvExport.tsx`: `quoteCell`, `makeCsv` in izbira ločila (23–33, 58–62). | Uspešno; razvojni testi P06 in agentni testi so prestali. |
| R07 | Vrstice uporabljajo CRLF, zadnja ima CRLF; vsebina celic ostane ohranjena. | D01, D03 in agentni test formule s CR/LF, vejico, podpičjem ter narekovaji. | `src/CsvExport.tsx`: sestava vrstic (27–33), navedba celice (23–25). | Uspešno; predpona/zaključek in vsebina preverjeni v `npm run check`. |
| R08 | `safe(x)` doda apostrof pred izvirni niz, če po `[ \t\r\n]*` sledi `=`, `+`, `-` ali `@`. | D03 ter agentni test »formula neutralization applies after leading whitespace…«. | `src/CsvExport.tsx`: `safeCell` se izvede pred navedbo (19–24, 30–32). | Uspešno; preverjeni `=`, `+`, `-`, `@` ter začetni tabulator, presledki, CR/LF. |
| R09 | Unicode, presledki, status in izvorni datum ostanejo; razen nevtralizacije. | D03 ter agentni test formule (preveri datum `2026-09-21`). | `src/CsvExport.tsx`: neposredno izvozno branje polj Task (27–32). | Uspešno; preverjeni šumniki, status, datum in opis z več vrsticami. |
| R10 | Nastavitve ostanejo ob preklopu pogleda; isti vhod ustvari isto vsebino. | D04: view parity and no writes. | `src/App.tsx`: `CsvExport` je brat pogojno izbranega pogleda (43–44); lokalno stanje je v `src/CsvExport.tsx` (49–53). | Uspešno; D04 v namiznem in mobilnem profilu. |
| R11 | Nov projekt in osvežitev začneta s privzetimi vrednostmi. | Agentni test »project change and document refresh restore default export settings«. | `src/App.tsx:88`: projektni `key`; `src/CsvExport.tsx:50–52`: začetna stanja. | Uspešno; menjava projekta in `page.reload()` preverjena v `npm run check`. |
| R12 | Izvoz nima zapisovalnih klicev in ne mutira prikazanih opravil; mobilna stran ostane v širini. | D04 preveri brez zapisov in prelivanja; baseline desktop/mobile pokrije obstoječa opravila in poglede. | `src/CsvExport.tsx`: pretvorba bere opravila, prenos je lokalni (27–46); `src/App.tsx` ohranja obstoječi `tasks` za prikaz (43–57). | Uspešno; vsi osnovni in razvojni testi so prestali na namizju in telefonu. |

### Zapis sprememb specifikacije

- 2026-09-28: po izvedbi so dopolnjene povezave med zahtevami, kodo in
  izvedenimi testi; sprejemni pogoji R01–R12 se niso spremenili.

## Odprta vprašanja in omejitve

- Obseg dejansko izvedenih preverjanj in nepreverjene dele opisuje
  [verification.md](./verification.md).
