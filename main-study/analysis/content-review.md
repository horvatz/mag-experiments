# Vsebinska presoja glavnih oddaj

**AI-podprta, neslepa vsebinska presoja.** Ocenjevalec: Codex, raziskovalčev pomočnik, zunaj merjene seje. To niso človeške ocene in soglasje med ocenjevalci ni izmerjeno.

Pregledanih je 3/24 vnaprej določenih oddaj (ponovitev 001 za P03–P10 in A/B/C). Ocene po dimenzijah se ne seštevajo v skupno kakovost.

| Oddaja | Specifikacija | Predikati | Sledljivost | Koda | Lastni testi |
| --- | --- | --- | --- | --- | --- |
| [P05-A-001](reviews/P05-A-001.json) | 2 | 2 | 2 | 2 | 2 |
| [P05-B-001](reviews/P05-B-001.json) | 2 | 2 | 2 | 2 | 2 |
| [P05-C-001](reviews/P05-C-001.json) | 2 | 2 | 2 | 2 | 2 |

Brez zaključene presoje: P10-A-001, P10-C-001, P10-B-001, P06-A-001, P06-C-001, P06-B-001, P08-A-001, P08-C-001, P08-B-001, P03-A-001, P03-B-001, P03-C-001, P07-A-001, P07-B-001, P07-C-001, P09-A-001, P09-B-001, P09-C-001, P04-A-001, P04-C-001, P04-B-001.

## P05-A-001

**Pokritost specifikacije: 2/2.** Specifikacija pokrije R01–R12, filter pred razrezom, globalni odsek v obeh pogledih, različno osnovo projektnih in stolpčnih števcev, prazno stanje ter ponastavitve. Konkretno loči notranjo stran 1 od prikazanega praznega stanja 0/0.

Dokazi: [specification.md#zahteve-in-pravila](../../runs/P05-A-001/submission/docs/agent/specification.md#zahteve-in-pravila).

**Predikati/invariante: 2/2.** Definirani so T, F, N, k, število strani, indeks odseka ter prazni primer. Preverljivi predikati opišejo neprekrivanje strani, onemogočene robove, prehode stanja, enakost ID-jev pogledov in obe vrsti števcev.

Dokazi: [specification.md#zahteve-in-pravila](../../runs/P05-A-001/submission/docs/agent/specification.md#zahteve-in-pravila).

**Sledljivost: 2/2.** Tabela povezuje vsako R z imenovanimi A/D testi, konkretnimi spremenljivkami oziroma deli kode in dnevnikom. Dnevnik dejansko zaključi 56 passed; ločen zapis odkrito ohrani neuspeh A08 pred popravilom in pove, da so vizualni posnetki pred zadnjo spremembo. Skritih testov ne prikazuje kot agentov dosežek.

Dokazi: [specification.md#izvedba-in-sledljivost](../../runs/P05-A-001/submission/docs/agent/specification.md#izvedba-in-sledljivost), [verification.md](../../runs/P05-A-001/submission/docs/agent/verification.md), [check.log](../../runs/P05-A-001/submission/docs/agent/check.log), [id-accessibility-before.log](../../runs/P05-A-001/submission/docs/agent/id-accessibility-before.log).

**Organizacija kode: 2/2.** Tri lokalna stanja v ProjectView so ločena od izpeljanih filteredTasks, pageCount, visibleTasks in robnih zastavic. Oba prikaza dobita isti odsek; TaskBoard samo združi prejeti seznam. Ponastavitev projekta uporablja njegov ključ, brez podvojenega stanja ali sinhronizacijskih učinkov. JSX je zgoščen, a nova logika je enotna in za obseg naloge sledljiva.

Dokazi: [App.tsx:11](../../runs/P05-A-001/submission/src/App.tsx#L11), [App.tsx:78](../../runs/P05-A-001/submission/src/App.tsx#L78), [App.tsx:122](../../runs/P05-A-001/submission/src/App.tsx#L122), [TaskBoard.tsx:13](../../runs/P05-A-001/submission/src/TaskBoard.tsx#L13).

**Lastna preverjanja: 2/2.** Deset lastnih scenarijev preveri 13 neurejenih ID-jev, celotne razdelitve 2/5/10, onemogočene klike, ponastavitev še veljavne strani, nefiltrirane skupne števce, prazen in enočlenski projekt, zgodovino/podrobnosti ter ID s presledkom in rezerviranimi znaki. A08 je dejansko odkril napako dostopnega imena, ki jo je agent popravil. Lastni scenariji niso vsi izvedeni dvakrat po napravah; A08 posebej preveri širino 390 px.

Dokazi: [P05.spec.ts](../../runs/P05-A-001/submission/tests/agent/P05.spec.ts), [id-accessibility-before.log](../../runs/P05-A-001/submission/docs/agent/id-accessibility-before.log), [check.log](../../runs/P05-A-001/submission/docs/agent/check.log).

Končna napaka: Neodvisna ocena je uspešna 70/70; v pregledani končni oddaji ni potrjene napake. To ni dokaz pravilnosti za vse možne vhode.

Razvojni popravek: Lastni A08 z ID-jem č /2?x=#% je pred popravilom razkril neustrezno aria-labelledby povezavo. Končna kartica uporablja neposredno aria-label; končna lastna in neodvisna preverjanja uspejo.

## P05-B-001

**Pokritost specifikacije: 2/2.** Predana specifikacija jasno pokrije R01–R12, prazno in še nenaloženo stanje, stabilni filter pred odsekom, identiteto po ID-jih, razlike med števci in ohranitev stanja pri pogledih/podrobnostih. Loči načrtovane scenarije od dejansko izvedenih preverjanj.

Dokazi: [specification.md](../../runs/P05-B-001/submission/docs/agent/specification.md).

**Predikati/invariante: 2/2.** T/F/V, število strani in prikazani indeksi imajo izrecne formule, vključno z N=0 in all. Določene so disjunktne strani s popolno konkatenacijo, prehodi lokalne trojice ter onemogočanje robov. Pravila so dovolj konkretna za preverjanje neodvisno od zapisa kode.

Dokazi: [specification.md#zahteve-in-pravila](../../runs/P05-B-001/submission/docs/agent/specification.md#zahteve-in-pravila).

**Sledljivost: 2/2.** Specifikacija ostane označena kot začetna predaja. Implementer v verification.md doda dejanske lokacije, S01–S05/D01–D04 in izide R01–R12; check.log potrdi 56 passed. Pregledovalec izrecno razkrije, da se je oprl na predani dnevnik in posnetke, brez lastnega ponovnega zagona. Prvi neuspešni lastni test je shranjen in pojasnjen.

Dokazi: [verification.md#dejanska-sledljivost-r01r12](../../runs/P05-B-001/submission/docs/agent/verification.md#dejanska-sledljivost-r01r12), [check.log](../../runs/P05-B-001/submission/docs/agent/check.log), [check-initial.log](../../runs/P05-B-001/submission/docs/agent/check-initial.log), [review.json](../../runs/P05-B-001/submission/docs/agent/review.json).

**Organizacija kode: 2/2.** Lokalna stanja velikosti/filtra/strani so ločena od izpeljanega skupnega odseka in robnih zastavic. Oba pogleda uporabljata visibleTasks, obstoječi TaskBoard pa samo združuje prejete podatke. Projektni števci ostanejo nad izvorom, življenjska doba projekta zagotovi ponastavitev brez podvojenih učinkov. Nova logika je zgoščena v ProjectView, vendar za ta obseg razumljiva in brez znatnega podvajanja.

Dokazi: [App.tsx:13](../../runs/P05-B-001/submission/src/App.tsx#L13), [App.tsx:65](../../runs/P05-B-001/submission/src/App.tsx#L65), [TaskBoard.tsx:13](../../runs/P05-B-001/submission/src/TaskBoard.tsx#L13).

**Lastna preverjanja: 2/2.** Pet scenarijev na dveh širinah preveri celotne razdelitve 13 opravil, kratke zadnje strani, onemogočene klike, filter pred razrezom, mešano tablo, oba tipa števcev, 0/1 element, ponastavitve, poseben ID ter nič zapisov API. Prvi zagon je dejansko padel zaradi testne predpostavke o tipki End, popravek je dokumentiran in končni zagon uspe. Pomočnik readonly, uporabljen tudi v S05, poleg zapisovalnih zahtev preveri, da dokument ne presega širine zaslona; visual-check.json poda še ločen posnetek geometrije.

Dokazi: [pagination.spec.ts](../../runs/P05-B-001/submission/tests/agent/pagination.spec.ts), [check-initial.log](../../runs/P05-B-001/submission/docs/agent/check-initial.log), [check.log](../../runs/P05-B-001/submission/docs/agent/check.log), [visual-check.json](../../runs/P05-B-001/submission/docs/agent/visual-check.json).

Končna napaka: Neodvisna ocena je uspešna 70/70; v pregledani končni oddaji ni potrjene napake glede na uporabljena merila. To ni dokaz pravilnosti za vse vhode.

Razvojni popravek: S05 je na obeh širinah najprej predpostavil, da End izbere zadnjo možnost izvornega selecta. Po pregledu vedenja oddaljenega Chromiuma je implementer uporabil črko k in Enter. Popravljen je bil lastni test, produkcijska koda se zaradi tega ni spremenila.

## P05-C-001

**Pokritost specifikacije: 2/2.** Specifikacija P05/spec.md skladno pokrije R01–R12, domeno 0/1/več elementov, ločitev celotnega/filtriranega/vidnega polja, prazno stanje, oba pogleda, ponastavitve in ohranitev podatkov. Štirje uporabniški scenariji konkretno povežejo zahteve, ne uvajajo dodatnih meril zunaj naloge.

Dokazi: [spec.md](../../runs/P05-C-001/submission/docs/agent/P05/spec.md).

**Predikati/invariante: 2/2.** Definicije F, V, Y, X, A in B ločijo all in prazni primer. Izrecno so zapisani disjunktnost in popolna konkatenacija strani, relativni vrstni red stolpcev, različna osnova števcev, identitetni prehodi ob podrobnostih ter robna omogočenost gumbov.

Dokazi: [spec.md#model-in-predikati](../../runs/P05-C-001/submission/docs/agent/P05/spec.md#model-in-predikati).

**Sledljivost: 2/2.** Specifikacija poveže vseh 12 zahtev z izvedbeno tabelo, dejanskimi imeni lastnih testov, deli kode in dvema dnevnikoma preverjanja. Zapis pošteno loči prvi neuspešni celotni zagon (54 uspehov, dve napaki lastnih korakov) od ciljnega ponovnega zagona desetih testov. Ne trdi, da je zadnji celotni npm run check uspel. Convergence.json razkrije, da korak converge ni ponovno izvajal testov.

Dokazi: [verification.md#sledljivost-r01r12](../../runs/P05-C-001/submission/docs/agent/verification.md#sledljivost-r01r12), [check.log](../../runs/P05-C-001/submission/docs/agent/P05/check.log), [agent-recheck.log](../../runs/P05-C-001/submission/docs/agent/P05/agent-recheck.log), [convergence.json](../../runs/P05-C-001/submission/docs/agent/convergence.json).

**Organizacija kode: 2/2.** ProjectView hrani samo tri neodvisna lokalna stanja, odsek in števce pa izpelje brez vzporednih kopij. Ločena dogodka changePageSize/changeFilter jasno zagotavljata ponastavitev strani. Preglednica in nespremenjeni TaskBoard uporabljata isti visibleTasks. Načrt šestih odločitev se ujema s končno omejeno spremembo App.tsx in slogov.

Dokazi: [App.tsx:13](../../runs/P05-C-001/submission/src/App.tsx#L13), [App.tsx:25](../../runs/P05-C-001/submission/src/App.tsx#L25), [plan.md#odločitve-in-podatkovni-tok](../../runs/P05-C-001/submission/docs/agent/P05/plan.md#odločitve-in-podatkovni-tok).

**Lastna preverjanja: 2/2.** Deset lastnih scenarijev preveri vse odseke 13 opravil pri 2/5/10, robne gumbe, še veljavno prejšnjo stran, filtre in števce, podrobnosti ter fokus, projekte/osvežitev, 0/1 element in neujemajoči filter. Mobilni scenarij preveri tipkovnico in fokus, pomočnik readonly pa odsotnost zapisov in širjenje dokumenta; dodana je primerjava stanja podatkov. Popravka dveh neveljavnih klikov v lastnem testu sta ohranjena in vseh deset je dejansko ponovno uspelo. To ni izčrpno preverjanje domene.

Dokazi: [P05.spec.ts](../../runs/P05-C-001/submission/tests/agent/P05.spec.ts), [helpers.ts:68](../../runs/P05-C-001/input-overrides/tests/development/helpers.ts#L68), [check.log](../../runs/P05-C-001/submission/docs/agent/P05/check.log), [agent-recheck.log](../../runs/P05-C-001/submission/docs/agent/P05/agent-recheck.log).

Končna napaka: Neodvisna ocena je uspešna 70/70; v pregledani končni oddaji ni potrjene napake po uporabljenih merilih. To ne dokazuje pravilnosti za vse vhode.

Razvojni popravek: Dva lastna testna koraka sta kliknila pravilno onemogočena navigacijska gumba (Prva stran pri velikosti 10 in Zadnja stran v zaporedju filtrov). Agent je popravil koraka, ohranil trditve o ciljnih ID-jih in robovih ter uspešno ponovil lastne teste, brez spremembe produkcijske kode.
