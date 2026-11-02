Korak `$speckit-specify` je zaključen.

**Izdelki**
- `.specify/feature.json` — zapisan `{"feature_directory":"docs/agent/P10"}` (pot je bila že določena, vprašanja ni bilo).
- `docs/agent/P10/spec.md` (210 vrstic) po skupni predlogi P10:
  - Problem in kontekst, povezave na `task/instructions.md`, `PROJECT_RULES.md`, `docs/dizajn.md`, ustavo in skupno predlogo (vse povezave preverjene).
  - Trije neodvisno preverljivi scenariji P1–P3 in merila SC-001–SC-005 (izvedeni testi 12/12, nič ne-GET klicev, brez prelivanja pri 390 px, skupni testi ostanejo uspešni, ohranjena množica ID-jev).
  - Vhodi/dejanja/izidi ter dogovor o vmesniku (gumbi `Premakni <id> gor/dol` zunaj povezave, `Mesto opravila <id>`, `Razveljavi/Ponovi premik`, `Začetni vrstni red`, `role=status` z besedilom `Razveljavitve: U. Ponovitve: R.`).
  - Pravila sprememb stanja s simboli (`P`, `P0`, `pos`, `U`, `R`, `push20`) in tabela R01–R12 s sprejemnimi pogoji; izvedbena sledljivost je pripravljena, izidi pa so pošteno označeni kot „ni še izvedeno“.
  - Omejitve/zapisane interpretacije: `|R| ≤ 20` izhaja iz omejitve U (R07); „onemogočen“ pomeni `disabled`; brez trajne shrambe in brez novih zapisovalnih klicev.

Nobena dodatna funkcionalna zahteva ali zunanja metrika ni bila uvedena; koda še ni bila spremenjena. Preostanek proračuna: 1015 s.
