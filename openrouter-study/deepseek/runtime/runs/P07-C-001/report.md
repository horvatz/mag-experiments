# Glavna naloga P07, postopek C

En agent je v isti seji izvajal uradne korake Spec Kit 1.0.8: constitution, specify, plan, tasks, implement in converge.
Referenčne rešitve in končnih testov med delom ni imel na voljo.

| Podatek | Rezultat |
| --- | --- |
| Model | deepseek/deepseek-v4.1-flash (xhigh) |
| Zaključek | invalid_stage_handoff |
| Čas agenta | 12 min 13 s; omejitev 20 min |
| Osnovna preverjanja | 38/38 |
| Razvojna preverjanja P07 | 8/8 |
| Končna preverjanja P07 | 22/24 |
| Dovoljene spremembe | Da |
| Slog, tipi in gradnja | Uspešno |

Čas vključuje specifikacijo, kodo in preverjanje agenta. Priprava okolja in končna ocena nista vključeni.
Osnovna aplikacija mag-app ostaja pri pripetem commitu; izdelek izvedbe je shranjen ločeno v submission/.

Poraba, kot jo je vrnil CLI: podatek ni na voljo.
Delno opažena poraba pred prekinitvijo (spodnja meja, ne celotna poraba): {"input_tokens":2927491,"cached_input_tokens":2552320,"cache_write_input_tokens":0,"output_tokens":72875,"reasoning_output_tokens":37802}.
One persistent session across stages; aggregate awaits researcher-side reconciliation of cumulative token counts. Missing counters remain unknown.
Zagon uporablja OpenRouter API. Dejansko zaračunani strošek in popolnost evidence sta ločena v api-cost.json; tokenov ne pretvarjamo v evre.

## Faze

| Faza | Čas | Zaključek |
| --- | --- | --- |
| constitution | 138.746 s | completed |
| specify | 103.447 s | completed |
| plan | 66.163 s | completed |
| tasks | 26.423 s | completed |
| implement | 329.168 s | completed |
| converge | 61.664 s | completed |

Vsaka mapa v phases/ vsebuje točen poziv, nastavitve, rezultate, stisnjen dnevnik in predajo ob koncu faze.
Skupni čas vključuje tudi samodejne predaje med fazami.

[Vnaprej določen protokol C](../../docs/pilot-c-protocol.md) opisuje korake, omejitve in obravnavo popravkov.

Rezultat velja za eno izvedbo naloge. Ne dokazuje prednosti postopka C, popolnosti testov ali pravilnosti za vsa mogoča stanja.
Mobilna preverjanja so emulacija v Chromiumu.

Navodila in nastavitve so ob poročilu. Stisnjena izpisa dogodkov in datotek ohranjata sled izvedbe.
Vhodne datoteke aplikacije določa baseline v evaluation-summary.json; posebnosti izvoza so v input-overrides/.
Natančen opis okolja je v ../../docs/main-protocol.md. Shranjena konfiguracija in dnevnik te izvedbe imata prednost pred poznejšimi izboljšavami izvajalnika.
