# Glavna naloga P04, postopek C

En agent je v isti seji izvajal uradne korake Spec Kit 1.0.8: constitution, specify, plan, tasks, implement in converge.
Referenčne rešitve in končnih testov med delom ni imel na voljo.

| Podatek | Rezultat |
| --- | --- |
| Model | gpt-6-astra (xhigh) |
| Zaključek | completed |
| Čas agenta | 15 min 45 s; omejitev 20 min |
| Osnovna preverjanja | 38/38 |
| Razvojna preverjanja P04 | 8/8 |
| Končna preverjanja P04 | 24/24 |
| Dovoljene spremembe | Da |
| Slog, tipi in gradnja | Uspešno |

Čas vključuje specifikacijo, kodo in preverjanje agenta. Priprava okolja in končna ocena nista vključeni.
Osnovna aplikacija mag-app ostaja pri pripetem commitu; izdelek izvedbe je shranjen ločeno v submission/.

Poraba, kot jo je vrnil CLI: {"input_tokens":2415718,"cached_input_tokens":2157440,"cache_write_input_tokens":0,"output_tokens":27050,"reasoning_output_tokens":2915}.
For each exact role session, compare CLI turn.completed with the last cumulative token_count before that phase ended. Sum the final cumulative total once per distinct session, never once per resumed phase.
Zagon uporablja obstoječo prijavo ChatGPT. Iz porabe nismo izračunali stroška API ali zneska v evrih.

## Faze

| Faza | Čas | Zaključek |
| --- | --- | --- |
| constitution | 87.893 s | completed |
| specify | 160.171 s | completed |
| plan | 116.075 s | completed |
| tasks | 71.684 s | completed |
| implement | 420.692 s | completed |
| converge | 82.026 s | completed |

Vsaka mapa v phases/ vsebuje točen poziv, nastavitve, rezultate, stisnjen dnevnik in predajo ob koncu faze.
Skupni čas vključuje tudi samodejne predaje med fazami.

[Vnaprej določen protokol C](../../docs/pilot-c-protocol.md) opisuje korake, omejitve in obravnavo popravkov.

Rezultat velja za eno izvedbo naloge. Ne dokazuje prednosti postopka C, popolnosti testov ali pravilnosti za vsa mogoča stanja.
Mobilna preverjanja so emulacija v Chromiumu.

Navodila in nastavitve so ob poročilu. Stisnjena izpisa dogodkov in datotek ohranjata sled izvedbe.
Vhodne datoteke aplikacije določa baseline v evaluation-summary.json; posebnosti izvoza so v input-overrides/.
Natančen opis okolja je v ../../docs/main-protocol.md. Shranjena konfiguracija in dnevnik te izvedbe imata prednost pred poznejšimi izboljšavami izvajalnika.
