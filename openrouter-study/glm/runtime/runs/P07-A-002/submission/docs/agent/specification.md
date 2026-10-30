# Specifikacija P07: Priljubljena opravila in trajna shramba

## Problem in kontekst

Folio že prikazuje opravila projekta v preglednici in na tabli ter omogoča podrobnosti prek ID-ja. Uporabnik potrebuje osebno označevanje opravil, ki je lokalno, vzdržuje globalno množico ID-jev in ne spreminja podatkov na API-ju.

## Vhodi, dejanja in izidi

- Podatki ostanejo: `GET /api/projects`, `GET /api/projects/:projectId/tasks` in obstoječe branje podrobnosti.
- Trajna shramba: `localStorage` pod ključem `folio:favorites:v1`, vsebina `{version:1,ids:[...]}`.
- Dejanja: preklop priljubljenega opravila po ID-ju, filter `Prikaži le priljubljena`, odstranitev priljubljenih trenutnega projekta in navigacija po obstoječih pogledih.
- Uspeh: preglednica in tabla uporabljata isto množico in filter; stanje preživi osvežitev in menjavo projekta.
- Napaka: neveljaven ali manjkajoč zapis se obravnava kot prazna množica; napaka branja ali pisanja shrambe prikaže opozorilo in ne prekine delovanja v pomnilniku.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za vsak `task.id` obstaja neodvisen gumb `Priljubljeno opravilo <id>` z `aria-pressed`; klik spremeni le izbrani ID, ne odpre podrobnosti in ne povezuje enakih naslovov. | Razvojni test D01 in lastni testi `tests/agent/P07-favorites.spec.ts`. |
| R02 | `favoriteIds = uniqueSorted(ids)`; zapis je točno `{version:1,ids:favoriteIds}`, ID-ji so nizi, urejeni po UTF-16, brez polj opravil. | Lastni test preveri vsebino localStorage. |
| R03 | `load(raw)` iz veljavnega zapisa vrne enkratno množico; podvojitve so ena, neznani ID-ji ostanejo, opravila se ne ustvarijo. | Lastni test z neznanim in podvojenim ID-jem. |
| R04 | `raw = null`, neveljaven JSON, napačna različica, manjkajoči ali ne-tabela `ids` ali katerikoli ne-niz v `ids` pomeni prazno množico; ob nalaganju se shramba ne prepisuje. | Lastni test za neveljavne zapise. |
| R05 | `showFavoritesOnly` je privzeto `false`; kadar je `true`, so vidni samo trenutni projektovi ID-ji iz `favoriteIds` v izvornem vrstnem redu. | Razvojni test D02 in lastni test. |
| R06 | Odstranitev priljubljenega med aktivnim filtrom takoj skrije opravilo; če ni rezultatov, se izpiše `Ni priljubljenih opravil.` in filter ostane nadzorljiv. | Razvojni test D02 in lastni test. |
| R07 | Množica in filter sta skupna preglednici in tabli; preklop pogleda ohrani stanje, podrobnosti delujejo po ID-ju. | Razvojni test D04 in lastni test. |
| R08 | Menjava projekta ohrani globalno `favoriteIds`, zaradi ponovnega prikaza projekta nastavi `showFavoritesOnly = false`; osvežitev obnovi obe stanji. | Lastni test menjave projekta in osvežitve. |
| R09 | Odstranitev trenutnega projekta odstrani le ID-je opravil celotnega trenutnega projekta; tuji in neznani ID-ji ostanejo. Gumb je onemogočen, kadar preseka ni. | Lastni test. |
| R10 | Element `role=status` z `aria-label="Število priljubljenih"` vedno izpiše `Priljubljeno: X od M.` za celoten trenutni projekt; stolpci table štejejo vidne karte. | Lastni test v obeh pogledih. |
| R11 | Dogodek `storage` za pravi ključ uporabi isto validacijo; `null` ali neveljavno vrednost izprazni množico, drug ključ se ignorira, povratnega zapisa ni. Izjema branja ali pisanja prikaže `role=alert` z besedo `shramba`. | Lastni test dogodka in nedostopne shrambe. |
| R12 | Vse spremembe so lokalne; ne sme biti nobenega ne-GET zahtevka na `/api`, nobeno polje opravila se ne spremeni in obstoječa navigacija ostane delujoča. | Razvojni test D04, lastni test in skupni testi. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Zgornja pravila | `tests/agent/P07-favorites.spec.ts` | `src/useFavorites.ts`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | Rezultati so zapisani v `docs/agent/verification.md`. |

## Odprta vprašanja in omejitve

- Dovoljene spremembe so omejene na `src/`, `tests/agent/` in `docs/agent/`; strežnik, skupni tipi, skupni testi in odvisnosti se ne spreminjajo.
- Testni pripomočki `/__test/` so namenjeni samo testom; uporabniški vmesnik jih ne uporablja.

## Zgodovina popravkov

- 2026-10-30: Prva izvedba specifikacije za zahteve R01–R12.
