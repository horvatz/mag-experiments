# Preverjanje P09

Datum preverjanja: 2026-10-31.

## Izvedena preverjanja

| Preverjanje | Rezultat | Zahteve |
| --- | --- | --- |
| `npm run typecheck` | Uspešno, brez tipovnih napak. | R01–R12 |
| `npm run lint` | Uspešno, brez lint napak. | R01–R12 |
| `npm run build` (vključno `vite build`) | Uspešno; produkcijska izgradnja je ustvarjena. | R01–R12 |
| `npx playwright test --project=development-desktop --project=development-mobile` | 8/8 uspešno. | R01–R12, predvsem R01–R05, R08, R11, R12 |
| `npx playwright test tests/agent/P09-agent.spec.ts --project=agent` | 4/4 uspešno. | R01–R12 |
| `npm run check` | 50/50 uspešno: 14 API, 24 namiznih/mobilnih izhodiščnih, 8 razvojnih P09 in 4 lastna. | R01–R12 |

## Sledljivost zahtev

| Zahteva | Dejanski scenarij | Rezultat |
| --- | --- | --- |
| R01 | A01 odpre neposredno URL s `q`, `status`, `order`, neznanim in podvojenim parametrom ter takoj prikaže zadetek. | Uspešno. |
| R02 | A01 preverja trim, NFD, odstranitev kombinirnih znakov, male črke in iskanje po naslovu; A02/A03 preverjata še opis, odgovorno osebo in ID. | Uspešno. |
| R03 | A01 preverja IN med `q` in `status` ter `title-desc`; A02 preverja `title-asc`, A03 izvorni vrstni red in enake naslove na tabli. | Uspešno. |
| R04 | A01 preverja prvo pojavitev podvojenih `status`/`order`, neznani parameter in odsotnost samodejnega prepisovanja URL-ja. | Uspešno. |
| R05–R06 | A02 spreminja osnutek brez URL-ja, nato potrdi trim, URL-kodiranje in eno zgodovinsko stanje; ponovna potrditev ne doda stanja. | Uspešno. |
| R07 | A02 preverja Nazaj/Naprej in obnovitev kontrol; D03 ter A04 preverjata osvežitev. | Uspešno. |
| R08–R09 | A03 preverja preklop Preglednica/Tabla, zavrzitev osnutka, podrobnost po ID in Escape z ohranjenimi parametri. | Uspešno. |
| R10 | A03 preverja klik na drug projekt iz filtriranega boarda (privzeti pregled, ohranjen board) in neposredne parametre. | Uspešno. |
| R11 | A02/A03 preverjata reset; A04 preverja `Ni zadetkov`, števec `Prikazano: N od M.` in reset na boardu. | Uspešno. |
| R12 | Vsi testi potekajo brez pisalnih API-jev; A02–A04 preverjata `readonly`, izhodiščni testi pa nalaganje, napake, neznano pot, podrobnosti in prilagodljivost. | Uspešno. |

## Omejitve

- Končni zunanjih testov ni bilo na voljo, zato uspešnost velja za dostopne skupne, razvojne in lastne preizkuse.
- Javni internet ni uporabljen; testni podatki so nastavljeni z lokalnimi Playwright GET preskusmi.
- Niso preverjene sočasne spremembe podatkov med nalaganjem ali med navigacijo, ker navodila teh scenarijev ne zahtevajo.
- Neizpolnjenih zahtev ni.
