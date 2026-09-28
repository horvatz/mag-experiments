# Specifikacija: stabilno razvrščanje z dvema ključema

## Problem in kontekst

Folio trenutno prikaže opravila v zaporedju, kot jih vrne `/api/projects/:id/tasks`. Uporabnik naj jih lahko projicira v poljuben vrstni red z enim primarnim in neobveznim sekundarnim ključem, ne da bi spremenil podatke. Ista razvrščena projekcija velja za preglednico in tablo. Obstoječa navigacija po ID-ju, podrobnosti in videz Folio ostanejo uporabni.

## Vhodi, dejanja in izidi

Vhod je nespremenjeno polje `Task[]` javnega API-ja: `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`. Štirje lokalni kontrolniki so primarni ključ (privzeto `original`), primarna smer (`asc`), sekundarni ključ (privzeto `none`) in sekundarna smer (`asc`). Uporabnik jih spremeni prek dostopnih izbirnikov; gumb **Izvorni vrstni red** vrne vse štiri privzete vrednosti.

`title` in `assignee` se primerjata po `NFD`, odstranitvi znakov U+0300–U+036F ter pretvorbi v male črke; dobljena niza se primerjata leksikografsko z UTF-16 operatorjema `<` in `>`. Stanja imajo vrstni red `todo < in_progress < done`; veljavni datumi `YYYY-MM-DD` se primerjajo kronološko. Smer velja posebej za vsak ključ. Pri enakosti obeh ključev se uporabi izvorni indeks kot stabilna vezava. Primarni `original` v celoti ohrani izvorni vrstni red in prezre sekundarno nastavitev.

Preklop pogleda in odpiranje/zapiranje podrobnosti ohranita kontrole. Menjava projekta in ponovni zagon strani začneta s privzetimi kontrolami. Napake nalaganja ohranijo obstoječe sporočilo in ponovni poskus; razvrščanje se uporabi, ko API vrne opravila. Prazna in enojna polja sta veljavna.

## Zahteve in pravila

Predpostavke iz navodil: vrednosti imen/naslovov so nizi, status je ena od treh navedenih vrednosti, datumi so veljavni koledarski zapisi `YYYY-MM-DD`, ID-ji so enolični, opravilo pripada projektu. `i(x)` pomeni indeks opravila v prejetem polju; `cmpK(a,b)` je primerjava izbranega polja, normalizirana na -1/0/1; `dir(d,c)` vrne `c` za asc in `-c` za desc. `sorted(T)` je kopija/permutacija `T`, ne mutacija `T`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno stanje `(primary, primaryDir, secondary, secondaryDir) = (original, asc, none, asc)`; kontrole so prisotne, prikaz ohrani vhodni vrstni red. | Privzeti UI test ter API primer z neurejenim vhodom. |
| R02 | `norm(s)=lower(remove[U+0300–U+036F](NFD(s)))`; besedilna `cmp` uporablja izključno `<`/`>` nad normaliziranima nizoma. | Različice z diakritiko, velikostjo črk, števili in ločili. |
| R03 | `status: todo < in_progress < done`; datum `YYYY-MM-DD` se primerja po kronološki/leksikografski vrednosti zapisa. | UI preverjanje stanj in mejnih veljavnih datumov. |
| R04 | Za vsak izbrani ključ se smer uporabi samo kot `dir(d, cmpK(a,b))`; izvorni indeks se pri vezavi ne obrne. | Asc/desc za primarni in sekundarni ključ ter enakosti. |
| R05 | Sekundarni ključ se primerja samo, če je primarni `cmp === 0` in primarni ni `original`; njegova smer je neodvisna. | Kombinirana ključa z ločenima smerema; `none` brez dodatnega ključa. |
| R06 | Končni primerjalnik: če `primary=original`, vrni vezavo po `i`; sicer primarni rezultat, nato sekundarni rezultat, nato `i(a)<i(b)`. | Podvojene normalizirane vrednosti, isti ključ v obeh kontrolah, original z nastavljenim sekundarnim ključem. |
| R07 | Tabla ohrani stolpce `todo`, `in_progress`, `done`; vsak stolpec filtrira isto razvrščeno polje in ohrani relativni vrstni red. | Ista kombinacija ključev v preglednici in stolpcih table. |
| R08 | Prehod pogleda in stanje opravila v URL-ju ne spreminjata štirih kontrol. | UI preklopi table/board in podrobnosti odpre/zapre. |
| R09 | Menjava projekta ustvari začetne kontrole; osvežitev ustvari začetne kontrole tudi ob URL-ju za tablo/podrobnosti. Nastavitev ni v URL ali shrambi. | Navigacija med projektoma ter reload po spremembi kontrol. |
| R10 | Gumb ponastavi točno na privzeto četverico. Prazno polje da nič vrstic/kartic, en element ostane enak pri vseh primerjavah/smereh. | Test gumba, praznega projekta in enega opravila. |
| R11 | Za vsak `T`, `sorted(T)` je permutacija po identiteti in vsako izrisano polje je nespremenjeno; sprememba kontrol ne sproži API zapisa. | Identifikatorji enkrat, izvorni API rezultat nespremenjen in brez mutacijskih zahtev. |
| R12 | Vsak ID se izriše natanko enkrat v aktivnem pogledu; povezava uporablja ID, zato enaki naslovi odprejo pravi zapis. Obstoječe povzetke, podrobnosti, dostopna imena in prilagodljivo notranje drsenje ohranimo. | Regresijski testi ter preverjanje odpiranja podrobnosti z ID-jem pri enakih naslovih in širini 390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R06 | Zgoraj definirana projekcija in comparator | Po implementaciji dodani agentni scenariji z znanimi vrstnimi redi; `tests/development/P04.spec.ts` D01, D02, D04 | `src/sorting.ts`, stanje in kontrole v `src/App.tsx` | Še ni izvedeno; dopolnim po zagonu. |
| R07–R08 | Skupno razvrščeno polje v obeh pogledih; React stanje ostane vezano na projekt | Agentni scenarij preklopa/podrobnosti; razvojni D03; izhodiščni regresijski testi | `src/App.tsx`, `src/TaskBoard.tsx`, `src/navigation.ts` (slednja naj ostane nespremenjena) | Še ni izvedeno; dopolnim po zagonu. |
| R09–R10 | Lokalno stanje ob montaži projekta; eksplicitni reset in podpora poljem velikosti 0/1 | Agentni scenarij menjave projekta, reload, prazno in en zapis | `src/App.tsx` | Še ni izvedeno; dopolnim po zagonu. |
| R11–R12 | Projekcija ne mutira API podatkov; obstoječe ID-povezave in postavitev ostanejo | Agentni preverjanje ID-jev, API brez zapisov, 390 px; izhodiščni testi | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | Še ni izvedeno; dopolnim po zagonu. |

## Odprta vprašanja in omejitve

Končni zunanji testi niso del delovnega drevesa. Navodila določajo veljavne datume in neprazna imena, zato ni predvidenih rezervnih pravil za neveljavne ali manjkajoče vrednosti. Meja je leksikografska primerjava JS nizov, ne lokalizirano ali številčno razvrščanje. Vse zahteve bo treba potrditi z dejansko izvedenimi testi; sledljivost in morebitna omejitev bosta nato posodobljeni.
