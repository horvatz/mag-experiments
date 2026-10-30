# Specification: P05 - Straničenje i filter stanja

## Problem i kontekst

Ova funkcionalnost dodaje u aplikaciji Folio sposobnost kontroliranog straničenja i filtriranja popisa zadataka. 
Korisnik može odabrati prikazati zadatke po stranicama (veličina stranice: all/2/5/10) i filtrirati po statusu (all/todo/in_progress/done).
Podaci se učitavaju i prikazuju preko javnog API-ja /api/. Začetna aplikacija prikazuje sve zadatke bez straničenja i filtriranja (veličina all, filter all).

## Vhodi, dejanja i izidi

### Uvodi
- Podaci: Niz zadataka sa poljima id, naziv, opis, status (todo/in_progress/done), projekt
- Veličina stranice: all/2/5/10 (all znači prikazati sve na jednoj stranici)
- Filter: all/todo/in_progress/done (all znači bez filtriranja)

### Dejanja
- Promena veličine stranice
- Promena filtera stanja
- Pregled (grid/card view) i promena pogleda
- Promena projekta
- Osvežavanje podataka

### Prava
- API /api/ se koristi za čitanje podataka. 
- Testne kontrole /__test/ se ne koriste u korisničkom sučelju.
- Podaci se ne čuvaju u trajnoj memoriji niti u URL-u.

### Izid uspeha
- Pravilno prikaz zadatka na određenoj strani prema odabranoj veličini i filteru
- Status prikaza prikazuje ukupan broj zadataka i broj prikazanih zadataka
- Navigacijski gumbi vode na odgovarajuće stranice
- Svi ID-ovi zadataka suočuvani i dostupni

### Uspeh
- Zadaci se prikazuju u originalnom redosledu iz API-ja
- Nedovršeni zadataci se tretiraju kao validni
- Interfejs se neće širiti izvan definisanih okvira (390 pikelska širina)

### Greška
- Nepravilni ID-ovi neobičajnih zadatka se ignorišu
- Neispravan status filtriranja ignoriše se
- Neispravan format podataka se tretira kao greška

## Zahteve i pravila

| Zahteva | Pravilo ili uslov prihvatne ispravnosti | Način proveravanja |
| --- | --- | --- |
| R01 | Iskoristiti defaultu page size "all" i filter "all"; videti sve zadatke u originalnom redosledu | Test bez promena user input |
| R02 | Veličine stranice 2, 5, 10 dele trenutno filtriranu polju na sekvencijalne, nepreklapajuće sekcije | Test sa različitim brojem zadataka |
| R03 | Prva, Prethodna, Sledeća, Poslednja stranica vode do odgovarajuće stranice; neaktivno delo onemogućeno na rubu | Test sa granicama stranica |
| R04 | Promena veličine stranice uvek vraća na prvu stranu nove veličine, čak i da je prethodna brojka bila još važeća | Test sa promenama veličine |
| R05 | Filter all/todo/in_progress/done se primeni pre straničenja; promena filtera vraća na prvu stranicu; ne utiče na redosled | Test sa promenama filtera |
| R06 | Pregled i tabla prikazuju iste ID-je trenutne stranice. Tabla spaja trenutni odeljak u kolone; ne stranira svaku kolonu posežno | Test sa oba pogleda |
| R07 | Preklapanje pogleda i otvaranje/zatvaranje detalja čuvaju stranicu, veličinu i filter | Test sa interakcijama pogleda |
| R08 | Promena projekta i osvežavanje ponovo podešavaju veličinu na all, filter na all i stranicu na prvu. Stanje se ne čuva u trajnoj memoriji ili URL-u | Test sa promenama projekta |
| R09 | Za nefiltriran rezultat stanje sadrži "Stran X od Y". Prikazano A-B od N., gde su A/B indeksi koje počinjeme sa 1 i N je veličina filterovanog polja | Test sa različitim brojevima stranica |
| R10 | Za prazan projekat ili prazan rezultat filtera stanje sadrži "Stran 0 od 0". Prikazano 0–0 od 0. i svi četiri gumba za premet su onemogućeni. Ob upravljanju filtro je ponovo prva stranica | Test sa praznim podacima |
| R11 | Svojnost stanja broji ukupan nefiltrirani projekat; brojači kolona tabele broje prikazane zadatke trenutne stranice. Ukupan broj zadataka se ne menja zbog straničenja | Test sa brojanjem elemenata |
| R12 | Straničenje ne menja podatke i ne šalje zapise na API. Postojeće poveznice, pravilni ID-jevi, detalji, učitavanje i prilagodljiv dizajn Folio ostaju funkcionalni | Test sa čuvanjem stanja |

### Napomene o pravilima
- Podaci se učitavaju samo iz javnog API-ja /api/
- Testni sistem koristi /__test/ kontrolu koja nije dostupna korisničkom sučelju
- Nepoznati ID-ovi se tretiraju kao greška
- Statusi se ne menju tokom korisničke interakcije
- Originalni redosled zadataka se očuva
- Veličine stranica ne preklapaju se
- Filteri ne utiču na redosled zadataka
- Nedovršeni zadaci se mogu prikazati
- Projekti se mogu menjati bez uticaja na druge projekte

### Simboli i pretpostavke
- "all" znači prikazati sve zadatke
- "todo" znači nezavršeni zadaci
- "in_progress" znači u tijeku zadaci
- "done" znači završeni zadaci
- "Stran X od Y" znači trenutna stranica X od ukupno Y stranica
- "0–0 od 0." znači nema dostupnih podataka
- Data-task-id se koristi za praćenje zadataka
- Folio dizajn sačuvan

### Ograničenja
- Ne dodajati nove funkcionalnosti izvan ovih zahteva
- Ne koristiti lokalnu šematu za skladištenje podataka
- Ne širiti dizajn izvan okvira Folio
- Ne modifikovati zajedničke fajlove ili infrastrukturu
- Ne koristiti trajno skladištenje za stanje
- Ne menjati URL parametre za stanje
