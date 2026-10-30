# Specifikacija P07: priljubljena opravila in trajna shramba

## Problem in kontekst

Folio prikazuje opravila projekta v preglednici in na tabli ter omogoča odpiranje podrobnosti po ID-ju. Uporabnik potrebuje možnost, da si izbere priljubljena opravila, jih filtrira, trajno shrani in ponovno uporabi po osvežitvi ali menjavi projekta. Priljubljene so lokalne in ne smejo spremeniti podatkov na API-ju.

## Vhodi, dejanja in izidi

- Vhodi: projekti in opravila iz javnega API-ja `/api/`; ID-ji opravil so nizi, naslovi so lahko enaki, zaporedje je lahko poljubno.
- Dejanja: preklop priljubljenega posameznega ID-ja, prikaz le priljubljenih, odstranitev vseh priljubljenih trenutnega projekta, menjava projekta ali pogleda, osvežitev, zunanji `storage` in morebitna napaka `localStorage`.
- Izidi: globalna, sortirana in podvojitev prosta množica ID-jev v `folio:favorites:v1`; enoten prikaz v preglednici in na tabli; delujoča navigacija po ID-ju; brez API zapisov.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za vsak `task.id` obstaja ločen gumb `Priljubljeno opravilo <id>` z `aria-pressed`. Predikat `toggle(id)` spremeni le `id ∈ favorites` in ne odpre pogovornega okna. Enaka naslova ostanejeta neodvisni. | Lastni Playwright test klikne gumb in preveri `aria-pressed` obeh ID-jev ter odsotnost dialoga. |
| R02 | `favorites ⊆ String`; zapis je `JSON.stringify({version:1,ids:[...]})`, kjer je `ids = unique(favorites).sortUTF16()`. V shrambo se zapisujejo le ID-ji, brez objektov opravil. | Lastni test preveri vrstni red, zapis po dveh klikih in izključenost drugih polj. |
| R03 | Veljaven zapis `parsed.version = 1 ∧ Array.isArray(parsed.ids) ∧ ∀ id ∈ parsed.ids: typeof id = string` povzame množico ID-jev, tudi če so podvojeni ali neznani. Neznani ID-ji se ohranijo, v trenutnem projektu pa se ne ustvarijo nove vrstice ali kartice. | Lastna testna primera s podvojenim in neznanim ID-jem preverita ohranitev, prikaz in izklop filtra. |
| R04 | Manjkajoč ključ, neveljaven JSON, napačna `version`, manjkajoči ali nearray `ids` ali katerikoli nestring v `ids` dajo `favorites = ∅`; aplikacija se nadaljuje in ob zagonu ne zapiše nadomestnega zapisa. | Lastni test za več neveljavnih zapisov preveri prazen prikaz, odsotnost opozorila in nespremenjeno vrednost v shrambi. |
| R05 | Filter ima privzeto `checked = false`. Ko je aktiven, je prikaz `tasks.filter(t => t.projectId = current ∧ t.id ∈ favorites)` v izvornem API vrstnem redu. | Lastna testna primera za privzeto stanje in vrstni red filtriranega prikaza. |
| R06 | Izklop priljubljenega takoj odstrani nalogo iz aktivnega filtra; prazen prikaz vsebuje `Ni priljubljenih opravil.` in kontrola za izklop filtra ostane omogočena. | Lastni test odstrani vidni priljubljeni ID pod aktivnim filtrom in preveri sporočilo ter omogočen checkbox. |
| R07 | Preglednica in tabla uporabljata isto množico `favorites` in isti filter; preklop pogleda ohrani stanje, podrobnosti pa se odprejo po točno izbranem ID-ju. | Lastni test preklopi pogled, preveri stanje in odpre podrobnosti. |
| R08 | Zunanja množica priljubljenih je globalna; menjava projekta jo ohrani in nastavi filter na `false`. Osvežitev naredi enako. | Lastni test shrani ID v enem projektu, preklopi v drugega, preveri filter in se vrne ali osveži. |
| R09 | `removeProjectFavorites` odstrani le `id ∈ tasks(currentProject) ∩ favorites`; ID-ji drugih projektov in neznani ID-ji ostanejo. Gumb je onemogočen, ko je presek prazen. | Lastni test preveri ohranjene tuje in neznane ID-je, shrambo ter onemogočen gumb po čiščenju. |
| R10 | Status `Priljubljeno: X od M.` vedno šteje `X = |tasks(currentProject) ∩ favorites|` in `M = |tasks(currentProject)|`, tudi pri aktivnem filtru. Prikazani števci stanj štejejo vidna opravila. | Lastni test preveri številke ob vklapljenem filtru in števce vidnih opravil. |
| R11 | `storage` za `folio:favorites:v1` takoj uporabi `event.newValue` po enakih validacijskih pravilih; `null` pomeni prazno, drug ključ se ignorira, povratni zapis ni dovoljen. Napaka branja ali pisanja pusti aplikacijo uporabno v pomnilniku in prikaže `role=alert` z besedo `shramba`. | Lastna testa z diskretnim `dispatchEvent(new StorageEvent(...))` preverita uskladitev in ignoriranje tujega ključa; test z onemogočenim `localStorage` preveri opozorilo in lokalno delovanje. |
| R12 | Nobeno dejanje priljubljenih ne pošlje ne-GET zahteve na `/api/` in ne spremeni podatkov opravila. Folio, nalaganje, navigacija in ozki prikaz ostanejo ohranjeni. | Lastni test nadzoruje omrežne zahteve in strežniško stanje; skupni testi zajamejo ozki prikaz. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Neodvisen gumb po ID-ju | favorites are independent, sorted, persisted, counted and local-only | src/App.tsx, src/TaskBoard.tsx | Uspešno v lastnem testu 1/7. |
| R02 | Sortiran in enkraten zapis | favorites are independent, sorted, persisted, counted and local-only | src/favorites.ts | Uspešno v lastnem testu 1/7. |
| R03 | Podvojene in neznane ID-je ohrani | filter, empty state, project counters and project-specific removal work | src/favorites.ts, src/App.tsx | Uspešno v lastnem testu 3/7. |
| R04 | Neveljavne vrednosti pomenijo prazno | invalid favorite storage starts empty without a rewrite | src/favorites.ts | Uspešno v lastnem testu 2/7. |
| R05 | Privzeti filter in izvorni vrstni red | filter, empty state, project counters and project-specific removal work | src/App.tsx | Uspešno v lastnem testu 3/7. |
| R06 | Takojšnja odstranitev in prazno sporočilo | filter, empty state, project counters and project-specific removal work | src/App.tsx | Uspešno v lastnem testu 3/7. |
| R07 | Enakost pogledov in podrobnosti po ID-ju | both views share favorites, filter and ID-based details | src/App.tsx, src/TaskBoard.tsx | Uspešno v lastnem testu 4/7. |
| R08 | Globalna množica in reset filtra | favorites are independent... v testu 1 ter filter... v testu 3 | src/App.tsx, src/favorites.ts | Uspešno v lastnih testih 1/7 in 3/7. |
| R09 | Odstranitev le trenutnega projekta | filter, empty state, project counters and project-specific removal work | src/App.tsx, src/favorites.ts | Uspešno v lastnem testu 3/7. |
| R10 | Celoten števec in vidni števci | filter, empty state, project counters and project-specific removal work | src/App.tsx | Uspešno v lastnem testu 3/7. |
| R11 | storage dogodek in napaka shrambe | storage events validate the exact key and do not write back; unreadable storage leaves an alert and keeps favorites in memory | src/favorites.ts | Uspešno v lastnih testih 5/7 in 6/7. |
| R12 | Lokalnost, ohranjen Folio in ozki prikaz | readonly preveri v vseh lastnih testih; new controls stay within the narrow layout preveri 390 px | src/App.tsx, src/TaskBoard.tsx, src/styles.css | Uspešno v lastnem testu 7/7 in celotnem paketu. |

## Dnevnik popravkov

- 2026-10-30: Specifikacija je nastala pred implementacijo; sprejemni pogoji R01–R12 se niso spremenili.
- 2026-10-30: Po prvem zagonu lastnih testov so bile popravljene testne napake: inicializacijska skripta je brišala shrambo ob osvežitvi, pričakovan števec stanja je bil napačen in locator podrobnosti ni bil enoličen. Spremembe so v tests/agent/P07.spec.ts.

## Odprta vprašanja in omejitve

- Uporabniški vmesnik ne bere in ne nastavlja testnih kontrol `/__test/`; te uporabljajo samo testi.
- Testni obseg zajame lokalni Chromium in javni API na vratih iz naloge. Ni izvedenih testov v drugih brskalnikih ali z izklopljenim JavaScriptom.
