# P08: Koledarski pregled rokov

## 1. Problem in kontekst
  
Ta funkcionalnost omogoča upravljanje opravil glede na referenčni datum (zapadle, današnje, prihodnje). Dizin ohranja potrjen vizualni slog Folio.

## 2. Funkcionalne zahteve

**P08:** Koledarski pregled rokov (R01-R12). Izvodi kategorizacijo opravil glede na referenčni datum v skladu s folijskim dizajnom.
## 2. Zahteve

| ID | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Referenčni datum je 2026-09-21, začetni pogled all. | Default referenčni datum pri zagonu je 2026-09-21; inicializiran pogled je all. | Preverjanje zagnana aplikacije brez uporabe funkcije za nastavitve datuma: referenčni datum mora biti 2026-09-21. |

| R02 | Operacija done ne štejemo v zapadle/danes/tedaj/pozneje. | Stanje done ne vpliva na razvrstitev v zapadle; števec odprtih opravil izključuje done opravila. | Preverjanje z zunanim delujecm opravil in preverjanje njegovega pozicije glede na datum. |
| R03 | Odprto opravilo z dueDate > prevrejenega datuma spada v zapadle. | Zapadle opravila se označijo glede na primerjavo dneva. | Preverjanje z različnimi datumi in opazovanjem predpisa. |

| R04 | Odprto opravilo z datumom od naslednjega dne do vkljucno sedmega dne spada v tedaj. | Tedajni časovni okvir (0-7 dni po danes). | Preverjanje z različnimi datumi in opazovanjem predpisa. |

| R05 | Datumi so YYYY-MM-DD formata. | Datumi so formatirani kot YYYY-MM-DD. | Preverjanje vstavljanja datumov v format. |

| R06 | Pet stevec prikazuje celotna opravila, vkljucno z odprti in zaključenimi. | Stevci se prikaZijo. | Preverjanje prikaSe pet stevec. |

| R07 | Izbirnik pogledov all/overdue/today/week/later/done prikazuje ustrezne skupine. | Izbirnik odpira pogled na odbrane skupine. | Preverjanje izborov vsebine. |

| R08 | Nov referenčni datum preraCuna skupine; praženje prikaze opozorilo.

| R09 | Preglednica in tabla prikazujeta enake ID-je; ohranijo stanje. | Preglednica in tabela prikazujeta enake podatke. | Preverjanje ohranitve stanja. |

| R10 | Menjava projekta ponastavi stanje. | Menjava projekta vrne na začetno stanje. | Preverjanje spremembe projekta. |

| R11 | Prazen projekt daje pet 0. | Prazen projekt prikazuje 0 vseh stevec. | Preverjanje z praznim projektom. |

| R12 | Datum YYYY-MM-DD; pregled ne poszilja na API. | Pregled ne ustvarja napak na API. | Preverjanje z API-ji. |

## 3. Scenariji

- Uporabnik odpira aplikacijo -> vidi referenčni datum 2026-09-21, vse opravila prikaza.
- Uporabnik spremeni referenčni datum -> opravila se ponovno razvrstijo.
- Uporabnik izbere pogled "overdue" -> prikaza samo zapadla opravila.

## 4. Merila za uspeh

- R01-R12 vsi pogoji izpolnjujejo pričakovano obnašanje.
- Vmesnik ohranja Foliije vasi z izvirnim dizajnom.
- Datumi so pravilno preračunani neodvisno od časovnega pasu.
- Stevci so točni za vse kategorije opravil.

## 5. Omejitve in odprta vprašanja
- Testi še niso izvedeni; zahteve zahtevajo implementacijo.
- Prihodnje spremembe API-ja zahtevajo dodatno dokumentacijo.
