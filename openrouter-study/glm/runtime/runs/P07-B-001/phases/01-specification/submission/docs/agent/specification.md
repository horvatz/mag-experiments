# Specifikacija: priljubljena opravila in trajna shramba (P07)

## Problem in kontekst

Folio prikazuje opravila trenutnega projekta v preglednici in na tabli ter omogoča podrobnosti, nalaganje, navigacijo, izvoz CSV in ozki prikaz. Uporabnik želi posamezna opravila označiti kot priljubljena, jih ohraniti med osvežitvami, filtrirati samo nanje in počistiti priljubljene trenutnega projekta.

Sprememba je lokalna v uporabniškem vmesniku. Podatke še vedno beremo iz obstoječega javnega API-ja; priljubljenih ne shranjujemo prek `/api/` in ne spreminjamo polj `Task`. Obstoječi Folio dizajn, dostopna imena pogledov/stolpcev, `data-task-id`, navigacija in ozka postavitev ostanejo.

## Vhodi, dejanja in izidi

Relevantni tipi so določeni v `shared/types.ts`:

- `Project = { id: string; name: string }`
- `Task = { id: string; projectId: string; title: string; description: string; status: 'todo' | 'in_progress' | 'done'; assignee: string; dueDate: string }`

API je lahko poljuben znotraj teh tipov: 0, 1, več kot 10 ali drugačno število opravil; ID-ji so enkratni; naslovi so lahko enaki; besedilo lahko vsebuje Unicode in ločila; datumi so veljavni koledarski datumi; projekta sta lahko prazna.

Nova stanja:

- `globalFavorites: string[]` – globalna, enkratna, po UTF-16 razvrščena množica ID-jev. Lahko vsebuje ID-je drugih projektov ali trenutno neznanih opravil.
- `showFavorites: boolean` – privzeto `false`; pripada trenutnemu prikazu projekta.
- `visibleTasks = showFavorites ? currentTasks.filter(task => globalFavorites.includes(task.id)) : currentTasks` – vedno v izvornem vrstnem redu `currentTasks`.

Dejanja:

- `toggleFavorite(taskId)` spremeni le trenutni `taskId` v `globalFavorites`; ne odpre podrobnosti.
- `setShowFavorites(next)` preklopi filter.
- `removeCurrentProjectFavorites()` odstrani izključno ID-je trenutno naloženih opravil.

Shranjena vrednost pod ključem `folio:favorites:v1` je natančno:

```json
{"version":1,"ids":["…","…"]}
```

Pri zapisu so `ids` enkratni nizi, razvrščeni po UTF-16 kodnih enotah (JS `.sort()` brez lokalnega primerjalnika). V shrambo se ne zapisujejo opravila, projekti ali filter.

## Zahteve in pravila

| Zahteva | Sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za vsako vrstico preglednice in vsako kartico table obstaja ločen gumb z dostopnim imenom `Priljubljeno opravilo <id>` in `aria-pressed`. Gumb je izven povezave opravila. Preklic spremeni le pripadajoči ID; ne odpre podrobnosti in ne vpliva na opravilo z enakim naslovom. | Interaktivni test z enakimi naslovi preveri obstoj, `aria-pressed`, neodvisnost in odsotnost pogovornega okna. |
| R02 | Validna shramba je JSON objekt z `version === 1` in `ids` kot tabelo nizov. Zapis vedno uporabi enkratne, UTF-16 razvrščene ID-je globalne množice. | Neposredno preveri `localStorage.getItem('folio:favorites:v1')` po preklopih, osvežitvi in menjavi projekta. |
| R03 | Ob nalaganju se globalna množica obnovi iz shrambe. Podvojeni ID-ji veljajo enkrat. Neznani ID-ji ostanejo v globalni množici, vendar ne kreirajo prikazanih opravil in ne vplivajo na števec trenutnega projekta. | Osvežitev z duplikati, ID-jem drugega projekta in neznanim ID-jem; preveri prikaz, števec in shrambo. |
| R04 | Manjkajoč ključ, neveljaven JSON, `version !== 1`, manjkajoči `ids` ali katerikoli neniz v `ids` ustvari prazno globalno množico. Neveljaven vnos ne povzroči napake aplikacije in ob nalaganju ne sproži zapis v shrambo. | Parametrizirani testi vseh neveljavnih oblik; primerjava shrambe pred in po osvežitvi. |
| R05 | `showFavorites` je ob zagonu in osvežitvi `false`. Aktiviran filter prikaže `visibleTasks`; vrstni red ostane enak vrstnemu redu API-ja. | Preveri privzeto `false`, vklop, izvorni vrstni red in izklop/povratek vseh opravil. |
| R06 | Med aktivnim filtrom preklic priljubljenega takoj skrije pripadajoči prikaz. Če je `visibleTasks = []`, je viden natančno `Ni priljubljenih opravil.`; filter in nadzori za njegov izklop ostanejo omogočeni. | Interakcijski test vklopa, odstranitve priljubljenega, praznega stanja in izklopa filtra. |
| R07 | Preglednica in tabla uporabljata isti `globalFavorites` in isti `showFavorites`. Preklop pogleda ne izgubi filtrov ali priljubljenih. Podrobnosti ostanejo dosegljive po pravilnem `taskId`; filter ne spreminja ID-ja poti. | Preklopi med pogledoma pred in po spremembi; odpri podrobnost in preveri pot/ID. |
| R08 | Menjava projekta ohrani globalno množico (vključno z ID-ji drugih projektov), vendar nastavi `showFavorites = false`. Enako velja po osvežitvi. | Nastavi priljubljene v obeh projektih, preklopi projekta in osveži; preveri shrambo ter filter. |
| R09 | `removeCurrentProjectFavorites()` izračuna `globalFavorites \ { id(task) | task ∈ currentTasks }`. Ohrani ID-je drugih projektov in neznane ID-je. Gumb `Odstrani priljubljene tega projekta` je onemogočen natanko tedaj, ko trenutni projekt nima priljubljenih naloženih opravil. | Test z dvema projektoma in neznanim ID-jem; preveri `disabled`, shrambo in prikaz po čiščenju. |
| R10 | Element z `role="status"`, `aria-label="Število priljubljenih"` kaže `Priljubljeno: X od M.`, kjer je `X` število priljubljenih trenutnega projekta in `M` število vseh trenutno naloženih opravil; filter ne spremeni X/M. Števci stolpcev table štejejo vidna opravila po statusu. | Preveri besedilo pri 0, delnem in popolnem filtru ter praznem projektu; preveri števce stolpcev. |
| R11 | `storage` dogodek z ključem `folio:favorites:v1` uporabi `event.newValue` po istih pravilih validacije; `null` izprazni množico, neveljaven JSON pa da prazno množico. Dogodki za druge ključe se ignorirajo. Dogodek ne povzroči povratnega zapisa. Če branje ali zapis shrambe vrže izjemo, se stanje spremeni v pomnilniku, aplikacija ostane uporabna in se prikaže `role="alert"` z besedo `shramba`. | Test dveh zavihkov ali dispatch dogodka, drugega ključa ter stub izjemljivega `localStorage`. |
| R12 | Nobeno dejanje priljubljenih ne pošlje zahtev, ki spreminjajo `/api/`; nobeno polje opravila se ne spremeni. UI ne uporablja ali uvaža `/__test/`. Obstoječe funkcionalnosti in regresijske lastnosti izhodišča ostanejo. | Spremljaj ne-GET zahteve in stanje strežnika; poženi skupne teste in P07 razvojne teste; preveri ozko postavitev. |

Dogovor o dostopnosti:

- Gumbi: `Priljubljeno opravilo <id>` z `aria-pressed="true" | "false"`.
- Checkbox: `Prikaži le priljubljena`.
- Čistilni gumb: `Odstrani priljubljene tega projekta`.
- Števec: `role="status"`, `aria-label="Število priljubljenih"`, vidno besedilo `Priljubljeno: X od M.`
- Napaka shrambe: `role="alert"` in vsebuje besedo `shramba`.

## Izvedba in sledljivost

| Zahteva | Pogoj | Predvidena koda | Test ali scenarij | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01, R05–R10 | Filter, števec in kontrole projekta | `src/App.tsx` – `ProjectView`, obstoječa preglednica | `tests/development/P07.spec.ts:1` in lastni UI testi za števce, projekt in prazno stanje | Ni izvedeno v tej fazi. |
| R01, R06, R10 | Gumb na karticah in števci stolpcev | `src/TaskBoard.tsx` – obstoječe kartice/stolpci | Lastni Playwright test z več statusi, enakimi naslovi in filtrom | Ni izvedeno v tej fazi. |
| R02–R04, R08, R09, R11 | Validacija, shramba, dogodki in napaka | Nov pripomoček/hook v `src/`; skupni tipi se ne spreminjajo | Lastne enotske ali UI preizkusne točke za vse neveljavne vnose, globalnost in izjeme | Ni izvedeno v tej fazi. |
| R07, R12 | Ohranitev navigacije, podrobnosti in lokalnosti | `src/navigation.ts`, `src/TaskDetails.tsx` obstaneta združljiva | `tests/baseline.spec.ts` + `tests/development/P07.spec.ts` | Ni izvedeno v tej fazi. |

Izid v tej fazi je samo specifikacija; testi niso bili zagnani. Implementer mora po zakluku zamenjati `Ni izvedeno v tej fazi.` z dejanskim testom, delom kode in rezultatom. Ne sme navesti uspešnega izida brez zagona.

## Odprta vprašanja in omejitve

- Ni znanega nesoglasja z izvirnimi zahtevami.
- Strežnik, skupni tipi, infrastruktura, odvisnosti in skupni testi ostanejo nespremenjeni.
- Postavitev novih kontrol ni predpisana, vendar mora biti v skladu s `docs/dizajn.md`, tipkovnično dosegljiva in brez razširitve strani na 390 px.
- Navigacija med nezaključenim nalaganjem ter sočasne spremembe API podatkov brez osvežitve niso dodatne regresijske zahteve.
