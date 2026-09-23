# Vsebinska presoja glavnih oddaj

**AI-podprta, neslepa vsebinska presoja.** Ocenjevalec: Codex, raziskovalčev pomočnik, zunaj merjene seje. To niso človeške ocene in soglasje med ocenjevalci ni izmerjeno.

Vsebinsko ocenjenih je 12/24 vnaprej določenih oddaj (ponovitev 001 za P03–P10 in A/B/C). Za 1 izbranih oddaj je dokumentirana nezmožnost ocene; ocene ostanejo manjkajoče, ne ničelne. Ocene po dimenzijah se ne seštevajo v skupno kakovost.

| Oddaja | Status presoje | Specifikacija | Predikati | Sledljivost | Koda | Lastni testi |
| --- | --- | --- | --- | --- | --- | --- |
| [P05-A-001](reviews/P05-A-001.json) | ocenjeno | 2 | 2 | 2 | 2 | 2 |
| [P05-B-001](reviews/P05-B-001.json) | ocenjeno | 2 | 2 | 2 | 2 | 2 |
| [P05-C-001](reviews/P05-C-001.json) | ocenjeno | 2 | 2 | 2 | 2 | 2 |
| [P10-A-001](reviews/P10-A-001.json) | ocenjeno | 2 | 2 | 2 | 2 | 2 |
| [P10-C-001](reviews/P10-C-001.json) | ocenjeno | 2 | 2 | 2 | 2 | 2 |
| [P10-B-001](reviews/P10-B-001.json) | ocenjeno | 2 | 2 | 2 | 2 | 2 |
| [P06-A-001](reviews/P06-A-001.json) | ocenjeno | 2 | 2 | 2 | 2 | 2 |
| [P06-C-001](reviews/P06-C-001.json) | ocenjeno | 2 | 2 | 1 | 2 | 2 |
| [P06-B-001](reviews/P06-B-001.json) | ocenjeno | 2 | 2 | 2 | 2 | 2 |
| [P08-A-001](reviews/P08-A-001.json) | ocenjeno | 2 | 2 | 2 | 2 | 2 |
| [P08-C-001](reviews/P08-C-001.json) | ocenjeno | 2 | 2 | 2 | 2 | 2 |
| [P08-B-001](reviews/P08-B-001.json) | ocenjeno | 2 | 2 | 2 | 2 | 2 |
| [P03-A-001](reviews/P03-A-001.json) | ocena ni mogoča | — | — | — | — | — |

Še neobravnavane izbrane oddaje: P03-B-001, P03-C-001, P07-A-001, P07-B-001, P07-C-001, P09-A-001, P09-B-001, P09-C-001, P04-A-001, P04-C-001, P04-B-001.

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

## P10-A-001

**Pokritost specifikacije: 2/2.** Specifikacija skladno obravnava vseh 12 zahtev, identiteto po ID-jih, globalne sosede tudi na tabli, prazne in enočlenske projekte, omejitev 20 korakov ter življenjsko dobo ob menjavi pogleda, podrobnosti, projekta in osvežitvi. Izrecno loči veljavni reset od dejanja brez učinka pri začetnem redu in nepraznem skladu ponovitev.

Dokazi: [specification.md](../../runs/P10-A-001/submission/docs/agent/specification.md).

**Predikati/invariante: 2/2.** Model (I,P,U,R) podaja preverljive prehode za premik, undo, redo in reset ter identiteto pri neveljavnem dejanju. Določene so permutacije brez izgube in podvajanja, omejitev sklada, stabilni podseznami po stanju in globalna mesta. Formalizacija določa tudi ohranitev redo pri neveljavnem premiku ali resetu brez učinka.

Dokazi: [specification.md#zahteve-in-pravila](../../runs/P10-A-001/submission/docs/agent/specification.md#zahteve-in-pravila).

**Sledljivost: 2/2.** Vsaka R ima povezavo do konkretnega dela modela ali prikaza, imenovanih D/A scenarijev in dejanskega dnevnika. Končni dnevnik potrjuje 55 uspešnih preverjanj (38 izhodišče, 8 skupnih, 9 lastnih). Zapis ohrani prejšnji zastoj pri tipih in jasno razmeji ročni pregled, dodatni modelni test ter nedostopne skrite teste. Omejitve 600-koračnega vzorca in mobilne emulacije so izrecne.

Dokazi: [specification.md#izvedba-in-sledljivost](../../runs/P10-A-001/submission/docs/agent/specification.md#izvedba-in-sledljivost), [verification.md](../../runs/P10-A-001/submission/docs/agent/verification.md), [check-final.log](../../runs/P10-A-001/submission/docs/agent/check-final.log), [check-types-failed.log](../../runs/P10-A-001/submission/docs/agent/check-types-failed.log).

**Organizacija kode: 2/2.** Čisti reducer loči permutacije in sklada od objektov Task. TaskList upravlja življenjsko dobo stanja ter izpelje projekcijo iz ID-jev, TaskOrderControls deli kontrole med pogledoma, TaskBoard zgolj filtrira urejene podatke in izpelje globalna mesta. Ključ projekta v App zagotovi ponastavitev ob menjavi projekta. Podvajanje prehodov je omejeno s skupnim commit; neveljavni prehodi vrnejo izvirno stanje.

Dokazi: [taskOrder.ts](../../runs/P10-A-001/submission/src/taskOrder.ts), [TaskList.tsx](../../runs/P10-A-001/submission/src/TaskList.tsx), [TaskOrderControls.tsx](../../runs/P10-A-001/submission/src/TaskOrderControls.tsx), [TaskBoard.tsx](../../runs/P10-A-001/submission/src/TaskBoard.tsx), [App.tsx](../../runs/P10-A-001/submission/src/App.tsx).

**Lastna preverjanja: 2/2.** Lastni scenariji preverijo vseh 20 dosegljivih undo/redo korakov po 21 različnih premikih, ponastavitev pri polnem skladu, neveljavne akcije z nepraznim redo, stabilne stolpce, življenjsko dobo obeh skladov, 0/1 opravilo, posebni ID in 390 px. Reducer primerjajo s časovnico in kazalcem skozi 600 determinističnih dejanj ter zamrznejo stare strukture za preverjanje nespremenljivosti. To dopolni UI teste z drugače organiziranim orakljem; ne predstavlja izčrpnega dokaza. Vseh devet lastnih preverjanj je v končnem uspešnem zagonu.

Dokazi: [order.spec.ts](../../runs/P10-A-001/submission/tests/agent/order.spec.ts), [check-final.log](../../runs/P10-A-001/submission/docs/agent/check-final.log).

Končna napaka: Neodvisna ocena je uspešna 70/70; v pregledani končni oddaji ni potrjene napake. To ni dokaz pravilnosti za vse možne vhode.

Razvojni popravek: Po dodajanju lastnih testov je preverjanje tipov javilo tri TS2339 v oraklju, ker unija OrderAction ni omogočala pričakovanega zoženja. Agent je razcepil nemutacijska dejanja v ločene diskriminirane različice in nato uspešno ponovil celotni pregled s 55 testi. V neuspešnem zagonu testi še niso stekli; to je razvojna tipovna napaka, ne neuspeh končne funkcionalne ocene.

## P10-C-001

**Pokritost specifikacije: 2/2.** Specifikacija pokrije R01–R12 s splošno domeno 0/1/>10 opravil, identiteto po ID-jih in enakimi naslovi. Izrecno določi globalne sosede tudi med stolpci, največ 20 posnetkov, ponastavitev kot novo dejanje in ohranitev redo pri dejanju brez učinka. Določeni so življenjska doba, lokalnost, nespremenjeni podatki in natančne dostopne oznake novih kontrol.

Dokazi: [spec.md](../../runs/P10-C-001/submission/docs/agent/P10/spec.md).

**Predikati/invariante: 2/2.** P1–P8 opredelijo začetno stanje, permutacije, celotne posnetke in nespremenljivost podatkov ter natančne prehode obeh skladov pri move/undo/redo/reset. Predikati pokrijejo neveljavne indekse, omejitev zgodovine, stabilno filtriranje table in ponastavitve ob navigaciji. Scenariji S1–S6 so povezani s temi splošnimi pravili.

Dokazi: [spec.md#model-in-pravila-spremembe-stanja](../../runs/P10-C-001/submission/docs/agent/P10/spec.md#model-in-pravila-spremembe-stanja).

**Sledljivost: 2/2.** Osrednja tabela poveže vseh 12 zahtev s P/S pogoji, konkretnimi simboli ter poimenovanimi M/A/D testi. Končni dnevnik dejansko vsebuje 58 uspešnih preverjanj. Ohranjena sta prejšnja neuspeha, jasno sta označena nedostopnost skritih testov in omejitev pregleda obsega po časih datotek. Converge izrecno pove, da ni ponavljal testov, in ne predstavlja dodatnega neodvisnega testnega zagona.

Dokazi: [verification.md](../../runs/P10-C-001/submission/docs/agent/verification.md), [check.log](../../runs/P10-C-001/submission/docs/agent/P10/check.log), [check-first.log](../../runs/P10-C-001/submission/docs/agent/P10/check-first.log), [check-second.log](../../runs/P10-C-001/submission/docs/agent/P10/check-second.log), [convergence.json](../../runs/P10-C-001/submission/docs/agent/convergence.json).

**Organizacija kode: 2/2.** Čisti reducer upravlja ID-je in sklada; ProjectTasks vsebuje lokalno stanje ter projekcijo na izvorne objekte. TaskOrderControls je skupen obema pogledoma, tabla pa izpelje globalna mesta pred filtriranjem. Ključ projekta določa ponastavitev. Dodana komponenta ostane v App.tsx, vendar je odgovornost stanja ločena od nalaganja in podrobnosti; prehodi niso podvojeni v prikazih.

Dokazi: [taskOrder.ts](../../runs/P10-C-001/submission/src/taskOrder.ts), [App.tsx](../../runs/P10-C-001/submission/src/App.tsx), [TaskOrderControls.tsx](../../runs/P10-C-001/submission/src/TaskOrderControls.tsx), [TaskBoard.tsx](../../runs/P10-C-001/submission/src/TaskBoard.tsx).

**Lastna preverjanja: 2/2.** Pet modelnih in sedem uporabniških preverjanj pokrije nespremenljivost zamrznjenih struktur, 21 različnih modelnih premikov in vsak od 20 undo/redo korakov, neveljavne akcije z redo, razveljavljivi reset, mejo zgodovine prek UI, oba pogleda, navigacijo, prazne projekte ter tipkovnico pri 390 px. Po popravkih testov je celotni pregled ponovljen in uspešen. UI ponavljanje premikov uporablja dve stanji, modelni test pa različne permutacije. Lastni podatki ne vključujejo ID-ja s presledkom; dodatni pregled je pri tem odkril podedovano omejitev dostopnega imena kartice, ločeno od zahtevnih lastnosti zgodovine in zamrznjene funkcionalne ocene.

Dokazi: [taskOrder.spec.ts](../../runs/P10-C-001/submission/tests/agent/taskOrder.spec.ts), [P10.spec.ts](../../runs/P10-C-001/submission/tests/agent/P10.spec.ts), [check.log](../../runs/P10-C-001/submission/docs/agent/P10/check.log), [board-accessibility.json](../../main-study/analysis/diagnostics/board-accessibility.json), [README.md](../../main-study/analysis/diagnostics/README.md).

Končna napaka: Zamrznjena neodvisna ocena ostaja uspešna 70/70 in 12/12. Ločen raziskovalni pregled statično izrisane kartice je potrdil nerazrešene sklice aria-labelledby za ID s presledkom; omejitev obstaja tudi v izhodišču. Ta naknadni pregled ni del primarnega merila in ni preizkus navigacije ali bralnika zaslona.

Razvojni popravek: Prvi check je obstal pri TS2353 zaradi nepodprte možnosti disabled v dveh lastnih trditvah. Drugi je dosegel 57/58; test A06 je po miškini navigaciji napačno pričakoval vidni fokus po programskem focus(). Agent je uporabil podprto toBeEnabled({enabled}) in pravo Tab/Shift+Tab navigacijo, ohranil preverjanje obrisa ter ponovil celotni check z izidom 58/58. Popravka sta bila v lastnih testih.

## P10-B-001

**Pokritost specifikacije: 2/2.** Predana specifikacija pokrije vseh 12 zahtev, poljubne enkratne ID-je, globalne sosede na tabli, oba sklada, mejo 20 in razveljavljivo ponastavitev. Konkretno razmeji no-op od nove veje, stanje že izvornega reda od praznih skladov ter življenjsko dobo ob navigaciji, projektu in osvežitvi. Scenariji vključijo tudi napako podrobnosti z ohranitvijo zgodovine.

Dokazi: [specification.md](../../runs/P10-B-001/submission/docs/agent/specification.md).

**Predikati/invariante: 2/2.** Model T/O/P/U/R/M opredeli inicializacijo, polne nespremenljive posnetke, enakost zaporedij in invarianto ID-jev. Za vsako dejanje so preverljivi predpogoji ter rezultat obeh skladov; določeni so tail20, globalna mesta in stabilni podseznami table. S02 poda konkretne pričakovane permutacije, S04 pa pot do meje zgodovine in nazaj.

Dokazi: [specification.md#zahteve-in-pravila](../../runs/P10-B-001/submission/docs/agent/specification.md#zahteve-in-pravila).

**Sledljivost: 2/2.** Specifikatorjeva tabela je pravilno označena kot načrt in ostane v njegovi lasti; končna tabela v verification.md poveže vsako R s simboli ter dejanskimi D/S testi in check.log. Dnevnik potrdi 53 uspešnih preverjanj. Implementator jasno označi manjkajoči primer napake podrobnosti; pregledovalec ga dodatno izvede v štirih kombinacijah pogleda in širine. Dogodek item_18 v arhivu pregledovalca potrjuje štiri PASS in izhod 0, celotnega check pa pregledovalec odkrito ne ponovi.

Dokazi: [specification.md](../../runs/P10-B-001/submission/docs/agent/specification.md), [verification.md](../../runs/P10-B-001/submission/docs/agent/verification.md), [check.log](../../runs/P10-B-001/submission/docs/agent/check.log), [review.md](../../runs/P10-B-001/submission/docs/agent/review.md), [events.jsonl.gz](../../runs/P10-B-001/phases/03-review/events.jsonl.gz).

**Organizacija kode: 2/2.** Samostojni reducer upravlja original/present/undo/redo in skupno omejevanje zgodovine. ProjectTasks se namesti po nalaganju, hrani ID-je ter izpelje Task objekte; projektni ključ loči življenjsko dobo. Skupne kontrole so uporabljene v preglednici in tabli, globalna mesta nastanejo pred filtriranjem stolpcev. Neposredno dostopno ime kartice ohrani naslove in ID-je tudi s presledki. Nalaganje in podrobnosti ostaneta ločena od zgodovine.

Dokazi: [taskOrder.ts](../../runs/P10-B-001/submission/src/taskOrder.ts), [App.tsx](../../runs/P10-B-001/submission/src/App.tsx), [TaskOrderControls.tsx](../../runs/P10-B-001/submission/src/TaskOrderControls.tsx), [TaskBoard.tsx](../../runs/P10-B-001/submission/src/TaskBoard.tsx).

**Lastna preverjanja: 2/2.** Sedem testov združi dva modelna in pet brskalniških scenarijev: neveljavna dejanja z redo, 21 premikov in 20 undo/redo, reset pri polni zgodovini, točne permutacije, posebne ID-je, podrobnosti ter 0/1 opravilo in mobilni UI. Modelni test zgodovine primerja shranjene dejanske posnetke; dodatne UI trditve preverijo konkretna zaporedja, globalna mesta in oba sklada. Pregledovalec posebej dopolni preizkus 503/retry v obeh pogledih in širinah, z API zapisi, napakami strani in geometrijo. Te štiri preverbe so ločene od 53 testov implementatorja in od končnih 70.

Dokazi: [order.spec.ts](../../runs/P10-B-001/submission/tests/agent/order.spec.ts), [check.log](../../runs/P10-B-001/submission/docs/agent/check.log), [review.md](../../runs/P10-B-001/submission/docs/agent/review.md), [events.jsonl.gz](../../runs/P10-B-001/phases/03-review/events.jsonl.gz).

Končna napaka: Neodvisna ocena je uspešna 70/70; v pregledani končni oddaji ni potrjene napake. To ni dokaz pravilnosti za vse možne vhode.

Razvojni popravek: Implementatorjev prvi check je obstal zaradi nepodprte možnosti disabled v lastnem testu; popravil jo je v toBeEnabled({enabled}) in ponovil celotni pregled s 53 uspešnimi testi. Pregledovalčev prvi dodatni preizkus je napačno vrnil 503 le za en GET; zaradi razvojnega StrictMode je naslednji GET že uspel. Simulacijo je spremenil v trajen 503 do izrecnega ponovnega poskusa. Končni dodatni zagon ima štiri PASS; aplikacijska koda se zaradi teh napak testiranja ni spreminjala.

## P06-A-001

**Pokritost specifikacije: 2/2.** Specifikacija pokrije vseh 12 zahtev: kanonične kolone, izvorni vrstni red, filter samo za izvoz, prazne izbore, ime in BOM, obe ločili, navedbo vseh vrednosti, CRLF in nevtralizacijo pred navedbo. Jasno opredeli ohranitev nastavitev med pogledoma, ponastavitve ter lokalnost in nespremenjene podatke.

Dokazi: [specification.md](../../runs/P06-A-001/submission/docs/agent/specification.md).

**Predikati/invariante: 2/2.** T/C/S/f/d določijo kanonični izbor K in filtrirane vrstice E, enabled pa je ekvivalenca nepraznega K in E. Funkcije danger/neutral/quote in celotna sestava UTF-8 datoteke so preverljivo opredeljene, vključno z notranjimi prelomi in končnim CRLF. Izrecni sta identiteta nastavitev ob preklopu pogleda in invarianta izvornih podatkov.

Dokazi: [specification.md#zahteve-in-pravila](../../runs/P06-A-001/submission/docs/agent/specification.md#zahteve-in-pravila).

**Sledljivost: 2/2.** Vsaka R je povezana z imenovanimi D/A testi, dejanskim delom kode in končnim dnevnikom. Dnevnika potrjujeta 46 ter 54 uspešnih preverjanj. Zapis odkrito loči preverjanje bajtov od neizvedenega uvoza v preglednične programe in ročnega preverjanja sistemskega dialoga. Razkrije tudi popravek pomožnega zajema slik; ne prikazuje skritih testov kot lastnega dokaza.

Dokazi: [specification.md](../../runs/P06-A-001/submission/docs/agent/specification.md), [verification.md](../../runs/P06-A-001/submission/docs/agent/verification.md), [check-initial.log](../../runs/P06-A-001/submission/docs/agent/check-initial.log), [check-final.log](../../runs/P06-A-001/submission/docs/agent/check-final.log), [visual-check.log](../../runs/P06-A-001/submission/docs/agent/visual-check.log).

**Organizacija kode: 2/2.** Čista funkcija createCsv loči serializacijo od vmesnika in prenosa. CsvExport vsebuje tri lokalne nastavitve, izpeljane vrstice ter skupni pogoj enabled za gumb in obdelovalnik. App ohrani komponento med preklopi in uporabi ključ projekta za ponastavitev. Kanonične kolone so enoten vir, podatki se ne mutirajo, objektni URL pa se sprosti po začetku prenosa.

Dokazi: [csv.ts](../../runs/P06-A-001/submission/src/csv.ts), [CsvExport.tsx](../../runs/P06-A-001/submission/src/CsvExport.tsx), [App.tsx](../../runs/P06-A-001/submission/src/App.tsx).

**Lastna preverjanja: 2/2.** Osem dodatnih preverjanj vsebuje ročno zapisane pričakovane nize in dejanske prenesene Buffer bajte, ne le ponovne uporabe serializatorja kot oraklja. Pokrije oba separatorja, mešane CR/LF/CRLF, citate, Unicode, nevarne in varne začetke (tudi NBSP/VT/FF), zamrznjene vhode, 13 nesortiranih vrstic, vse filtre, nič kolon, prazne projekte, ponastavitve in oba pogleda. A07 preveri BOM, celotne bajte in odsotnost omrežnih zahtev; A08 še tipkovnico in geometrijo kontrol pri 390 px. Vseh osem je v končnem uspešnem zagonu.

Dokazi: [csv.spec.ts](../../runs/P06-A-001/submission/tests/agent/csv.spec.ts), [export.spec.ts](../../runs/P06-A-001/submission/tests/agent/export.spec.ts), [check-final.log](../../runs/P06-A-001/submission/docs/agent/check-final.log).

Končna napaka: Neodvisna ocena je uspešna 70/70; v pregledani končni oddaji ni potrjene napake. To ni dokaz pravilnosti za vse možne vhode.

Razvojni popravek: Pomožni vizualni zajem sprva ni počakal na preklop v tablo in je napačno označil posnetek preglednice. Agent je dodal čakanje na regijo Tabla opravil in ponovno ustvaril končne posnetke. Gre za popravek dokazila oziroma pomožne skripte; oba celotna testna zagona sta bila uspešna in aplikacija zaradi tega ni bila popravljena.

## P06-C-001

**Pokritost specifikacije: 2/2.** Specifikacija jasno pokrije R01–R12, kanonični vrstni red kolon, stabilni filter samo izvoza, praznine, ime in BOM, obe ločili, navedbo in CRLF ter nevtralizacijo pred navedbo. Loči preklop pogleda od ponastavitve projekta/osvežitve in opredeli odsotnost zapisovalnih stranskih učinkov. Meja domene ID-jev in datumov ter nezaznana odpoved brskalnikovega shranjevanja sta izrecni.

Dokazi: [spec.md](../../runs/P06-C-001/submission/docs/agent/P06/spec.md).

**Predikati/invariante: 2/2.** K, H, E, D, canExport, N in Q določajo preverljive funkcije in predikate. Definicija UTF-8 datoteke vključuje BOM in zadnji CRLF; pravilo N razlikuje dovoljene začetne znake od drugih presledkov. Tabela prehodov določa, katere spremenljivke se ohranijo pri preklopu, izvozu ter menjavi projekta. Invarianta ohranja izvorne vrednosti in vrstni red T.

Dokazi: [spec.md#simboli-in-predikati](../../runs/P06-C-001/submission/docs/agent/P06/spec.md#simboli-in-predikati).

**Sledljivost: 1/2.** Predhodna specifikacija poveže vseh 12 zahtev s preverljivimi S01–S07, načrt in T002–T006 pa jih povežejo z datotekami in dodatnimi testi. Končna sledljivost ni dopolnjena: vseh 12 vrstic še navaja Ni izvedeno, verification.md ne zapiše dejanskega uspeha, T007/T008 ostaneta odprta in konvergence ni. Surovi check.log, check.exit in fazni dogodki potrjujejo 54 uspešnih testov; gre za delne povezave in nedokončano predajo po infrastrukturni prekinitvi, ne za izmišljene uspešne dokaze.

Dokazi: [spec.md](../../runs/P06-C-001/submission/docs/agent/P06/spec.md), [tasks.md](../../runs/P06-C-001/submission/docs/agent/P06/tasks.md), [verification.md](../../runs/P06-C-001/submission/docs/agent/verification.md), [check.log](../../runs/P06-C-001/submission/docs/agent/P06/check.log), [check.exit](../../runs/P06-C-001/submission/docs/agent/P06/check.exit), [events.jsonl.gz](../../runs/P06-C-001/phases/05-implement/events.jsonl.gz).

**Organizacija kode: 2/2.** Čista createCsv loči kanonične kolone, stabilno filtriranje, nevtralizacijo in navedbo od prenosa. CsvExport vsebuje tri lokalne nastavitve, izpelje omogočenost in še enkrat varuje prazni izvoz v obdelovalniku. Vključitev pred razcepom pogledov ter obstoječi ključ ProjectView ohranita nastavitve med pogledoma in jih ponastavita ob projektu. Ni mutacij vhodov ali nove trajne shrambe; začasna povezava se odstrani in URL sprosti.

Dokazi: [csv.ts](../../runs/P06-C-001/submission/src/csv.ts), [CsvExport.tsx](../../runs/P06-C-001/submission/src/CsvExport.tsx), [App.tsx](../../runs/P06-C-001/submission/src/App.tsx).

**Lastna preverjanja: 2/2.** Osem testov vsebuje ročno zapisane pričakovane nize, ne produkcijskega serializatorja kot oraklja prenosa. A01/A02 pokrijeta vse sprožilce in negativne NBSP/VT/FF primere, zamrznjene vhode, Unicode, citate in mešane prelome. A03–A08 pokrijejo dejanski prenos za obe ločili, BOM, praznine, 13 nesortiranih vrstic, vse filtre, nespremenjen prikaz/povzetek, oba pogleda, zaporedne spremembe, ponastavitve, brez novih strani/zapisov ter mobilni fokus in širino prek readonly. Surovi dnevnik potrjuje vseh osem v uspešnem sklopu 54. Primerjava bajtov pri prenosu pretvori UTF-8 dekodirano besedilo nazaj v Buffer; ne preverja poljubnega neveljavnega kodiranja.

Dokazi: [P06.spec.ts](../../runs/P06-C-001/submission/tests/agent/P06.spec.ts), [helpers.ts](../../runs/P06-C-001/input-overrides/tests/development/helpers.ts), [check.log](../../runs/P06-C-001/submission/docs/agent/P06/check.log).

Končna napaka: Infrastrukturna prekinitev in nedokončana predaja; koda prestane 70/70. Celotna poraba in točen čas sta neznana, opaženi tokeni so le spodnja meja. Arhivski samodejni report.md pri null času izpiše 0 min: tega ne uporabljaj kot meritev; merodajen je null v execution/evaluation JSON ter reporting-results.json.

Opomba o razvojnem poteku: V pregledanih dokazih ni potrjenega neuspešnega testnega zagona ali popravka funkcionalne napake. Zaključnih zapisov zaradi prekinitve ni dovoljeno dopolnjevati v imenu merjenega agenta.

## P06-B-001

**Pokritost specifikacije: 2/2.** Vseh R01–R12 ima jasne pogoje in S1–S7. Specifikacija razloči kanonične kolone od vrstnega reda klikov, izvorno zaporedje od skupin na tabli ter izvozni filter od prikaza. Pokrije nič kolon/vrstic, obe ločili, navedbo vseh celic, BOM, CRLF in natančno nevtralizacijo brez širšega whitespace ali Unicode normalizacije; ohranitev in ponastavitve nastavitev so izrecne.

Dokazi: [specification.md](../../runs/P06-B-001/submission/docs/agent/specification.md).

**Predikati/invariante: 2/2.** E0, C, V in canExport določajo stanje, stabilno izbiro in omogočenost, N/Q pa natančno transformacijo in celotno CSV datoteko. Enačbe preklop(E)=E, menjava(E)=E0, osvežitev(E)=E0 in izvoz(E)=E omogočajo preverjanje življenjskega cikla. Invarianta ohrani T in bralne prikaze; primeri za NBSP in apostrof razmejijo domensko pravilo od širše normalizacije.

Dokazi: [specification.md#zahteve-in-pravila](../../runs/P06-B-001/submission/docs/agent/specification.md#zahteve-in-pravila).

**Sledljivost: 2/2.** Začetna specifikacija ostaja pošteno označena kot načrt prvotnega avtorja, izvedbena tabela v verification.md pa poveže vseh 12 zahtev z dejanskimi funkcijami, imenovanimi S/D testi in check.log. Dnevnik potrjuje prvi uspešni sklop 53. Pregledovalec jasno loči prevzete rezultate od svojega dodatnega brskalniškega preverjanja; njegov PASS je potrjen v surovem dogodku item_21. Odkrito navede, da ni ponovil celotnega check in ni mogel uporabiti git diff. Povezava na generirano HTML poročilo ni del trajnega arhiva, vendar je celoten testni dnevnik shranjen.

Dokazi: [specification.md](../../runs/P06-B-001/submission/docs/agent/specification.md), [verification.md](../../runs/P06-B-001/submission/docs/agent/verification.md), [check.log](../../runs/P06-B-001/submission/docs/agent/check.log), [review.md](../../runs/P06-B-001/submission/docs/agent/review.md), [review.json](../../runs/P06-B-001/submission/docs/agent/review.json), [events.jsonl.gz](../../runs/P06-B-001/phases/03-review/events.jsonl.gz).

**Organizacija kode: 2/2.** serializeCsv je čista funkcija s kanoničnimi kolonami in ločenima quote/quoteValue. CsvExport hrani le izbor, ločilo in filter, število ustreznih vrstic ter enabled pa izpelje iz trenutnih podatkov. Prenos uporablja dodatno varovalo null, odstrani povezavo in sprosti URL. Stalna vključitev v ProjectView z obstoječim ključem projekta zagotavlja življenjski cikel brez trajne shrambe ali mutiranja virov.

Dokazi: [csv.ts](../../runs/P06-B-001/submission/src/csv.ts), [CsvExport.tsx](../../runs/P06-B-001/submission/src/CsvExport.tsx), [App.tsx](../../runs/P06-B-001/submission/src/App.tsx).

**Lastna preverjanja: 2/2.** Sedem lastnih testov pokrije ročno pričakovane bajte, Unicode in notranje prelome, vse sprožilce formul in varne proti-primere, zamrznjene vhode, 13 nesortiranih vrstic, praznine, vse filtre, ponastavitve, oba pogleda, lokalni prenos brez omrežnih zahtev in mobilno tipkovnico. Vseh sedem je v uspešnem sklopu 53. Pregledovalec dodatno izvede štiri prenose surovih Buffer bajtov pri 390 px s 13 prepletenimi stanji; potrdi drugačen vrstni red DOM table in nespremenjen CSV, obe ločili, obrnjeno izbiro kolon, prazna projekta, ponastavitve ter nič zapisov, testnih kontrol ali pageerror. Njegov orakelj neposredno določi apostrofa iz vhodov in ne uvozi produkcijskega serializatorja.

Dokazi: [csv.spec.ts](../../runs/P06-B-001/submission/tests/agent/csv.spec.ts), [check.log](../../runs/P06-B-001/submission/docs/agent/check.log), [review.md](../../runs/P06-B-001/submission/docs/agent/review.md), [events.jsonl.gz](../../runs/P06-B-001/phases/03-review/events.jsonl.gz).

Končna napaka: Neodvisna ocena je uspešna 70/70; postopek je zaključen, obseg dovoljen in poraba popolna. V pregledanih končnih dokazih ni potrjene funkcionalne napake. To ne dokazuje pravilnosti za vso domeno ali vse brskalnike.

Opomba o razvojnem poteku: Prvi celotni testni zagon in dodatno preverjanje pregledovalca sta uspela; popravljalnih predaj ni bilo. git status/diff v izolaciji ni deloval zaradi xcrun in je odkrito naveden kot okoljska omejitev, ne kot napaka aplikacije.

## P08-A-001

**Pokritost specifikacije: 2/2.** R01–R12 so jasno pokrite: izrecni začetni datum, prednost done, vse meje petih disjunktnih skupin, koledarski dnevi brez lokalnega časa, števci celotnega projekta ter stabilni filtrirani prikaz. Specifikacija loči besedilo polja od zadnjega veljavnega datuma, ohrani filter ob preračunu in stanje ob preklopu, določi ponastavitve ter različna prazna stanja. Odkrito opiše, da HTML polje lahko neveljaven vnos vrne kot prazno vrednost.

Dokazi: [specification.md](../../runs/P08-A-001/submission/docs/agent/specification.md).

**Predikati/invariante: 2/2.** Gdone/Goverdue/Gtoday/Gweek/Glater uporabljajo razliko koledarskih dni in negacijo done. Izrecna sta natanko ena skupina na opravilo ter vsota števcev |T|, neodvisna od filtra. visible določa stabilno filtriranje in enako množico ID-jev obeh pogledov. Prehodi (x,r,f) za veljaven/neveljaven datum, preklop ter ponastavitev neposredno omogočajo preverjanje ključne lastnosti zadržanega preračuna.

Dokazi: [specification.md#zahteve-in-pravila](../../runs/P08-A-001/submission/docs/agent/specification.md#zahteve-in-pravila).

**Sledljivost: 2/2.** Specifikacija 1.1 dopolni vseh 12 vrstic z dejansko kodo, imenovanimi A/D testi in dnevniki brez spremembe sprejemnih pogojev. verification.md podrobno razloči 38+8+8, zadnji lint po dodani skripti in štiri zajete prikaze; odkrito pove, kateri posnetki so bili vizualno pregledani in kateri le zajeti. check.log potrdi 54/54 in manual-review.json širine/ID-je/brez zapisov. Ne trdi, da je izvedel nedostopne teste, druge brskalnike ali vse časovne pasove.

Dokazi: [specification.md](../../runs/P08-A-001/submission/docs/agent/specification.md), [verification.md](../../runs/P08-A-001/submission/docs/agent/verification.md), [check.log](../../runs/P08-A-001/submission/docs/agent/check.log), [final-lint.log](../../runs/P08-A-001/submission/docs/agent/final-lint.log), [manual-review.json](../../runs/P08-A-001/submission/docs/agent/manual-review.json).

**Organizacija kode: 2/2.** calendarDay validira koledarski niz in vrne UTC dan; groupDeadlines čisto izpelje skupine z zgodnjo prednostjo done. ProjectView hrani le dateInput, referenceDate in filter; skupine, števci in vidni podatki so izpeljani. DeadlineControls je prikazna komponenta s podatki in obravnavalniki, medtem ko obstoječi ključ projekta zagotovi ponastavitev. Oba pogleda dobita iste vidne podatke, prvotni povzetek stanj pa ostane vezan na celoten projekt. Ni nove trajne shrambe ali zapisovalne poti.

Dokazi: [deadlines.ts](../../runs/P08-A-001/submission/src/deadlines.ts), [DeadlineControls.tsx](../../runs/P08-A-001/submission/src/DeadlineControls.tsx), [App.tsx](../../runs/P08-A-001/submission/src/App.tsx).

**Lastna preverjanja: 2/2.** Osem lastnih preverjanj (A01–A05 in trije A06) uporablja vnaprej pričakovane ID-je in mejne koledarske nize. A01 pokrije mesece, novo leto, 1900/2000, 0099→0100, prednost done, particijo in neveljavne datume. Brskalniški testi vključijo 15 nesortiranih opravil z enakimi Unicode naslovi, uro naprave 2042, vse filtre, nespremenjene števce, prazen vnos po spremenjenem datumu, prazne projekte/skupine, ohranitev podatkov, tipkovnične podrobnosti, URL/shrambo in ponastavitve. A06 dejansko ustvari ločene kontekste Los Angeles/Ljubljana/Kiritimati ter preveri šest koledarskih primerov v obeh pogledih pri 390 px. Vseh osem je v uspešnem sklopu 54; ne predstavljajo izčrpnega dokaza za vso domeno.

Dokazi: [deadlines.spec.ts](../../runs/P08-A-001/submission/tests/agent/deadlines.spec.ts), [check.log](../../runs/P08-A-001/submission/docs/agent/check.log), [manual-review.mjs](../../runs/P08-A-001/submission/tests/agent/manual-review.mjs), [manual-review.json](../../runs/P08-A-001/submission/docs/agent/manual-review.json).

Končna napaka: Neodvisna ocena je uspešna 70/70; postopek je zaključen, obseg dovoljen in poraba popolna. V pregledanih končnih dokazih ni potrjene funkcionalne napake. Mobilna in časovnopasovna preverjanja so omejena na Chromium.

Opomba o razvojnem poteku: Surovi check.log potrjuje uspešen celoten zagon. V pregledanih dokazih ni potrjenega neuspešnega razvojnega testa ali popravka napake; zadnji lint sledi dodatku pomožne vizualne skripte in dokumentacije, ne popravku aplikacije.

## P08-C-001

**Pokritost specifikacije: 2/2.** Vseh R01–R12 ima jasne sprejemne pogoje: fiksna začetna referenca, prednost done, meje petih skupin, koledarski dnevi, celotni števci in stabilni izbor. Posebej so opredeljeni prazno polje z zadnjo veljavno referenco, preklopi pogledov, ponastavitve projekta/osvežitve, prazni projekti/skupine, bralne podrobnosti in nespremenjeni podatki. Ločena sta vrstni red preglednice in vrstni red znotraj stolpcev table.

Dokazi: [spec.md](../../runs/P08-C-001/submission/docs/agent/P08/spec.md).

**Predikati/invariante: 2/2.** G(t,r) je disjunktna razdelitev po statusu in razliki koledarskih dni Δ. C šteje celotni projekt neodvisno od filtra, vsota petih števcev je |T|, V določa stabilno filtriranje. Tabela prehodov (x,r,f) preverljivo loči vsebino polja in zadnjo veljavno referenco, določi ohranitev ob preklopu ter ponastavitev. Nespremenjenost T in enakost množic ID-jev obeh pogledov sta izrecni invarianti.

Dokazi: [spec.md#zahteve-in-pravila](../../runs/P08-C-001/submission/docs/agent/P08/spec.md#zahteve-in-pravila).

**Sledljivost: 2/2.** Specifikacija 1.1 poveže vseh 12 zahtev z osrednjo matriko zahteva–pogoj–test–koda–izid v verification.md. Dnevnika potrdita 53/53 (38+8+7) in ponovni A05 po popravku zajema. T001–T009 so označene zaključene, načrt dokumentira preimenovanje osrednjega dokazila. Convergence izrecno poroča o pregledu obstoječih dokazov brez novega zagona testov in brez sprememb aplikacije. Nedostopni testi ter omejenost vzorca so odkrito navedeni.

Dokazi: [spec.md](../../runs/P08-C-001/submission/docs/agent/P08/spec.md), [verification.md](../../runs/P08-C-001/submission/docs/agent/verification.md), [tasks.md](../../runs/P08-C-001/submission/docs/agent/P08/tasks.md), [plan.md](../../runs/P08-C-001/submission/docs/agent/P08/plan.md), [check.log](../../runs/P08-C-001/submission/docs/agent/P08/check.log), [capture-check.log](../../runs/P08-C-001/submission/docs/agent/P08/capture-check.log), [convergence.json](../../runs/P08-C-001/submission/docs/agent/convergence.json).

**Organizacija kode: 2/2.** Modul deadlines.ts loči koledarsko validacijo, čisto razvrščanje in izpeljavo števcev/vidnih podatkov. deadlineOverview v enem prehodu ustvarja nove rezultate brez mutacije vhodov. ProjectView hrani le dateInput, referenceDate in filter; oba pogleda uporabita iste visible, prvotni povzetek stanj pa celotni projekt. Obstoječi ključ projekta zagotovi ponastavitev, kontrole so neposredno vezane na projektno stanje. Ni trajne shrambe, novih zapisovalnih poti ali podvajanja pravil med pogledoma.

Dokazi: [deadlines.ts](../../runs/P08-C-001/submission/src/deadlines.ts), [App.tsx](../../runs/P08-C-001/submission/src/App.tsx), [styles.css](../../runs/P08-C-001/submission/src/styles.css).

**Lastna preverjanja: 2/2.** Sedem uspešnih lastnih preverjanj uporablja neodvisne pričakovane ID-je: 13 nesortiranih opravil z enakimi Unicode naslovi, uro 2040, vse filtre, prednost done, meje −1/0/+1/+7/+8, stabilen vrstni red in enake ID-je obeh pogledov. A02 dejansko uporabi tri ločene časovne pasove ter štiri koledarske primere: prestopni februar, novo leto in oba evropska prehoda DST; ameriških prehodov iz teh datumov ne sklepamo. A03 preveri prazno polje po spremenjeni referenci, ohranjeni filter, projekte in osvežitev ter URL/shrambo. A04/A05 dodata oba prazna projekta, eno opravilo, prazno skupino z vrnitvijo, bralne podrobnosti in širino 390 pik. Testi ne uvažajo produkcijskega klasifikatorja kot orakelj.

Dokazi: [P08.spec.ts](../../runs/P08-C-001/submission/tests/agent/P08.spec.ts), [check.log](../../runs/P08-C-001/submission/docs/agent/P08/check.log), [capture-check.log](../../runs/P08-C-001/submission/docs/agent/P08/capture-check.log).

Končna napaka: Neodvisna ocena potrdi 70/70, 12/12 zahtev in strogi uspeh. Postopek je zaključen, obseg dovoljen in poraba popolna. V pregledanih končnih dokazih ni potrjene funkcionalne napake; preverjanja so omejena na navedene primere v Chromiumu.

Opomba o razvojnem poteku: Celotni zagon je uspel 53/53. Prvi mobilni posnetek je zaradi drsenja deloma prekrila lepljiva navigacija; model je dodal pomik na vrh pred zajemom in uspešno ponovil A05. To je popravek dokaznega zajema, brez spremembe aplikacijske kode ali potrjenega neuspešnega funkcionalnega testa.

## P08-B-001

**Pokritost specifikacije: 2/2.** Predana specifikacija jasno določi vseh R01–R12, koledarsko domeno, prednost done, meje petih skupin, celotne števce in stabilne filtrirane podatke. Razloči vrstni red znotraj statusnih stolpcev od množice ID-jev obeh pogledov, vsebino polja od veljavne reference, prazno skupino od praznega projekta ter ohranitev pogleda od ponastavitve projekta. Predlagani S1–S5 so izrecno načrt, ne trditev o že opravljenih testih.

Dokazi: [specification.md](../../runs/P08-B-001/submission/docs/agent/specification.md), [specification-history.md](../../runs/P08-B-001/submission/docs/agent/specification-history.md).

**Predikati/invariante: 2/2.** g(t,r) poda disjunktno razvrstitev prek razlike koledarskih dni in prednosti statusa. C(k), vsota |T| ter stabilni V so ločeni od izbora filtra; oba pogleda ohranita isto množico ID-jev. Prehodi (d,r,f) določajo prazno polje brez izgube zadnjega veljavnega izračuna, spremembo filtra ter projektno/osvežitveno ponastavitev. Nespremenjenost podatkov in odsotnost nove trajne shrambe sta izrecni.

Dokazi: [specification.md#zahteve-in-pravila](../../runs/P08-B-001/submission/docs/agent/specification.md#zahteve-in-pravila).

**Sledljivost: 2/2.** Začetna specifikacija ostane predaja prvotnega avtorja, implementerjeva končna matrika pa vsako R poveže s simboli/vrsticami kode, imenovanimi S/D testi in dejanskimi dnevniki. verification.md jasno ohrani prvi 46/52 in zadnji 52/52, popravek oznak ter priprave testnih podatkov in omejitev xcrun. Pregledovalec loči pregled predanega dnevnika in treh slik od lastnih 38 trditev koledarske logike; surovi item_27 v fazi review potrdi PASS in izhod 0. Ne zatrjuje novega celotnega ali živega brskalniškega zagona.

Dokazi: [verification.md](../../runs/P08-B-001/submission/docs/agent/verification.md), [check.log](../../runs/P08-B-001/submission/docs/agent/check.log), [check-final.log](../../runs/P08-B-001/submission/docs/agent/check-final.log), [review.json](../../runs/P08-B-001/submission/docs/agent/review.json), [events.jsonl.gz](../../runs/P08-B-001/phases/03-review/events.jsonl.gz).

**Organizacija kode: 2/2.** deadlines.ts loči validacijo koledarskega datuma in čisti klasifikator od Reactovega prikaza. ProjectView hrani tri neodvisna stanja; števci in stabilno vidno zaporedje nastanejo ob renderju iz izvornih opravil. filter hkrati povečuje svež lokalni objekt števcev pred odločitvijo o vidnosti, brez mutacije Task ali trajnih stranskih učinkov. Oba pogleda dobita iste visibleTasks, prvotni statusni povzetek pa celoten projekt. Ključ projekta zagotovi ponastavitev; ni podvojene klasifikacije v tabli in preglednici.

Dokazi: [deadlines.ts](../../runs/P08-B-001/submission/src/deadlines.ts), [App.tsx](../../runs/P08-B-001/submission/src/App.tsx), [styles.css](../../runs/P08-B-001/submission/src/styles.css).

**Lastna preverjanja: 2/2.** Šest končno uspešnih testov pokrije 12 nesortiranih opravil z enakimi Unicode naslovi, vse skupine, prednost done, točni vrstni red v stolpcih, particijo, izvorne datume ter tipkovnične podrobnosti. S3 uporablja uro 2037, spreminja filter tudi ob praznem datumu in preveri zadržane števce, preklop, projekt/osvežitev ter URL/shrambo. S4/S5 pokrije oba prazna projekta, eno dolgo Unicode opravilo, prazno skupino in 390 px. Trije dejanski pasovi UTC/Ljubljana/Los Angeles vključujejo osem neodvisno navedenih mej, tudi oba evropska in ameriška prehoda DST. Pregledovalec doda 38 trditev za zgodnja leta, 1900/2000/2100, leto 9999 in neveljavne datume. Prvotni neuspehi ostanejo dokumentirani; zadnji celotni zagon potrdi 52/52.

Dokazi: [deadlines.spec.ts](../../runs/P08-B-001/submission/tests/agent/deadlines.spec.ts), [check-final.log](../../runs/P08-B-001/submission/docs/agent/check-final.log), [review.json](../../runs/P08-B-001/submission/docs/agent/review.json), [events.jsonl.gz](../../runs/P08-B-001/phases/03-review/events.jsonl.gz).

Končna napaka: Neodvisna ocena potrdi 70/70 in 12/12 zahtev; postopek je zaključen s popolno porabo, dovoljenimi spremembami in strogim uspehom. V pregledanih končnih dokazih ni potrjene funkcionalne napake; to ni izčrpen dokaz celotne domene.

Razvojni popravek: Prvi celotni zagon je dosegel 46/52. S1/S3/S4 niso našli natančne oznake ovitega selecta prek getByLabel; aplikacijski oznaki sta nato ločeni od kontrol z label/htmlFor. Trije časovnopasovni S2 so pri zaporednem obisku istega fragmenta ohranili stare naložene testne podatke. Testna priprava zdaj najprej obišče about:blank in odstrani prejšnje prestrezanje GET. Prilagojena je tudi tipkovnična pot skozi notranje dele datumskega polja. Po teh spremembah celotni check uspe 52/52; klasifikator rokov ni bil spremenjen.

Opomba o razvojnem poteku: Ohranjena check.log in check-final.log ločita neuspešno testno iskanje/pripravo od končnega izida. Neuspeh git status zaradi manjkajočega xcrun je omejitev izoliranega okolja in ni potrjena funkcionalna napaka aplikacije.

## P03-A-001

**Vsebinska ocena ni mogoča.** Omejitev uporabe storitve je prekinila izvedbo po 13,293 s pred nastankom avtorske specifikacije, sprememb kode ali lastnih testov (fileChanges=[]). Ohranjeno je izhodišče, ne ocenljiva rešitev P03. Po vnaprej določeni rubriki vseh pet vsebinskih ocen ostane manjkajočih; funkcionalni izid in začeti ID ostaneta v primarni analizi.

**Pokritost specifikacije: manjkajoče.** Specifikacija ni nastala: model se je ustavil zaradi omejitve storitve, arhiv ne vsebuje avtorskih dokumentov. Pokritosti ne ocenjujemo z ničlo.

Dokazi: [execution.json](../../runs/P03-A-001/execution.json), [events.jsonl.gz](../../runs/P03-A-001/events.jsonl.gz), [archive-complete.json](../../runs/P03-A-001/archive-complete.json).

**Predikati/invariante: manjkajoče.** Ni oddanih predikatov ali invariant, ker storitev ni dovolila nadaljevanja začetega dela. Odsotna avtorska oddaja je označena kot manjkajoča ocena.

Dokazi: [execution.json](../../runs/P03-A-001/execution.json), [events.jsonl.gz](../../runs/P03-A-001/events.jsonl.gz), [archive-complete.json](../../runs/P03-A-001/archive-complete.json).

**Sledljivost: manjkajoče.** Ni oddanega verifikacijskega zapisa ali matrike zahteva–koda–test. Raziskovalčeva ocena izhodišča ne nadomešča agentove predaje, zato vsebinska ocena manjka.

Dokazi: [execution.json](../../runs/P03-A-001/execution.json), [events.jsonl.gz](../../runs/P03-A-001/events.jsonl.gz), [archive-complete.json](../../runs/P03-A-001/archive-complete.json).

**Organizacija kode: manjkajoče.** Izvajalnik potrjuje nič spremenjenih datotek; arhivirana koda je izhodišče brez implementacije P03. Organizacije izhodišča ne pripišemo kot avtorsko kakovost te prekinjene oddaje.

Dokazi: [execution.json](../../runs/P03-A-001/execution.json), [events.jsonl.gz](../../runs/P03-A-001/events.jsonl.gz), [archive-complete.json](../../runs/P03-A-001/archive-complete.json).

**Lastna preverjanja: manjkajoče.** Lastni testi niso nastali in model ni izvedel svojega preverjanja. Poznejših neodvisnih testov ne obravnavamo kot agentove lastne dokaze; ocena ostane manjkajoča.

Dokazi: [execution.json](../../runs/P03-A-001/execution.json), [events.jsonl.gz](../../runs/P03-A-001/events.jsonl.gz), [archive-complete.json](../../runs/P03-A-001/archive-complete.json).

Končna napaka: Postopek execution_failed zaradi izrecnega dogodka usage limit, brez sprememb datotek. Neodvisno 38/70 in 0/12, strogi uspeh false. Čas 13,293 s je znan; celotna poraba je null, opažena spodnja meja 10474 vhodnih / 204 izhodnih tokenov. Kratek prekinjeni čas ni čas uspešne rešitve in ne utemeljuje vzročnega sklepa o postopku A.

Opomba o razvojnem poteku: Model ni prišel do implementacije ali lastnega testnega zagona. Vrstni red je obstal po arhiviranju; po uporabnikovi ročni ponastavitvi je nadaljevanje pri P03-B-001, brez ponovitve P03-A-001.
