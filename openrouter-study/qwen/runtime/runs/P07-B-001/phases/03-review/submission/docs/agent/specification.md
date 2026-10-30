# P07 Priljubljena opravila: Razvojna specifikacija

**Datum**: 2026-10-30
**Vloga**: specifikacijski avtor

## Problem in kontekst

Obstojaca aplikacija Folio omogoca pregled opravil v preglednici ali tablicnem pogledu. Dodaja se funkcionalnost priljubljenih opravil: uporabnik lahko s klikom na gumb oznaci opravilo kot priljubljeno. Priljubljeni se hranijo v localStorage pod kljucem folio:favorites:v1 kot JSON. Omogoca filter, prikaz samo priljubljenih za trenutni projekt in odstranjevanje priljubljenih. Funkcija je lokalna in ne oddaja na API.

## Vhodi, dejanja in izidi

### Podatkovna struktura

Shramba: folio:favorites:v1 = { version: 1; ids: string[] }

- version: stevilka racunice, trenutno 1. Neustrezna racunice pomeni prazno mnozico.
- ids: niz nizov edinstvenih ID-jev opravil, razvrsticnih po UTF-16. Vsebuje samo ID-je, ne celotna opravila.

### Validacija shrambe

Veljavna shramba:
- polje version s vrednostjo 1
- polje ids kot niz nizov z edinstvenimi vrednostmi

Neveljavna shramba:
- manjkajoca polja version ali ids
- ids ni niz ali vsebuije podvojene/neveljavne tipe
- nepraven JSON

Ob nestali ali neveljavni shrambi: prazna mnozica id.

### Stanje uporabnikiskega vmesnika

- Vsako opravilo ima gumb Priljubljeno opravilo <id> z aria-pressed=true/false.
- Filter: checkbox Prikaizi le priljubljene. Privzeta vrednost: false.
- Stevec: Priljubljeno: X od M., kjer je X/M celoten trenutni projekt.
- Gumb: Odstrani priljubljene tega projekta odstrani samo ID-je trenutnega projekta.

### Odzivno delovanje

- Klik preklopi samo ta ID-ji, ne odpre podrobnosti.
- Osvezeitev obnovi shranjene ID-je. Podvojeni ID-ji se obravnavajo kot ena. Neznani ID-ji ostanejo, ne ustvarjajo pa izmisljenih opravil.
- Odstranitev med aktivnim filtrom ga takoj odstrani iz prikaza. Ko ni rezultatov: Ni priljubljenih opravil.

### Napakes shrambe

- Uporablja kjuc folio:favorites:v1. Drugi kljuc se ignorira.
- Ce branje/zapis vrze izjemo: aplikacija ostane uporabna v pomnilniku, prikaspe se opozorilo o nedostopni shrambi.
- null vrednost prazni mnozico.
- Verska sprememba priljubljenih je lokalna: no zapisov na API, nobeno polje opravila se ne spremeni.
