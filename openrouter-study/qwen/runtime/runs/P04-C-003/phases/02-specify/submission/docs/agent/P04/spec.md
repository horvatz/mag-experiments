# P04 Spec: Stabilno razvrščanje z dvema ključema

**Različica**: 1.0 | **Pot funkcionalnosti**: docs/agent/P04

## Problem in kontekst

Aplikacija *mag-app* (dizajn Folio) omogoča pregled opravil v projektnem pogledu. 
Uporabniki pričakujejo stabilno in prilagodljivo razvrščanje z možnostjo
izbiro primarnega in sekundarnega ključa. Vsak odziv API-ja /api/ vključi
vrstni red, ki ga mora uporabniški vmesnik natančno upoštevati.

Uporabniški cilj: *Prikaz opravil v voljo izbranem ključu in smeri, s
hranjenjem vrstnega reda za enake ključne parje ter pravilnim normaliziranjem
za primerjavo.*

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeti `sortKey=original`, `sortOrder=asc`; sekundarna `sortKey=none`, `sortOrder=asc`; ohrani izvorni vrstni red polja | Pregled odziva z privzetimi parametri |
| R02 | `title` in `assignee` primerja normalizirane nize: NFD, odstranitev U+0300–U+036F, male črke; UTF-16 leksikografska primerjava z < in > | Preizkus normalizacije |
| R03 | `status`: vrstni red todo < in_progress < done; `dueDate`: veljavni datumi YYYY-MM-DD kronološko
