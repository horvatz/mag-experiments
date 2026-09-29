# Načrt izvedbe P09

## Tehnični kontekst

- Aplikacija uporablja React 19, TypeScript 6 in Vite 8; zahtevana različica Node je 24.11+. Odvisnosti, brskalnik za teste in javni API so že pripravljeni.
- `src/navigation.ts` obravnava hash poti, izbiro pogleda in gradnjo URL-jev. `src/App.tsx` prek `/api/` naloži projekte in opravila ter prikaže projekt. `src/TaskBoard.tsx` prikaže kartice, `src/TaskDetails.tsx` podrobnosti, `src/styles.css` pa slog in prilagodljivo postavitev Folio.
- Obstoječi brskalniški testni program je Playwright (`npm test`); `npm run build` vključuje preverjanje TypeScript. Ne dodajaj odvisnosti ali spreminjaj skript, Vite, strežnika, skupnih tipov, skupnih testov ali druge infrastrukture.

## Odločitve o zasnovi

1. Ohraniti obstoječi hash usmerjevalnik in obliko poti. Razširiti razčlenjevanje poti ter pripomočke URL za `q`, `status`, `order` in `view=board`. Filtre ohraniti pri preklopu preglednice/table in odpiranju/zapiranju opravila. Izbira drugega projekta ponastavi filtre, način prikaza pa ohrani. Neposredna povezava ostane vir potrjenega stanja.
2. Vrednosti kontrol v osnutku ločiti od potrjenega stanja v URL-ju. Potrditev in ponastavitev zapišeta celotno stanje; dogodek zgodovine obnovi osnutek iz ciljnega URL-ja. Samo razčlenjevanje ali urejanje ne spreminja URL-ja.
3. Normalizacijo, filtriranje in stabilno razvrščanje naslovov umestiti v majhen čist pripomoček v `src/` (npr. `src/taskView.ts`). Sprejme podatke opravil in potrjene filtre ter vrne filtriran in urejen seznam; ne nalaga, shranjuje ali spreminja podatkov.
4. Vmesnik dopolniti znotraj Folio: v `src/App.tsx` dodati označene kontrole, gumba uporabe in ponastavitve, prazno stanje ter sprotni števec. Obema pogledoma podati isti urejeni seznam. Ohraniti povezave po ID-ju, obstoječa dostopna imena ter nalaganje, napake in podrobnosti. `src/TaskBoard.tsx` ali `src/TaskDetails.tsx` prilagoditi samo, če je to potrebno za ohranitev stanja poti. V `src/styles.css` dodati zadržane sloge, ki uporabljajo obstoječe gradnike Folio in notranje drsenje.
5. Podatki ostanejo samo za branje. Uporabiti obstoječi `/api/` in ID-je; aplikacijska koda ne uporablja `/__test/`, lokalne shrambe, nadomestnega vira podatkov ali novih paketov.

## Predvidene datoteke

| Datoteka | Namen |
| --- | --- |
| `src/navigation.ts` | Razčlenitev in serializacija filtrov/pogleda; ohranitev parametrov v navigaciji in zgodovini. |
| `src/taskView.ts` (nova) | Čista normalizacija Unicode, dobesedno iskanje po podnizu in stabilno razvrščanje. |
| `src/App.tsx` | Kontrole osnutka in potrjenega stanja, uporaba/ponastavitev, števec in prazno stanje; isti rezultati za oba pogleda. |
| `src/TaskBoard.tsx` | Ohranitev ID-jev kartic in stanja poti pri odpiranju opravila s table, če povezava v App ni dovolj. |
| `src/TaskDetails.tsx` | Vrnitev na isti filtrirani projekt in način ob zaprtju ali Escape. |
| `src/styles.css` | Slog kontrol v Folio in postavitev pri 390 px brez vodoravnega širjenja strani. |
| `tests/agent/P09.spec.ts` (nov) | Brskalniški scenariji za URL in zgodovino, osnutek/uporabo/ponastavitev, filtriranje/razvrščanje, navigacijo/podrobnosti, samo branje, prazne podatke, dostopnost in prilagodljivost. |

## Vrstni red izvedbe in preverjanja

1. Izdelati ter pregledati pripomočke za URL in filtriranje/razvrščanje po R01–R04: privzete in ponovljene parametre, kodiranje, Unicode, stabilne izenačitve ter odsotnost prepisa URL-ja ob razčlenitvi.
2. Povezati osnutek kontrol, izračun rezultatov, uporabo/ponastavitev, zgodovino, navigacijo projektov/pogledov/opravil ter prazno stanje in števec po R05–R11.
3. Ohraniti potrjeni dizajn Folio, obstoječe nalaganje, napake, neznano pot, podrobnosti in prilagodljivost; preveriti meje samo za branje po R12.
4. Dodati ciljno Playwright pokritost v `tests/agent/`; nadzorovane odzive uporabljati samo iz testne kode. Izvesti obstoječe preverjanje lint, gradnjo/preverjanje tipov, skupne in agentne brskalniške teste. Zapisati dejanske ukaze in izide v dokumentacijo funkcionalnosti; skupni testi in nastavitve ostanejo nespremenjeni.

## Omejitve in tveganja

URL je vir potrjenega stanja, zato mora vsak pripomoček za pot ohraniti ustrezne parametre, vsaka navigacija pa zavreči nepotrjen osnutek. Testni podatki naj zajamejo poljubne ID-je, enake naslove, Unicode in različen vrstni red API-ja, ne le začetnega števila opravil. Ohraniti je treba odobreni Folio ter meje `src/`, `tests/agent/` in `docs/agent/`.
