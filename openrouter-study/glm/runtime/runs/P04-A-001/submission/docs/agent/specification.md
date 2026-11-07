# Specifikacija P04: stabilno razvrščanje z dvema ključema

## Problem in kontekst

Folio trenutno prikaže opravila projekta v vrstnem redu, ki ga vrne `/api/projects/{id}/tasks`. Uporabnik potrebuje preglednejši vrstni red po enemu primarnemu in enemu sekundarnemu ključu, hkrati pa mora izvorni vrstni red ostati reproducljiv in nespremenjen kot projekcija. Razvrščanje je stanje trenutnega projekta in pogleda; ne shranjuje se, ne spreminja podatkov in ne vpliva na pripadnost opravil.

## Vhodi, dejanja in izidi

- Podatkovna polja: `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`. Vsi datumi so veljavni `YYYY-MM-DD`.
- Primarni ključ: `original`, `title`, `assignee`, `status` ali `dueDate`; primarna smer: `asc` ali `desc`.
- Sekundarni ključ: `none`, `title`, `assignee`, `status` ali `dueDate`; sekundarna smer: `asc` ali `desc`.
- Dejanji: izbira štirih kontrol ter gumb `Izvorni vrstni red`.
- Uspeh: preglednica in tabla uporabljata isti razvrščeni projektivni seznam; vsak `id` je prikazan natanko enkrat in odpre svoje podrobnosti.
- Preklic/ponastavitev: gumb ponastavi vse štiri kontrole na `original`, `asc`, `none`, `asc`; menjava projekta in osvežitev naredita isto.
- Napaka nalaganja: ohrani obstoječe obnašanje `Loading`/`LoadError`; razvrščanje ne ustvari dodatnih pisanj na API.

## Zahteve in pravila

Simboli: `N(s)` pomeni normalizacijo niza `s` z NFD, odstranitvijo znakov U+0300–U+036F in pretvorbo v male črke. `C(k, a, b)` je primerjava vrednosti ključa `k` med opraviloma `a` in `b`; `D(s)` je kronološka primerjava veljavnih datumov. `dir(c)` ima vrednost `1` za `asc` in `-1` za `desc`. Indeks `i` je položaj v izvornem polju.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno stanje je `(original, asc, none, asc)` in prikaz enak `tasks`. | Razvojni in lastni UI test preverita privzeti vrstni red ter vrednosti kontrol. |
| R02 | Za `title` in `assignee`: `C = N(a.k) < N(b.k) ? -1 : N(a.k) > N(b.k) ? 1 : 0`, brez jezikovno prilagojenega razvrščanja. | Enotni test normalizacije in UI test z Unicode, ločili in rezerviranimi besedami. |
| R03 | `status` ima vrstni red `todo < in_progress < done`; `dueDate` primerja veljavne koledarske datume kronološko. | Enotni test meja vrstnega reda ter UI test statusa in datumov. |
| R04 | Smer pomnoži samo rezultat primerjave izbranega ključa z `dir`; ne obrne celotnega končnega polja. | Enotni test s enakimi primarnimi vrednostmi in različnimi sekundarnimi vrednostmi. |
| R05 | Sekundarni ključ se uporabi le, kadar je primarna primerjava enaka, z neodvisno smerjo. | Enotni test neodvisnih smeri ter razvojni test D02. |
| R06 | Ob enakosti obeh ključev velja `i(a) < i(b) ? -1 : i(a) > i(b) ? 1 : 0`; enak sekundarni in primarni ključ se ne uporabi dodatno; `original` primarno vedno vrne izvorno polje. | Enotni test stabilnosti, enakih ključev in `original`; UI test preklobov pogleda. |
| R07 | Tabla ohrani fiksne stolpce `todo`, `in_progress`, `done`; znotraj stolpca ohrani relativni vrstni red razvrščenega polja. | UI test stolpcev in vrstnega reda kartic. |
| R08 | Preklop `table`/`board` ter odpiranje in zapiranje podrobnosti ohranita vse štiri nastavitve. | Lastni UI test ohranjevanja nastavitev pri pogledu in podrobnosti. |
| R09 | Menjava projekta in osvežitev ponastavita `(original, asc, none, asc)`; stanje ni v trajni shrambi ali URL-u. | Lastni UI test menave projekta in osvežitve brez shrambe/URL. |
| R10 | Gumb `Izvorni vrstni red` ponastavi vse štiri kontrole; prazno polje in polje z enim opravilom delujeta za vse dovoljene vrednosti. | Lastna UI testa za prazen projekt in eno opravilo. |
| R11 | Razvrščanje je projekcija: ne mutira opravil, števcev, pripadnosti ali izvornega polja; ne sproži pisanj na `/api/`. | Enotni test nespremenjenosti podatkov in UI test brez pisanj. |
| R12 | Vsi ID-ji so prikazani natanko enkrat; enaki naslovi ne zamenjajo podrobnosti; ohranijo se obstoječe bralne funkcije in odzivnost. | UI test z enakimi naslovi, podrobnostmi in širino 390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R06 | Izračun stabilnega, dvoključnega vrstnega reda | A01, D01, D02 | `src/sorting.ts:27`, `src/sorting.ts:52`, `src/App.tsx:46` | Uspešno: A01 in razvojni testi so uspešni v `npm run check` (51/51). |
| R01, R04, R05, R10, R11 | Kontrola, smeri, ponastavitev, preglednica | A01, A04, A05, D01, D02, D04 | `src/App.tsx:13`, `src/App.tsx:46`, `src/App.tsx:92` | Uspešno: vsi našteti scenariji so uspešni v `npm run check` (51/51). |
| R01, R03, R07 | Enak vrstni red v tabli | A02, D03 | `src/App.tsx:96`, `src/TaskBoard.tsx:7` | Uspešno: A02 in D03 sta uspešna v `npm run check` (51/51). |
| R08, R09, R10, R12 | Ohranjevanje, ponastavitve, prazni/enopravilni projekti, enaki naslovi | A02, A03, A04, A05 | `tests/agent/P04-agent.spec.ts:41` | Uspešno: vsi lastni scenariji so uspešni v `npm run check` (51/51). |

## Odprta vprašanja in omejitve

- Predpostavka: vsi `dueDate` so veljavni koledarski datumi; manjkajoči ali neveljavni datumi niso del obsega.
- Predpostavka: `assignee` so neprazni nizi, ki se razlikujejo od rezervirane vrednosti `all`.
- Končni (zasebni) testni primeri niso dostopni; zato uspešnost velja le za javno razvite in lastne teste, ki so dejansno izvedeni.

## Zgodovina popravkov

- 2026-11-01: Ustvarjena začetna specifikacija pred implementacijo.
- 2026-11-01: Popravek implementacije kontrol po odkritem React 19 odpovedi `event.currentTarget.value` v odloženem updaterju; vrednost se zdaj prebere pred klicem `setSortSettings`.
- 2026-11-01: Posodobljena sledljivost z dejanskimi testi in rezultati po končnem preverjanju.
