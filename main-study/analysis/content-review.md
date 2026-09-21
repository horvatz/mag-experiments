# Vsebinska presoja glavnih oddaj

**AI-podprta, neslepa vsebinska presoja.** Ocenjevalec: Codex, raziskovalčev pomočnik, zunaj merjene seje. To niso človeške ocene in soglasje med ocenjevalci ni izmerjeno.

Pregledanih je 6/24 vnaprej določenih oddaj (ponovitev 001 za P03–P10 in A/B/C). Ocene po dimenzijah se ne seštevajo v skupno kakovost.

| Oddaja | Specifikacija | Predikati | Sledljivost | Koda | Lastni testi |
| --- | --- | --- | --- | --- | --- |
| [P05-A-001](reviews/P05-A-001.json) | 2 | 2 | 2 | 2 | 2 |
| [P05-B-001](reviews/P05-B-001.json) | 2 | 2 | 2 | 2 | 2 |
| [P05-C-001](reviews/P05-C-001.json) | 2 | 2 | 2 | 2 | 2 |
| [P10-A-001](reviews/P10-A-001.json) | 2 | 2 | 2 | 2 | 2 |
| [P10-C-001](reviews/P10-C-001.json) | 2 | 2 | 2 | 2 | 2 |
| [P10-B-001](reviews/P10-B-001.json) | 2 | 2 | 2 | 2 | 2 |

Brez zaključene presoje: P06-A-001, P06-C-001, P06-B-001, P08-A-001, P08-C-001, P08-B-001, P03-A-001, P03-B-001, P03-C-001, P07-A-001, P07-B-001, P07-C-001, P09-A-001, P09-B-001, P09-C-001, P04-A-001, P04-C-001, P04-B-001.

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
