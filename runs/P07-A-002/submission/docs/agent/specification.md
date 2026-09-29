# P07 — specifikacija postopka A

## Problem in kontekst

Folio že bere projekte in opravila iz javnega API-ja ter omogoča preglednico,
tablo in podrobnosti po ID-ju. Dodamo lokalno označevanje priljubljenih,
filtriranje in trajno shrambo brez spreminjanja podatkov opravil ali API-ja.
Ohranimo slovenski vmesnik, potrjeni videz in obstoječo navigacijo.
Nalogo izvaja en agent. Specifikacija je pripravljena pred implementacijo.

## Vhodi, dejanja in izidi

- Vhod je urejen seznam opravil trenutnega projekta iz `/api/`; za izbor
  uporabljamo samo `id`. Naslovi niso enolični. Seznam je lahko prazen.
- Globalna množica `F` vsebuje nize ID-jev, tudi iz drugih projektov oziroma
  trenutno neznane. Ob zagonu jo obnovimo iz `folio:favorites:v1`.
- Projektni filter `q` se začne z `false`. Preklop pogleda ali podrobnosti
  ohrani `q`; menjava projekta in osvežitev ga ponastavita.
- Preklop zvezdice spremeni en ID. Brisanje projektnih priljubljenih odstrani
  vse ID-je trenutnega projekta. Obe dejanji takoj posodobita prikaz in
  poskusita shraniti samo `{version:1,ids:[...]}`.
- Dogodek `storage` za ta ključ nadomesti `F` brez zapisovanja nazaj.
- Neveljavna vsebina pomeni prazno množico, brez samodejnega popravljanja
  shrambe. Izjema pri branju ali pisanju pomeni opozorilo in nadaljnje
  delovanje v pomnilniku. Preklic podrobnosti ne spreminja priljubljenih.

## Zahteve in pravila

Naj bo `T` urejen seznam celotnega trenutnega projekta, `P={t.id | t∈T}`,
`F` globalna množica priljubljenih in `q` logična vrednost filtra.
`V = [t∈T | ¬q ∨ t.id∈F]`; filtriranje ohrani relativni vrstni red.
Preklop `i`: `F' = F △ {i}`. Projektno brisanje: `F' = F \ P`.
Števec: `X=|F∩P|`, `M=|T|`; onemogočen gumb ⇔ `X=0`.
Veljaven zapis ⇔ JSON objekt z `version === 1`, tabelo `ids` in
`∀i∈ids: typeof i === 'string'`. Razčlenitev vrne `Set(ids)`, sicer `∅`.
Zapis: `ids = [...F].sort()` (primerjava kodnih enot UTF-16).

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsaka vrstica/kartica ima ločen gumb `Priljubljeno opravilo <id>` z `aria-pressed`; klik ne odpre podrobnosti. | D01 ter lastni preizkus tipkovnice in enakih naslovov. |
| R02 | Zapiše samo različico in enkratne, po UTF-16 urejene nize ID-jev. | D03 ter lastni preizkus zapisa z Unicode ID-ji. |
| R03 | Obnova odstrani podvojitve; ohrani neznane ID-je brez izmišljenih opravil. | Lastni preizkus obnove in naslednjega zapisa. |
| R04 | Manjkajoč/neveljaven zapis pomeni prazno množico; nalaganje ne zapisuje. | Tabela neveljavnih vhodov in opazovanje zapisov. |
| R05 | Checkbox privzeto ni označen; prikaz je `V`. | D02 ter lastni preizkus drugačnega vrstnega reda in >10 opravil. |
| R06 | Odstranitev ob aktivnem filtru takoj odstrani opravilo; prazen prikaz pove `Ni priljubljenih opravil.`; filter ostane dostopen. | D02 in prazni projekti v obeh pogledih. |
| R07 | Oba pogleda delita `F` in `q`; podrobnosti uporabljajo pravi ID. | D04 in lastni preizkus filtra, stolpcev in podrobnosti. |
| R08 | Menjava projekta ohrani `F`, ponastavi `q`; ob osvežitvi se obnovi samo `F`. | Lastni preizkus navigacije, vrnitve in osvežitve. |
| R09 | Brisanje je `F \ P`, ne samo brisanje vidnih; pri `X=0` je onemogočeno. | Lastni preizkus več projektov, neznanih ID-jev in aktivnega filtra. |
| R10 | `role=status`, oznaka `Število priljubljenih`, besedilo `Priljubljeno: X od M.`; stolpci štejejo vidne. | Lastni preizkus števcev pred/po filtriranju in v praznem projektu. |
| R11 | Pravi ključ se validira kot ob zagonu, `null` izprazni, drug ključ se ignorira; brez povratnega zapisa. Izjeme ne ustavijo UI; `role=alert` vsebuje `shramba`. | Lastni preizkusi dogodkov, dveh zavihkov in izjem pri branju/pisanju. |
| R12 | Samo lokalne spremembe priljubljenih; brez API zapisov in sprememb opravil; brez širjenja strani pri 390 px. | Celotni `npm run check`, opazovanje zahtev/podatkov in ozki prikaz. |

## Izvedba in sledljivost

Spodnje poti so izvedene. Dejanski rezultati, imena testov, dnevniki in
omejitve so zbrani v [verification.md](verification.md). Oznake A01–A08
se nanašajo na [lastne teste](../../tests/agent/favorites.spec.ts), D01–D04
pa na [skupne razvojne teste](../../tests/development/P07.spec.ts).
Vsi navedeni testi so uspešni v končnem [dnevniku](check.log).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Preklop enega ID-ja | D01, A04, A08 | `src/FavoriteButton.tsx` (gumb), `src/App.tsx` (vrstice), `src/TaskBoard.tsx` (kartice) | Uspešno; [check.log](check.log). |
| R02 | Kanonični zapis | D03, A02 | `src/useFavorites.ts`: `save` | Uspešno; A02 preveri tudi vrstni red emoji/BMP in točno obliko zapisa. |
| R03 | Obnova množice | A02, A03 | `src/useFavorites.ts`: `parseFavorites`, `readFavorites` | Uspešno; podvojitve, neznani ID-ji, osvežitev. |
| R04 | Stroga validacija brez zapisa | A01 (11 primerov), A02 | `src/useFavorites.ts`: `parseFavorites`, `readFavorites` | Uspešno; spremljani klici `setItem` ostanejo prazni ob nalaganju. |
| R05 | Urejen filter | D02, A04, A08 | `src/App.tsx`: `favoritesOnly`, `visibleTasks` | Uspešno; tudi obrnjen vrstni red shranjenih ID-jev in 13 opravil. |
| R06 | Prazni rezultati in okrevanje | D02, A03, A04, A08 | `src/App.tsx`: kontrole in prazno stanje | Uspešno v obeh pogledih, tudi ob praznem projektu. |
| R07 | Skupno stanje in podrobnosti | D04, A04, A08 | `src/App.tsx`: globalni hook in `ProjectView`; `src/TaskBoard.tsx`: povezava po ID-ju | Uspešno; ostanejo tudi podrobnosti ID-jev s presledki in ločili. |
| R08 | Življenjska doba stanja | A02, A03, A07 | `src/App.tsx`: `useFavorites`, ključ projekta; `src/useFavorites.ts`: obnova | Uspešno; navigacija in osvežitev ponastavita le filter. |
| R09 | Brisanje celotnega projekta | A03, A07, A08 | `src/App.tsx`: gumb; `src/useFavorites.ts`: `remove` | Uspešno; drugi projekt in neznani ID-ji ostanejo. |
| R10 | Projektni/vidni števci | A03, A04, A08 | `src/App.tsx`: `favoriteCount`; `src/TaskBoard.tsx`: `entries.length` | Uspešno; števec celote, vidni stolpci, prazen projekt. |
| R11 | Dogodki in izjeme | A05, A06, A07 (3 primeri) | `src/useFavorites.ts`: `synchronize`, `readFavorites`, `save`; `src/App.tsx`: opozorilo | Uspešno; sintetični dogodki in dva dejanska zavihka, brez povratnih zapisov. |
| R12 | Regresije in širina | Vseh 38 izhodiščnih, D04, A02, A04, A07, A08, vizualni pregled | `src/styles.css`, vse spremenjene komponente | Uspešno; 68 testov skupaj, [vizualne meritve](visual-check.json). |

## Odprta vprašanja in omejitve

- Navodilo P07 izrecno zahteva localStorage za priljubljene; splošna prepoved
  nadomestitve strežniških podatkov z localStorage ostaja v veljavi za opravila.
- Pri aktivnem filtru prazna tabla ohrani svoje tri stolpce in dodatno pokaže
  zahtevano obvestilo; tako ohranimo obstoječo strukturo table.
- Opozorilo o izjemi shrambe ostane do osvežitve; uspešna kasnejša dejanja
  lahko še naprej poskusijo zapis. Izpad shrambe ne zagotavlja trajnosti.
- Nove sočasne spremembe opravil in navigacija med nalaganjem zunaj
  regresijskih zahtev niso razširjen obseg. Končni skriti testi niso dostopni.

## Zgodovina sprememb

- 2026-09-25, v1: začetna specifikacija pred implementacijo; rezultati še odprti.
- 2026-09-25, v1.1: po izvedbi dodana sledljivost A01–A08, dejanski uspešni
  rezultati in dokazila. Sprejemni pogoji niso spremenjeni. Dostopno ime
  povezave kartice ostane naslov + ID, podano neposredno z `aria-label`,
  da tudi ID-ji s presledki ne postanejo neveljavne reference `aria-labelledby`.
