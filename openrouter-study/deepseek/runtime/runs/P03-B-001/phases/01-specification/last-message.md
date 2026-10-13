**Opravljeno — faza specifikacije**

- `docs/agent/specification.md` (različica 0.1): vsebuje vse razdelke predloge — problem/kontekst, vhode/dejanja/izide, pravila R01–R12 s predikati (`norm`, `words`, `hit`, `visible`, `M`, `N`), dogovor o vmesniku (dostopna imena kontrol, `role=status`, `data-task-id`) ter tabelo sledljivosti z načrtovanimi testi in datotekami.
- `docs/agent/specification-history.md`: zabeleženi viri, obseg in odprte točke za naslednje faze.
- Ključni pogoji za implementerja: IN-sestavljanje iskanja in filtrov, normalizacija NFD + odstranitev U+0300–U+036F + male črke, `Prikazano: N od M.` z `M = |T|`, `Ni zadetkov.` pri nepraznem projektu brez zadetkov, reset ob menjavi projekta/osvežitvi/`Počisti filtre`, nobenih zapisovalnih klicev na `/api/`.
- Testi in aplikacija v tej fazi niso bili zagnani; v tabeli sledljivosti so izidi izrecno označeni kot neizvedeni, dokaze vpišeta implementer in pregledovalec.

Predajam specifikacijo implementerju.
