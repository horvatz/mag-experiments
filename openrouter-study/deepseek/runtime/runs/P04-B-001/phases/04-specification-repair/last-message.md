**Predaja: popravki specifikacije po pregledu (v1.1)**

- Upoštevana ugotovitev R06: v `docs/agent/specification.md` sta predikata zdaj skladna s pravilom, da primarni ključ `original` vrne izvorni vrstni red — `E(t,u) = 0` in `cmp(t,u) = idx(t) - idx(u)` ne glede na sekundarni ključ in smeri; izjema je vključena v formulo, ne le v ločeno pravilo.
- Ugotovitev R05 (sekundarni select ponuja `original`) je zabeležena v `docs/agent/specification-history.md` kot popravek za implementerja v `src/App.tsx`; specifikacija ostaja nespremenjena, ker dogovor o vmesniku že zahteva možnosti `none/title/assignee/status/dueDate`.
- Kode in testov nisem spreminjal. Zgodovina: v0.1 → v1.0 → v1.1 z obrazložitvijo sprejema in razmejitve.
