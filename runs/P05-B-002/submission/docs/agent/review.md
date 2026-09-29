# Neodvisni pregled P05

Pregled vseh R01–R12 je končan. Konkretnih neskladij s prvotnimi zahtevami nisem našel; popravki specifikacije in implementacije niso zahtevani. Merilo so `task/instructions.md`, projektna pravila in predloga, tudi neodvisno od predane specifikacije.

Prebral sem specifikacijo in njeno zgodovino, produkcijsko kodo, osnovne, razvojne in lastne teste, `verification.md`, končni `check.log`, meritve videza ter pregledal vse štiri predane posnetke pri 1440 in 390 pikah. Začetni review.json je bil shranjen pred pregledom in nato dopolnjen s pregledanimi zahtevami. Vse zahteve so bile pregledane in zapisane pred dodatnim preizkusom.

| Zahteva | Neodvisni pregled kode in pogojev | Predani testi, preverjeni z branjem |
| --- | --- | --- |
| R01 | `App.tsx:15–18`: all/all/1, stabilno filtriranje in izvorni vrstni red. | A01, A07 |
| R02 | `App.tsx:18–25`: filtriranje pred slice; odseki 2/5/10 brez izgube ali podvajanja. | A01, A02, D01 |
| R03 | `App.tsx:26–27,68–72`: pravilne meje, disabled in omejeni premiki. | A01, A02, A06, A07 |
| R04 | `App.tsx:61`: vsaka sprememba velikosti ponastavi stran, tudi ob še veljavni prejšnji strani. | A02, D04 |
| R05 | `App.tsx:18,64`: stabilni filter pred rezanjem; sprememba postavi prvo stran. | A01, A02, A07, D03 |
| R06 | `App.tsx:77,81`: oba pogleda dobita isti odsek; `TaskBoard.tsx` šele nato združuje po stanju. | A03, A04, D03 |
| R07 | `ProjectView` ostane ista komponenta ob view/taskId; podrobnosti ne spreminjajo straničenja. | A04 in osnovne regresije |
| R08 | Ključ project.id ponastavi lokalno stanje; ni nove shrambe ali URL-parametrov. | A05 za oba pogleda |
| R09 | `App.tsx:19–24,75`: pravilni X/Y/A/B/N, pike in pomišljaj. | A01, A02, A05, A07, D02 |
| R10 | Ničelni rezultat ima 0/0 in 0–0, vse premike onemogočene, filter ostane dostopen. | A06, A07 |
| R11 | Projektni števci iz tasks, stolpci iz visibleTasks; skupno število ostane celotno. | A03 |
| R12 | Lokalni filter/slice brez mutacij; updateTask nima klicatelja; ni uporabe testnih kontrol v src. Povezave, nalaganje, ID-ji in obstoječi slogi so ohranjeni. | A01, A04, A07, D04, osnovne regresije, posnetki |

Specifikacija zajema vseh dvanajst zahtev, formule, prehode in pogodbo kontrol. Svoje načrtovane teste izrecno označi kot neizvedene; dejanski implementerjevi izidi in povezave so ločeno v verification.md, skladno z lastništvom dokumentov.

## Dokazi in izvor rezultatov

Implementerjev `docs/agent/check.log` vsebuje uspešen lint, TypeScript, gradnjo in **54 passed (24.1s)**: 38 osnovnih, 8 razvojnih ter 8 lastnih testov. To je predani rezultat, ne moj ponovni zagon. Celotnega preverjanja nisem ponavljal, ker pregled ni pokazal konkretnega razloga za ponovitev. Vse štiri posnetke sem sam vizualno pregledal; njihovo ustvarjanje in meritve v visual-check.json so implementerjevi.

Sam sem izvedel dodaten preizkus v Chromiumu prek wsEndpoint iz task/browser.json in chromium.connect. Uporabljen je bil lokalni strežnik 5193/3123, po preizkusu ustavljen. Razlog za dodatek: lastni mobilni test A07 uporablja posamezno opravilo; dopolnil sem preverjanje večjega filtriranega seznama na 390 × 844 pikah.

Podatki: 27 opravil v vrstnem redu n = i × 11 mod 27, ID `č/n?%#`, projekt `projekt/č?%#`, enaki naslovi z Unicode in ločili, datum 2028-02-29; n < 16 ima stanje todo, preostalih 11 done. Odgovori GET so bili nadzorovani samo v preizkusnem programu. Drugi projekt je prazen.

Lastni izid: **PASS, izhodna koda 0**. Pri velikostih 2, 5 in 10 je bilo preverjenih 14 filtriranih strani v preglednici in tabli, pravilni ID-ji, vrstni red preglednice, natančni statusi, projektni in stolpčni števci ter odsotnost razširitve dokumenta. Preverjeni so bili tudi podrobnosti pravilnega kodiranega ID-ja, ohranitev druge strani po Escape, ponastavitev velikosti ob še veljavni drugi strani, prazen filter, njegova odstranitev, osvežitev in prazen projekt. Zabeleženo je bilo 0 zapisovalnih zahtev API in 0 zahtev uporabniškega vmesnika na testne kontrole.

## Omejitve

Celotni npm run check je potrjen samo iz predanega dnevnika. Končni testi niso dostopni. Drugih brskalnikov in bralnika zaslona nisem preveril. Pregled je omejen na lokalni izvoz in nameščeni Chromium; javni internet je blokiran. Git diff/status nisem neodvisno preveril; implementer poroča o manjkajočem xcrun. Kode, specifikacije, testov in infrastrukture nisem spreminjal.
