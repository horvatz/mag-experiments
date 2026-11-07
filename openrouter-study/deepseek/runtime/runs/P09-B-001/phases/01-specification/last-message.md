Specification complete and saved. Final check confirms both files are in place with all R01–R12 covered.

**Oddano**
- `docs/agent/specification.md` (v1.1): problem in kontekst, vhodi/dejanja/izidi, predikati in pravila za R01–R12, tabela sledljivosti (izvedbo in dokaze vpiše implementer), dogovor o vmesniku (točne kontrole, dostopna imena, števec `Prikazano: N od M.`, primer URL-ja, ohranjene prilagoditve), predpostavke in omejitve.
- `docs/agent/specification-history.md`: v1.0 in v1.1 z opisom sprememb in pregledanimi viri.

Ključne opredelitve za implementerja: `norm` (trim + NFD + odstranitev U+0300–U+036F + male črke), `match` kot podniz po title/description/assignee/id, `visible(C)` s stabilnim `title-asc/desc` po UTF-16, neveljavni parametri → privzetki, prva ponovitev parametra zmaga, osnutek D ločen od potrjenega C, največ eno zgodovinsko stanje na potrditev in le ob spremembi, ter prepoved zapisov na API in trajne shrambe.

V skladu z vlogo nisem zagnal aplikacije ali testov; to preide na implementerja, ki izpolni tudi stolpce izvedbe v tabeli sledljivosti.
