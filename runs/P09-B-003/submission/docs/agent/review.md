# Neodvisni pregled P09

Pregledane so izvirne zahteve, predloga, specifikacija z zgodovino, vsa izvedbena koda, razvojni in lastni testi ter `verification.md` in končni dnevnik. Spodnje ocene temeljijo na samostojnem branju kode in testov; uspeh 54/54 iz `check-final.log` je rezultat implementerja, ne ponovljen zagon pregledovalca. Pregled vseh R01–R12 je končan; konkretne neskladnosti niso ugotovljene. Spremembe specifikacije ali implementacije niso zahtevane.

| Zahteva | Neodvisno pregledani dokaz |
| --- | --- |
| R01 | `useRoute/readFilters` prebereta fragment obeh poti; `ProjectView` izpelje rezultat takoj. D01 in A06 pokrivata neposredni povezavi. |
| R02 | `normalizeText/visibleTasks` uporabita trim, NFD, točni razpon diakritike, male črke in `includes` v vsakem polju posebej. A01 preveri štiri polja, dobesednost in celotno frazo. |
| R03 | Filter združi status in frazo z IN; stabilni sort novega filtriranega seznama primerja niza z `<` in `>`. A02/A08 pokrivata UTF-16, izenačenja, izvorni vrstni red in vse statuse. |
| R04 | `URLSearchParams.get` vrne prvo vrednost; razčlenjevanje ne piše URL-ja in privzame all/original. A03 preverja neveljavne prve pojavitve in neznane parametre. |
| R05 | `ViewControls` hrani lokalni osnutek; `applyFilters/commitUrl` atomarno potrdita stanje in dodata en vnos samo ob spremembi. A03/A04 preverjata osnutek in zgodovino. |
| R06 | `viewQuery` kodira, obreže q, izpusti privzeto in neznano ter ohrani board; `sameFilters` omogoči zamenjavo brez novega vnosa. A01/A03 preverjata posebne znake in enako potrditev. |
| R07 | `hashchange/useSyncExternalStore` obnovita potrjeno stanje; ključ kontrol je fragment. A04 preveri Nazaj, Naprej, osvežitev in zavrnitev osnutka. |
| R08 | Oba pogleda dobita isti `shownTasks`, povezave uporabijo potrjene filtre, nov ključ kontrol zavrže osnutek. A02/A05 preverjata ID-je in preklop. |
| R09 | Povezave uporabljajo kodirani ID; `TaskDetails.close` in Escape uporabita potrjene filtre ter view. A05/A06 pokrivata enake naslove, oba izhoda in neposredne podrobnosti. |
| R10 | Projektna navigacija poda samo projekt in view, neposredne povezave berejo lastne filtre. A05 pokriva oba načina. |
| R11 | Ponastavitev uporablja isto potrditev z `defaultFilters`; števec kaže velikosti filtriranega in izvornega seznama, Ni zadetkov. velja tudi za prazni projekt. A04/A07 pokrivata zgodovino in 0/0, 1/1, 0/1. |
| R12 | UI kliče samo bralni `useResource`; `updateTask` ni uporabljen, localStorage in testne kontrole niso v toku UI. CSS ohranja Folio in notranje drsenje. Implementerjev dnevnik vsebuje 38 osnovnih regresij; D04 in A05/A07 preverjajo odsotnost zapisov. |

Specifikacija izrecno opredeli vseh dvanajst zahtev, predikate in sledljivost. Svoje neizvedene teste pravilno označi; končne izvedbene dokaze delegira v `verification.md`, ki jih poveže z dejanskimi imeni testov in dnevnikom.

## Samostojna dodatna preverjanja

Po pregledu vseh zahtev je pregledovalec zagnal lokalni strežnik z `WEB_PORT=5193 API_PORT=3123 npm run dev`. Enkratna skripta Node se je povezala z nameščenim Chromiumom prek `chromium.connect(wsEndpoint)` iz `task/browser.json`. GET odgovore je prestregel samo testni program. Skripta se je končala z izhodno kodo 0 in naslednjimi uspešnimi preverjanji:

- R05/R06/R07: po potrditvah q=Čaj in q=Enak, Nazaj in enaki potrditvi je Naprej še vedno obnovil q=Enak in oba pravilna ID-ja.
- R08/R09: pri dveh enakih naslovih je povezava za ID `a/b?#&% + Ž` odprla pravilno osebo in opravilo. Kodirani ID, potrjeni q in board so se ohranili; osvežitev je ohranila podrobnosti, Escape pa je obnovil potrjeni osnutek in pravilne ID-je.
- R04: pri podvojenih veljavnih q/status/order so veljale prve vrednosti Čaj/todo/title-asc, ne poznejše Enak/done/title-desc; prikaz je vseboval samo ustrezni ID.
- R12: na tabli pri 390 px je bila širina dokumenta 390 px; med dejanji ni bilo zapisovalnih API-zahtev, localStorage je ostal prazen.

Samostojno sta vizualno pregledana tudi implementerjeva posnetka `desktop-table.png` in `mobile-table.png`: barve, razporeditev, gradniki in prilagoditev ustrezajo dokumentu Folio. Izvor posnetkov in predanih meritev ostaja implementerjev. Celotnega že uspešnega nabora ni bilo razloga ponavljati; dodatna preverjanja so ciljala kombinacije, ki jih obstoječi testi ne pokrivajo neposredno.

Omejitve: javni internet je blokiran; dovoljene so samo lokalne storitve in izvožene datoteke. Končni skriti testi in drugi brskalniški pogoni niso dostopni oziroma preverjeni. Pregledovalec ni spreminjal kode, specifikacije ali testov. Celotni lint, tipi, gradnja in 54 testov so preverjeni iz implementerjevega dnevnika, ne s samostojnim ponovnim zagonom. Test A07 zapisuje implementerjev posnetek `docs/agent/mobile-board.png`, zato ga pregledovalec v tej vlogi ni ponovil. Dodatna preverjanja niso zapisovala v tuje dokumente ali posnetke.
