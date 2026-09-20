# P01 — podatkovni model

Opis obstoječih shared/types.ts; skupni tipi se ne spreminjajo.

| Entiteta/polje | Tip in pomen | Spremenljivost |
| --- | --- | --- |
| Project.id, Project.name | string, identiteta in ime | samo branje |
| Task.id | string, enolična identiteta | samo branje |
| Task.projectId | string, pripadnost projektu | samo branje |
| Task.title | string, naslov | urejanje |
| Task.status | todo / in_progress / done | urejanje |
| Task.description | string, opis | samo branje |
| Task.assignee | string, odgovorna oseba | samo branje |
| Task.dueDate | string, datum roka | samo branje |
| TaskUpdate | samo title in status, oba obvezna | telo PATCH |

Osnutek vsebuje naslov in stanje izbranega id. Lokalno stanje razlikuje ogled,
urejanje in čakanje ter napako naslova in shranjevanja. Ni nove trajne entitete.

Naslov po odstranitvi samo U+0020/U+0009/U+000A/U+000D z robov ne sme biti prazen.
Notranji znaki ter U+00A0 ostanejo. Dovoljeni so vsi pari statusov, tudi isti status.
Formalna pravila D, d, q, e, n in prehodov so v [skupni specifikaciji](development-spec.md).

Odpri inicializira osnutek; sprememba ne spremeni Task. Preklic zavrže osnutek.
Veljavna oddaja vodi v čakanje z največ eno zahtevo. Uspeh zamenja obe polji samo
izbranega Task in vrne ogled; zavrnitev ohrani Task in osnutek ter vrne urejanje.
Podrobnosti, tabla, preglednica in števci po uspehu uporabljajo vrnjeni Task.
