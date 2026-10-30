# Specifikacija P05: Straničenje in filter stanja

## Problem in kontekst

Uporabnik v projektu Folio pregleduje opravila v preglednici ali na tabli. V izhodišču
so prikazana vsa opravila projekta, brez možnosti omejitve prikaza. Naloga doda
straničenje po velikosti strani (all/2/5/10) in filtriranje po stanju
(all/todo/in_progress/done) ter kontrolnike za premikanje po straneh z natančnim
statusom. Pregled stanj (Pripravljeno/V delu/Končano) ostane povzetek celotnega
projekta, straničenje pa ne sme spreminjati podatkov niti pošiljati zapisov na API.

Stanje nove funkcionalnosti je lokalno trenutnemu projektu (React state v
`ProjectView`), ne v URL-ju in ne v trajni shrambi. Ob osvežitvi in ob menjavi
projekta se ponastavi na privzeto: velikost `all`, filter `all`, stran 1.

## Vhodi, dejanja in izidi

- Vhoda: seznam opravil projekta iz `GET /api/projects/:id/tasks` (polja `id`,
  `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`; vrstni red
  odgovora je izvorni vrstni red prikaza).
- Dejanja: izbira v `select` Velikost strani (all/2/5/10), izbira v `select`
  Filter strani (all/todo/in_progress/done), klik na Prva/Prejšnja/Naslednja/Zadnja
  stran, preklop pogleda Preglednica/Tabla, odpiranje/zapiranje podrobnosti,
  menjava projekta, osvežitev strani.
- Uspešno stanje: prikazana je trenutna stran filtriranega polja v izvornem
  vrstnem redu; status `role=status` z `aria-label="Stanje straničenja"` točno
  opisuje stanje; gumbi na robu so onemogočeni; preglednica in tabla prikazujeta
  iste ID-je trenutne strani; števci stolpcev table štejejo le prikazani odsek;
  povzetek stanj in skupno število opravil se s straničenjem ne spremenita.
- Napaka/nepopolno nalaganje: ob napaki velja obstoječi `LoadError` z ponovitvijo;
  straničenje se ne prikaže, dokler podatki niso na voljo. Ob praznem projektu ali
  praznem rezultatu filtra je status `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi
  štirje gumbi so onemogočeni.
- Preklic: spremembe velikosti/filtra vedno vrnejo na prvo stran; neveljavno
  dejanje na robu (onemogočen gumb) ne spremeni stanja.

## Zahteve in pravila

Simboli: `P` = nefiltrirano polje opravil projekta v izvornem vrstnem redu;
`F = filter(P, s)` = element `t ∈ P` z `t.status = s`, če `s ≠ all`, sicer `P`;
`n = |F|`; `z` = velikost strani (`all`, 2, 5 ali 10); `k = 1`, če je `z = all` in
`n > 0`, sicer `⌈n/z⌉` (0, če je `n = 0`); `p` = trenutna stran (1 ≤ p ≤ k, ali 0
pri `k = 0`); `S(p) = F[(p−1)·z … p·z−1]` za `z ≠ all` in `S(1) = F` za `z = all`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob zagonu je `z = all`, `s = all`, `p = 1`; prikazan je `P` v izvornem vrstnem redu. | Preveri začetno stanje selectov, vrstni red ID-jev in status. |
| R02 | Za `z ∈ {2,5,10}` so `S(1) … S(k)` zaporedni, neprekrivajoči se odseki `F`; `∪ S(p) = F`, `|S(p)| ≤ z`, zadnji odsek je lahko krajši. | Iteracija po straneh z `Naslednja stran`; primerjava vrstnega reda in množice ID-jev s celotnim `F`. |
| R03 | `Prva stran → p = 1`, `Prejšnja stran → p = max(1, p−1)`, `Naslednja stran → p = min(k, p+1)`, `Zadnja stran → p = k`; pri `p = 1` sta prva dva gumba onemogočena, pri `p = k` zadnja dva; onemogočen gumb ne spremeni `p`. | Klik zaporedoma in preverjanje ID-jev ter atributov `disabled`. |
| R04 | Sprememba `z` nastavi `p = 1`; za `z = all` in `n > 0` velja `k = 1`. | Klik `Zadnja stran`, nato sprememba velikosti; preverjanje prve strani in statusa. |
| R05 | `S(p)` se računa nad `F` (filter pred straničenjem); sprememba `s` nastavi `p = 1`; vrstni red elementov `F` je enak vrstnemu redu v `P`. | Sprememba filtra po premiku na zadnjo stran; preverjanje ID-jev in statusa. |
| R06 | Preglednica in tabla prikazujeta `S(p)`; tabla razdeli `S(p)` v tri stolpce po statusu in ne straniči vsakega stolpca posebej. | Primerjava ID-jev med pogledoma in štetje po stolpcih. |
| R07 | Preklop pogleda in odpiranje/zapiranje podrobnosti ne spremenita `z`, `s`, `p`. | Nastavi velikost/filter/stran, preklopi pogled, odpri in zapri podrobnosti; preverjanje selectov in ID-jev. |
| R08 | Menjava projekta in osvežitev ponastavita `z = all`, `s = all`, `p = 1`; stanje ni v URL-ju ali trajni shrambi. | Nastavi stanje, zamenjaj projekt / osveži; preverjanje privzetkov. |
| R09 | Za `n > 0`: status vsebuje `Stran p od k.` in `Prikazano A–B od n.`, kjer je `A = (p−1)·z + 1` (oz. 1 pri `all`) in `B = A + |S(p)| − 1`; en dash `–`. | Branje `role=status` in primerjava točnega besedila. |
| R10 | Za `n = 0`: `p = 0`, `k = 0`, status `Stran 0 od 0. Prikazano 0–0 od 0.`, vsi štirje gumbi onemogočeni; ob odstranitvi filtra (`s = all`) je `p = 1`. | Prazno polje oz. filter brez zadetkov; preverjanje statusa, gumbov in ponovnega prikaza. |
| R11 | Povzetek stanj šteje `P` (nefiltrirano); števci stolpcev table in značka skupnega števila štejejo `S(p)` oz. `|P|`; `|P|` se s straničenjem ne spremeni. | Primerjava števcev povzetka, stolpcev in značke pri različnih straneh. |
| R12 | Nobeno dejanje straničenja ne pošlje zapisovalnega zahtevka na API in ne spremeni podatkov; obstoječe povezave, ID-ji, podrobnosti, nalaganje in videz ostanejo uporabni. | Zajem ne-GET zahtevkov in `/__test/state` (`saveRequests = 0`); regresijski testi izhodišča. |

Splošno pravilo: sprememba `z` ali `s` je atomarna (nov `p = 1`), vse ostale
vrednosti so izpeljane iz trenutnega `P`. Predpostavka: strežnik vrne končno
polje opravil projekta; med prikazom se podatki brez osvežitve ne spreminjajo.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzetki `all/all/1` | A01 | `src/App.tsx` (stanje, `visible`) | glej `verification.md` |
| R02 | odseki in pokritost | A02, A03 | `src/App.tsx` (`pageCount`, `slice`) | glej `verification.md` |
| R03 | navigacija in robovi | A02, A03 | `src/App.tsx` (gumbi) | glej `verification.md` |
| R04 | reset ob velikosti | A02, A03 | `src/App.tsx` (`onPageSizeChange`) | glej `verification.md` |
| R05 | filter pred straničenjem | A04 | `src/App.tsx` (`filtered`) | glej `verification.md` |
| R06 | isti ID-ji v obeh pogledih | A02, A05 | `src/App.tsx`, `src/TaskBoard.tsx` | glej `verification.md` |
| R07 | ohranitev stanja | A05 | `src/App.tsx` (stanje nad pogledi) | glej `verification.md` |
| R08 | ponastavitev | A06 | `src/App.tsx` (`key`, lokalno stanje) | glej `verification.md` |
| R09 | točno besedilo statusa | A01–A04 | `src/App.tsx` (`pageStatus`) | glej `verification.md` |
| R10 | prazni primeri | A07 | `src/App.tsx` | glej `verification.md` |
| R11 | števci | A04, A08 | `src/App.tsx`, `src/TaskBoard.tsx` | glej `verification.md` |
| R12 | brez zapisov, regresije | A04 + izhodiščni testi | `src/App.tsx` | glej `verification.md` |

## Odprta vprašanja in omejitve

- Končni (skriti) testi niso dostopni; preverjanje temelji na razvojnih testih
  P05, testih izhodišča in lastnih testih v `tests/agent/`.
- Natančno besedilo sporočila ob praznem rezultatu filtra ni predpisano; uporabljeno
  je ločeno sporočilo za prazen projekt in za prazen filter.
- Razporeditev novih kontrol ni predpisana; uporabljeni so obstoječi gradniki in
  slogovne spremenljivke Folio, z zavijanjem na ozkih zaslonih.

## Spremembe specifikacije

- 2026-10-30: začetna različica.
- 2026-10-30: po izvedbi in preverjanju zahteve R01–R12 ostajajo nespremenjene;
  popravljen je bil le tip v lastnem testu A02, ne specifikacija.
