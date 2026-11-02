# Preverjanje rešitve

Datum: 2026-11-02

## Izvedena preverjanja

- `npm run typecheck`: uspešno.
- `npm run lint`: uspešno.
- `npx playwright test --project=agent`: 9/9 lastnih preverjanj uspešnih.
- `npx playwright test --project=development-desktop --project=development-mobile`: 8/8 skupnih razvojnih preverjanj uspešnih.
- `npm run check`: uspešno; vključno z lint, build, typecheck in 55/55 Playwright preverjanji (API, namizni in mobilni izhodiščni testi, razvojni testi P10 ter lastni testi).

## Sledljivost zahtev

| Zahteva | Dejansko preverjanje | Rezultat |
| --- | --- | --- |
| R01 | A01 preveri izvorno zaporedje ID-jev in globalni mesti 1 in 8; D01 preveri izhodiščno zaporedje. | Uspešno. |
| R02 | A01 preveri zamenjavo neposrednega globalnega predhodnika; A05 preveri premik na tabli in ohranjanje stanj. | Uspešno. |
| R03 | A01 preveri onemogočena robna dejanji brez spremembe zgodovine; A08 preveri prazen projekt in projekt z enim opravilom. | Uspešno. |
| R04 | A02 preveri dva premika, dve razveljavitvi in shranjevanje trenutne permutacije za ponovitev. | Uspešno. |
| R05 | A02 preveri več razveljavitev in ponovitev brez izgube ali podvajanja ID-jev; A09 preveri 20 korakov. | Uspešno. |
| R06 | A03 preveri, da veljaven nov premik po razveljavitvi počisti ponovitve, robno dejanje pa zgodovine ohrani. | Uspešno. |
| R07 | A09 izvede 21 veljavnih premikov in po 20 razveljavitvah potrdi izločitev najstarejšega koraka. | Uspešno. |
| R08 | A04 preveri reset kot eno razveljavljivo spremembo; D04 preveri reset na tabli. | Uspešno. |
| R09 | A05 preveri globalni vrstni red v preglednici, razvrščanje znotraj stolpcev table, globalno mesto in nespremenjene števce stanj. | Uspešno. |
| R10 | A05 preveri preklop pogleda in podrobnosti; A06 menjava projekta; A07 osvežitev; A01 in A05 preverita brez pisanj na API. | Uspešno. |
| R11 | A01 preveri natančno besedilo statusa in onemogočena gumba pri ničli; A08 preveri prazen in enoopravilni projekt. | Uspešno. |
| R12 | A01 in A05 preverita istost množice ID-jev, nespremenjene števce in `saveRequests: 0`; skupni izhodiščni testi preverijo podrobnosti, dostopnost in prilagodljivost. | Uspešno. |

## Omejitve in opombe

- Končnih skritih testov ni bilo na voljo, zato njihovih rezultatov ne navajam.
- Navigacije med nezaključenim nalaganjem in sočasnih sprememb API-ja brez osvežitve niso preverjene, ker jih navodila izrecno izključujeta.
- Vrstni red ni trajno shranjen; to ustreza zahtevam in je potrjeno z odostnostjo pisanj na API.
- Javni internet ni bil uporabljen. Vsi testi so tekli proti lokalnim storitvam naloge.
- Orodje `apply_patch` v tem okolju ni bilo izvedljivo (napaka `operation not permitted`); spremembe so bile zato zapisane z lokalnimi ukazi Node in printf ter nato preverjene z lint, typecheck in testi.
- Neizpolnjenih zahtev iz R01–R12 ni.
