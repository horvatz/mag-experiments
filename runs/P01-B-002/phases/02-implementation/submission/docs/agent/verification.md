# P01 B — implementacija in predaja pregledovalcu

Datum: 17. 9. 2026. Vloga: implementator. Začetek faze približno 18:56 UTC, predaja približno 19:03 UTC; faza je končana pred omejitvijo 598 sekund in pušča rezerviran čas za pregled. Noben podagent ni bil zagnan.

Implementacija je pripravljena za pregled. Končni `npm run check` je končan z izhodno kodo **0**: lint, TypeScript, produkcijska gradnja ter **59 uspešnih testov** (38 osnovnih, 8 razvojnih P01 in 13 lastnih). Ni znanih neizpolnjenih zahtev R01–R10. To velja za pregled kode in dejansko izvedene scenarije, ne za nedostopne končne teste.

## Spremembe in podatkovni tok

- [TaskEditor.tsx](../../src/TaskEditor.tsx) je nov obrazec z lokalnim osnutkom naslova/stanja. Ob vsakem odprtju nastane iz shranjenega opravila. Vsebuje validacijo, ločeno napako strežnika, prikaz čakanja in sinhrono varovalo `pending`, ki prepreči več zahtev še pred naslednjim izrisom Reacta. PATCH prek obstoječega `updateTask` vsebuje samo naslov in stanje izbranega `id`.
- [taskTitle.ts](../../src/taskTitle.ts) odstrani izključno U+0020, U+0009, U+000A in U+000D na robovih; ne uporablja splošnega `trim()`.
- [TaskDetails.tsx](../../src/TaskDetails.tsx), zlasti `editing` in obdelava `onSaved`, odpre obrazec, ob preklicu odstrani osnutek, ob uspehu prevzame odgovor API-ja in vrne prikaz podrobnosti. Obstoječi drugi podatki ostanejo vidni.
- [useResource.ts](../../src/useResource.ts) dodaja funkcijsko posodobitev že naloženih podatkov `updateData`, vezano na trenutni ključ vira. [App.tsx](../../src/App.tsx), funkcija `taskSaved`, zamenja le zapis z enakim `id`. Če seznam še ni naložen, sproži sveže branje; obstoječi učinek prekine staro branje. Števci, preglednica in tabla še naprej izhajajo iz istega seznama. Posodobitev se sproži izključno po uspešnem PATCH.
- [styles.css](../../src/styles.css), pravila od `.detail-actions` do `.editor-save:hover`, dodaja samo lokalne sloge obrazca z obstoječimi barvami, gumbi, robovi in razmiki. Postavitev Folio, navigacija in oba pregleda so ohranjeni.
- Lastni testi so v [tests/agent/P01.spec.ts](../../tests/agent/P01.spec.ts). Strežnik, skupni tipi, odvisnosti, konfiguracija in skupni testi niso bili spremenjeni. Specifikacija, njena zgodovina in datoteke pregledovalca niso bile spremenjene.

## Dejanska preverjanja in dokazi

1. Začetni `npm run lint && npm run build`: uspeh, izhodna koda 0. Rezultat je bil v izhodu seje; dokončni dnevnik spodaj ponavlja oba koraka nad končno kodo in testi.
2. Prvi `npm run check`: lint in gradnja uspešna, 57 uspešnih in 2 neuspešna testa. [check-initial.log](check-initial.log) ohranja celoten izhod. Oba neuspeha sta bila v lastnem A05: test je po nastavitvi `nextMode=hold` primerjal celotno testno stanje z vrednostjo pred to nastavitvijo. Podatki opravil so bili enaki. Popravljen je bil samo lasten test, ki zdaj preveri nespremenjena opravila in nič zahtev med osnutkom; nadaljnji del ločeno preveri čakajočo zahtevo.
3. Končni `npm run check > docs/agent/check.log 2>&1`: **izhodna koda 0**, **59 passed (26.6s)**. [check.log](check.log) vsebuje lint, TypeScript, gradnjo in imena vseh uspešnih testov. [HTML-poročilo](../../playwright-report/html/index.html) pripada končnemu zagonu. Po tem zagonu se izvedbena koda in testi niso spreminjali.
4. Ročni ogled prek avtomatiziranega Chromiuma: `WEB_PORT=5193 API_PORT=3123 npm run dev`, nato skripta Node z `wsEndpoint` iz `task/browser.json` in `chromium.connect(wsEndpoint)`. Ločena konteksta 1440 × 960 in 390 × 844 sta odprla `web-02`, začela urejanje, preverila začetni fokus na naslovu, prikazala napako praznega naslova, izmerila polji in gumba ter preklicala in ponovno odprla obrazec brez napake. Izhodna koda skripte je 0. [manual-check.log](manual-check.log) vsebuje meritve in oba rezultata PASS. Širina dokumenta je bila 1440 oziroma 390; vse kontrole so znotraj širine zaslona. Pregledana sta bila tudi posnetka [namiznega obrazca](editor-1440.png) in [telefonskega obrazca](editor-390.png): ohranjene so nevtralne površine, moder poudarek, vidni fokus in obstoječi panel. Storitev za ta ogled ostaja na 5193/3123; uporablja ločen pomnilnik od testov in ročni scenarij ni ničesar shranil.

## Sledljivost zahtev

Vsi spodaj navedeni avtomatizirani scenariji so uspešni v končnem [dnevniku](check.log). D01–D04 so nespremenjeni skupni razvojni testi, izvedeni na namizju in telefonu. A01–A06 so imena skupin lastnih testov; parametrizacija ustvari skupaj 13 testov.

| Zahteva | Pravilo in mesto izvedbe | Dejanski test in rezultat |
| --- | --- | --- |
| R01 | `TaskDetails` uporablja `taskId`; `TaskEditor` inicializira obe polji iz shranjenega zapisa. | D01; A02 za `web-02` in `launch-01`, ki imata enak naslov. Začetne vrednosti in ciljni URL PATCH pravilni. |
| R02 | Lokalni stanji `title`/`status`; `onSaved` se pokliče šele po uspešnem API. | D03; A05 preveri podatke in števec zahtev pred oddajo ter nespremenjena opravila, prikaz in števce med zadržanim odgovorom v preglednici in tabli. |
| R03 | `normalizeTaskTitle`; validacija pred `updateTask`; povezana napaka in sprotni umik ob veljavnem vnosu. | D04; A01 preveri vse štiri robne znake, notranje znake in ohranitev drugih presledkov; A02 preveri normalizirano telo PATCH; A03 preveri prazen vnos, bele znake, ARIA-povezavo, nič zahtev in ohranitev NBSP, tudi samostojnega. |
| R04 | HTML `select` v `TaskEditor` z vsemi tremi možnostmi. | A04 preveri oznake možnosti in vseh šest usmerjenih prehodov. A03 preveri spremembo samo naslova, A04 samo stanja, A02 obe polji skupaj. |
| R05 | Prevzem vrnjenega `Task` v podrobnostih in seznamu; števci iz seznama; zapis prek API. | D02; A02 preveri shranjene podatke in ponovno odprtje po osvežitvi; A04 podrobnosti, vrstico, stolpec table, števce in osvežitev; A05 skupno posodobitev po sprostitvi odgovora. |
| R06 | Preklic odstrani `TaskEditor`, brez klica API; nov priklop ustvari svež osnutek in napake. | D03; A06 prekliče veljaven osnutek, napako vnosa in zavrnjen zapis ter preveri nespremenjene podatke in število zahtev. Ponovno odprtje istega opravila in naslednji obrazec sta brez starega vnosa/napak. |
| R07 | PATCH po `id` s samo dvema ključema; `taskSaved` zamenja samo enak `id`. | A02 primerja vseh šest celotnih zapisov pred in po spremembi v obeh projektih ter preveri natančno telo/URL zahteve. Druga polja in druga opravila, tudi z enakim naslovom, ostanejo enaka. |
| R08 | `catch` ohrani osnutek in prikaze ter pokaže `role=alert`; `finally` odklene obrazec. | A05 zavrne zadržano zahtevo, preveri vnos, podatke in omogočene kontrole; ponovitev uspe in odstrani napako. A06 dodatno preveri takojšnjo zavrnitev in preklic. |
| R09 | `pending.current` varuje oddajo; `saving` onemogoči obe polji in oba gumba ter pokaže `role=status`. | A05 sproži pet oddaj v istem izvajanju, potrdi natanko eno zahtevo in eno čakajočo operacijo, zaklep vseh štirih kontrol, prikaz čakanja in odklep po zavrnitvi. |
| R10 | Obstoječi ključi projekta/opravila in nov obrazec ob odprtju ločijo stanje; navigacija ohranjena. | A02 ponovno odpiranje po uspehu/osvežitvi; A04 preklop na tablo po uspehu; A06 po preklicih preklopi pogled in projekt ter odpre drugo opravilo brez prejšnjih napak. Vseh 24 osnovnih UI-testov na namizju/telefonu prav tako uspe. |

## Omejitve in opombe za pregled

- Neskladij predane specifikacije z izvirnimi zahtevami nisem ugotovil. Specifikacija ostaja dokument avtorja; njene prvotne oznake »ni izvedeno« dopolnjujejo dejanski rezultati tega zapisa.
- Referenčna rešitev in končni testi niso dostopni. Dodatni testi preverjajo konkretne scenarije, ne vseh možnih podatkov in zaporedij. Vseh šest prehodov je avtomatizirano preverjenih na namizju; telefon pokrivajo skupni razvojni testi, ročni ogled in A05 za tablo z zavrnitvijo ter ponovitvijo.
- Enovrstični HTML `input` že sam odstrani CR/LF iz vrednosti. Zato A01 preverja normalizacijo teh znakov neposredno na funkciji, A02/A03 pa dejansko telo zahtev iz UI za tabulatorje, presledke in NBSP. Preizkus funkcije ni predstavljen kot dokaz vnosa prelomov vrstic v enovrstični kontrolnik.
- Zunanji internet, drugi projekti in oddaljene storitve niso bili uporabljeni. Po navodilih `chromium.launch()` v okolju ne deluje; uporabljen je bil dovoljeni `chromium.connect()`, ki je deloval. Nameščene odvisnosti in infrastruktura so ostale enake. Npm izpisuje opozorilo o `http-proxy`, Playwright pa o barvnih spremenljivkah okolja; preverjanja so kljub temu uspešno končana.
- Navigacija ali zapiranje med aktivnim urejanjem, sočasne zunanje spremembe in ponovni zagon pomnilniškega strežnika so zunaj naloge. Obstojnost je preverjena z osvežitvijo strani ob istem delujočem strežniku.
- Gre za izvoz brez zgodovine Git; veja, commit, push ali PR niso bili ustvarjeni. Predaja poteka prek teh datotek. Pregledovalec lahko začne z `verification.md`, nato pregleda šest navedenih datotek `src/` in lastne teste; za ponovitev celote je ukaz `npm run check`.
