# Razvojni primeri L/1.0

Vmesni opis prvih treh arhivov. Primeri so ilustrativno izbrani po pregledu
izidov; niso nove meritve ali nadomestilo za vse izide. Formalna presoja
ponovitev 001 je vnaprej določena in shranjena ločeno.

## P05: funkcionalni uspeh in dokončan postopek

Vse tri oddaje imajo 70/70 neodvisnih preverjanj in 12/12 zahtev.
A in B sta zaključena, C pa je dosegel časovno mejo implementacijske faze.

| Zbirka / ID | Status | Čas (s) | Strogi uspeh | Popolna poraba |
| --- | --- | --- | --- | --- |
| L/1.0:P05-A-001 | completed | 473,547 | da | da |
| L/1.0:P05-B-001 | completed | 929,075 | da | da |
| L/1.0:P05-C-001 | phase_time_limit | 1081,068 | ne | ne |

C je za constitution, specify, plan in tasks porabil skupaj 618,557 s.
Implementacijska faza je imela 456,793 s proračuna; ustavljena je bila po
456,831 s. Del skupnega proračuna je po nespremenjenem protokolu rezerviran
za zaključni korak, vendar ob prekinjeni implementaciji do njega ni prišlo.
To ni prekinitev zaradi izgube dostopa ali spremenjene raziskovalčeve meje.
Dnevnik pred prekinitvijo potrdi 51/51 razvojnih preverjanj, agentova predaja
pa še vedno pravi »preverjanje v teku« in T009 ostane odprt.

Celotna poraba C je neznana. Opažena spodnja meja je 4.429.360 vhodnih
(4.243.712 predpomnjenih) in 49.069 izhodnih (26.527 reasoning) tokenov.
Teh spodnjih mej ne primerjamo kot enakovrednih popolnim povprečjem.

Dokazi: [izvedba C](../runtime/runs/P05-C-001/execution.json),
[poraba C](../runtime/runs/P05-C-001/usage-observation.json),
[neodvisna ocena C](../runtime/runs/P05-C-001/evaluation-summary.json),
[razvojni dogodki C](evidence/P05-C-001-checks.md#item_30),
[odprta naloga T009](../runtime/runs/P05-C-001/submission/docs/agent/P05/tasks.md).

## Popravljeni lastni testi niso isto kot popravljena aplikacija

A je najprej popravil uvoz neobstoječih ikon po dejanski napaki gradnje.
Nato je popravil lastni pričakovanji o testnih podatkih in razdelil ponoven
mount v ločen scenarij. Končni zagon potrdi 53/53.

B je popravil pričakovano število opravil todo ter primerjavo vrstnega reda
table (stolpci po stanju) z globalnim redom API-ja. Končni zagon potrdi 49/49;
pregledovalec testov ni sam ponovil in ni zahteval nadaljnjega popravka.

C je popravil test, ki je skušal odpreti naslednjo stran pri dveh opravilih,
in ločil prazen projekt od nove namestitve GET prestreznikov v istem
scenariju. Končni zagon potrdi 51/51, časovna meja pa prekine nadaljnjo predajo.

Dokazi so neposredni izvlečki [A](evidence/P05-A-001-checks.md),
[B](evidence/P05-B-001-checks.md) in [C](evidence/P05-C-001-checks.md).
Opis popravkov testnih priprav ne pomeni, da so neodvisni končni testi
najprej padli. Ti so izvedeni enkrat po zaključku oziroma prekinitvi modela.
