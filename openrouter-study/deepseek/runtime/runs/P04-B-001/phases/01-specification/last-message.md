**Predaja: specifikacija P04 (vloga pripravljavca specifikacije)**

- `docs/agent/specification.md` (v1.0): problem in kontekst, vhodi/dejanja/izidi, dogovor o vmesniku (`Primarni ključ`, `Primarna smer`, `Sekundarni ključ`, `Sekundarna smer`, gumb `Izvorni vrstni red` z vrednostmi `original/title/assignee/status/dueDate/none/asc/desc`), predikati in pravila R01–R12, tabela sledljivosti z načrtovanimi mesti v `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/styles.css` in omejitve.
- `docs/agent/specification-history.md`: v0.1 (osnutek) in v1.0 (dopolnitev).

Ključne opredelitve: `cmp(t,u) = dP * E(t,u)`, ob izenačenju `idx(t) - idx(u)`; `E` upošteva sekundarni ključ le ob `P = 0`; `original` na primarnem ključu vrne T ne glede na ostalo; `desc` obrne le predznak izbrane primerjave; `norm` = NFD + odstranitev U+0300–U+036F + male črke + primerjava UTF-16.

Skupni testi D01–D04 in izhodiščni testi so v specifikaciji navedeni kot načrt preverjanja z izidom **ni izvedeno** — zagon aplikacije, testov in pregled videza pripadajo implementerju; v fazi specifikacije nisem izvajal aplikacije ali testov.
