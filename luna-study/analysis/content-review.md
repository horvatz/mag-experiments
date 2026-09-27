# Vsebinska presoja L/1.0

Obravnavanih 3/24: 3 ocenjenih, 0 neocenljivih. Preostale presoje so še v delu.

AI-podprta, neslepa vsebinska presoja. Vnaprej izbrane ponovitve 001; neodvisne človeške ocene in medocenjevalsko soglasje niso izmerjeni. Pet ordinalnih dimenzij ostane ločenih.

| Oddaja | Status | Specifikacija | Predikati | Sledljivost | Koda | Lastni testi |
| --- | --- | --- | --- | --- | --- | --- |
| [P05-A-001](reviews/P05-A-001.json) | rated | 2 | 2 | 2 | 2 | 2 |
| [P05-B-001](reviews/P05-B-001.json) | rated | 2 | 2 | 1 | 2 | 1 |
| [P05-C-001](reviews/P05-C-001.json) | rated | 2 | 2 | 1 | 2 | 2 |

Trojice v nadaljevanju so števila ocen 0 / 1 / 2. Manjkajoče in še neobravnavane ocene niso ničle.

| Dimenzija | A | B | C |
| --- | --- | --- | --- |
| Pokritost specifikacije | 0 / 0 / 1 | 0 / 0 / 1 | 0 / 0 / 1 |
| Predikati in invariante | 0 / 0 / 1 | 0 / 0 / 1 | 0 / 0 / 1 |
| Sledljivost | 0 / 0 / 1 | 0 / 1 / 0 | 0 / 1 / 0 |
| Organizacija kode | 0 / 0 / 1 | 0 / 0 / 1 | 0 / 0 / 1 |
| Lastna preverjanja | 0 / 0 / 1 | 0 / 1 / 0 | 0 / 0 / 1 |

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

## P05-B-001

**Pokritost specifikacije: 2.** Specifikacija jasno pokrije R01–R12, natančna imena kontrol, prazne in krajše strani, ohranitev vrstnega reda, deljen odsek pogledov ter različne osnove števcev. Določi ponastavitve in ohranjanje ob podrobnostih, lokalnost stanja, poljubne ID-je in ozko postavitev.

Dokazi: [specification.md#vhodi-dejanja-in-izidi](../runtime/runs/P05-B-001/submission/docs/agent/specification.md#vhodi-dejanja-in-izidi), [specification.md#zahteve-in-pravila](../runtime/runs/P05-B-001/submission/docs/agent/specification.md#zahteve-in-pravila).

**Predikati in invariante: 2.** M, N, Y, p in D so definirani s posebnimi vejami za številčno velikost, all in prazen rezultat. Indeksni razpon ima eksplicitno vejo za all; prehodi resetirajo stran in ohranijo stanje pri view/detail. Implementerjev začetni pomislek o all zato ni dokaz napake specifikacije: končna oddaja pravilno vsebuje ločeno vejo in ni zahtevala popravka.

Dokazi: [specification.md#vhodi-dejanja-in-izidi](../runtime/runs/P05-B-001/submission/docs/agent/specification.md#vhodi-dejanja-in-izidi), [specification.md#zahteve-in-pravila](../runtime/runs/P05-B-001/submission/docs/agent/specification.md#zahteve-in-pravila), [App.tsx:19](../runtime/runs/P05-B-001/submission/src/App.tsx#L19).

**Sledljivost: 1.** Večina povezav zahteva–koda–test je preverljiva; arhivirani item_28 potrdi 49 passed in izhod 0, pregledovalec pa odkrito navede, da zagona in ozkega prikaza ni neodvisno ponovil. Vendar verification.md v zadnji omejitvi neupravičeno opisuje vsebino neobjavljenih končnih scenarijev, do katerih model ni imel dostopa (trdi tudi pokritje vseh poljubnih podatkov). Ta nepodprta trditev o dokazih prepreči najvišjo oceno; ne spreminja dejanskih 70/70 neodvisnih izidov.

Dokazi: [verification.md#sledljivost-po-izvedbi](../runtime/runs/P05-B-001/submission/docs/agent/verification.md#sledljivost-po-izvedbi), [verification.md#omejitve-in-opozorila](../runtime/runs/P05-B-001/submission/docs/agent/verification.md#omejitve-in-opozorila), [review.json](../runtime/runs/P05-B-001/submission/docs/agent/review.json), [P05-B-001-checks.md#item_28](../analysis/evidence/P05-B-001-checks.md#item_28).

**Organizacija kode: 2.** Tri lokalna stanja so ločena od memoiziranega filtra, števila strani, trenutne strani in vidnega odseka. Oba pogleda uporabita visibleTasks, projektni povzetek pa tasks. Projektni key skrbi za ponastavitev, brez podvojitve modela straničenja v TaskBoard. Obseg sprememb ostane v App in slogih; obstoječi prikaz podrobnosti in podatkovni sloj sta ohranjena.

Dokazi: [App.tsx:14](../runtime/runs/P05-B-001/submission/src/App.tsx#L14), [App.tsx:19](../runtime/runs/P05-B-001/submission/src/App.tsx#L19), [App.tsx:55](../runtime/runs/P05-B-001/submission/src/App.tsx#L55), [TaskBoard.tsx:13](../runtime/runs/P05-B-001/submission/src/TaskBoard.tsx#L13).

**Lastna preverjanja: 1.** Trije dejansko izvedeni lastni testi koristno preverijo filtriranje pred rezanjem, ohranitev izbire ob pogledu/podrobnostih, prazen filter z enim opravilom in ponastavitve projekta/osvežitve. Pomembni robovi ostanejo brez lastnih scenarijev: velikost 10 z več kot 10 opravili in krajšo zadnjo stranjo, razdelitev celotnega seznama brez vrzeli ter vsi štirje premiki na nepraznih robovih. Razvojni testi pomagajo, vendar ne nadomestijo manjkajočih lastnih mejnih preverjanj.

Dokazi: [pagination.spec.ts:3](../runtime/runs/P05-B-001/submission/tests/agent/pagination.spec.ts#L3), [pagination.spec.ts:28](../runtime/runs/P05-B-001/submission/tests/agent/pagination.spec.ts#L28), [pagination.spec.ts:41](../runtime/runs/P05-B-001/submission/tests/agent/pagination.spec.ts#L41), [P05-B-001-checks.md#item_28](../analysis/evidence/P05-B-001-checks.md#item_28).

Končna neodvisna ocena potrdi 70/70, 12/12 in strogi uspeh. Potrjene funkcionalne napake ni; vsebinska vrzel sledljivosti in omejen obseg lastnih testov sta ločeni oceni.

Implementerjev prvi check ima 47 uspehov in dve odpovedi v lastnih testih: napačno pričakovano število opravil todo in primerjava vrstnega reda table kot vrstnega reda API. Popravil je testni pričakovanji; item_23 potrdi 49/49. Po dodatnih preverjanjih osvežitve in ohranitve druge strani item_28 znova potrdi 49/49. To sta popravljeni napaki testnih scenarijev, ne dokazana popravka funkcionalne kode. Pregledovalec ni zahteval dodatnega popravka.

## P05-C-001

**Pokritost specifikacije: 2.** Specifikacija pokrije vseh dvanajst zahtev, prazne in krajše strani, vse filtre/velikosti, skupni odsek pogledov, različne osnove števcev ter natančne ponastavitve. Posebej zahteva reset tudi, kadar bi prejšnja številka strani še obstajala, in loči načrtovana preverjanja od izvedenih dokazov.

Dokazi: [spec.md#zahteve-in-pravila](../runtime/runs/P05-C-001/submission/docs/agent/P05/spec.md#zahteve-in-pravila), [spec.md#dogovor-o-vmesniku-in-ohranjene-omejitve](../runtime/runs/P05-C-001/submission/docs/agent/P05/spec.md#dogovor-o-vmesniku-in-ohranjene-omejitve).

**Predikati in invariante: 2.** T/F/N/Y/D in indeksni razpon imajo preverljive definicije s posebnima vejama all in praznim rezultatom. Navedeni so disjunktnost in popolna združitev strani, ohranjeni lokalni prehodi, pogoji onemogočenih gumbov ter nespremenljivost izvornih opravil in API. Za prazni prikaz je izrecno določena stran 0 ob lokalni začetni strani 1.

Dokazi: [spec.md#model-in-predikati](../runtime/runs/P05-C-001/submission/docs/agent/P05/spec.md#model-in-predikati), [spec.md#zahteve-in-pravila](../runtime/runs/P05-C-001/submission/docs/agent/P05/spec.md#zahteve-in-pravila).

**Sledljivost: 1.** Specifikacija ima matriko R01–R12, vendar ostane pri načrtovanih mestih in oznaki Ni še izvedeno. Plan in tasks povežeta skupine zahtev z datotekami, verification.md pa vseh dvanajst združi v eno vrstico Preverjanje v teku. Arhivirani item_30 sicer potrdi 51 passed, a model pred časovno omejitvijo ni dokončal predaje po zahtevah; T009 ostane odprt in converge ni izveden. Nepreverjenega ni lažno označil za potrjeno, toda povezave do dejanskih končnih dokazov so le delne.

Dokazi: [spec.md#izvedba-in-sledljivost](../runtime/runs/P05-C-001/submission/docs/agent/P05/spec.md#izvedba-in-sledljivost), [tasks.md#polish-in-preverjanje](../runtime/runs/P05-C-001/submission/docs/agent/P05/tasks.md#polish-in-preverjanje), [verification.md](../runtime/runs/P05-C-001/submission/docs/agent/verification.md), [P05-C-001-checks.md#item_30](../analysis/evidence/P05-C-001-checks.md#item_30), [execution.json](../runtime/runs/P05-C-001/execution.json).

**Organizacija kode: 2.** ProjectView hrani tri neodvisna lokalna stanja in izpelje filtrirani odsek, razpon ter status. Tabela in tabla dobita pageTasks, celotni števci pa projectTasks. Projektni ključ upravlja ponastavitev in ni podvojene straničitvene logike v TaskBoard. Manjša nedoslednost zamika JSX ne ovira sledljivosti odgovornosti in podatkovnega toka.

Dokazi: [App.tsx:14](../runtime/runs/P05-C-001/submission/src/App.tsx#L14), [App.tsx:19](../runtime/runs/P05-C-001/submission/src/App.tsx#L19), [App.tsx:74](../runtime/runs/P05-C-001/submission/src/App.tsx#L74), [TaskBoard.tsx:13](../runtime/runs/P05-C-001/submission/src/TaskBoard.tsx#L13).

**Lastna preverjanja: 2.** Pet končnih lastnih scenarijev preveri vseh šest odsekov enajstih opravil pri velikosti 2, izbiro 5/10/all, reset še veljavne druge strani, vse filtre in mešane poglede. Dodani so ohranitev podrobnosti, menjava projekta/osvežitev, prazen projekt/filter, števci vidne table, odsotnost zapisov in širina 390 px. Prvi dve napačni testni pripravi sta popravljeni, item_30 pa dejansko potrdi vseh pet lastnih testov. To je smiseln nabor negativnih in mejnih primerov, čeprav ne preizkusi vseh možnih kombinacij.

Dokazi: [P05.pagination.spec.ts:3](../runtime/runs/P05-C-001/submission/tests/agent/P05.pagination.spec.ts#L3), [P05.pagination.spec.ts:31](../runtime/runs/P05-C-001/submission/tests/agent/P05.pagination.spec.ts#L31), [P05.pagination.spec.ts:79](../runtime/runs/P05-C-001/submission/tests/agent/P05.pagination.spec.ts#L79), [P05-C-001-checks.md#item_30](../analysis/evidence/P05-C-001-checks.md#item_30).

Neodvisno 70/70 in 12/12, toda status phase_time_limit po 1081,068 s; implementacija je dosegla svojo mejo 456,793 s (opaženo 456,831 s). Converge ni zagnan, zato strogi uspeh manjka. To je procesni neuspeh v vnaprej določenem proračunu, ne potrjena končna funkcionalna napaka. Celotna poraba je neznana; opažena spodnja meja je 4429360 vhodnih in 49069 izhodnih tokenov.

Prvi check ima 48 uspešnih preverjanj in dve odpovedi lastnih scenarijev: klik Naslednja na projektu z le dvema opraviloma ter ponovna namestitev GET prestreznikov v istem testu. Po razširitvi drugega projekta na tri opravila in ločitvi praznega primera item_30 potrdi 51/51. Časovna meja nastopi pred končno dokumentacijsko predajo; uspešen zagon v dogodkih ni dokaz zaključenega postopka.
