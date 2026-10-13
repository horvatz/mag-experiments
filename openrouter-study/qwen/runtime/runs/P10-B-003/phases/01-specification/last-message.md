---

## Končni odgovor

Sem pripravil specifikacijo za **pilot P10 – Lokalni vrstni red z razveljavitvami**:

### Datoteke, ki sem jih ustvaril/posodobil:
- **`docs/agent/specification.md`**: Dokumentacija zahtev R01–R12 z:
  - Opisom problema in konteksta
  - Podatkovnimi tipi (Task, Project)
  - Vhodi, dejanji in izidi (lokalni vrstni red, brez API write)
  - Tabelo zahtev s pogoji in načini preverjanja
  - Testnimi primeri in odprta vprašanja
- **`docs/agent/specification-history.md`**: Zapisan postopek

### Ključne značilnosti specifikacije:
- Vse spremembe so lokalne in ne uporabljajo API-ja (kot zahteva naloga)
- Ohranjeni obstoječi dizajn (Folio, 16 px odmiki, 16 px zaobljenost)
- Upoštevana pravila za globalne/mestne podatke (R01, R02, R09)
- Vključena zgodovina razveljitev z omejitev 20 (R04–R07)
- Števec razveljitev in ponovitev (R11)

Specifikacija je končana in pripravljena za implementacijo naslednjega agenta.
