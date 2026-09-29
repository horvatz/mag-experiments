# Preverjanje P09

## Izvedeni ukazi in rezultati

- `npm run check` — končni zagon po implementaciji: **uspeh**. Lint brez napak, TypeScript preverjanje in Vite build uspešna; Playwright **53/53**. Obseg: 14 API + 24 namiznih/mobilnih osnovnih + 8 razvojnih P09 + 7 agentnih preverjanj.
- `npx playwright test --project=agent` — po zadnjih spremembah testov: **7/7 uspešnih**. Vseh sedem scenarijev v `tests/agent/P09.spec.ts` je opravljenih.
- Začetni `npm run check` po prvem posegu je imel 4 neuspehe med 51 preverjanji: osnovna pričakovanja praznega projekta in table. Implementacija je bila dopolnjena, da ohrani prejšnje prazno stanje in stolpce ter pokaže tudi `Ni zadetkov.`. Naslednji celotni zagon je uspel. Med razvojem je agentni test enkrat napačno predpostavil globalni vrstni red kartic po stolpcih; asercija je bila popravljena na preverjanje množice ID-jev in zadnji agentni zagon je uspel.
- Zagon Playwright uporablja konfigurirani lokalni Chromium, ločena namizna in mobilna profila ter lokalni testni strežnik. Opozorila npm o `http-proxy` in Node o `NO_COLOR` niso preprečila preverjanja.

## Sledljivost zahtev

| Zahteva | Pogoj in implementacija | Dejanski scenarij in izid |
| --- | --- | --- |
| R01 | `src/navigation.ts` razčleni stanje obstoječe poti; `src/App.tsx` ga uporabi pri prvem prikazu. | D01: neposredni filtrirani URL, uspeh; agentni neposredni URL drugega projekta s statusom, uspeh. Celotni `npm run check` 53/53. |
| R02 | `src/taskFilterUtils.ts` izvede trim, NFD, odstrani U+0300–U+036F in uporabi dobesedni podniz prek naslovov, opisa, osebe ali ID-ja. | Agent: `literal accent-insensitive phrase and stable title ordering`; `phrase matches each supported field and intersects with status` (vključuje ločila/regex znake in frazo, ki se ne razdeli), 2/2 uspešna. |
| R03 | `filterTasks` uporabi presek statusa in fraze; naslov primerja z JS UTF-16 leksikalnim operatorjem in izvorni indeks uporabi za stabilne vezi. | D02: status; agent: kombinacija statusa/fraze ter oba vrstna reda in enaka naslova, uspeh. Dovoljeni vhodni podatki v agentnem scenariju vključujejo slovenske znake; supplementary-plane naslovi niso bili posebej preizkušeni. |
| R04 | `src/navigation.ts` bere prvo pojavitev (`URLSearchParams.get`), neveljavne vrednosti zamenja s privzetimi in pri samem parse ne piše URL-ja. | Agent: `first query value wins and parsing leaves the URL untouched`, vključuje podvojene status/order in neznan parameter, uspeh. |
| R05 | `ViewFilters` hrani osnutek lokalno in ga potrdi šele na klik; sprememba hash poti ponovno ustvari kontrolnik iz potrjenega stanja. | D02: osnutek ne vpliva pred potrditvijo; agent: navigacija na tablo zavrže osnutek, Nazaj/Naprej obnovita kontrolnike, uspeh. |
| R06 | `normalizeFilters`, `projectUrl` in `ViewFilters.confirm` obrežejo q, izpustijo privzete parametre, ohranijo tablo ter pri nespremenjeni semantiki uporabijo `replaceState`. | Agent: `confirmation canonicalizes without adding history for unchanged state`; preveri čiščenje unknown/default parametrov in `history.length`, uspeh. |
| R07 | Hash je vir potrjenega stanja; `useRoute` se naroči na `hashchange`. | D03: stanje preživi osvežitev; agent: Nazaj in Naprej obnovita prikaz, filtre in osnutek, uspeh. |
| R08 | Preklop pregleda/table sestavi URL iz potrjenih filtrov; komponenta filtrov se ob navigaciji ponastavi. | D03: filtrirana tabla in reload; agent: tabla, Nazaj na preglednico in naprej, ID-ji ostanejo enaki, uspeh. |
| R09 | `taskUrl` izbere ID ter nosi `view` in filtre; `TaskDetails` ob zaprtju sestavi projektni URL z istim stanjem. | Osnovni test: podvojeni naslovi, pravi ID in Escape; agent: odpiranje s table in zapiranje z gumbom ohranita `view=board` ter `status=done`, uspeh. |
| R10 | Projektna navigacija uporablja privzete filtre in obdrži `view`; `useRoute` sprejme filtre tudi za neposredno drugo projektno povezavo. | Agent: klik na `launch` počisti filtre in ohrani tablo; neposredni `launch?status=done` pokaže dokončani zapis, uspeh. |
| R11 | Reset potrdi privzete filtre; rezultatni status prikazuje število zadetkov/skupaj, prazen seznam pokaže `Ni zadetkov.`. | D04: prazen rezultat in reset; agent: števec `0 od 8`, reset s table ohrani način in vrne ID-je, uspeh; osnovna prazna projekt/table preverjanja uspešna. |
| R12 | UI uporablja obstoječi GET `useResource`, ne shranjuje stanja v localStorage in ne uporablja `/__test/`; filtri ne spreminjajo podatkov. Slogi filtrov se zložijo pri ozkem zaslonu. | D04 in agent: brez zapisov; agent preveri širino dokumenta pri 390 px; osnovni testi pokrijejo nalaganje, napako/ponovitev, neznano pot, podrobnosti in odzivnost. Uspeh. Pregled `src/` ni našel uporabe `localStorage` ali testnih poti. Obstoječi `updateTask` helper v `src/api.ts` je ostal nespremenjen in ga UI ne kliče. |

## Omejitve preverjanja

- Preverjena sta konfigurirana Chromium namizni in mobilni profil; drugi brskalniki niso bili del tega okolja.
- Primeri preverjajo določene unicode naglase in normalizacijo, ne pa posebej primerjalnega vrstnega reda naslovov s supplementary-plane znaki. Koda uporablja JavaScriptova leksikalna operatorja nad nizi, ki primerjata UTF-16.
- Končni oziroma skriti testi izven priloženega okolja niso bili dostopni; navedeni so samo dejansko zagnani lokalni testi.
