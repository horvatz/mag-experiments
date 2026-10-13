# Problem in kontekst

Aplikacija Folio omogoča pregled in upravljavo opravil. Trenutno ni straničenja ali filtriranja. Cilj je omogočiti pregled velikih množic opravil s straničenjem in selektivnim filtriranjem, ohraniti obstoječi UI/UX.

Straničenje in filtriranje ne smejo vplivati na podatkovni model ali API. Podatki se brisejo iz javnega /api/ vmesnika. Funkcionalnost je popolnoma začasna; ne hrani se v URL ali shrambi.

## Vhodi, dejanja in izidi

### Vhodi
1. **Velikost strani:** all (privzeto), 2, 5, 10 (HTML select).
2. **Filter:** all (privzeto), todo, in_progress, done (HTML select).
3. **Gumbi premika:** Prva, Prejšnja, Naslednja, Zadnja stran.

### Stanje
- page: indeks trenutne strani (začetno 0).
- pageSize: velikost strani (all=1 ali izbrana vrednost).
- filter: vrednost filtra (all=vse, drugače filtrirano).

### Dejanja
- Zamenjava pageSize in/ali filter -> osveži na strani 0.
- Gumbi premika -> spremeni page z ohranjenima pageSize in filter.
- Sprememba projekta -> vrne se na page=0, pageSize=all, filter=all.

### Izhod
- Prikazano A–B od N, kjer A = page + 1, B = min((page + 1) * pageSize, total), N = total.
- Če je rezultat 0, obvestilo Stran 0 od 0 in 0–0 od 0.
- Gumbi omogočeni/onemogočeni glede na robove.

## Zahteve in pravila

| ID | Pravilo | Nač preverjanja |
| --- | --- | --- |
| R01 | Privzeto: pageSize=all, filter=all; vsa opravila v izvornem vrstnem redu. | Osvežitev brez sprememb -> vsa opravila brez spremembe vrstnega reda. |
| R02 | Straničenje razdeli trenutno filtrirano polje na enake, neprekrivajoče se odseke; zadnja stran lahko krajša. | Števo prikazanih ID-jev enaka filtriranemu polju. |
| R03 | Prva/Prejšnja/Naslednja/Zadnja stran vodijo na ustrezno stran; na robu je gumb onemogočen in ne spremeni stanja. | Izberite ekstremno stran -> stanje ostane nespremenjeno. |
| R04 | Sprememba pageSize vrne na page = 0 (prvo stran). | Zamenjava izbire pageSize -> stran se vrne na 1. |
| R05 | Filter se uporabi pred straničenjem; sprememba filter vrne na page = 0. Ne vpliva na vrstni red. | Zamenjava filtra -> stran 1, prikazano filtrirano polje v prvotnem vrstnem redu. |
| R06 | Preglednica in tabla kažeta iste ID-je trenutne strani; tabla združi le eno stran v stolpce. | Primerjava prikaz v dveh pogledih -> identični ID-ji. |
| R07 | Preklop pogleda, odpiranje in zapiranje podrobnosti ohranita page, pageSize, filter. | Preklop -> preveri ohranitev parametrov prejšnjega stanja. |
| R08 | Menjava projekta in osvežitev ponastavita pageSize=all, filter=all, page=0. Stanje se ne hrani v trajni shrambi ali URL. | Preklop projekta vsi parametri na privzete. |
| R09 | Status vsebuje Stran X od Y; prikazano A–B od N. s 1-zasedenimi indeksoma. | Preveriti aria-label=status besedilo na ekranu. |
| R10 | Za prazen projekt ali prazen rezultata filtra: Stran 0 od 0, 0–0 od 0, vsi gumbi onemogočeni. | Preveriti stanje pri 0 opravilih ali 0 filtriranih. |
| R11 | Pregled stanj šteje celoten nefiltriran projekt; stolpci tabela štejeta prikazana opravila trenutne strani. | Primerjava counts.total proti counts.todo/in_progress/done. |
| R12 | Straničenje ne pošilja zahtev na API; vsi odjemi so trenutno. API-ji ostanejo enaki. | Preveriti da se podatki ne dajo nazaj na strežnik. |

## Poznavanje pravil in predpoki

- pageSize=all: vsa opravila na eno stran; veljavno samo, če je filtrirano polje prazno ali eno.
- Indeksi so 1-zasedeni za uporabnika (1..N) in 0-zasedeni za notranjo logiko.
- Vrstni sorazposov ne smejo biti spremenjeni zaradi filtriranja.
- Podatki se ne pošiljajo nazaj na API; vsi podatki so trenutni in ne pojasnjeni.

## Odprta vprašanja in omejitve

- Ni podatka o tem, ali mora biti straničenje asinhrono.
- Ni podatka o hitrosti straničenja.
- Omejitev ni implementirana za URL-pomembnost straničenja.
- Širina 390px ne sme povzročiti raztezanja strani — notranje skrolanje preglednice je dovoljeno.

