# Neodvisni pregled P06

Pregled je končan. Izvirne zahteve `task/instructions.md` so primerjane s specifikacijo, produkcijsko kodo, razvojnimi in lastnimi testi ter `verification.md` in `check.log`. Pri vseh R01–R12 ni ugotovljenih konkretnih neskladnosti. Specifikacija pravilno označuje svoje scenarije kot načrtovane; implementerjev dokument jih poveže z dejansko kodo in dnevnikom izvajanja. Popravki specifikacije ali kode niso zahtevani.

| Zahteva | Neodvisni statični pregled in predani dokazi |
| --- | --- |
| R01 | `App.ProjectView` preda podatke projektnega GET odgovora, `CsvExport` nastavi vse kolone/`;`/`all`, `createCsv` ohrani vrstni red z `filter`/`map`. D01, S01 vključujeta 13 vrstic in drug projekt. |
| R02 | Stalni `csvColumns` določa kolone glave in vseh vrstic; vrstni red klikov ne vpliva na rezultat. D02, S05, S07. |
| R03 | Gumb je onemogočen brez kolon; `createCsv` dodatno vrne `null`. Ponovni izbor posodobi stanje. S02, S07. |
| R04 | Filter in štetje za izvoz sta lokalna `CsvExport`; ostali prikazi dobijo celotne `tasks`. Prazni podatki/filtri preprečijo prenos. S01, S02, D04. |
| R05 | Lokalni Blob in povezava z `download=folio-<projectId>.csv`; vsebina začne U+FEFF, ni omrežnega zapisa ali nove strani. D01 in bajtni S03. |
| R06 | Obe HTML select vrednosti sta pravilni. `quote` vedno obdaja vse glave/celice in podvoji vsak notranji narekovaj. D03, S03. |
| R07 | Sestavljanje uporablja CRLF za vsak zapis in tudi na koncu; notranjih prelomov ne spreminja. S03 vključuje CR, LF in CRLF. |
| R08 | Predikat je natanko `/^[ \t\r\n]*[=+@-]/`; apostrof se doda pred izvirni niz in pred navajanjem. Velja za vse podatkovne kolone; glava uporablja samo `quote`. S04 preveri 105 kombinacij. |
| R09 | Neposreden dostop `task[column]` brez formatiranja ali krajšanja. S03 preverja Unicode, opis, presledke, interni status in prestopni datum. |
| R10 | `CsvExport` je stabilni otrok `ProjectView`, pred vejitvijo Preglednica/Tabla. D04, S05. |
| R11 | `ProjectView key={project.id}` ponovno ustvari lokalno stanje ob menjavi; osvežitev uporabi privzete vrednosti. Dogodek prenosa uporablja trenutno stanje. S05 preverja A→B→A, oba pogleda, osvežitev in zaporedne izvoze. |
| R12 | Nova pot izvoza ne kliče API zapisov, testnih kontrol ali shrambe; uporablja nemutirajoče operacije. Oznake opravil, stanj, pogledov in podrobnosti ostanejo. S04/S07 zamrzneta vhod; S06 preverja tipkovnico in širino 390. Predani regresijski dnevnik vsebuje 38 uspešnih osnovnih testov. |

Sam sem pregledal vse štiri predane slike `visual-desktop-table.png`, `visual-desktop-board.png`, `visual-mobile-table.png` in `visual-mobile-board.png` ter sloge glede na `docs/dizajn.md`; navigacija, kartice, pisava in modri poudarki so ohranjeni. Predani `visual-check.json` poroča o širini 1440/390 brez razširitve strani in brez napak strani. Lastni zagon S06 je dodatno potrdil odsotnost razširitve strani pri 390 pikah v obeh pogledih. Namizne vizualne meritve in poročilo o napakah strani ostajajo predani dokaz, novih posnetkov nisem izdelal.

Preverjen predani dnevnik `check.log` prikazuje uspešen lint, typecheck, build in 53 uspešnih testov. To je implementerjev zagon, ne moj. Celotne zbirke nisem ponovil.

Sam sem izvedel `npx playwright test --project=agent`: **7 passed (5.2s)**, izhodna koda 0, brez preskokov ali neuspešnih testov. Uspešni so vsi S01–S07 iz zgornje tabele: vrstni red in filtri, onemogočen prazen izvoz, dejanski bajti prenosa, formule in nemutiranje, življenjska doba nastavitev, tipkovnica in mobilna širina ter zavrnitev praznega vhoda. Dokaz je izpis tega zagona in `playwright-report/html/index.html`. Ta ciljni zagon je uporabil lokalni testni strežnik 5174/3102 in Chromium povezavo iz projektne konfiguracije. Opozorili npm o `http-proxy` ter `NO_COLOR` nista vplivali na rezultat.

Omejitve: javni internet je blokiran, uporabljene so samo lokalne storitve te naloge. Končni testi niso dostopni. Drugi brskalniki niso preverjeni. Git status ni uspel zaradi manjkajočega `/Library/Developer/CommandLineTools` (`xcrun`), zato primerjave sprememb z Git izhodiščem ni bilo mogoče opraviti. Brskalniško okolje zahteva povezavo na Chromium iz `task/browser.json`, kar upošteva obstoječa Playwright konfiguracija. Koda, testi, infrastruktura in specifikacija niso bili spreminjani. Končna strukturirana predaja je `review.json`.
