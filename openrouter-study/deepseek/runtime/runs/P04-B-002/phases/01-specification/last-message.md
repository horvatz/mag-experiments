Specification is complete and saved. Finishing the role here.

**Predaja (snovalec specifikacije)**

- `docs/agent/specification.md` (164 vrstic): problem in kontekst, vhodi/dejanja/izidi, pravila R01–R12 s sprejemnimi pogoji in načini preverjanja, predikati P1–P11, opombe za izvedbo, sledljivost (označena kot načrt) ter odprta vprašanja.
- `docs/agent/specification-history.md`: zgodovina osnutka in dopolnitve z navedbo pregledanih datotek.
- Ključne opredelitve za implementerja: `norm` (NFD, U+0300–U+036F, male črke, UTF-16), `rank(todo/in_progress/done)`, `dir` obrne le `cmp` izbranega ključa, sekundarni ključ le ob enakosti primarnega, izenačitev po `idx`, `original` vedno vrne prejeto polje; štiri kontrole z vrednostmi `original/title/assignee/status/dueDate`, `asc/desc`, `none`; ohranjeni `data-task-id`, `aria-label="Pregled stanj opravil"`, brez zapisov na `/api/`.
- Preverjeno ujemanje pravil z razvojnimi primeri D01–D04 (npr. `=SUM(A1)` prvi, `Alfa 10` pred `alfa 2`, `status` + `dueDate desc`, stolpec Pripravljeno, ponastavitev).
- Izidi v sledljivosti so označeni kot „ni izvedeno“; implementer in preverjanje še nista bila izvedena, zato noben test ni naveden kot uspešen.
