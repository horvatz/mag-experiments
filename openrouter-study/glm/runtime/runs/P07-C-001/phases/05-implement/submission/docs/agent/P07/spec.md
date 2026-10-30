# P07: Priljubljena opravila in trajna shramba

## Problem in kontekst

Folio danes prikazuje opravila projekta v preglednici in na tabli, uporabnik pa ne more označiti opravil, ki jih želi hitro najti. P07 doda lokalne, globalne priljubljene opravila in možnost prikaza le priljubljenih, pri čemer se ohranita obstoječe obnašanje in potrjeni dizajn Folio.

## Vhodi, dejanja in izidi

- Vnosi: projekti in opravila iz obstoječega javnega `/api/`; shramba `localStorage` pod ključem `folio:favorites:v1`; dogodek `storage`.
- Stanje: `F` je množica ID-jev priljubljenih opravil; `showOnlyFavorites` nadzira filter; `view` je `table` ali `board`.
- Dejanja: preklop priljubljenega posameznega opravila, prikaz le priljubljenih, odstranitev priljubljenih trenutnega projekta, preklop pogleda in menjava projekta.
- Izidi: shramba vsebuje `{"version":1,"ids":[...]}` z enkratnimi nizi v UTF-16 zaporedju; prikaz upošteva filter; stanje v pomnilniku ostane uporabno tudi ob napaki shrambe.
- Omejitve: spremembe so lokalne; testne kontrole `/__test__/`, novi zapisovalni API-ji in spremembe polj opravil niso dovoljeni.

### Pravila spremembe stanja

Naj bo `T_p` seznam opravil trenutnega projekta v izvornem vrstnem redu API-ja. Naj bo `load(value)` prazna množica, če vrednost ni veljaven JSON `{version:1,ids:[...]}` s samimi nizi; sicer so `ids` po odstranitvi podvojitev množica ID-jev. Naj bo `persist(F)` kanoniziran zapis z razvrstitvijo ID-jev po UTF-16.

1. Nalaganje: `F = load(localStorage["folio:favorites:v1"])`; `showOnlyFavorites = false`. Neveljaven ali manjkajoč zapis ne povzroči odpovedi in se ne prepisuje.
2. Preklop priljubljenega `id`: `F = F △ {id}`. Izvede se zapis `persist(F)`. Napaka shrambe pusti novo stanje v pomnilniku in prikaže opozorilo.
3. Filter: `showOnlyFavorites = checked`. Pri aktivnem filtru so vidni `T_p ∩ F` v izvornem vrstnem redu.
4. Preklop pogleda: spremeni se le `view`; `F` in `showOnlyFavorites` ostaneta enaki.
5. Menjava projekta: spremeni se trenutni projekt; `F` ostane globalna, `showOnlyFavorites = false`.
6. Odstranitev priljubljenih trenutnega projekta: `F = F \ {id(t) : t ∈ T_p}`. ID-ji drugih in neznanih projektov ostanejo.
7. Dogodek `storage`: samo za pravi ključ nastavi `F = load(newValue)`; `null` pomeni prazno množico. Filter se ne spremeni in zapis se ne ponovi.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za vsak `t ∈ T_p` obstaja ločen gumb z dostopnim imenom `Priljubljeno opravilo <t.id>` in `aria-pressed`; klik spremeni samo `t.id` in ne odpre podrobnosti. | Brskalniški test preveri gumb, vrednost in izoliran preklop tudi pri enakih naslovih. |
| R02 | `persist(F)` piše `folio:favorites:v1` kot `{version:1,ids:[...]}`, kjer so `ids` enkratni nizi razvrščeni po UTF-16; shranjujejo se samo ID-ji. | Test prebere shrambo po enem ali več preklopih in preveri kanonični JSON. |
| R03 | Po osvežitvi veljaven zapis obnovi `F`; podvojene ID-je obravnava kot enega, neznane ID-je ohrani, ne ustvari pa novih opravil. | Testi z duplikati, neznanimi ID-ji, enakimi naslovi in različnim vrstnim redom. |
| R04 | Manjkajoč ključ, neveljaven JSON, `version ≠ 1`, manjkajoči `ids` ali neniz v `ids` povzročijo prazno `F`; aplikacija se naloži in ob nalaganju ne prepisuje shrambe. | Parametrizirani testi neveljavnih vrednosti preverijo prikaz in nespremenjenost shrambe. |
| R05 | `showOnlyFavorites` je privzeto `false`; ko je aktiven, so vidna trenutna opravila projekta iz `F` v izvornem vrstnem redu. | Test preveri privzeto stanje, vrstni red in neodvisen prikaz neznanih ID-jev. |
| R06 | Odstranitev priljubljenega med aktivnim filtrom takoj odstrani opravilo iz prikaza. Prazen prikaz vsebuje `Ni priljubljenih opravil.` in filter ostane moč izklopiti. | Test preklopi priljubljeno med filtrom in preveri sporočilo ter kontrolo. |
| R07 | Preglednica in tabla uporabljata isti `F` in filter; preklop pogleda ohrani oba. Podrobnosti uporabljajo pravilni `id`. | Test zamenja pogled, preveri oba prikaza in odpre podrobnost. |
| R08 | Menjava projekta ohrani globalni `F`; `showOnlyFavorites` se nastavi na `false`. Enako velja po osvežitvi. | Test preklopi priljubljene, zamenja projekt ter osveži stran. |
| R09 | Gumb odstrani samo `{id(t) : t ∈ T_p}` iz `F`; ID-ji drugih projektov in neznani ID-ji ostanejo. Gumb je onemogočen, ko je ta presek prazen. | Test z ID-ji več projektov in neznanimi ID-ji preveri ostankov in stanje gumba. |
| R10 | Status številca vedno vsebuje `Priljubljeno: X od M.`, kjer sta `X` in `M` števili za celoten trenutni projekt, tudi ob aktivnem filtru. Števci stolpcev štejejo vidna opravila. | Test preveri števce pri filtru, brez njega, z nič, enim in več opravili. |
| R11 | Dogodek `storage` za pravi ključ takoj nastavi `F` po istih pravilih validacije; `null` jo izprazni, drugi ključi se ignorirajo, zapis se ne sproži. Izjema pri branju ali zapisu pusti aplikacijo uporabno in prikaže opozorilo z besedo `shramba`. | Testi z uporabniškim ali nadzorovanim dogodkom `storage`, drugim ključem ter izjemo v `localStorage`. |
| R12 | Nobena sprememba priljubljenih ne pokliče zapisovalnega API-ja in ne spremeni polj opravil. Folio, nalaganje, navigacija, dostopnost in ozki prikaz ostanejo ohranjeni. | Regresijski testi izhodišča in testi omrežnih zahtev ter vizualnega/vmesnega stanja. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Ločen gumb z `aria-pressed` ne odpre podrobnosti. | `R01 table...` in `R01 board...` | `src/App.tsx`, `src/TaskBoard.tsx` | Uspešno; `tests/agent/P07/favorites.spec.ts`, 18 lastnih testov in `npm run check` 64/64. |
| R02 | Kanonični JSON z enkratnimi ID-ji po UTF-16. | `R02 favorites persist...` | `src/useFavorites.ts` | Uspešno; lastni test in `npm run check`. |
| R03 | Obnovitev, duplikati in neznani ID-ji. | `R03 valid saved...` | `src/useFavorites.ts` | Uspešno; lastni test in `npm run check`. |
| R04 | Neveljavni zapisi pomenijo prazno množico brez pisanja. | Pet primerov `R04 ...` | `src/useFavorites.ts` | Uspešno; lastni testi in `npm run check`. |
| R05 | Privzeti filter in izvorni vrstni red. | `R05 filter...` | `src/App.tsx` | Uspešno; lastni test in `npm run check`. |
| R06 | Takojšnja odstranitev iz prikaza in uporabne kontrole. | `R06 removing...` | `src/App.tsx` | Uspešno; lastni test in `npm run check`. |
| R07 | Skupna množica in filter v obeh pogledih; pravi ID. | `R07 table and board...` | `src/App.tsx`, `src/TaskBoard.tsx` | Uspešno; lastni test in `npm run check`. |
| R08 | Globalne priljubljene in ponastavljen filter. | `R08 project changes...` | `src/App.tsx`, `src/useFavorites.ts` | Uspešno; lastni test in `npm run check`. |
| R09 | Odstranitev le ID-jev trenutnega projekta. | `R09 clearing...` | `src/App.tsx`, `src/useFavorites.ts` | Uspešno; lastni test in `npm run check`. |
| R10 | Celoten projekt v statusu, vidni števci stolpcev. | `R10 counters...` | `src/App.tsx`, `src/TaskBoard.tsx` | Uspešno; lastni test in `npm run check`. |
| R11 | Dogodek `storage`, ignoriranje drugih ključev in napaka shrambe. | `R11 storage...`, `R11 a storage...` | `src/useFavorites.ts`, `src/App.tsx` | Uspešno; lastna testa in `npm run check`. |
| R12 | Lokalne spremembe, ohranjena polja, Folio in ozki prikaz. | `R12 favorites are local...` | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | Uspešno; lastni test in `npm run check`. |

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj: poti dokumentacije, shramba, filter, validacija in meje izhodišča so določene.
- Končni testi bodo lahko uporabili poljubne veljavne podatke iz opisane domene; razvojni primeri niso celoten obseg.
- Ta dokument ne dodaja zunanjih meritev, odvisnosti ali funkcij zunaj R01–R12.
