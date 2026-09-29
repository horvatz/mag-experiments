# Specifikacija P04: stabilno razvrščanje z dvema ključema

## Problem in kontekst

Folio trenutno prikazuje opravila v vrstnem redu API-ja, v preglednici ali razdeljena v tri stolpce table. Uporabnik potrebuje lokalno razvrščanje brez spreminjanja opravil na strežniku. Dodana bodo štiri neodvisna stanja kontrol: primarni ključ in smer ter sekundarni ključ in smer. Privzeta kombinacija ohrani vrstni red API-ja. Izbira velja za trenutno odprt projekt, preživi preklop pogleda in podrobnosti, ob menjavi projekta ter osvežitvi pa se ponastavi.

## Vhodi, dejanja in izidi

Vhod je polje opravil, prejeto za projekt prek obstoječega `GET /api/projects/{id}/tasks`. Primerjani podatki so `title`, `assignee`, `status` in veljavni datum `dueDate` (`YYYY-MM-DD`); identiteta opravila ostane `id`. Dovoljene kontrole so primarni ključ `original/title/assignee/status/dueDate`, primarna smer `asc/desc`, sekundarni ključ `none/title/assignee/status/dueDate`, sekundarna smer `asc/desc` ter gumb »Izvorni vrstni red«.

Uspešna izbira spremeni samo vrstni red projekcije. Preklic ni predviden. Napaka nalaganja ohranja obstoječe stanje napake in ponovnega poskusa aplikacije. Prazno polje in polje z enim opravilom ostaneta veljavna za vse kombinacije. Ob menjavi projekta se kontrolna stanja inicializirajo privzeto; osvežitev jih ne obnovi iz URL-ja ali trajne shrambe.

## Zahteve in pravila

Naj bo `T = [t0, …, tn−1]` vhodno polje, `i(t)` njegov indeks, `Kp`, `Dp`, `Ks`, `Ds` izbrani primarni ključ, primarna smer, sekundarni ključ in sekundarna smer. `cmpK(a,b)` vrne `-1`, `0` ali `1`; `sgn(asc)=1`, `sgn(desc)=-1`. Razvrščena projekcija `S` je rezultat stabilnega primerjalnika:

- če `Kp=original`, primerjaj samo `i(a)` in `i(b)`;
- sicer najprej uporabi `sgn(Dp) × cmpKp(a,b)`; ob ničli, če `Ks≠none`, uporabi `sgn(Ds) × cmpKs(a,b)`; ob končni ničli uporabi `i(a)-i(b)`.
- besedilni ključ je `lowercase(NFD(v))` po odstranitvi znakov U+0300–U+036F; primerjaj leksikografsko z `<` in `>`; statusni vrstni red je `todo < in_progress < done`; veljavne datume primerjaj kronološko.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto `(Kp,Dp,Ks,Ds)=(original,asc,none,asc)`; `S=T`. | Preveri privzete vrednosti in ID-je v API vrstnem redu. |
| R02 | `title` in `assignee` primerjata normalizirana niza po definiciji zgoraj, brez lokalnega ali numeričnega razvrščanja. | Unicode, velike/male črke in številke v UI preverjanju. |
| R03 | Status uporablja fiksen vrstni red; datumi veljavnih `YYYY-MM-DD` se primerjajo kot koledarski vrstni red. | Preveri vse statuse in datumsko razvrščanje. |
| R04 | Vsaka smer pomnoži samo rezultat pripadajočega ključa; izenačenja ostanejo stabilna. | Asc/desc z izenačenimi vrednostmi primarnega ključa. |
| R05 | Sekundarni ključ se uporabi samo, ko je primarni izenačen; smeri sta neodvisni. `none` sekundarno ne razvršča. | Primerjava kombinacij primarnega in sekundarnega ključa/smeri. |
| R06 | Končna izenačenja ohranijo indeks API-ja; isti ključ je dovoljen. `original` primarno vedno vrne `T`. | Test izenačenih ključev in `original` z aktivnim sekundarnim ključem. |
| R07 | Stolpci table so vedno `todo`, `in_progress`, `done`; znotraj vsakega se ohrani relativni vrstni red `S`. | Primerjaj ID-je kartic po stolpcih z ustreznimi filtri `S`. |
| R08 | Preklop pogleda in odpiranje/zapiranje podrobnosti ne spremenita `(Kp,Dp,Ks,Ds)`. | Preklopi pogled in modal ter preglej kontrole in vrstni red. |
| R09 | Menjava projekta in osvežitev nastavita privzeto četverico; stanje ni v URL-ju ali trajni shrambi. | Navigacija projekta, `reload`, pregled URL-ja. |
| R10 | Gumb ponastavi četverico na R01; prazno in enoelementno polje delujeta pri vseh ključih in smereh. | Kontrolni reset ter robni primeri nič/en zapis. |
| R11 | Polja opravil, članstvo, števci in izvorno polje se ne spreminjajo; spreminjanje nastavitev ne sproži zapisovalnega API-ja. | Preveri števce, ID-je, API metode in nespremenjene vrednosti. |
| R12 | Vsak ID je prikazan natanko enkrat; povezava odpre opravilo z istim ID-jem; ohranjeni so obstoječi bralni elementi in odzivnost Folio. | Preglednica/tabla, enaki naslovi, podrobnosti in mobilna širina. |

## Izvedba in sledljivost

Predvidena implementacija: čisti primerjalnik v `src/taskSorting.ts`, stanje kontrol in skupna projekcija v `src/App.tsx`, uporaba projekcije za tri obstoječe stolpce v `src/TaskBoard.tsx`, pravila postavitve kontrol v `src/styles.css`. Lastni preveritveni scenariji bodo v `tests/agent/`; konkretne povezave in izidi bodo dopolnjeni po izvedbi.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeta četverica in identičen vrstni red vhodnih ID-jev. | D01 namizje/mobilno; agentni reset test. | [App.tsx:14](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/App.tsx:14), [taskSorting.ts:39](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/taskSorting.ts:39) | Uspešno: obeh preverjanj je del `npm run check`; 54/54 testi uspešni. |
| R02 | NFD, odstranjevanje U+0300–U+036F, male črke in UTF-16 `<`/`>` za naslov in odgovorno osebo. | Agentni Unicode/numerični leksikografski scenarij. | [taskSorting.ts:16](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/taskSorting.ts:16), [taskSorting.ts:20](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/taskSorting.ts:20) | Uspešno: predznačeni in razstavljeni `é`, velike črke ter `Task 10`/`Task 2`; `npm run check`. |
| R03 | Fiksni vrstni red statusa; kanonični datumi primerjani kronološko. | Agentni status/date scenarij in razvojni D02/D03. | [taskSorting.ts:14](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/taskSorting.ts:14), [taskSorting.ts:26](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/taskSorting.ts:26) | Uspešno: statusi in datumi januar/februar pravilno razvrščeni; `npm run check`. |
| R04 | Smer pomnoži samo primerjavo pripadajočega ključa; izenačenja stabilna. | Agentni status/date scenarij z neodvisnima asc/desc. | [taskSorting.ts:43](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/taskSorting.ts:43) | Uspešno: skupine statusov obrnjene, vrstni red znotraj izenačenih skupin ohranjen; `npm run check`. |
| R05 | Sekundarni ključ se uporabi samo ob primarni enakosti in ima ločeno smer. | Razvojni D02; agentni status/date in enak statusni sekundarni ključ. | [taskSorting.ts:46](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/taskSorting.ts:46), [taskSorting.ts:49](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/taskSorting.ts:49) | Uspešno: oba zaporedja datuma preverjena; `npm run check`. |
| R06 | Končna enakost se razreši z indeksom vira; primarni `original` prezre preostale kontrole. | Agentni tie scenarij in reset test z aktivnimi sekundarnimi kontrolami. | [taskSorting.ts:40](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/taskSorting.ts:40), [taskSorting.ts:54](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/taskSorting.ts:54) | Uspešno: preverjeno v `npm run check`. |
| R07 | Filterji stolpcev ohranijo relativni vrstni red skupne projekcije. | Razvojni D03; agentni ID scenarij po stolpcih. | [App.tsx:82](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/App.tsx:82), [TaskBoard.tsx:16](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/TaskBoard.tsx:16) | Uspešno: trije stolpci v stalnem vrstnem redu, preverjeno v `npm run check`. |
| R08 | Stanje je lokalno isti komponenti projekta, ne pogledu ali modalnemu stanju. | Agentni preklop pogleda in odpiranje/zapiranje podrobnosti. | [App.tsx:12](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/App.tsx:12), [App.tsx:14](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/App.tsx:14) | Uspešno: štiri vrednosti ohranjene v `npm run check`. |
| R09 | Ključ projekta prek `key` ustvari privzeto stanje; osvežitev stanje izgubi. | Agentni projektni preklop in `page.reload()`. | [App.tsx:126](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/App.tsx:126) | Uspešno: projekt in osvežitev vrneta privzete vrednosti; `npm run check`. |
| R10 | Reset nastavi privzeto četverico; robna polja sprejmejo kontrole. | Agentni reset, empty in one-task scenariji. | [App.tsx:80](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/App.tsx:80), [taskSorting.ts:39](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/taskSorting.ts:39) | Uspešno: prazno polje in en ID prestaneta preverjanja; `npm run check`. |
| R11 | Kopirano polje in lokalni state; kontrolni dogodki ne kličejo API zapisovalnih metod. | Razvojni D04; agentni `readonly` preverjanji in projekcija. | [taskSorting.ts:39](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/taskSorting.ts:39), [App.tsx:20](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/App.tsx:20) | Uspešno: nič zapisovalnih zahtev in 0 `saveRequests`; `npm run check`. |
| R12 | ID je ključ prikaza/povezave; obstoječi dostopni pogledi ostanejo, postavitev se ne razširi pri 390 px. | Baseline ID/podrobnosti; agentni duplicate-ID in 390px scenarij. | [App.tsx:86](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/App.tsx:86), [TaskBoard.tsx:25](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/TaskBoard.tsx:25), [styles.css:62](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P04-A-003/app/src/styles.css:62) | Uspešno: ID-ji enkratni, podrobnosti po ID-ju, `scrollWidth <= innerWidth`; `npm run check`. |

## Odprta vprašanja in omejitve

Naloga določa veljavne datume, nize in neprazna imena; ne določa manjkajočih vrednosti, zato niso del obsega. Stabilnost je zagotovljena z izvornim indeksom kot zadnjim primerjalnim pravilom. Končne teste zagotavlja okolje naloge; preverjanje bo poročalo samo dejansko zagnane teste.

## Zapis sprememb specifikacije

- 2026-09-27: začetna specifikacija pred implementacijo.
- 2026-09-27: po implementaciji nadomeščena začasna vrstica sledljivosti z dejanskimi povezavami na kodo, teste in uspešen rezultat `npm run check`; pogoji sprejema se niso spremenili.
