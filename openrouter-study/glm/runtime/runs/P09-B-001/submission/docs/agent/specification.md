# Specifikacija: Stanje pogleda v povezavi in zgodovini

## Problem in kontekst

Folio trenutno bere projekt, opravilo in način `table`/`board` iz hash poti. Uporabnik potrebuje naslovljivo stanje pregleda: iskanje, filter stanja in vrstni red. Stanje mora biti del obstoječe URL fragment pote, potrjeno z enim zgodovinskim vnosom in obnovljivo z Nazaj/Naprej ali osvežitvijo. Nova funkcionalnost je samo pogled na podatke; ne spreminja opravil, strežnika, javnega API-ja ali potrjenega videza Folio.

## Vhodi, dejanja in izidi

Podatkovni model ostaja iz `shared/types.ts`: `Task { id, projectId, title, description, status, assignee, dueDate }`, kjer je `status: 'todo' | 'in_progress' | 'done'`. Projekti imata `id` in `name`. Uporabniški vmesnik bere:

- `GET /api/projects`
- `GET /api/projects/:projectId/tasks`
- `GET /api/tasks/:taskId` za podrobnost

URL fragment je na obstoječih poteh oblike `#/projects/:projectId` ali `#/projects/:projectId/tasks/:taskId`, sledi pa mu query z `view`, `q`, `status` in `order`. Primer: `#/projects/web?view=board&q=Pregled&status=todo&order=title-desc`. Query stoji za celotno potjo, ne pred `/tasks/`.

Stanje pregleda je:

```text
q: string
status: 'all' | 'todo' | 'in_progress' | 'done'
order: 'original' | 'title-asc' | 'title-desc'
```

Privzeto stanje je `{ q: '', status: 'all', order: 'original' }`. Kontrole so osnutek (`draft`); prikaz, URL in zgodovina se spremenijo šele s potrditvijo ali ponastavitvijo. Vsak preklop poti ali pogleda zavže nepotrjen osnutek.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob odprtju ali vsaki spremembi URL fragmenta preberi prvi `q`, `status` in `order`. Neveljavna ali manjkajoča vrednost postane privzeta. Prikaz in kontroli takoj odražata stanje brez dodatnega klika. | Playwright odpre projekt in pot opravila z vsemi tremi parametri ter preveri ID-je, kontrole in URL. |
| R02 | Normalizacijska funkcija najprej obreže zunanje beline iskanega niza, nato uporabi NFD, odstrani kode U+0300–U+036F in pretvori v male črke. Enako normalizacijo uporabi za `title`, `description`, `assignee` in `id`. Ujame zadetek, če je normalizirani `q` podniz vsaj enega normaliziranega polja. `q` ni regularni izraz in se ne deli na besede. | Testi z Unicode, ločili, presledki, citatom, enako besedo v različnih poljih in brez zadetka. |
| R03 | `status='all'` ne filtrira; druge veljavne vrednosti zahtevajo `task.status === status`. `order='original'` ohrani zaporedje API odgovora. Naslovna urejanja primerjata normaliziran naslov po UTF-16 kodnih enotah; pri izenačenju ostane izvorno zaporedje. Iskanje, stanje in vrstni red delujejo skupaj po AND. | Test vseh kombinacij veljavnih vrednosti, enakih naslovov in več zadetkov. |
| R04 | Za relevantne parametre upoštevaj prvo pojavitev. Neznan `status` pomeni `all`, neznan `order` pomeni `original`. Neznani parametri in neveljavne vrednosti ne vplivajo na prikaz. Samodejno ne prepiši URL-ja med razčlenjevanjem. | Test ponovljenih, neveljavnih in tujih parametrov ter primerjava prikaza in URL-ja. |
| R05 | Sprememba iskalnega polja ali izbire ustvari samo osnutek; ne spremeni prikaza ali URL-ja. `Uporabi pogled` potrdi vse tri vrednosti hkrati. Če se potrjeno stanje spremeni, ustvari natanko en novo zgodovinsko stanje; če je enako, ne doda vnosa. | Test osnutka, dveh zaporednih potrditevah in dolžine zgodovine. |
| R06 | Ob potrditvi `q` obreže zunanje beline. Izpusti privzete parametre, URL-kodiraj preostale vrednosti in odstrani neznane parametre. Ohrani obstoječi `view=board` in pot opravila. Enaka ponovljena potrditev ne ustvari novega zgodovinskega vnosa. | Test URL obrazca, posebnih znakov, table in podrobnosti. |
| R07 | Nazaj/Naprej obnovita potrjen filter, prikaz in osnutek kontrol. Osvežitev prebere isto stanje iz URL-ja. | Test dveh različnih potrditev, `goBack`, `goForward` in `reload`. |
| R08 | Preklop Preglednica/Tabla ohrani potrjene `q`, `status`, `order` ter prikaže iste ID-je. Vsak preklop poti ali pogleda zavže nepotrjen osnutek in nastavi kontrole na novo potrjeno stanje. | Test istih ID-jev v obeh pogledih med spreminjanjem osnutka. |
| R09 | Povezava na opravilo vsebuje njegov `id`, tudi pri enakih naslovih. Odpiranje, gumb za zapiranje in Escape ohranijo potrjene parametre ter `view`. Zapiranje vrne na projektno pot z istim stanjem. | Test dveh enakih naslovov, podrobnosti, Escape in gumba za zapiranje. |
| R10 | Klik na drug projekt v navigaciji začne njegov privzeti pregled (`q=''`, `status='all'`, `order='original'`) in ohrani trenutni `table`/`board`. Neposredna povezava na drug projekt z parametri jih upošteva. | Test preklopa iz filtriranega projekta in neposrednega URL-ja drugega projekta. |
| R11 | `Ponastavi pogled` nastavi privzeti stanje in osnutek ter posodobi zgodovino po istem pravilu kot potrditev, obdrži pa trenutni način pogleda. Če filtriran seznam ni prazen, prikaže obstoječe ID-je; če je prazen, prikaže besedilo `Ni zadetkov.`. Regija `role="status"` z `aria-label="Rezultati povezave"` vsebuje `Prikazano: N od M.`, kjer je `N` število prikazanih in `M` vseh opravil projekta. | Test ponastavitve, brez zadetkov, nič opravil in števca. |
| R12 | Nova logika ne pokliče pisalnih API-jev, ne uporablja `/__test/` in ne shranjuje stanja v `localStorage`. Ohrani neznano pot, nalaganje, napako, podrobnosti, `data-task-id`, dostopna imena pogledov/stolpcev, `aria-label="Pregled stanj opravil"` in odziven videz Folio. Vsako novo dejanje ob opravilu mora biti izven povezave opravila. | Skupni testi, razvojni testi P09, pregled kode in preverjanje širine 390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R04 | Razčlenjevanje, normalizacija in filtriranje so čiste funkcije nad `Task[]` in URL-jem. | Implementer naj doda teste v `tests/agent/` za URL, Unicode, kombinacije in ponovljene parametre. | Predvidoma `src/navigation.ts` in `src/App.tsx`; notranja imena niso predpisana. | V tej fazi ni izvedeno; specifikacijski avtor ni zaganjal testov. |
| R05–R07 | Potrditev in ponastavitev spremenita URL enkrat ter osnutek uskladita s potjo. | Implementer naj preveri osnutek, zgodovino, Nazaj/Naprej in osvežitev. | Predvidoma `src/navigation.ts`, `src/App.tsx`. | Ni izvedeno v tej fazi. |
| R08–R10 | Vse povezave na projekt, opravilo, podrobnost in preklop pogleda nosijo ustrezno pot, `view` in potrjene parametre. | Implementer naj doda ali posodobi teste za oba pogleda, enake naslove in preklop projekta. | Predvidoma `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`. | Ni izvedeno v tej fazi. |
| R11–R12 | Prikaz, števec, prazen rezultat in obstoječa dostopnost ostanejo skladni. | Implementer naj izvede `tests/development/P09.spec.ts`, smiselne skupne teste ter lastne teste za širino in pisanje. | Predvidoma `src/App.tsx`, `src/styles.css`. | Ni izvedeno v tej fazi. |

## Odprta vprašanja in omejitve

- Predpostavka: `view=table` je privzet in se lahko izpusti; `view=board` se ohrani. Neznani parametri se odstranijo šele ob potrditvi ali ponastavitvi, ne ob samem odprtju.
- Predpostavka: iskanje primerja normalizirana polja, ne izvirnih nizov; urejanje naslovov uporablja isti normalizacijski postopek.
- Obseg: strežnik, `shared/`, odvisnosti, nastavitve zagona in skupni testi ostanejo nespremenjeni. Spremembe so dovoljene samo v `src/`, `tests/agent/` in dokumentih v `docs/agent/`.
- Specifikacija ne predpisuje notranjega imena funkcij ali komponent. Implementer naj ohrani obstoječi dizajn in slovenske oznake iz dogovora o vmesniku.
