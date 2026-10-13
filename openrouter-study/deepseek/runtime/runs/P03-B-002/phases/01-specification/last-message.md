Specifikacija je zaključena in shranjena.

**Izdelki**
- `docs/agent/specification.md` — kontekst, podatkovni tipi, predikati (`n`, `beseda`, `ujemanje`, `stanje`, `oseba`, `viden`), pogoji R01–R12 s sprejemnimi merili, dogovor o vmesniku, tabela sledljivosti in omejitve.
- `docs/agent/specification-history.md` — v1 z začetnim zapisom in dopolnitvijo po pregledu `src/TaskBoard.tsx`/`src/components.tsx`.

**Ključne predpostavke za implementerja**
- Iskanje: NFD + odstranjeni U+0300–U+036F + male črke, vse besede kot dobesedni podnizi združenih `id/title/description/assignee` (join z enojnim presledkom).
- Filtri stanja in osebe sta stroga IN; oseba se primerja natančno, brez normalizacije.
- Menjava projekta in osvežitev resetirata filtre; stanje ni v URL ali trajni shrambi.
- `role="status"` z `aria-label="Rezultati filtriranja"` (obstoječi `Loading` že uporablja `role="status"`), `data-task-id` ostane, brez zapisovalnih klicev na `/api/`.
- Vsi izidi R01–R12 so označeni kot nepreverjeni; dokaze vpiše implementer.
