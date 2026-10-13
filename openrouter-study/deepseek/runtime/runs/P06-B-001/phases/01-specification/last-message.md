Specifikacija je pripravljena in zaključujem fazo.

**Predaja**
- `docs/agent/specification.md` (v1.0): kontekst, vhodi/dejanja/izidi, simboli in predikati (`C`, `T`, `S`, `f`, `R(f)`, `q`, `n`, `Omogočeno`), pravila R01–R12 s sprejemnimi pogoji, tabela sledljivosti do predvidenih nosilcev (`src/App.tsx`, `src/csv.ts`, `src/styles.css`) in testov D01–D04/lastnih testov ter omejitve.
- `docs/agent/specification-history.md` (v1.0): zabeleženi viri, obseg in status nepreverjenosti.
- Ključne opredelitve: nevtralizacija `n(x)` velja za podatke (ne glavo), vedno narekovane vrednosti, CRLF tudi za zadnjo vrstico, izvoz omogočen le ob neizpraznjenem izboru stolpcev in nepraznem filtriranem rezultatu, ponastavitev ob menjavi projekta/osvežitvi, enaki bajti ob preklopu pogleda.
- Vsi izidi so označeni kot nepreverjeni; zagon aplikacije in testov ter dokaze vpiše implementer.
