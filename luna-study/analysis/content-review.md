# Vsebinska presoja L/1.0

Obravnavanih 1/24: 1 ocenjenih, 0 neocenljivih. Preostale presoje so še v delu.

AI-podprta, neslepa vsebinska presoja. Vnaprej izbrane ponovitve 001; neodvisne človeške ocene in medocenjevalsko soglasje niso izmerjeni. Pet ordinalnih dimenzij ostane ločenih.

| Oddaja | Status | Specifikacija | Predikati | Sledljivost | Koda | Lastni testi |
| --- | --- | --- | --- | --- | --- | --- |
| [P05-A-001](reviews/P05-A-001.json) | rated | 2 | 2 | 2 | 2 | 2 |

Trojice v nadaljevanju so števila ocen 0 / 1 / 2. Manjkajoče in še neobravnavane ocene niso ničle.

| Dimenzija | A | B | C |
| --- | --- | --- | --- |
| Pokritost specifikacije | 0 / 0 / 1 | 0 / 0 / 0 | 0 / 0 / 0 |
| Predikati in invariante | 0 / 0 / 1 | 0 / 0 / 0 | 0 / 0 / 0 |
| Sledljivost | 0 / 0 / 1 | 0 / 0 / 0 | 0 / 0 / 0 |
| Organizacija kode | 0 / 0 / 1 | 0 / 0 / 0 | 0 / 0 / 0 |
| Lastna preverjanja | 0 / 0 / 1 | 0 / 0 / 0 | 0 / 0 / 0 |

## P05-A-001

**Pokritost specifikacije: 2.** Specifikacija opredeli vseh R01–R12, filtriranje pred globalnim rezanjem, privzete vrednosti, ponastavitve ter ohranitev stanja ob pogledu in dialogu. Loči osnove projektnih in stolpčnih števcev ter posebej opiše prazen rezultat in meje navigacije.

Dokazi: [specification.md#zahteve-in-pravila](../runtime/runs/P05-A-001/submission/docs/agent/specification.md#zahteve-in-pravila).

**Predikati in invariante: 2.** Množici T/F, odsek P(s,F,p), število strani in 1-osnovani razpon so preverljivo definirani, vključno z ničelnim praznim prikazom. Prehodi določijo ponastavitve in nespremenljivost ob pogledu/dialogu; kodi ustreza ločitev shranjene strani in izpeljanega currentPage.

Dokazi: [specification.md#vhodi-dejanja-in-izidi](../runtime/runs/P05-A-001/submission/docs/agent/specification.md#vhodi-dejanja-in-izidi), [specification.md#zahteve-in-pravila](../runtime/runs/P05-A-001/submission/docs/agent/specification.md#zahteve-in-pravila), [App.tsx:16](../runtime/runs/P05-A-001/submission/src/App.tsx#L16).

**Sledljivost: 2.** Vsaka zahteva je povezana s konkretnimi A/D scenariji, mesti kode in izidom. Arhiviran dogodek item_27 potrdi 53 passed in izhod 0. Dokument odkrito ohrani napaki ikon ter lastnih testov in pove, da zasebnih testov ni videl. Izbrani dokazi ustrezajo končni oddaji; razvojni neuspeh lastnega scenarija ni zamenjan za neuspeh neodvisnega ocenjevanja.

Dokazi: [specification.md#izvedba-in-sledljivost](../runtime/runs/P05-A-001/submission/docs/agent/specification.md#izvedba-in-sledljivost), [verification.md](../runtime/runs/P05-A-001/submission/docs/agent/verification.md), [P05-A-001-checks.md#item_27](../analysis/evidence/P05-A-001-checks.md#item_27).

**Organizacija kode: 2.** ProjectView ima tri lokalna stanja; filtrirani seznam, število strani, trenutna stran, odsek in razpon so izpeljani skupaj. Oba pogleda dobita pageTasks; povzetek uporablja allTasks. Projektni key poskrbi za ponastavitev brez sinhronizacijskih učinkov. Skupni komponenti TaskBoard in TaskDetails ostaneta ločeni. Dolg JSX sledi izhodišču, nova pravila pa niso podvojena med pogledoma.

Dokazi: [App.tsx:14](../runtime/runs/P05-A-001/submission/src/App.tsx#L14), [App.tsx:83](../runtime/runs/P05-A-001/submission/src/App.tsx#L83), [App.tsx:127](../runtime/runs/P05-A-001/submission/src/App.tsx#L127), [TaskBoard.tsx:13](../runtime/runs/P05-A-001/submission/src/TaskBoard.tsx#L13).

**Lastna preverjanja: 2.** Sedem lastnih scenarijev pokrije meje navigacije, deljeno filtrirano stran obeh pogledov, ponastavitve, ohranitev ob dialogu, prazen filter/projekt, odstranitev filtra in 11 opravil pri velikosti 10. Preverja tudi osnovo števcev in odsotnost zapisov. Končni izvedeni nabor potrdi uspeh; lastni scenariji niso sistematično podvojeni na obeh zaslonih, mobilne razvojne scenarije agent poroča ločeno.

Dokazi: [P05.spec.ts:3](../runtime/runs/P05-A-001/submission/tests/agent/P05.spec.ts#L3), [P05.spec.ts:72](../runtime/runs/P05-A-001/submission/tests/agent/P05.spec.ts#L72), [P05.spec.ts:95](../runtime/runs/P05-A-001/submission/tests/agent/P05.spec.ts#L95), [P05-A-001-checks.md#item_27](../analysis/evidence/P05-A-001-checks.md#item_27).

Neodvisno preverjanje je 70/70; potrjene končne napake ni. To ni dokaz pravilnosti za vse možne vhode.

Začetni uvoz ChevronsFirst/ChevronsLast je ustavil gradnjo (TS2724). Model je uporabil izvožena ChevronFirst/ChevronLast. Nato je popravil dve lastni testni pripravi: napačno velikost projekta in ponovno registracijo mock poti. Končni check ima 53 uspehov. Zadnji dve odpovedi sta napaki testnih scenarijev, ne potrjeni napaki rešitve.
