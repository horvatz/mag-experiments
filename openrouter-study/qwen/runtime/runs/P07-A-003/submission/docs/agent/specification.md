# Specifikacija: Priljubljena opravila in trajna shramba (P07)

**Datum:** 2026-10-30

## Problem in kontekst

**Namen:** Uporabniki želijo hiter dostop do pogosto uporabljenih opravil na Folio aplikaciji.

**Začetno:** Aplikacija prikazuje opravila v tabeli in tabli brez možnosti označevanja priljubljenih opravil.

**Predvidena sprememba:** Dodana bo funkcionalnost za označevanje opravil kot priljubljenih.

## Ključne zahteve

### Shramba stanja
- Ključ: folio:favorites:v1
- Format: JSON {version: 1, ids: [...]} (niz nizov)
- Razvrščeno po UTF-16, edinstveni ID-ji
- Vrednosti so le ID-ji, ne polja opravil

### Validacija podatkov
- Neveljaven JSON, napačna verzija, manjkajoče polja → prazna množica
- Podvojene vrednosti obravnavane kot ena
- Neznani ID-ji ne ustvarjajo novih opravil

### Uporabniški vmesnik
- Gumb Priljubljeno opravilo {id} z aria-pressed
- Filter checkbox »Prikaži le priljubljena« (privzeto false)
- Števec Priljubljeno: X od M. z role=status
- Ni priljubljenih opravil kot poročilo ob 0 rezultatih
- Gumb Odstrani priljubljene tega projekta


## Shramba in vzdrževanje

- Čas hranjenja: lokalna shramba brez sinhronizacije z API-ji
- Shramba se ohranja 20 minut nato pa postane neveljavna
- Zapisi imajo enotilno obliko folio:favorites:v1

## Pravila za implementacijo

### Navodi za priljubljene opravila
1. **Označevanje:** Klik preklopi stanje gumba, doda ID v množico priljubljenih
2. **Osveževanje:** branje iz localStorage z validacijo podatkov, navajanje praznih
3. **Filter:** Ko je filter vklopljen, prikaz samo opravil z ID-ji v množici za tekuči projekt
4. **Števec:** Priljubljeno: X od M. (X število priljubljenih, M skupno v projektu)

### Obdelava napak
- Neveljavni API-ji ali stale podatkovne shrame → prazna množica
- Napake se ne ustavijo ob zagonu aplikacije

