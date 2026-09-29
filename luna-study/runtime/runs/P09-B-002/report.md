# Glavna naloga P09, postopek B

Trije agenti so si zaporedno predali pripravo specifikacije, implementacijo in pregled. Morebitne popravke opravita prvotna avtorja.
Referenčne rešitve in končnih testov med delom ni imel na voljo.

| Podatek | Rezultat |
| --- | --- |
| Model | gpt-6-luna (xhigh) |
| Zaključek | completed_with_phase_time_limit |
| Čas agenta | 18 min 20 s; omejitev 20 min |
| Osnovna preverjanja | 38/38 |
| Razvojna preverjanja P09 | 8/8 |
| Končna preverjanja P09 | 24/24 |
| Dovoljene spremembe | Da |
| Slog, tipi in gradnja | Uspešno |

Čas vključuje specifikacijo, kodo in preverjanje agenta. Priprava okolja in končna ocena nista vključeni.
Osnovna aplikacija mag-app ostaja pri pripetem commitu; izdelek izvedbe je shranjen ločeno v submission/.

Poraba, kot jo je vrnil CLI: podatek ni na voljo.
Delno opažena poraba pred prekinitvijo (spodnja meja, ne celotna poraba): {"input_tokens":1892623,"cached_input_tokens":1725696,"cache_write_input_tokens":0,"output_tokens":36489,"reasoning_output_tokens":18461}.
Raw CLI usage is recorded per phase. Aggregate is withheld if a resumed session requires reconciliation or any phase lacks a final usage event.
Zagon uporablja obstoječo prijavo ChatGPT. Iz porabe nismo izračunali stroška API ali zneska v evrih.

## Faze

| Faza | Čas | Zaključek |
| --- | --- | --- |
| specification | 360.034 s | phase_time_limit |
| implementation | 471.244 s | completed |
| review | 164.213 s | completed |
| implementation-repair | 102.418 s | completed |

Vsaka mapa v phases/ vsebuje točen poziv, nastavitve, rezultate, stisnjen dnevnik in predajo ob koncu faze.
Skupni čas vključuje tudi samodejne predaje med fazami.

[Vnaprej določen protokol B](../../docs/pilot-b-protocol.md) opisuje korake, omejitve in obravnavo popravkov.

Rezultat velja za eno izvedbo naloge. Ne dokazuje prednosti postopka B, popolnosti testov ali pravilnosti za vsa mogoča stanja.
Mobilna preverjanja so emulacija v Chromiumu.

Navodila in nastavitve so ob poročilu. Stisnjena izpisa dogodkov in datotek ohranjata sled izvedbe.
Vhodne datoteke aplikacije določa baseline v evaluation-summary.json; posebnosti izvoza so v input-overrides/.
Natančen opis okolja je v ../../docs/main-protocol.md. Shranjena konfiguracija in dnevnik te izvedbe imata prednost pred poznejšimi izboljšavami izvajalnika.
