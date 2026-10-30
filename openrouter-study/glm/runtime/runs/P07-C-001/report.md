# Glavna naloga P07, postopek C

En agent je v isti seji izvajal uradne korake Spec Kit 1.0.8: constitution, specify, plan, tasks, implement in converge.
Referenčne rešitve in končnih testov med delom ni imel na voljo.

| Podatek | Rezultat |
| --- | --- |
| Model | z-ai/glm-5.3 (xhigh) |
| Zaključek | completed |
| Čas agenta | 6 min 53 s; omejitev 20 min |
| Osnovna preverjanja | 38/38 |
| Razvojna preverjanja P07 | 8/8 |
| Končna preverjanja P07 | 22/24 |
| Dovoljene spremembe | Da |
| Slog, tipi in gradnja | Uspešno |

Čas vključuje specifikacijo, kodo in preverjanje agenta. Priprava okolja in končna ocena nista vključeni.
Osnovna aplikacija mag-app ostaja pri pripetem commitu; izdelek izvedbe je shranjen ločeno v submission/.

Poraba, kot jo je vrnil CLI: {"input_tokens":4144273,"cached_input_tokens":3859008,"cache_write_input_tokens":0,"output_tokens":48014,"reasoning_output_tokens":46504}.
For each exact role session, compare CLI turn.completed with the last cumulative token_count before that phase ended. Sum the final cumulative total once per distinct session, never once per resumed phase.
Zagon uporablja OpenRouter API. Dejansko zaračunani strošek in popolnost evidence sta ločena v api-cost.json; tokenov ne pretvarjamo v evre.

## Faze

| Faza | Čas | Zaključek |
| --- | --- | --- |
| constitution | 70.978 s | completed |
| specify | 56.832 s | completed |
| plan | 19.645 s | completed |
| tasks | 19.864 s | completed |
| implement | 197.115 s | completed |
| converge | 43.565 s | completed |

Vsaka mapa v phases/ vsebuje točen poziv, nastavitve, rezultate, stisnjen dnevnik in predajo ob koncu faze.
Skupni čas vključuje tudi samodejne predaje med fazami.

[Vnaprej določen protokol C](../../docs/pilot-c-protocol.md) opisuje korake, omejitve in obravnavo popravkov.

Rezultat velja za eno izvedbo naloge. Ne dokazuje prednosti postopka C, popolnosti testov ali pravilnosti za vsa mogoča stanja.
Mobilna preverjanja so emulacija v Chromiumu.

Navodila in nastavitve so ob poročilu. Stisnjena izpisa dogodkov in datotek ohranjata sled izvedbe.
Vhodne datoteke aplikacije določa baseline v evaluation-summary.json; posebnosti izvoza so v input-overrides/.
Natančen opis okolja je v ../../docs/main-protocol.md. Shranjena konfiguracija in dnevnik te izvedbe imata prednost pred poznejšimi izboljšavami izvajalnika.
