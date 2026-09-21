# P10 — specifikacija lokalnega vrstnega reda

Postopek A, en agent. Začetek: 2026-09-21 22:24:47 UTC (22. september po lokalnem času).

## Problem in kontekst

Folio bere projekte in opravila iz javnega API-ja ter prikazuje preglednico,
tablo po stanjih in podrobnosti. Dodajamo lokalno urejanje vrstnega reda z
razveljavitvami, ponovitvami in vrnitvijo na začetni vrstni red. Ohranimo
slovenske oznake, obstoječo navigacijo in potrjeni videz iz `docs/dizajn.md`.
Vrstni red je vezan na trenutno odprti projekt in ni trajno shranjen.

## Vhodi, dejanja in izidi

Vhod je polje `Task[]` iz `GET /api/projects/:id/tasks`. Vsak element ima
enkraten `id`, `projectId`, `title`, `description`, `status`, `assignee` in
`dueDate`. Naslovi se lahko ponavljajo; besedila in ID-ji niso ključi za
razvrščanje. Polje lahko vsebuje nič, eno ali poljubno več opravil.

Uporabnik premika po ID-ju gor/dol, razveljavi, ponovi ali obnovi začetni
vrstni red. Premik zamenja natanko globalna soseda. Nedovoljena dejanja so
onemogočena in tudi v modelu ne spreminjajo stanja. Dejanja nimajo
potrditvenega koraka ali omrežnih zapisov. Napake in ponovitev nalaganja
ostanejo obravnavane z obstoječim `useResource`; urejanje je na voljo šele
po prejetju podatkov. Odpiranje/zapiranje podrobnosti ohrani lokalno stanje.

## Zahteve in pravila

Naj bo `I` začetno zaporedje ID-jev, `P` trenutno zaporedje, `U` sklad
prejšnjih zaporedij in `R` sklad zaporedij za ponovitev. Vrh sklada je na
desni. `cap(S)` obdrži zadnjih 20 elementov sklada. `pos(id,P)` je indeks
ID-ja v P, povečan za 1.

Invarianti: `set(P)=set(I)`, `|P|=|I|`, vsak ID nastopa enkrat; enako velja
za vsak element U in R. Vedno `0 ≤ |U| ≤ 20`. Izvorni objekti Task se ne
spreminjajo. Začetno stanje je `(I,I,[],[])`.

- Veljaven premik: za indeks `i` in `d ∈ {-1,1}` velja
  `0 ≤ i < N ∧ 0 ≤ i+d < N`. Rezultat je
  `(I,swap(P,i,i+d),cap(U+[P]),[])`; sicer je celotno stanje nespremenjeno.
- Razveljavitev, če `U=U' + [Q]`: `(I,Q,U',R+[P])`.
- Ponovitev, če `R=R' + [Q]`: `(I,Q,cap(U+[P]),R')`.
- Začetni vrstni red, če `P ≠ I`: `(I,I,cap(U+[P]),[])`.
  Pri `P=I` je dejanje brez učinka, tudi če je R neprazen.
- Na tabli je stolpec stanja `s` enak `filter(P, task.status=s)`;
  prikazano mesto ostane `pos(id,P)`, ne položaj v stolpcu.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetni P=I, globalna mesta 1..N po ID-jih, brez združevanja naslovov. | D01; A01 z drugačnimi ID-ji, podvojenimi naslovi in >10 opravili. |
| R02 | Zamenjava globalnih sosedov brez sprememb objektov. | D01; A01, A04, A08. |
| R03 | Robna/neznana dejanja ohranijo P,U,R; robna gumba disabled. | D01; A02, A06, A08. |
| R04 | U vsebuje celotne prejšnje permutacije; undo shrani P v R. | D02; A02, A03, A08. |
| R05 | Redo obnovi vrh R in shrani P v U, pravilno tudi večkrat. | D02; A03, A08. |
| R06 | Samo veljavno novo dejanje počisti R. | D03; A02, A08. |
| R07 | U obdrži zadnjih 20 permutacij; vse dosegljive undo korake je mogoče ponoviti. | A03, A08. |
| R08 | Reset je eno novo razveljavljivo dejanje; P=I je brez učinka. | D04; A02, A08. |
| R09 | Preglednica=P, stolpci so stabilni filtri P, premik ostane globalen. | D04; A04. |
| R10 | Pogled/podrobnosti ohranijo P,U,R; menjava projekta in reload obnovita I,[],[]. | A05; testi izhodišča za navigacijo. |
| R11 | Števec in onemogočeni gumbi ustrezajo dolžinama skladov, N≤1 je uporaben. | D03; A02, A03, A06. |
| R12 | Samo lokalne permutacije; brez zapisov, nespremenjena polja/števci/podrobnosti; širina 390 brez razširitve strani. | D04; A01, A04, A05, A07, A08; testi izhodišča. |

## Izvedba in sledljivost

Implementirani deli: `src/taskOrder.ts` (čisti model zgodovine),
`src/TaskList.tsx` (stanje po projektu, preglednica, orodna vrstica),
`src/TaskOrderControls.tsx` (globalno mesto in premika),
`src/TaskBoard.tsx` (stabilni stolpci), `src/App.tsx` (življenjska doba
projekta) in `src/styles.css` (prilagodljiv videz).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | P=I, pos po ID | D01, A01 | taskOrder: inicializacija; TaskList/TaskOrderControls: izris | Uspešno; [končni dnevnik](check-final.log), [sledljivost](verification.md). |
| R02 | swap globalnih sosedov | D01, A01, A04, A08 | taskOrder: move | Uspešno; [končni dnevnik](check-final.log), [sledljivost](verification.md). |
| R03 | neveljavno dejanje je identiteta | A02, A06, A08 | taskOrder: varovala; TaskOrderControls: disabled | Uspešno; [končni dnevnik](check-final.log), [sledljivost](verification.md). |
| R04 | undo shrani P | D02, A03, A08 | taskOrder: undo | Uspešno; [končni dnevnik](check-final.log), [sledljivost](verification.md). |
| R05 | redo obnovi vrh R | D02, A03, A08 | taskOrder: redo | Uspešno; [končni dnevnik](check-final.log), [sledljivost](verification.md). |
| R06 | novo veljavno dejanje počisti R | D03, A02, A08 | taskOrder: commit/move | Uspešno; [končni dnevnik](check-final.log), [sledljivost](verification.md). |
| R07 | cap(U)=20 | A03, A08 | taskOrder: omejitev zgodovine | Uspešno; [končni dnevnik](check-final.log), [sledljivost](verification.md). |
| R08 | reset je razveljavljiv | D04, A02, A08 | taskOrder: reset; TaskList: gumb | Uspešno; [končni dnevnik](check-final.log), [sledljivost](verification.md). |
| R09 | filter ohrani relativni red | D04, A04 | TaskBoard: stolpci in globalna mesta | Uspešno; [končni dnevnik](check-final.log), [sledljivost](verification.md). |
| R10 | stanje živi z odprtim projektom | A05, izhodišče | App: key projekta; TaskList: reducer | Uspešno; [končni dnevnik](check-final.log), [sledljivost](verification.md). |
| R11 | U/R števca in N≤1 | D03, A02, A03, A06 | TaskList: status in disabled | Uspešno; [končni dnevnik](check-final.log), [sledljivost](verification.md). |
| R12 | nespremenjeni podatki, lokalnost in odzivnost | D04, A01, A04–A08, izhodišče | TaskList: projekcija ID-jev; TaskBoard; styles | Uspešno; [končni dnevnik](check-final.log), [sledljivost](verification.md). |

Dejanski ukazi, rezultati in končna sledljivost so zapisani v
[verification.md](verification.md). Oznake D01–D04 so skupni razvojni testi
(vsak desktop/mobile); A01–A08 so izvedeni dodatni scenariji (9 testov, ker ima A06 dva primera).

## Odprta vprašanja in omejitve

Ni vprašanj, ki bi blokirala izvedbo. ID-ji so enkratni po pogodbi API-ja.
Novih sočasnih sprememb podatkov brez osvežitve ne dodajamo. Osvežitev
pomeni ponovno nalaganje strani. Končni skriti testi niso dostopni in jih
ne bomo navajali kot izvedene. Testne kontrole smejo uporabljati samo testi.

## Zgodovina popravkov

- v1, pred implementacijo: pogoji R01–R12, model in načrt preverjanj.

- v2, po preverjanju: načrtovani izidi nadomeščeni z dejanskimi rezultati;
  dodane povezave do dnevnika 55 uspešnih preverjanj in končne sledljivosti.
  Pravila R01–R12 so nespremenjena. A01 poleg 25 opravil vsebuje še posebno
  opravilo z ID-jem s presledki in ločili; neposredno dostopno ime kartice
  pokrije ta primer brez odvisnosti od veljavnosti DOM ID-ja.
