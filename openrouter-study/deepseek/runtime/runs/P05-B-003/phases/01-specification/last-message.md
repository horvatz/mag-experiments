Specifikacija je zaključena in shranjena; faza se izteka, zato zaključujem.

**Predaja**
- `docs/agent/specification.md` (v1.0, 134 vrstic): problem/kontekst, vhodi in dejanja, dogovor o vmesniku (dostopna imena `Velikost strani`, `Filter strani`, gumbi, `role=status` z `aria-label="Stanje straničenja"`), predikati stanja (T, F, N, S, P, Y, odsek(P), A/B) in 8 splošnih pravil, tabela R01–R12 s sprejemnimi pogoji, tabela sledljivosti z načrtovanimi mesti dokazov ter odprta vprašanja.
- `docs/agent/specification-history.md`: zabeležen osnutek in dopolnitev v1.0.

**Ključne odločitve za implementerja**
- Straniči se filtrirano F v vrstnem redu API-ja; sprememba velikosti ali filtra vedno P=1; gumbi onemogočeni na robovih (pri N=0 vsi štirje).
- Natančno statusno besedilo: `Stran P od Y. Prikazano A–B od N.` oz. `Stran 0 od 0. Prikazano 0–0 od 0.` (pomišljaj `–`).
- Pregled stanj šteje cel T, stolpci table odsek; tabla združi isti odsek; brez zapisov, trajne shrambe in URL-ja.
- Preslikava na skupne razvojne teste D01–D04 in predvidene lastne teste v `tests/agent/`; rezultati označeni kot „ni izvedeno", ker testiranje pripada implementerju.

Nepreverjeno v tej fazi: izvedba in vsi testi (niso tekli); to dopolni implementer oziroma ob morebitnih popravkih prvotni avtor specifikacije.
