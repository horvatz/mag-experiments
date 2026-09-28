# P07: preverjanje izvedbe

## Izvedena preverjanja

Končni zagon `npm run check` dne 28. 9. 2026 je uspel. Ukaz je izvedel ESLint,
TypeScript preverjanje, produkcijsko gradnjo Vite in Playwright: **54/54 testov
uspešnih**.

| Skupina | Izid | Pokritost |
| --- | --- | --- |
| API regresije (`tests/api.spec.ts`) | 14/14 | Obstoječi API testi. |
| Izhodiščni namizni in mobilni testi (`tests/baseline.spec.ts`) | 24/24 | Navigacija, prazni prikazi, podrobnosti po ID-ju, tabla in odzivnost. |
| P07 razvojni testi (`tests/development/P07.spec.ts`) | 8/8 | D01–D04, namizje in mobilni Chromium. |
| Lastni testi (`tests/agent/P07.agent.spec.ts`) | 8/8 | Lokalna shramba, ID-ji, filter, menjava projekta, dogodki, izjeme, nič in 12 opravil. |

Pred končnim zagonom je prvi zagon lastnega testa pokazal eno napako v
pričakovanju malih/velikih črk opozorila; besedilo opozorila je bilo
poenoteno z zahtevano besedo `shramba`. Ponovljeni celotni zagon je uspel.

Povezave med zahtevami, pogoji, kodo in testi so v
[specifikaciji](specification.md#izvedba-in-sledljivost). Lastni testi so v
[P07.agent.spec.ts](../../tests/agent/P07.agent.spec.ts). Primer `readonly`
preveri, da interakcije ne pošiljajo zapisov na API; mobilni `readonly`
preveri, da širina dokumenta ne preseže širine okna. Razvojni in osnovni
mobilni testi so tekli v Chromiumu z ozkim prikazom 390 px.

## Sledljivost zahtev

| Zahteva | Dokaz v končnem zagonu |
| --- | --- |
| R01 | D01 namizje/mobilno in agentni test neodvisnosti po ID-ju. |
| R02 | Agentni test preveri natančno JSON obliko, edinstvenost in sortiran seznam ID-jev. |
| R03 | Agentni storage dogodek vsebuje podvojen in neznan ID; čiščenje projekta ohrani neznani ID. |
| R04 | Agentni testi pokrijejo napačen JSON, napačno različico, manjkajoči seznam, neniz ter manjkajoči ključ; naložen zapis ostane nespremenjen. |
| R05 | Agentni testi preverijo privzeti filter in vrstni red rezultatov v seznamu z 12 opravili. |
| R06 | D02 odstrani zadnji vidni favorit; agentni test preveri sporočilo ter dostopne kontrole pri praznem projektu. |
| R07 | D04 preklaplja pogled z ohranjenim stanjem; osnovni regresijski test odpre podrobnosti podvojenih naslovov po ID-ju. |
| R08 | D03 preveri osvežitev; agentni test preveri ohranitev ID-jev in ponastavitev filtra ob menjavi projekta. |
| R09 | Agentni test odstrani priljubljene trenutnega projekta in preveri ohranitev tujih ID-jev; prazen projekt onemogoči gumb. |
| R10 | Agentni testi preverijo števca projekta ter število vidnih elementov stolpcev table pri filtru in več kot 10 opravilih. |
| R11 | Agentni testi preverijo pravi/drugi ključ, `null`, brez povratnega zapisa ter simulirani izjemi `getItem` in `setItem`. |
| R12 | D04 in agentni `readonly` preverita odsotnost API zapisov; osnovni mobilni testi in `readonly` preverijo ozko postavitev. |

## Omejitve in nepreverjeni deli

- Skriti končni testi P07 niso bili dostopni. Rezultat 54/54 se nanaša samo na
  navedene lokalne teste in ne potrjuje nevidnih primerov.
- Simulacija `storage` dogodka je sintetičen dogodek v brskalniškem testu;
  dejanska sinhronizacija med ločenima zavihkoma ni bila ročno preverjena.
- Izjeme lokalne shrambe so bile simulirane z nadomestitvijo metod `getItem` in
  `setItem`; fizično blokiranje shrambe v brskalniku ni bilo ročno nastavljeno.
- Preverjena sta prazen projekt in projekt z 12 opravili. Posamezno opravilo,
  seznami bistveno večji od 12 ter vse možne oblike ID-jev niso bili posebej
  preizkušeni; prikaz in štetje uporabljata neposredne operacije nad seznamom
  in naborom brez fiksnega števila opravil.
- Zagon `git status --short` ni uspel: okolje je javilo neveljavno pot
  `xcrun`/Command Line Tools (`/Library/Developer/CommandLineTools`). Zato
  Gitov povzetek sprememb ni bil dosegljiv; urejane datoteke so v dovoljenih
  mapah `src/`, `tests/agent/` in `docs/agent/`.
- Ročni vizualni pregled ni bil izveden. Odzivnost je bila preverjena prek
  mobilnih Playwright testov in njihovega pogoja za širino strani.
