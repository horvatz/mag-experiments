# Folio — Projektna ustava

**Sprejeto:** 30. oktobra 2026

## Načela

- **Ohranjanje dizajna:** Vse dopolnitve uporabljajo obstoječe Folio gradnike in slogovne spremenljivke iz `src/styles.css`.
- **Minimalne spremembe:** Spreminjamo samo `src/`, lastne teste v `tests/agent/` in dokumente v `docs/agent/`.
- **Prilagoditev zahtevam:** Dopolnjujemo obstoječi vmesnik in ne zamenjujemo strežnika z lokalno kopijo podatkov.
- **Slovenščina kot standard:** Osnovni jezik in imenovanja ohranimo v slovenskem jeziku.
- **Javni API:** Vse operacije z bazami preverimo prek `/api/` in ne lokalno shrambo opravil.
- **Testni integriteti:** Testni kontrole `/__test/` uporabljajo samo testi; uporabniški vmesnik jim ne dostopa.

## Nepogojna pravila

1. Začetna infrastruktura (strežnik, skupni tipi, skupni testi, odvisnosti) ostaja nedotaknjena.
2. Razvojni primeri `/__test/` ne dopuščajo dostopa do uporabniškega vmesnika.
3. Lokalna shramba `localStorage` ne nadomešča strežnika; obe sistema ločeno sta urejena.
4. Projektne datoteke Spec Kit omogočajo samo branje; ustvarjanje je omejeno na `constitution.md` in `feature.json`.
5. Vmesnik ne izvaja zapisa na API ali spreminja polja opravil s priljubljeno funkcionalnostjo.

---

*Ta ustava velja za celoten pilot P07.*
