# Glavna naloga P09, postopek A

En agent je iz navodil pripravil specifikacijo, implementacijo naloge in lastna preverjanja.
Referenčne rešitve in končnih testov med delom ni imel na voljo.

| Podatek | Rezultat |
| --- | --- |
| Model | gpt-6-astra (xhigh) |
| Zaključek | completed |
| Čas agenta | 13 min 23 s; omejitev 20 min |
| Osnovna preverjanja | 38/38 |
| Razvojna preverjanja P09 | 8/8 |
| Končna preverjanja P09 | 24/24 |
| Dovoljene spremembe | Da |
| Slog, tipi in gradnja | Uspešno |

Čas vključuje specifikacijo, kodo in preverjanje agenta. Priprava okolja in končna ocena nista vključeni.
Osnovna aplikacija mag-app ostaja pri pripetem commitu; izdelek izvedbe je shranjen ločeno v submission/.

Poraba, kot jo je vrnil CLI: {"input_tokens":878396,"cached_input_tokens":821120,"cache_write_input_tokens":0,"output_tokens":22438,"reasoning_output_tokens":3857}.
Zagon uporablja obstoječo prijavo ChatGPT. Iz porabe nismo izračunali stroška API ali zneska v evrih.

Rezultat velja za eno izvedbo naloge. Ne dokazuje prednosti postopka A, popolnosti testov ali pravilnosti za vsa mogoča stanja.
Mobilna preverjanja so emulacija v Chromiumu.

Navodila in nastavitve so ob poročilu. Stisnjena izpisa dogodkov in datotek ohranjata sled izvedbe.
Vhodne datoteke aplikacije določa baseline v evaluation-summary.json; posebnosti izvoza so v input-overrides/.
Natančen opis okolja je v ../../docs/main-protocol.md. Shranjena konfiguracija in dnevnik te izvedbe imata prednost pred poznejšimi izboljšavami izvajalnika.
